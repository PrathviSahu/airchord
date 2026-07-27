// ── Popular Hindi Songs Library with Hand Gesture Mappings & Strumming Patterns ──

export interface HindiSong {
  id: string
  title: string
  movie: string
  singer: string
  scale: string
  bpm: number
  strumPattern: string[]
  displayPattern: string
  fingerMapping: Record<number, string> // 0: Fist, 1: Index, 2: Peace, 3: Three, 4: Four, 5: Palm
  lyricsWithChords: { line: string; chord: string; fingerGesture: string }[]
}

export const HINDI_SONGS: HindiSong[] = [
  {
    id: 'tum_hi_ho',
    title: 'Tum Hi Ho',
    movie: 'Aashiqui 2',
    singer: 'Arijit Singh',
    scale: 'Em',
    bpm: 92,
    strumPattern: ['D', '.', 'D', 'U', '.', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ • ↑ ↓ ↑',
    fingerMapping: {
      0: 'Em', // Fist
      1: 'Am', // 1 Finger
      2: 'D',  // 2 Fingers (Peace)
      3: 'C',  // 3 Fingers
      4: 'G',  // 4 Fingers
      5: 'B7', // 5 Fingers (Palm)
    },
    lyricsWithChords: [
      { line: 'Hum tere bin ab reh nahi sakte', chord: 'Em', fingerGesture: '✊ Fist (0)' },
      { line: 'Tere bina kya wajood mera', chord: 'Am', fingerGesture: '☝️ Index (1)' },
      { line: 'Tujhse juda agar ho jayenge', chord: 'D', fingerGesture: '✌️ Peace (2)' },
      { line: 'Toh khud se hi ho jayenge judaa', chord: 'C', fingerGesture: '🤟 Three (3)' },
      { line: 'Kyunki tum hi ho, ab tum hi ho', chord: 'Em', fingerGesture: '✊ Fist (0)' },
      { line: 'Zindagi ab tum hi ho', chord: 'G', fingerGesture: '🖐️ Four (4)' },
      { line: 'Chain bhi, mera dard bhi', chord: 'Am', fingerGesture: '☝️ Index (1)' },
      { line: 'Meri aashiqui ab tum hi ho', chord: 'D', fingerGesture: '✌️ Peace (2)' },
    ],
  },
  {
    id: 'kesariya',
    title: 'Kesariya',
    movie: 'Brahmastra',
    singer: 'Arijit Singh',
    scale: 'C',
    bpm: 98,
    strumPattern: ['D', 'D', 'U', 'U', 'D', 'U'],
    displayPattern: '↓ ↓ ↑ ↑ ↓ ↑',
    fingerMapping: {
      0: 'C',  // Fist
      1: 'Am', // 1 Finger
      2: 'F',  // 2 Fingers
      3: 'G',  // 3 Fingers
      4: 'Dm', // 4 Fingers
      5: 'Em', // 5 Fingers
    },
    lyricsWithChords: [
      { line: 'Mujhko kitna pyaar hai tumse', chord: 'C', fingerGesture: '✊ Fist (0)' },
      { line: 'Bolna hi nahi aata', chord: 'Am', fingerGesture: '☝️ Index (1)' },
      { line: 'Kesariya tera ishq hai piya', chord: 'C', fingerGesture: '✊ Fist (0)' },
      { line: 'Rang jaaun jo main haath lagaun', chord: 'G', fingerGesture: '🤟 Three (3)' },
      { line: 'Biti ratiya saare teri khair maange', chord: 'F', fingerGesture: '✌️ Peace (2)' },
      { line: 'Koshish karein toh ho jaaun tera', chord: 'G', fingerGesture: '🤟 Three (3)' },
    ],
  },
  {
    id: 'apna_bana_le',
    title: 'Apna Bana Le',
    movie: 'Bhediya',
    singer: 'Arijit Singh',
    scale: 'Am',
    bpm: 88,
    strumPattern: ['D', '-', 'D', 'U', '-', 'U', 'D', 'U'],
    displayPattern: '↓ • ↓ ↑ • ↑ ↓ ↑',
    fingerMapping: {
      0: 'Am', // Fist
      1: 'F',  // 1 Finger
      2: 'C',  // 2 Fingers
      3: 'G',  // 3 Fingers
      4: 'Dm', // 4 Fingers
      5: 'Em', // 5 Fingers
    },
    lyricsWithChords: [
      { line: 'Tu mera koi na hoke bhi kuch lage', chord: 'Am', fingerGesture: '✊ Fist (0)' },
      { line: 'Tu mera koi na hoke bhi kuch lage', chord: 'F', fingerGesture: '☝️ Index (1)' },
      { line: 'Apna bana le mujhe, apna bana le mujhe', chord: 'C', fingerGesture: '✌️ Peace (2)' },
      { line: 'Dil ke nagar mein mujhe apna bana le mujhe', chord: 'G', fingerGesture: '🤟 Three (3)' },
    ],
  },
  {
    id: 'channa_mereya',
    title: 'Channa Mereya',
    movie: 'Ae Dil Hai Mushkil',
    singer: 'Arijit Singh',
    scale: 'C',
    bpm: 96,
    strumPattern: ['D', 'D', 'U', 'D', 'U'],
    displayPattern: '↓ ↓ ↑ ↓ ↑',
    fingerMapping: {
      0: 'C',  // Fist
      1: 'G',  // 1 Finger
      2: 'Am', // 2 Fingers
      3: 'F',  // 3 Fingers
      4: 'Dm', // 4 Fingers
      5: 'Em', // 5 Fingers
    },
    lyricsWithChords: [
      { line: 'Acha chalta hoon, duaon mein yaad rakhna', chord: 'C', fingerGesture: '✊ Fist (0)' },
      { line: 'Mere zikr ka zubaan pe swaad rakhna', chord: 'G', fingerGesture: '☝️ Index (1)' },
      { line: 'Dil ke sandookon mein, mere ache kaam rakhna', chord: 'Am', fingerGesture: '✌️ Peace (2)' },
      { line: 'Channa mereya mereya beliya', chord: 'F', fingerGesture: '🤟 Three (3)' },
    ],
  },
  {
    id: 'kal_ho_naa_ho',
    title: 'Kal Ho Naa Ho',
    movie: 'Kal Ho Naa Ho',
    singer: 'Sonu Nigam',
    scale: 'G',
    bpm: 84,
    strumPattern: ['D', 'U', 'U', 'D', 'U', 'U'],
    displayPattern: '↓ ↑ ↑ ↓ ↑ ↑',
    fingerMapping: {
      0: 'G',  // Fist
      1: 'Em', // 1 Finger
      2: 'C',  // 2 Fingers
      3: 'D',  // 3 Fingers
      4: 'Am', // 4 Fingers
      5: 'Bm', // 5 Fingers
    },
    lyricsWithChords: [
      { line: 'Har ghadi badal rahi hai roop zindagi', chord: 'G', fingerGesture: '✊ Fist (0)' },
      { line: 'Chhaav hai kabhi kabhi hai dhoop zindagi', chord: 'Em', fingerGesture: '☝️ Index (1)' },
      { line: 'Har pal yahan jee bhar jiyo', chord: 'C', fingerGesture: '✌️ Peace (2)' },
      { line: 'Jo hai samaa kal ho naa ho', chord: 'D', fingerGesture: '🤟 Three (3)' },
    ],
  },
  {
    id: 'pani_da_rang',
    title: 'Pani Da Rang',
    movie: 'Vicky Donor',
    singer: 'Ayushmann Khurrana',
    scale: 'Em',
    bpm: 104,
    strumPattern: ['D', 'X', 'U', 'D', 'X', 'U'],
    displayPattern: '↓ ✕ ↑ ↓ ✕ ↑',
    fingerMapping: {
      0: 'Em', // Fist
      1: 'D',  // 1 Finger
      2: 'C',  // 2 Fingers
      3: 'Am', // 3 Fingers
      4: 'G',  // 4 Fingers
      5: 'B7', // 5 Fingers
    },
    lyricsWithChords: [
      { line: 'Pani da rang vekh ke', chord: 'Em', fingerGesture: '✊ Fist (0)' },
      { line: 'Ankhiyaan cho anju rul de', chord: 'D', fingerGesture: '☝️ Index (1)' },
      { line: 'Maahi ve mohabbatan sachiyan ne', chord: 'C', fingerGesture: '✌️ Peace (2)' },
      { line: 'Mangda naseeba kuch hor hai', chord: 'Am', fingerGesture: '🤟 Three (3)' },
    ],
  },
]
