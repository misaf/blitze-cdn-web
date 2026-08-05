import Link from 'next/link'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './globals.css'

export const metadata = {
  title: {
    default: 'BlitzeCDN',
    template: '%s – BlitzeCDN'
  },
  description:
    'A security-focused control plane for converging Nginx CDN edge servers.',
  applicationName: 'BlitzeCDN'
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
      projectLink="https://github.com/misaf/blitze-cdn"
    />
  )

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="⚡" />
      <body>
        <Layout
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
                  <a
                    href="https://github.com/misaf/blitze-cdn"
                    className="hover:underline"
                  >
                    GitHub
                  </a>
                </nav>
                <p>
                  MIT {new Date().getFullYear()} © BlitzeCDN. Reference pages on
                  this site are generated from the source tree. Report a
                  vulnerability{' '}
                  <Link href="/contact" className="underline">
                    privately
                  </Link>
                  , never as a public issue.
                </p>
              </div>
            </Footer>
          }
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/misaf/blitze-cdn/blob/master/web"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={await getPageMap()}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
