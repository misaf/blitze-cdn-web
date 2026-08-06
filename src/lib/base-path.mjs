/**
 * Path prefix the site is served under.
 *
 * Plain `.mjs`, not part of the `@/lib` alias world, because `next.config.mjs`
 * is loaded by Node before any bundler or path alias exists — and this value
 * has to be identical in the Next config and in `site.js`, so it lives in one
 * file both can read.
 *
 * Empty by default, which is what `next dev` and a custom domain both want.
 * Set BASE_PATH to `/<repo>` only when publishing to a GitHub Pages *project*
 * site, served from `https://<user>.github.io/<repo>` — Next uses it to rewrite
 * `next/link` hrefs and every `_next/` asset URL, and without it a project-site
 * deployment points all of them at the domain root and ships unstyled.
 */
export const basePath = process.env.BASE_PATH ?? ''
