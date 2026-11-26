import { AsyncLocalStorage } from 'node:async_hooks'
import { PrismaClient } from '@prisma/client'
import { env } from '../config/env.js'
import { ApiError } from '../utils/api-error.js'
export const teamContext = new AsyncLocalStorage<string>()
export const rawPrisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})
const models = new Set([
  'User',
  'Role',
  'CustomPermission',
  'Department',
  'TeamInvite',
  'Client',
  'Project',
  'Task',
  'Invoice',
  'WorkspaceItem',
])
const references: Record<string, Record<string, string>> = {
  User: { roleId: 'role', departmentId: 'department', managerId: 'user' },
  Department: { parentId: 'department' },
  Project: { clientId: 'client' },
  Task: { projectId: 'project', assigneeId: 'user' },
  Invoice: { clientId: 'client', projectId: 'project' },
  TeamInvite: { roleId: 'role', departmentId: 'department', createdById: 'user', provisionedUserId: 'user' },
  WorkspaceItem: { ownerId: 'user' },
}
export const prisma = rawPrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const teamId = teamContext.getStore()
        if (!teamId || !models.has(model)) return query(args)
        const input = args as {
          where?: Record<string, unknown>
          data?: Record<string, unknown> | Record<string, unknown>[]
          create?: Record<string, unknown>
          update?: Record<string, unknown>
        }
        if (
          'where' in input ||
          [
            'findMany',
            'findFirst',
            'findUnique',
            'findUniqueOrThrow',
            'findFirstOrThrow',
            'count',
            'aggregate',
            'groupBy',
            'update',
            'updateMany',
            'delete',
            'deleteMany',
            'upsert',
          ].includes(operation)
        )
          input.where = { ...input.where, teamId }
        const records = [
          ...(Array.isArray(input.data) ? input.data : input.data ? [input.data] : []),
          ...(input.create ? [input.create] : []),
          ...(input.update ? [input.update] : []),
        ]
        for (const data of records) {
          if ('teamId' in data && data.teamId !== teamId) throw new ApiError(403, 'Team cannot be changed')
          data.teamId = teamId
          for (const [field, target] of Object.entries(references[model] ?? {}))
            if (typeof data[field] === 'string') {
              const delegate = (
                rawPrisma as unknown as Record<string, { findFirst: (args: unknown) => Promise<unknown> }>
              )[target]
              if (!(await delegate.findFirst({ where: { id: data[field], teamId } })))
                throw new ApiError(400, 'Linked record must belong to your team')
            }
        }
        return query(args)
      },
    },
  },
}) as unknown as PrismaClient
