import { useEffect, useRef } from 'react'

/** Progressive enhancement: without JS/observers or with reduced motion, everything stays visible. */
export function useLandingMotion() {
  const rootRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const element = rootRef.current
    if (!element || typeof window.IntersectionObserver !== 'function') return
    const root: HTMLElement = element
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let revealObserver: IntersectionObserver | undefined
    let chartObserver: IntersectionObserver | undefined
    let atmosphereObserver: IntersectionObserver | undefined
    const sections = root.querySelectorAll<HTMLElement>(
      '.fx-section-heading, .fx-start-grid > article, .fx-product-stage, .fx-feature-art, .fx-feature-copy, .fx-faq > h2, .fx-faq details, .fx-final-content, .fx-footer > div, .fx-footer > nav',
    )
    const charts = root.querySelectorAll<HTMLElement>('.fx-preview')
    const atmospheres = root.querySelectorAll<HTMLElement>('.fx-atmosphere')
    function revealFocused(event: FocusEvent) {
      if (!(event.target instanceof Element)) return
      for (const section of sections)
        if (section.contains(event.target)) {
          section.dataset.fxVisible = 'true'
          revealObserver?.unobserve(section)
        }
    }
    function setup() {
      revealObserver?.disconnect()
      chartObserver?.disconnect()
      atmosphereObserver?.disconnect()
      root.classList.remove('fx-motion-ready')
      atmospheres.forEach((atmosphere) => atmosphere.removeAttribute('data-fx-flow'))
      if (preference.matches) return
      sections.forEach((section, index) => {
        section.dataset.fxReveal = 'true'
        // Local stagger rather than a cumulative page-wide delay.
        section.style.setProperty(
          '--fx-reveal-delay',
          `${section.matches('.fx-start-grid > article, .fx-faq details') ? (index % 2) * 80 : 0}ms`,
        )
      })
      charts.forEach((chart) => {
        chart.dataset.fxAnimated = 'true'
      })
      revealObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            if (entry.isIntersecting) {
              ;(entry.target as HTMLElement).dataset.fxVisible = 'true'
              revealObserver?.unobserve(entry.target)
            }
        },
        { threshold: 0.12, rootMargin: '0px 0px -28px 0px' },
      )
      chartObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            if (entry.isIntersecting) {
              ;(entry.target as HTMLElement).dataset.fxPlay = 'true'
              chartObserver?.unobserve(entry.target)
            }
        },
        { threshold: 0.3, rootMargin: '0px 0px -20px 0px' },
      )
      atmosphereObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) entry.target.toggleAttribute('data-fx-flow', entry.isIntersecting)
      })
      root.classList.add('fx-motion-ready')
      sections.forEach((section) => {
        if (!section.dataset.fxVisible) revealObserver?.observe(section)
      })
      charts.forEach((chart) => {
        if (!chart.dataset.fxPlay) chartObserver?.observe(chart)
      })
      atmospheres.forEach((atmosphere) => atmosphereObserver?.observe(atmosphere))
    }
    setup()
    preference.addEventListener('change', setup)
    root.addEventListener('focusin', revealFocused)
    return () => {
      revealObserver?.disconnect()
      chartObserver?.disconnect()
      atmosphereObserver?.disconnect()
      preference.removeEventListener('change', setup)
      root.removeEventListener('focusin', revealFocused)
      root.classList.remove('fx-motion-ready')
    }
  }, [])
  return rootRef
}
