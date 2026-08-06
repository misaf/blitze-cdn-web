import { generateStaticParamsFor, importPage } from 'nextra/pages'
import PostByline from '@/components/post-byline'
import { useMDXComponents as getMDXComponents } from '../../../mdx-components'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props) {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)
  return metadata
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
