import Link from 'next/link'
import { importPage } from 'nextra/pages'
import { getPageMap } from 'nextra/page-map'
import { normalizePages } from 'nextra/normalize-pages'
import PrintButton from '@/components/print-mode'
import { absoluteUrl } from '@/lib/site'
import { useMDXComponents as getMDXComponents } from '../../../mdx-components'

/*
 * The whole manual as one document, for printing or saving to PDF.
 *
 * Every page under `/docs` is imported and rendered inline, in sidebar order.
 * This is a build-time concatenation, not a client-side one: the route is part
 * of the static export like any other, so it needs no JavaScript to assemble
 * itself and prints correctly from a saved copy.
 *
 * Two things it deliberately is not:
 *
 * - It is not in the search index (`data-pagefind-ignore` below, and no
 *   `data-pagefind-body`). It holds a second copy of all 26 pages, and
 *   indexing it would make every query return this page alongside the real
 *   one, with the wrong link and a 26-page excerpt. This is the one exception
 *   to the "a hand-designed page carries `data-pagefind-body`" rule in
 *   CLAUDE.md — the rule exists so pages are findable, and this page is a
 *   duplicate that must not be.
 * - It is not indexed by search engines (`robots` below) and not in the
 *   sitemap (`sitemap.js` filters it), for the same duplicate-content reason.
 */
export const metadata = {
  title: 'Print the documentation',
  alternates: { canonical: absoluteUrl('/print') },
  description:
    'Every BlitzeCDN documentation page collected into one document, for ' +
    'printing or saving as a PDF.',
  robots: { index: false, follow: false },
}

const baseComponents = getMDXComponents()

/*
 * One document, one outline.
 *
 * Each page arrives with its own `h1`, so a straight concatenation produces 26
 * top-level headings and no structure at all — a screen reader's heading list
 * would be flat, and a PDF reader's generated outline would be too. So every
 * heading in an imported page is pushed down one level: the page title becomes
 * an `h2` under this page's single `h1`, and its sections follow beneath it.
 * `h6` has nowhere further to go and stays put; nothing in the content tree
 * currently nests that deeply.
 *
 * The `id` is prefixed at the same time. Headings are slugged per page, so
 * `## Prerequisites` on four different runbooks yields four elements with
 * `id="prerequisites"` once they share a document — which breaks the contents
 * list below, since every link would jump to the first one.
 */
const SHIFTED = { h1: 'h2', h2: 'h3', h3: 'h4', h4: 'h5', h5: 'h6', h6: 'h6' }

/*
 * Collapsible sections are rendered open, and as plain HTML.
 *
 * Nextra's `Details` is a client component that keeps its open state in React
 * and animates the body with a `Collapse` — a `div` held at an inline
 * `height: 0` until a click. On a docs page `print-mode.jsx` opens those on
 * `beforeprint`, but this page is also the source the book build typesets, and
 * a paged-media engine runs no `beforeprint` and dispatches no clicks. Anything
 * that depends on script to become visible is simply missing from the book.
 *
 * A bound manual has no collapsed sections anyway — there is nothing to click
 * on paper, and hiding a third of the troubleshooting page behind a control is
 * a reading-on-screen affordance, not a property of the content. So both are
 * replaced with the native elements, permanently open, no JavaScript involved.
 */
const OpenDetails = (props) => (
  <details
    {...props}
    open
    className="mt-4 border border-line p-3 [&>summary]:cursor-default"
  />
)

const PlainSummary = (props) => (
  <summary {...props} className="font-display font-book marker:content-['']" />
)

function componentsFor(slug) {
  const headings = Object.fromEntries(
    Object.entries(SHIFTED).map(([from, to]) => {
      const Heading = baseComponents[to]
      const Shifted = ({ id, ...props }) => (
        <Heading {...props} id={id ? `${slug}-${id}` : undefined} />
      )
      Shifted.displayName = `Print(${from})`
      return [from, Shifted]
    }),
  )
  return {
    ...baseComponents,
    ...headings,
    Details: OpenDetails,
    Summary: PlainSummary,
  }
}

/*
 * The docs tree, flattened into reading order.
 *
 * `normalizePages` is what the theme itself uses to turn the page map into the
 * sidebar and the prev/next pagination, so `flatDocsDirectories` is the order
 * a reader sees — `_meta.js` ordering included. Deriving the list from the
 * filesystem instead would be alphabetical, which puts "Troubleshoot" before
 * "First deployment".
 *
 * A folder with no `index.mdx` has no front matter and is skipped: it is a
 * grouping in the sidebar with no page of its own to import.
 */
async function docsPages() {
  const { flatDocsDirectories } = normalizePages({
    list: await getPageMap('/docs'),
    route: '/docs',
    docsRoot: '/docs',
  })

  const seen = new Set()
  const pages = []

  for (const item of flatDocsDirectories) {
    if (!item.route || !item.frontMatter || seen.has(item.route)) continue
    seen.add(item.route)

    const segments = item.route.replace(/^\//, '').split('/')
    const { default: MDXContent } = await importPage(segments)
    pages.push({
      route: item.route,
      slug: segments.join('-'),
      title: item.frontMatter.title ?? item.title,
      MDXContent,
    })
  }

  return pages
}

export default async function PrintPage() {
  const pages = await docsPages()

  return (
    /*
     * `.canvas` and `main#nextra-skip-nav` are both required of a hand-built
     * page — see CLAUDE.md and the skip-link test in `tests/e2e`. Tailwind
     * ships without preflight here, so without `.canvas` the padding
     * utilities below overflow their boxes.
     */
    <main
      id="nextra-skip-nav"
      data-pagefind-ignore
      className="canvas bg-surface text-fg antialiased [font-synthesis-weight:none]"
    >
      <div className="mx-auto max-w-[52rem] px-gutter py-12">
        <header className="border-b-2 border-rule pb-6">
          <p className="font-mono text-[0.68rem] tracking-head text-muted uppercase">
            BlitzeCDN — edge control plane
          </p>
          <h1 className="mt-3 font-display text-section font-book tracking-display">
            Documentation
          </h1>
          <p className="mt-4 max-w-[52ch] leading-relaxed text-muted">
            Every page of the documentation, in sidebar order, collected into
            one document. Print it or save it as a PDF; the site chrome, the
            navigation and the controls on this page are all omitted from the
            paper copy.
          </p>
          <div
            data-print-hide
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <PrintButton label="Print or save as PDF" />
            <Link
              href="/docs"
              className="x:focus-visible:nextra-focus font-mono text-[0.68rem] tracking-head text-muted uppercase underline-offset-4 transition-colors hover:text-fg hover:underline"
            >
              Back to the documentation
            </Link>
          </div>
        </header>

        {/*
          The contents list, which is also the printout's front matter — a
          bound document opens with one. It is a real `nav` landmark rather
          than a styled list because on screen it is the only way to reach a
          page in the middle of a 26-page document.
        */}
        <nav aria-labelledby="contents" className="mt-12">
          <h2
            id="contents"
            className="font-mono text-[0.68rem] tracking-head text-muted uppercase"
          >
            Contents
          </h2>
          <ol role="list" className="mt-4 grid gap-1.5">
            {pages.map((page, index) => (
              <li key={page.route} className="flex gap-3 text-[0.95rem]">
                <span
                  aria-hidden="true"
                  className="w-6 shrink-0 text-right font-mono text-[0.8rem] text-muted"
                >
                  {index + 1}
                </span>
                <a
                  href={`#${page.slug}`}
                  className="x:focus-visible:nextra-focus underline-offset-4 hover:underline"
                >
                  {page.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/*
          Each page is its own `article` with an anchor the contents list
          targets, opened by a rule that reads as a section break on paper.
          `break-before-page` is what makes a page of the manual start on a
          sheet of its own; it does nothing on screen.
        */}
        {pages.map((page) => {
          const { MDXContent } = page
          return (
            <article
              key={page.route}
              id={page.slug}
              className="mt-16 border-t-2 border-rule pt-8 print:break-before-page"
            >
              <p
                data-print-hide
                className="mb-2 font-mono text-[0.68rem] tracking-head text-muted uppercase"
              >
                <Link
                  href={page.route}
                  className="x:focus-visible:nextra-focus underline-offset-4 hover:text-fg hover:underline"
                >
                  {page.route}
                </Link>
              </p>
              <MDXContent components={componentsFor(page.slug)} />
            </article>
          )
        })}
      </div>
    </main>
  )
}
