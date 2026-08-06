/*
 * Dates are formatted in UTC with a fixed locale on purpose. This site is a
 * static export, so the string is baked at build time; letting it depend on the
 * builder's timezone or locale would make the output differ between machines
 * and show up as noise in the committed build.
 *
 * Shared by the blog index (`post-list.jsx`) and the byline on a post itself.
 * They used to be the same logic in one place and no logic at all in the other,
 * which is how posts ended up dated on the list and undated when you read them.
 */
const formatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/** Returns the formatted date, or `null` for a missing or unparseable value. */
export function formatDate(value) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : formatter.format(parsed)
}

/**
 * The machine-readable form for `<time dateTime>`. Falls back to the raw value
 * when it is already an ISO-ish string, and to `undefined` when there is
 * nothing usable — an empty `dateTime` is worse than none.
 */
export function isoDate(value) {
  if (!value) return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? undefined
    : parsed.toISOString().slice(0, 10)
}
