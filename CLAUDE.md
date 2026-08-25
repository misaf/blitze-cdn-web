# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read first

- `README.md` — how the site is laid out, routed, styled, and checked.
- `DOCUMENTATION.md` — how to write or edit a page: placement, structure, voice, callouts, example tagging.

This is a documentation site for BlitzeCDN, not the product. Most work here is content under `src/content/`, not code.

## Next.js version

`next` is on a release newer than the model's training data, and its App Router
API has moved. Read `node_modules/next/dist/docs/` before writing or changing
anything that touches Next.js APIs rather than recalling them. (`agentRules` is
disabled in `next.config.mjs` so `next dev` does not regenerate this warning as
an uncommitted file on every run.)

## Verification gate

```bash
npm run check      # lint, format:check, check:docs, check:surface, build, check:links
npm run test:e2e   # needs a build first; serves out/ on 127.0.0.1:4173
```

Run both before finishing a change. `test:e2e` is separate because it needs a
browser (`npx playwright install --with-deps chromium`).

`npm run build:book` is separate for the same reason and is **not** part of
`npm run check`. It typesets `out/print.html` into `out/blitzecdn-manual.pdf`
with Vivliostyle, which downloads its own browser on first run. Nothing the site
serves depends on the result, so a missing book cannot fail a deploy — but the
PDF is therefore not published unless CI is taught to build it.

`check:surface` compares the reference pages against the real control plane at
`../blitze-cdn-cp` (override with `BLITZE_CP_PATH`, and `BLITZE_CP_PYTHON` for an
interpreter outside that checkout's `.venv`). Without the checkout it **skips
with a warning instead of failing** — a local `npm run check` that passes has not
necessarily verified the reference. CI passes `--strict`, so the skip never fires
there.

## Repository conventions

- The release branch is `1.x`, not `master`. Only a push to `1.x` deploys.
  Release tags are `vX.Y.Z` and CI rejects a tag that does not equal `version` in
  `package.json`.
- This repository pins the control plane at `2.x` and the control plane pins this
  site at `1.x`. Keep it that way: the pages describe the _released_ control
  plane, and pinning default branches would fail builds for documenting unreleased
  software.
- Keep `nextra` and `nextra-theme-docs` on the same release — the theme declares
  an exact peer dependency on the core package.
- When a public interface or lifecycle effect changes, update the affected
  reference page **and** the canonical runbook procedure in `/docs/operate` in the
  same change. `check:surface` catches added or removed names; it cannot tell you
  a description went stale.

## Traps

- **A hand-designed page (`src/app/**`, not MDX) must wrap itself in `.canvas`
  and carry `data-pagefind-body`.** Tailwind is imported without preflight, so
  without `.canvas` padding utilities overflow their boxes; without the Pagefind
  marker the page silently drops out of search. Nextra adds both for MDX pages.
- **Do not remove the `@source` line in `src/app/globals.css`.** Granular
  `@import`s disable Tailwind's automatic source detection; that line is what
  makes class scanning work, and deleting it makes every utility vanish from the
  build with no error.
- **The catch-all route must stay `src/app/[...mdxPath]` (required form).** The
  optional `[[...mdxPath]]` also matches `/` and collides with the hand-written
  landing page.
- The dark variant is bound to the `.dark` class, not `prefers-color-scheme`,
  because Nextra switches themes via next-themes.
- Pagefind indexes into `public/` during `postbuild`, _after_ the static export
  has already copied `public/`; `scripts/copy-search-index.mjs` is what gets the
  index into `out/`. CI fails if `out/_pagefind/pagefind.js` is missing.
- **`/print` is the one hand-designed page that must NOT carry
  `data-pagefind-body`**, and it carries `data-pagefind-ignore` instead. It is a
  second copy of all 34 docs pages; indexing it would return it alongside every
  real result with the wrong link. It is dropped from `sitemap.js` and declares
  `robots: { index: false }` for the same reason.
- **`/print` must stay renderable with no JavaScript.** It is the source
  `build:book` typesets, and a paged-media formatter runs no scripts — so its
  collapsible sections override Nextra's `Details` with a plain always-open
  `<details>`. Anything added there that needs hydration to become visible is
  simply missing from the book, silently.
- **Vivliostyle implements neither cascade layers nor CSS nesting**, both of
  which Tailwind v4 emits. `build-book.mjs` flattens `@layer` before typesetting
  — without it the whole stylesheet is dropped and the book renders in Times New
  Roman while still reporting success. Nesting is not flattened, so a few theme
  utilities (paragraph spacing among them) are restated in `scripts/book.css`
  with `!important`. Verify book changes by rebuilding and looking at the PDF;
  a rule that silently does nothing looks identical to one that was never added.
