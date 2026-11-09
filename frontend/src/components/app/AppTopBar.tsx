import { Bell, UserCog } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getPageMeta } from '@/config/navigation'

const ME = 'https://cdn.magicpatterns.com/patterns/generated-images/8dae5578-0701-4d73-a4d4-7555c1cb3985.jpg'
const TEAM = [
  'https://cdn.magicpatterns.com/patterns/generated-images/03f0f64e-669d-4fc1-b487-0cdac7f2faf8.jpg',
  'https://cdn.magicpatterns.com/patterns/generated-images/c4ea19ea-7d67-408c-9a63-cbbd98998120.jpg',
]

export function AppTopBar() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { title, subtitle } = getPageMeta(pathname)
  const userName = user ? `${user.firstName} ${user.lastName}` : 'User'
  const userRole = user?.role.name ?? 'Employee'

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-line bg-surface px-5 py-4 lg:px-6">
      <div>
        <h1 className="text-[19px] leading-tight font-medium tracking-[-0.01em]">{title}</h1>
        <p className="mt-0.5 text-[11.5px] text-ink-2">{subtitle}</p>
      </div>
      <div className="flex items-center gap-[14px]">
        <button
          aria-label="Notifications"
          className="grid size-[37px] place-items-center rounded-[9px] border border-line bg-surface text-ink transition-colors duration-150 hover:bg-shell"
        >
          <Bell className="size-[17px]" strokeWidth={1.6} />
        </button>
        <span className="hidden h-[30px] w-px bg-line sm:block" />
        <div className="hidden items-center sm:flex">
          {TEAM.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className="size-[34px] rounded-full border-2 border-surface object-cover"
              style={{ marginLeft: i ? -12 : 0 }}
            />
          ))}
          <span className="-ml-3 grid size-[34px] place-items-center rounded-full border-2 border-surface bg-brand text-[12px] font-medium text-white">
            +3
          </span>
        </div>
        <button
          aria-label="Account settings"
          className="grid size-[37px] place-items-center rounded-[9px] border border-line bg-surface text-ink transition-colors duration-150 hover:bg-shell"
        >
          <UserCog className="size-[17px]" strokeWidth={1.6} />
        </button>
        <span className="hidden h-[30px] w-px bg-line sm:block" />
        <div className="flex items-center gap-[10px]">
          <div className="hidden text-right sm:block">
            <p className="text-[12.5px] leading-tight">{userName}</p>
            <p className="mt-0.5 text-[10.5px] text-ink-2">{userRole}</p>
          </div>
          <img src={ME} alt={userName} className="size-[40px] rounded-full object-cover" />
        </div>
      </div>
    </header>
  )
}
