import { test } from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { randomUUID } from 'node:crypto'
import { createApp } from '../src/app.js'
import { rawPrisma as db } from '../src/lib/prisma.js'
test('business isolation, personal onboarding, single-use team codes', async () => {
  const server = createApp().listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw Error('No server')
  const base = `http://127.0.0.1:${address.port}/api/v1`,
    suffix = randomUUID(),
    teams: string[] = [],
    users: string[] = []
  async function call(method: string, path: string, body?: unknown, token?: string, status = 200) {
    const r = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    const json = r.status === 204 ? {} : await r.json()
    assert.equal(r.status, status, `${method} ${path}: ${JSON.stringify(json)}`)
    return json.data
  }
  async function account(name: string, business: boolean) {
    const data = await call(
      'POST',
      '/auth/register',
      {
        email: `${name}-${suffix}@example.test`,
        password: 'Strong123!',
        firstName: name,
        lastName: 'Test',
        accountType: business ? 'BUSINESS' : 'PERSONAL',
        ...(business ? { businessName: name } : {}),
      },
      undefined,
      201,
    )
    users.push(data.user.id)
    if (data.user.teamId) teams.push(data.user.teamId)
    return data
  }
  try {
    const a = await account('Alpha', true),
      b = await account('Beta', true),
      person = await account('Person', false)
    assert.notEqual(a.user.teamId, b.user.teamId)
    assert.equal(person.user.teamId, null)
    assert.equal(a.user.role.name, 'ADMIN')
    assert.equal((await call('GET', '/clients', undefined, a.accessToken)).items.length, 0)
    const client = (await call('POST', '/clients', { companyName: 'Private Alpha' }, a.accessToken, 201)).item
    assert.equal((await call('GET', '/clients', undefined, b.accessToken)).items.length, 0)
    await call('GET', `/clients/${client.id}`, undefined, b.accessToken, 404)
    await call('PATCH', `/clients/${client.id}`, { companyName: 'Attack' }, b.accessToken, 404)
    await call('DELETE', `/clients/${client.id}`, undefined, b.accessToken, 404)
    await call('POST', '/projects', { name: 'Bad reference', clientId: client.id }, b.accessToken, 400)
    await call('PATCH', `/users/${b.user.id}`, { roleId: a.user.role.id }, b.accessToken, 400)
    await call('GET', '/clients', undefined, person.accessToken, 403)
    await call('POST', '/teams/join', { code: 'NOTACODE10' }, person.accessToken, 400)
    const invite = await call('POST', '/invites', { type: 'LINK' }, a.accessToken, 201)
    assert.match(invite.inviteCode, /^[A-F0-9]{10}$/)
    await call('POST', '/teams/join', { code: invite.inviteCode }, b.accessToken, 409)
    await call('POST', '/teams/join', { code: invite.inviteCode }, person.accessToken)
    const me = await call('GET', '/auth/me', undefined, person.accessToken)
    assert.equal(me.user.teamId, a.user.teamId)
    assert.equal((await call('GET', '/clients', undefined, person.accessToken)).items.length, 1)
    await call('POST', '/teams/join', { code: invite.inviteCode }, person.accessToken, 400)
    await call('POST', '/clients', { companyName: 'No permission' }, person.accessToken, 403)
  } finally {
    await db.teamInvite.deleteMany({ where: { teamId: { in: teams } } })
    await db.client.deleteMany({ where: { teamId: { in: teams } } })
    await db.user.deleteMany({ where: { id: { in: users } } })
    await db.role.deleteMany({ where: { teamId: { in: teams } } })
    await db.team.deleteMany({ where: { id: { in: teams } } })
    await new Promise<void>((resolve) => server.close(() => resolve()))
    await db.$disconnect()
  }
})
