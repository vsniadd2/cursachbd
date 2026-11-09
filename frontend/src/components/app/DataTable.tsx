import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type Column<T> = {
  key: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  empty,
}: {
  columns: Column<T>[]
  rows: T[]
  loading?: boolean
  empty?: ReactNode
}) {
  if (loading) {
    return <p className="py-8 text-center text-[12.5px] text-ink-2">Loading…</p>
  }
  if (!rows.length) {
    return empty ?? null
  }
  return (
    <div className="overflow-x-auto rounded-[12px] border border-line">
      <table className="w-full min-w-[640px] border-collapse text-left text-[12.5px]">
        <thead>
          <tr className="border-b border-line bg-shell">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  'px-4 py-3 text-[11px] font-medium uppercase tracking-[0.04em] text-ink-2',
                  c.className,
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[13px]">
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-line last:border-0 transition-colors hover:bg-shell/70">
              {columns.map((c) => (
                <td key={c.key} className={cn('px-4 py-3 text-ink', c.className)}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
