/*
 * Shared building blocks for the hand-designed pages (`/`, `/about`,
 * `/contact`, the 404). These pages bypass the Nextra docs layout entirely, so
 * this is what keeps them looking like one site.
 *
 * The recipes are plain strings rather than `@apply` rules so the utilities
 * stay readable at the call site and Tailwind's scanner sees them literally.
 *
 * The vocabulary is the ledger described at the top of `globals.css`:
 * oxblood rules the book, attest-green means the two halves agree, and
 * anything set in mono is an entry rather than prose.
 */

import Link from 'next/link'

export const inner = 'mx-auto w-full max-w-measure px-gutter'
export const section = 'py-band'

export const h1 =
  'font-display text-hero font-book leading-[1.04] tracking-display text-balance'
export const h2 =
  'font-display text-section font-book leading-[1.08] tracking-display text-balance'
export const h3 = 'font-display text-card font-book tracking-display'

export const lede =
  'text-[clamp(1rem,1.15vw,1.12rem)] leading-relaxed text-muted'

/*
 * The column head. Ledger stock labels its columns in small wide caps above a
 * rule, and that is exactly what a section eyebrow is doing here, so it is set
 * as one rather than decorated with a marker glyph. The rule is the element's
 * own border — one line doing one job.
 */
export const eyebrow =
  'mb-6 inline-block border-b-2 border-rule pb-1.5 font-mono text-[0.7rem] ' +
  'font-medium uppercase tracking-head text-rule-ink'

/* The same head on a dark cover, where oxblood loses too much contrast. */
export const eyebrowOnCover =
  'mb-6 inline-block border-b-2 border-rule pb-1.5 font-mono text-[0.7rem] ' +
  'font-medium uppercase tracking-head text-ink-fg'

/* The focus ring for anything that is not a `btn`. Card-sized targets and
   scrollable panels get it inset, so the outline is not clipped by the
   neighbouring cell's rule. Kept in one place because the band link rows,
   the repository cards and the code panels must not drift apart.

   `focusInset` is for the light stock; `focusInsetDark` is for anything on
   `ink`, where the light-theme oxblood is too dark to see. */
export const focusInset =
  'focus-visible:outline-2 focus-visible:-outline-offset-2 ' +
  'focus-visible:outline-rule'
export const focusInsetDark =
  'focus-visible:outline-2 focus-visible:-outline-offset-2 ' +
  'focus-visible:outline-rule-bright'

/*
 * Buttons are stamps, not pills: square, ruled, and set in the mono face that
 * every other entry in the book uses. The hover moves the fill rather than the
 * element — a page built on ruled rows should not have things floating off
 * their line, and it means there is nothing here to gate behind `motion-safe`.
 */
const btn =
  'inline-flex items-center justify-center border px-6 py-3 font-mono ' +
  'text-[0.85rem] font-medium uppercase tracking-[0.08em] no-underline ' +
  'transition-colors duration-100 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-[3px]'

export const btnPrimary =
  `${btn} border-rule bg-rule text-ledger hover:bg-rule-bright ` +
  `hover:border-rule-bright focus-visible:outline-rule`
export const btnGhost =
  `${btn} border-current bg-transparent hover:bg-current/10 ` +
  `focus-visible:outline-current`

/* Heading left, supporting prose right — the dominant section header. */
export const split = 'grid items-start gap-split lg:grid-cols-2'

/* The standard gap between a section's header and the content below it. */
export const flow = 'mt-flow'

/* Cells draw only their top and left rules and the container closes the outer
   right and bottom, so interior rules never double up. */
export const grid = `${flow} grid border-r border-b border-line`
export const gridCell =
  'flex flex-col justify-center gap-1.5 border-t border-l border-line p-card'

/*
 * One full-bleed ruled row per item. Used for the landing page's design
 * principles and `/about`'s beliefs; `tone` is the only thing that differs
 * between the two, because one sits on paper and one on a dark cover.
 */
export const principleRow = (tone = 'surface') =>
  `grid items-baseline gap-x-10 gap-y-3 border-t py-row last:border-b ` +
  `md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] ` +
  (tone === 'cover' ? 'border-ink-line' : 'border-line')

/* The quiet closing paragraph that ends a page above the footer, set off by a
   rule. Shared by `/` and the 404 rather than copied — extracting it was the
   whole point of the exercise; adding a second copy would have re-created the
   drift this module exists to prevent. */
export const closingNote =
  'max-w-3xl border-t border-line py-note text-[0.9rem] leading-relaxed ' +
  'text-muted'

/* The dark half of the book. `cover` replaces what used to be a second accent
   colour: there is one dark tone now, not a navy band and a near-black hero. */
export const cover = 'relative overflow-hidden bg-ink text-ink-fg'
export const coverRuling =
  'ruled-cover pointer-events-none absolute inset-0 opacity-70'

/*
 * The confirmation mark. Attest-green, and it appears nowhere that does not
 * mean "this was checked and it agrees" — see the palette note in globals.css.
 */
export function Attest({ className = 'text-attest-ink' }) {
  return (
    <svg
      className={`mt-[0.2rem] size-[1.05rem] shrink-0 ${className}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M3 10.5 8 15.5 17 5" />
    </svg>
  )
}

/* The size lives in the default `className`, not in the base string, so a
   caller passing its own `size-*` replaces it. Concatenating the two instead
   produces a pair of equal-specificity rules whose winner is decided by
   whichever Tailwind happens to emit last — which is how the tracker and
   repository cards spent their life asking for `size-[1.1rem]` and rendering
   at 1.35rem. Same reasoning in `ExternalArrow`; `Icon` already worked this
   way, which is why it never had the problem. */
export function Arrow({ className = 'size-[1.35rem]' }) {
  return (
    <svg
      className={`shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}

/* The outbound counterpart to `Arrow`. Internal navigation continues in the
   flow of the site; these leave it. Using the same rightward arrow for both —
   which is what the tracker and repository cards used to do — made a link to
   github.com look exactly like a link to /faq. */
export function ExternalArrow({ className = 'size-[1.35rem]' }) {
  return (
    <svg
      className={`shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  )
}

export function Icon({ children, className = 'size-[1.4rem] shrink-0' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

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
