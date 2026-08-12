/*
 * The composed blocks: a link list, two card grids, and a page header.
 *
 * Each of these exists because two pages were drawing the same thing from two
 * copies of the same 300-character class string, and the copies had already
 * started to disagree. They take data and render the ruling; the class
 * vocabulary they build on lives in `./recipes`.
 */

import Link from 'next/link'

import { Arrow, ExternalArrow } from './icons'
import {
  cover,
  coverRuling,
  eyebrowOnCover,
  flow,
  focusInset,
  focusInsetDark,
  h1,
  inner,
} from './recipes'

/**
 * A stack of internal link rows filling the trailing half of a dark cover.
 * Both the landing page's reference list and `/contact`'s "anything else"
 * panel are this, and each used to carry its own 300-character copy of the
 * class string — so a hover tweak on one silently stopped matching the other.
 *
 * `links` is `[{ href, label }]`.
 */
export function CoverLinkList({ links }) {
  return (
    <div className="flex flex-col border-t border-ink-line lg:border-t-0 lg:border-l">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`group flex flex-1 items-center justify-between gap-6 px-row-x py-row-y text-[1rem] no-underline transition-colors duration-100 not-first:border-t not-first:border-ink-line hover:bg-white/6 ${focusInsetDark}`}
        >
          <span>{link.label}</span>
          <Arrow className="size-[1.2rem] text-rule-bright transition-transform motion-safe:duration-150 motion-safe:group-hover:translate-x-1" />
        </Link>
      ))}
    </div>
  )
}

/**
 * The grid of outbound repository cards shared by `/about` and `/contact`.
 *
 * `items` is `[{ name, href, note }]`. Every card leaves the site, so each
 * carries the outbound arrow and names its destination host to assistive
 * technology — the visible label is a bare repository name, which does not
 * say "this goes to GitHub" on its own.
 */
export function ExternalCardGrid({ items }) {
  return (
    <div
      className={`${flow} grid gap-px border border-line bg-line md:grid-cols-3`}
    >
      {items.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className={`group flex flex-col gap-3 bg-panel p-card no-underline ${focusInset}`}
        >
          <span className="flex items-center justify-between gap-3">
            <span className="font-mono text-[0.92rem] text-fg underline-offset-4 group-hover:underline">
              {item.name}
            </span>
            <ExternalArrow className="size-[1.05rem] text-rule-ink transition-transform motion-safe:duration-150 motion-safe:group-hover:translate-x-px motion-safe:group-hover:-translate-y-px" />
          </span>
          <span className="text-[0.9rem] leading-relaxed text-muted">
            {item.note}
          </span>
          <span className="sr-only">Opens on {new URL(item.href).host}</span>
        </a>
      ))}
    </div>
  )
}

/**
 * The internal counterpart to `ExternalCardGrid`: a grid of routes into the
 * documentation, used by the docs overview through `mdx-components.js`.
 *
 * `items` is `[{ title, href, note }]`.
 *
 * This exists because Nextra's own `<Cards.Card>` renders its children BEFORE
 * its title — `[children, title]`, deliberately, because the component is built
 * for a card whose body is an image with the title as a caption underneath.
 * Filled with a prose description instead, every card on the overview read
 * backwards: the reader met "Deploy the example site from a fresh controller"
 * and only then learned it was the tutorial. The whole cell is one link, so
 * that order was also the link's accessible name — six links that each
 * announced their explanation before their destination.
 *
 * Here the title leads and the note explains, which is the order every other
 * card on the site already uses.
 */
export function RouteCardGrid({ items }) {
  return (
    <div
      className={`${flow} grid gap-px border border-line bg-line sm:grid-cols-2`}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`group flex flex-col gap-2 bg-panel p-card no-underline ${focusInset}`}
        >
          <span className="flex items-center justify-between gap-3">
            <span className="font-display text-[1.05rem] font-book tracking-display text-fg underline-offset-4 group-hover:underline">
              {item.title}
            </span>
            <Arrow className="size-[1.15rem] text-rule-ink transition-transform motion-safe:duration-150 motion-safe:group-hover:translate-x-1" />
          </span>
          <span className="text-[0.9rem] leading-relaxed text-muted">
            {item.note}
          </span>
        </Link>
      ))}
    </div>
  )
}

/**
 * The compact page header used by `/about` and `/contact`: a dark cover with
 * the book's ruling showing through. The landing page has its own taller
 * ledger spread; these get the same cover at a size that does not upstage it.
 */
export function PageHero({ eyebrow: label, title, children }) {
  return (
    <section className={cover}>
      <div className={coverRuling} aria-hidden="true" />
      <div className={`relative z-10 ${inner} py-[clamp(3.5rem,7vw,6rem)]`}>
        <p className={eyebrowOnCover}>{label}</p>
        <h1 className={`${h1} max-w-[16ch]`}>{title}</h1>
        {children && (
          <div className="mt-6 max-w-2xl text-[1.02rem] leading-relaxed text-ink-muted">
            {children}
          </div>
        )}
      </div>
    </section>
  )
}
