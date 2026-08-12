/*
 * The four line marks the hand-designed pages draw.
 *
 * All of them are `currentColor` at 1.6 stroke with square caps, which is what
 * makes them read as part of the ruling rather than as pasted-in iconography.
 * Nothing here has any layout opinion beyond its own size.
 */

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
