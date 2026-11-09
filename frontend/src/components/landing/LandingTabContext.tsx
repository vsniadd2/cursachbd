import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export const PILLAR_TABS = ['track', 'analyze', 'optimize', 'scale'] as const
export type PillarTab = (typeof PILLAR_TABS)[number]

type LandingTabContextValue = {
  tab: PillarTab
  setTab: (tab: PillarTab) => void
}

const LandingTabContext = createContext<LandingTabContextValue | null>(null)

export function LandingTabProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<PillarTab>('track')
  const value = useMemo(() => ({ tab, setTab }), [tab])
  return <LandingTabContext.Provider value={value}>{children}</LandingTabContext.Provider>
}

export function useLandingTab() {
  const ctx = useContext(LandingTabContext)
  if (!ctx) throw new Error('useLandingTab must be used within LandingTabProvider')
  return ctx
}
