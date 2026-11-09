import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const ROLES = [
  {
    name: 'ADMIN',
    description: 'Full system access',
    permissions: ['*'],
  },
  {
    name: 'MANAGER',
    description: 'Manage projects, clients, and teams',
    permissions: [
      'clients:read',
      'clients:write',
      'projects:read',
      'projects:write',
      'tasks:read',
      'tasks:write',
      'invoices:read',
      'invoices:write',
      'users:read',
    ],
  },
  {
    name: 'EMPLOYEE',
    description: 'Work on assigned tasks and projects',
    permissions: ['projects:read', 'tasks:read', 'tasks:write', 'clients:read'],
  },
] as const

async function main() {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      create: {
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      },
      update: {
        description: role.description,
        permissions: role.permissions,
      },
    })
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'ADMIN' } })

  const passwordHash = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@flexora.local' },
    create: {
      email: 'admin@flexora.local',
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
      roleId: adminRole.id,
    },
    update: {},
  })

  const leadClient = await prisma.client.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      companyName: 'Northwind Labs',
      contactName: 'Ada Chen',
      email: 'ada@northwind.dev',
      status: 'LEAD',
    },
    update: {},
  })

  const activeClient = await prisma.client.upsert({
    where: { id: '00000000-0000-4000-8000-000000000002' },
    create: {
      id: '00000000-0000-4000-8000-000000000002',
      companyName: 'Stellar Systems',
      contactName: 'Mark Bolt',
      email: 'mark@stellar.io',
      status: 'ACTIVE',
    },
    update: {},
  })

  const project = await prisma.project.upsert({
    where: { id: '00000000-0000-4000-8000-000000000010' },
    create: {
      id: '00000000-0000-4000-8000-000000000010',
      clientId: activeClient.id,
      name: 'Platform Revamp',
      status: 'ACTIVE',
      priority: 'HIGH',
      budget: 42860,
    },
    update: {},
  })

  await prisma.project.upsert({
    where: { id: '00000000-0000-4000-8000-000000000011' },
    create: {
      id: '00000000-0000-4000-8000-000000000011',
      clientId: leadClient.id,
      name: 'Discovery Sprint',
      status: 'PLANNING',
      priority: 'MEDIUM',
      budget: 12000,
    },
    update: {},
  })

  await prisma.task.upsert({
    where: { id: '00000000-0000-4000-8000-000000000020' },
    create: {
      id: '00000000-0000-4000-8000-000000000020',
      projectId: project.id,
      assigneeId: admin.id,
      title: 'API integration review',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
    },
    update: {},
  })

  await prisma.task.upsert({
    where: { id: '00000000-0000-4000-8000-000000000021' },
    create: {
      id: '00000000-0000-4000-8000-000000000021',
      projectId: project.id,
      title: 'Update client onboarding',
      status: 'TODO',
      priority: 'MEDIUM',
    },
    update: {},
  })

  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-2026-001' },
    create: {
      invoiceNumber: 'INV-2026-001',
      clientId: activeClient.id,
      projectId: project.id,
      amount: 16490,
      status: 'SENT',
      currency: 'USD',
      issuedAt: new Date(),
      dueDate: new Date(Date.now() + 14 * 86400000),
    },
    update: {},
  })

  console.log('Seed complete: roles + admin@flexora.local / admin123 + demo data')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
