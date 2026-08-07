import { describe, expect, it } from 'vitest'
import { FingerstyleEngine, FINGERSTYLE_PATTERNS } from './FingerstyleEngine'

describe('Fingerstyle Engine', () => {
  it('creates with named pattern', () => {
    const fs = new FingerstyleEngine('travis')
    expect(fs.getPattern().name).toBe('Travis Picking')
  })

  it('has all expected preset patterns', () => {
    expect(FINGERSTYLE_PATTERNS.travis).toBeDefined()
    expect(FINGERSTYLE_PATTERNS.arpeggio).toBeDefined()
    expect(FINGERSTYLE_PATTERNS.waltz).toBeDefined()
    expect(FINGERSTYLE_PATTERNS.bollywood).toBeDefined()
    expect(FINGERSTYLE_PATTERNS.worship).toBeDefined()
    expect(FINGERSTYLE_PATTERNS.campfire).toBeDefined()
  })

  it('each pattern has events with valid timing', () => {
    for (const [name, pattern] of Object.entries(FINGERSTYLE_PATTERNS)) {
      for (const event of pattern.events) {
        expect(event.timingMs, `${name} event timing`).toBeGreaterThanOrEqual(0)
        expect(event.velocity, `${name} event velocity`).toBeGreaterThan(0)
        expect(event.velocity).toBeLessThanOrEqual(1)
        expect(['P', 'I', 'M', 'A']).toContain(event.finger)
      }
    }
  })

  it('gets next notes for a given voicing', () => {
    const fs = new FingerstyleEngine('travis')
    const voicing = ['E2', 'B2', 'E3', 'G3', 'B3', 'E4']
    const bpm = 90

    const notes = fs.getNextNotes(voicing, bpm, 0)
    // At time 0, should get at least the first note (P thumb on bass)
    expect(notes.length).toBeGreaterThanOrEqual(1)
  })

  it('respects muted strings', () => {
    const fs = new FingerstyleEngine('arpeggio')
    const voicing = [null, 'A2', 'E3', 'A3', 'C4', 'E4']
    const bpm = 90

    const notes = fs.getNextNotes(voicing, bpm, 0)
    for (const note of notes) {
      expect(note.note).not.toBeNull()
    }
  })

  it('can switch pattern at runtime', () => {
    const fs = new FingerstyleEngine('travis')
    expect(fs.getPattern().name).toBe('Travis Picking')

    fs.setPattern('waltz')
    expect(fs.getPattern().name).toBe('Waltz (3/4)')
  })

  it('thumb (P) has highest velocity in patterns', () => {
    for (const [name, pattern] of Object.entries(FINGERSTYLE_PATTERNS)) {
      const thumbEvents = pattern.events.filter(e => e.finger === 'P')
      const otherEvents = pattern.events.filter(e => e.finger !== 'P')

      if (thumbEvents.length > 0 && otherEvents.length > 0) {
        const avgThumb = thumbEvents.reduce((sum, e) => sum + e.velocity, 0) / thumbEvents.length
        const avgOther = otherEvents.reduce((sum, e) => sum + e.velocity, 0) / otherEvents.length
        // Thumb should generally be louder (bass emphasis)
        expect(avgThumb, `${name} thumb velocity`).toBeGreaterThanOrEqual(avgOther * 0.8)
      }
    }
  })

  it('notes are sorted by delay', () => {
    const fs = new FingerstyleEngine('travis')
    const voicing = ['E2', 'B2', 'E3', 'G3', 'B3', 'E4']
    const bpm = 120

    const notes = fs.getNextNotes(voicing, bpm, 0)
    for (let i = 1; i < notes.length; i++) {
      expect(notes[i].delaySec).toBeGreaterThanOrEqual(notes[i - 1].delaySec)
    }
  })
})
