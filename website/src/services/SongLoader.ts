// ── Song Loader Service ───────────────────────────────────────────────────────
//
// Loads songs from JSON files instead of hardcoded TypeScript.
// This enables:
//   - Easier editing
//   - Translator contributions
//   - User-created songs
//   - Future online sync
//
// SongLoader
//   ↓
// JSON files (songs/*.json)
//   ↓
// Song object

import type { Song } from '../core/types'

// Dynamic JSON imports — Vite handles these as lazy-loaded chunks
const songImporters: Record<string, () => Promise<any>> = {
  'perfect': () => import('../songs/perfect.json'),
  'tum-hi-ho': () => import('../songs/tum-hi-ho.json'),
  'kesariya': () => import('../songs/kesariya.json'),
  'hotel-california': () => import('../songs/hotel-california.json'),
  'channa-mereya': () => import('../songs/channa-mereya.json'),
  'kabira': () => import('../songs/kabira.json'),
  'riptide': () => import('../songs/riptide.json'),
  'hallelujah': () => import('../songs/hallelujah.json'),
  'apna-bana-le': () => import('../songs/apna-bana-le.json'),
  'agar-tum-saath-ho': () => import('../songs/agar-tum-saath-ho.json'),
  'jeena-jeena': () => import('../songs/jeena-jeena.json'),
  'kal-ho-naa-ho': () => import('../songs/kal-ho-naa-ho.json'),
  'pani-da-rang': () => import('../songs/pani-da-rang.json'),
  'tera-ban-jaunga': () => import('../songs/tera-ban-jaunga.json'),
  'pehli-nazar-mein': () => import('../songs/pehli-nazar-mein.json'),
  'tu-jaane-na': () => import('../songs/tu-jaane-na.json'),
  'shape-of-you': () => import('../songs/shape-of-you.json'),
  'count-on-me': () => import('../songs/count-on-me.json'),
  'zombie': () => import('../songs/zombie.json'),
}

// Song IDs in display order
const SONG_IDS = Object.keys(songImporters)

// Cache for loaded songs
const songCache = new Map<string, Song>()

/**
 * Load a single song by ID. Returns cached version if available.
 */
export async function loadSong(id: string): Promise<Song | null> {
  if (songCache.has(id)) return songCache.get(id)!

  const loader = songImporters[id]
  if (!loader) return null

  try {
    const mod = await loader()
    // Vite imports JSON as default export; cast to Song
    const song = ((mod as any).default || mod) as Song
    songCache.set(id, song)
    return song
  } catch (err) {
    console.warn(`[SongLoader] Failed to load song "${id}":`, err)
    return null
  }
}

/**
 * Load all songs. Returns in display order.
 */
export async function loadAllSongs(): Promise<Song[]> {
  const songs: Song[] = []

  // Check cache first for all
  const allCached = SONG_IDS.every(id => songCache.has(id))
  if (allCached) {
    return SONG_IDS.map(id => songCache.get(id)!)
  }

  // Load all in parallel
  const results = await Promise.allSettled(
    SONG_IDS.map(id => loadSong(id))
  )

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      songs.push(result.value)
    }
  }

  return songs
}

/**
 * Get all available song IDs (for building song lists without loading full data).
 */
export function getSongIds(): string[] {
  return [...SONG_IDS]
}

/**
 * Get a cached song synchronously. Returns null if not yet loaded.
 */
export function getCachedSong(id: string): Song | null {
  return songCache.get(id) ?? null
}

/**
 * Pre-cache a list of song IDs (for prefetching on idle).
 */
export async function precacheSongs(ids: string[]): Promise<void> {
  await Promise.allSettled(ids.map(id => loadSong(id)))
}
