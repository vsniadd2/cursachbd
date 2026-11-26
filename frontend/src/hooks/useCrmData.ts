import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { userCan } from '@/lib/auth/permissions'
import { errorText } from '@/lib/product'
import type { MetricRecord } from '@/lib/analytics'
export function useCrmData() {
  const { user } = useAuth()
  const [data, setData] = useState<{
    clients: MetricRecord[]
    projects: MetricRecord[]
    tasks: MetricRecord[]
    invoices: MetricRecord[]
  }>({ clients: [], projects: [], tasks: [], invoices: [] })
  const [error, setError] = useState(''),
    [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    try {
      const entries = await Promise.all(
        ['clients', 'projects', 'tasks', 'invoices'].map(async (key) => [
          key,
          userCan(user, `${key}:read`) ? (await apiClient.get(`/${key}`)).data.data.items : [],
        ]),
      )
      setError('')
      setData(Object.fromEntries(entries) as typeof data)
    } catch (e) {
      setError(errorText(e))
    } finally {
      setLoading(false)
    }
  }, [user])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial HTTP fetch; updates occur only after the asynchronous response.
    void load()
  }, [load])
  return { ...data, error, loading, load }
}
