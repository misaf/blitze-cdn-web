/*
 * Typeset the whole manual as a book.
 *
 * Input is `out/print.html` — the same static page a reader gets at `/print`,
 * produced by the ordinary `npm run build`. Output is `out/blitzecdn-manual.pdf`.
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT CHROME
 *
 * Chrome's print engine cannot do CSS Paged Media. No `@page` margin boxes, so
 * no folio and no running head; no `string-set` / `string()`, so nothing can
 * name the section a sheet belongs to; and no `target-counter()`, so a contents
 * list cannot state the page a section is on. Those three are most of what
 * separates a typeset book from a printed web page, and they are what
 * `scripts/book.css` is written in. Vivliostyle implements them.
 *
 * WHY THE SOURCE IS INLINED FIRST
 *
 * `out/print.html` references its stylesheet, its fonts and 41 scripts by
 * absolute URL (`/_next/static/…`), which resolve only against the site root.
 * Vivliostyle serves the document from a root of its own and does not reach
 * `_next` from there, so every one of those 404s — and it does not fail on
 * that. It renders the page with no stylesheet at all and reports success,
 * which is a silent way to produce 142 pages of Times New Roman. That was the
 * first thing this script got wrong.
 *
 * Rather than argue with the server, the book is built from a self-contained
 * copy: stylesheets inlined, fonts embedded as data URIs, scripts dropped
 * entirely. That removes the whole class of resolution bugs, makes the build
 * deterministic, and matches what the artifact actually is — a document, not
 * an application. The `/print` page is written to need no scripting for
 * exactly this reason (see the note on `OpenDetails` in
 * `src/app/print/page.jsx`).
 *
 * WHY IT IS NOT PART OF `npm run build`
 *
 * Same reason `test:e2e` is separate: it needs a browser Vivliostyle downloads
 * on demand, and the deployed site does not depend on the result. A missing
 * book must not be able to fail a deploy of the documentation itself.
 */
import { spawn } from 'node:child_process'
import {
  existsSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'

const OUT = resolve('out')
const SOURCE = resolve(OUT, 'print.html')
const BOOK_SOURCE = resolve(OUT, 'book.html')
const OUTPUT = resolve(OUT, 'blitzecdn-manual.pdf')
const STYLE = resolve('scripts/book.css')

if (!existsSync(SOURCE)) {
  console.error(
    `No ${SOURCE}. The book is typeset from the exported site, so run \`npm run build\` first.`,
  )
  process.exit(1)
}

/* An asset path as written in the export (`/_next/static/…`) read off disk. */
function readAsset(url) {
  return readFileSync(resolve(OUT, url.replace(/^\//, '')))
}

/*
 * Cascade layers, flattened.
 *
 * Tailwind v4 emits everything inside `@layer theme|base|components|utilities`
 * and Vivliostyle does not implement cascade layers — it drops the whole
 * at-rule, which silently discards the entire stylesheet and was the second
 * reason this build produced 142 pages of Times New Roman. The `@page` rules
 * from `book.css` applied throughout, which is what made the failure look like
 * a font problem rather than a missing stylesheet.
 *
 * Unwrapping is safe here because layer ORDER and source order agree: Tailwind
 * declares `theme, base, components, utilities` up front and then emits the
 * blocks in that same sequence, so flattening preserves the intended cascade.
 * That is a property of Tailwind's output, not a general truth about layers —
 * a stylesheet that declared its order differently from its source order would
 * need more than this.
 */
function flattenLayers(css) {
  /* `@layer a, b, c;` — an ordering declaration with no block of its own. */
  let result = css.replace(/@layer[^;{}]*;/g, '')

  for (;;) {
    const start = result.search(/@layer\s+[\w.\-\s,]*\{/)
    if (start === -1) return result

    const open = result.indexOf('{', start)
    let depth = 0
    let end = -1

    for (let i = open; i < result.length; i += 1) {
      if (result[i] === '{') depth += 1
      else if (result[i] === '}') {
        depth -= 1
        if (depth === 0) {
          end = i
          break
        }
      }
    }

    if (end === -1) {
      /* Unbalanced braces: leave the rest alone rather than corrupt it. */
      console.warn('  ! unbalanced @layer block; stopping the flatten early')
      return result
    }

    result =
      result.slice(0, start) +
      result.slice(open + 1, end) +
      result.slice(end + 1)
  }
}

/*
 * Fonts become data URIs. There are seven — three families at the weights
 * `layout.jsx` enumerates — and they are the whole reason the book is set in
 * Zilla Slab and IBM Plex Mono rather than in the formatter's default serif.
 */
function inlineFonts(css) {
  return css.replace(
    /url\((\/_next\/static\/media\/[^)]+)\)/g,
    (match, url) => {
      try {
        const base64 = readAsset(url).toString('base64')
        return `url(data:font/woff2;base64,${base64})`
      } catch {
        console.warn(`  ! could not inline ${url}; leaving the reference`)
        return match
      }
    },
  )
}

console.log('Assembling a self-contained book source…')

let html = readFileSync(SOURCE, 'utf8')

/* Stylesheets, in document order, replaced in place so the cascade is kept. */
let sheets = 0
html = html.replace(
  /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
  (match, href) => {
    if (!href.startsWith('/_next/')) return match
    sheets += 1
    const css = flattenLayers(readAsset(href).toString('utf8'))
    return `<style>${inlineFonts(css)}</style>`
  },
)

/* The book stylesheet last, so it wins on order against the site's own rules
   at equal specificity. This is the same file `--style` would pass; inlining
   it keeps the source to a single self-contained file. */
html = html.replace(
  '</head>',
  `<style>${readFileSync(STYLE, 'utf8')}</style></head>`,
)

/*
 * Scripts and their preloads go. Nothing in the book depends on them, they
 * cannot resolve from the formatter's root anyway, and each one is a failed
 * request the formatter waits on before it will paginate.
 */
const scriptsBefore = (html.match(/<script/g) ?? []).length
html = html
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<link[^>]*rel="preload"[^>]*>/g, '')

writeFileSync(BOOK_SOURCE, html)
console.log(
  `  inlined ${sheets} stylesheet(s), dropped ${scriptsBefore} script(s) → ${BOOK_SOURCE}`,
)

/*
 * Run from `out/`: Vivliostyle refuses an input or a stylesheet outside its
 * context directory, and the context directory is the working directory.
 */
const child = spawn(
  'npx',
  [
    'vivliostyle',
    'build',
    'book.html',
    '--output',
    OUTPUT,
    '--size',
    'A4',
    /* A single HTML document, not a collection; without this Vivliostyle
       looks for a publication manifest beside it. */
    '--single-doc',
    '--log-level',
    'info',
  ],
  { cwd: OUT, stdio: 'inherit' },
)

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(
      `\nVivliostyle exited with ${code}; no book was written.` +
        `\n${BOOK_SOURCE} is left in place — open it in a browser to see what` +
        ` the formatter was given.`,
    )
    process.exit(code ?? 1)
  }

  /* The intermediate has to live inside `out/` because that is the formatter's
     context directory, but `out/` is the deployed site — leaving it there
     publishes a second copy of the whole manual at `/book.html`. Kept only on
     failure, where it is the thing you need to look at. */
  rmSync(BOOK_SOURCE, { force: true })

  const megabytes = (statSync(OUTPUT).size / 1024 / 1024).toFixed(1)
  console.log(`\nTypeset ${OUTPUT} (${megabytes} MB).`)
})
