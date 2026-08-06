/*
 * The blog is not documentation, and it stops borrowing the docs furniture
 * here.
 *
 * `PostList` on the index already lists every post newest-first from each
 * post's `date` frontmatter, so a sidebar tree beside it is a second copy of
 * the same three links — and a navigation tree is furniture that only earns
 * its width once there is more to navigate than there are posts. The
 * breadcrumb spends a line saying `Blog › All posts` directly above an `<h1>`
 * reading "Blog". The timestamp stamps "last updated" on an index whose whole
 * subject is dates, competing with the bylines it sits under.
 *
 * What is kept: `toc` and `pagination` on posts, because a post is a linear
 * read where both help, and both are switched off on the index below, where
 * there is no prose to outline and nothing to page through.
 *
 * `order` is still this file's job — Nextra reads the sidebar order from it
 * even with the sidebar hidden, and `pagination` on posts follows that order,
 * so a new post needs adding here as well as on disk.
 */
const withoutDocsChrome = {
  sidebar: false,
  breadcrumb: false,
  timestamp: false,
}

export default {
  index: {
    title: 'All posts',
    theme: { ...withoutDocsChrome, toc: false, pagination: false },
  },
  'a-version-is-an-interface': {
    title: 'A version is an interface',
    theme: withoutDocsChrome,
  },
  'one-lock-two-halves': {
    title: 'One lock, two halves',
    theme: withoutDocsChrome,
  },
}
