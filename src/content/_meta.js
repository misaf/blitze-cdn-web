/*
 * Top-level sections of the Nextra content tree. `type: 'page'` lifts an entry
 * out of the docs sidebar and into the navbar, which is what keeps blog posts
 * and the FAQ from being listed alongside the reference pages.
 *
 * `/about` and `/contact` are deliberately absent: they are hand-designed App
 * Router routes (`src/app/about`, `src/app/contact`) rather than MDX, so Nextra
 * knows nothing about them. They are reached from the footer.
 */
export default {
  docs: { type: 'page', title: 'Documentation' },
  faq: { type: 'page', title: 'FAQ' },
  blog: { type: 'page', title: 'Blog' }
}
