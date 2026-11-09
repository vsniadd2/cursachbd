import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import {
  generateUniquePublicCode,
  isPatternedPublicCode,
  isValidPublicCode,
} from '../src/lib/public-code.ts'

const prisma = new PrismaClient()

async function ensurePublicCode(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return
  if (isValidPublicCode(user.publicCode) && !isPatternedPublicCode(user.publicCode)) return
  const publicCode = await generateUniquePublicCode(prisma)
  await prisma.user.update({ where: { id: userId }, data: { publicCode } })
}

async function refreshPatternedPublicCodes() {
  const users = await prisma.user.findMany({ select: { id: true, publicCode: true } })
  for (const u of users) {
    if (isPatternedPublicCode(u.publicCode)) {
      await prisma.user.update({
        where: { id: u.id },
        data: { publicCode: await generateUniquePublicCode(prisma) },
      })
    }
  }
}

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
      'users:write',
      'roles:read',
      'roles:write',
    ],
  },
  {
    name: 'EMPLOYEE',
    description: 'Work on assigned tasks and projects',
    permissions: ['projects:read', 'tasks:read', 'tasks:write', 'clients:read', 'users:read', 'roles:read'],
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

  const sales = await prisma.department.upsert({
    where: { name: 'Sales' },
    create: { name: 'Sales' },
    update: {},
  })
  const inbound = await prisma.department.upsert({
    where: { name: 'Inbound' },
    create: { name: 'Inbound', parentId: sales.id },
    update: { parentId: sales.id },
  })
  await prisma.department.upsert({
    where: { name: 'Enterprise' },
    create: { name: 'Enterprise', parentId: sales.id },
    update: { parentId: sales.id },
  })
  const engineering = await prisma.department.upsert({
    where: { name: 'Engineering' },
    create: { name: 'Engineering' },
    update: {},
  })
  await prisma.department.upsert({
    where: { name: 'Support' },
    create: { name: 'Support' },
    update: {},
  })
  const buying = await prisma.department.upsert({
    where: { name: 'Buying' },
    create: { name: 'Buying' },
    update: {},
  })
  const hr = await prisma.department.upsert({
    where: { name: 'HR' },
    create: { name: 'HR' },
    update: {},
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@flexora.local' },
    create: {
      email: 'admin@flexora.local',
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
      publicCode: await generateUniquePublicCode(prisma),
      roleId: adminRole.id,
      departmentId: engineering.id,
    },
    update: { departmentId: engineering.id },
  })
  await ensurePublicCode(admin.id)

  const managerRole = await prisma.role.findUniqueOrThrow({ where: { name: 'MANAGER' } })
  const maya = await prisma.user.upsert({
    where: { email: 'maya@flexora.local' },
    create: {
      email: 'maya@flexora.local',
      passwordHash: await bcrypt.hash('manager123', 12),
      firstName: 'Maya',
      lastName: 'Klein',
      publicCode: await generateUniquePublicCode(prisma),
      roleId: managerRole.id,
      departmentId: inbound.id,
    },
    update: { departmentId: inbound.id },
  })
  await ensurePublicCode(maya.id)
  await refreshPatternedPublicCodes()

  const employeeRole = await prisma.role.findUniqueOrThrow({ where: { name: 'EMPLOYEE' } })
  const alex = await prisma.user.upsert({
    where: { email: 'alex@flexora.local' },
    create: {
      email: 'alex@flexora.local',
      passwordHash: await bcrypt.hash('employee123', 12),
      firstName: 'Alex',
      lastName: 'Nguyen',
      publicCode: await generateUniquePublicCode(prisma),
      roleId: employeeRole.id,
      departmentId: engineering.id,
      managerId: maya.id,
    },
    update: {
      departmentId: engineering.id,
      managerId: maya.id,
    },
  })
  await ensurePublicCode(alex.id)

  const andrii = await prisma.user.upsert({
    where: { email: 'andrii@flexora.local' },
    create: {
      email: 'andrii@flexora.local',
      passwordHash: await bcrypt.hash('employee123', 12),
      firstName: 'Andrii',
      lastName: 'Petrov',
      publicCode: await generateUniquePublicCode(prisma),
      roleId: employeeRole.id,
      departmentId: inbound.id,
      managerId: maya.id,
    },
    update: {
      departmentId: inbound.id,
      managerId: maya.id,
    },
  })
  await ensurePublicCode(andrii.id)

  await prisma.user.update({
    where: { id: admin.id },
    data: { managerId: null },
  })
  await prisma.user.update({
    where: { id: maya.id },
    data: { managerId: admin.id },
  })

  const danik = await prisma.user.upsert({
    where: { email: 'danik@flexora.local' },
    create: {
      email: 'danik@flexora.local',
      passwordHash: await bcrypt.hash('manager123', 12),
      firstName: 'Danik',
      lastName: 'TL',
      publicCode: await generateUniquePublicCode(prisma),
      roleId: managerRole.id,
      departmentId: buying.id,
      managerId: admin.id,
    },
    update: {
      departmentId: buying.id,
      managerId: admin.id,
      firstName: 'Danik',
      lastName: 'TL',
    },
  })
  await ensurePublicCode(danik.id)

  const ulyana = await prisma.user.upsert({
    where: { email: 'ulyana@flexora.local' },
    create: {
      email: 'ulyana@flexora.local',
      passwordHash: await bcrypt.hash('manager123', 12),
      firstName: 'Ulyana',
      lastName: 'TL',
      publicCode: await generateUniquePublicCode(prisma),
      roleId: managerRole.id,
      departmentId: hr.id,
      managerId: admin.id,
    },
    update: {
      departmentId: hr.id,
      managerId: admin.id,
      firstName: 'Ulyana',
      lastName: 'TL',
    },
  })
  await ensurePublicCode(ulyana.id)

  const buyingTeam = [
    { email: 'oleg@flexora.local', firstName: 'Oleg', lastName: 'Morozov' },
    { email: 'nina@flexora.local', firstName: 'Nina', lastName: 'Sokolova' },
    { email: 'viktor@flexora.local', firstName: 'Viktor', lastName: 'Ivanov' },
  ]
  for (const member of buyingTeam) {
    const u = await prisma.user.upsert({
      where: { email: member.email },
      create: {
        email: member.email,
        passwordHash: await bcrypt.hash('employee123', 12),
        firstName: member.firstName,
        lastName: member.lastName,
        publicCode: await generateUniquePublicCode(prisma),
        roleId: employeeRole.id,
        departmentId: buying.id,
        managerId: danik.id,
      },
      update: {
        departmentId: buying.id,
        managerId: danik.id,
      },
    })
    await ensurePublicCode(u.id)
  }

  const hrTeam = [
    { email: 'kate@flexora.local', firstName: 'Kate', lastName: 'Wells' },
    { email: 'anna@flexora.local', firstName: 'Anna', lastName: 'Rossi' },
    { email: 'max@flexora.local', firstName: 'Max', lastName: 'Turner' },
  ]
  for (const member of hrTeam) {
    const u = await prisma.user.upsert({
      where: { email: member.email },
      create: {
        email: member.email,
        passwordHash: await bcrypt.hash('employee123', 12),
        firstName: member.firstName,
        lastName: member.lastName,
        publicCode: await generateUniquePublicCode(prisma),
        roleId: employeeRole.id,
        departmentId: hr.id,
        managerId: ulyana.id,
      },
      update: {
        departmentId: hr.id,
        managerId: ulyana.id,
      },
    })
    await ensurePublicCode(u.id)
  }

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
