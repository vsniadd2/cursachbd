import { Router } from 'express'
import { healthRouter } from '../../modules/health/health.routes.js'
import { authRouter } from '../../modules/auth/auth.routes.js'
import { clientsRouter } from '../../modules/clients/clients.routes.js'
import { projectsRouter } from '../../modules/projects/projects.routes.js'
import { tasksRouter } from '../../modules/tasks/tasks.routes.js'
import { invoicesRouter } from '../../modules/invoices/invoices.routes.js'
import { usersRouter } from '../../modules/users/users.routes.js'
import { rolesRouter } from '../../modules/roles/roles.routes.js'
import { departmentsRouter } from '../../modules/departments/departments.routes.js'
import { notificationsRouter } from '../../modules/notifications/notifications.routes.js'
import { invitesRouter } from '../../modules/invites/invites.routes.js'
import { permissionsRouter } from '../../modules/permissions/permissions.routes.js'

export const v1Router = Router()

v1Router.use('/health', healthRouter)
v1Router.use('/auth', authRouter)
v1Router.use('/clients', clientsRouter)
v1Router.use('/projects', projectsRouter)
v1Router.use('/tasks', tasksRouter)
v1Router.use('/invoices', invoicesRouter)
v1Router.use('/users', usersRouter)
v1Router.use('/roles', rolesRouter)
v1Router.use('/departments', departmentsRouter)
v1Router.use('/notifications', notificationsRouter)
v1Router.use('/invites', invitesRouter)
v1Router.use('/permissions', permissionsRouter)
