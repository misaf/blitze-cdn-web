import Link from 'next/link'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { siteUrl } from '@/lib/site'
import DocsBanner from '@/components/docs-banner'
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
          /* Nextra's own theme switcher — a three-option listbox in the sidebar
             footer — is off, because `ThemeToggle` in the navbar is now a
             three-state control covering the same ground. Two controls for one
             setting made users hesitate over whether they did the same thing,
             and the sidebar one is not reachable at all on the hand-built
             routes at narrow widths. This hides that UI only; the underlying
             next-themes provider is configured separately and still runs. */
          darkMode={false}
          banner={<DocsBanner />}
          navbar={navbar}
          footer={
            <Footer>
              {/* About and Contact live here rather than in the navbar, which
                  was crowded at five items. They are `display: 'hidden'` in
                  `src/content/_meta.js` so Nextra does not also list them. */}
              <div className="flex w-full flex-col gap-4">
                {/* Named: this is the second <nav> landmark on every page,
                    and "navigation" twice over tells a screen-reader user
                    nothing about which is which. */}
                <nav
                  aria-label="Footer"
                  className="flex flex-wrap gap-x-6 gap-y-2 text-sm"
                >
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
                  {/* The only footer link that leaves the site, and it looked
                      identical to the five that do not. */}
                  <a
                    href="https://github.com/misaf/blitze-cdn-web"
                    className="hover:underline"
                  >
                    GitHub
                    <span aria-hidden="true"> ↗</span>
                    <span className="sr-only"> (opens github.com)</span>
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
