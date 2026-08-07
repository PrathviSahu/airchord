// ── useTransport Hook ─────────────────────────────────────────────────────────
//
// React hook for subscribing to transport state changes from the TransportEngine.
// Provides beat, measure, section, chord, line, and position data.

import { useState, useEffect, useRef, useCallback } from 'react'
import { eventBus } from '../core/EventBus'
import type { TransportState } from '../core/types'

interface UseTransportOptions {
  bpm?: number
  enabled?: boolean
}

export function useTransport(options: UseTransportOptions = {}) {
  const { bpm = 60, enabled = true } = options

  const [state, setState] = useState<TransportState>({
    playing: false,
    positionSec: 0,
    beat: -1,
    measure: 1,
    section: 'Verse',
    currentChord: 'G',
    currentLine: 0,
  })

  const [isPlaying, setIsPlaying] = useState(false)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [currentBeat, setCurrentBeat] = useState(-1)
  const [currentLine, setCurrentLine] = useState(0)
  const [currentSection, setCurrentSection] = useState('Verse')
  const [currentChord, setCurrentChord] = useState('G')

  useEffect(() => {
    if (!enabled) return

    const unsubs = [
      eventBus.on('transport:tick', (tickState) => {
        setState(tickState)
        setElapsedSec(tickState.positionSec)
        setCurrentBeat(tickState.beat)
        setCurrentLine(tickState.currentLine)
        setCurrentSection(tickState.section)
        setCurrentChord(tickState.currentChord)
      }),
      eventBus.on('transport:start', () => {
        setIsPlaying(true)
      }),
      eventBus.on('transport:pause', () => {
        setIsPlaying(false)
      }),
      eventBus.on('transport:stop', () => {
        setIsPlaying(false)
        setElapsedSec(0)
        setCurrentBeat(-1)
        setCurrentLine(0)
      }),
    ]

    return () => unsubs.forEach(unsub => unsub())
  }, [enabled])

  return {
    state,
    isPlaying,
    elapsedSec,
    currentBeat,
    currentLine,
    currentSection,
    currentChord,
    bpm,
  }
}
