// ── Preset Named Gesture Profiles for Finger-to-Chord Assignments ────────────

export interface GestureProfile {
  id: string
  name: string
  description: string
  mapping: string[] // Array of 6 chords corresponding to 0-5 extended fingers
}

export const PRESET_GESTURE_PROFILES: GestureProfile[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Standard open-position guitar chords',
    mapping: ['Em', 'Am', 'G', 'C', 'D', 'F'],
  },
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Essential 4-chord progression (Em, Am, D, C, G, B7)',
    mapping: ['Em', 'Am', 'D', 'C', 'G', 'B7'],
  },
  {
    id: 'pop',
    name: 'Pop / Acoustic',
    description: 'Chart-topping pop chords (C, G, Am, F, Dm, Em)',
    mapping: ['C', 'G', 'Am', 'F', 'Dm', 'Em'],
  },
  {
    id: 'rock',
    name: 'Campfire Rock',
    description: 'Classic rock power chords (A, E, D, G, Bm, F#m)',
    mapping: ['A', 'E', 'D', 'G', 'Bm', 'F#m'],
  },
  {
    id: 'worship',
    name: 'Worship / Ballad',
    description: 'Emotional worship progressions (G, C, D, Em, Am7, Dsus4)',
    mapping: ['G', 'C', 'D', 'Em', 'Am', 'B7'],
  },
  {
    id: 'custom',
    name: 'Custom Profile',
    description: 'User customized gesture mappings',
    mapping: ['Em', 'Am', 'D', 'C', 'G', 'B7'],
  },
]

export function getChordForFingers(profile: GestureProfile, count: number): string {
  if (count >= 0 && count < profile.mapping.length) {
    return profile.mapping[count]
  }
  return profile.mapping[0] || 'Em'
}

export function getProfileById(id: string): GestureProfile {
  return PRESET_GESTURE_PROFILES.find(p => p.id === id) || PRESET_GESTURE_PROFILES[0]
}
