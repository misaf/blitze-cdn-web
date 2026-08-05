import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'

const outputDirectory = resolve(process.argv[2] ?? 'out')

if (!existsSync(outputDirectory)) {
  console.error(`Static output not found: ${outputDirectory}`)
  process.exit(1)
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

function targetForPath(pathname) {
  if (pathname === '/') {
    return { exists: true, html: join(outputDirectory, 'index.html') }
  }
  const clean = decodeURIComponent(pathname)
    .replace(/^\//, '')
    .replace(/\/$/, '')
  const asset = join(outputDirectory, clean)
  const html = join(outputDirectory, `${clean}.html`)

  if (existsSync(asset) && extname(asset)) return { exists: true, html: null }
  if (existsSync(html)) return { exists: true, html }
  // Nextra section toggles link to their directory even when the section has
  // no index page. The directory still needs to contain exported children.
  if (existsSync(asset)) return { exists: true, html: null }
  return { exists: false, html: null }
}

const failures = []
const htmlFiles = walk(outputDirectory).filter(
  (file) => extname(file) === '.html',
)

for (const sourceFile of htmlFiles) {
  const html = readFileSync(sourceFile, 'utf8')
  const links = [...html.matchAll(/\bhref=["']([^"']+)["']/gi)].map(
    (match) => match[1],
  )

  for (const rawLink of links) {
    if (
      !rawLink.startsWith('/') ||
      rawLink.startsWith('//') ||
      rawLink.startsWith('/_next/') ||
      rawLink.startsWith('/_pagefind/')
    ) {
      continue
    }

    const url = new URL(
      rawLink.replaceAll('&amp;', '&'),
      'https://local.invalid',
    )
    const target = targetForPath(url.pathname)

    if (!target.exists) {
      failures.push(
        `${relative(outputDirectory, sourceFile)}: ${rawLink} has no exported page`,
      )
      continue
    }

    if (url.hash && target.html) {
      const targetHtml = readFileSync(target.html, 'utf8')
      const id = decodeURIComponent(url.hash.slice(1))
      const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      if (!new RegExp(`\\bid=["']${escaped}["']`).test(targetHtml)) {
        failures.push(
          `${relative(outputDirectory, sourceFile)}: ${rawLink} has no matching id`,
        )
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`Found ${failures.length} broken internal link(s):`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Checked internal links in ${htmlFiles.length} exported pages.`)
