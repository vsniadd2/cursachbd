import { useLandingMotion } from '@/hooks/useLandingMotion'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowRight, Menu, X, Building2, Users, Check, Plus, ChevronDown } from 'lucide-react'
import { LocaleLangToggle } from '@/components/LocaleLangToggle'
import { useWords } from '@/lib/product'

function Sun({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="7" fill="currentColor" />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i * Math.PI) / 8
        return (
          <path
            key={i}
            d={`M ${24 + Math.cos(a) * 11} ${24 + Math.sin(a) * 11} L ${24 + Math.cos(a) * 19} ${24 + Math.sin(a) * 19}`}
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}
function Preview({ mode = 'overview' }: { mode?: 'overview' | 'pipeline' | 'tasks' | 'team' }) {
  const w = useWords()
  return (
    <div
      className={`fx-preview fx-preview-${mode}`}
      aria-label={w('Иллюстрация интерфейса Flexora', 'Illustrated Flexora interface')}
    >
      <div className="fx-preview-bar">
        <span className="flex gap-1.5">
          <i />
          <i />
          <i />
        </span>
        <span>
          Flexora /{' '}
          {mode === 'overview'
            ? w('Обзор', 'Overview')
            : mode === 'pipeline'
              ? w('Сделки', 'Deals')
              : mode === 'tasks'
                ? w('Задачи', 'Tasks')
                : w('Команда', 'Team')}
        </span>
        <span className="fx-demo-label">{w('Пример', 'Preview')}</span>
      </div>
      <div className="fx-preview-body">
        <aside>
          <Sun className="size-7" />
          {[
            w('Обзор', 'Overview'),
            w('Клиенты', 'Customers'),
            w('Сделки', 'Deals'),
            w('Задачи', 'Tasks'),
          ].map((s, i) => (
            <span key={s} className={i === 0 ? 'is-active' : ''}>
              {s}
            </span>
          ))}
        </aside>
        <div className="fx-preview-main">
          {mode === 'team' ? (
            <div className="fx-team-tree">
              <div className="fx-person">
                <span>AK</span>
                <p>
                  {w('Анна К.', 'Anna K.')}
                  <small>{w('Руководитель', 'Team lead')}</small>
                </p>
              </div>
              <div className="fx-tree-line" />
              <div className="fx-team-people">
                {['ML', 'JD', 'AS'].map((s, i) => (
                  <div key={s} className="fx-person">
                    <span>{s}</span>
                    <p>
                      {[w('Мария Л.', 'Maria L.'), w('Джон Д.', 'John D.'), w('Алекс С.', 'Alex S.')][i]}
                      <small>{w('Участник', 'Member')}</small>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : mode === 'tasks' ? (
            <div className="fx-task-list">
              <p className="fx-preview-title">
                {w('На этой неделе', 'This week')}
                <Plus size={18} />
              </p>
              {[
                w('Подготовить предложение', 'Prepare proposal'),
                w('Обсудить детали с клиентом', 'Discuss customer needs'),
                w('Согласовать следующий этап', 'Agree on next steps'),
                w('Собрать обратную связь', 'Collect feedback'),
              ].map((s, i) => (
                <div key={s}>
                  <span className={i === 0 ? 'checked' : ''}>{i === 0 && <Check size={12} />}</span>
                  <p>{s}</p>
                  <small>{['AK', 'ML', 'JD', 'AS'][i]}</small>
                </div>
              ))}
            </div>
          ) : mode === 'pipeline' ? (
            <div className="fx-kanban">
              {[w('Новые', 'New'), w('В работе', 'Active'), w('Завершены', 'Completed')].map((s, i) => (
                <div key={s}>
                  <p>
                    <span className={`fx-dot dot-${i}`} />
                    {s}
                    <small>{i + 1}</small>
                  </p>
                  {Array.from({ length: i === 1 ? 2 : 1 }, (_, j) => (
                    <article key={j}>
                      <small>{['ACME STUDIO', 'NORTHWIND', 'KINETIC'][i]}</small>
                      <h4>
                        {
                          [
                            w('Новый проект', 'New project'),
                            w('Развитие продукта', 'Product growth'),
                            w('Запуск кампании', 'Campaign launch'),
                          ][i]
                        }
                      </h4>
                      <div className="fx-fake-line" />
                      <span className="fx-chip">
                        {w('Следующий шаг', 'Next step')} <ArrowRight size={10} />
                      </span>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="fx-preview-title">
                {w('Обзор бизнеса', 'Business overview')}
                <span className="fx-chip">
                  {w('Этот месяц', 'This month')} <ChevronDown size={10} />
                </span>
              </div>
              <div className="fx-preview-stats">
                {[
                  [w('Активные сделки', 'Active deals'), '24'],
                  [w('Клиенты', 'Customers'), '128'],
                  [w('Задачи выполнены', 'Tasks completed'), '86%'],
                ].map(([s, v]) => (
                  <div key={s}>
                    <small>{s}</small>
                    <strong>{v}</strong>
                    <div className="fx-stat-spark">
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                ))}
              </div>
              <div className="fx-preview-graph">
                <div>
                  <p>{w('Всё движется вперёд', 'Everything moves forward')}</p>
                  <small>
                    {w('От первого контакта до результата', 'From the first conversation to the result')}
                  </small>
                </div>
                <svg viewBox="0 0 700 160" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="fx-chart" x1="0" y1="0" x2="0" y2="1">
                      <stop stopColor="#9c9de5" stopOpacity=".5" />
                      <stop offset="1" stopColor="#9c9de5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 150 C60 145 65 105 115 110 S180 140 230 82 S300 125 355 70 S440 95 490 47 S570 75 620 27 S680 35 700 5 L700 160 L0 160Z"
                    className="fx-chart-area"
                    fill="url(#fx-chart)"
                  />
                  <path
                    d="M0 150 C60 145 65 105 115 110 S180 140 230 82 S300 125 355 70 S440 95 490 47 S570 75 620 27 S680 35 700 5"
                    className="fx-chart-line"
                    pathLength={1}
                    stroke="#6762bd"
                    strokeWidth="3"
                    fill="none"
                  />
                </svg>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function LandingPage() {
  const landingRef = useLandingMotion()
  const { isAuthenticated } = useAuth()
  const w = useWords(),
    [menu, setMenu] = useState(false)
  const nav = [
    ['#product', w('Продукт', 'Product')],
    ['#features', w('Возможности', 'Features')],
    ['#start', w('Для команд', 'For teams')],
    ['#faq', w('Вопросы', 'FAQ')],
  ]
  return (
    <main ref={landingRef} className="fx-landing" id="main">
      <a href="#main" className="fx-skip">
        {w('К содержимому', 'Skip to content')}
      </a>
      <div className="fx-hero-wrap">
        <div className="fx-atmosphere" aria-hidden="true" />
        <div className="fx-texture" aria-hidden="true" />
        <header className="fx-header">
          <Link to="/" className="fx-wordmark" aria-label="Flexora">
            <Sun className="size-8" />
            Flexora
          </Link>
          <nav className="fx-desktop-nav" aria-label={w('Основная навигация', 'Main navigation')}>
            {nav.map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <div className="fx-header-actions">
            <LocaleLangToggle />
            <Link to={isAuthenticated ? '/dashboard' : '/login'} className="fx-login">
              {isAuthenticated ? w('Моя CRM', 'My CRM') : w('Войти', 'Log in')}
              <ChevronDown size={15} />
            </Link>
            <Link to="/register" className="fx-pill fx-pill-dark fx-header-cta">
              {w('Попробовать Flexora', 'Try Flexora')}
              <ArrowUpRight size={17} />
            </Link>
            <button
              className="fx-menu-button"
              aria-label={w('Меню', 'Menu')}
              aria-expanded={menu}
              aria-controls="fx-mobile-nav"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </header>
        {menu && (
          <nav
            id="fx-mobile-nav"
            className="fx-mobile-nav"
            aria-label={w('Мобильная навигация', 'Mobile navigation')}
          >
            {nav.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenu(false)}>
                {label}
                <ArrowUpRight size={18} />
              </a>
            ))}
            <Link to="/register">
              {w('Создать аккаунт', 'Create account')}
              <ArrowUpRight size={18} />
            </Link>
          </nav>
        )}
        <div>
          <section className="fx-hero" aria-labelledby="fx-title">
            <div className="fx-app-icon">
              <Sun />
            </div>
            <h1 id="fx-title">
              {w('Всё получается.', 'Make more happen.')}
              <br />
              {w('Когда вы вместе.', 'Together.')}
            </h1>
            <p>
              {w('Объедините клиентов, сделки и команду.', 'Bring your customers, deals and team together.')}
              <br className="hidden sm:block" />{' '}
              {w('Освободите время для больших идей.', 'Make room for your next big idea.')}
            </p>
            <div className="fx-hero-actions">
              <Link to="/register" className="fx-pill fx-pill-dark">
                {w('Начать с Flexora', 'Get started')}
                <ArrowUpRight size={18} />
              </Link>
              <a href="#product" className="fx-pill fx-pill-glass">
                {w('Посмотреть возможности', 'Explore Flexora')}
                <ArrowRight size={18} />
              </a>
            </div>
            <div className="fx-hero-bottom">
              <p>{w('Одно пространство для всего, что важно', 'One space for everything that matters')}</p>
              <div>
                {[
                  w('Клиенты', 'Customers'),
                  w('Сделки', 'Deals'),
                  w('Задачи', 'Tasks'),
                  w('Команда', 'Team'),
                ].map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
      <section id="start" className="fx-section fx-start">
        <div className="fx-section-heading">
          <p className="fx-eyebrow">{w('Начать', 'Get started')}</p>
          <h2>
            {w('Ваше пространство.', 'Your space.')}
            <br />
            {w('Ваш способ работать.', 'Your way to work.')}
          </h2>
          <p>
            {w(
              'Создайте команду или присоединитесь к той, где вас уже ждут.',
              'Build a team of your own or join the people waiting for you.',
            )}
          </p>
        </div>
        <div className="fx-start-grid">
          <article>
            <Building2 size={30} strokeWidth={1.4} />
            <h3>{w('Для вашего бизнеса', 'For your business')}</h3>
            <p>
              {w(
                'Начните с чистого листа: своя команда, своя CRM и полный контроль над рабочим пространством.',
                'Start fresh with your own team, your own CRM and full control of your workspace.',
              )}
            </p>
            <Link to="/register" className="fx-text-link">
              {w('Создать пространство', 'Create a workspace')}
              <ArrowUpRight size={18} />
            </Link>
          </article>
          <article>
            <Users size={30} strokeWidth={1.4} />
            <h3>{w('Для вас и команды', 'For you and your team')}</h3>
            <p>
              {w(
                'Создайте личный аккаунт и подключитесь по приглашению. Все люди и задачи окажутся рядом.',
                'Create a personal account and join by invitation. Find your people and your next steps in one place.',
              )}
            </p>
            <Link to="/register?account=personal" className="fx-text-link">
              {w('Присоединиться', 'Join your team')}
              <ArrowUpRight size={18} />
            </Link>
          </article>
        </div>
      </section>
      <section id="product" className="fx-product fx-section">
        <div className="fx-section-heading">
          <p className="fx-eyebrow">{w('Знакомьтесь, Flexora', 'Meet Flexora')}</p>
          <h2>
            {w('Меньше переключений.', 'Less switching.')}
            <br />
            {w('Больше движения вперёд.', 'More moving forward.')}
          </h2>
          <p>
            {w(
              'Вся картина бизнеса — перед вами. От первого контакта с клиентом до завершённого проекта.',
              'See the whole picture. From the first conversation with a customer to a project well done.',
            )}
          </p>
        </div>
        <div className="fx-product-stage">
          <Preview />
          <span className="fx-stage-caption">
            {w(
              'Иллюстрация продукта · в новом пространстве вы начнёте со своих данных',
              'Product illustration · your new workspace starts with your own data',
            )}
          </span>
        </div>
      </section>
      <section id="features" className="fx-features fx-section">
        <div className="fx-section-heading">
          <p className="fx-eyebrow">{w('Работайте в своём ритме', 'Find your flow')}</p>
          <h2>{w('От замысла к результату.', 'From intention to impact.')}</h2>
        </div>
        {[
          {
            mode: 'pipeline' as const,
            tag: w('01 / Клиенты и сделки', '01 / Customers and deals'),
            title: w('Каждая возможность — на виду.', 'Every opportunity, in view.'),
            text: w(
              'Собирайте контакты, ведите сделки по стадиям и фиксируйте следующий шаг. Воронка помогает не терять важное.',
              'Keep contacts together, move deals through stages and plan the next step. Keep every opportunity in focus.',
            ),
          },
          {
            mode: 'tasks' as const,
            tag: w('02 / Задачи и фокус', '02 / Tasks and focus'),
            title: w('Планы, которые становятся делом.', 'Turn your plans into progress.'),
            text: w(
              'Назначайте ответственных, расставляйте приоритеты и сроки. Пусть каждый знает, что делать дальше.',
              'Assign owners, set priorities and agree on deadlines. Give everyone a clear next step.',
            ),
          },
          {
            mode: 'team' as const,
            tag: w('03 / Люди и команда', '03 / People and teams'),
            title: w('Общее дело. Свои роли.', 'Shared ambition. Clear roles.'),
            text: w(
              'Приглашайте коллег по коду, настраивайте права и стройте структуру команды. Ваши данные остаются в вашем пространстве.',
              'Invite colleagues with a code, set permissions and shape your team. Keep your data in your workspace.',
            ),
          },
        ].map((f, i) => (
          <article className={`fx-feature ${i % 2 ? 'fx-feature-reverse' : ''}`} key={f.mode}>
            <div className={`fx-feature-art fx-art-${f.mode}`}>
              <Preview mode={f.mode} />
            </div>
            <div className="fx-feature-copy">
              <p className="fx-eyebrow">{f.tag}</p>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <Link to="/register" className="fx-text-link">
                {w('Попробовать в деле', 'Make it happen')}
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </article>
        ))}
      </section>
      <section id="faq" className="fx-section fx-faq">
        <h2>{w('Хорошие вопросы.', 'Good questions.')}</h2>
        <div>
          {[
            [
              w('С чего начать?', 'How do I get started?'),
              w(
                'Выберите «Бизнес» при регистрации, укажите название компании — и получите своё пустое пространство с CRM и правами администратора.',
                'Choose Business at registration and name your company. Your new workspace comes with a CRM and administrator access.',
              ),
            ],
            [
              w('Как присоединиться к команде?', 'How do I join a team?'),
              w(
                'Зарегистрируйте личный аккаунт. Попросите администратора прислать код или ссылку приглашения и введите их на экране подключения.',
                'Create a personal account. Ask an administrator for an invitation code or link and enter it on the join screen.',
              ),
            ],
            [
              w('Кто видит данные моей команды?', 'Who can see my team’s data?'),
              w(
                'У каждой команды отдельное пространство. Доступ участников к действиям определяется ролями и правами, которые настраивает администратор.',
                'Each team has its own workspace. Member actions are controlled by roles and permissions set by an administrator.',
              ),
            ],
            [
              w('Можно ли выгрузить данные?', 'Can I export my data?'),
              w(
                'Да. В таблицах и отчётах есть экспорт CSV. Раздел интеграций позволяет импортировать и экспортировать клиентов в JSON.',
                'Yes. Tables and reports support CSV exports. Use the integrations section to import and export customer records in JSON.',
              ),
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <Plus size={22} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="fx-final">
        <div className="fx-atmosphere" aria-hidden="true" />
        <div className="fx-texture" aria-hidden="true" />
        <div className="fx-final-content">
          <Sun className="mx-auto mb-7 size-12" />
          <h2>
            {w('Следующая большая идея —', 'Your next big idea')}
            <br />
            {w('уже ваша.', 'starts here.')}
          </h2>
          <Link to="/register" className="fx-pill fx-pill-dark">
            {w('Начать с Flexora', 'Get started')}
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <footer className="fx-footer">
        <div>
          <Link to="/" className="fx-wordmark">
            <Sun className="size-8" />
            Flexora
          </Link>
          <p>{w('Люди. Идеи. Движение.', 'People. Ideas. Momentum.')}</p>
        </div>
        <nav aria-label={w('Ссылки в подвале', 'Footer links')}>
          {nav.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
          <Link to="/login">{w('Войти', 'Log in')}</Link>
          <Link to="/register">{w('Регистрация', 'Sign up')}</Link>
        </nav>
        <div className="fx-footer-bottom">
          <span>© 2026 Flexora</span>
          <LocaleLangToggle />
        </div>
      </footer>
    </main>
  )
}
