import Link from 'next/link'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { siteUrl } from '@/lib/site'
import ThemeToggle from '@/components/theme-toggle'
import 'nextra-theme-docs/style.css'
import './globals.css'

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BlitzeCDN',
    template: '%s – BlitzeCDN',
  },
  description:
    'A security-focused control plane for converging Nginx CDN edge servers.',
  applicationName: 'BlitzeCDN',
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': '/feed.xml' },
  },
  openGraph: {
    type: 'website',
    siteName: 'BlitzeCDN',
    title: 'BlitzeCDN – edge control plane',
    description:
      'A security-focused control plane for converging Nginx CDN edge servers.',
    url: '/',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlitzeCDN – edge control plane',
    description:
      'A security-focused control plane for converging Nginx CDN edge servers.',
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
}

export default async function RootLayout({ children }) {
  const navbar = (
    <Navbar
      logo={
        <span>
          <b>BlitzeCDN</b>{' '}
          <span style={{ opacity: '60%' }}>edge control plane</span>
        </span>
      }
      projectLink="https://github.com/misaf/blitze-cdn-web"
    >
      <ThemeToggle />
    </Navbar>
  )

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="⚡" />
      <body>
        <Layout
          copyPageButton={false}
          banner={
            <Banner storageKey="production-checklist-2026-08">
              Before changing production edges, review the{' '}
              <Link href="/docs/guides/deployment">deployment checklist →</Link>
            </Banner>
          }
          navbar={navbar}
          footer={
            <Footer>
              {/* About and Contact live here rather than in the navbar, which
                  was crowded at five items. They are `display: 'hidden'` in
                  `src/content/_meta.js` so Nextra does not also list them. */}
              <div className="flex w-full flex-col gap-4">
                <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <Link href="/about" className="hover:underline">
                    About us
                  </Link>
                  <Link href="/contact" className="hover:underline">
                    Contact us
                  </Link>
                  <Link href="/faq" className="hover:underline">
                    FAQ
                  </Link>
                  <Link href="/blog" className="hover:underline">
                    Blog
                  </Link>
                  <a href="/feed.xml" className="hover:underline">
                    RSS
                  </a>
                  <a
                    href="https://github.com/misaf/blitze-cdn-web"
                    className="hover:underline"
                  >
                    GitHub
                  </a>
                </nav>
                <p>MIT {new Date().getFullYear()} © BlitzeCDN.</p>
              </div>
            </Footer>
          }
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/misaf/blitze-cdn-web/blob/1.x"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={await getPageMap()}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
