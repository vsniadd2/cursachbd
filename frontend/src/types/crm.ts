export type Client = {
  id: string
  companyName: string
  contactName: string | null
  email: string | null
  phone: string | null
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE' | 'CHURNED'
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type Project = {
  id: string
  clientId: string
  name: string
  description: string | null
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  budget: string | null
  client?: { id: string; companyName: string }
}

export type Task = {
  id: string
  projectId: string
  assigneeId: string | null
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  project?: { id: string; name: string }
  assignee?: { id: string; firstName: string; lastName: string } | null
}

export type Invoice = {
  id: string
  invoiceNumber: string
  clientId: string
  amount: string
  currency: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  client?: { companyName: string }
  project?: { name: string } | null
}

export type TeamUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: { id: string; name: string }
}

export type RoleRow = {
  id: string
  name: string
  description: string | null
  permissions: string[]
}
