import { describe, expect, it } from 'vitest'
import { Humanizer, HUMANIZER_PRESETS } from './Humanizer'

describe('Humanizer Engine', () => {
  it('creates with named presets', () => {
    const h = new Humanizer('natural')
    const params = h.getParams()
    expect(params.timingJitterMs).toBe(3.5)
    expect(params.velocityVariation).toBe(0.08)
    expect(params.pitchDriftCents).toBe(2.5)
  })

  it('tight preset has minimal jitter', () => {
    const h = new Humanizer('tight')
    const params = h.getParams()
    expect(params.timingJitterMs).toBeLessThanOrEqual(2)
    expect(params.deadNoteProbability).toBeLessThanOrEqual(0.05)
  })

  it('loose preset has maximum jitter', () => {
    const h = new Humanizer('loose')
    const params = h.getParams()
    expect(params.timingJitterMs).toBeGreaterThan(4)
    expect(params.velocityVariation).toBeGreaterThan(0.10)
  })

  it('humanizes a strum with correct number of notes', () => {
    const h = new Humanizer('natural')
    const voicing = ['G2', 'B2', 'D3', 'G3', 'B3', 'G4']
    const result = h.humanizeStrum(voicing, 'down', 0.5, false)

    expect(result.notes).toHaveLength(6) // all 6 strings active
    expect(result.spreadDuration).toBeGreaterThan(0)
  })

  it('respects muted strings (null) in voicing', () => {
    const h = new Humanizer('natural')
    const voicing = [null, 'A2', 'E3', 'A3', 'C#4', 'E4']
    const result = h.humanizeStrum(voicing, 'down', 0.5, false)

    expect(result.notes).toHaveLength(5) // string 0 muted
    expect(result.notes.every(n => n.note !== null)).toBe(true)
  })

  it('applies timing jitter within bounds', () => {
    const h = new Humanizer('tight') // minimal jitter
    const voicing = ['G2', 'B2', 'D3', 'G3', 'B3', 'G4']
    const params = h.getParams()

    // Run many times to check statistical bounds
    for (let i = 0; i < 50; i++) {
      const result = h.humanizeStrum(voicing, 'down', 0.5, false)
      for (const note of result.notes) {
        // Timing should be non-negative
        expect(note.delaySec).toBeGreaterThanOrEqual(0)
        // Volume should be within valid range
        expect(note.volume).toBeGreaterThan(0)
        expect(note.volume).toBeLessThanOrEqual(1)
        // Playback rate should be near 1.0 (±pitch drift)
        expect(note.playbackRate).toBeGreaterThan(0.99)
        expect(note.playbackRate).toBeLessThan(1.01)
      }
    }
  })

  it('down strum goes low-to-high string order', () => {
    const h = new Humanizer('tight')
    const voicing = ['G2', 'B2', 'D3', 'G3', 'B3', 'G4']
    const result = h.humanizeStrum(voicing, 'down', 0.5, false)

    // First note should be lowest string (0)
    expect(result.notes[0].stringIndex).toBe(0)
    // Last note should be highest string (5)
    expect(result.notes[result.notes.length - 1].stringIndex).toBe(5)
  })

  it('up strum goes high-to-low string order', () => {
    const h = new Humanizer('tight')
    const voicing = ['G2', 'B2', 'D3', 'G3', 'B3', 'G4']
    const result = h.humanizeStrum(voicing, 'up', 0.5, false)

    expect(result.notes[0].stringIndex).toBe(5)
    expect(result.notes[result.notes.length - 1].stringIndex).toBe(0)
  })

  it('chord change can trigger fret squeak', () => {
    const h = new Humanizer('loose') // high fret squeak amount
    const voicing = ['G2', 'B2', 'D3', 'G3', 'B3', 'G4']

    let squeakCount = 0
    for (let i = 0; i < 20; i++) {
      const result = h.humanizeStrum(voicing, 'down', 0.5, true)
      if (result.includeFretSqueak) squeakCount++
    }
    // With loose preset (0.5 amount), at least some should have squeak
    expect(squeakCount).toBeGreaterThan(0)
  })

  it('humanizes a single pluck', () => {
    const h = new Humanizer('natural')
    const note = h.humanizePluck('G3', 3, 0.6)

    expect(note.note).toBe('G3')
    expect(note.stringIndex).toBe(3)
    expect(note.volume).toBeGreaterThan(0)
    expect(note.volume).toBeLessThanOrEqual(1)
    expect(note.isDeadNote).toBe(false)
  })

  it('can switch presets at runtime', () => {
    const h = new Humanizer('tight')
    expect(h.getParams().timingJitterMs).toBe(1.5)

    h.setPreset('loose')
    expect(h.getParams().timingJitterMs).toBe(5.5)
  })

  it('can update partial params', () => {
    const h = new Humanizer('natural')
    h.setParams({ timingJitterMs: 10 })
    expect(h.getParams().timingJitterMs).toBe(10)
    // Other params unchanged
    expect(h.getParams().velocityVariation).toBe(0.08)
  })
})
