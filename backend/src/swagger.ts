import { z } from 'zod'
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  updateProfileSchema,
} from './modules/auth/auth.schema.js'
import {
  createClientSchema,
  updateClientSchema,
  listClientsQuerySchema,
} from './modules/clients/clients.schema.js'
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
} from './modules/projects/projects.schema.js'
import { createTaskSchema, updateTaskSchema, listTasksQuerySchema } from './modules/tasks/tasks.schema.js'
import { invoiceBodySchema } from './modules/invoices/invoices.routes.js'
import { workspaceBodySchema } from './modules/workspace/workspace.routes.js'

type Operation = {
  method: string
  path: string
  summary: string
  body?: z.ZodType
  query?: z.ZodObject
  public?: boolean
  status?: number
}
const operations: Operation[] = [
  { method: 'get', path: '/health', summary: 'Database readiness', public: true },
  {
    method: 'post',
    path: '/auth/register',
    summary: 'Register in the shared team or accept an invite',
    body: registerSchema,
    public: true,
    status: 201,
  },
  { method: 'post', path: '/auth/login', summary: 'Login', body: loginSchema, public: true },
  {
    method: 'post',
    path: '/auth/refresh',
    summary: 'Rotate a single-use refresh token',
    body: refreshSchema,
    public: true,
  },
  { method: 'post', path: '/auth/logout', summary: 'Revoke refresh token', body: logoutSchema, public: true },
  { method: 'get', path: '/auth/me', summary: 'Current user' },
  {
    method: 'patch',
    path: '/auth/me',
    summary: 'Update profile, verify current password',
    body: updateProfileSchema,
  },
]
for (const [resource, create, update, query] of [
  ['clients', createClientSchema, updateClientSchema, listClientsQuerySchema],
  ['projects', createProjectSchema, updateProjectSchema, listProjectsQuerySchema],
  ['tasks', createTaskSchema, updateTaskSchema, listTasksQuerySchema],
  ['invoices', invoiceBodySchema, invoiceBodySchema.partial(), undefined],
] as const) {
  operations.push(
    { method: 'get', path: `/${resource}`, summary: `List ${resource} (requires ${resource}:read)`, query },
    {
      method: 'post',
      path: `/${resource}`,
      summary: `Create ${resource} (requires ${resource}:write)`,
      body: create,
      status: 201,
    },
    {
      method: 'patch',
      path: `/${resource}/{id}`,
      summary: `Update ${resource} (requires ${resource}:write)`,
      body: update,
    },
    {
      method: 'delete',
      path: `/${resource}/{id}`,
      summary: `Delete ${resource}; linked records return 409`,
      status: 204,
    },
  )
}
operations.push(
  { method: 'get', path: '/clients/{id}', summary: 'Get client' },
  {
    method: 'post',
    path: '/clients/import',
    summary: 'Atomic JSON client import, maximum 500 records',
    body: z.object({ items: z.array(createClientSchema).min(1).max(500) }),
    status: 201,
  },
  {
    method: 'get',
    path: '/workspace',
    summary: 'List workspace records; feedback is personal',
    query: z.object({ kind: z.enum(['CAMPAIGN', 'EMAIL', 'AUTOMATION', 'FEEDBACK']) }),
  },
  {
    method: 'post',
    path: '/workspace',
    summary: 'Create campaign, draft, task notification rule or feedback',
    body: workspaceBodySchema,
    status: 201,
  },
  {
    method: 'patch',
    path: '/workspace/{id}',
    summary: 'Update workspace item',
    body: workspaceBodySchema.omit({ kind: true }).partial(),
  },
  { method: 'delete', path: '/workspace/{id}', summary: 'Delete workspace item', status: 204 },
  { method: 'get', path: '/notifications', summary: 'Current user notifications' },
  { method: 'patch', path: '/notifications/{id}/read', summary: 'Mark own notification read' },
  {
    method: 'get',
    path: '/users',
    summary: 'List active team users',
    query: z.object({ query: z.string().optional(), kind: z.enum(['email', 'publicCode']).optional() }),
  },
  {
    method: 'patch',
    path: '/users/{id}',
    summary: 'Update role, department, manager, activity or extra permissions',
    body: z.object({
      roleId: z.string().uuid().optional(),
      departmentId: z.string().uuid().nullable().optional(),
      managerId: z.string().uuid().nullable().optional(),
      isActive: z.boolean().optional(),
      extraPermissions: z.array(z.string()).optional(),
    }),
  },
  { method: 'get', path: '/roles', summary: 'List roles' },
  {
    method: 'post',
    path: '/roles',
    summary: 'Create role',
    body: z.object({
      name: z.string(),
      description: z.string().optional(),
      permissions: z.array(z.string()),
    }),
    status: 201,
  },
  {
    method: 'patch',
    path: '/roles/{id}',
    summary: 'Update role',
    body: z.object({ description: z.string().optional(), permissions: z.array(z.string()).optional() }),
  },
  { method: 'delete', path: '/roles/{id}', summary: 'Delete unused non-system role' },
  { method: 'get', path: '/departments', summary: 'List departments' },
  {
    method: 'post',
    path: '/departments',
    summary: 'Create department',
    body: z.object({ name: z.string(), parentId: z.string().uuid().nullable().optional() }),
    status: 201,
  },
  {
    method: 'patch',
    path: '/departments/{id}',
    summary: 'Edit department, prevent cycles',
    body: z.object({ name: z.string().optional(), parentId: z.string().uuid().nullable().optional() }),
  },
  { method: 'delete', path: '/departments/{id}', summary: 'Delete empty department', status: 204 },
  {
    method: 'patch',
    path: '/departments/users/{id}',
    summary: 'Assign user department',
    body: z.object({ departmentId: z.string().uuid().nullable() }),
  },
  { method: 'get', path: '/invites', summary: 'List team invitations' },
  {
    method: 'post',
    path: '/invites',
    summary: 'Create invitation; email delivery is not connected',
    body: z.object({
      type: z.enum(['LINK', 'EMAIL', 'PUBLIC_CODE', 'TEMP_ACCOUNT']),
      roleId: z.string().uuid().optional(),
      departmentId: z.string().uuid().nullable().optional(),
      email: z.string().email().optional(),
      publicCode: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      password: z.string().optional(),
      extraPermissions: z.array(z.string()).optional(),
    }),
    status: 201,
  },
  {
    method: 'post',
    path: '/invites/accept',
    summary: 'Accept invitation once, with email and expiration checks',
    body: z.object({ token: z.string().uuid() }),
  },
  { method: 'delete', path: '/invites/{id}', summary: 'Cancel pending invitation' },
  { method: 'get', path: '/permissions/catalog', summary: 'Built-in and custom permission catalog' },
  {
    method: 'post',
    path: '/permissions/custom',
    summary: 'Create custom permission',
    body: z.object({ slug: z.string(), label: z.string(), description: z.string().optional() }),
    status: 201,
  },
  { method: 'delete', path: '/permissions/custom/{id}', summary: 'Delete custom permission' },
)
operations.push({
  method: 'post',
  path: '/teams/join',
  summary: 'Join a team with a single-use invitation code or token',
  body: z.object({ code: z.string().min(8).max(100) }),
})
const paths: Record<string, Record<string, unknown>> = {}
for (const operation of operations) {
  const parameters: unknown[] = [...operation.path.matchAll(/\{(\w+)\}/g)].map((match) => ({
    name: match[1],
    in: 'path',
    required: true,
    schema: { type: 'string', format: 'uuid' },
  }))
  if (operation.query)
    for (const [name, schema] of Object.entries(operation.query.shape) as [string, z.ZodType][])
      parameters.push({
        name,
        in: 'query',
        required: !schema.isOptional(),
        schema: z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' }),
      })
  const endpoint = {
    summary: operation.summary,
    tags: [operation.path.split('/')[1]],
    security: operation.public ? [] : [{ bearerAuth: [] }],
    parameters,
    ...(operation.body
      ? {
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: z.toJSONSchema(operation.body, { io: 'input', unrepresentable: 'any' }),
              },
            },
          },
        }
      : {}),
    responses: {
      [operation.status ?? 200]: { description: 'Success' },
      400: { description: 'Invalid input' },
      401: { description: 'Authentication required or session expired' },
      403: { description: 'Insufficient permissions' },
      404: { description: 'Record not found' },
      409: { description: 'Conflict or linked records' },
    },
  }
  ;(paths[operation.path] ??= {})[operation.method] = endpoint
}
export const swaggerSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Flexora API',
    version: '1.1.0',
    description:
      'Local single-team CRM. Shared data with role-based permissions. Campaigns and email drafts do not send external messages.',
  },
  servers: [{ url: '/api/v1' }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  paths,
}
