import { test } from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { randomUUID } from 'node:crypto'
import { createApp } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

test('CRM lifecycle, validation, access control, sessions, invitations and automation', async () => {
  const server = createApp().listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('No server')
  const base = `http://127.0.0.1:${address.port}/api/v1`,
    suffix = randomUUID().slice(0, 8)
  const ids: Record<string, string[]> = {
    clients: [],
    projects: [],
    tasks: [],
    invoices: [],
    users: [],
    invites: [],
    workspace: [],
    roles: [],
    departments: [],
  }
  let count = 0
  async function req(method: string, path: string, body?: unknown, token?: string, expected = 200) {
    const response = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
    const data = response.status === 204 ? null : await response.json()
    assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(data)}`)
    count++
    return data?.data
  }
  try {
    await req('GET', '/health')
    await req('GET', '/clients', undefined, undefined, 401)
    await req('POST', '/auth/login', { email: 'admin@flexora.local', password: 'wrong' }, undefined, 401)
    const admin = await req('POST', '/auth/login', { email: 'admin@flexora.local', password: 'admin123' })
    const token = admin.accessToken
    const email = `test-${suffix}@example.test`
    const initialInvite = await req('POST', '/invites', { type: 'LINK' }, token, 201)
    ids.invites.push(initialInvite.invite.id)
    const employee = await req(
      'POST',
      '/auth/register',
      {
        email,
        password: 'Example123!',
        firstName: 'Test',
        lastName: suffix,
        inviteToken: initialInvite.inviteToken,
      },
      undefined,
      201,
    )
    ids.users.push(employee.user.id)
    await req('POST', '/clients', { companyName: 'Forbidden' }, employee.accessToken, 403)
    await req('GET', '/invoices', undefined, employee.accessToken, 403)
    await req('POST', '/clients', { companyName: '   ' }, token, 400)
    await req('GET', '/clients/not-a-uuid', undefined, token, 400)
    await req('GET', '/not-real', undefined, token, 404)
    const client = (
      await req(
        'POST',
        '/clients',
        { companyName: `Test ${suffix}`, status: 'LEAD', email: 'test@example.test' },
        token,
        201,
      )
    ).item
    ids.clients.push(client.id)
    await req('PATCH', `/clients/${client.id}`, { status: 'ACTIVE' }, token)
    const project = (
      await req(
        'POST',
        '/projects',
        {
          clientId: client.id,
          name: `Project ${suffix}`,
          budget: 123.45,
          startDate: '2000-01-01',
          endDate: '2000-02-01',
        },
        token,
        201,
      )
    ).item
    ids.projects.push(project.id)
    const projectPath = `/projects/${project.id}`
    await req('PATCH', projectPath, { startDate: '2000-03-01' }, token, 400)
    await req('PATCH', projectPath, { budget: 1.234 }, token, 400)
    await req(
      'PUT',
      `${projectPath}/members/${employee.user.id}`,
      { role: 'OWNER' },
      employee.accessToken,
      403,
    )
    await req('PUT', `${projectPath}/members/${employee.user.id}`, { role: 'OWNER' }, token, 204)
    const projectDetail = (await req('GET', projectPath, undefined, token)).item
    assert.equal(projectDetail.members[0].userId, employee.user.id)
    assert.equal(projectDetail.startDate.slice(0, 10), '2000-01-01')
    assert.equal((await req('GET', `/projects/summary?clientId=${client.id}`, undefined, token)).overdue, 1)
    await req('DELETE', `/clients/${client.id}`, undefined, token, 409)
    const rule = (
      await req(
        'POST',
        '/workspace',
        { kind: 'AUTOMATION', title: `Rule ${suffix}`, status: 'ACTIVE' },
        token,
        201,
      )
    ).item
    ids.workspace.push(rule.id)
    const task = (
      await req(
        'POST',
        '/tasks',
        {
          projectId: project.id,
          title: 'Integration task',
          assigneeId: employee.user.id,
          dueDate: '2026-12-31T12:00:00Z',
        },
        token,
        201,
      )
    ).item
    ids.tasks.push(task.id)
    assert.equal(task.assignee.id, employee.user.id)
    const taskPath = `/tasks/${task.id}`
    const initialInbox = await req('GET', '/notifications', undefined, employee.accessToken)
    assert.equal(initialInbox.unreadCount, 1)
    const assignment = initialInbox.items[0]
    assert.equal(assignment.type, 'TASK_ASSIGNED')
    assert.equal(assignment.entityId, task.id)
    assert.equal(assignment.task.project.id, project.id)
    await req('PATCH', `/notifications/${assignment.id}/read`, {}, token, 404)
    await req('PATCH', taskPath, { assigneeId: employee.user.id }, token)
    await req('PATCH', `/tasks/${task.id}`, { status: 'DONE' }, employee.accessToken)
    assert.equal((await req('GET', '/notifications', undefined, employee.accessToken)).unreadCount, 1)
    const projectPage = await req(
      'GET',
      `/projects?clientId=${client.id}&leadId=${employee.user.id}&overdue=true&page=1&limit=1`,
      undefined,
      token,
    )
    assert.equal(projectPage.total, 1)
    assert.deepEqual(projectPage.items[0].taskProgress, { done: 1, total: 1 })
    const history = (await req('GET', `${projectPath}/history`, undefined, token)).items
    assert.deepEqual(
      history.map((row: { action: string }) => row.action),
      ['ASSIGN', 'CREATE'],
    )
    const competingDates = await Promise.all(
      [{ startDate: '2000-01-25' }, { endDate: '2000-01-20' }].map((dates) =>
        fetch(base + projectPath, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(dates),
        }),
      ),
    )
    assert.deepEqual(competingDates.map((result) => result.status).sort(), [200, 400])
    await req('PUT', `${projectPath}/members/${admin.user.id}`, { role: 'OWNER' }, token, 204)
    const { members } = (await req('GET', projectPath, undefined, token)).item
    assert.equal(members.length, 2)
    assert.equal(members[0].userId, admin.user.id)
    assert.equal(members[1].role, 'MANAGER')
    const notifications = (await req('GET', '/notifications', undefined, token)).items
    const notice = notifications.find((n: { entityId: string }) => n.entityId === task.id)
    assert.ok(notice, 'Automation must create an actual notification')
    assert.equal(notice.type, 'TASK')
    await req('PATCH', `/notifications/${notice.id}/read`, {}, token)
    await req('PATCH', taskPath, { assigneeId: null }, token)
    await Promise.all([
      req('PATCH', taskPath, { assigneeId: employee.user.id }, token),
      req('PATCH', taskPath, { assigneeId: employee.user.id }, token),
    ])
    assert.equal((await req('GET', '/notifications', undefined, employee.accessToken)).unreadCount, 2)
    await req('PATCH', `/notifications/${assignment.id}/read`, {}, employee.accessToken)
    await req('PATCH', `/notifications/${assignment.id}/read`, {}, employee.accessToken)
    assert.equal((await req('GET', '/notifications', undefined, employee.accessToken)).unreadCount, 1)
    await req('PATCH', '/notifications/read-all', {}, employee.accessToken)
    assert.equal((await req('GET', '/notifications', undefined, employee.accessToken)).unreadCount, 0)
    const invoice = (
      await req(
        'POST',
        '/invoices',
        {
          clientId: client.id,
          projectId: project.id,
          invoiceNumber: `T-${suffix}`,
          amount: 100.25,
          currency: 'USD',
          status: 'SENT',
        },
        token,
        201,
      )
    ).item
    ids.invoices.push(invoice.id)
    assert.equal(
      (await req('GET', `/invoices?projectId=${project.id}`, undefined, token)).items[0].id,
      invoice.id,
    )
    const otherClient = (await req('POST', '/clients', { companyName: `Alternate ${suffix}` }, token, 201))
      .item
    ids.clients.push(otherClient.id)
    await req('PATCH', projectPath, { clientId: otherClient.id }, token, 409)
    await req(
      'POST',
      '/invoices',
      { clientId: client.id, invoiceNumber: `T-${suffix}`, amount: 10, currency: 'USD' },
      token,
      409,
    )
    await req(
      'POST',
      '/invoices',
      { clientId: client.id, invoiceNumber: 'negative', amount: -1, currency: 'USD' },
      token,
      400,
    )
    const paid = (await req('PATCH', `/invoices/${invoice.id}`, { status: 'PAID' }, token)).item
    assert.ok(paid.paidAt)
    await req('DELETE', `/projects/${project.id}`, undefined, token, 409)

    const dept = await req('POST', '/departments', { name: `Department ${suffix}` }, token, 201)
    ids.departments.push(dept.id)
    const child = await req(
      'POST',
      '/departments',
      { name: `Child ${suffix}`, parentId: dept.id },
      token,
      201,
    )
    ids.departments.push(child.id)
    await req('PATCH', `/departments/${dept.id}`, { parentId: child.id }, token, 400)
    await req('DELETE', `/departments/${dept.id}`, undefined, token, 409)
    await req('PATCH', `/departments/${child.id}`, { name: `Renamed ${suffix}` }, token)
    await req('DELETE', `/departments/${child.id}`, undefined, token, 204)
    await req('DELETE', `/departments/${dept.id}`, undefined, token, 204)
    ids.departments = []
    const malformed = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    })
    assert.equal(malformed.status, 400)
    count++
    const emailInvite = await req(
      'POST',
      '/invites',
      { type: 'EMAIL', email: `someone-${suffix}@example.test` },
      token,
      201,
    )
    ids.invites.push(emailInvite.invite.id)
    await req('POST', '/invites/accept', { token: emailInvite.inviteToken }, employee.accessToken, 403)
    await req('DELETE', `/invites/${emailInvite.invite.id}`, undefined, token)
    await req('POST', '/invites/accept', { token: emailInvite.inviteToken }, employee.accessToken, 400)
    const before = await prisma.client.count({ where: { companyName: `Valid ${suffix}` } })
    await req(
      'POST',
      '/clients/import',
      { items: [{ companyName: `Valid ${suffix}` }, { companyName: '' }] },
      token,
      400,
    )
    assert.equal(
      await prisma.client.count({ where: { companyName: `Valid ${suffix}` } }),
      before,
      'Import must not partially save',
    )
    const role = await req(
      'POST',
      '/roles',
      { name: `TEST_${suffix.toUpperCase()}`, permissions: ['clients:read'] },
      token,
      201,
    )
    ids.roles.push(role.id)
    await req('PATCH', `/users/${employee.user.id}`, { roleId: role.id }, token)
    await req('PATCH', `/tasks/${task.id}`, { status: 'TODO' }, employee.accessToken, 403)
    await req('PATCH', `/users/${employee.user.id}`, { isActive: false }, token)
    await req('GET', '/clients', undefined, employee.accessToken, 401)
    await req('PATCH', `/users/${employee.user.id}`, { isActive: true }, token)
    const refreshes = await Promise.all([
      fetch(base + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: employee.refreshToken }),
      }),
      fetch(base + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: employee.refreshToken }),
      }),
    ])
    assert.deepEqual(refreshes.map((r) => r.status).sort(), [200, 401])
    count += 2
    const refreshed = (await refreshes.find((r) => r.status === 200)!.json()).data
    await req('POST', '/auth/logout', { refreshToken: refreshed.refreshToken })
    await req('POST', '/auth/refresh', { refreshToken: refreshed.refreshToken }, undefined, 401)
    const link = await req('POST', '/invites', { type: 'LINK', roleId: role.id }, token, 201)
    ids.invites.push(link.invite.id)
    const joined = await req(
      'POST',
      '/auth/register',
      {
        email: `joined-${suffix}@example.test`,
        password: 'Example123!',
        firstName: 'Joined',
        lastName: 'Test',
        inviteToken: link.inviteToken,
      },
      undefined,
      201,
    )
    ids.users.push(joined.user.id)
    assert.equal(joined.user.role.id, role.id)
    await req('POST', '/invites/accept', { token: link.inviteToken }, employee.accessToken, 400)
    const feedback = (
      await req(
        'POST',
        '/workspace',
        { kind: 'FEEDBACK', title: `Feedback ${suffix}`, body: 'Persist this' },
        employee.accessToken,
        201,
      )
    ).item
    ids.workspace.push(feedback.id)
    assert.ok(
      (await req('GET', '/workspace?kind=FEEDBACK', undefined, employee.accessToken)).items.some(
        (i: { id: string }) => i.id === feedback.id,
      ),
    )
    await req(
      'PATCH',
      '/auth/me',
      { currentPassword: 'Example123!', newPassword: 'Changed123!' },
      employee.accessToken,
    )
    await req('POST', '/auth/login', { email, password: 'Example123!' }, undefined, 401)
    await req('POST', '/auth/login', { email, password: 'Changed123!' })
    await req('DELETE', `/invoices/${invoice.id}`, undefined, token, 204)
    ids.invoices = []
    await req('DELETE', `/tasks/${task.id}`, undefined, token, 204)
    ids.tasks = []
    await req('DELETE', `/projects/${project.id}`, undefined, token, 204)
    ids.projects = []
    await req('DELETE', `/clients/${client.id}`, undefined, token, 204)
    await req('DELETE', `/clients/${otherClient.id}`, undefined, token, 204)
    ids.clients = []
    console.log(`Passed ${count} HTTP checks plus persistence, financial date and concurrency assertions`)
  } finally {
    await prisma.notification.deleteMany({
      where: { OR: [{ entityId: { in: ids.tasks } }, { title: `Rule ${suffix}` }] },
    })
    await prisma.task.deleteMany({ where: { id: { in: ids.tasks } } })
    await prisma.invoice.deleteMany({ where: { id: { in: ids.invoices } } })
    await prisma.project.deleteMany({ where: { id: { in: ids.projects } } })
    await prisma.client.deleteMany({ where: { id: { in: ids.clients } } })
    await prisma.workspaceItem.deleteMany({ where: { id: { in: ids.workspace } } })
    await prisma.teamInvite.deleteMany({ where: { id: { in: ids.invites } } })
    await prisma.user.deleteMany({ where: { id: { in: ids.users } } })
    await prisma.department.deleteMany({ where: { id: { in: ids.departments } } })
    await prisma.role.deleteMany({ where: { id: { in: ids.roles } } })
    await new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())))
    await prisma.$disconnect()
  }
})
