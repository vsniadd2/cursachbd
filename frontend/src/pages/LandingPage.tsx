import { LandingNav } from '@/components/landing/LandingNav'
import { LandingPageBackdrop } from '@/components/landing/LandingPageBackdrop'
import { LandingKeitaroHero } from '@/components/landing/LandingKeitaroHero'
import { LandingTabProvider } from '@/components/landing/LandingTabContext'
import { LandingDashboardShowcase } from '@/components/landing/LandingDashboardShowcase'
import { LandingPillarSection } from '@/components/landing/LandingPillarSection'
import { LandingTeamSection } from '@/components/landing/LandingTeamSection'
import { LandingSupportSection } from '@/components/landing/LandingSupportSection'
import { LandingSocialProof } from '@/components/landing/LandingSocialProof'
import { LandingBlogStrip } from '@/components/landing/LandingBlogStrip'
import { LandingClosingCta } from '@/components/landing/LandingClosingCta'

export function LandingPage() {
  return (
    <div className="landing-page relative min-h-screen font-sans text-ink">
      <LandingPageBackdrop />
      <div className="relative z-[1]">
      <LandingNav />
      <LandingTabProvider>
        <main>
          <LandingKeitaroHero />
          <LandingDashboardShowcase />
          <LandingPillarSection pillar="track" sectionId="features" />
          <LandingPillarSection pillar="analyze" sectionId="pillar-analyze" />
          <LandingPillarSection pillar="optimize" sectionId="pillar-optimize" />
          <LandingPillarSection pillar="scale" sectionId="pillar-scale" />
          <LandingTeamSection />
          <LandingSupportSection />
          <LandingSocialProof />
          <div id="blog">
            <LandingBlogStrip />
          </div>
          <LandingClosingCta />
        </main>
      </LandingTabProvider>
      </div>
    </div>
  )
}
