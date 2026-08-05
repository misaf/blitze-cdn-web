# BlitzeCDN documentation site

A Nextra site: landing page at `/`, documentation under `/docs`. Builds to a
static export in `out/`. It ships nothing to edge servers, never runs on a
controller, and holds no credentials.

## Setup

```bash
npm ci
npm run dev        # http://localhost:3000
npm run build      # static export to out/
npm run check      # lint, formatting, build, and internal links
npm run test:e2e   # browser and accessibility checks against out/
```

Set `NEXT_PUBLIC_SITE_URL` to the deployed origin when building for production.
It is used for canonical, Open Graph, robots and sitemap URLs. Until hosting is
configured it defaults to the repository's conventional GitHub Pages URL.

## Layout

| Path                               | Contents                                                                                                                                                    |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/page.jsx`                 | Landing page — hand-written, safe to restyle                                                                                                                |
| `src/app/globals.css`              | Tailwind entry point and site theme                                                                                                                         |
| `src/app/layout.jsx`               | Shared shell: navbar, footer, theme                                                                                                                         |
| `src/content/docs/*.mdx`           | Hand-written prose (index, architecture, glossary)                                                                                                          |
| `src/content/docs/guides/*.mdx`    | Hand-written operator guides (quickstart, sites, deployment, certificates, API, security, API key rotation, backup, incidents, production, troubleshooting) |
| `src/content/docs/reference/*.mdx` | Maintained CLI, domains, API, configuration, and role reference                                                                                             |
| `src/app/about/page.jsx`           | About us — hand-designed, not MDX                                                                                                                           |
| `src/app/contact/page.jsx`         | Contact us — hand-designed, not MDX                                                                                                                         |
| `src/components/ui.jsx`            | Shared design recipes for the designed pages                                                                                                                |
| `src/content/faq.mdx`              | FAQ                                                                                                                                                         |
| `src/content/blog/`                | Blog: `index.mdx` lists the posts beside it                                                                                                                 |
| `src/components/post-list.jsx`     | Builds the blog index from the page map                                                                                                                     |
| `postcss.config.mjs`               | Loads `@tailwindcss/postcss`                                                                                                                                |
| `DOCUMENTATION.md`                 | Voice, page structure, callouts, and verification rules                                                                                                     |

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

## Reference documentation

The pages under `src/content/docs/reference/` are ordinary MDX and are reviewed
like the guides. When the control plane or edge collection changes, update the
affected reference page in the same pull request and verify its examples against
the released interface.

## Nextra versioning

Keep `nextra` and `nextra-theme-docs` on the same release because the theme
declares an exact peer dependency on the core package. After either dependency
changes, run `npm run build` and confirm every static page and the Pagefind index
generate successfully.
