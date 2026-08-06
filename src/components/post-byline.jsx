import { formatDate, isoDate } from '@/lib/format-date'

/**
 * The date and author line on a blog post.
 *
 * Set as a column head above the title, which is exactly how the blog index
 * presents the same two values — a reader arriving from the list sees the
 * dateline in the same place and the same face.
 *
 * Renders nothing without a date. An author alone is not a byline worth the
 * space, and a post with neither should look deliberately plain rather than
 * carry an empty rule.
 */
export default function PostByline({ date, author }) {
  const formatted = formatDate(date)
  if (!formatted) return null

  return (
    <p className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.7rem] tracking-head uppercase">
      <time dateTime={isoDate(date)} className="text-rule-ink">
        {formatted}
      </time>
      {author && <span className="text-gray-600">{author}</span>}
    </p>
  )
}
