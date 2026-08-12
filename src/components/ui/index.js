/*
 * The shared building blocks for the hand-designed pages (`/`, `/about`,
 * `/contact`, the 404), which bypass the Nextra docs layout entirely.
 *
 * One import path, three files behind it:
 *
 *   ./recipes  the class vocabulary — named strings, no markup
 *   ./icons    the four line marks
 *   ./blocks   the composed pieces two or more pages share
 *
 * Callers import from `@/components/ui` and do not need to know which. The
 * split is for whoever is editing: a colour question is answered in `recipes`
 * without scrolling past four SVGs, and a markup question in `blocks` without
 * scrolling past a hundred lines of Tailwind.
 */

export * from './blocks'
export * from './icons'
export * from './recipes'
