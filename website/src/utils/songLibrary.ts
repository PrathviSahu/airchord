// ── Scalable Extensible Song Database Schema & Seed Data ──────────────────────

export interface TimestampedLyric {
  text: string
  chord: string
  time: number // in seconds from start
  fingerGesture: string // e.g. "✊ Fist (0)", "☝️ Index (1)"
}

export interface SongSection {
  name: 'Intro' | 'Verse' | 'Chorus' | 'Bridge' | 'Outro'
  lyrics: TimestampedLyric[]
}

export interface Song {
  id: string
  title: string
  artist: string
  bpm: number
  timeSignature: string
  key: string
  capo: number
  difficulty: 'Beginner' | 'Easy' | 'Intermediate' | 'Advanced'
  collections: string[]
  duration: string
  defaultStrumPattern: string[]
  displayPattern: string
  fingerstylePattern?: string[]
  chords: string[]
  fingerMapping: string[]
  sections: SongSection[]
}

export const SONG_COLLECTIONS = [
  'All', 'Hindi', 'English', 'Bollywood', 'Pop', 'Rock',
  'Indie', 'Campfire', 'Romantic', 'Worship', 'Beginner', 'Advanced',
]

export const SEED_SONGS: Song[] = [
  // ── Perfect – Ed Sheeran (63 BPM, 6/8, ~6s per line) ──────────────────
  {
    id: 'perfect',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    bpm: 63,
    timeSignature: '6/8',
    key: 'G Major (Ab with Capo 1)',
    capo: 1,
    difficulty: 'Easy',
    collections: ['English', 'Pop', 'Romantic', 'Beginner'],
    duration: '4:23',
    defaultStrumPattern: ['D', '.', 'D', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ ↓ ↑',
    fingerstylePattern: ['P', 'I', 'M', 'A', 'M', 'I'],
    chords: ['G', 'Em', 'C', 'D'],
    fingerMapping: ['G', 'Em', 'C', 'D', 'Am', 'B7'],
    sections: [
      {
        name: 'Verse',
        lyrics: [
          { text: 'I found a love for me',                               chord: 'G',  time: 14,  fingerGesture: '✊ Fist (0) → G' },
          { text: 'Darling, just dive right in and follow my lead',     chord: 'Em', time: 20,  fingerGesture: '☝️ Index (1) → Em' },
          { text: 'Well, I found a girl, beautiful and sweet',           chord: 'C',  time: 26,  fingerGesture: '✌️ Peace (2) → C' },
          { text: 'I never knew you were the someone waiting for me',   chord: 'D',  time: 32,  fingerGesture: '🤟 Three (3) → D' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: "Cause we were just kids when we fell in love",        chord: 'G',  time: 38,  fingerGesture: '✊ Fist (0) → G' },
          { text: 'Not knowing what it was, I will not give you up',    chord: 'Em', time: 44,  fingerGesture: '☝️ Index (1) → Em' },
          { text: 'But darling, just kiss me slow, your heart is all I own', chord: 'C', time: 51, fingerGesture: '✌️ Peace (2) → C' },
          { text: "And in your eyes, you're holding mine",               chord: 'D',  time: 57,  fingerGesture: '🤟 Three (3) → D' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: "Baby, I'm dancing in the dark with you between my arms", chord: 'Em', time: 64, fingerGesture: '☝️ Index (1) → Em' },
          { text: 'Barefoot on the grass, listening to our favorite song', chord: 'C', time: 70, fingerGesture: '✌️ Peace (2) → C' },
          { text: 'When you said you looked a mess, I whispered underneath my breath', chord: 'G', time: 76, fingerGesture: '✊ Fist (0) → G' },
          { text: 'But you heard it, darling, you look perfect tonight', chord: 'D',  time: 82,  fingerGesture: '🤟 Three (3) → D' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Well I found a woman, stronger than anyone I know',   chord: 'G',  time: 96,  fingerGesture: '✊ Fist (0) → G' },
          { text: "She shares my dreams, I hope that someday I'll share her home", chord: 'Em', time: 102, fingerGesture: '☝️ Index (1) → Em' },
          { text: 'I found a love, to carry more than just my secrets',  chord: 'C',  time: 108, fingerGesture: '✌️ Peace (2) → C' },
          { text: 'To carry love, to carry children of our own',         chord: 'D',  time: 114, fingerGesture: '🤟 Three (3) → D' },
        ],
      },
    ],
  },

  // ── Tum Hi Ho – Arijit Singh (92 BPM, ~5s per line) ───────────────────
  {
    id: 'tum-hi-ho',
    title: 'Tum Hi Ho',
    artist: 'Arijit Singh',
    bpm: 92,
    timeSignature: '4/4',
    key: 'E Minor',
    capo: 1,
    difficulty: 'Easy',
    collections: ['Hindi', 'Bollywood', 'Romantic', 'Beginner'],
    duration: '4:22',
    defaultStrumPattern: ['D', '.', 'D', 'U', '.', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ • ↑ ↓ ↑',
    fingerstylePattern: ['P', 'I', 'M', 'A'],
    chords: ['Em', 'Am', 'D', 'C', 'G'],
    fingerMapping: ['Em', 'Am', 'D', 'C', 'G', 'B7'],
    sections: [
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Hum tere bin ab reh nahi sakte',    chord: 'Em', time: 28,  fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Tere bina kya wajood mera',          chord: 'Am', time: 33,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Tujhse juda gar ho jaayenge',        chord: 'D',  time: 38,  fingerGesture: '✌️ Peace (2) → D' },
          { text: 'Toh khud se hi ho jaayenge judaa',   chord: 'C',  time: 43,  fingerGesture: '🤟 Three (3) → C' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Kyunki tum hi ho, ab tum hi ho',    chord: 'Em', time: 50,  fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Zindagi ab tum hi ho',               chord: 'Am', time: 55,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Chain bhi, mera dard bhi',           chord: 'D',  time: 59,  fingerGesture: '✌️ Peace (2) → D' },
          { text: 'Meri aashiqui ab tum hi ho',         chord: 'G',  time: 63,  fingerGesture: '🖐️ Four (4) → G' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Tera mera rishta hai kaisa',        chord: 'Em', time: 70,  fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Ek pal door gawara nahi',           chord: 'Am', time: 75,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Tere liye har roz hain jeete',      chord: 'D',  time: 80,  fingerGesture: '✌️ Peace (2) → D' },
          { text: 'Tujhko diya mera waqt sabhi',       chord: 'C',  time: 85,  fingerGesture: '🤟 Three (3) → C' },
        ],
      },
      {
        name: 'Bridge',
        lyrics: [
          { text: 'Koi lamha mera na ho tere bina',    chord: 'Am', time: 91,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Har saans pe naam tera',            chord: 'D',  time: 97,  fingerGesture: '✌️ Peace (2) → D' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Kyunki tum hi ho, ab tum hi ho',    chord: 'Em', time: 105, fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Zindagi ab tum hi ho',               chord: 'Am', time: 110, fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Chain bhi, mera dard bhi',           chord: 'D',  time: 114, fingerGesture: '✌️ Peace (2) → D' },
          { text: 'Meri aashiqui ab tum hi ho',         chord: 'G',  time: 118, fingerGesture: '🖐️ Four (4) → G' },
        ],
      },
    ],
  },

  // ── Kesariya – Arijit Singh (98 BPM, ~4.9s per line) ──────────────────
  {
    id: 'kesariya',
    title: 'Kesariya',
    artist: 'Arijit Singh',
    bpm: 98,
    timeSignature: '4/4',
    key: 'C Major',
    capo: 0,
    difficulty: 'Easy',
    collections: ['Hindi', 'Bollywood', 'Pop'],
    duration: '4:28',
    defaultStrumPattern: ['D', 'D', 'U', 'U', 'D', 'U'],
    displayPattern: '↓ ↓ ↑ ↑ ↓ ↑',
    chords: ['C', 'Am', 'F', 'G'],
    fingerMapping: ['C', 'Am', 'F', 'G', 'Em', 'Dm'],
    sections: [
      {
        name: 'Verse',
        lyrics: [
          { text: 'Mujhko kitna pyaar hai tumse',      chord: 'C',  time: 22,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Kaise bataun mere dil ko',          chord: 'Am', time: 27,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Kajra mohabbat wala ankhiyon mein', chord: 'F',  time: 32,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Tu jo mila to sab kuch mila',       chord: 'G',  time: 37,  fingerGesture: '🤟 Three (3) → G' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Kesariya tera ishq hai piya',       chord: 'C',  time: 43,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Rang jaaun jo main haath lagaun',   chord: 'Am', time: 48,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Din beete saara teri fikr mein',    chord: 'F',  time: 53,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Rain saari teri kair maangoon',     chord: 'G',  time: 58,  fingerGesture: '🤟 Three (3) → G' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Kesariya tera ishq hai piya',       chord: 'C',  time: 65,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Rang jaaun jo main haath lagaun',   chord: 'Am', time: 70,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Din beete saara teri fikr mein',    chord: 'F',  time: 75,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Rain saari teri kair maangoon',     chord: 'G',  time: 80,  fingerGesture: '🤟 Three (3) → G' },
        ],
      },
    ],
  },

  // ── Hotel California – Eagles (75 BPM, ~6.4s per line) ────────────────
  {
    id: 'hotel-california',
    title: 'Hotel California',
    artist: 'Eagles',
    bpm: 75,
    timeSignature: '4/4',
    key: 'B Minor',
    capo: 2,
    difficulty: 'Intermediate',
    collections: ['English', 'Rock', 'Campfire'],
    duration: '6:30',
    defaultStrumPattern: ['D', '.', 'D', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ ↓ ↑',
    fingerstylePattern: ['P', 'I', 'M', 'A', 'M', 'I'],
    chords: ['Bm', 'F#7', 'A', 'E', 'G', 'D', 'Em'],
    fingerMapping: ['Bm', 'F#7', 'A', 'E', 'G', 'D'],
    sections: [
      {
        name: 'Verse',
        lyrics: [
          { text: 'On a dark desert highway, cool wind in my hair',    chord: 'Bm',  time: 26,  fingerGesture: '✊ Fist (0) → Bm' },
          { text: 'Warm smell of colitas, rising up through the air',  chord: 'F#7', time: 33,  fingerGesture: '☝️ Index (1) → F#7' },
          { text: 'Up ahead in the distance, I saw a shimmering light',chord: 'A',   time: 39,  fingerGesture: '✌️ Peace (2) → A' },
          { text: 'My head grew heavy and my sight grew dim',          chord: 'E',   time: 46,  fingerGesture: '🤟 Three (3) → E' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Welcome to the Hotel California',                   chord: 'G',   time: 110, fingerGesture: '🖐️ Four (4) → G' },
          { text: 'Such a lovely place, such a lovely face',           chord: 'D',   time: 117, fingerGesture: '🖐️ Five (5) → D' },
          { text: 'Plenty of room at the Hotel California',            chord: 'Em',  time: 123, fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Any time of year, you can find it here',            chord: 'F#7', time: 130, fingerGesture: '☝️ Index (1) → F#7' },
        ],
      },
    ],
  },

  // ── Apna Bana Le – Arijit Singh (86 BPM, ~5.6s per line) ──────────────
  {
    id: 'apna-bana-le',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh',
    bpm: 86,
    timeSignature: '4/4',
    key: 'D Major',
    capo: 0,
    difficulty: 'Easy',
    collections: ['Hindi', 'Bollywood', 'Romantic'],
    duration: '4:21',
    defaultStrumPattern: ['D', '.', 'D', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ ↓ ↑',
    chords: ['D', 'Bm', 'G', 'A'],
    fingerMapping: ['D', 'Bm', 'G', 'A', 'Em', 'F#m'],
    sections: [
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Tu mera koi na hoke bhi kuch lage',         chord: 'D',  time: 33,  fingerGesture: '✊ Fist (0) → D' },
          { text: 'Apna bana le mujhe apna bana le piya',      chord: 'Bm', time: 39,  fingerGesture: '☝️ Index (1) → Bm' },
          { text: 'Dil ke makan mein tu mehmaan lagta hai',    chord: 'G',  time: 45,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Aankhon se sunta hai baatein kahe bina',    chord: 'A',  time: 51,  fingerGesture: '🤟 Three (3) → A' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Subah ki chai mein jo mithaas hoti hai',    chord: 'D',  time: 60,  fingerGesture: '✊ Fist (0) → D' },
          { text: 'Waisa hi lagta hai jab tu paas hoti hai',   chord: 'Bm', time: 66,  fingerGesture: '☝️ Index (1) → Bm' },
          { text: 'Apna bana le mujhe, apna bana le piya',     chord: 'G',  time: 72,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Sab kuch ganwa ke bhi tujhko hi paana hai', chord: 'A',  time: 78,  fingerGesture: '🤟 Three (3) → A' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Tu mera koi na hoke bhi kuch lage',         chord: 'D',  time: 86,  fingerGesture: '✊ Fist (0) → D' },
          { text: 'Apna bana le mujhe apna bana le piya',      chord: 'Bm', time: 92,  fingerGesture: '☝️ Index (1) → Bm' },
          { text: 'Dil ke makan mein tu mehmaan lagta hai',    chord: 'G',  time: 98,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Aankhon se sunta hai baatein kahe bina',    chord: 'A',  time: 104, fingerGesture: '🤟 Three (3) → A' },
        ],
      },
    ],
  },

  // ── Riptide – Vance Joy (102 BPM, faster ~3.5s per line) ──────────────
  {
    id: 'riptide',
    title: 'Riptide',
    artist: 'Vance Joy',
    bpm: 102,
    timeSignature: '4/4',
    key: 'A Minor',
    capo: 1,
    difficulty: 'Beginner',
    collections: ['English', 'Pop', 'Indie', 'Beginner'],
    duration: '3:24',
    defaultStrumPattern: ['D', 'D', 'U', 'U', 'D', 'U'],
    displayPattern: '↓ ↓ ↑ ↑ ↓ ↑',
    chords: ['Am', 'G', 'C'],
    fingerMapping: ['Am', 'G', 'C', 'F', 'Dm', 'Em'],
    sections: [
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Lady, running down to the riptide',          chord: 'Am', time: 60,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Taken away to the dark side',                chord: 'G',  time: 64,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'I wanna be your left hand man',              chord: 'C',  time: 67,  fingerGesture: '✌️ Peace (2) → C' },
          { text: "I love you when you're singing that song",   chord: 'Am', time: 71,  fingerGesture: '✊ Fist (0) → Am' },
        ],
      },
    ],
  },

  // ── Hallelujah – Leonard Cohen (56 BPM, very slow ~7s per line) ────────
  {
    id: 'hallelujah',
    title: 'Hallelujah',
    artist: 'Leonard Cohen',
    bpm: 56,
    timeSignature: '6/8',
    key: 'C Major',
    capo: 0,
    difficulty: 'Beginner',
    collections: ['English', 'Worship', 'Campfire', 'Beginner'],
    duration: '4:39',
    defaultStrumPattern: ['D', '.', 'U', 'D', '.', 'U'],
    displayPattern: '↓ • ↑ ↓ • ↑',
    fingerstylePattern: ['P', 'I', 'M', 'A', 'M', 'I'],
    chords: ['C', 'Am', 'F', 'G', 'E7'],
    fingerMapping: ['C', 'Am', 'F', 'G', 'E7', 'Dm'],
    sections: [
      {
        name: 'Verse',
        lyrics: [
          { text: "I've heard there was a secret chord",         chord: 'C',  time: 6,   fingerGesture: '✊ Fist (0) → C' },
          { text: 'That David played and it pleased the Lord',   chord: 'Am', time: 13,  fingerGesture: '☝️ Index (1) → Am' },
          { text: "But you don't really care for music, do ya?", chord: 'C',  time: 19,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'It goes like this, the fourth, the fifth',    chord: 'F',  time: 26,  fingerGesture: '✌️ Peace (2) → F' },
        ],
      },
    ],
  },

  // ── Channa Mereya – Arijit Singh (90 BPM, ~5.3s per line) ────────────
  {
    id: 'channa-mereya',
    title: 'Channa Mereya',
    artist: 'Arijit Singh',
    bpm: 90,
    timeSignature: '4/4',
    key: 'C Major (D with Capo 2)',
    capo: 2,
    difficulty: 'Easy',
    collections: ['Hindi', 'Bollywood', 'Romantic', 'Beginner'],
    duration: '4:49',
    defaultStrumPattern: ['D', '.', 'D', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ ↓ ↑',
    chords: ['C', 'G', 'Am', 'F'],
    fingerMapping: ['C', 'G', 'Am', 'F', 'Dm', 'Em'],
    sections: [
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Accha chalta hoon, duaon mein yaad rakhna',     chord: 'C',  time: 42,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Mere zikr ka zubaan pe swaad rakhna',           chord: 'G',  time: 48,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Dil ke sandookon mein, mere acche kaam rakhna', chord: 'Am', time: 54,  fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Chitti taaron mein bhi mera tu salaam rakhna',  chord: 'F',  time: 60,  fingerGesture: '🤟 Three (3) → F' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'O channa mereya mereya beliya o piya',          chord: 'C',  time: 68,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'O channa mereya mereya beliya o piya',          chord: 'G',  time: 74,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'O channa mereya mereya beliya o piya',          chord: 'Am', time: 80,  fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Kitabeyan se dil laga ke ve',                   chord: 'F',  time: 86,  fingerGesture: '🤟 Three (3) → F' },
        ],
      },
    ],
  },

  // ── Kabira – Yeh Jawaani Hai Deewani (88 BPM, ~5.5s per line) ────────
  {
    id: 'kabira',
    title: 'Kabira',
    artist: 'Tochi Raina & Rekha Bhardwaj',
    bpm: 88,
    timeSignature: '4/4',
    key: 'D Major',
    capo: 0,
    difficulty: 'Beginner',
    collections: ['Hindi', 'Bollywood', 'Campfire', 'Beginner'],
    duration: '4:29',
    defaultStrumPattern: ['D', 'D', 'U', 'U', 'D', 'U'],
    displayPattern: '↓ ↓ ↑ ↑ ↓ ↑',
    chords: ['D', 'G', 'Bm', 'A'],
    fingerMapping: ['D', 'G', 'Bm', 'A', 'Em', 'C'],
    sections: [
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Banno re banno meri maata ki boli',           chord: 'D',  time: 32,  fingerGesture: '✊ Fist (0) → D' },
          { text: 'Re kabira maan jaa, re faqeera maan jaa',     chord: 'G',  time: 38,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Aaja tujhko pukare teri parchhaiyan',         chord: 'Bm', time: 44,  fingerGesture: '✌️ Peace (2) → Bm' },
          { text: 'Re kabira maan jaa, re faqeera maan jaa',     chord: 'A',  time: 50,  fingerGesture: '🤟 Three (3) → A' },
        ],
      },
    ],
  },

  // ── Agar Tum Saath Ho – Arijit & Alka (84 BPM, ~5.7s per line) ───────
  {
    id: 'agar-tum-saath-ho',
    title: 'Agar Tum Saath Ho',
    artist: 'Arijit Singh & Alka Yagnik',
    bpm: 84,
    timeSignature: '4/4',
    key: 'A Minor',
    capo: 2,
    difficulty: 'Easy',
    collections: ['Hindi', 'Bollywood', 'Romantic'],
    duration: '5:41',
    defaultStrumPattern: ['D', '.', 'D', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ ↓ ↑',
    chords: ['Am', 'F', 'G', 'C'],
    fingerMapping: ['Am', 'F', 'G', 'C', 'Dm', 'Em'],
    sections: [
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Pal bhar theher jao, dil ye sambhal jaye',    chord: 'Am', time: 55,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Kaise tumhe roka karoon, meri taraf aao',     chord: 'F',  time: 61,  fingerGesture: '☝️ Index (1) → F' },
          { text: 'Behte hain mere aansoo, agar tum saath ho',   chord: 'G',  time: 67,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Har gham beh jaye mera, agar tum saath ho',   chord: 'C',  time: 73,  fingerGesture: '🤟 Three (3) → C' },
        ],
      },
    ],
  },

  // ── Jeena Jeena – Atif Aslam (78 BPM, ~6.1s per line) ────────────────
  {
    id: 'jeena-jeena',
    title: 'Jeena Jeena',
    artist: 'Atif Aslam',
    bpm: 78,
    timeSignature: '4/4',
    key: 'E Minor',
    capo: 1,
    difficulty: 'Easy',
    collections: ['Hindi', 'Bollywood', 'Romantic'],
    duration: '3:49',
    defaultStrumPattern: ['D', '.', 'D', 'U', '.', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ • ↑ ↓ ↑',
    chords: ['Em', 'D', 'C', 'Bm'],
    fingerMapping: ['Em', 'D', 'C', 'Bm', 'Am', 'G'],
    sections: [
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Dehleez pe mere dil ki, jo rakhe hain tune kadam', chord: 'Em', time: 46, fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Tere naam pe meri zindagi, likh di mere sanam',    chord: 'D',  time: 52, fingerGesture: '☝️ Index (1) → D' },
          { text: 'Haan seekha maine jeena jeena jaise jeena',        chord: 'C',  time: 58, fingerGesture: '✌️ Peace (2) → C' },
          { text: 'Haan seekha maine jeena tumse hi seekha',          chord: 'Bm', time: 64, fingerGesture: '🤟 Three (3) → Bm' },
        ],
      },
    ],
  },

  // ── Kal Ho Naa Ho – Sonu Nigam (80 BPM, ~6s per line) ────────────────
  {
    id: 'kal-ho-naa-ho',
    title: 'Kal Ho Naa Ho',
    artist: 'Sonu Nigam',
    bpm: 80,
    timeSignature: '4/4',
    key: 'C Major',
    capo: 0,
    difficulty: 'Beginner',
    collections: ['Hindi', 'Bollywood', 'Campfire', 'Beginner'],
    duration: '5:21',
    defaultStrumPattern: ['D', 'D', 'U', 'U', 'D', 'U'],
    displayPattern: '↓ ↓ ↑ ↑ ↓ ↑',
    chords: ['C', 'G', 'Am', 'F', 'Dm'],
    fingerMapping: ['C', 'G', 'Am', 'F', 'Dm', 'Em'],
    sections: [
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Har ghadi badal rahi hai roop zindagi',      chord: 'C',  time: 48,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Chaav hai kabhi kabhi hai dhoop zindagi',    chord: 'G',  time: 54,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Har pal yahan jee bhar jiyo',                chord: 'Am', time: 60,  fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Jo hai samaa, kal ho naa ho',                chord: 'F',  time: 65,  fingerGesture: '🤟 Three (3) → F' },
        ],
      },
    ],
  },

  // ── Pani Da Rang – Ayushmann (94 BPM, ~5.1s per line) ─────────────────
  {
    id: 'pani-da-rang',
    title: 'Pani Da Rang',
    artist: 'Ayushmann Khurrana',
    bpm: 94,
    timeSignature: '4/4',
    key: 'A Minor (Capo 2 for Bm)',
    capo: 2,
    difficulty: 'Easy',
    collections: ['Hindi', 'Bollywood', 'Romantic', 'Indie'],
    duration: '4:00',
    defaultStrumPattern: ['D', '.', 'D', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ ↓ ↑',
    chords: ['Am', 'G', 'F', 'E'],
    fingerMapping: ['Am', 'G', 'F', 'E', 'C', 'Dm'],
    sections: [
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Pani da rang vekh ke',                       chord: 'Am', time: 52,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Ankhiyaan cho anju ruldai',                   chord: 'G',  time: 57,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Maahiya na aaya mera',                        chord: 'F',  time: 62,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Maahiya na aaya mera',                        chord: 'E',  time: 67,  fingerGesture: '🤟 Three (3) → E' },
        ],
      },
    ],
  },

  // ── Tera Ban Jaunga – Akhil Sachdeva (82 BPM, ~5.9s per line) ─────────
  {
    id: 'tera-ban-jaunga',
    title: 'Tera Ban Jaunga',
    artist: 'Akhil Sachdeva & Tulsi Kumar',
    bpm: 82,
    timeSignature: '4/4',
    key: 'C Major',
    capo: 1,
    difficulty: 'Easy',
    collections: ['Hindi', 'Bollywood', 'Romantic'],
    duration: '3:56',
    defaultStrumPattern: ['D', '.', 'D', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ ↓ ↑',
    chords: ['C', 'G', 'Am', 'F'],
    fingerMapping: ['C', 'G', 'Am', 'F', 'Dm', 'Em'],
    sections: [
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Meri raahein tere tak hain',                  chord: 'C',  time: 44,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Tujhpe hi toh mera haq hai',                  chord: 'G',  time: 50,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Ishq yeh mera nirdosh hai',                   chord: 'Am', time: 56,  fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Main tera ban jaunga',                         chord: 'F',  time: 62,  fingerGesture: '🤟 Three (3) → F' },
        ],
      },
    ],
  },

  // ── Pehli Nazar Mein – Atif Aslam (86 BPM, ~5.6s per line) ───────────
  {
    id: 'pehli-nazar-mein',
    title: 'Pehli Nazar Mein',
    artist: 'Atif Aslam',
    bpm: 86,
    timeSignature: '4/4',
    key: 'A Minor',
    capo: 0,
    difficulty: 'Easy',
    collections: ['Hindi', 'Bollywood', 'Romantic'],
    duration: '5:14',
    defaultStrumPattern: ['D', 'D', 'U', 'U', 'D', 'U'],
    displayPattern: '↓ ↓ ↑ ↑ ↓ ↑',
    chords: ['Am', 'G', 'F', 'C'],
    fingerMapping: ['Am', 'G', 'F', 'C', 'Dm', 'E'],
    sections: [
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Pehli nazar mein kaisa jaadoo kar diya',      chord: 'Am', time: 50,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Tera ban baithe hai mera dil yeh keh diya',   chord: 'G',  time: 56,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Haan main kahan rehta hoon, ab tu bata',      chord: 'F',  time: 62,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Har pal mujhe hai tera intezaar',             chord: 'C',  time: 68,  fingerGesture: '🤟 Three (3) → C' },
        ],
      },
    ],
  },

  // ── Tu Jaane Na – Atif Aslam (76 BPM, ~6.3s per line) ────────────────
  {
    id: 'tu-jaane-na',
    title: 'Tu Jaane Na',
    artist: 'Atif Aslam',
    bpm: 76,
    timeSignature: '4/4',
    key: 'A Major',
    capo: 1,
    difficulty: 'Easy',
    collections: ['Hindi', 'Bollywood', 'Romantic', 'Beginner'],
    duration: '5:37',
    defaultStrumPattern: ['D', '.', 'D', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ ↓ ↑',
    chords: ['A', 'E', 'F#m', 'D'],
    fingerMapping: ['A', 'E', 'F#m', 'D', 'Bm', 'C#m'],
    sections: [
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Kaise bataaye kyun tujhko chaahe',            chord: 'A',   time: 58,  fingerGesture: '✊ Fist (0) → A' },
          { text: 'Yaara bata na paaye',                          chord: 'E',   time: 65,  fingerGesture: '☝️ Index (1) → E' },
          { text: 'Baatein dil ki laafzon mein na aaye',          chord: 'F#m', time: 71,  fingerGesture: '✌️ Peace (2) → F#m' },
          { text: 'Tu jaane na, tu jaane na',                     chord: 'D',   time: 77,  fingerGesture: '🤟 Three (3) → D' },
        ],
      },
    ],
  },

  // ── Shape of You – Ed Sheeran (96 BPM, faster ~5s per line) ──────────
  {
    id: 'shape-of-you',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    bpm: 96,
    timeSignature: '4/4',
    key: 'C# Minor (Capo 2 for Bm)',
    capo: 2,
    difficulty: 'Easy',
    collections: ['English', 'Pop', 'Beginner'],
    duration: '3:53',
    defaultStrumPattern: ['D', 'X', 'U', 'X', 'D', 'U'],
    displayPattern: '↓ ✕ ↑ ✕ ↓ ↑',
    chords: ['Bm', 'Em', 'G', 'A'],
    fingerMapping: ['Bm', 'Em', 'G', 'A', 'D', 'F#m'],
    sections: [
      {
        name: 'Chorus',
        lyrics: [
          { text: "I'm in love with the shape of you",            chord: 'Bm', time: 60,  fingerGesture: '✊ Fist (0) → Bm' },
          { text: 'We push and pull like a magnet do',            chord: 'Em', time: 65,  fingerGesture: '☝️ Index (1) → Em' },
          { text: 'Although my heart is falling too',             chord: 'G',  time: 70,  fingerGesture: '✌️ Peace (2) → G' },
          { text: "I'm in love with your body",                   chord: 'A',  time: 74,  fingerGesture: '🤟 Three (3) → A' },
        ],
      },
    ],
  },

  // ── Count On Me – Bruno Mars (89 BPM, ~5.4s per line) ────────────────
  {
    id: 'count-on-me',
    title: 'Count On Me',
    artist: 'Bruno Mars',
    bpm: 89,
    timeSignature: '4/4',
    key: 'C Major',
    capo: 0,
    difficulty: 'Beginner',
    collections: ['English', 'Pop', 'Campfire', 'Beginner'],
    duration: '3:17',
    defaultStrumPattern: ['D', 'D', 'U', 'U', 'D', 'U'],
    displayPattern: '↓ ↓ ↑ ↑ ↓ ↑',
    chords: ['C', 'Em', 'Am', 'G', 'F'],
    fingerMapping: ['C', 'Em', 'Am', 'G', 'F', 'Dm'],
    sections: [
      {
        name: 'Chorus',
        lyrics: [
          { text: 'You can count on me like one, two, three',    chord: 'C',  time: 38,  fingerGesture: '✊ Fist (0) → C' },
          { text: "I'll be there",                               chord: 'Em', time: 44,  fingerGesture: '☝️ Index (1) → Em' },
          { text: 'And I know when I need it I can count on you',chord: 'Am', time: 48,  fingerGesture: '✌️ Peace (2) → Am' },
          { text: "Like four, three, two, and you'll be there",  chord: 'G',  time: 54,  fingerGesture: '🤟 Three (3) → G' },
        ],
      },
    ],
  },

  // ── Zombie – The Cranberries (84 BPM, ~5.7s per line) ────────────────
  {
    id: 'zombie',
    title: 'Zombie',
    artist: 'The Cranberries',
    bpm: 84,
    timeSignature: '4/4',
    key: 'E Minor',
    capo: 0,
    difficulty: 'Easy',
    collections: ['English', 'Rock', 'Beginner'],
    duration: '5:06',
    defaultStrumPattern: ['D', 'D', 'D', 'D'],
    displayPattern: '↓ ↓ ↓ ↓',
    chords: ['Em', 'C', 'G', 'D'],
    fingerMapping: ['Em', 'C', 'G', 'D', 'Am', 'Bm'],
    sections: [
      {
        name: 'Chorus',
        lyrics: [
          { text: 'In your head, in your head',                  chord: 'Em', time: 62,  fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Zombie, zombie, zombie-ie-ie',                 chord: 'C',  time: 68,  fingerGesture: '☝️ Index (1) → C' },
          { text: "What's in your head, in your head",            chord: 'G',  time: 74,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Zombie, zombie, zombie-ie-ie, oh',             chord: 'D',  time: 80,  fingerGesture: '🤟 Three (3) → D' },
        ],
      },
    ],
  },
]
