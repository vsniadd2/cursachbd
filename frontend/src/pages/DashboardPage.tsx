import { Filter, UploadCloud } from 'lucide-react'
import { StatCards } from '@/components/StatCards'
import { RevenueChart } from '@/components/RevenueChart'
import { ScoreGauge } from '@/components/ScoreGauge'
import { Touchpoints } from '@/components/Touchpoints'
import { LeadActivity } from '@/components/LeadActivity'
import { PageContent } from '@/components/app/PageContent'

export function DashboardPage() {
  return (
    <PageContent>
      <div className="flex flex-wrap items-center justify-end gap-3 pb-4">
        <button className="flex items-center gap-[6px] rounded-[7px] border border-ink bg-surface px-[10px] py-[6px] text-[12.5px] transition-colors duration-150 hover:bg-shell">
          <Filter className="size-[14px]" strokeWidth={1.6} />
          Filter
        </button>
        <button className="flex items-center gap-[6px] rounded-[7px] border border-ink bg-ink px-[10px] py-[6px] text-[12.5px] text-white transition-colors duration-150 hover:bg-[#2a2a2f]">
          <UploadCloud className="size-[14px]" strokeWidth={1.6} />
          Export
        </button>
      </div>

      <StatCards />

      <div className="mt-[19px] grid grid-cols-1 gap-[19px] xl:grid-cols-[1fr_351px]">
        <RevenueChart />
        <ScoreGauge score={82} />
      </div>

      <div className="mt-[19px] grid grid-cols-1 gap-[19px] xl:grid-cols-[351px_1fr]">
        <Touchpoints />
        <LeadActivity />
      </div>
    </PageContent>
  )
}
