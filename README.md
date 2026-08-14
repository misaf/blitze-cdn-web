# BlitzeCDN documentation site

A Nextra site: landing page at `/`, documentation under `/docs`. Builds to a
static export in `out/`. It ships nothing to edge servers, never runs on a
controller, and holds no credentials.

This file covers the site itself — how to run it, how it is laid out, and what
CI checks. To write or edit a page, read
[DOCUMENTATION.md](DOCUMENTATION.md) instead.

Documentation has two deliberate entry points:

- **Operate BlitzeCDN:** `/docs/operate` is the canonical standalone lifecycle
  overview and primary command path. It links to focused procedures for
  rollback, isolated restore, and detailed recovery.
- **Understand BlitzeCDN:** `/docs/understand` starts the conceptual path and
  drills through subsystem explanations into exact technical reference.

## Setup

Node 20.9+ is required; CI builds on Node 24.

```bash
npm ci
npm run dev          # http://localhost:3000
npm run build        # static export to out/
npm run preview      # serve the built out/ on :4173
npm run check        # lint, formatting, docs checks, build, and internal links
npm run test:e2e     # browser and accessibility checks against out/
npm run format       # write Prettier formatting
```

`npm run check` is the pre-push gate: it runs `lint`, `format:check`,
`check:docs`, `check:surface`, `build`, and `check:links` in that order.
`check:surface` needs the control plane checked out beside this repository and
skips with a warning otherwise — see [Documentation
checks](#documentation-checks). The e2e suite runs
separately because it needs a browser (`npx playwright install --with-deps
chromium`). It starts its own server on `127.0.0.1:4173` against `out/`, so
build first. To run a single spec or test:

```bash
npx playwright test tests/e2e/site.spec.js
npx playwright test -g "some test name"
```

Set `NEXT_PUBLIC_SITE_URL` to the deployed origin when building for production.
It is used for canonical, Open Graph, robots and sitemap URLs. Until hosting is
configured it defaults to the repository's conventional GitHub Pages URL.

## Layout

| Path                           | Contents                                                              |
| ------------------------------ | --------------------------------------------------------------------- |
| `src/app/page.jsx`             | Landing page — hand-written, safe to restyle                          |
| `src/app/globals.css`          | Tailwind entry point and site theme                                   |
| `src/app/layout.jsx`           | Shared shell: navbar, footer, theme                                   |
| `src/content/docs/index.mdx`   | Intent-first documentation landing page                               |
| `src/content/docs/operate/`    | Canonical lifecycle runbook and focused operational procedures        |
| `src/content/docs/understand/` | Architecture and subsystem explanations                               |
| `src/content/docs/reference/`  | Maintained CLI, API, configuration, data-model, and Ansible reference |
| `src/app/about/page.jsx`       | About us — hand-designed, not MDX                                     |
| `src/app/contact/page.jsx`     | Contact us — hand-designed, not MDX                                   |
| `src/content/faq.mdx`          | FAQ                                                                   |
| `src/content/blog/`            | Blog: `index.mdx` lists the posts beside it                           |
| `DOCUMENTATION.md`             | How to write a page: placement, structure, voice, callouts            |

## Sections and routing

There is no `contentDirBasePath`, so the content tree maps to URLs directly:

| Path on disk               | URL        |
| -------------------------- | ---------- |
| `src/app/page.jsx`         | `/`        |
| `src/content/docs/**`      | `/docs/**` |
| `src/content/faq.mdx`      | `/faq`     |
| `src/content/blog/**`      | `/blog/**` |
| `src/app/about/page.jsx`   | `/about`   |
| `src/app/contact/page.jsx` | `/contact` |

Two consequences worth knowing:

- The catch-all route is `src/app/[...mdxPath]` (**required**, not optional).
  The optional `[[...mdxPath]]` form would also match `/` and collide with the
  hand-written landing page.
- `src/content/_meta.js` marks `docs`, `faq` and `blog` as `type: 'page'`, which
  is what lifts them into the navbar instead of listing them in the docs
  sidebar.

### Designed pages vs docs pages

`/`, `/about` and `/contact` are hand-designed App Router routes. They bypass
the Nextra docs layout entirely — no sidebar, no table of contents — and share
their look through `src/components/ui.jsx`. Everything else is MDX under
`src/content/` and gets the docs chrome.

Two things a designed page must do:

- Wrap itself in `.canvas`, which opts into the scoped mini-preflight (see
  Styling below). Without it, padding utilities overflow their boxes.
- Carry `data-pagefind-body`, or it drops out of the search index. Nextra adds
  that marker to MDX pages automatically; a hand-built route has to say so.

### Adding a blog post

Add an `.mdx` file to `src/content/blog/` with `title`, `description`, `date`
and `author` frontmatter, then add it to `src/content/blog/_meta.js` for the
sidebar. The index page at `/blog` derives its listing from the page map and
sorts by `date` descending, so it picks the post up on its own.

## Styling

Tailwind v4 is configured in `src/app/globals.css` and loaded from the root
layout, so the landing page, FAQ and blog can all use it. Three things there are
deliberate:

- **Tailwind is imported without preflight.** `nextra-theme-docs` ships a
  precompiled build carrying no preflight of its own, so every docs page relies
  on browser defaults. A global reset would restyle all of them. The landing
  designed pages opt into a mini-preflight scoped to `.canvas` instead.
- **Sources are declared explicitly.** Granular `@import`s disable Tailwind's
  automatic source detection, so the `@source` line is what makes class
  scanning work. Remove it and every utility silently vanishes from the build.
- **The dark variant is bound to the `.dark` class**, because Nextra switches
  themes with next-themes rather than `prefers-color-scheme`.

Nextra's own utilities are compiled under an `x:` prefix and its theme values
are inlined, so nothing here collides with them.

## Documentation checks

What to write and where it goes is [DOCUMENTATION.md](DOCUMENTATION.md). This
section is the machinery that checks it.

`check:docs` enforces frontmatter and the sidebar: it rejects a page missing
`title` or `description`, a page orphaned from its directory's `_meta.js`, and a
sidebar entry pointing at content that does not exist. It also resolves the
links in this file and `DOCUMENTATION.md` — both the file paths that reach into
`src/content/` and the headings the two cross-link to — because `check:links`
only walks the built site and never sees either of them.

`check:surface` compares the reference pages against the control plane itself,
because prose is hand-written and coverage cannot be left to memory. It fails on:

- a route, schema, CLI command, setting, or environment variable that exists but
  has no entry on its reference page — or an entry with nothing behind it;
- a schema mentioned on the API page without a link to its definition;
- a JSON example, or the `-d` payload of a tagged `curl` example, that the real
  model refuses to parse — see [tagging an example for
  validation](DOCUMENTATION.md#examples-and-verification);
- a version or desired-state schema number the docs pin that no longer matches
  the release.

It reads the control plane from `../blitze-cdn-cp`, overridable with
`BLITZE_CP_PATH` (and `BLITZE_CP_PYTHON` for an interpreter outside that
checkout's `.venv`). Without it the check skips with a warning rather than
failing, so a docs-only change does not require cloning the control plane.

Both pipelines check it out and pass `--strict`, so the skip never fires in CI,
and they cover the two ways the pages and the software can part company:

| Pipeline                                                    | Catches                                            |
| ----------------------------------------------------------- | -------------------------------------------------- |
| This repository's `build` job                               | A documentation change that misstates the API      |
| The control plane's `documentation` job (`just docs-check`) | A code change that leaves the documentation behind |

Each pipeline pins the other to its **release** branch — this repository checks
out the control plane at `2.x`, and the control plane checks out this site at
`1.x` — so the pages describe the released control plane and a merge ahead of a
release does not fail a build for describing software nobody is running yet.

## Search and deployment

Search is Pagefind. The `postbuild` script indexes the build into `public/` and
`scripts/copy-search-index.mjs` copies it into `out/`, because the static
export has already happened by then. A build that skipped either step would
ship a search box that silently returns nothing, so CI fails when
`out/_pagefind/pagefind.js` is missing.

Pull requests and every other branch stop at the build job. Only a push to
`1.x` publishes the export to GitHub Pages. Release tags are `vX.Y.Z` and CI
rejects a tag that does not equal the `version` in `package.json`.

## Nextra versioning

Keep `nextra` and `nextra-theme-docs` on the same release because the theme
declares an exact peer dependency on the core package. After either dependency
changes, run `npm run build` and confirm every static page and the Pagefind index
generate successfully.
