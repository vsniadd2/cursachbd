import { cn } from '@/lib/utils'

export function AuthFieldLabel({ htmlFor, children, className }: { htmlFor: string; children: React.ReactNode; className?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-[11px] font-medium uppercase tracking-[0.08em] text-brand',
        className,
      )}
    >
      {children}
    </label>
  )
}
