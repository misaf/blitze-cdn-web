# BlitzeCDN documentation site

A Nextra site: landing page at `/`, documentation under `/docs`. Builds to a
static export in `out/`. It ships nothing to edge servers, never runs on a
controller, and holds no credentials.

## Setup

This site documents two other repositories, both pinned:

| Source | Pin | Provides |
| --- | --- | --- |
| [blitze-cdn-cp](https://github.com/misaf/blitze-cdn-cp) | `requirements.txt` | CLI, HTTP API, configuration |
| [blitze-cdn-edge](https://github.com/misaf/blitze-cdn-edge) | `requirements.yml` | Ansible role variables |

```bash
python3 -m venv .venv
npm run sources    # install both pinned sources
npm ci
npm run generate   # refresh generated reference pages
npm run dev        # http://localhost:3000
npm run build      # static export to out/
```

Keep the two pins in step with each other, and with the edge version pinned in
the control plane's `ansible/requirements.yml`. Otherwise the role reference
describes roles the documented control plane does not actually deploy. The
generated role page records the exact collection version it came from.

`npm run generate` and `generate:check` enforce this rather than trusting it.
Before generating anything they assert that the installed edge collection, the
version `requirements.yml` asks for, and the version the control plane pinned
in `requirements.txt` actually deploys (`blitzecdn.EDGE_COLLECTION_VERSION`)
are all the same. Moving one pin without the others fails in CI.

To preview unreleased role changes without publishing, point
`BLITZECDN_EDGE_COLLECTION` at a checkout — a sibling `../blitze-cdn-edge` is
picked up automatically — and pass `--allow-unreleased`. A source checkout
carries no `MANIFEST.json` and so no version, so this is refused by default:
without the flag it would quietly produce committable pages that name no edge
version at all. Output generated this way is for local preview only.

## Layout

| Path | Contents |
| --- | --- |
| `src/app/page.jsx` | Landing page — hand-written, safe to restyle |
| `src/app/globals.css` | Tailwind entry point and site theme |
| `src/app/layout.jsx` | Shared shell: navbar, footer, theme |
| `src/content/docs/*.mdx` | Hand-written prose (architecture, operations) |
| `src/content/docs/reference/*.mdx` | **Generated — do not edit** |
| `src/app/about/page.jsx` | About us — hand-designed, not MDX |
| `src/app/contact/page.jsx` | Contact us — hand-designed, not MDX |
| `src/components/ui.jsx` | Shared design recipes for the designed pages |
| `src/content/faq.mdx` | FAQ |
| `src/content/blog/` | Blog: `index.mdx` lists the posts beside it |
| `src/components/post-list.jsx` | Builds the blog index from the page map |
| `postcss.config.mjs` | Loads `@tailwindcss/postcss` |
| `scripts/generate_reference.py` | The generators |

## Sections and routing

There is no `contentDirBasePath`, so the content tree maps to URLs directly:

| Path on disk | URL |
| --- | --- |
| `src/app/page.jsx` | `/` |
| `src/content/docs/**` | `/docs/**` |
| `src/content/faq.mdx` | `/faq` |
| `src/content/blog/**` | `/blog/**` |
| `src/app/about/page.jsx` | `/about` |
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

## Generated reference

`scripts/generate_reference.py` writes `src/content/docs/reference/` from four
machine-readable sources, so the reference cannot drift from what it documents:

| Page | Source |
| --- | --- |
| `cli.mdx` | The Typer command tree of the installed `blitzecdn` |
| `api.mdx` | The OpenAPI schema from `create_app()` |
| `configuration.mdx` | An AST walk of `Settings.from_environment` |
| `roles.mdx` | Each role's `meta/argument_specs.yml` and `defaults/main.yml` in the installed collection |

Output is committed. CI runs `generate_reference.py --check` and fails when it
is stale, so regenerate and commit after bumping either pin.

Free prose taken from those sources is escaped before it reaches MDX: `{...}`
is a JavaScript expression in MDX, so a docstring mentioning
`/v1/deployments/{id}` would otherwise fail the build with `id is not defined`.

## Why nextra is pinned to 4.5.1

`nextra-theme-docs@4.6.1` cannot prerender any page. Its `Layout` destructures
`children` out of its props (`{ children, ...themeConfig }`) and then validates
the remainder against a `z.strictObject` that still requires `children`, so the
key is always absent and every render throws `Invalid input → at children`.
This is independent of anything in this repository — a minimal layout with no
custom props reproduces it.

Before unpinning, run `npm run build` and confirm all pages generate. If it is
fixed upstream, move both `nextra` and `nextra-theme-docs` together; they must
stay on the same version.
