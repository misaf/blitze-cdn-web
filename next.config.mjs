import nextra from 'nextra'

const withNextra = nextra({
  // No `contentDirBasePath`: the content tree maps to URLs directly, so
  // `src/content/docs/**` still serves `/docs/**` while `faq` and `blog` sit
  // alongside it as top-level sections. `/` is the hand-written landing page in
  // `src/app/page.jsx`, which is why the catch-all route is `[...mdxPath]`
  // (required) rather than `[[...mdxPath]]` (optional) — the optional form
  // would also match `/` and collide with it.
  search: {
    codeblocks: false
  }
})

export default withNextra({
  reactStrictMode: true,
  // Static export: the site is a build artifact, never a server with access to
  // controller state. See SECURITY.md.
  output: 'export',
  images: { unoptimized: true }
})
