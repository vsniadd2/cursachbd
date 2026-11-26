import { test, expect } from '@playwright/test'

test('demo sign-in reports service errors and opens the workspace after recovery', async ({ page }) => {
  const endpoint = '**/api/v1/auth/login'
  await page.goto('/login')
  const demo = page.getByRole('button', { name: 'Войти с демо-аккаунтом' })
  await page.route(endpoint, (route) => route.fulfill({ status: 503, json: { success: false } }))
  await demo.click()
  await expect(page.getByRole('alert')).toHaveText('Сервис входа временно недоступен. Попробуйте ещё раз.')
  await page.unroute(endpoint)

  await page.route(endpoint, (route) => route.fulfill({ status: 401, json: { success: false } }))
  await demo.click()
  await expect(page.getByRole('alert')).toHaveText('Демо-аккаунт недоступен на этом сервере.')
  await page.unroute(endpoint)

  await demo.click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: 'Обзор бизнеса' })).toBeVisible()
})

test('business registration, personal registration, join by code and auth layouts', async ({
  page,
  request,
}) => {
  const stamp = Date.now(),
    businessEmail = `test-onboarding-business-${stamp}@example.test`,
    personalEmail = `test-onboarding-personal-${stamp}@example.test`
  await page.goto('/register', { waitUntil: 'domcontentloaded' })
  await page.locator('#businessName').fill(`Studio ${stamp}`)
  await page.locator('#firstName').fill('Owner')
  await page.locator('#lastName').fill('Test')
  await page.locator('#email').fill(businessEmail)
  await page.locator('#password').fill('Strong123!')
  await page.screenshot({ path: 'test-results/register-desktop.png', fullPage: true, animations: 'disabled' })
  await page.locator('form button[type=submit]').click()
  await expect(page).toHaveURL(/dashboard/)
  const auth = (
    await (
      await request.post('/api/v1/auth/login', { data: { email: businessEmail, password: 'Strong123!' } })
    ).json()
  ).data
  expect(auth.user.role.name).toBe('ADMIN')
  expect(auth.user.teamId).toBeTruthy()
  const headers = { Authorization: `Bearer ${auth.accessToken}` }
  const clients = await (await request.get('/api/v1/clients', { headers })).json()
  expect(clients.data.items).toHaveLength(0)
  const invite = (await (await request.post('/api/v1/invites', { headers, data: { type: 'LINK' } })).json())
    .data
  await page.evaluate(() => localStorage.clear())
  await page.goto('/register', { waitUntil: 'domcontentloaded' })
  await page.getByRole('radio', { name: /Личный аккаунт/ }).check()
  await expect(page.locator('#businessName')).toHaveCount(0)
  await page.locator('#firstName').fill('Person')
  await page.locator('#lastName').fill('Test')
  await page.locator('#email').fill(personalEmail)
  await page.locator('#password').fill('Strong123!')
  await page.locator('form button[type=submit]').click()
  await expect(page).toHaveURL(/join-team/)
  await page.getByLabel('Код или ссылка приглашения').fill('NOTACODE10')
  await page.getByRole('button', { name: 'Присоединиться к команде' }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await page.getByLabel('Код или ссылка приглашения').fill(invite.inviteCode)
  await page.getByRole('button', { name: 'Присоединиться к команде' }).click()
  await expect(page).toHaveURL(/dashboard/)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Обзор бизнеса' })).toBeVisible()
  await page.evaluate(() => localStorage.clear())
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'test-results/login-mobile.png', fullPage: true, animations: 'disabled' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(
    await page.locator('.auth-atmosphere-light').evaluate((e) => getComputedStyle(e).animationName),
  ).toBe('none')
})
