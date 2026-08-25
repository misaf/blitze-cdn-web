import { getPageMap } from 'nextra/page-map'
import { absoluteUrl, contentLastModified } from '@/lib/site'

export const dynamic = 'force-static'

function collectRoutes(items) {
  return items.flatMap((item) => [
    ...(item.route ? [item.route] : []),
    ...(Array.isArray(item.children) ? collectRoutes(item.children) : []),
  ])
}

export default async function sitemap() {
  const contentRoutes = collectRoutes(await getPageMap())
  const routes = new Set(['/', '/about', '/contact', ...contentRoutes])

  /* `/print` is every docs page over again in one document. Listing it asks
     search engines to index a duplicate of the entire documentation, so it is
     dropped here and declares `robots: { index: false }` for itself. Nextra
     discovers App Router pages while building the page map, which is how it
     gets into `contentRoutes` in the first place. */
  routes.delete('/print')

  return [...routes].sort().map((route) => ({
    url: absoluteUrl(route),
    changeFrequency: route.startsWith('/blog') ? 'monthly' : 'weekly',
    lastModified: contentLastModified,
  }))
}
