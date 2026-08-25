/**
 * Gesture Profiles — different chord mappings for different music styles
 * Same hand gestures, different chords
 */

export interface GestureProfile {
  id: string;
  name: string;
  description: string;
  genre: string[];
  mappings: Record<number, string>; // fingerCount → chord
}

export const PROFILES: GestureProfile[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Standard guitar chords',
    genre: ['Pop', 'Rock', 'Folk'],
    mappings: {
      0: 'Em',
      1: 'Am',
      2: 'G',
      3: 'C',
      4: 'D',
      5: 'F',
    },
  },
  {
    id: 'worship',
    name: 'Worship',
    description: 'Common worship song chords',
    genre: ['Worship', 'CCM', 'Gospel'],
    mappings: {
      0: 'Am',
      1: 'C',
      2: 'G',
      3: 'Em',
      4: 'F',
      5: 'D',
    },
  },
  {
    id: 'bollywood',
    name: 'Bollywood',
    description: 'Popular Hindi song chords',
    genre: ['Bollywood', 'Indian Pop'],
    mappings: {
      0: 'Am',
      1: 'C',
      2: 'G',
      3: 'F',
      4: 'Em',
      5: 'D',
    },
  },
  {
    id: 'blues',
    name: 'Blues',
    description: '12-bar blues chords',
    genre: ['Blues', 'Rock'],
    mappings: {
      0: 'E',
      1: 'A',
      2: 'B7',
      3: 'Am',
      4: 'D',
      5: 'G',
    },
  },
];

export function getProfileById(id: string): GestureProfile {
  return PROFILES.find(p => p.id === id) || PROFILES[0];
}

export function getChordForFingers(profile: GestureProfile, fingerCount: number): string {
  return profile.mappings[fingerCount] || '';
}
