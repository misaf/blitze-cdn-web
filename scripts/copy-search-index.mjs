/*
 * Put the freshly built Pagefind index inside the exported site.
 *
 * `postbuild` writes the index to `public/_pagefind`, which is what `next dev`
 * serves — the dev server has no `out/`, so the index has to live in `public/`
 * for search to work while writing. But `public/` is copied into `out/` during
 * the export, which happens in `next build`, BEFORE this index is generated.
 *
 * So on any build that starts from a clean tree the exported site ships with no
 * `out/_pagefind` at all, and the search box returns nothing for every query.
 * It only appears to work locally because a previous build left an index behind
 * in `public/` for the next export to pick up — one build stale, and absent
 * entirely on the first run. CI always starts clean, so CI always got the
 * broken case.
 *
 * Copying it across after the fact keeps `public/` as the dev source and makes
 * `npm run build` self-contained: the directory it produces is complete and
 * deployable on its own, which is what both `npm run preview` and the Pages
 * artifact assume.
 *
 * `.gitignore` covers `public/_pagefind` and `out/`, so neither copy is
 * committed and neither can drift in the repository.
 */
import { cpSync, existsSync } from 'node:fs'

const source = 'public/_pagefind'
const destination = 'out/_pagefind'

if (!existsSync(source)) {
  console.error(
    `Search index missing at ${source} — pagefind did not run or wrote elsewhere.`,
  )
  process.exit(1)
}

// `out/` is absent for a non-export build, in which case there is nothing to
// copy into and the dev-served index in `public/` is already the whole job.
if (!existsSync('out')) {
  console.log(
    'No out/ directory (non-export build); search index left in public/.',
  )
  process.exit(0)
}

cpSync(source, destination, { recursive: true })
console.log(`Copied search index to ${destination}`)
