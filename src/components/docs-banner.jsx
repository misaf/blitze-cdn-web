'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Banner } from 'nextra/components'

/*
 * The production-checklist banner, shown only under /docs.
 *
 * It used to render on every route, which put an operations warning above the
 * `h1` on the landing page — before a first-time visitor knows what the
 * product is, and where the same checklist is already linked twice further
 * down. Under /docs the reader is plausibly about to do the thing it warns
 * about.
 *
 * `storageKey` is deliberately stable. It was previously date-stamped
 * (`production-checklist-2026-08`), so editing that string silently
 * un-dismissed the banner for everyone who had already dismissed it. Change it
 * only when the message changes enough that a previous dismissal should not
 * carry over.
 */
export default function DocsBanner() {
  const pathname = usePathname()

  if (!pathname?.startsWith('/docs')) return null

  return (
    <Banner storageKey="production-checklist">
      Before changing production edges, review the{' '}
      <Link href="/docs/guides/deployment">deployment checklist →</Link>
    </Banner>
  )
}
