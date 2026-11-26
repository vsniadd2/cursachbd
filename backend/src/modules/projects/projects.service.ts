import type { Prisma, ProjectMemberRole, ProjectStatus } from '@prisma/client'
import { prisma, teamContext } from '../../lib/prisma.js'
import { ApiError } from '../../utils/api-error.js'
import type { createProjectSchema, updateProjectSchema, listProjectsQuerySchema } from './projects.schema.js'
import type { z } from 'zod'

const person = { id: true, firstName: true, lastName: true } as const
const closed: ProjectStatus[] = ['COMPLETED', 'CANCELLED']
const orders = {
  updated: [{ updatedAt: 'desc' }, { id: 'asc' }],
  deadline: [{ endDate: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }],
  priority: [{ priority: 'desc' }, { id: 'asc' }],
  budget: [{ budget: { sort: 'desc', nulls: 'last' } }, { id: 'asc' }],
  name: [{ name: 'asc' }, { id: 'asc' }],
} satisfies Record<string, Prisma.ProjectOrderByWithRelationInput[]>

function projectInclude() {
  return {
    client: { select: { id: true, companyName: true } },
    members: {
      where: { user: { teamId: teamContext.getStore() } },
      select: { userId: true, role: true, user: { select: { ...person, isActive: true } } },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    },
  } satisfies Prisma.ProjectInclude
}

function overdueWhere(): Prisma.ProjectWhereInput {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  return { endDate: { lt: today }, status: { notIn: closed } }
}

type ProjectQuery = z.infer<typeof listProjectsQuerySchema>
export async function listProjects(filters: ProjectQuery, includeProgress: boolean) {
  const include = projectInclude()
  const where: Prisma.ProjectWhereInput = {
    status: filters.status,
    clientId: filters.clientId,
    AND: filters.overdue ? [overdueWhere()] : undefined,
    members: filters.leadId
      ? { some: { role: 'OWNER', userId: filters.leadId, user: { teamId: teamContext.getStore() } } }
      : undefined,
    OR: filters.q
      ? [
          { name: { contains: filters.q, mode: 'insensitive' } },
          { client: { companyName: { contains: filters.q, mode: 'insensitive' } } },
        ]
      : undefined,
  }
  const page = filters.page ?? 1
  const limit = filters.limit ?? 20
  const paged = filters.page !== undefined || filters.limit !== undefined
  const orderBy = orders[filters.sort ?? 'updated']
  if (!paged) {
    const items = await prisma.project.findMany({ where, orderBy, include: { client: include.client } })
    return { items }
  }
  const [projects, total] = await prisma.$transaction(
    [
      prisma.project.findMany({
        where,
        orderBy,
        include: {
          ...include,
          members: { ...include.members, where: { ...include.members.where, role: 'OWNER' }, take: 1 },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ],
    { isolationLevel: 'RepeatableRead' },
  )
  const progress = new Map<string, { done: number; total: number }>()
  if (includeProgress && projects.length) {
    const counts = await prisma.task.groupBy({
      by: ['projectId', 'status'],
      where: { projectId: { in: projects.map((p) => p.id) }, status: { not: 'CANCELLED' } },
      _count: { _all: true },
    })
    for (const { projectId, status, _count } of counts) {
      const current = progress.get(projectId) ?? { done: 0, total: 0 }
      current.total += _count._all
      if (status === 'DONE') current.done = _count._all
      progress.set(projectId, current)
    }
  }
  const items = projects.map(({ members, ...project }) => ({
    ...project,
    lead: members[0]?.user ?? null,
    taskProgress: includeProgress ? (progress.get(project.id) ?? { done: 0, total: 0 }) : undefined,
  }))
  return { items, page, limit, total }
}

export async function summarizeProjects(clientId?: string) {
  const countsByStatus = prisma.project.groupBy({
    by: ['status'],
    where: { clientId },
    _count: { _all: true },
  })
  const [statuses, overdue] = await prisma.$transaction(
    [countsByStatus, prisma.project.count({ where: { clientId, ...overdueWhere() } })],
    { isolationLevel: 'RepeatableRead' },
  )
  const counts = Object.fromEntries(statuses.map(({ status, _count }) => [status, _count._all]))
  return {
    total: statuses.reduce((total, row) => total + row._count._all, 0),
    active: counts.ACTIVE ?? 0,
    completed: counts.COMPLETED ?? 0,
    overdue,
  }
}

export async function getProject(id: string) {
  const project = await prisma.project.findUnique({ where: { id }, include: projectInclude() })
  if (!project) throw new ApiError(404, 'Project not found')
  return project
}

// Serialize project edits and invoice linking so checks and writes use the same client and dates.
export async function lockProject(tx: Prisma.TransactionClient, id: string) {
  const teamId = teamContext.getStore()
  if (!teamId) throw new ApiError(403, 'Join a team to continue')
  const [row] = await tx.$queryRaw<{ clientId: string }[]>`
    SELECT "clientId" FROM "Project"
    WHERE "id" = ${id}::uuid AND "teamId" = ${teamId}::uuid
    FOR UPDATE
  `
  return row
}

function dates(start: string | null, end: string | null) {
  if (start && end && end < start)
    throw new ApiError(400, 'Project deadline must be on or after the start date')
}

function dateValue(value?: string | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : value
}

async function recordChange(
  tx: Prisma.TransactionClient,
  userId: string,
  projectId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN',
  metadata?: Prisma.InputJsonObject,
) {
  await tx.activityLog.create({
    data: { userId, entityId: projectId, entityType: 'Project', action, metadata },
  })
}

export async function createProject(input: z.infer<typeof createProjectSchema>, actor: string) {
  const { startDate, endDate, ...data } = input
  dates(startDate ?? null, endDate ?? null)
  return prisma.$transaction(async (tx) => {
    const item = await tx.project.create({
      data: { ...data, startDate: dateValue(startDate), endDate: dateValue(endDate) },
      include: projectInclude(),
    })
    await recordChange(tx, actor, item.id, 'CREATE')
    return item
  })
}

export async function updateProject(id: string, input: z.infer<typeof updateProjectSchema>, actor: string) {
  const { startDate, endDate, ...data } = input
  const include = projectInclude()
  return prisma.$transaction(async (tx) => {
    if (!(await lockProject(tx, id))) throw new ApiError(404, 'Project not found')
    const current = await tx.project.findUniqueOrThrow({ where: { id }, include })
    dates(
      startDate === undefined ? (current.startDate?.toISOString().slice(0, 10) ?? null) : startDate,
      endDate === undefined ? (current.endDate?.toISOString().slice(0, 10) ?? null) : endDate,
    )
    const patch = { ...data, startDate: dateValue(startDate), endDate: dateValue(endDate) }
    const fields = (Object.keys(patch) as (keyof typeof patch)[]).filter(
      (key) => patch[key] !== undefined && String(patch[key]) !== String(current[key]),
    )
    if (!fields.length) return current
    if (fields.includes('clientId') && (await tx.invoice.count({ where: { projectId: id } }))) {
      throw new ApiError(409, 'Client cannot be changed while the project has linked invoices')
    }
    const item = await tx.project.update({ where: { id }, data: patch, include })
    await recordChange(tx, actor, id, 'UPDATE', {
      fields,
      ...(fields.includes('status') ? { fromStatus: current.status, toStatus: item.status } : {}),
    })
    return item
  })
}

export async function setProjectMember(
  id: string,
  userId: string,
  role: ProjectMemberRole | null,
  actor: string,
) {
  return prisma.$transaction(async (tx) => {
    if (!(await lockProject(tx, id))) throw new ApiError(404, 'Project not found')
    const user = await tx.user.findUnique({ where: { id: userId }, select: { ...person, isActive: true } })
    if (!user) throw new ApiError(404, 'Team member not found')
    const previous = await tx.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } },
    })
    if ((previous?.role ?? null) === role) return
    if (role && !user.isActive) throw new ApiError(400, 'Only active team members can be assigned')
    if (role === 'OWNER') {
      const owner = await tx.projectMember.findFirst({ where: { projectId: id, role: 'OWNER' } })
      if (owner) {
        await tx.projectMember.update({ where: { id: owner.id }, data: { role: 'MANAGER' } })
      }
    }
    if (role) {
      await tx.projectMember.upsert({
        where: { projectId_userId: { projectId: id, userId } },
        create: { projectId: id, userId, role },
        update: { role },
      })
    } else if (previous) {
      await tx.projectMember.delete({ where: { id: previous.id } })
    }
    await tx.project.update({ where: { id }, data: { updatedAt: new Date() } })
    await recordChange(tx, actor, id, 'ASSIGN', {
      member: `${user.firstName} ${user.lastName}`.trim(),
      fromRole: previous?.role ?? null,
      toRole: role,
    })
  })
}

export async function listProjectHistory(id: string) {
  if (!(await prisma.project.findUnique({ where: { id }, select: { id: true } }))) {
    throw new ApiError(404, 'Project not found')
  }
  return prisma.activityLog.findMany({
    where: { entityType: 'Project', entityId: id },
    select: { id: true, action: true, metadata: true, createdAt: true, user: { select: person } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 50,
  })
}

export async function deleteProject(id: string, actor: string) {
  await prisma.$transaction(async (tx) => {
    if (!(await lockProject(tx, id))) throw new ApiError(404, 'Project not found')
    if (
      (await tx.task.count({ where: { projectId: id } })) ||
      (await tx.invoice.count({ where: { projectId: id } }))
    ) {
      throw new ApiError(409, 'Remove linked tasks and invoices first')
    }
    await tx.project.delete({ where: { id } })
    await recordChange(tx, actor, id, 'DELETE')
  })
}
