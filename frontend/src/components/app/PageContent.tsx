import type { ReactNode } from 'react'

export function PageContent({ children }: { children: ReactNode }) {
  return <div className="p-4 sm:p-5 lg:p-6">{children}</div>
}
