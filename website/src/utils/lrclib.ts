// ── lrclib.net – free synced lyrics fetcher (no API key needed) ─────────────
// Docs: https://lrclib.net/docs

export interface SyncedLine {
  time: number   // seconds from start
  text: string
}

interface LrclibResponse {
  syncedLyrics?: string | null
  plainLyrics?:  string | null
  trackName?:    string
  artistName?:   string
  duration?:     number
}

// Parse "[mm:ss.xx]" or "[mm:ss:xx]" or "[mm:ss]" → { time, text }[]
function parseLRC(lrc: string): SyncedLine[] {
  const lines: SyncedLine[] = []
  for (const raw of lrc.split('\n')) {
    const match = raw.match(/^\[(\d{2}):(\d{2})[\.\:]?(\d{1,3})?\]\s*(.*)$/)
    if (!match) continue
    const min  = parseInt(match[1], 10)
    const sec  = parseInt(match[2], 10)
    const ms   = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0
    const text = match[4].trim()
    if (!text) continue
    lines.push({ time: min * 60 + sec + ms / 1000, text })
  }

  // Shift timestamps if first line starts after a long intro so lyric 0 starts at t=0
  if (lines.length > 0 && lines[0].time > 3) {
    const offset = lines[0].time
    lines.forEach(l => { l.time = Math.max(0, Number((l.time - offset).toFixed(2))) })
  }

  return lines
}

async function fetchWithTimeout(url: string, ms = 3000): Promise<Response> {
  const ctrl = new AbortController()
  const id   = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { signal: ctrl.signal })
  } finally {
    clearTimeout(id)
  }
}

// In-memory cache per session
const cache = new Map<string, SyncedLine[]>()

/**
 * Fetch synced lyrics from lrclib.net (free, no API key).
 * Returns parsed lines or null on failure → caller falls back to local data.
 */
export async function fetchSyncedLyrics(
  songId:      string,
  artist:      string,
  title:       string,
  durationSec?: number,
): Promise<SyncedLine[] | null> {
  if (cache.has(songId)) return cache.get(songId)!

  try {
    const params = new URLSearchParams({
      artist_name: artist,
      track_name:  title,
      ...(durationSec ? { duration: String(Math.round(durationSec)) } : {}),
    })
    const res = await fetchWithTimeout(
      `https://lrclib.net/api/get?${params.toString()}`
    )
    if (!res.ok) return null

    const data: LrclibResponse = await res.json()

    if (data.syncedLyrics) {
      const lines = parseLRC(data.syncedLyrics)
      if (lines.length > 0) {
        cache.set(songId, lines)
        return lines
      }
    }

    // Plain lyrics fallback with even spacing
    if (data.plainLyrics) {
      const plain = data.plainLyrics
        .split('\n').map(t => t.trim()).filter(Boolean)
      const dur = data.duration ?? 240
      const gap = dur / plain.length
      const lines = plain.map((text, i) => ({ time: i * gap, text }))
      cache.set(songId, lines)
      return lines
    }

    return null
  } catch {
    return null
  }
}
