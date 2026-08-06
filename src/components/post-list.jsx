import Link from 'next/link'
import { getPageMap } from 'nextra/page-map'
import { formatDate } from '@/lib/format-date'

/**
 * Lists every post under /blog, newest first.
 *
 * The list is derived from Nextra's page map rather than a hand-maintained
 * array, so adding an `.mdx` file to `src/content/blog/` is all it takes for a
 * post to appear here.
 */
export async function PostList() {
  const pageMap = await getPageMap('/blog')

  const posts = pageMap
    .filter((item) => item.name !== 'index' && item.route)
    .map((item) => ({
      route: item.route,
      title: item.frontMatter?.title ?? item.title ?? item.name,
      description: item.frontMatter?.description,
      author: item.frontMatter?.author,
      date: item.frontMatter?.date,
    }))
    /* Undated drafts sort last rather than throwing off the ordering. */
    .sort(
      (a, b) =>
        (b.date ? Date.parse(b.date) : -Infinity) -
        (a.date ? Date.parse(a.date) : -Infinity),
    )

  if (posts.length === 0) {
    return <p>No posts yet.</p>
  }

  return (
    <div className="mt-10 flex flex-col border-t border-line">
      {posts.map((post) => {
        const date = formatDate(post.date)
        return (
          <Link
            key={post.route}
            href={post.route}
            className="group border-b border-line py-7 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rule"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-xs tracking-[0.12em] text-rule-ink uppercase">
              {date && <time dateTime={post.date}>{date}</time>}
              {post.author && (
                <span className="tracking-normal text-muted normal-case">
                  {post.author}
                </span>
              )}
            </div>
            <h3 className="mt-2 text-2xl font-book tracking-display text-fg underline-offset-4 group-hover:underline">
              {post.title}
            </h3>
            {post.description && (
              <p className="mt-2 max-w-2xl leading-relaxed text-muted">
                {post.description}
              </p>
            )}
          </Link>
        )
      })}
    </div>
  )
}
