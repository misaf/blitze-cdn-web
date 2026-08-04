# BlitzeCDN documentation site

A Nextra site: landing page at `/`, documentation under `/docs`. Builds to a
static export in `out/`. It is not part of the deployed artifact — see
[SECURITY.md](../SECURITY.md).

```bash
npm ci
npm run generate   # refresh generated reference pages
npm run dev        # http://localhost:3000
npm run build      # static export to out/
```

## Layout

| Path | Contents |
| --- | --- |
| `src/app/page.jsx` | Landing page — hand-written, safe to restyle |
| `src/app/layout.jsx` | Shared shell: navbar, footer, theme |
| `src/content/*.mdx` | Hand-written prose (architecture, operations) |
| `src/content/reference/*.mdx` | **Generated — do not edit** |
| `scripts/generate_reference.py` | The generators |

## Generated reference

`scripts/generate_reference.py` writes `src/content/reference/` from four
machine-readable sources, so the reference cannot drift from the code:

| Page | Source |
| --- | --- |
| `cli.mdx` | The Typer command tree in `src/blitzecdn/cli.py` |
| `api.mdx` | The OpenAPI schema from `create_app()` |
| `configuration.mdx` | An AST walk of `Settings.from_environment` |
| `roles.mdx` | Each role's `meta/argument_specs.yml` and `defaults/main.yml` |

Output is committed. CI runs `generate_reference.py --check` and fails when it
is stale, so regenerate and commit after changing a route, flag, setting, or
role variable.

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
