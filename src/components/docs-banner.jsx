import Link from 'next/link'
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
 *
 * ---------------------------------------------------------------------------
 * This is a SERVER component, and has to stay one.
 *
 * It was previously `'use client'` so it could call `usePathname()` for the
 * /docs gating. That broke two things:
 *
 * 1. `Banner` renders an inline `<script>` that reads `localStorage` and hides
 *    the banner before first paint. React never executes a script tag rendered
 *    by a client component — which is exactly what the console warning says —
 *    so that code was dead.
 * 2. Worse, a client-rendered banner is absent from the server HTML entirely.
 *    It only appeared after hydration, pushing the rest of the page down as it
 *    arrived.
 *
 * The route gating happens in CSS instead: `[...mdxPath]/page.jsx` emits a
 * `data-docs-route` marker on docs pages only, and `globals.css` hides the
 * banner on any page that does not carry one. Both halves are in the server
 * HTML, so the banner is already correct on the first frame.
 */
export default function DocsBanner() {
  return (
    <Banner storageKey="production-checklist">
      Before changing production edges, review the{' '}
      <Link href="/docs/operate/deploy">deployment checklist →</Link>
    </Banner>
  )
}
