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
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
  client: { id: string; companyName: string }
}

export type Person = { id: string; firstName: string; lastName: string }
export type ProjectRole = 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER'
export type ProjectMember = { userId: string; role: ProjectRole; user: Person & { isActive: boolean } }
export type TaskProgress = { done: number; total: number }
export type ProjectListItem = Project & { lead: Person | null; taskProgress?: TaskProgress }
export type ProjectDetails = Project & { members: ProjectMember[] }
export type ProjectHistoryEntry = {
  id: string
  action: 'CREATE' | 'UPDATE' | 'ASSIGN'
  createdAt: string
  user: Person | null
  metadata: {
    fields?: string[]
    fromStatus?: Project['status']
    toStatus?: Project['status']
    member?: string
    fromRole?: ProjectRole | null
    toRole?: ProjectRole | null
  } | null
}

export type Task = {
  id: string
  projectId: string
  assigneeId: string | null
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: string | null
  project?: { id: string; name: string }
  assignee?: { id: string; firstName: string; lastName: string } | null
}

export type Invoice = {
  id: string
  invoiceNumber: string
  clientId: string
  projectId: string | null
  amount: string
  currency: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  dueDate: string | null
  client?: { companyName: string }
  project?: { name: string } | null
}

export type TeamUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  publicCode: string
  departmentId: string | null
  managerId: string | null
  extraPermissions: string[]
  isActive: boolean
  department?: { id: string; name: string } | null
  manager?: { id: string; firstName: string; lastName: string } | null
  role: { id: string; name: string }
}

export type Department = {
  id: string
  name: string
  parentId: string | null
  parent?: { id: string; name: string } | null
  _count: { users: number }
}

export type RoleRow = {
  id: string
  name: string
  description: string | null
  permissions: string[]
  isSystem?: boolean
}

export type PermissionCatalog = {
  builtin: string[]
  custom: { id: string; slug: string; label: string; description: string | null }[]
}

export type TeamInviteRow = {
  id: string
  type: 'EMAIL' | 'PUBLIC_CODE' | 'TEMP_ACCOUNT' | 'LINK'
  status: 'PENDING' | 'ACCEPTED' | 'CANCELLED' | 'EXPIRED'
  email: string | null
  targetPublicCode: string | null
  expiresAt: string
  createdAt: string
  extraPermissions: string[]
  role: { id: string; name: string } | null
  department: { id: string; name: string } | null
  provisionedUser: { id: string; email: string; firstName: string; lastName: string } | null
}
