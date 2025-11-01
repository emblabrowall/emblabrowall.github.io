import { useEffect, useRef, useState } from 'react'

interface SoundEffectsProps {
  enabled?: boolean
}

export function SoundEffects({ enabled = true }: SoundEffectsProps) {
  const [soundsLoaded, setSoundsLoaded] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Initialize Web Audio API
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    setSoundsLoaded(true)

    // Add click sound to buttons
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        playClickSound()
      }
    }

    // Add hover sound to interactive elements
    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.classList.contains('hover-sound')
      ) {
        playHoverSound()
      }
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('mouseenter', handleHover, true)

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('mouseenter', handleHover, true)
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [enabled])

  const playClickSound = () => {
    if (!audioContextRef.current || !enabled) return

    const context = audioContextRef.current
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    oscillator.frequency.setValueAtTime(800, context.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(600, context.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.1, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1)

    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 0.1)
  }

  const playHoverSound = () => {
    if (!audioContextRef.current || !enabled) return

    const context = audioContextRef.current
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    oscillator.frequency.setValueAtTime(1200, context.currentTime)
    
    gainNode.gain.setValueAtTime(0.03, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05)

    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 0.05)
  }

  return null
}

export function useSoundEffect() {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const playSuccess = () => {
    if (!audioContextRef.current) return

    const context = audioContextRef.current
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    oscillator.frequency.setValueAtTime(600, context.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(900, context.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.15, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2)

    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 0.2)
  }

  const playError = () => {
    if (!audioContextRef.current) return

    const context = audioContextRef.current
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    oscillator.frequency.setValueAtTime(300, context.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(200, context.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.15, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15)

    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 0.15)
  }

  return { playSuccess, playError }
}
