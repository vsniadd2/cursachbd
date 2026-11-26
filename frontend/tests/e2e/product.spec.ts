import { test, expect, type Page } from '@playwright/test'
const suffix = Date.now().toString(),
  company = `Browser ${suffix}`,
  project = `Project ${suffix}`,
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
  page.setDefaultTimeout(12000)
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
    const customer = page.getByRole('row').filter({ hasText: company })
    await customer.getByRole('link', { name: 'Проекты' }).click()
    await expect(page).toHaveURL(/\/projects\?clientId=/)
    await page.getByRole('button', { name: 'Новый проект' }).click()
    const form = page.getByRole('dialog', { name: 'Новый проект' })
    await expect(form.getByLabel('Клиент').locator('option:checked')).toHaveText(company)
    await form.getByLabel('Название проекта').fill(project)
    await form.getByLabel('Плановый бюджет (USD)').fill('123.45')
    await form.getByLabel('Дата начала').fill('2026-11-01')
    await form.getByLabel('Срок проекта').fill('2026-12-31')
    await form.getByRole('button', { name: 'Сохранить' }).click()
    await expect(page.getByRole('heading', { name: project })).toBeVisible()
    await page.getByRole('button', { name: 'Редактировать' }).click()
    const edit = page.getByRole('dialog', { name: 'Редактировать проект' })
    await edit.getByLabel('Описание', { exact: true }).fill('План миграции клиентского портала')
    await edit.getByRole('button', { name: 'Сохранить' }).click()
    await expect(page.getByText('План миграции клиентского портала', { exact: true })).toBeVisible()
    await page.getByRole('link', { name: 'Все проекты' }).click()
    await page.getByLabel('Сортировка проектов').selectOption('budget')
    await expect(page).toHaveURL(/sort=budget/)
    await page.getByRole('button', { name: 'Доска' }).click()
    const stage = page.getByRole('combobox', { name: `Статус проекта ${project}`, exact: true })
    await stage.selectOption('ACTIVE')
    await expect(page.getByRole('status')).toHaveText('Статус проекта обновлён')
    await expect(stage).toHaveValue('ACTIVE')
    await page.reload()
    await expect(stage).toHaveValue('ACTIVE')
    await page.getByRole('link', { name: project, exact: true }).click()
    await page.getByRole('link', { name: 'Команда', exact: true }).last().click()
    await page.getByLabel('Сотрудник', { exact: true }).selectOption(auth.user.id)
    await page.getByLabel('Роль в проекте', { exact: true }).selectOption('OWNER')
    await page.getByRole('button', { name: 'Добавить', exact: true }).click()
    await expect(page.getByRole('status')).toHaveText('Команда проекта обновлена')
    await page.getByRole('link', { name: 'Задачи', exact: true }).last().click()
    await page.getByRole('button', { name: 'Новая задача' }).click()
    const taskForm = page.getByRole('dialog', { name: 'Новая задача' })
    await taskForm.getByLabel('Название задачи').fill(task)
    await taskForm.getByLabel('Срок').fill('2026-12-31')
    await taskForm.getByLabel('Исполнитель').selectOption(auth.user.id)
    await taskForm.getByRole('button', { name: 'Сохранить' }).click()
    await page.getByRole('combobox', { name: `Статус задачи ${task}` }).selectOption('DONE')
    await expect(page.getByRole('status')).toHaveText('Задача сохранена')
    await page.reload()
    await expect(page.getByRole('combobox', { name: `Статус задачи ${task}` })).toHaveValue('DONE')
    await page.getByRole('link', { name: 'Обзор', exact: true }).click()
    await expect(page.getByRole('progressbar', { name: 'Выполнено задач' })).toHaveAttribute('value', '1')
    await page.getByRole('link', { name: 'История', exact: true }).click()
    await expect(page.getByText('Проект создан', { exact: true })).toBeVisible()
    await expect(page.getByText('Роль в проекте обновлена')).toBeVisible()
    const projectUrl = new URL(page.url()).pathname
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('link', { name: 'Обзор', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Ход работ' })).toBeVisible()
    await expect(page.getByRole('progressbar')).toBeVisible()
    expect(
      await page.locator('main').evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBeTruthy()
    await page.screenshot({ path: 'test-results/project-mobile.png', animations: 'disabled' })
    await page.setViewportSize({ width: 1440, height: 900 })
    await create(
      page,
      '/revenue',
      { 'Номер счёта': `B-${suffix}`, Сумма: '25.50' },
      { Клиент: company, Проект: project, Статус: 'PAID' },
    )
    await page.goto(`${projectUrl}?tab=invoices`)
    await expect(page.getByText(`B-${suffix}`, { exact: true })).toBeVisible()
    await page.screenshot({ path: 'test-results/project-desktop.png', animations: 'disabled' })
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: 'Обзор бизнеса' })).toBeVisible()
    const dl = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Экспорт CSV' }).click()
    expect((await dl).suggestedFilename()).toBe('summary.csv')
    await page.screenshot({
      path: 'test-results/dashboard-desktop.png',
      fullPage: true,
      animations: 'disabled',
    })
    expect(errors).toEqual([])
  } finally {
    for (const [resource, field, value] of [
      ['invoices', 'invoiceNumber', `B-${suffix}`],
      ['tasks', 'title', task],
      ['projects', 'name', project],
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
      'projects',
      'tasks',
      'projects?view=board',
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
test('workspace navigation, notifications and projects recover on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await login(page)
  await expect(page.getByRole('heading', { name: 'Обзор бизнеса' })).toBeVisible()
  await expect(page.getByRole('link').filter({ hasText: 'Бюджет открытых проектов (USD)' })).toBeVisible()
  await page.screenshot({ path: 'test-results/workspace-mobile.png', animations: 'disabled' })
  const routeContent = page.locator('.workspace-route')
  await expect(routeContent).toHaveCSS('animation-name', 'workspace-fade')

  const menu = page.getByRole('button', { name: 'Открыть меню' })
  const drawer = page.getByRole('dialog', { name: 'Навигация' })
  await menu.click()
  await expect(drawer.getByRole('button', { name: 'Закрыть меню' })).toBeFocused()
  await expect(drawer).toHaveCSS('animation-name', 'workspace-slide')
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
  await expect(menu).toBeFocused()

  const bell = page.getByRole('button', { name: 'Уведомления' })
  await bell.click()
  const notifications = page.getByRole('region', { name: 'Уведомления' })
  await expect(notifications).toBeVisible()
  const bounds = await notifications.boundingBox()
  if (!bounds) throw new Error('Notifications panel has no visible bounds')
  expect(bounds.x).toBeGreaterThanOrEqual(0)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320)
  await page.keyboard.press('Escape')
  await expect(notifications).toHaveCount(0)
  await expect(bell).toBeFocused()

  await page.route(/\/api\/v1\/projects\?/, (route) =>
    route.fulfill({ status: 503, json: { error: 'Projects unavailable' } }),
  )
  await menu.click()
  await drawer.getByRole('link', { name: 'Проекты' }).click()
  await expect(drawer).toHaveCount(0)
  await expect(page.getByRole('alert')).toContainText('Projects unavailable')
  await expect(page.locator('main h3')).toHaveCount(0)
  await page.unroute(/\/api\/v1\/projects\?/)
  await page.getByRole('button', { name: 'Повторить' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await page.getByRole('button', { name: 'Доска' }).click()
  await expect(page.locator('main h3')).toHaveCount(5)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(routeContent).toHaveCSS('animation-name', 'none')
  await menu.click()
  await expect(drawer).toHaveCSS('animation-name', 'none')
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(drawer).toHaveCount(0)
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
