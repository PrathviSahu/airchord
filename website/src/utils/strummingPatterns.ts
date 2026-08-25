// ── Indian Guitar Strumming Patterns Library ──────────────────────────────────
//
// Pattern notation:
//   D  = downstroke · U  = upstroke · X  = muted strum · .  = rest
//
// Level: 1=Beginner · 2=Intermediate · 3=Advanced

export type StrokeToken = 'D' | 'U' | 'X' | '.'

export interface StrumPattern {
  id: string
  name: string
  indianName?: string
  category: string
  level: 1 | 2 | 3
  timeSignature: '4/4' | '3/4' | '6/8' | '5/4' | '7/8' | '8/8'
  pattern: StrokeToken[]
  display: string
  bpmRange: [number, number]
  accentBeats: number[]
  songs: string[]
  tip: string
  style: 'pop' | 'ballad' | 'campfire' | 'worship'
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1 — BEGINNER
// ─────────────────────────────────────────────────────────────────────────────
export const BEGINNER_PATTERNS: StrumPattern[] = [
  {
    id: 'basic_down',
    name: 'All Down',
    indianName: 'Sada Taal',
    category: 'Beginner',
    level: 1,
    timeSignature: '4/4',
    pattern: ['D', 'D', 'D', 'D'],
    display: '↓ ↓ ↓ ↓',
    bpmRange: [60, 90],
    accentBeats: [0, 2],
    songs: ['Tere Mere Sapne (Mohit Chauhan)'],
    tip: 'Keep your wrist loose. One downstroke per beat — feel the pulse.',
    style: 'campfire',
  },
  {
    id: 'basic_d_du',
    name: 'D D-U',
    indianName: 'Basic Taal',
    category: 'Beginner',
    level: 1,
    timeSignature: '4/4',
    pattern: ['D', 'D', 'U', 'D', 'D', 'U'],
    display: '↓ ↓ ↑ ↓ ↓ ↑',
    bpmRange: [60, 100],
    accentBeats: [0, 3],
    songs: ['Maa (Taare Zameen Par)', 'Ae Dil Hai Mushkil (slow)'],
    tip: 'The upstroke on beat 3 & 6 gives a gentle bounce — keep it light.',
    style: 'ballad',
  },
  {
    id: 'waltz_basic',
    name: 'Waltz Strum',
    indianName: 'Teen Taal Strum',
    category: 'Beginner',
    level: 1,
    timeSignature: '3/4',
    pattern: ['D', 'D', 'U'],
    display: '↓ ↓ ↑',
    bpmRange: [60, 100],
    accentBeats: [0],
    songs: ['Dum Dum Diga Diga', 'Meri Neend (Kehna Hi Kya)'],
    tip: 'Count "1-2-3" aloud. Beat 1 is the strong bass strum.',
    style: 'campfire',
  },
  {
    id: 'campfire_folk',
    name: 'Folk Campfire',
    indianName: 'Desi Folk',
    category: 'Beginner',
    level: 1,
    timeSignature: '4/4',
    pattern: ['D', '.', 'D', 'U', 'D', 'U'],
    display: '↓ • ↓ ↑ ↓ ↑',
    bpmRange: [70, 110],
    accentBeats: [0, 4],
    songs: ['Lag Ja Gale', 'Tere Bina (Guru)'],
    tip: 'The rest on beat 2 creates breathing space — classic folk feel.',
    style: 'campfire',
  },
  {
    id: 'pop_4beat',
    name: '4-Beat Pop',
    category: 'Beginner',
    level: 1,
    timeSignature: '4/4',
    pattern: ['D', 'D', 'U', 'U', 'D', 'U'],
    display: '↓ ↓ ↑ ↑ ↓ ↑',
    bpmRange: [80, 130],
    accentBeats: [0, 4],
    songs: ['Kuch Kuch Hota Hai title', 'Dil Dhadkne Do'],
    tip: 'Bread-and-butter Bollywood pop. Keep beats 1 & 5 strong.',
    style: 'pop',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 2 — INTERMEDIATE
// ─────────────────────────────────────────────────────────────────────────────
export const INTERMEDIATE_PATTERNS: StrumPattern[] = [
  {
    id: 'bollywood_8beat',
    name: 'Bollywood 8-Beat',
    indianName: 'Filmi Taal',
    category: 'Intermediate',
    level: 2,
    timeSignature: '4/4',
    pattern: ['D', '.', 'D', 'U', '.', 'U', 'D', 'U'],
    display: '↓ • ↓ ↑ • ↑ ↓ ↑',
    bpmRange: [90, 130],
    accentBeats: [0, 6],
    songs: ['Tum Hi Ho (Aashiqui 2)', 'Kal Ho Na Ho', 'Tujhe Kitna Chahne Lage'],
    tip: 'The two rests are what make this feel emotional — control them.',
    style: 'ballad',
  },
  {
    id: 'romantic_ballad',
    name: 'Romantic Ballad',
    indianName: 'Pyaar Taal',
    category: 'Intermediate',
    level: 2,
    timeSignature: '4/4',
    pattern: ['D', 'D', 'U', '.', 'D', 'U'],
    display: '↓ ↓ ↑ • ↓ ↑',
    bpmRange: [65, 90],
    accentBeats: [0, 4],
    songs: ['Channa Mereya', 'Raabta', 'Pehla Nasha'],
    tip: 'Slow it down and let the rest breathe. Ideal for emotional ballads.',
    style: 'ballad',
  },
  {
    id: 'mute_groove',
    name: 'Muted Groove',
    indianName: 'Dhamaka Beat',
    category: 'Intermediate',
    level: 2,
    timeSignature: '4/4',
    pattern: ['D', 'X', 'D', 'U', 'X', 'D', 'U', 'X'],
    display: '↓ ✕ ↓ ↑ ✕ ↓ ↑ ✕',
    bpmRange: [100, 140],
    accentBeats: [0, 2, 5],
    songs: ['Badtameez Dil', 'Senorita (ZNMD)', 'Gallan Goodiyaan'],
    tip: 'Palm-mute (X) on even beats creates that driving Bollywood dance-floor feel.',
    style: 'pop',
  },
  {
    id: 'punjabi_folk',
    name: 'Punjabi Folk',
    indianName: 'Dhol Beat Strum',
    category: 'Intermediate',
    level: 2,
    timeSignature: '4/4',
    pattern: ['D', 'D', 'X', 'D', 'U', 'D', 'X', 'U'],
    display: '↓ ↓ ✕ ↓ ↑ ↓ ✕ ↑',
    bpmRange: [110, 160],
    accentBeats: [0, 3],
    songs: ['Ik Vaari Aa (Raabta)', 'Jind Mahi', 'Chunar'],
    tip: "Mimic the dhol's 'na dha' accent. Mutes should be crisp and percussive.",
    style: 'pop',
  },
  {
    id: 'waltz_intermediate',
    name: 'Waltz Flow',
    indianName: 'Teentaal Strumming',
    category: 'Intermediate',
    level: 2,
    timeSignature: '3/4',
    pattern: ['D', 'U', 'U', 'D', 'U', 'U'],
    display: '↓ ↑ ↑ ↓ ↑ ↑',
    bpmRange: [80, 120],
    accentBeats: [0, 3],
    songs: ['Meri Maa (Yaariyan)', 'O Maahi', 'Paan Singh Tomar theme'],
    tip: 'Think "BOOM-chick-chick". The downstroke is the bass, upstrokes are treble.',
    style: 'campfire',
  },
  {
    id: 'sufi_rock',
    name: 'Sufi Rock',
    indianName: 'Qawwali Beat',
    category: 'Intermediate',
    level: 2,
    timeSignature: '4/4',
    pattern: ['D', 'D', 'U', 'X', 'D', 'U', 'D', 'X'],
    display: '↓ ↓ ↑ ✕ ↓ ↑ ↓ ✕',
    bpmRange: [90, 130],
    accentBeats: [0, 1, 4, 6],
    songs: ['Khwaja Mere Khwaja', 'Iktara (Wake Up Sid)', 'Bulleya'],
    tip: 'Let the chord ring on beat 1 & 5, mute sharply on 4 & 8.',
    style: 'worship',
  },
  {
    id: 'carnatic_rock',
    name: 'South Indian Pop',
    indianName: 'Tamil Beat',
    category: 'Intermediate',
    level: 2,
    timeSignature: '4/4',
    pattern: ['D', 'U', 'D', 'U', 'X', 'D', 'U', 'X'],
    display: '↓ ↑ ↓ ↑ ✕ ↓ ↑ ✕',
    bpmRange: [100, 150],
    accentBeats: [0, 5],
    songs: ['Naane Varuven (AR Rahman)', 'Munbe Va', 'Jai Ho theme'],
    tip: 'AR Rahman groove — even 8ths with muted stabs. Keep it tight.',
    style: 'pop',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 3 — ADVANCED
// ─────────────────────────────────────────────────────────────────────────────
export const ADVANCED_PATTERNS: StrumPattern[] = [
  {
    id: 'rajasthani_folk',
    name: 'Rajasthani Folk',
    indianName: 'Manganiyar Beat',
    category: 'Advanced',
    level: 3,
    timeSignature: '4/4',
    pattern: ['D', 'D', 'U', 'D', 'U', 'X', 'D', 'U', 'D', 'X', 'U', 'D'],
    display: '↓ ↓ ↑ ↓ ↑ ✕ ↓ ↑ ↓ ✕ ↑ ↓',
    bpmRange: [100, 160],
    accentBeats: [0, 3, 6, 9],
    songs: ['Padharo Mhare Desh', 'Kesariya (folk version)', 'Bawara Mann'],
    tip: 'Start slow — build speed over 4 bars. Let the X strokes create polyrhythm.',
    style: 'campfire',
  },
  {
    id: 'bollywood_fast',
    name: 'Bollywood Fast',
    indianName: 'Filmi Dhamaka',
    category: 'Advanced',
    level: 3,
    timeSignature: '4/4',
    pattern: ['D', 'U', 'D', 'X', 'U', 'D', 'U', 'X'],
    display: '↓ ↑ ↓ ✕ ↑ ↓ ↑ ✕',
    bpmRange: [130, 180],
    accentBeats: [0, 5],
    songs: ['Dilbar Dilbar', 'Makhna', 'Balam Pichkari'],
    tip: 'Continuous 16th-note flow — wrist, not elbow. Relax and let it groove.',
    style: 'pop',
  },
  {
    id: 'sixeight_khamaj',
    name: '6/8 Khamaj',
    indianName: 'Dadra Taal',
    category: 'Advanced',
    level: 3,
    timeSignature: '6/8',
    pattern: ['D', 'U', 'U', 'D', 'X', 'U'],
    display: '↓ ↑ ↑ ↓ ✕ ↑',
    bpmRange: [70, 120],
    accentBeats: [0, 3],
    songs: ['Woh Lamhe', 'Dil To Pagal Hai title', 'Saathiya'],
    tip: 'Dadra is 6-beat — feel "1-2-3 | 4-5-6" not "1-2 | 1-2 | 1-2".',
    style: 'ballad',
  },
  {
    id: 'qawwali_16beat',
    name: 'Qawwali 16-Beat',
    indianName: 'Jhaptaal Strum',
    category: 'Advanced',
    level: 3,
    timeSignature: '4/4',
    pattern: ['D', 'D', 'U', 'X', 'D', 'U', 'D', 'X', 'D', 'U', 'X', 'D', 'U', 'D', 'U', 'X'],
    display: '↓ ↓ ↑ ✕ ↓ ↑ ↓ ✕ ↓ ↑ ✕ ↓ ↑ ↓ ↑ ✕',
    bpmRange: [90, 140],
    accentBeats: [0, 4, 8, 11],
    songs: ['Kun Faya Kun (Rockstar)', 'Man Kunto Maula', 'Tum Ho (Rockstar)'],
    tip: 'Play it at half speed first. The pattern groups into 4+4+4+4 internally.',
    style: 'worship',
  },
  {
    id: 'fingerstyle_ar',
    name: 'AR Rahman Groove',
    indianName: 'Rahman Taal',
    category: 'Advanced',
    level: 3,
    timeSignature: '4/4',
    pattern: ['D', 'U', 'X', 'U', 'D', 'X', 'U', 'D', 'U', 'X'],
    display: '↓ ↑ ✕ ↑ ↓ ✕ ↑ ↓ ↑ ✕',
    bpmRange: [100, 140],
    accentBeats: [0, 4, 7],
    songs: ['Vande Mataram (1997)', 'Jana Gana Mana (Rahman)', 'Maa Tujhe Salaam'],
    tip: 'Syncopated mutes are the signature. Accent the downstrokes at 1, 5, 8.',
    style: 'worship',
  },
  {
    id: 'seven_beat',
    name: '7/8 Rupak',
    indianName: 'Rupak Taal',
    category: 'Advanced',
    level: 3,
    timeSignature: '7/8',
    pattern: ['D', 'U', 'D', '.', 'D', 'U', 'D'],
    display: '↓ ↑ ↓ • ↓ ↑ ↓',
    bpmRange: [80, 120],
    accentBeats: [0, 2, 4],
    songs: ['Deva Shree Ganesha (Agneepath)', 'O Saya (Slumdog)', 'Sadda Haq (Rockstar)'],
    tip: 'Count 3+4 or 2+2+3. 7/8 is limping — embrace the asymmetry!',
    style: 'pop',
  },
  {
    id: 'indie_folk_adv',
    name: 'Indie Folk Advanced',
    indianName: 'New-Wave Hindi',
    category: 'Advanced',
    level: 3,
    timeSignature: '4/4',
    pattern: ['D', 'X', 'U', 'D', 'U', 'X', 'D', 'U'],
    display: '↓ ✕ ↑ ↓ ↑ ✕ ↓ ↑',
    bpmRange: [90, 130],
    accentBeats: [0, 3, 6],
    songs: ['Kabira (Yeh Jawaani Hai Deewani)', 'Dooba Dooba (Silk Route)', 'Agar Tum Saath Ho'],
    tip: 'The X on beat 2 is a dead-string percussive slap — very indie.',
    style: 'campfire',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Master export
// ─────────────────────────────────────────────────────────────────────────────
export const ALL_STRUM_PATTERNS: StrumPattern[] = [
  ...BEGINNER_PATTERNS,
  ...INTERMEDIATE_PATTERNS,
  ...ADVANCED_PATTERNS,
]

export function getStrumPattern(id: string): StrumPattern | undefined {
  return ALL_STRUM_PATTERNS.find(p => p.id === id)
}

export function getPatternsByLevel(level: 1 | 2 | 3): StrumPattern[] {
  return ALL_STRUM_PATTERNS.filter(p => p.level === level)
}

export const LEVEL_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
}

export const LEVEL_COLORS: Record<1 | 2 | 3, { bg: string; border: string; text: string }> = {
  1: { bg: 'rgba(74, 222, 128, 0.12)', border: 'rgba(74, 222, 128, 0.4)', text: '#4ade80' },
  2: { bg: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.4)', text: '#fbbf24' },
  3: { bg: 'rgba(248, 113, 113, 0.12)', border: 'rgba(248, 113, 113, 0.4)', text: '#f87171' },
}
