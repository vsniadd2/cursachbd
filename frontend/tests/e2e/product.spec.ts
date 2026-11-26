import { test, expect, type Page } from '@playwright/test'
const suffix = Date.now().toString(),
  company = `Browser ${suffix}`,
  deal = `Deal ${suffix}`,
  task = `Task ${suffix}`
async function login(page: Page) {
  await page.goto('/login')
  await page.locator('#email').fill('admin@flexora.local')
  await page.locator('#password').fill('admin123')
  await page.locator('form button[type=submit]').click()
  await expect(page).toHaveURL(/dashboard/)
}
async function create(
  page: Page,
  path: string,
  fields: Record<string, string>,
  selects: Record<string, string> = {},
) {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('button', { name: 'Создать', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Создать', exact: true }).click()
  for (const [label, value] of Object.entries(fields))
    await page.getByLabel(label, { exact: true }).fill(value)
  for (const [label, value] of Object.entries(selects))
    await page.getByLabel(label, { exact: true }).selectOption({ label: value })
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Сохранено')
}
test('browser CRM workflow and persistence', async ({ page, request }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await login(page)
  await page.evaluate(() => localStorage.removeItem('flexora_access_token'))
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Обзор бизнеса' })).toBeVisible()

  const auth = (
    await (
      await request.post('/api/v1/auth/login', {
        data: { email: 'admin@flexora.local', password: 'admin123' },
      })
    ).json()
  ).data
  const headers = { Authorization: `Bearer ${auth.accessToken}` }
  try {
    await create(page, '/leads', {
      Компания: company,
      'Контактное лицо': 'Browser Tester',
      Email: 'browser@example.test',
    })
    await page.getByRole('row').filter({ hasText: company }).getByRole('button', { name: 'Изменить' }).click()
    await page.getByLabel('Статус', { exact: true }).selectOption('ACTIVE')
    await page.getByRole('button', { name: 'Сохранить', exact: true }).click()
    await expect(page.getByRole('status')).toHaveText('Сохранено')
    await page.goto('/customers')
    await expect(page.getByRole('row').filter({ hasText: company })).toBeVisible()
    await create(page, '/deals', { 'Название сделки': deal, 'Бюджет (USD)': '123.45' }, { Клиент: company })
    await create(page, '/tasks', { Задача: task, Срок: '2026-12-31' }, { Сделка: deal })
    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: task })).toBeVisible()
    await create(
      page,
      '/revenue',
      { 'Номер счёта': `B-${suffix}`, Сумма: '25.50' },
      { Клиент: company, Сделка: deal, Статус: 'PAID' },
    )
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: 'Обзор бизнеса' })).toBeVisible()
    const dl = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Экспорт CSV' }).click()
    expect((await dl).suggestedFilename()).toBe('summary.csv')
    await page.screenshot({ path: 'test-results/dashboard-desktop.png', fullPage: true })
    expect(errors).toEqual([])
  } finally {
    for (const [resource, field, value] of [
      ['invoices', 'invoiceNumber', `B-${suffix}`],
      ['tasks', 'title', task],
      ['projects', 'name', deal],
      ['clients', 'companyName', company],
    ]) {
      const items = (await (await request.get(`/api/v1/${resource}`, { headers })).json()).data.items
      for (const item of items.filter((r: Record<string, string>) => r[field] === value))
        await request.delete(`/api/v1/${resource}/${item.id}`, { headers })
    }
  }
})
test('all sections render on desktop and mobile; network errors are visible', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await login(page)
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 })
    for (const path of [
      'dashboard',
      'leads',
      'customers',
      'deals',
      'tasks',
      'pipeline',
      'analytics',
      'revenue',
      'reports',
      'forecast',
      'automation',
      'campaigns',
      'email-marketing',
      'integrations',
      'team',
      'roles',
      'roles?tab=groups',
      'roles?tab=subgroups',
      'roles?tab=invites',
      'settings',
      'pricing',
      'feedback',
      'help',
    ]) {
      await page.goto('/' + path, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('main')).not.toBeEmpty()
      await expect(page.getByRole('alert')).toHaveCount(0)
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBeTruthy()
    }
  }
  await page.goto('/leads')
  await page.route('**/api/v1/clients', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, error: 'Service unavailable' }),
    }),
  )
  await page.getByRole('button', { name: 'Обновить', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Service unavailable')
  expect(errors).toEqual([])
  await page.screenshot({ path: 'test-results/mobile-error.png', fullPage: true })
})
test('campaigns, drafts, rules, feedback and JSON exchange persist', async ({ page, request }) => {
  await login(page)
  const auth = (
    await (
      await request.post('/api/v1/auth/login', {
        data: { email: 'admin@flexora.local', password: 'admin123' },
      })
    ).json()
  ).data
  const headers = { Authorization: `Bearer ${auth.accessToken}` },
    label = `Workspace ${Date.now()}`
  try {
    for (const path of ['campaigns', 'email-marketing', 'automation', 'feedback']) {
      await page.goto('/' + path, { waitUntil: 'domcontentloaded' })
      await page.locator('main form input').fill(`${label} ${path}`)
      await page.locator('main form textarea').fill('Persistent content')
      await page.locator('main form button[type=submit], main form button:not([type])').first().click()
      await expect(page.getByRole('status')).toHaveText('Сохранено в базе')
      await page.reload({ waitUntil: 'domcontentloaded' })
      await expect(page.locator('article').filter({ hasText: `${label} ${path}` })).toBeVisible()
    }
    await page.goto('/integrations', { waitUntil: 'domcontentloaded' })
    await page.locator('input[type=file]').setInputFiles({
      name: 'clients.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify([{ companyName: label, status: 'LEAD' }])),
    })
    await expect(page.getByRole('status')).toContainText('Импортировано записей: 1')
    await page.goto('/leads', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('row').filter({ hasText: label })).toBeVisible()
    await page.evaluate(() => {
      localStorage.setItem('flexora.locale', 'en')
    })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: 'Create', exact: true })).toBeVisible()
  } finally {
    for (const kind of ['CAMPAIGN', 'EMAIL', 'AUTOMATION', 'FEEDBACK']) {
      const items = (await (await request.get(`/api/v1/workspace?kind=${kind}`, { headers })).json()).data
        .items
      for (const item of items.filter((r: { title: string }) => r.title.startsWith(label)))
        await request.delete(`/api/v1/workspace/${item.id}`, { headers })
    }
    const clients = (await (await request.get('/api/v1/clients', { headers })).json()).data.items
    for (const item of clients.filter((r: { companyName: string }) => r.companyName === label))
      await request.delete(`/api/v1/clients/${item.id}`, { headers })
  }
})

test('role management and department editing are reachable and persistent', async ({ page, request }) => {
  await login(page)
  const role = `BROWSER_${Date.now()}`,
    department = `Department ${Date.now()}`
  const auth = (
    await (
      await request.post('/api/v1/auth/login', {
        data: { email: 'admin@flexora.local', password: 'admin123' },
      })
    ).json()
  ).data
  const headers = { Authorization: `Bearer ${auth.accessToken}` }
  try {
    await page.goto('/roles?tab=groups', { waitUntil: 'domcontentloaded' })
    await page.getByPlaceholder('CUSTOM_SALES').fill(role)
    await page.getByRole('button', { name: 'Создать группу', exact: true }).click()
    await expect(page.locator('article').filter({ hasText: role })).toBeVisible()
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('article').filter({ hasText: role })).toBeVisible()
    await page.goto('/roles?tab=subgroups', { waitUntil: 'domcontentloaded' })
    await page.locator('#subgroup-name').fill(department)
    await page.getByRole('button', { name: 'Создать подгруппу', exact: true }).click()
    await expect(page.locator('main')).toContainText(department)
    await page.getByRole('button', { name: 'Изменить', exact: true }).last().click()
    await page.locator('#subgroup-name').fill(department + ' edited')
    await page.getByRole('button', { name: 'Сохранить', exact: true }).click()
    await expect(page.locator('main')).toContainText(department + ' edited')
  } finally {
    for (const [resource, field, value] of [
      ['departments', 'name', department + ' edited'],
      ['departments', 'name', department],
      ['roles', 'name', role],
    ]) {
      const items = (await (await request.get(`/api/v1/${resource}`, { headers })).json()).data.items
      for (const item of items.filter((r: Record<string, string>) => r[field] === value))
        await request.delete(`/api/v1/${resource}/${item.id}`, { headers })
    }
  }
})
