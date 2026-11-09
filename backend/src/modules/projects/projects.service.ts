import type { ProjectStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { ApiError } from '../../utils/api-error.js'
import type { createProjectSchema, updateProjectSchema } from './projects.schema.js'
import type { z } from 'zod'

export async function listProjects(filters: { status?: ProjectStatus; clientId?: string }) {
  return prisma.project.findMany({
    where: {
      status: filters.status,
      clientId: filters.clientId,
    },
    include: { client: { select: { id: true, companyName: true } } },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function updateProject(id: string, data: z.infer<typeof updateProjectSchema>) {
  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, 'Project not found')
  return prisma.project.update({
    where: { id },
    data: {
      ...data,
      budget: data.budget !== undefined ? data.budget : undefined,
    },
    include: { client: { select: { id: true, companyName: true } } },
  })
}

export async function createProject(data: z.infer<typeof createProjectSchema>) {
  return prisma.project.create({
    data: {
      ...data,
      budget: data.budget,
    },
    include: { client: { select: { id: true, companyName: true } } },
  })
}
