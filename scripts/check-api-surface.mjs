/**
 * Fail the build when the reference pages and the control plane disagree.
 *
 * The reference is hand-written on purpose — see `extract-surface.py` — so the
 * risk it carries is silence: a route lands in `api.py`, nobody edits the MDX,
 * and CI stays green while the page quietly becomes a lie. This closes that
 * gap without generating anything. It compares *sets of names*: every route,
 * command, setting, and schema the implementation exposes must appear in the
 * reference, and every one the reference claims must exist.
 *
 * Prose, ordering, parameter tables, and examples remain entirely the author's.
 *
 * The control plane lives in a sibling checkout. Point `BLITZE_CP_PATH` at it
 * to override the default `../blitze-cdn-cp`, and `BLITZE_CP_PYTHON` at an
 * interpreter that can import `blitzecdn` if it is not the checkout's `.venv`.
 * When neither resolves the check skips loudly and succeeds, so a docs-only
 * contributor is never blocked by a repository they have not cloned; pass
 * `--strict`, as both CI pipelines do, to turn that skip into a failure.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

// Resolved from this file rather than the working directory, so the control
// plane's own CI can run the check from its checkout to catch the drift in the
// direction that matters most there: code changed, documentation did not.
const scripts = import.meta.dirname
const site = resolve(scripts, '..')

const strict = process.argv.includes('--strict')
const controlPlane = resolve(process.env.BLITZE_CP_PATH ?? '../blitze-cdn-cp')
const interpreter = process.env.BLITZE_CP_PYTHON
  ? resolve(process.env.BLITZE_CP_PYTHON)
  : resolve(controlPlane, '.venv/bin/python')

function skip(reason) {
  if (strict) {
    console.error(`API surface check failed: ${reason}`)
    process.exit(1)
  }
  console.warn(`API surface check skipped: ${reason}`)
  console.warn('Set BLITZE_CP_PATH to the control-plane checkout to run it.')
  process.exit(0)
}

if (!existsSync(controlPlane)) skip(`no control plane at ${controlPlane}`)
if (!existsSync(interpreter)) skip(`no interpreter at ${interpreter}`)

let surface
try {
  surface = JSON.parse(
    execFileSync(interpreter, [resolve(scripts, 'extract-surface.py')], {
      cwd: controlPlane,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    }),
  )
} catch (error) {
  skip(`the control plane could not be introspected: ${error.message}`)
}

const failures = []
let validatedExamples = 0
const page = (name) =>
  readFileSync(
    resolve(site, 'src/content/docs/reference', `${name}.mdx`),
    'utf8',
  )

/**
 * Compare what the implementation exposes against what a page documents.
 *
 * `tolerated` covers names a page may legitimately mention without owning —
 * command groups documented only through their children, for instance.
 */
function compare({ label, file, expected, documented, tolerated = [] }) {
  const known = new Set(documented)
  const allowed = new Set([...expected, ...tolerated])
  for (const name of expected) {
    if (!known.has(name)) {
      failures.push(
        `${file}: ${label} \`${name}\` exists but is not documented`,
      )
    }
  }
  for (const name of known) {
    if (!allowed.has(name)) {
      failures.push(
        `${file}: ${label} \`${name}\` is documented but not implemented`,
      )
    }
  }
}

// Routes are documented as `## `METHOD /path`` headings.
const apiPage = page('http-api')
const apiModelsPage = page('http-api-models')
compare({
  label: 'route',
  file: 'reference/http-api.mdx',
  expected: surface.routes.map((route) => `${route.method} ${route.path}`),
  documented: [...apiPage.matchAll(/^## `([A-Z]+ \/[^`]*)`/gm)].map(
    (match) => match[1],
  ),
})

// Schemas are documented as `### `Name`` headings under the models section.
compare({
  label: 'schema',
  file: 'reference/http-api-models.mdx',
  expected: surface.schemas,
  documented: [
    ...apiModelsPage.matchAll(/^### `([A-Za-z][A-Za-z0-9_]*)`/gm),
  ].map((match) => match[1]),
})

// The page is long enough that a schema name six hundred lines from its
// definition is useless unless it is a link. Every mention outside a heading or
// a code block must be one, so the rule does not decay as endpoints are added.
{
  let inFence = false
  apiPage.split('\n').forEach((line, index) => {
    if (line.startsWith('```')) inFence = !inFence
    if (inFence || line.startsWith('#')) return
    for (const match of line.matchAll(
      /(\[)?`([A-Za-z][A-Za-z0-9_]*)(\[\])?`/g,
    )) {
      if (!match[1] && surface.schemas.includes(match[2])) {
        failures.push(
          `reference/http-api.mdx:${index + 1}: schema \`${match[2]}\` is mentioned` +
            ` but not linked — write [\`${match[2]}\`](#${match[2].toLowerCase()})`,
        )
      }
    }
  })
}

// Commands are documented as `## `blitzecdn …`` or `### `blitzecdn …``.
compare({
  label: 'command',
  file: 'reference/cli.mdx',
  expected: surface.commands,
  documented: [...page('cli').matchAll(/^#{2,3} `(blitzecdn[^`]*)`/gm)].map(
    (match) => match[1],
  ),
  tolerated: surface.groups,
})

// A setting counts as documented under either spelling: the TOML key
// `[blitzecdn].key`, or the `BLITZE_*` variable that overrides it. Both are
// real to an operator, and the secrets — which have no valid TOML spelling —
// can only be documented as variables.
const configPage = page('configuration')
const documentedVariables = new Set(
  [...configPage.matchAll(/BLITZE_[A-Z0-9_]+/g)].map((match) => match[0]),
)
const documentedKeys = new Set(
  [...configPage.matchAll(/\[blitzecdn\]\.([a-z][a-z0-9_]*)/g)].map(
    (match) => match[1],
  ),
)
// Written out rather than run through `compare`, because the two spellings
// mean a setting has two ways of being present but only one of being absent.
const settings = new Set(surface.settings)
for (const key of surface.settings) {
  if (
    !documentedKeys.has(key) &&
    !documentedVariables.has(surface.settingVariables[key])
  ) {
    failures.push(
      `reference/configuration.mdx: setting \`${key}\` exists but is not documented`,
    )
  }
}
for (const key of documentedKeys) {
  if (!settings.has(key)) {
    failures.push(
      `reference/configuration.mdx: setting \`${key}\` is documented but not implemented`,
    )
  }
}

// Variables are matched anywhere on the page rather than in a table: several
// are read only at startup and are described in prose.
compare({
  label: 'environment variable',
  file: 'reference/configuration.mdx',
  expected: surface.environment,
  documented: [...documentedVariables],
})

// Examples tagged `{/* schema: Name */}` are parsed by the real model, so an
// example cannot drift into being uncopyable without failing here. A tag
// applies to the fence that follows it: the whole block for JSON, and the
// single-quoted `-d` payload for a curl invocation, which is the half of a
// shell example that can actually be wrong about the API.
{
  const tagged = [
    ...apiPage.matchAll(
      /\{\/\*\s*schema:\s*([A-Za-z][A-Za-z0-9_]*)\s*\*\/\}\s*\n+```(json|bash)\n([\s\S]*?)\n```/g,
    ),
  ]
  const examples = []
  for (const [whole, schema, language, block] of tagged) {
    const line = apiPage.slice(0, apiPage.indexOf(whole)).split('\n').length
    const location = `reference/http-api.mdx:${line}`
    let body = block
    if (language === 'bash') {
      const payload = block.match(/-d '([\s\S]*?)'/)
      if (!payload) {
        failures.push(`${location}: tagged shell example sends no -d payload`)
        continue
      }
      body = payload[1]
    }
    try {
      examples.push({ schema, payload: JSON.parse(body), location })
    } catch (error) {
      failures.push(`${location}: example is not valid JSON — ${error.message}`)
    }
  }
  if (examples.length) {
    const output = execFileSync(
      interpreter,
      [resolve(scripts, 'validate-examples.py')],
      {
        cwd: controlPlane,
        input: JSON.stringify(examples),
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'inherit'],
      },
    ).trim()
    if (output) failures.push(...output.split('\n'))
  }
  validatedExamples = examples.length
}

// Version strings the docs pin — the clone tag in the install runbook, the
// `--version` transcript — have to move when a release does. A blocklist of
// last release's number was the old guard; comparing against the release
// itself does not need updating to stay useful.
for (const file of walk(resolve(site, 'src/content/docs')).filter((path) =>
  path.endsWith('.mdx'),
)) {
  const content = readFileSync(file, 'utf8')
  const relativePath = relative(resolve(site, 'src/content'), file)
  const claims = [
    ...content.matchAll(/\bblitzecdn (\d+\.\d+\.\d+)\b/g),
    ...content.matchAll(/\bv(\d+\.\d+\.\d+)\b/g),
  ]
  for (const claim of claims) {
    if (claim[1] !== surface.version) {
      failures.push(
        `${relativePath}: names version ${claim[1]}, but the control plane is ${surface.version}`,
      )
    }
  }
}

if (failures.length) {
  console.error('API surface check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  console.error(
    `\nControl plane ${surface.version} at ${controlPlane}.` +
      ' Update the reference page, or the implementation, so the two agree.',
  )
  process.exit(1)
}

console.log(
  `API surface check passed against control plane ${surface.version}:`,
  `${surface.routes.length} routes, ${surface.schemas.length} schemas,`,
  `${surface.commands.length} commands, ${surface.settings.length} settings,`,
  `${validatedExamples} validated examples.`,
)
