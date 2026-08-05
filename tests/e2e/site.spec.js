import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const routes = [
  ['/', 'The control plane for your Nginx edge'],
  ['/docs', 'BlitzeCDN'],
  ['/about', 'Two people, one narrow tool'],
  ['/contact', 'Where to send what'],
  ['/faq', 'Frequently asked questions'],
  ['/blog', 'Blog'],
  ['/docs/reference', 'Reference compatibility'],
  ['/docs/guides/quickstart', 'Quick start'],
  ['/docs/guides/upgrading', 'Upgrading'],
  ['/docs/guides/incidents', 'Incident response'],
  ['/docs/contributing', 'Contributing'],
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

test('primary documentation navigation works', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Read the docs' }).click()
  await expect(page).toHaveURL(/\/docs(?:\.html|\/)?$/)
  await expect(page.locator('h1').first()).toContainText('BlitzeCDN')
})

test('RSS feed is available', async ({ request }) => {
  const response = await request.get('/feed.xml')
  expect(response.ok()).toBeTruthy()
  expect(response.headers()['content-type']).toMatch(
    /application\/(?:rss\+xml|xml)/,
  )
  expect(await response.text()).toContain('<title>BlitzeCDN blog</title>')
})
