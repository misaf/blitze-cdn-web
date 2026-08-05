/*
 * Top-level sections of the Nextra content tree. `type: 'page'` lifts an entry
 * out of the docs sidebar and into the navbar, which is what keeps blog posts
 * and the FAQ from being listed alongside the reference pages.
 *
 * `/`, `/about`, and `/contact` are hand-designed App Router routes. Nextra
 * still discovers App Router pages while building its page map, so explicit
 * hidden entries keep them out of the docs sidebar and navbar. The `index`
 * entry also prevents its key from colliding with `docs/index.mdx` in Nextra's
 * navigation rendering.
 */
export default {
  docs: { type: 'page', title: 'Documentation' },
  faq: { type: 'page', title: 'FAQ' },
  blog: { type: 'page', title: 'Blog' },
  index: { display: 'hidden' },
  about: { display: 'hidden' },
  contact: { display: 'hidden' },
}
