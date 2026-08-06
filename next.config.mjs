import nextra from 'nextra'
import { basePath } from './src/lib/base-path.mjs'

const withNextra = nextra({
  // No `contentDirBasePath`: the content tree maps to URLs directly, so
  // `src/content/docs/**` still serves `/docs/**` while `faq` and `blog` sit
  // alongside it as top-level sections. `/` is the hand-written landing page in
  // `src/app/page.jsx`, which is why the catch-all route is `[...mdxPath]`
  // (required) rather than `[[...mdxPath]]` (optional) — the optional form
  // would also match `/` and collide with it.
  search: {
    codeblocks: false,
  },
})

export default withNextra({
  reactStrictMode: true,
  // `next dev` otherwise writes AGENTS.md and CLAUDE.md into this directory the
  // first time it detects an AI coding agent, and re-adds the block whenever it
  // is deleted — an uncommitted change that reappears on every dev run. The
  // warning it carries (this Next.js version differs from model training data;
  // read `node_modules/next/dist/docs/` first) still applies and is recorded in
  // the repository-root CLAUDE.md instead.
  agentRules: false,
  // Static export: the site is a build artifact, never a server with access to
  // controller state. See SECURITY.md.
  output: 'export',
  images: { unoptimized: true },
  // Empty for `next dev` and for a custom domain; `/blitze-cdn-web` when CI
  // publishes to the GitHub Pages project site. See `src/lib/base-path.mjs`.
  basePath,
})
