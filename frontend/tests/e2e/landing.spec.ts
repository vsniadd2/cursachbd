import { test, expect } from '@playwright/test'
test('public landing, mobile navigation, FAQ, locale and onboarding links', async ({ page, request }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Всё получается.')
  await page.screenshot({ path: 'test-results/landing-desktop.png', animations: 'disabled' })
  await page.screenshot({ path: 'test-results/landing-full.png', fullPage: true, animations: 'disabled' })
  await page.locator('#faq summary').first().click()
  await expect(page.locator('#faq details').first()).toHaveAttribute('open', '')
  await page.locator('#start a[href*="account=personal"]').click()
  await expect(page.getByRole('radio', { name: /Личный аккаунт/ })).toBeChecked()
  await expect(page.locator('#businessName')).toHaveCount(0)
  await page.goto('/')
  await page.locator('.fx-header-cta').click()
  await expect(page).toHaveURL(/register/)
  await expect(page.locator('#businessName')).toBeVisible()
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
    await page.getByRole('button', { name: 'Меню', exact: true }).click()
    await expect(page.locator('#fx-mobile-nav')).toBeVisible()
    await page.locator('#fx-mobile-nav a[href="#features"]').click()
    await expect(page.locator('#fx-mobile-nav')).toHaveCount(0)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.screenshot({ path: 'test-results/landing-mobile.png', animations: 'disabled' })
  await page.evaluate(() => localStorage.setItem('flexora.locale', 'en'))
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Make more happen.')
  const auth = (
    await (
      await request.post('/api/v1/auth/login', {
        data: { email: 'admin@flexora.local', password: 'admin123' },
      })
    ).json()
  ).data
  await page.evaluate((tokens) => {
    localStorage.setItem('flexora_access_token', tokens.accessToken)
    localStorage.setItem('flexora_refresh_token', tokens.refreshToken)
  }, auth)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Make more happen.')
  await expect(page.locator('.fx-login')).toHaveText('My CRM')
  expect(errors).toEqual([])
})

test('scroll reveals and chart drawing run on entry and respect reduced motion', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const root = page.locator('.fx-landing'),
    heroLight = page.locator('.fx-hero-wrap .fx-atmosphere'),
    productLight = page.locator('.fx-product-stage .fx-atmosphere'),
    chart = page.locator('.fx-preview-overview'),
    line = chart.locator('.fx-chart-line')
  await expect(root).toHaveClass(/fx-motion-ready/)
  await expect(heroLight).toHaveAttribute('data-fx-flow', '')
  await expect(productLight).not.toHaveAttribute('data-fx-flow', '')
  const firstPosition = await heroLight.evaluate((element) => getComputedStyle(element, '::before').transform)
  await expect
    .poll(() => heroLight.evaluate((element) => getComputedStyle(element, '::before').transform))
    .not.toBe(firstPosition)
  await expect(chart).not.toHaveAttribute('data-fx-play', 'true')
  expect(await line.evaluate((e) => Number.parseFloat(getComputedStyle(e).strokeDashoffset))).toBe(1)
  await chart.scrollIntoViewIfNeeded()
  await expect(chart).toHaveAttribute('data-fx-play', 'true')
  await expect(heroLight).not.toHaveAttribute('data-fx-flow', '')
  await expect(productLight).toHaveAttribute('data-fx-flow', '')
  await expect
    .poll(() => line.evaluate((e) => Number.parseFloat(getComputedStyle(e).strokeDashoffset)))
    .toBe(0)
  await expect(page.locator('.fx-product-stage')).toHaveAttribute('data-fx-visible', 'true')
  await page.locator('#faq').scrollIntoViewIfNeeded()
  await chart.scrollIntoViewIfNeeded()
  expect(await line.evaluate((e) => e.getAnimations().filter((a) => a.playState === 'running').length)).toBe(
    0,
  )
  for (const mode of ['pipeline', 'tasks', 'team']) {
    const preview = page.locator(`.fx-preview-${mode}`)
    await preview.scrollIntoViewIfNeeded()
    await expect(preview).toHaveAttribute('data-fx-play', 'true')
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(root).not.toHaveClass(/fx-motion-ready/)
  await expect(productLight).not.toHaveAttribute('data-fx-flow', '')
  expect(await productLight.evaluate((element) => getComputedStyle(element, '::before').animationName)).toBe(
    'none',
  )
  expect(await line.evaluate((e) => e.getAnimations().length)).toBe(0)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('#product').scrollIntoViewIfNeeded()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  expect(errors).toEqual([])
})

test('landing stays readable without IntersectionObserver', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'IntersectionObserver', { value: undefined, configurable: true })
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.locator('#product').scrollIntoViewIfNeeded()
  await expect(page.locator('.fx-landing')).not.toHaveClass(/fx-motion-ready/)
  expect(await page.locator('.fx-product-stage').evaluate((e) => getComputedStyle(e).opacity)).toBe('1')
})
