import nextra from 'nextra'

const withNextra = nextra({
  // Prose and generated reference live under /docs; `/` is the landing page.
  contentDirBasePath: '/docs',
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
