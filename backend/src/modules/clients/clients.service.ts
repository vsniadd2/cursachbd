import type { ClientStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { ApiError } from '../../utils/api-error.js'
import type { createClientSchema, updateClientSchema } from './clients.schema.js'
import type { z } from 'zod'

export async function listClients(status?: ClientStatus) {
  return prisma.client.findMany({
    where: status ? { status } : undefined,
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getClient(id: string) {
  const client = await prisma.client.findUnique({ where: { id } })
  if (!client) throw new ApiError(404, 'Client not found')
  return client
}

export async function createClient(data: z.infer<typeof createClientSchema>) {
  return prisma.client.create({
    data: {
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email || null,
      phone: data.phone,
      status: data.status ?? 'LEAD',
      notes: data.notes,
    },
  })
}

export async function updateClient(id: string, data: z.infer<typeof updateClientSchema>) {
  await getClient(id)
  return prisma.client.update({
    where: { id },
    data: {
      ...data,
      email: data.email === '' ? null : data.email,
    },
  })
}

export async function deleteClient(id: string) {
  await getClient(id)
  await prisma.client.delete({ where: { id } })
}
