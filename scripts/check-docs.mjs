import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'

const root = resolve('src/content')
const failures = []
const banned = [
  /generated reference/i,
  /reference (?:is|pages are) generated/i,
  /generated from (?:the )?(?:OpenAPI|Typer|source tree)/i,
  /npm run generate(?=$|[^:])/i,
  // Version numbers used to be policed by blocklisting the last release here,
  // which needed editing every release to keep meaning anything. The version
  // strings the docs pin are now compared against the control plane itself,
  // in `check-api-surface.mjs`.
]
const placeholderAssignments = [
  /=\s*['"]FOUNDER_NAME['"]/,
  /=\s*['"]SECURITY_CONTACT['"]/,
  /=\s*['"]CONTACT_EMAIL['"]/,
  /TODO before publishing/i,
]
const malformedMarkdown = [/\|\|\|/]

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

for (const file of walk(root).filter((path) => extname(path) === '.mdx')) {
  const content = readFileSync(file, 'utf8')
  const relativeFile = relative(root, file)
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)
  if (!frontmatter) {
    failures.push(`${relative(root, file)} has no frontmatter`)
  } else {
    const metadata = Object.fromEntries(
      frontmatter[1]
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const separator = line.indexOf(':')
          return separator < 1
            ? [line, '']
            : [
                line.slice(0, separator).trim(),
                line.slice(separator + 1).trim(),
              ]
        }),
    )
    for (const required of ['title', 'description']) {
      if (!metadata[required]) {
        failures.push(`${relative(root, file)} is missing ${required} metadata`)
      }
    }
    const isBlogPost =
      relative(root, file).startsWith(`blog/`) &&
      relative(root, file) !== 'blog/index.mdx'
    if (isBlogPost) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.date ?? '')) {
        failures.push(`${relative(root, file)} has an invalid or missing date`)
      }
      if (!metadata.author) {
        failures.push(`${relative(root, file)} is missing author metadata`)
      }
    }
  }
  for (const pattern of banned) {
    if (pattern.test(content)) {
      failures.push(`${relative(root, file)} contains stale phrase ${pattern}`)
    }
  }
  for (const pattern of malformedMarkdown) {
    if (pattern.test(content)) {
      failures.push(
        `${relative(root, file)} contains a malformed Markdown table`,
      )
    }
  }

  if (relativeFile.startsWith('docs/')) {
    const title = frontmatter?.[1]
      .split('\n')
      .find((line) => line.startsWith('title: '))
      ?.slice('title: '.length)
    const h1 = content.match(/^# (.+)$/m)?.[1]
    if (title && h1 && title !== h1) {
      failures.push(
        `${relativeFile} uses title \`${title}\` but its H1 is \`${h1}\``,
      )
    }
  }

  if (
    relativeFile.startsWith('docs/understand/') &&
    /^## (Before you begin|Steps|Verify|Recover|Roll back)(?:\s|$)/m.test(
      content,
    )
  ) {
    failures.push(
      `${relativeFile} contains a procedural heading inside understand/`,
    )
  }

  if (
    relativeFile.startsWith('docs/reference/') &&
    /^## (Before you begin|Steps|Verify|Recover|Roll back)(?:\s|$)/m.test(
      content,
    )
  ) {
    failures.push(
      `${relativeFile} contains a procedural heading inside reference/`,
    )
  }

  // Reference pages carried `verifiedAgainst` and `lastVerified` frontmatter
  // while releases were pinned to a compatibility matrix. That ceremony was
  // dropped during heavy development: the interfaces move faster than the
  // labels could be kept honest, and a stale label is worse than none.
}

// The sidebar is the documentation architecture. Every page and non-empty
// section must be listed exactly once in its directory's _meta.js, and every
// navigation entry must resolve to content. This catches both orphan pages and
// stale sidebar links before a build makes either harder to diagnose.
const docsRoot = resolve('src/content/docs')

function containsMdx(directory) {
  return readdirSync(directory, { withFileTypes: true }).some((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? containsMdx(path) : entry.name.endsWith('.mdx')
  })
}

async function checkNavigation(directory) {
  const entries = readdirSync(directory, { withFileTypes: true })
  const contentKeys = new Set(
    entries.flatMap((entry) => {
      if (entry.isFile() && entry.name.endsWith('.mdx')) {
        return [entry.name.slice(0, -4)]
      }
      if (entry.isDirectory() && containsMdx(join(directory, entry.name))) {
        return [entry.name]
      }
      return []
    }),
  )
  const metaPath = join(directory, '_meta.js')
  let navigation = {}
  try {
    const moduleSource = readFileSync(metaPath, 'utf8')
    navigation = (
      await import(`data:text/javascript,${encodeURIComponent(moduleSource)}`)
    ).default
  } catch (error) {
    failures.push(
      `${relative(docsRoot, directory) || '.'} has no readable _meta.js: ${error.message}`,
    )
    return
  }
  const navigationKeys = new Set(Object.keys(navigation))
  for (const key of contentKeys) {
    if (!navigationKeys.has(key)) {
      failures.push(
        `${relative(docsRoot, join(directory, key))} is orphaned from _meta.js`,
      )
    }
  }
  for (const key of navigationKeys) {
    if (!contentKeys.has(key)) {
      failures.push(
        `${relative(docsRoot, metaPath)} lists missing content ${key}`,
      )
    }
  }
  for (const entry of entries.filter(
    (item) => item.isDirectory() && containsMdx(join(directory, item.name)),
  )) {
    await checkNavigation(join(directory, entry.name))
  }
}

await checkNavigation(docsRoot)

// `check:links` walks the built site, so it never sees the two Markdown files
// at the repository root — and those are exactly the ones that point *into* the
// content tree by file path, which no build step would notice going stale. They
// also cross-link to each other, so a renamed heading in one silently breaks an
// anchor in the other.
const rootDocuments = ['README.md', 'DOCUMENTATION.md']

// GitHub's own slugging, which is what these links are read through: lowercase,
// punctuation dropped, spaces hyphenated.
const slug = (heading) =>
  heading
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

const headingsOf = (content) =>
  new Set(
    [...content.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)].map((match) =>
      slug(match[1]),
    ),
  )

for (const document of rootDocuments) {
  const path = resolve(document)
  let content
  try {
    content = readFileSync(path, 'utf8')
  } catch {
    failures.push(`${document} is missing`)
    continue
  }
  for (const match of content.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const target = match[1]
    if (/^(https?:|mailto:)/.test(target)) continue

    const [location, anchor] = target.split('#')
    const targetPath = location ? resolve(location) : path
    if (location && !existsSync(targetPath)) {
      failures.push(`${document} links to ${location}, which does not exist`)
      continue
    }
    if (!anchor) continue

    // Only Markdown carries headings this can resolve; a fragment on anything
    // else is not something to guess about.
    if (extname(targetPath) !== '.md' && extname(targetPath) !== '.mdx') {
      continue
    }
    const targetContent =
      targetPath === path ? content : readFileSync(targetPath, 'utf8')
    if (!headingsOf(targetContent).has(anchor)) {
      failures.push(`${document} links to ${target}, which has no such heading`)
    }
  }
}

for (const file of walk(resolve('src')).filter((path) =>
  ['.js', '.jsx', '.md', '.mdx'].includes(extname(path)),
)) {
  const content = readFileSync(file, 'utf8')
  if (['.js', '.jsx'].includes(extname(file))) {
    for (const pattern of banned) {
      if (pattern.test(content)) {
        failures.push(
          `${relative(resolve('src'), file)} contains stale phrase ${pattern}`,
        )
      }
    }
  }
  for (const pattern of placeholderAssignments) {
    if (pattern.test(content)) {
      failures.push(
        `${relative(resolve('src'), file)} contains a publishing placeholder`,
      )
    }
  }
}

for (const workflow of walk(resolve('.github/workflows'))) {
  const content = readFileSync(workflow, 'utf8')
  for (const match of content.matchAll(/uses:\s*([^\s#]+)/g)) {
    if (!/^[^@]+@[0-9a-f]{40}$/.test(match[1])) {
      failures.push(
        `${relative(resolve('.'), workflow)} uses a movable action reference ${match[1]}`,
      )
    }
  }
}

if (failures.length) {
  console.error('Documentation policy check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Documentation policy check passed.')
