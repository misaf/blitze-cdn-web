import { generateStaticParamsFor, importPage } from 'nextra/pages'
import PostByline from '@/components/post-byline'
import { absoluteUrl } from '@/lib/site'
import { useMDXComponents as getMDXComponents } from '../../../mdx-components'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props) {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)

  /*
   * Every content route names itself as its own canonical.
   *
   * The root layout deliberately sets none — see the note there — because a
   * canonical declared once at the root is inherited by everything under it,
   * which pointed all of `/docs`, `/blog` and `/faq` at the homepage. This is
   * the route that knows its own path, so it is where the value belongs.
   *
   * `metadata` from the page's own front matter wins if it sets `alternates`,
   * so a page can still override this.
   */
  return {
    alternates: { canonical: absoluteUrl(`/${params.mdxPath.join('/')}`) },
    ...metadata,
  }
}

const Wrapper = getMDXComponents().wrapper

/*
 * A blog post, as opposed to the blog index or any docs page.
 *
 * `mdxPath` is the route segments, so `['blog', 'one-lock-two-halves']` is a
 * post and `['blog']` is the list. The list renders its own datelines through
 * `PostList` and must not also get a byline.
 */
function isBlogPost(mdxPath) {
  return Array.isArray(mdxPath) && mdxPath[0] === 'blog' && mdxPath.length > 1
}

/*
 * The marker that turns the production-checklist banner on.
 *
 * The banner is rendered by the root layout, which has no way to know the
 * current route — a layout receives no pathname, and this is a static export
 * so there is no middleware or request header to consult either. So the page
 * that DOES know announces itself, and `globals.css` hides the banner wherever
 * this marker is absent. See the long note in `docs-banner.jsx` for why this
 * is not simply `usePathname()` in a client component.
 *
 * `hidden` keeps it out of the accessibility tree and out of the Pagefind
 * index; it exists only to be matched by a CSS `:has()`.
 *
 * The two section attributes carry the path segments for the same reason and
 * by the same mechanism, because two other rules in `globals.css` need to know
 * the route and have no other way to learn it:
 *
 *   `data-route-section`  the top-level section. The blog runs without the
 *                         docs sidebar (see `blog/_meta.js`), which leaves its
 *                         content in a grid column sized for a sidebar that is
 *                         no longer there — so it is re-centred on its own
 *                         measure.
 *   `data-docs-section`   the subsection. Reference pages are the widest
 *                         content on the site — tables of every command, every
 *                         role variable, every record type — and are given
 *                         more room than the prose measure the guides want.
 */
function RouteMarker({ mdxPath }) {
  if (!Array.isArray(mdxPath)) return null
  const [section, subsection] = mdxPath
  return (
    <span
      {...(section === 'docs' && { 'data-docs-route': '' })}
      data-route-section={section}
      data-docs-section={subsection ?? 'index'}
      hidden
    />
  )
}

export default async function Page(props) {
  const params = await props.params
  const {
    default: MDXContent,
    toc,
    metadata,
    sourceCode,
  } = await importPage(params.mdxPath)

  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <RouteMarker mdxPath={params.mdxPath} />
      {/* Above the `h1`, because that is where the blog index puts the same
          two values — the dateline reads as the post's column head rather than
          as a footnote to the title. `metadata` is the page's front matter, so
          `date` and `author` arrive here without the post having to repeat
          them in its body. */}
      {isBlogPost(params.mdxPath) && (
        <PostByline date={metadata.date} author={metadata.author} />
      )}
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}
