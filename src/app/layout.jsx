import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

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
              MIT {new Date().getFullYear()} © BlitzeCDN. Reference pages on
              this site are generated from the source tree.
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
