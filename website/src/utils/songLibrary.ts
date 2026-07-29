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
  collections: string[] // e.g. ['Hindi', 'Bollywood', 'Pop', 'Beginner']
  duration: string // e.g. "4:22"
  defaultStrumPattern: string[] // e.g. ['D', 'D', 'U', 'U', 'D', 'U']
  displayPattern: string // e.g. "↓ ↓ ↑ ↑ ↓ ↑"
  fingerstylePattern?: string[] // e.g. ['P', 'I', 'M', 'A', 'M', 'I']
  chords: string[]
  fingerMapping: string[] // Default 0-5 finger chord assignments
  sections: SongSection[]
}

export const SONG_COLLECTIONS = [
  'All',
  'Hindi',
  'English',
  'Bollywood',
  'Pop',
  'Rock',
  'Indie',
  'Campfire',
  'Romantic',
  'Worship',
  'Beginner',
  'Advanced',
]

export const SEED_SONGS: Song[] = [
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
          { text: 'I found a love for me', chord: 'G', time: 0, fingerGesture: '✊ Fist (0) → G' },
          { text: 'Darling, just dive right in and follow my lead', chord: 'Em', time: 4, fingerGesture: '☝️ Index (1) → Em' },
          { text: 'Well, I found a girl, beautiful and sweet', chord: 'C', time: 8, fingerGesture: '✌️ Peace (2) → C' },
          { text: 'I never knew you were the someone waiting for me', chord: 'D', time: 12, fingerGesture: '🤟 Three (3) → D' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: '\'Cause we were just kids when we fell in love', chord: 'G', time: 16, fingerGesture: '✊ Fist (0) → G' },
          { text: 'Not knowing what it was, I will not give you up this time', chord: 'Em', time: 20, fingerGesture: '☝️ Index (1) → Em' },
          { text: 'But darling, just kiss me slow, your heart is all I own', chord: 'C', time: 24, fingerGesture: '✌️ Peace (2) → C' },
          { text: 'And in your eyes, you\'re holding mine', chord: 'D', time: 28, fingerGesture: '🤟 Three (3) → D' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Baby, I\'m dancing in the dark with you between my arms', chord: 'Em', time: 32, fingerGesture: '☝️ Index (1) → Em' },
          { text: 'Barefoot on the grass, listening to our favorite song', chord: 'C', time: 36, fingerGesture: '✌️ Peace (2) → C' },
          { text: 'When you said you looked a mess, I whispered underneath my breath', chord: 'G', time: 40, fingerGesture: '✊ Fist (0) → G' },
          { text: 'But you heard it, darling, you look perfect tonight', chord: 'D', time: 44, fingerGesture: '🤟 Three (3) → D' },
        ],
      },
      {
        name: 'Outro',
        lyrics: [
          { text: 'Well I found a woman, stronger than anyone I know', chord: 'G', time: 48, fingerGesture: '✊ Fist (0) → G' },
          { text: 'She shares my dreams, I hope that someday I\'ll share her home', chord: 'Em', time: 52, fingerGesture: '☝️ Index (1) → Em' },
          { text: 'I found a love, to carry more than just my secrets', chord: 'C', time: 56, fingerGesture: '✌️ Peace (2) → C' },
          { text: 'To carry love, to carry children of our own', chord: 'D', time: 60, fingerGesture: '🤟 Three (3) → D' },
        ],
      },
    ],
  },
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
          { text: 'Hum tere bin ab reh nahi sakte', chord: 'Em', time: 0, fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Tere bina kya wajood mera', chord: 'Am', time: 4, fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Tujhse juda gar ho jaayenge', chord: 'D', time: 8, fingerGesture: '✌️ Peace (2) → D' },
          { text: 'Toh khud se hi ho jaayenge judaa', chord: 'C', time: 12, fingerGesture: '🤟 Three (3) → C' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'Kyunki tum hi ho, ab tum hi ho', chord: 'Em', time: 16, fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Zindagi ab tum hi ho', chord: 'Am', time: 20, fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Chain bhi, mera dard bhi', chord: 'D', time: 24, fingerGesture: '✌️ Peace (2) → D' },
          { text: 'Meri aashiqui ab tum hi ho', chord: 'G', time: 28, fingerGesture: '🖐️ Four (4) → G' },
        ],
      },
    ],
  },
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
        name: 'Chorus',
        lyrics: [
          { text: 'Kesariya tera ishq hai piya', chord: 'C', time: 0, fingerGesture: '✊ Fist (0) → C' },
          { text: 'Rang jaaun jo main haath lagaun', chord: 'Am', time: 4, fingerGesture: '☝️ Index (1) → Am' },
          { text: 'Din beete saara teri fikr mein', chord: 'F', time: 8, fingerGesture: '✌️ Peace (2) → F' },
          { text: 'Rain saari teri kair maangoon', chord: 'G', time: 12, fingerGesture: '🤟 Three (3) → G' },
        ],
      },
    ],
  },
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
          { text: 'On a dark desert highway, cool wind in my hair', chord: 'Bm', time: 0, fingerGesture: '✊ Fist (0) → Bm' },
          { text: 'Warm smell of colitas, rising up through the air', chord: 'F#7', time: 5, fingerGesture: '☝️ Index (1) → F#7' },
          { text: 'Up ahead in the distance, I saw a shimmering light', chord: 'A', time: 10, fingerGesture: '✌️ Peace (2) → A' },
          { text: 'My head grew heavy and my sight grew dim', chord: 'E', time: 15, fingerGesture: '🤟 Three (3) → E' },
        ],
      },
      {
        name: 'Chorus',
        lyrics: [
          { text: 'Welcome to the Hotel California', chord: 'G', time: 20, fingerGesture: '🖐️ Four (4) → G' },
          { text: 'Such a lovely place, such a lovely face', chord: 'D', time: 25, fingerGesture: '🖐️ Five (5) → D' },
        ],
      },
    ],
  },
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
          { text: 'Tu mera koi na hoke bhi kuch lage', chord: 'D', time: 0, fingerGesture: '✊ Fist (0) → D' },
          { text: 'Apna bana le mujhe apna bana le piya', chord: 'Bm', time: 4, fingerGesture: '☝️ Index (1) → Bm' },
          { text: 'Dil ke makan mein tu mehmaan lagta hai', chord: 'G', time: 8, fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Aankhon se sunta hai baatein kahe bina', chord: 'A', time: 12, fingerGesture: '🤟 Three (3) → A' },
        ],
      },
    ],
  },
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
          { text: 'Lady, running down to the riptide', chord: 'Am', time: 0, fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Taken away to the dark side', chord: 'G', time: 3, fingerGesture: '☝️ Index (1) → G' },
          { text: 'I wanna be your left hand man', chord: 'C', time: 6, fingerGesture: '✌️ Peace (2) → C' },
          { text: 'I love you when you\'re singing that song', chord: 'Am', time: 9, fingerGesture: '✊ Fist (0) → Am' },
        ],
      },
    ],
  },
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
          { text: 'I\'ve heard there was a secret chord', chord: 'C', time: 0, fingerGesture: '✊ Fist (0) → C' },
          { text: 'That David played and it pleased the Lord', chord: 'Am', time: 5, fingerGesture: '☝️ Index (1) → Am' },
          { text: 'But you don\'t really care for music, do ya?', chord: 'C', time: 10, fingerGesture: '✊ Fist (0) → C' },
          { text: 'It goes like this, the fourth, the fifth', chord: 'F', time: 15, fingerGesture: '✌️ Peace (2) → F' },
        ],
      },
    ],
  },
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
          { text: 'Accha chalta hoon, duaon mein yaad rakhna', chord: 'C', time: 0, fingerGesture: '✊ Fist (0) → C' },
          { text: 'Mere zikr ka zubaan pe swaad rakhna', chord: 'G', time: 4, fingerGesture: '☝️ Index (1) → G' },
          { text: 'Dil ke sandookon mein, mere acche kaam rakhna', chord: 'Am', time: 8, fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Chitti taaron mein bhi mera tu salaam rakhna', chord: 'F', time: 12, fingerGesture: '🤟 Three (3) → F' },
        ],
      },
      {
        name: 'Verse',
        lyrics: [
          { text: 'O channa mereya mereya beliya o piya', chord: 'C', time: 16, fingerGesture: '✊ Fist (0) → C' },
          { text: 'O channa mereya mereya beliya o piya', chord: 'G', time: 20, fingerGesture: '☝️ Index (1) → G' },
          { text: 'O channa mereya mereya beliya o piya', chord: 'Am', time: 24, fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Kitabeyan se dil laga ke ve', chord: 'F', time: 28, fingerGesture: '🤟 Three (3) → F' },
        ],
      },
    ],
  },
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
          { text: 'Banno re banno meri maata ki boli', chord: 'D', time: 0, fingerGesture: '✊ Fist (0) → D' },
          { text: 'Re kabira maan jaa, re faqeera maan jaa', chord: 'G', time: 4, fingerGesture: '☝️ Index (1) → G' },
          { text: 'Aaja tujhko pukare teri parchhaiyan', chord: 'Bm', time: 8, fingerGesture: '✌️ Peace (2) → Bm' },
          { text: 'Re kabira maan jaa, re faqeera maan jaa', chord: 'A', time: 12, fingerGesture: '🤟 Three (3) → A' },
        ],
      },
    ],
  },
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
          { text: 'Pal bhar theher jao, dil ye sambhal jaye', chord: 'Am', time: 0, fingerGesture: '✊ Fist (0) → Am' },
          { text: 'Kaise tumhe roka karoon, meri taraf aao', chord: 'F', time: 4, fingerGesture: '☝️ Index (1) → F' },
          { text: 'Behte hain mere aansoo, agar tum saath ho', chord: 'G', time: 8, fingerGesture: '✌️ Peace (2) → G' },
          { text: 'Har gham beh jaye mera, agar tum saath ho', chord: 'C', time: 12, fingerGesture: '🤟 Three (3) → C' },
        ],
      },
    ],
  },
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
          { text: 'Dehleez pe mere dil ki, jo rakhe hain tune kadam', chord: 'Em', time: 0, fingerGesture: '✊ Fist (0) → Em' },
          { text: 'Tere naam pe meri zindagi, likh di mere sanam', chord: 'D', time: 4, fingerGesture: '☝️ Index (1) → D' },
          { text: 'Haan seekha maine jeena jeena jaise jeena', chord: 'C', time: 8, fingerGesture: '✌️ Peace (2) → C' },
          { text: 'Haan seekha maine jeena tumse hi seekha', chord: 'Bm', time: 12, fingerGesture: '🤟 Three (3) → Bm' },
        ],
      },
    ],
  },
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
          { text: 'Har ghadi badal rahi hai roop zindagi', chord: 'C', time: 0, fingerGesture: '✊ Fist (0) → C' },
          { text: 'Chaav hai kabhi kabhi hai dhoop zindagi', chord: 'G', time: 4, fingerGesture: '☝️ Index (1) → G' },
          { text: 'Har pal yahan jee bhar jiyo', chord: 'Am', time: 8, fingerGesture: '✌️ Peace (2) → Am' },
          { text: 'Jo hai samaa, kal ho naa ho', chord: 'F', time: 12, fingerGesture: '🤟 Three (3) → F' },
        ],
      },
    ],
  },
]

