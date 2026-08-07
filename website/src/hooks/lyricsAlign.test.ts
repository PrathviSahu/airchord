import { describe, expect, it } from 'vitest'
import { normalize, resample, alignRecognizedText } from './lyricsAlign'

const lyrics = [
  { text: 'I found a love for me' },
  { text: "Darling, just dive right in and follow my lead" },
  { text: 'Well, I found a girl, beautiful and sweet' },
  { text: 'Oh, I never knew you were the someone waiting for me' },
]

describe('lyricsAlign', () => {
  it('normalizes punctuation and casing', () => {
    expect(normalize("Don't! STOP.  The  Music")).toBe('don t stop the music')
  })

  it('resamples length proportionally', () => {
    const input = new Float32Array([0, 0.5, 1, 0.5, 0, -0.5, -1, -0.5])
    const out = resample(input, 8000, 16000) // upsample 2x
    expect(out.length).toBe(16)
    // endpoints preserved by linear interpolation
    expect(out[0]).toBeCloseTo(0, 5)
    expect(out[out.length - 1]).toBeCloseTo(-0.5, 5)
  })

  it('returns null for empty transcripts', () => {
    expect(alignRecognizedText('', 0, lyrics)).toBeNull()
    expect(alignRecognizedText('...', 0, lyrics)).toBeNull()
  })

  it('advances to the matching line on a strong word', () => {
    // current line 0; recognized words match line 2 ("found a girl")
    expect(alignRecognizedText('i found a girl beautiful', 0, lyrics)).toBe(2)
  })

  it('does not jump backwards or too far ahead', () => {
    // recognized words only match line 3; window is 5 lines, so target is 3
    expect(alignRecognizedText('never knew you were the someone', 0, lyrics)).toBe(3)
  })

  it('returns null when nothing matches', () => {
    expect(alignRecognizedText('banana spaceship computer', 0, lyrics)).toBeNull()
  })

  it('respects the current line offset', () => {
    // starting at line 1, "found a girl" now lives on line 2 (offset +1)
    expect(alignRecognizedText('found a girl', 1, lyrics)).toBe(2)
  })
})
