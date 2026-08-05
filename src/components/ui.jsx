/*
 * Shared building blocks for the hand-designed pages (`/`, `/about`,
 * `/contact`). These pages bypass the Nextra docs layout entirely, so this is
 * what keeps them looking like one site.
 *
 * The recipes are plain strings rather than `@apply` rules so the utilities
 * stay readable at the call site and Tailwind's scanner sees them literally.
 */

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

const btn =
  'inline-flex items-center justify-center border px-6 py-3.5 text-[0.98rem] ' +
  'font-medium no-underline transition duration-100 hover:-translate-y-px ' +
  'focus-visible:outline-2 focus-visible:outline-offset-[3px] ' +
  'focus-visible:outline-accent'

export const btnPrimary = `${btn} border-transparent bg-accent text-accent-contrast hover:bg-accent-bright`
export const btnGhost = `${btn} border-current bg-transparent hover:bg-current/12`

/* Heading left, supporting prose right — the dominant section header. */
export const split =
  'grid items-start gap-[clamp(1.25rem,4vw,4rem)] lg:grid-cols-2'

/* Cells draw only their top and left rules and the container closes the outer
   right and bottom, so interior rules never double up. */
export const grid =
  'mt-[clamp(2.5rem,5vw,4rem)] grid border-r border-b border-line'
export const gridCell =
  'flex flex-col justify-center gap-1.5 border-t border-l border-line ' +
  'p-[clamp(1.5rem,3vw,2.25rem)]'

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

export function Arrow({ className = '' }) {
  return (
    <svg
      className={`size-[1.35rem] shrink-0 ${className}`}
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
