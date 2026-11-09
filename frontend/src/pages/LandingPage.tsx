import { LandingNav } from '@/components/landing/LandingNav'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingFeatures } from '@/components/landing/LandingFeatures'
import { LandingCtaFooter } from '@/components/landing/LandingCtaFooter'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingCtaFooter />
      </main>
    </div>
  )
}
