import Link from 'next/link'
import { getPageMap } from 'nextra/page-map'

/*
 * Dates are formatted in UTC with a fixed locale on purpose. This site is a
 * static export, so the string is baked at build time; letting it depend on the
 * builder's timezone or locale would make the output differ between machines
 * and show up as noise in the committed build.
 */
const formatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC'
})

function formatDate(value) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : formatter.format(parsed)
}

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
    .filter(item => item.name !== 'index' && item.route)
    .map(item => ({
      route: item.route,
      title: item.frontMatter?.title ?? item.title ?? item.name,
      description: item.frontMatter?.description,
      author: item.frontMatter?.author,
      date: item.frontMatter?.date
    }))
    /* Undated drafts sort last rather than throwing off the ordering. */
    .sort((a, b) => (b.date ? Date.parse(b.date) : -Infinity) - (a.date ? Date.parse(a.date) : -Infinity))

  if (posts.length === 0) {
    return <p>No posts yet.</p>
  }

  return (
    <div className="mt-10 flex flex-col border-t border-line">
      {posts.map(post => {
        const date = post.date ? formatDate(post.date) : null
        return (
          <Link
            key={post.route}
            href={post.route}
            className="group border-b border-line py-7 no-underline"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-[0.12em] text-accent-ink">
              {date && <time dateTime={post.date}>{date}</time>}
              {post.author && (
                <span className="text-muted normal-case tracking-normal">
                  {post.author}
                </span>
              )}
            </div>
            <h3 className="mt-2 text-2xl font-book tracking-display text-fg group-hover:underline underline-offset-4">
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
