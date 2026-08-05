import { getPageMap } from 'nextra/page-map'
import { contentLastModified, siteUrl } from '@/lib/site'

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

  return [...routes].sort().map((route) => ({
    url: new URL(route, siteUrl).toString(),
    changeFrequency: route.startsWith('/blog') ? 'monthly' : 'weekly',
    lastModified: contentLastModified,
  }))
}
