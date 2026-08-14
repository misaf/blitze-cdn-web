export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://misaf.github.io/blitze-cdn-web'

export const contentLastModified = new Date('2026-08-14T00:00:00Z')

/**
 * An absolute URL for a site-root-relative route.
 *
 * This exists because `new URL(route, siteUrl)` is wrong here, and quietly so.
 * A route always starts with `/`, which makes it an absolute path, and an
 * absolute path REPLACES the base's path rather than extending it — so with
 * `siteUrl` pointing at a GitHub Pages project site the whole `/blitze-cdn-web`
 * segment is dropped and `/docs` resolves to `https://misaf.github.io/docs`.
 * That is a different site: the user's Pages root, not this project. The bug is
 * invisible whenever the site is served from the root of its own domain, which
 * is why it survived until there was a project-site deployment to break.
 *
 * Joining the strings keeps the prefix. `siteUrl` carries no trailing slash and
 * a route always leads with one; the collapse guards the case where either
 * supplies both, since `//` inside a path is not the same URL. The lookbehind
 * spares the `//` in the scheme.
 */
export function absoluteUrl(route) {
  return `${siteUrl}${route}`.replace(/(?<!:)\/{2,}/g, '/')
}
