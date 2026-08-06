import { absoluteUrl, siteUrl } from '@/lib/site'

export const dynamic = 'force-static'

const posts = [
  {
    slug: 'one-lock-two-halves',
    title: 'One lock, two halves',
    description:
      'Rollback is easy to get almost right. The hard part is deciding when canonical state is allowed to change.',
    date: '2026-06-23',
  },
  {
    slug: 'a-version-is-an-interface',
    title: 'A version is an interface',
    description:
      'The control plane and edge roles ship separately, so their desired-state document is a public contract.',
    date: '2026-05-19',
  },
]

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function GET() {
  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`)
      return `<item><title>${escapeXml(post.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(post.date).toUTCString()}</pubDate><description>${escapeXml(post.description)}</description></item>`
    })
    .join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>BlitzeCDN blog</title><link>${siteUrl}</link><description>Engineering notes from the BlitzeCDN maintainers.</description>${items}</channel></rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
