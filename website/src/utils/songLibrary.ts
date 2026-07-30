// ── Scalable Extensible Song Database Schema & Seed Data ──────────────────────

export interface TimestampedLyric {
  text: string
  chord: string
  time: number // seconds from track start
  fingerGesture: string
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
  'All','Hindi','English','Bollywood','Pop','Rock',
  'Indie','Campfire','Romantic','Worship','Beginner','Advanced',
]

export const SEED_SONGS: Song[] = [

  // ═══════════════════════════════════════════════════════════════════
  // Perfect – Ed Sheeran  |  63 BPM  |  6/8  |  Capo 1
  // ═══════════════════════════════════════════════════════════════════
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
          { text: 'I found a love for me',                                       chord: 'G',  time: 14,  fingerGesture: '✊ Fist (0) → G' },
          { text: 'Darling, just dive right in and follow my lead',             chord: 'Em', time: 20,  fingerGesture: '☝️ Index (1) → Em' },
          { text: 'Well, I found a girl, beautiful and sweet',                   chord: 'C',  time: 26,  fingerGesture: '✌️ Peace (2) → C' },
          { text: 'Oh, I never knew you were the someone waiting for me',        chord: 'D',  time: 32,  fingerGesture: '🤟 Three (3) → D' },
          { text: 'Cause we were just kids when we fell in love',                chord: 'G',  time: 38,  fingerGesture: '✊ Fist (0) → G' },
          { text: 'Not knowing what it was, I will not give you up this time',  chord: 'Em', time: 44,  fingerGesture: '☝️ Index (1) → Em' },
          { text: 'Darling, just kiss me slow, your heart is all I own',         chord: 'C',  time: 50,  fingerGesture: '✌️ Peace (2) → C' },
          { text: 'And in your eyes, you\'re holding mine',                      chord: 'D',  time: 56,  fingerGesture: '🤟 Three (3) → D' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Baby, I\'m dancing in the dark',                              chord: 'Em', time: 64,  fingerGesture: '☝️ Index (1) → Em' },
          { text: 'With you between my arms',                                    chord: 'C',  time: 68,  fingerGesture: '✌️ Peace (2) → C' },
          { text: 'Barefoot on the grass',                                       chord: 'G',  time: 72,  fingerGesture: '✊ Fist (0) → G' },
          { text: 'Listening to our favourite song',                             chord: 'D',  time: 76,  fingerGesture: '🤟 Three (3) → D' },
          { text: 'When I saw you in that dress, looking so beautiful',          chord: 'Em', time: 80,  fingerGesture: '☝️ Index (1) → Em' },
          { text: 'I don\'t deserve this, darling, you look perfect tonight',    chord: 'C',  time: 86,  fingerGesture: '✌️ Peace (2) → C' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Well I found a woman, stronger than anyone I know',           chord: 'G',  time: 96,  fingerGesture: '✊ Fist (0) → G' },
          { text: 'She shares my dreams, I hope that someday I\'ll share her home', chord: 'Em', time: 102, fingerGesture: '☝️ Index (1) → Em' },
          { text: 'I found a love, to carry more than just my secrets',          chord: 'C',  time: 108, fingerGesture: '✌️ Peace (2) → C' },
          { text: 'To carry love, to carry children of our own',                 chord: 'D',  time: 114, fingerGesture: '🤟 Three (3) → D' },
          { text: 'We are still kids but we\'re so in love',                     chord: 'G',  time: 120, fingerGesture: '✊ Fist (0) → G' },
          { text: 'Fighting against all odds, I know we\'ll be alright this time', chord: 'Em', time: 126, fingerGesture: '☝️ Index (1) → Em' },
          { text: 'Darling, just hold my hand',                                  chord: 'C',  time: 132, fingerGesture: '✌️ Peace (2) → C' },
          { text: 'Be my girl, I\'ll be your man, I\'ve seen the future in your eyes', chord: 'D', time: 138, fingerGesture: '🤟 Three (3) → D' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Baby, I\'m dancing in the dark',                              chord: 'Em', time: 146, fingerGesture: '☝️ Index (1) → Em' },
          { text: 'With you between my arms',                                    chord: 'C',  time: 150, fingerGesture: '✌️ Peace (2) → C' },
          { text: 'Barefoot on the grass',                                       chord: 'G',  time: 154, fingerGesture: '✊ Fist (0) → G' },
          { text: 'Listening to our favourite song',                             chord: 'D',  time: 158, fingerGesture: '🤟 Three (3) → D' },
          { text: 'When I saw you in that dress, looking so beautiful',          chord: 'Em', time: 162, fingerGesture: '☝️ Index (1) → Em' },
          { text: 'I don\'t deserve this, darling, you look perfect tonight',    chord: 'C',  time: 168, fingerGesture: '✌️ Peace (2) → C' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Baby, I\'m dancing in the dark',                              chord: 'Em', time: 210, fingerGesture: '☝️ Index (1) → Em' },
          { text: 'With you between my arms',                                    chord: 'C',  time: 214, fingerGesture: '✌️ Peace (2) → C' },
          { text: 'Barefoot on the grass',                                       chord: 'G',  time: 218, fingerGesture: '✊ Fist (0) → G' },
          { text: 'Listening to our favourite song',                             chord: 'D',  time: 222, fingerGesture: '🤟 Three (3) → D' },
          { text: 'I have faith in what I see',                                  chord: 'Em', time: 226, fingerGesture: '☝️ Index (1) → Em' },
          { text: 'Now I know I have met an angel in person',                    chord: 'C',  time: 232, fingerGesture: '✌️ Peace (2) → C' },
          { text: 'And she looks perfect',                                       chord: 'G',  time: 238, fingerGesture: '✊ Fist (0) → G' },
          { text: 'I don\'t deserve this, you look perfect tonight',             chord: 'D',  time: 244, fingerGesture: '🤟 Three (3) → D' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Tum Hi Ho – Arijit Singh  |  92 BPM  |  Capo 1
  // ═══════════════════════════════════════════════════════════════════
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
        name: 'Verse',
        lyrics: [
          { text: 'Hum tere bin ab reh nahi sakte',               chord: 'Em', time: 8,   fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Tere bina kya wajood mera',                     chord: 'Am', time: 13,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Tujhse juda gar ho jaayenge',                   chord: 'D',  time: 18,  fingerGesture: '✌️ Peace (2) → D' },
          { text: 'Toh khud se hi ho jaayenge judaa',              chord: 'C',  time: 23,  fingerGesture: '🤟 Three (3) → C' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Kyunki tum hi ho, ab tum hi ho',                chord: 'Em', time: 29,  fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Zindagi ab tum hi ho',                           chord: 'Am', time: 34,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Chain bhi, mera dard bhi',                       chord: 'D',  time: 38,  fingerGesture: '✌️ Peace (2) → D' },
          { text: 'Meri aashiqui ab tum hi ho',                     chord: 'G',  time: 42,  fingerGesture: '🖐️ Four (4) → G' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Tera mera rishta hai kaisa',                    chord: 'Em', time: 50,  fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Ek pal door gawara nahi',                       chord: 'Am', time: 55,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Tere liye har roz hain jeete',                  chord: 'D',  time: 60,  fingerGesture: '✌️ Peace (2) → D' },
          { text: 'Tujhko diya mera waqt sabhi',                   chord: 'C',  time: 65,  fingerGesture: '🤟 Three (3) → C' },
          { text: 'Koi lamha mera na ho tere bina',                chord: 'Am', time: 70,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Har saans pe naam tera',                        chord: 'D',  time: 75,  fingerGesture: '✌️ Peace (2) → D' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Kyunki tum hi ho, ab tum hi ho',                chord: 'Em', time: 81,  fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Zindagi ab tum hi ho',                           chord: 'Am', time: 86,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Chain bhi, mera dard bhi',                       chord: 'D',  time: 90,  fingerGesture: '✌️ Peace (2) → D' },
          { text: 'Meri aashiqui ab tum hi ho',                     chord: 'G',  time: 94,  fingerGesture: '🖐️ Four (4) → G' },
        ],
      },
      {
        name: 'Bridge',
        lyrics: [
          { text: 'Tum hi ho, tum hi ho',                           chord: 'Em', time: 103, fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Tum hi ho, tum hi ho',                           chord: 'Am', time: 107, fingerGesture: '☝️ Index (1) → Am' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Hum tere bin ab reh nahi sakte',               chord: 'Em', time: 115, fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Tere bina kya wajood mera',                     chord: 'Am', time: 120, fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Tujhse juda gar ho jaayenge',                   chord: 'D',  time: 125, fingerGesture: '✌️ Peace (2) → D' },
          { text: 'Toh khud se hi ho jaayenge judaa',              chord: 'C',  time: 130, fingerGesture: '🤟 Three (3) → C' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Kyunki tum hi ho, ab tum hi ho',                chord: 'Em', time: 137, fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Zindagi ab tum hi ho',                           chord: 'Am', time: 142, fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Chain bhi, mera dard bhi',                       chord: 'D',  time: 146, fingerGesture: '✌️ Peace (2) → D' },
          { text: 'Meri aashiqui ab tum hi ho',                     chord: 'G',  time: 150, fingerGesture: '🖐️ Four (4) → G' },
          { text: 'Tum hi ho...',                                    chord: 'Em', time: 156, fingerGesture: '✊ Fist (0) → Em' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Kesariya – Arijit Singh  |  98 BPM  |  No capo
  // ═══════════════════════════════════════════════════════════════════
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
          { text: 'Kesariya tera ishq hai piya',                   chord: 'C',  time: 22,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Kesariya tera ishq hai piya',                   chord: 'Am', time: 27,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Kesariya tera ishq hai piya',                   chord: 'F',  time: 32,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Kesariya',                                       chord: 'G',  time: 37,  fingerGesture: '🤟 Three (3) → G' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Dil mein chhupa ke pyaar ka ek dariya',         chord: 'C',  time: 43,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Mera dil bhi kesariya',                          chord: 'Am', time: 48,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Tera dil bhi kesariya',                          chord: 'F',  time: 53,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Ho kesariya, kesariya',                          chord: 'G',  time: 58,  fingerGesture: '🤟 Three (3) → G' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Aakhaon mein teri ajab si, ajab si adaayein hain', chord: 'C', time: 65,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Baahon mein teri wahi jo, mujhe chain aayen hain', chord: 'Am', time: 71, fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Tujhse hi tujhse hi roshan ye jahaan lagta hai',   chord: 'F',  time: 77,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Dono ke dil ek, ek mein do jaan lagti hai',        chord: 'G',  time: 83,  fingerGesture: '🤟 Three (3) → G' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Kesariya tera ishq hai piya',                   chord: 'C',  time: 90,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Kesariya tera ishq hai piya',                   chord: 'Am', time: 95,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Kesariya tera ishq hai piya',                   chord: 'F',  time: 100, fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Kesariya',                                       chord: 'G',  time: 105, fingerGesture: '🤟 Three (3) → G' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Main tujhe dhundhta hoon',                       chord: 'C',  time: 112, fingerGesture: '✊ Fist (0) → C' },
          { text: 'Apni har neend mein, sapne mein',                chord: 'Am', time: 117, fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Teri yaadein bhaari hain',                       chord: 'F',  time: 122, fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Har ek lamhe mein',                              chord: 'G',  time: 127, fingerGesture: '🤟 Three (3) → G' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Kesariya tera ishq hai piya',                   chord: 'C',  time: 175, fingerGesture: '✊ Fist (0) → C' },
          { text: 'Kesariya tera ishq hai piya',                   chord: 'Am', time: 180, fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Kesariya tera ishq hai piya',                   chord: 'F',  time: 185, fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Kesariya...',                                    chord: 'G',  time: 190, fingerGesture: '🤟 Three (3) → G' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Hotel California – Eagles  |  75 BPM  |  Capo 2
  // ═══════════════════════════════════════════════════════════════════
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
    defaultStrumPattern: ['D', '.', 'D', 'U', '.', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ • ↑ ↓ ↑',
    fingerstylePattern: ['P', 'I', 'M', 'A', 'M', 'I'],
    chords: ['Bm', 'F#7', 'A', 'E', 'G', 'D', 'Em'],
    fingerMapping: ['Bm', 'F#7', 'A', 'E', 'G', 'D'],
    sections: [
      {
        name: 'Verse',
        lyrics: [
          { text: 'On a dark desert highway, cool wind in my hair',   chord: 'Bm',  time: 26,  fingerGesture: '✊ Fist (0) → Bm' },
          { text: 'Warm smell of colitas rising up through the air',   chord: 'F#7', time: 33,  fingerGesture: '☝️ Index (1) → F#7' },
          { text: 'Up ahead in the distance, I saw a shimmering light', chord: 'A',  time: 39,  fingerGesture: '✌️ Peace (2) → A' },
          { text: 'My head grew heavy and my sight grew dim',          chord: 'E',   time: 46,  fingerGesture: '🤟 Three (3) → E' },
          { text: 'I had to stop for the night',                       chord: 'G',   time: 52,  fingerGesture: '🖐️ Four (4) → G' },
          { text: 'There she stood in the doorway',                    chord: 'D',   time: 58,  fingerGesture: '🖐️ Five (5) → D' },
          { text: 'I heard the mission bell',                          chord: 'Em',  time: 64,  fingerGesture: '✊ Fist (0) → Em' },
          { text: 'And I was thinking to myself',                      chord: 'F#7', time: 69,  fingerGesture: '☝️ Index (1) → F#7' },
          { text: 'This could be Heaven or this could be Hell',        chord: 'A',   time: 74,  fingerGesture: '✌️ Peace (2) → A' },
          { text: 'Then she lit up a candle',                          chord: 'E',   time: 80,  fingerGesture: '🤟 Three (3) → E' },
          { text: 'And she showed me the way',                         chord: 'G',   time: 86,  fingerGesture: '🖐️ Four (4) → G' },
          { text: 'There were voices down the corridor',               chord: 'D',   time: 92,  fingerGesture: '🖐️ Five (5) → D' },
          { text: 'I thought I heard them say',                        chord: 'Em',  time: 98,  fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Welcome to the Hotel California',                   chord: 'F#7', time: 104, fingerGesture: '☝️ Index (1) → F#7' },
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
      {
        name: 'Verse',
        lyrics: [
          { text: 'Her mind is Tiffany-twisted',                       chord: 'Bm',  time: 138, fingerGesture: '✊ Fist (0) → Bm' },
          { text: 'She got the Mercedes bends',                        chord: 'F#7', time: 144, fingerGesture: '☝️ Index (1) → F#7' },
          { text: 'She got a lot of pretty, pretty boys',               chord: 'A',   time: 150, fingerGesture: '✌️ Peace (2) → A' },
          { text: 'That she calls friends',                             chord: 'E',   time: 156, fingerGesture: '🤟 Three (3) → E' },
          { text: 'How they dance in the courtyard',                    chord: 'G',   time: 162, fingerGesture: '🖐️ Four (4) → G' },
          { text: 'Sweet summer sweat',                                 chord: 'D',   time: 168, fingerGesture: '🖐️ Five (5) → D' },
          { text: 'Some dance to remember',                             chord: 'Em',  time: 174, fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Some dance to forget',                               chord: 'F#7', time: 180, fingerGesture: '☝️ Index (1) → F#7' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Welcome to the Hotel California',                   chord: 'G',   time: 187, fingerGesture: '🖐️ Four (4) → G' },
          { text: 'Such a lovely place, such a lovely face',           chord: 'D',   time: 193, fingerGesture: '🖐️ Five (5) → D' },
          { text: 'They livin\' it up at the Hotel California',        chord: 'Em',  time: 199, fingerGesture: '✊ Fist (0) → Em' },
          { text: 'What a nice surprise, bring your alibis',           chord: 'F#7', time: 205, fingerGesture: '☝️ Index (1) → F#7' },
        ],
      },
      {
        name: 'Bridge',
        lyrics: [
          { text: 'Mirrors on the ceiling',                            chord: 'Bm',  time: 213, fingerGesture: '✊ Fist (0) → Bm' },
          { text: 'The pink champagne on ice',                         chord: 'F#7', time: 218, fingerGesture: '☝️ Index (1) → F#7' },
          { text: 'And she said, we are all just prisoners here',      chord: 'A',   time: 224, fingerGesture: '✌️ Peace (2) → A' },
          { text: 'Of our own device',                                  chord: 'E',   time: 230, fingerGesture: '🤟 Three (3) → E' },
          { text: 'And in the master\'s chambers',                      chord: 'G',   time: 236, fingerGesture: '🖐️ Four (4) → G' },
          { text: 'They gathered for the feast',                        chord: 'D',   time: 242, fingerGesture: '🖐️ Five (5) → D' },
          { text: 'They stab it with their steely knives',              chord: 'Em',  time: 248, fingerGesture: '✊ Fist (0) → Em' },
          { text: 'But they just can\'t kill the beast',                chord: 'F#7', time: 254, fingerGesture: '☝️ Index (1) → F#7' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Last thing I remember, I was running for the door', chord: 'Bm',  time: 260, fingerGesture: '✊ Fist (0) → Bm' },
          { text: 'I had to find the passage back to the place I was before', chord: 'F#7', time: 267, fingerGesture: '☝️ Index (1) → F#7' },
          { text: 'Relax, said the night man',                          chord: 'A',   time: 273, fingerGesture: '✌️ Peace (2) → A' },
          { text: 'We are programmed to receive',                       chord: 'E',   time: 279, fingerGesture: '🤟 Three (3) → E' },
          { text: 'You can check out any time you like',                chord: 'G',   time: 285, fingerGesture: '🖐️ Four (4) → G' },
          { text: 'But you can never leave',                            chord: 'D',   time: 291, fingerGesture: '🖐️ Five (5) → D' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Apna Bana Le – Arijit Singh  |  86 BPM  |  No capo
  // ═══════════════════════════════════════════════════════════════════
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
    defaultStrumPattern: ['D', '.', 'D', 'U', '.', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ • ↑ ↓ ↑',
    chords: ['D', 'Bm', 'G', 'A'],
    fingerMapping: ['D', 'Bm', 'G', 'A', 'Em', 'F#m'],
    sections: [
      {
        name: 'Verse',
        lyrics: [
          { text: 'Aankhon se aankhein mili toh dil mein',          chord: 'D',  time: 10,  fingerGesture: '✊ Fist (0) → D' },
          { text: 'Ek khamoshi si utar aayi',                        chord: 'Bm', time: 16,  fingerGesture: '☝️ Index (1) → Bm' },
          { text: 'Jaise sham ke dhunde mein koi',                   chord: 'G',  time: 22,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Dheemi si roshan hua jaata ho',                   chord: 'A',  time: 28,  fingerGesture: '🤟 Three (3) → A' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Tu mera koi na hoke bhi kuch lage',               chord: 'D',  time: 33,  fingerGesture: '✊ Fist (0) → D' },
          { text: 'Apna bana le mujhe apna bana le piya',            chord: 'Bm', time: 39,  fingerGesture: '☝️ Index (1) → Bm' },
          { text: 'Dil ke makan mein tu mehmaan lagta hai',          chord: 'G',  time: 45,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Aankhon se sunta hai baatein kahe bina',          chord: 'A',  time: 51,  fingerGesture: '🤟 Three (3) → A' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Subah ki chai mein jo mithaas hoti hai',          chord: 'D',  time: 60,  fingerGesture: '✊ Fist (0) → D' },
          { text: 'Waisa hi lagta hai jab tu paas hoti hai',         chord: 'Bm', time: 66,  fingerGesture: '☝️ Index (1) → Bm' },
          { text: 'Meri khwaahishein tujhse hi poori hoti hain',     chord: 'G',  time: 72,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Sab kuch ganwa ke bhi tujhko hi paana hai',       chord: 'A',  time: 78,  fingerGesture: '🤟 Three (3) → A' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Tu mera koi na hoke bhi kuch lage',               chord: 'D',  time: 86,  fingerGesture: '✊ Fist (0) → D' },
          { text: 'Apna bana le mujhe apna bana le piya',            chord: 'Bm', time: 92,  fingerGesture: '☝️ Index (1) → Bm' },
          { text: 'Dil ke makan mein tu mehmaan lagta hai',          chord: 'G',  time: 98,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Aankhon se sunta hai baatein kahe bina',          chord: 'A',  time: 104, fingerGesture: '🤟 Three (3) → A' },
        ],
      },
      {
        name: 'Bridge',
        lyrics: [
          { text: 'Main chahta hoon tu chahti ho',                    chord: 'D',  time: 112, fingerGesture: '✊ Fist (0) → D' },
          { text: 'Ke tum bhi chaaho apne aap ko',                    chord: 'Bm', time: 118, fingerGesture: '☝️ Index (1) → Bm' },
          { text: 'Mere dil ka dard dekho',                           chord: 'G',  time: 124, fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Apna bana lo mujhe',                               chord: 'A',  time: 130, fingerGesture: '🤟 Three (3) → A' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Tu mera koi na hoke bhi kuch lage',               chord: 'D',  time: 138, fingerGesture: '✊ Fist (0) → D' },
          { text: 'Apna bana le mujhe apna bana le piya',            chord: 'Bm', time: 144, fingerGesture: '☝️ Index (1) → Bm' },
          { text: 'Apna bana le, apna bana le...',                   chord: 'G',  time: 150, fingerGesture: '✌️ Peace (2) → G' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Riptide – Vance Joy  |  102 BPM  |  Capo 1
  // ═══════════════════════════════════════════════════════════════════
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
        name: 'Verse',
        lyrics: [
          { text: 'I was scared of dentists and the dark',            chord: 'Am', time: 5,   fingerGesture: '✊ Fist (0) → Am' },
          { text: 'I was scared of pretty girls and starting conversations', chord: 'G', time: 9, fingerGesture: '☝️ Index (1) → G' },
          { text: 'Oh, all my friends are turning green',             chord: 'C',  time: 13,  fingerGesture: '✌️ Peace (2) → C' },
          { text: 'You\'re the magician\'s assistant in their dreams', chord: 'Am', time: 17, fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Oh, and they come unstuck',                        chord: 'G',  time: 21,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Lady, running down to the riptide',                chord: 'Am', time: 25,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Taken away to the dark side',                      chord: 'G',  time: 29,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'I wanna be your left hand man',                    chord: 'C',  time: 32,  fingerGesture: '✌️ Peace (2) → C' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'I love you when you\'re singing that song',        chord: 'Am', time: 36,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'And I got a lump in my throat',                    chord: 'G',  time: 40,  fingerGesture: '☝️ Index (1) → G' },
          { text: '\'Cause you\'re gonna sing the words wrong',       chord: 'C',  time: 43,  fingerGesture: '✌️ Peace (2) → C' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'I just wanna, I just wanna know',                  chord: 'Am', time: 49,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'If you\'re gonna, if you\'re gonna stay',           chord: 'G',  time: 53,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'I just gotta, I just gotta know',                   chord: 'C',  time: 57,  fingerGesture: '✌️ Peace (2) → C' },
          { text: 'I can\'t have it, I can\'t have it any other way', chord: 'Am', time: 61,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Lady, running down to the riptide',                chord: 'Am', time: 65,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Taken away to the dark side',                      chord: 'G',  time: 69,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'I wanna be your left hand man',                    chord: 'C',  time: 72,  fingerGesture: '✌️ Peace (2) → C' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'I love you when you\'re singing that song',        chord: 'Am', time: 76,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'And I got a lump in my throat',                    chord: 'G',  time: 80,  fingerGesture: '☝️ Index (1) → G' },
          { text: '\'Cause you\'re gonna sing the words wrong',       chord: 'C',  time: 83,  fingerGesture: '✌️ Peace (2) → C' },
          { text: 'And I love you when you\'re singing that song',    chord: 'Am', time: 87,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'And I got a lump in my throat',                    chord: 'G',  time: 91,  fingerGesture: '☝️ Index (1) → G' },
          { text: '\'Cause you\'re gonna sing the words wrong',       chord: 'C',  time: 94,  fingerGesture: '✌️ Peace (2) → C' },
        ],
      },
      {
        name: 'Bridge',
        lyrics: [
          { text: 'I just wanna, I just wanna know',                  chord: 'Am', time: 100, fingerGesture: '✊ Fist (0) → Am' },
          { text: 'If you\'re gonna, if you\'re gonna stay',           chord: 'G',  time: 104, fingerGesture: '☝️ Index (1) → G' },
          { text: 'I need somebody who can take my place',            chord: 'C',  time: 108, fingerGesture: '✌️ Peace (2) → C' },
          { text: 'Lady, running down to the riptide',                chord: 'Am', time: 113, fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Taken away to the dark side',                      chord: 'G',  time: 117, fingerGesture: '☝️ Index (1) → G' },
          { text: 'I wanna be your left hand man',                    chord: 'C',  time: 120, fingerGesture: '✌️ Peace (2) → C' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'I love you when you\'re singing that song',        chord: 'Am', time: 124, fingerGesture: '✊ Fist (0) → Am' },
          { text: 'And I got a lump in my throat',                    chord: 'G',  time: 128, fingerGesture: '☝️ Index (1) → G' },
          { text: '\'Cause you\'re gonna sing the words wrong',       chord: 'C',  time: 131, fingerGesture: '✌️ Peace (2) → C' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Hallelujah – Leonard Cohen  |  56 BPM  |  No capo
  // ═══════════════════════════════════════════════════════════════════
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
          { text: 'I\'ve heard there was a secret chord',             chord: 'C',  time: 6,   fingerGesture: '✊ Fist (0) → C' },
          { text: 'That David played and it pleased the Lord',         chord: 'Am', time: 13,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'But you don\'t really care for music, do ya?',      chord: 'C',  time: 19,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'It goes like this, the fourth, the fifth',          chord: 'F',  time: 26,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'The minor fall, the major lift',                    chord: 'Am', time: 32,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'The baffled king composing Hallelujah',             chord: 'G',  time: 38,  fingerGesture: '🤟 Three (3) → G' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Hallelujah, Hallelujah',                           chord: 'F',  time: 45,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Hallelujah, Hallelujah',                           chord: 'C',  time: 53,  fingerGesture: '✊ Fist (0) → C' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Your faith was strong but you needed proof',        chord: 'C',  time: 65,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'You saw her bathing on the roof',                   chord: 'Am', time: 72,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Her beauty and the moonlight overthrew ya',          chord: 'C',  time: 78,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'She tied you to her kitchen chair',                  chord: 'F',  time: 85,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'She broke your throne, she cut your hair',           chord: 'Am', time: 91,  fingerGesture: '☝️ Index (1) → Am' },
          { text: 'And from your lips she drew the Hallelujah',         chord: 'G',  time: 97,  fingerGesture: '🤟 Three (3) → G' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Hallelujah, Hallelujah',                           chord: 'F',  time: 104, fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Hallelujah, Hallelujah',                           chord: 'C',  time: 112, fingerGesture: '✊ Fist (0) → C' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Baby, I\'ve been here before',                      chord: 'C',  time: 125, fingerGesture: '✊ Fist (0) → C' },
          { text: 'I\'ve seen this room and I\'ve walked this floor',   chord: 'Am', time: 131, fingerGesture: '☝️ Index (1) → Am' },
          { text: 'I used to live alone before I knew ya',              chord: 'C',  time: 138, fingerGesture: '✊ Fist (0) → C' },
          { text: 'And I\'ve seen your flag on the marble arch',        chord: 'F',  time: 144, fingerGesture: '✌️ Peace (2) → F' },
          { text: 'And love is not a victory march',                    chord: 'Am', time: 150, fingerGesture: '☝️ Index (1) → Am' },
          { text: 'It\'s a cold and it\'s a broken Hallelujah',         chord: 'G',  time: 157, fingerGesture: '🤟 Three (3) → G' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Hallelujah, Hallelujah',                           chord: 'F',  time: 163, fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Hallelujah, Hallelujah',                           chord: 'C',  time: 171, fingerGesture: '✊ Fist (0) → C' },
          { text: 'Hallelujah, Hallelujah',                           chord: 'F',  time: 180, fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Hallelujah...',                                     chord: 'C',  time: 188, fingerGesture: '✊ Fist (0) → C' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Channa Mereya – Arijit Singh  |  90 BPM  |  Capo 2
  // ═══════════════════════════════════════════════════════════════════
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
    defaultStrumPattern: ['D', '.', 'D', 'U', '.', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ • ↑ ↓ ↑',
    chords: ['C', 'G', 'Am', 'F'],
    fingerMapping: ['C', 'G', 'Am', 'F', 'Dm', 'Em'],
    sections: [
      {
        name: 'Verse',
        lyrics: [
          { text: 'Accha chalta hoon, duaon mein yaad rakhna',       chord: 'C',  time: 14,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Mere zikr ka zubaan pe swaad rakhna',             chord: 'G',  time: 20,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Dil ke sandookon mein, mere acche kaam rakhna',   chord: 'Am', time: 26,  fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Chitti taaron mein bhi mera tu salaam rakhna',    chord: 'F',  time: 32,  fingerGesture: '🤟 Three (3) → F' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'O channa mereya mereya beliya o piya',            chord: 'C',  time: 40,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'O channa mereya mereya beliya o piya',            chord: 'G',  time: 46,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'O channa mereya mereya beliya o piya',            chord: 'Am', time: 52,  fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Kitabeyan se dil laga ke ve',                     chord: 'F',  time: 58,  fingerGesture: '🤟 Three (3) → F' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Mann mera tune le liya',                          chord: 'C',  time: 68,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Dil mera chheen liya',                            chord: 'G',  time: 74,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Teri aankhon ne woh kaisa jaadoo kiya',           chord: 'Am', time: 80,  fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Tujhe pooja kiya main ne pooja kiya',             chord: 'F',  time: 86,  fingerGesture: '🤟 Three (3) → F' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'O channa mereya mereya beliya o piya',            chord: 'C',  time: 94,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'O channa mereya mereya beliya o piya',            chord: 'G',  time: 100, fingerGesture: '☝️ Index (1) → G' },
          { text: 'O channa mereya mereya beliya o piya',            chord: 'Am', time: 106, fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Kitabeyan se dil laga ke ve',                     chord: 'F',  time: 112, fingerGesture: '🤟 Three (3) → F' },
        ],
      },
      {
        name: 'Bridge',
        lyrics: [
          { text: 'Tere bin jeena toh nahi',                         chord: 'Am', time: 122, fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Tere bina marna bhi nahi',                        chord: 'F',  time: 128, fingerGesture: '🤟 Three (3) → F' },
          { text: 'Jeena bhi hai tujhsi ke saath',                   chord: 'C',  time: 134, fingerGesture: '✊ Fist (0) → C' },
          { text: 'Marna bhi hai tujhsi ke saath',                   chord: 'G',  time: 140, fingerGesture: '☝️ Index (1) → G' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'O channa mereya mereya beliya o piya',            chord: 'C',  time: 148, fingerGesture: '✊ Fist (0) → C' },
          { text: 'O channa mereya mereya beliya o piya',            chord: 'G',  time: 154, fingerGesture: '☝️ Index (1) → G' },
          { text: 'O channa mereya...',                              chord: 'Am', time: 160, fingerGesture: '✌️ Peace (2) → Am' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Kabira – Yeh Jawaani Hai Deewani  |  88 BPM
  // ═══════════════════════════════════════════════════════════════════
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
        name: 'Verse',
        lyrics: [
          { text: 'Tu kisi rail si guzarti hai',                    chord: 'D',  time: 10,  fingerGesture: '✊ Fist (0) → D' },
          { text: 'Main kisi pul sa thartharaata hoon',             chord: 'G',  time: 16,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Main kinara tha, tu tha dariya',                 chord: 'Bm', time: 22,  fingerGesture: '✌️ Peace (2) → Bm' },
          { text: 'Main thama raha, tu badhti rahi',                chord: 'A',  time: 28,  fingerGesture: '🤟 Three (3) → A' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Re kabira maan jaa, re faqeera maan jaa',        chord: 'D',  time: 34,  fingerGesture: '✊ Fist (0) → D' },
          { text: 'Aaja tujhko pukare teri parchhaiyan',            chord: 'G',  time: 40,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Re kabira maan jaa, re faqeera maan jaa',        chord: 'Bm', time: 46,  fingerGesture: '✌️ Peace (2) → Bm' },
          { text: 'Aaja tujhko pukare teri parchhaiyan',            chord: 'A',  time: 52,  fingerGesture: '🤟 Three (3) → A' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Kabhi jo baadal barse, main dekhu tujhe aankhe bhar ke', chord: 'D', time: 62, fingerGesture: '✊ Fist (0) → D' },
          { text: 'Main pyaasa hoon, tu hai saawan',                chord: 'G',  time: 68,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Bheeg jaoon main, sookh jaaye tu',               chord: 'Bm', time: 74,  fingerGesture: '✌️ Peace (2) → Bm' },
          { text: 'Kyun aisa hota hai',                             chord: 'A',  time: 80,  fingerGesture: '🤟 Three (3) → A' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Re kabira maan jaa, re faqeera maan jaa',        chord: 'D',  time: 86,  fingerGesture: '✊ Fist (0) → D' },
          { text: 'Aaja tujhko pukare teri parchhaiyan',            chord: 'G',  time: 92,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Re kabira maan jaa, re faqeera maan jaa',        chord: 'Bm', time: 98,  fingerGesture: '✌️ Peace (2) → Bm' },
          { text: 'Aaja tujhko pukare teri parchhaiyan',            chord: 'A',  time: 104, fingerGesture: '🤟 Three (3) → A' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Kabira...',                                       chord: 'D',  time: 115, fingerGesture: '✊ Fist (0) → D' },
          { text: 'Re kabira maan jaa...',                           chord: 'G',  time: 121, fingerGesture: '☝️ Index (1) → G' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Agar Tum Saath Ho – Arijit & Alka  |  84 BPM  |  Capo 2
  // ═══════════════════════════════════════════════════════════════════
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
    defaultStrumPattern: ['D', '.', 'D', 'U', '.', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ • ↑ ↓ ↑',
    chords: ['Am', 'F', 'G', 'C'],
    fingerMapping: ['Am', 'F', 'G', 'C', 'Dm', 'Em'],
    sections: [
      {
        name: 'Verse',
        lyrics: [
          { text: 'Pal bhar theher jao, dil ye sambhal jaye',       chord: 'Am', time: 18,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Kaise tumhe roka karoon, meri taraf aao',         chord: 'F',  time: 24,  fingerGesture: '☝️ Index (1) → F' },
          { text: 'Rut yeh beetne na dena',                          chord: 'G',  time: 30,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Saath mere rehna',                                chord: 'C',  time: 36,  fingerGesture: '🤟 Three (3) → C' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Behte hain mere aansoo, agar tum saath ho',       chord: 'Am', time: 44,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Har gham beh jaye mera, agar tum saath ho',       chord: 'F',  time: 50,  fingerGesture: '☝️ Index (1) → F' },
          { text: 'Tum saath ho toh lagta hai',                      chord: 'G',  time: 56,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Kuch bhi nahi khoya hai',                         chord: 'C',  time: 62,  fingerGesture: '🤟 Three (3) → C' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Kyun hawa bhi ab yahan behti nahi',               chord: 'Am', time: 70,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Kyun yahan se teri khushboo aati nahi',           chord: 'F',  time: 76,  fingerGesture: '☝️ Index (1) → F' },
          { text: 'Kyun yeh raat aankhein meri bhar leti hai',       chord: 'G',  time: 82,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Teri parchhaayi mujhe khwaab mein aati hai',      chord: 'C',  time: 88,  fingerGesture: '🤟 Three (3) → C' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Behte hain mere aansoo, agar tum saath ho',       chord: 'Am', time: 96,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Har gham beh jaye mera, agar tum saath ho',       chord: 'F',  time: 102, fingerGesture: '☝️ Index (1) → F' },
          { text: 'Tum saath ho toh lagta hai',                      chord: 'G',  time: 108, fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Kuch bhi nahi khoya hai',                         chord: 'C',  time: 114, fingerGesture: '🤟 Three (3) → C' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Agar tum saath ho...',                            chord: 'Am', time: 125, fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Agar tum saath ho...',                            chord: 'F',  time: 131, fingerGesture: '☝️ Index (1) → F' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Jeena Jeena – Atif Aslam  |  78 BPM  |  Capo 1
  // ═══════════════════════════════════════════════════════════════════
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
        name: 'Verse',
        lyrics: [
          { text: 'Pehle nahi thi aisi, meri zindagi koi',           chord: 'Em', time: 8,   fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Tere aane se mujhe, mili hai khushi koi',          chord: 'D',  time: 14,  fingerGesture: '☝️ Index (1) → D' },
          { text: 'Aankhon mein aankhein daal ke jab',                chord: 'C',  time: 20,  fingerGesture: '✌️ Peace (2) → C' },
          { text: 'Tu mujhe dekhe, dil mera dhadke',                  chord: 'Bm', time: 26,  fingerGesture: '🤟 Three (3) → Bm' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Dehleez pe mere dil ki, jo rakhe hain tune kadam', chord: 'Em', time: 34,  fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Tere naam pe meri zindagi, likh di mere sanam',    chord: 'D',  time: 40,  fingerGesture: '☝️ Index (1) → D' },
          { text: 'Haan seekha maine jeena jeena jaise jeena',         chord: 'C',  time: 46,  fingerGesture: '✌️ Peace (2) → C' },
          { text: 'Haan seekha maine jeena tumse hi seekha',           chord: 'Bm', time: 52,  fingerGesture: '🤟 Three (3) → Bm' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Chehre pe tera jo muskarahat',                     chord: 'Em', time: 62,  fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Bekarar karti hai mujhe raat',                     chord: 'D',  time: 68,  fingerGesture: '☝️ Index (1) → D' },
          { text: 'Khwabon mein aake tu jo mujhe',                    chord: 'C',  time: 74,  fingerGesture: '✌️ Peace (2) → C' },
          { text: 'Jagaaye, phir so nahi paata hoon main',             chord: 'Bm', time: 80,  fingerGesture: '🤟 Three (3) → Bm' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Dehleez pe mere dil ki, jo rakhe hain tune kadam', chord: 'Em', time: 88,  fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Tere naam pe meri zindagi, likh di mere sanam',    chord: 'D',  time: 94,  fingerGesture: '☝️ Index (1) → D' },
          { text: 'Haan seekha maine jeena jeena jaise jeena',         chord: 'C',  time: 100, fingerGesture: '✌️ Peace (2) → C' },
          { text: 'Haan seekha maine jeena tumse hi seekha',           chord: 'Bm', time: 106, fingerGesture: '🤟 Three (3) → Bm' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Jeena jeena, jeena jeena',                         chord: 'Em', time: 118, fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Haan seekha maine jeena tumse...',                  chord: 'D',  time: 124, fingerGesture: '☝️ Index (1) → D' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Kal Ho Naa Ho – Sonu Nigam  |  80 BPM
  // ═══════════════════════════════════════════════════════════════════
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
        name: 'Verse',
        lyrics: [
          { text: 'Har ghadi badal rahi hai roop zindagi',            chord: 'C',  time: 16,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Chaav hai kabhi kabhi hai dhoop zindagi',          chord: 'G',  time: 22,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Har pal yahan jee bhar jiyo',                      chord: 'Am', time: 28,  fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Jo hai samaa, kal ho naa ho',                      chord: 'F',  time: 33,  fingerGesture: '🤟 Three (3) → F' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Hum rahe ya na rahe kal',                          chord: 'C',  time: 40,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Kal yaad aayenge ye pal',                          chord: 'G',  time: 46,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Hum rahe ya na rahe kal',                          chord: 'Am', time: 52,  fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Kal yaad aayenge ye pal',                          chord: 'F',  time: 58,  fingerGesture: '🤟 Three (3) → F' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Jo abhi bhi hai jo kal tha woh',                   chord: 'C',  time: 66,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Woh bhi hai woh bhi tha jo kal tha',               chord: 'G',  time: 72,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Roz naya ek savera lekar aayega',                  chord: 'Am', time: 78,  fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Khushiyon bhari zindagi mein rang bhayega',        chord: 'F',  time: 84,  fingerGesture: '🤟 Three (3) → F' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Hum rahe ya na rahe kal',                          chord: 'C',  time: 92,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Kal yaad aayenge ye pal',                          chord: 'G',  time: 98,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Kal ho naa ho',                                     chord: 'Am', time: 104, fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Kal ho naa ho',                                     chord: 'F',  time: 110, fingerGesture: '🤟 Three (3) → F' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Har ghadi badal rahi hai roop zindagi',            chord: 'C',  time: 120, fingerGesture: '✊ Fist (0) → C' },
          { text: 'Kal ho naa ho...',                                  chord: 'G',  time: 126, fingerGesture: '☝️ Index (1) → G' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Pani Da Rang – Ayushmann Khurrana  |  94 BPM  |  Capo 2
  // ═══════════════════════════════════════════════════════════════════
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
    defaultStrumPattern: ['D', '.', 'D', 'U', '.', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ • ↑ ↓ ↑',
    chords: ['Am', 'G', 'F', 'E'],
    fingerMapping: ['Am', 'G', 'F', 'E', 'C', 'Dm'],
    sections: [
      {
        name: 'Verse',
        lyrics: [
          { text: 'Tenu vakhaan kive, tenu vakhaan kive',             chord: 'Am', time: 10,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Teri soorat teri soorat warga koi nahi',           chord: 'G',  time: 16,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Teri aankhaan wichon nikle teri aankhaan wichon',  chord: 'F',  time: 22,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Pani da rang sajda',                               chord: 'E',  time: 28,  fingerGesture: '🤟 Three (3) → E' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Pani da rang vekh ke',                             chord: 'Am', time: 36,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Ankhiyaan cho anju ruldai',                         chord: 'G',  time: 41,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Maahiya na aaya mera',                              chord: 'F',  time: 46,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Maahiya na aaya mera',                              chord: 'E',  time: 51,  fingerGesture: '🤟 Three (3) → E' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Khidki khol ke baitha hoon akela',                 chord: 'Am', time: 60,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Raat bhar teri raah mein khela',                   chord: 'G',  time: 66,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Aankhon se barsaa andhera',                        chord: 'F',  time: 72,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Dil hua mera akela',                               chord: 'E',  time: 78,  fingerGesture: '🤟 Three (3) → E' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Pani da rang vekh ke',                             chord: 'Am', time: 85,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Ankhiyaan cho anju ruldai',                         chord: 'G',  time: 90,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Maahiya na aaya mera',                              chord: 'F',  time: 95,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Maahiya na aaya mera',                              chord: 'E',  time: 100, fingerGesture: '🤟 Three (3) → E' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Pani da rang...',                                   chord: 'Am', time: 112, fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Maahiya na aaya...',                                chord: 'G',  time: 118, fingerGesture: '☝️ Index (1) → G' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Tera Ban Jaunga – Akhil Sachdeva  |  82 BPM  |  Capo 1
  // ═══════════════════════════════════════════════════════════════════
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
    defaultStrumPattern: ['D', '.', 'D', 'U', '.', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ • ↑ ↓ ↑',
    chords: ['C', 'G', 'Am', 'F'],
    fingerMapping: ['C', 'G', 'Am', 'F', 'Dm', 'Em'],
    sections: [
      {
        name: 'Verse',
        lyrics: [
          { text: 'Maine jo pehna hai chaar din',                     chord: 'C',  time: 8,   fingerGesture: '✊ Fist (0) → C' },
          { text: 'Woh mujhe khilta nahin',                           chord: 'G',  time: 14,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Chhod ke teri baahein toh',                        chord: 'Am', time: 20,  fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Kuch bhi milta nahin',                             chord: 'F',  time: 26,  fingerGesture: '🤟 Three (3) → F' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Meri raahein tere tak hain',                       chord: 'C',  time: 34,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Tujhpe hi toh mera haq hai',                       chord: 'G',  time: 40,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Ishq yeh mera nirdosh hai',                        chord: 'Am', time: 46,  fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Main tera ban jaunga',                              chord: 'F',  time: 52,  fingerGesture: '🤟 Three (3) → F' },
          { text: 'Teri aankhon mein jo basa hai',                    chord: 'C',  time: 58,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Woh khwaab main hun, main tera hoon',              chord: 'G',  time: 64,  fingerGesture: '☝️ Index (1) → G' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Teri yaadein jo hain mere paas',                   chord: 'C',  time: 74,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Woh hain meri daulat',                             chord: 'G',  time: 80,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'In saanson mein tu basa hai',                      chord: 'Am', time: 86,  fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Tere bin jeena mushkil hai',                       chord: 'F',  time: 92,  fingerGesture: '🤟 Three (3) → F' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Meri raahein tere tak hain',                       chord: 'C',  time: 100, fingerGesture: '✊ Fist (0) → C' },
          { text: 'Tujhpe hi toh mera haq hai',                       chord: 'G',  time: 106, fingerGesture: '☝️ Index (1) → G' },
          { text: 'Ishq yeh mera nirdosh hai',                        chord: 'Am', time: 112, fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Main tera ban jaunga',                              chord: 'F',  time: 118, fingerGesture: '🤟 Three (3) → F' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Main tera ban jaunga...',                           chord: 'C',  time: 130, fingerGesture: '✊ Fist (0) → C' },
          { text: 'Tera ban jaunga...',                                chord: 'G',  time: 136, fingerGesture: '☝️ Index (1) → G' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Pehli Nazar Mein – Atif Aslam  |  86 BPM
  // ═══════════════════════════════════════════════════════════════════
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
        name: 'Verse',
        lyrics: [
          { text: 'Ek pal mein hi jaana tune',                        chord: 'Am', time: 12,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Meri zindagi meri aashiqui',                       chord: 'G',  time: 18,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Kaise jaadoo kar diya tune',                       chord: 'F',  time: 24,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Maine socha bhi nahi tha',                         chord: 'C',  time: 30,  fingerGesture: '🤟 Three (3) → C' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Pehli nazar mein kaisa jaadoo kar diya',           chord: 'Am', time: 38,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Tera ban baithe hai mera dil yeh keh diya',        chord: 'G',  time: 44,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Haan main kahan rehta hoon, ab tu bata',           chord: 'F',  time: 50,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Har pal mujhe hai tera intezaar',                  chord: 'C',  time: 56,  fingerGesture: '🤟 Three (3) → C' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Baarish mein bheeg ke khada hoon',                 chord: 'Am', time: 66,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Teri soch mein khoya hoon',                        chord: 'G',  time: 72,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Teri aahat pe dhadke hai dil',                     chord: 'F',  time: 78,  fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Har waqt teri talash mein',                        chord: 'C',  time: 84,  fingerGesture: '🤟 Three (3) → C' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Pehli nazar mein kaisa jaadoo kar diya',           chord: 'Am', time: 92,  fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Tera ban baithe hai mera dil yeh keh diya',        chord: 'G',  time: 98,  fingerGesture: '☝️ Index (1) → G' },
          { text: 'Haan main kahan rehta hoon, ab tu bata',           chord: 'F',  time: 104, fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Har pal mujhe hai tera intezaar',                  chord: 'C',  time: 110, fingerGesture: '🤟 Three (3) → C' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Pehli nazar mein...',                              chord: 'Am', time: 120, fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Tera ban gaya hoon main...',                       chord: 'G',  time: 126, fingerGesture: '☝️ Index (1) → G' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Tu Jaane Na – Atif Aslam  |  76 BPM  |  Capo 1
  // ═══════════════════════════════════════════════════════════════════
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
    defaultStrumPattern: ['D', '.', 'D', 'U', '.', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ • ↑ ↓ ↑',
    chords: ['A', 'E', 'F#m', 'D'],
    fingerMapping: ['A', 'E', 'F#m', 'D', 'Bm', 'C#m'],
    sections: [
      {
        name: 'Verse',
        lyrics: [
          { text: 'Jaane kyun dil jaanta hai',                        chord: 'A',   time: 12,  fingerGesture: '✊ Fist (0) → A' },
          { text: 'Tu hai wahi jo main dhundh raha tha',              chord: 'E',   time: 18,  fingerGesture: '☝️ Index (1) → E' },
          { text: 'Mushkil hai kehna magar',                          chord: 'F#m', time: 24,  fingerGesture: '✌️ Peace (2) → F#m' },
          { text: 'Yeh baat hai sach mera',                           chord: 'D',   time: 30,  fingerGesture: '🤟 Three (3) → D' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Kaise bataaye kyun tujhko chaahe',                 chord: 'A',   time: 38,  fingerGesture: '✊ Fist (0) → A' },
          { text: 'Yaara bata na paaye',                               chord: 'E',   time: 44,  fingerGesture: '☝️ Index (1) → E' },
          { text: 'Baatein dil ki laafzon mein na aaye',               chord: 'F#m', time: 50,  fingerGesture: '✌️ Peace (2) → F#m' },
          { text: 'Tu jaane na, tu jaane na',                          chord: 'D',   time: 56,  fingerGesture: '🤟 Three (3) → D' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Teri aankhon mein dekha jo maine',                  chord: 'A',   time: 66,  fingerGesture: '✊ Fist (0) → A' },
          { text: 'Khud ko hi paaya main wahan',                      chord: 'E',   time: 72,  fingerGesture: '☝️ Index (1) → E' },
          { text: 'Teri baahon mein chain hai',                        chord: 'F#m', time: 78,  fingerGesture: '✌️ Peace (2) → F#m' },
          { text: 'Tera dil hi mera aashiyaan',                       chord: 'D',   time: 84,  fingerGesture: '🤟 Three (3) → D' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Kaise bataaye kyun tujhko chaahe',                 chord: 'A',   time: 92,  fingerGesture: '✊ Fist (0) → A' },
          { text: 'Yaara bata na paaye',                               chord: 'E',   time: 98,  fingerGesture: '☝️ Index (1) → E' },
          { text: 'Baatein dil ki laafzon mein na aaye',               chord: 'F#m', time: 104, fingerGesture: '✌️ Peace (2) → F#m' },
          { text: 'Tu jaane na, tu jaane na',                          chord: 'D',   time: 110, fingerGesture: '🤟 Three (3) → D' },
        ],
      },
      {
        name: 'Bridge',
        lyrics: [
          { text: 'Tadap tadap ke, is dil se',                        chord: 'F#m', time: 120, fingerGesture: '✌️ Peace (2) → F#m' },
          { text: 'Aah nikalti rahi',                                  chord: 'D',   time: 126, fingerGesture: '🤟 Three (3) → D' },
          { text: 'Tu nahi tha toh mujhse',                            chord: 'A',   time: 132, fingerGesture: '✊ Fist (0) → A' },
          { text: 'Zindagi bhi nahi rahi',                             chord: 'E',   time: 138, fingerGesture: '☝️ Index (1) → E' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Tu jaane na, tu jaane na',                          chord: 'A',   time: 148, fingerGesture: '✊ Fist (0) → A' },
          { text: 'Tu jaane na...',                                     chord: 'D',   time: 154, fingerGesture: '🤟 Three (3) → D' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Shape of You – Ed Sheeran  |  96 BPM  |  Capo 2
  // ═══════════════════════════════════════════════════════════════════
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
        name: 'Verse',
        lyrics: [
          { text: 'The club isn\'t the best place to find a lover',   chord: 'Bm', time: 5,   fingerGesture: '✊ Fist (0) → Bm' },
          { text: 'So the bar is where I go',                          chord: 'Em', time: 10,  fingerGesture: '☝️ Index (1) → Em' },
          { text: 'Me and my friends at the table doing shots',        chord: 'G',  time: 15,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Drinking fast and then we talk slow',               chord: 'A',  time: 20,  fingerGesture: '🤟 Three (3) → A' },
          { text: 'Come over and start up a conversation with just me', chord: 'Bm', time: 25, fingerGesture: '✊ Fist (0) → Bm' },
          { text: 'And trust me I\'ll give it a chance now',           chord: 'Em', time: 30,  fingerGesture: '☝️ Index (1) → Em' },
          { text: 'Take my hand, stop, put Van the Man on the jukebox', chord: 'G', time: 35,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'And then we start to dance',                        chord: 'A',  time: 40,  fingerGesture: '🤟 Three (3) → A' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'I\'m in love with the shape of you',                chord: 'Bm', time: 55,  fingerGesture: '✊ Fist (0) → Bm' },
          { text: 'We push and pull like a magnet do',                 chord: 'Em', time: 60,  fingerGesture: '☝️ Index (1) → Em' },
          { text: 'Although my heart is falling too',                  chord: 'G',  time: 65,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'I\'m in love with your body',                       chord: 'A',  time: 70,  fingerGesture: '🤟 Three (3) → A' },
          { text: 'Last night you were in my room',                    chord: 'Bm', time: 74,  fingerGesture: '✊ Fist (0) → Bm' },
          { text: 'And now my bedsheets smell like you',               chord: 'Em', time: 79,  fingerGesture: '☝️ Index (1) → Em' },
          { text: 'Every day discovering something brand new',         chord: 'G',  time: 84,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'I\'m in love with your body',                       chord: 'A',  time: 89,  fingerGesture: '🤟 Three (3) → A' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'One week in we let the story begin',                chord: 'Bm', time: 100, fingerGesture: '✊ Fist (0) → Bm' },
          { text: 'We\'re going out on our first date',                chord: 'Em', time: 105, fingerGesture: '☝️ Index (1) → Em' },
          { text: 'You and me are thrifty so go all you can eat',      chord: 'G',  time: 110, fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Fill up your bag and I fill up a plate',            chord: 'A',  time: 115, fingerGesture: '🤟 Three (3) → A' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'I\'m in love with the shape of you',                chord: 'Bm', time: 125, fingerGesture: '✊ Fist (0) → Bm' },
          { text: 'We push and pull like a magnet do',                 chord: 'Em', time: 130, fingerGesture: '☝️ Index (1) → Em' },
          { text: 'Although my heart is falling too',                  chord: 'G',  time: 135, fingerGesture: '✌️ Peace (2) → G' },
          { text: 'I\'m in love with your body',                       chord: 'A',  time: 140, fingerGesture: '🤟 Three (3) → A' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Come on, be my baby come on',                       chord: 'Bm', time: 170, fingerGesture: '✊ Fist (0) → Bm' },
          { text: 'Come on, be my baby come on',                       chord: 'Em', time: 175, fingerGesture: '☝️ Index (1) → Em' },
          { text: 'I\'m in love with the shape of you',                chord: 'G',  time: 180, fingerGesture: '✌️ Peace (2) → G' },
          { text: 'I\'m in love with your body',                       chord: 'A',  time: 185, fingerGesture: '🤟 Three (3) → A' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Count On Me – Bruno Mars  |  89 BPM
  // ═══════════════════════════════════════════════════════════════════
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
        name: 'Verse',
        lyrics: [
          { text: 'If you ever find yourself stuck in the middle of the sea', chord: 'C', time: 8, fingerGesture: '✊ Fist (0) → C' },
          { text: 'I\'ll sail the world to find you',                  chord: 'Em', time: 14,  fingerGesture: '☝️ Index (1) → Em' },
          { text: 'If you ever find yourself lost in the dark and you can\'t see', chord: 'Am', time: 20, fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'I\'ll be the light to guide you',                   chord: 'G',  time: 26,  fingerGesture: '🤟 Three (3) → G' },
          { text: 'Find out what we\'re made of',                      chord: 'C',  time: 32,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'When we are called to help our friends in need',    chord: 'F',  time: 37,  fingerGesture: '☝️ Index (1) → F' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'You can count on me like one, two, three',          chord: 'C',  time: 44,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'I\'ll be there',                                    chord: 'Em', time: 50,  fingerGesture: '☝️ Index (1) → Em' },
          { text: 'And I know when I need it I can count on you like four, three, two', chord: 'Am', time: 54, fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'And you\'ll be there',                              chord: 'G',  time: 62,  fingerGesture: '🤟 Three (3) → G' },
          { text: '\'Cause that\'s what friends are supposed to do',   chord: 'C',  time: 66,  fingerGesture: '✊ Fist (0) → C' },
          { text: 'Oh, yeah, woah, woah',                              chord: 'F',  time: 72,  fingerGesture: '☝️ Index (1) → F' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'If you tossin\' and you\'re turnin\' and you just can\'t fall asleep', chord: 'C', time: 80, fingerGesture: '✊ Fist (0) → C' },
          { text: 'I\'ll sing a song beside you',                      chord: 'Em', time: 86,  fingerGesture: '☝️ Index (1) → Em' },
          { text: 'And if you ever forget how much you really mean to me', chord: 'Am', time: 92, fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Every day I will remind you',                       chord: 'G',  time: 98,  fingerGesture: '🤟 Three (3) → G' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'You can count on me like one, two, three',          chord: 'C',  time: 106, fingerGesture: '✊ Fist (0) → C' },
          { text: 'I\'ll be there',                                    chord: 'Em', time: 112, fingerGesture: '☝️ Index (1) → Em' },
          { text: 'And I know when I need it I can count on you like four, three, two', chord: 'Am', time: 116, fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'And you\'ll be there',                              chord: 'G',  time: 124, fingerGesture: '🤟 Three (3) → G' },
        ],
      },
      {
        name: 'Bridge',
        lyrics: [
          { text: 'You\'ll always have my shoulder when you cry',       chord: 'C',  time: 132, fingerGesture: '✊ Fist (0) → C' },
          { text: 'I\'ll never let go, never say goodbye',             chord: 'F',  time: 138, fingerGesture: '☝️ Index (1) → F' },
          { text: 'You know you can count on me',                      chord: 'Am', time: 144, fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Like I know I can count on you, counting on you',   chord: 'G',  time: 150, fingerGesture: '🤟 Three (3) → G' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'You can count on me, I can count on you',           chord: 'C',  time: 158, fingerGesture: '✊ Fist (0) → C' },
          { text: 'You can count on me...',                            chord: 'G',  time: 164, fingerGesture: '🤟 Three (3) → G' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // Zombie – The Cranberries  |  84 BPM
  // ═══════════════════════════════════════════════════════════════════
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
    defaultStrumPattern: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
    displayPattern: '↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓',
    chords: ['Em', 'C', 'G', 'D'],
    fingerMapping: ['Em', 'C', 'G', 'D', 'Am', 'Bm'],
    sections: [
      {
        name: 'Verse',
        lyrics: [
          { text: 'Another head hangs lowly',                          chord: 'Em', time: 14,  fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Child is slowly taken',                             chord: 'C',  time: 19,  fingerGesture: '☝️ Index (1) → C' },
          { text: 'And the violence caused such silence',              chord: 'G',  time: 24,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Who are we mistaken',                               chord: 'D',  time: 29,  fingerGesture: '🤟 Three (3) → D' },
          { text: 'But you see it\'s not me',                          chord: 'Em', time: 34,  fingerGesture: '✊ Fist (0) → Em' },
          { text: 'It\'s not my family',                               chord: 'C',  time: 39,  fingerGesture: '☝️ Index (1) → C' },
          { text: 'In your head, in your head',                        chord: 'G',  time: 44,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'They are fighting',                                  chord: 'D',  time: 49,  fingerGesture: '🤟 Three (3) → D' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'In your head, in your head',                        chord: 'Em', time: 56,  fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Zombie, zombie, zombie-ie-ie',                      chord: 'C',  time: 62,  fingerGesture: '☝️ Index (1) → C' },
          { text: 'What\'s in your head, in your head',                chord: 'G',  time: 68,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Zombie, zombie, zombie-ie-ie, oh',                  chord: 'D',  time: 74,  fingerGesture: '🤟 Three (3) → D' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Another mother\'s breakin\'',                       chord: 'Em', time: 84,  fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Heart is taking over',                              chord: 'C',  time: 89,  fingerGesture: '☝️ Index (1) → C' },
          { text: 'When the violence causes silence',                   chord: 'G',  time: 94,  fingerGesture: '✌️ Peace (2) → G' },
          { text: 'We must be mistaken',                               chord: 'D',  time: 99,  fingerGesture: '🤟 Three (3) → D' },
          { text: 'It\'s the same old theme',                          chord: 'Em', time: 104, fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Since 1916',                                         chord: 'C',  time: 109, fingerGesture: '☝️ Index (1) → C' },
          { text: 'In your head, in your head',                        chord: 'G',  time: 114, fingerGesture: '✌️ Peace (2) → G' },
          { text: 'They\'re still fighting',                           chord: 'D',  time: 119, fingerGesture: '🤟 Three (3) → D' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'In your head, in your head',                        chord: 'Em', time: 125, fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Zombie, zombie, zombie-ie-ie',                      chord: 'C',  time: 131, fingerGesture: '☝️ Index (1) → C' },
          { text: 'What\'s in your head, in your head',                chord: 'G',  time: 137, fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Zombie, zombie, zombie-ie-ie, oh',                  chord: 'D',  time: 143, fingerGesture: '🤟 Three (3) → D' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Oh oh oh oh oh oh, ie-ie, oh',                      chord: 'Em', time: 175, fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Oh oh oh oh oh oh, ie-ie, oh',                      chord: 'C',  time: 181, fingerGesture: '☝️ Index (1) → C' },
          { text: 'Zombie, zombie, zombie',                             chord: 'G',  time: 187, fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Zombie, zombie, zombie',                             chord: 'D',  time: 193, fingerGesture: '🤟 Three (3) → D' },
        ],
      },
    ],
  },
]
