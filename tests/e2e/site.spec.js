import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/*
 * Every route is listed with the `h1` it must render. This list had drifted
 * out of sync with the content tree — it still named `/docs/contributing` and
 * removed routes and old headings, so three of eleven tests could not pass and
 * the suite stopped being run. Two real landmark bugs shipped behind that red.
 *
 * If you delete or rename a page, this array is the other half of the change.
 */
const routes = [
  ['/', 'Every rule is written down twice'],
  ['/docs', 'BlitzeCDN'],
  ['/about', 'Two people, one narrow tool'],
  ['/contact', 'Where to send what'],
  ['/faq', 'Frequently asked questions'],
  ['/blog', 'Blog'],
  ['/docs/operate', 'Operate BlitzeCDN'],
  ['/docs/operate/lifecycle', 'Install, rebuild, and remove'],
  ['/docs/operate/first-deployment', 'First deployment'],
  ['/docs/operate/deploy', 'Deploying'],
  ['/docs/operate/edges', 'Manage edge servers'],
  ['/docs/operate/backup-restore', 'Back up and restore'],
  ['/docs/operate/troubleshooting', 'Troubleshooting'],
  ['/docs/understand', 'Understand BlitzeCDN'],
  ['/docs/understand/architecture', 'Architecture'],
  ['/docs/understand/control-plane', 'Control plane'],
  ['/docs/understand/domain-model', 'Domain and data model'],
  ['/docs/understand/edge-infrastructure', 'Edges and Ansible'],
  ['/docs/understand/dns-tls', 'DNS and TLS'],
  ['/docs/understand/cache-observability', 'Cache and observability'],
  ['/docs/understand/storage-state', 'Storage and state'],
  ['/docs/understand/glossary', 'Glossary'],
  ['/docs/reference', 'Reference'],
  ['/docs/reference/cli', 'CLI'],
  ['/docs/reference/records', 'Domains'],
  ['/docs/reference/ansible', 'Ansible roles and variables'],
  ['/docs/operate/go-live', 'Take a real site live'],
  ['/docs/operate/dns', 'DNS hand-off'],
  ['/docs/operate/incident-response', 'Incident response'],
]

/* Routes written by hand in `src/app/`, bypassing the Nextra docs layout. */
const HAND_BUILT_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/this-page-does-not-exist',
]

for (const [route, heading] of routes) {
  test(`${route} renders and has no detectable accessibility violations`, async ({
    page,
  }) => {
    await page.goto(route)

    await expect(page.locator('h1').first()).toContainText(heading)
    await expect(page).toHaveTitle(/BlitzeCDN/)

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
}

/*
 * Landmark coverage, checked only on the routes this repository writes by
 * hand.
 *
 * axe's `region` rule ("all page content should be contained by landmarks") is
 * what catches a page with no `<main>` — but it lives under `best-practice`,
 * not WCAG, which is why the missing landmark on `/`, `/about` and `/contact`
 * went unnoticed. It cannot simply be added to the tag list above: on the
 * Nextra-rendered docs routes it fires on the theme's own breadcrumbs,
 * pagination and TOC markup, which is not ours to fix. A suite that can never
 * go green is a suite nobody runs — that is the whole reason this file had
 * drifted. So the rule is applied where it is actionable.
 */
for (const route of HAND_BUILT_ROUTES) {
  test(`${route} keeps all content inside landmarks`, async ({ page }) => {
    await page.goto(route)

    const results = await new AxeBuilder({ page })
      .withRules(['region'])
      .analyze()

    expect(results.violations).toEqual([])
  })
}

/*
 * The hand-built routes bypass Nextra's page layout, so they have to supply
 * the landmark its "Skip to Content" link targets themselves. Asserted
 * directly rather than left to axe: the failure mode is silent, and it breaks
 * the first control on the page.
 *
 * The last entry is any unmatched path, which renders `app/not-found.jsx`.
 */
for (const route of HAND_BUILT_ROUTES) {
  test(`${route} has a main landmark the skip link can reach`, async ({
    page,
  }) => {
    await page.goto(route)

    const main = page.locator('main#nextra-skip-nav')
    await expect(main).toHaveCount(1)

    const skipLink = page.getByRole('link', { name: /skip to content/i })
    await expect(skipLink).toHaveAttribute('href', '#nextra-skip-nav')
  })
}

test('the 404 page offers a route back into the site', async ({ page }) => {
  await page.goto('/this-page-does-not-exist')

  await expect(page.locator('h1').first()).toContainText('does not exist')
  await expect(
    page.getByRole('link', { name: /Documentation — start here/ }),
  ).toBeVisible()
})

/*
 * There is exactly one theme control, and it is reachable everywhere.
 *
 * Nextra's own switcher is disabled (`darkMode={false}` in `app/layout.jsx`)
 * because two controls for one setting made users hesitate, and the sidebar
 * one could not be reached on the hand-built routes at narrow widths. But that
 * flag also removes the switcher from Nextra's *mobile* menu, so the navbar
 * toggle has to carry the whole job — including on a phone. This runs under
 * both the desktop and mobile Playwright projects.
 */
test('the theme control is present and reachable', async ({ page }) => {
  await page.goto('/docs')

  const toggle = page.getByRole('button', { name: /theme/i })
  await expect(toggle).toHaveCount(1)
  await expect(toggle).toBeVisible()

  /* Three states, and System must be reachable again after leaving it —
     the two-state toggle this replaced could never return to it. */
  const html = page.locator('html')
  await toggle.click()
  await expect(html).toHaveAttribute('class', /light/)
  await toggle.click()
  await expect(html).toHaveAttribute('class', /dark/)
  await toggle.click()
  await expect(toggle).toHaveAccessibleName(/follow system/i)
})

test('primary documentation navigation works', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Read the docs' }).click()
  await expect(page).toHaveURL(/\/docs(?:\.html|\/)?$/)
  await expect(page.locator('h1').first()).toContainText('BlitzeCDN')
})

test('documentation tables use the compact ledger treatment', async ({
  page,
}) => {
  await page.goto('/docs')

  const table = page.locator('main table').first()
  const heading = table.locator('th').first()
  await expect(table).toBeVisible()
  await expect(table).toHaveCSS('border-top-style', 'solid')
  await expect(table).toHaveCSS('border-top-width', '2px')
  await expect(heading).toHaveCSS('text-transform', 'uppercase')
  await expect(heading).toHaveCSS('font-family', /IBM Plex Mono/)
  await expect(heading).toHaveCSS('padding-top', '7.2px')
  await expect(table.locator('td').first()).toHaveCSS('font-size', '14px')
  await expect(table.locator('td').first()).toHaveCSS(
    'border-left-width',
    '2px',
  )
})

test('RSS feed is available', async ({ request }) => {
  const response = await request.get('/feed.xml')
  expect(response.ok()).toBeTruthy()
  expect(response.headers()['content-type']).toMatch(
    /application\/(?:rss\+xml|xml)/,
  )
  expect(await response.text()).toContain('<title>BlitzeCDN blog</title>')
})
