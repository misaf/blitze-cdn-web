/*
 * Shared building blocks for the hand-designed pages (`/`, `/about`,
 * `/contact`). These pages bypass the Nextra docs layout entirely, so this is
 * what keeps them looking like one site.
 *
 * The recipes are plain strings rather than `@apply` rules so the utilities
 * stay readable at the call site and Tailwind's scanner sees them literally.
 */

import Link from 'next/link'

export const inner = 'mx-auto w-full max-w-measure px-gutter'
export const section = 'py-band'

export const h1 =
  'text-hero font-book leading-[1.06] tracking-display text-balance'
export const h2 =
  'text-section leading-[1.06] font-book tracking-display text-balance'
export const h3 = 'text-card font-book tracking-display'

export const lede =
  'text-[clamp(1rem,1.15vw,1.15rem)] leading-relaxed text-muted'

export const eyebrow =
  'eyebrow-marker mb-6 flex items-center gap-2.5 font-mono text-[0.78rem] ' +
  'uppercase tracking-[0.14em] text-accent-ink'

/* The focus ring for anything that is not a `btn`. Card-sized targets and
   scrollable panels get it inset, so the outline is not clipped by the
   neighbouring cell's rule. Kept in one place because the band link rows,
   the repository cards and the code panels must not drift apart.

   `focusInset` is for the light `surface`; `focusInsetDark` is for anything
   sitting on `ink` or `band`, where the darkened light-theme accent would be
   nearly invisible. */
export const focusInset =
  'focus-visible:outline-2 focus-visible:-outline-offset-2 ' +
  'focus-visible:outline-accent-ink'
export const focusInsetDark =
  'focus-visible:outline-2 focus-visible:-outline-offset-2 ' +
  'focus-visible:outline-accent'

/* The lift on hover is `motion-safe:` for the same reason the hero bloom and
   the WebGL globe are gated: a reduced-motion preference should not have to be
   honoured selectively. The colour transition stays — it is not motion. */
const btn =
  'inline-flex items-center justify-center border px-6 py-3.5 text-[0.98rem] ' +
  'font-medium no-underline transition duration-100 ' +
  'motion-safe:hover:-translate-y-px ' +
  'focus-visible:outline-2 focus-visible:outline-offset-[3px] ' +
  'focus-visible:outline-accent'

export const btnPrimary = `${btn} border-transparent bg-accent text-accent-contrast hover:bg-accent-bright`
export const btnGhost = `${btn} border-current bg-transparent hover:bg-current/12`

/* Heading left, supporting prose right — the dominant section header. */
export const split = 'grid items-start gap-split lg:grid-cols-2'

/* The standard gap between a section's header and the content below it. */
export const flow = 'mt-flow'

/* Cells draw only their top and left rules and the container closes the outer
   right and bottom, so interior rules never double up. */
export const grid = `${flow} grid border-r border-b border-line`
export const gridCell =
  'flex flex-col justify-center gap-1.5 border-t border-l border-line p-card'

/* One full-bleed row per item, rule between. Used for the landing page's
   design principles and /about's beliefs; `tone` is the only thing that
   differs between the two, because one sits on `surface` and one on `band`. */
export const principleRow = (tone = 'surface') =>
  `grid items-start gap-x-8 gap-y-3 border-t py-row last:border-b ` +
  `md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] ` +
  (tone === 'band' ? 'border-band-line' : 'border-line')

/* The quiet closing paragraph that ends a page above the footer, set off by a
   rule. Shared by `/` and the 404 rather than copied — extracting it was the
   whole point of the exercise; adding a second copy would have re-created the
   drift this module exists to prevent. */
export const closingNote =
  'max-w-3xl border-t border-line py-note text-[0.92rem] leading-relaxed ' +
  'text-muted'

export const band = 'relative overflow-hidden bg-band text-band-fg'
export const bandArt =
  'band-art pointer-events-none absolute right-0 bottom-0 h-full w-[min(30%,26rem)]'

export function Check({ className = 'text-accent' }) {
  return (
    <svg
      className={`mt-[0.22rem] size-[1.1rem] shrink-0 ${className}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
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
 * A stack of internal link rows filling the trailing half of a colour band.
 * Both the landing page's reference list and `/contact`'s "anything else"
 * panel are this, and each used to carry its own 300-character copy of the
 * class string — so a hover tweak on one silently stopped matching the other.
 *
 * `links` is `[{ href, label }]`.
 */
export function BandLinkList({ links }) {
  return (
    <div className="flex flex-col border-t border-band-line lg:border-t-0 lg:border-l">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group flex flex-1 items-center justify-between gap-6 px-row-x py-row-y text-[1.05rem] no-underline transition-colors duration-100 not-first:border-t not-first:border-band-line hover:bg-white/7 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        >
          <span>{link.label}</span>
          <Arrow className="size-[1.35rem] text-accent transition-transform motion-safe:duration-150 motion-safe:group-hover:translate-x-1" />
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
          className={`group flex flex-col gap-3 bg-surface p-card no-underline ${focusInset}`}
        >
          <span className="flex items-center justify-between gap-3">
            <span className="font-mono text-[0.95rem] text-fg underline-offset-4 group-hover:underline">
              {item.name}
            </span>
            <ExternalArrow className="size-[1.1rem] text-accent-ink transition-transform motion-safe:duration-150 motion-safe:group-hover:translate-x-px motion-safe:group-hover:-translate-y-px" />
          </span>
          <span className="text-[0.92rem] leading-relaxed text-muted">
            {item.note}
          </span>
          <span className="sr-only">Opens on {new URL(item.href).host}</span>
        </a>
      ))}
    </div>
  )
}

/**
 * The compact page header used by `/about` and `/contact`. The landing page has
 * its own taller split hero with the gradient panel; these pages get the same
 * ink background and eyebrow treatment at a size that does not upstage it.
 */
export function PageHero({ eyebrow: label, title, children }) {
  return (
    <section className="relative overflow-hidden bg-ink text-ink-fg">
      {/* Feathered on its leading edge: the bar pattern starts abruptly at the
          element boundary and reads as a seam without this. */}
      <div
        className="pointer-events-none absolute right-0 bottom-0 h-full w-[min(34%,30rem)] band-art [mask-image:linear-gradient(90deg,transparent_0%,#000_55%)]"
        aria-hidden="true"
      />
      <div className={`relative z-10 ${inner} py-[clamp(3.5rem,7vw,6rem)]`}>
        <p className={`${eyebrow} text-accent!`}>{label}</p>
        <h1 className={`${h1} max-w-[16ch]`}>{title}</h1>
        {children && (
          <div className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ink-muted">
            {children}
          </div>
        )}
      </div>
    </section>
  )
}
