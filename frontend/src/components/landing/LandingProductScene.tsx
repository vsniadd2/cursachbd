import {
  Check,
  CheckCheck,
  FolderKanban,
  Users,
  ListTodo,
  ShieldCheck,
  CircleCheck,
  Activity,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
export function LandingProductScene({ variant = 0 }: { variant?: number }) {
  const { i18n } = useTranslation()
  const labels = i18n.resolvedLanguage?.startsWith('ru')
    ? ['Клиент', 'Проект', 'Задача', 'Готово']
    : ['Client', 'Project', 'Task', 'Done']
  const icons = [Users, FolderKanban, ListTodo, CheckCheck]
  return (
    <div className={`lp-scene lp-scene-${variant % 4}`} aria-hidden="true">
      {variant % 4 === 0 ? (
        <div className="lp-mini-window">
          <div className="lp-mini-toolbar">
            <span>Flexora</span>
            <span>•••</span>
          </div>
          {['Northwind Labs', 'Stellar Systems', 'Platform Revamp'].map((name, i) => (
            <div className="lp-mini-row" key={name}>
              <span className="lp-avatar">{name[0]}</span>
              <span>{name}</span>
              <span className="lp-mini-check">
                <Check size={12} />
              </span>
              <i style={{ width: `${35 + i * 12}%` }} />
            </div>
          ))}
        </div>
      ) : variant % 4 === 1 ? (
        <div className="lp-flow">
          {icons.slice(0, 3).map((Icon, i) => (
            <div className="lp-flow-step" key={i}>
              <Icon size={22} />
              <span>{labels[i]}</span>
              <CircleCheck className="lp-flow-done" size={14} />
            </div>
          ))}
        </div>
      ) : variant % 4 === 2 ? (
        <div className="lp-mini-board">
          {[0, 1, 2].map((col) => (
            <div key={col}>
              <span className="lp-board-dot" />
              <div className="lp-board-task">
                <i />
                <i />
                <span className="lp-avatar">{['JD', 'MK', 'AN'][col]}</span>
              </div>
              <div className="lp-board-task">
                <i />
                <i />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="lp-access-scene">
          <ShieldCheck size={44} />
          <div>
            <span>
              ADMIN <Check size={15} />
            </span>
            <span>
              MANAGER <Check size={15} />
            </span>
            <span>
              EMPLOYEE <Activity size={15} />
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
