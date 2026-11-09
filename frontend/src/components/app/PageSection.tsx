import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageSection({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn('rounded-[14px] border border-line bg-surface p-5', className)}>{children}</section>
  )
}
