import { LandingPage } from '@/pages/LandingPage'

// The public product page stays available to signed-in visitors as well.
export function PublicHome() {
  return <LandingPage />
}
