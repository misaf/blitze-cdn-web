import Link from 'next/link'
import {
  BandLinkList,
  PageHero,
  band,
  bandArt,
  closingNote,
  inner,
} from '@/components/ui'

/*
 * A hand-built 404 rather than `nextra-theme-docs`'s `NotFoundPage`.
 *
 * The stock page renders exactly two things: "404: Page Not Found" and a
 * "Submit an issue about broken link" link. That is the wrong next action for
 * almost everyone who lands here — they wanted a page, not a bug tracker — and
 * it ignores the visual language `/about` and `/contact` share, so it reads as
 * a different site. Pages were removed from this tree during heavy development
 * (`/docs/contributing`, `/docs/guides/upgrading`), so stale inbound links are
 * a live path, not a hypothetical one.
 *
 * Reporting the broken link is still offered, last, where it belongs.
 */

export const metadata = {
  title: 'Page not found',
  description:
    'That page does not exist. Jump to the documentation, the quick start, ' +
    'or search the site.',
}

const destinations = [
  { href: '/docs', label: 'Documentation — start here' },
  { href: '/docs/guides/quickstart', label: 'Quick start — deploy a site' },
  { href: '/docs/reference/cli', label: 'CLI reference — every command' },
  { href: '/faq', label: 'FAQ — scope, limits and guarantees' },
]

export default function NotFound() {
  return (
    <main
      id="nextra-skip-nav"
      className="canvas bg-surface text-fg antialiased [font-synthesis-weight:none]"
    >
      <PageHero eyebrow="404" title="That page does not exist">
        The link may be out of date — some pages were removed while the
        interfaces were still moving. Nothing is wrong with your connection or
        with the site.
      </PageHero>

      <section className={band}>
        <div className={bandArt} aria-hidden="true" />
        <div className={`relative z-10 ${inner} py-band`}>
          <div className="grid border border-band-line lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-5 p-card-lg">
              <h2 className="text-section leading-[1.06] font-book tracking-display text-balance">
                Where you were probably going
              </h2>
              <p className="leading-relaxed text-band-muted">
                Search is in the navbar above and covers every page, including
                the reference tables — it is usually faster than guessing at a
                URL.
              </p>
            </div>
            <BandLinkList links={destinations} />
          </div>
        </div>
      </section>

      <div className={inner}>
        <p className={closingNote}>
          If you followed a link from within this site rather than from
          elsewhere, that is a bug worth knowing about —{' '}
          <Link
            href="/contact"
            className="text-accent-ink underline underline-offset-2"
          >
            tell us where it was
          </Link>
          .
        </p>
      </div>
    </main>
  )
}
