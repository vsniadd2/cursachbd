import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { userCan } from '@/lib/auth/permissions'
export type NavBadges = { tasks?: number; email?: number; team?: number; roles?: number }
export function useNavBadges(): NavBadges {
  const { user } = useAuth(),
    [badges, setBadges] = useState<NavBadges>({})
  useEffect(() => {
    let active = true
    async function load() {
      const requests = [
        ['tasks', 'tasks'],
        ['team', 'users'],
        ['roles', 'roles'],
      ] as const
      const entries = await Promise.all(
        requests.map(async ([key, resource]) => {
          if (!userCan(user, `${resource}:read`)) return [key, undefined]
          try {
            const items = (await apiClient.get(`/${resource}`)).data.data.items
            return [
              key,
              resource === 'tasks'
                ? items.filter((t: { status: string }) => !['DONE', 'CANCELLED'].includes(t.status)).length
                : items.length,
            ]
          } catch {
            return [key, undefined]
          }
        }),
      )
      try {
        entries.push([
          'email',
          (await apiClient.get('/workspace', { params: { kind: 'EMAIL' } })).data.data.items.length,
        ])
      } catch {
        /* optional badge */
      }
      if (active) setBadges(Object.fromEntries(entries))
    }
    void load()
    window.addEventListener('crm:changed', load)
    return () => {
      active = false
      window.removeEventListener('crm:changed', load)
    }
  }, [user])
  return badges
}
