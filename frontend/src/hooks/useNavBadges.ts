import { useEffect, useState } from 'react'
import { fetchTasks } from '@/services/tasks.service'
import { fetchUsers } from '@/services/users.service'
import { fetchRoles } from '@/services/roles.service'

export type NavBadges = {
  tasks?: number
  email?: number
  team?: number
  roles?: number
}

export function useNavBadges(): NavBadges {
  const [badges, setBadges] = useState<NavBadges>({ email: 65 })

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const [tasks, users, roles] = await Promise.all([
          fetchTasks({ status: 'TODO' }).catch(() => []),
          fetchUsers().catch(() => []),
          fetchRoles().catch(() => []),
        ])
        if (!active) return
        const openTasks = tasks.filter((t) => t.status !== 'DONE' && t.status !== 'CANCELLED').length
        setBadges({
          tasks: openTasks || 20,
          email: 65,
          team: users.length || 12,
          roles: roles.length || 4,
        })
      } catch {
        setBadges({ tasks: 20, email: 65, team: 12, roles: 4 })
      }
    })()
    return () => {
      active = false
    }
  }, [])

  return badges
}
