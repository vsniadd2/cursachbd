import { useCallback, useEffect, useRef, useState } from 'react'

const ChimeContext =
  window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

export function useNotificationSound(userId: string) {
  const key = `flexora.notification-sound.${userId}`
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(key) === 'on'
    } catch {
      return false
    }
  })
  const enabledRef = useRef(enabled)
  const context = useRef<AudioContext | null>(null)

  const play = useCallback((preview = false) => {
    const audio = context.current
    if (!enabledRef.current || audio?.state !== 'running') return
    if (!preview && (document.hidden || !document.hasFocus())) return

    try {
      for (const [frequency, offset] of [
        [659.25, 0],
        [880, 0.13],
      ]) {
        const start = audio.currentTime + offset
        const oscillator = audio.createOscillator()
        const volume = audio.createGain()
        oscillator.frequency.value = frequency
        volume.gain.setValueAtTime(0.001, start)
        volume.gain.exponentialRampToValueAtTime(0.095, start + 0.035)
        volume.gain.exponentialRampToValueAtTime(0.001, start + 0.24)
        oscillator.connect(volume)
        volume.connect(audio.destination)
        oscillator.start(start)
        oscillator.stop(start + 0.25)
        oscillator.onended = () => {
          oscillator.disconnect()
          volume.disconnect()
        }
      }
    } catch {
      // The inbox stays usable if the audio device becomes unavailable.
    }
  }, [])

  const unlock = useCallback(() => {
    if (!enabledRef.current || !ChimeContext) return
    try {
      const audio = (context.current ??= new ChimeContext())
      if (audio.state !== 'running') return audio.resume().catch(() => undefined)
    } catch {
      // Audio may be unavailable on this device.
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    const onGesture = () => void unlock()
    window.addEventListener('click', onGesture)
    window.addEventListener('keydown', onGesture)
    return () => {
      window.removeEventListener('click', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
  }, [enabled, unlock])

  useEffect(
    () => () => {
      const audio = context.current
      context.current = null
      if (audio) void audio.close().catch(() => undefined)
    },
    [],
  )

  function toggle() {
    const next = !enabledRef.current
    enabledRef.current = next
    setEnabled(next)
    try {
      localStorage.setItem(key, next ? 'on' : 'off')
    } catch {
      // The preference still applies for the current session.
    }
    if (next) void Promise.resolve(unlock()).then(() => play(true))
  }

  return { enabled, available: Boolean(ChimeContext), toggle, play }
}
