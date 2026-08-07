// ── Lyrics alignment helpers (pure, testable) ──────────────────────────────────
//
// Shared by useWhisperFollower: normalize text, resample PCM to 16 kHz, and align
// a recognized utterance to the lyric script to decide which line the singer is on.

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Linear-interpolation resampler. Whisper expects 16 kHz; an AudioContext created
// at 16 kHz may be snapped to a nearby rate by the browser, so we resample
// defensively.
export function resample(input: Float32Array, fromRate: number, toRate = 16000): Float32Array {
  if (fromRate === toRate || input.length === 0) return input
  const ratio = fromRate / toRate
  const newLen = Math.max(1, Math.round(input.length / ratio))
  const out = new Float32Array(newLen)
  for (let i = 0; i < newLen; i++) {
    const idx = i * ratio
    const i0 = Math.floor(idx)
    const i1 = Math.min(input.length - 1, i0 + 1)
    const frac = idx - i0
    out[i] = input[i0] * (1 - frac) + input[i1] * frac
  }
  return out
}

// Score each candidate line in a small window past the current line by token
// overlap with the recognized words, and return the best match (or null).
// Deliberately forgiving: sung audio transcribes poorly, so a single strong word
// match is enough to advance.
export function alignRecognizedText(
  text: string,
  currentLine: number,
  lyrics: { text: string }[],
  windowSize = 5,
  minScore = 0.34,
): number | null {
  const words = normalize(text).split(' ').filter(Boolean)
  if (words.length === 0) return null

  let bestOffset = -1
  let bestScore = 0

  for (let i = 0; i < windowSize; i++) {
    const line = lyrics[currentLine + i]
    if (!line) break
    const lineWords = normalize(line.text).split(' ').filter(Boolean)
    if (lineWords.length === 0) continue

    let matches = 0
    for (const w of words) {
      if (lineWords.includes(w)) { matches++; continue }
      // partial matches (e.g. "gonna" vs "gonna"), only for non-trivial words
      if (lineWords.some(lw => lw.length > 3 && (lw.includes(w) || w.includes(lw)))) matches++
    }
    const score = matches / lineWords.length
    if (score > bestScore) { bestScore = score; bestOffset = i }
  }

  if (bestOffset >= 0 && bestScore >= minScore) return currentLine + bestOffset
  return null
}
