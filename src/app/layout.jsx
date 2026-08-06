import Link from 'next/link'
import { IBM_Plex_Mono, Public_Sans, Zilla_Slab } from 'next/font/google'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { siteUrl } from '@/lib/site'
import DocsBanner from '@/components/docs-banner'
import ThemeToggle from '@/components/theme-toggle'
import 'nextra-theme-docs/style.css'
import './globals.css'

/*
 * The three faces, self-hosted at build time. `next/font/google` downloads and
 * emits them into the build output, so the deployed static export makes no
 * request to a Google origin — the site must hold no third-party dependency at
 * runtime. Each declares a `variable`, and `globals.css` maps those onto
 * `--font-display` / `--font-sans` / `--font-mono`.
 *
 * Weights are enumerated rather than taken as variable axes so the build ships
 * only what the design uses. `font-synthesis: none` on the hand-designed pages
 * means a weight not listed here does not silently render as a faked bold.
 */
const zillaSlab = Zilla_Slab({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-zilla-slab',
})

const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-public-sans',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-plex-mono',
})

const fontVariables = `${zillaSlab.variable} ${publicSans.variable} ${plexMono.variable}`

/* Used by both the navbar's project link and the colophon, which drifted
   apart as two copies of the same string. */
const GITHUB_URL = 'https://github.com/misaf/blitze-cdn-web'

/*
 * The colophon's three link columns.
 *
 * Grouped by what the reader is trying to do rather than by page type: find
 * out about the project, learn how to operate it, or look up an exact value.
 * That last split is the same one the docs sidebar makes between Guides and
 * Reference, and it is the distinction operators actually navigate by.
 *
 * `external: true` marks a link that leaves the site. It is not decoration —
 * every one of these used to look identical to the internal ones, so a link to
 * github.com was indistinguishable from a link to /faq.
 */
const footerColumns = [
  {
    head: 'Project',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/contact', label: 'Contact us' },
      { href: '/faq', label: 'FAQ' },
      { href: '/blog', label: 'Blog' },
      { href: '/feed.xml', label: 'RSS feed', external: true },
      { href: GITHUB_URL, label: 'GitHub', external: true },
    ],
  },
  {
    head: 'Operating',
    links: [
      { href: '/docs', label: 'Documentation' },
      { href: '/docs/guides/quickstart', label: 'Quick start' },
      { href: '/docs/guides/deployment', label: 'Deploying' },
      { href: '/docs/architecture', label: 'Architecture' },
    ],
  },
  {
    head: 'Reference',
    links: [
      { href: '/docs/reference/cli', label: 'CLI' },
      { href: '/docs/reference/api', label: 'HTTP API' },
      { href: '/docs/reference/configuration', label: 'Configuration' },
      { href: '/docs/reference/roles', label: 'Ansible roles' },
    ],
  },
]

/*
 * One footer link. Outbound links carry the arrow and name their destination
 * host to assistive technology, matching `ExternalCardGrid` on the designed
 * pages — the visible label does not say where it goes on its own.
 *
 * `/feed.xml` is `external` in the sense that matters here: it is not a page,
 * it leaves the reading flow, and `next/link` should not try to prefetch it.
 */
function FooterLink({ href, label, external }) {
  const className =
    'text-ink-muted no-underline underline-offset-4 transition-colors ' +
    'hover:text-ink-fg hover:underline focus-visible:outline-2 ' +
    'focus-visible:outline-offset-2 focus-visible:outline-rule-bright'

  if (external) {
    const isHttp = href.startsWith('http')
    return (
      <a href={href} className={className}>
        {label}
        <span aria-hidden="true"> ↗</span>
        {isHttp && (
          <span className="sr-only"> (opens {new URL(href).host})</span>
        )}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  )
}

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
      /* The masthead of the book: the name in the display face, the
         description as a column head in mono caps below it, divided by the
         same oxblood rule that divides the two halves of the hero ledger.
         The description is hidden on small screens rather than wrapped —
         the navbar is a single row and a two-line logo breaks it. */
      logo={
        <span className="flex flex-col gap-0.5 leading-none">
          <span className="font-display text-[1.15rem] font-semibold tracking-display">
            BlitzeCDN
          </span>
          <span className="hidden border-t border-rule pt-1 font-mono text-[0.6rem] tracking-head text-muted uppercase sm:block">
            Edge control plane
          </span>
        </span>
      }
      projectLink={GITHUB_URL}
    >
      <ThemeToggle />
    </Navbar>
  )

  return (
    <html
      lang="en"
      dir="ltr"
      className={fontVariables}
      suppressHydrationWarning
    >
      {/*
        This is what carries the design onto the docs routes. Nextra's theme is
        precompiled and cannot be restyled with our utilities, but it derives
        its links, active states and focus rings from one HSL primary and its
        page background from `backgroundColor` — so setting those four numbers
        is the whole docs-chrome retheme.

        The primary is the site's oxblood, `#a63a2e`, expressed in HSL. Keep
        the two in step: if `--color-rule` moves in `globals.css`, these move
        with it or the docs stop matching the rest of the book.

        `lightness` is split per theme deliberately. 42% is the oxblood as
        printed and clears 4.5:1 on the light stock; the same value on the dark
        cover falls under 3:1, so the dark theme lifts it to 68%.
      */}
      <Head
        faviconGlyph="⚡"
        color={{ hue: 6, saturation: 57, lightness: { light: 42, dark: 68 } }}
        backgroundColor={{ light: '#e4e8e4', dark: '#151a1b' }}
      />
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
              {/*
                The colophon: where a book records who kept it, under what
                terms, and where the record itself lives. It is the back cover
                to the hero's front one, which is why it is the ink tone rather
                than the paper — see the `body footer` rules in `globals.css`.

                About and Contact live here rather than in the navbar, which was
                crowded at five items. They are `display: 'hidden'` in
                `src/content/_meta.js` so Nextra does not also list them.

                One `<nav>` landmark, not four. Three columns of links would be
                three landmarks on every page, on top of the navbar, sidebar and
                table of contents the docs routes already carry — so the columns
                are headings inside a single named landmark instead, which a
                screen reader reaches by heading rather than by landmark.
              */}
              <nav
                aria-label="Footer"
                className="grid w-full gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"
              >
                <div className="flex flex-col gap-4">
                  {/* `items-start` so the rule under the wordmark is as wide as
                      the wordmark. Without it the flex column stretches its
                      children and the rule runs the full width of the grid
                      cell, which reads as a divider rather than as part of the
                      masthead. */}
                  <p className="flex flex-col items-start gap-1 leading-none">
                    <span className="font-display text-[1.15rem] font-semibold tracking-display text-ink-fg">
                      BlitzeCDN
                    </span>
                    <span className="border-t border-rule pt-1 font-mono text-[0.6rem] tracking-head text-ink-faint uppercase">
                      Edge control plane
                    </span>
                  </p>
                  {/* Identifies the project, rather than disclaiming what this
                      site is. The previous copy repeated the landing page's
                      closing note almost word for word — and the two sit
                      directly on top of each other on `/`, so the page made
                      the same security claim twice in a row. That claim is
                      still made once, in `closingNote`, where it links to the
                      architecture page that substantiates it.

                      Kept in step with the `description` in `metadata` below;
                      they are the same sentence and should not drift. */}
                  <p className="max-w-[34ch] text-[0.86rem] leading-relaxed text-ink-muted">
                    A security-focused control plane for converging Nginx CDN
                    edge servers. Python owns desired state and history; Ansible
                    owns remote Linux state.
                  </p>
                  <p className="font-mono text-[0.72rem] tracking-[0.04em] text-ink-faint">
                    MIT {new Date().getFullYear()} © BlitzeCDN
                  </p>
                </div>

                {footerColumns.map((column) => (
                  <div key={column.head} className="flex flex-col gap-3.5">
                    <h2 className="font-mono text-[0.68rem] tracking-head text-ink-faint uppercase">
                      {column.head}
                    </h2>
                    <ul role="list" className="grid gap-2.5 text-[0.9rem]">
                      {column.links.map((link) => (
                        <li key={link.href}>
                          <FooterLink {...link} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
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
