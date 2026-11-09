export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-[14px] font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[12.5px] text-ink-2">{description}</p>}
    </div>
  )
}
