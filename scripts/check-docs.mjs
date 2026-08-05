import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'

const root = resolve('src/content')
const failures = []
const banned = [
  /generated reference/i,
  /reference (?:is|pages are) generated/i,
  /generated from (?:the )?(?:OpenAPI|Typer|source tree)/i,
  /npm run generate(?=$|[^:])/i,
  /v?0\.1\.0/i,
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

  // Reference pages carried `verifiedAgainst` and `lastVerified` frontmatter
  // while releases were pinned to a compatibility matrix. That ceremony was
  // dropped during heavy development: the interfaces move faster than the
  // labels could be kept honest, and a stale label is worse than none.
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

if (failures.length) {
  console.error('Documentation policy check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Documentation policy check passed.')
