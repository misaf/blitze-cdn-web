/*
 * The class vocabulary: named recipes, no markup.
 *
 * Shared by the hand-designed pages (`/`, `/about`, `/contact`, the 404), which
 * bypass the Nextra docs layout entirely — this is what keeps them looking like
 * one site.
 *
 * The recipes are plain strings rather than `@apply` rules so the utilities stay
 * readable at the call site and Tailwind's scanner sees them literally.
 *
 * The vocabulary is the ledger described at the top of `globals.css`: oxblood
 * rules the book, attest-green means the two halves agree, and anything set in
 * mono is an entry rather than prose.
 *
 * Kept apart from the components in this directory because the two are asked
 * different questions. A recipe is edited while looking at the palette; a
 * component is edited while looking at a page.
 */

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
