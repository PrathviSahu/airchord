// ── Virtual Guitarist — Style Personalities ───────────────────────────────────
//
// Each personality changes how the guitarist plays:
//   - Strumming intensity
//   - Timing feel
//   - Dynamics
//   - Voicing preference
//   - Muting behavior
//   - Accent patterns

import type { GuitaristPersonality } from './types'

export const PERSONALITIES: Record<string, GuitaristPersonality> = {
  campfire: {
    id: 'campfire',
    name: 'Campfire',
    description: 'Warm, relaxed, sing-along strumming around a fire',
    strumIntensity: 0.65,
    timingFeel: 'laid-back',
    dynamicsRange: 0.3,
    ghostStrokeFrequency: 0.05,
    palmMuteFrequency: 0.02,
    voicingPreference: 'warm',
    accentStrength: 0.5,
    letRingFactor: 0.7,
    bassEmphasis: 0.3,
    swingRatio: 0.52,
  },

  pop: {
    id: 'pop',
    name: 'Pop / Acoustic',
    description: 'Clean, rhythmic, radio-ready acoustic strumming',
    strumIntensity: 0.72,
    timingFeel: 'natural',
    dynamicsRange: 0.4,
    ghostStrokeFrequency: 0.08,
    palmMuteFrequency: 0.05,
    voicingPreference: 'varied',
    accentStrength: 0.65,
    letRingFactor: 0.4,
    bassEmphasis: 0.4,
    swingRatio: 0.50,
  },

  bollywood: {
    id: 'bollywood',
    name: 'Bollywood',
    description: 'Emotional, dynamic, with rhythmic complexity',
    strumIntensity: 0.70,
    timingFeel: 'natural',
    dynamicsRange: 0.5,
    ghostStrokeFrequency: 0.12,
    palmMuteFrequency: 0.08,
    voicingPreference: 'warm',
    accentStrength: 0.6,
    letRingFactor: 0.5,
    bassEmphasis: 0.5,
    swingRatio: 0.53,
  },

  rock: {
    id: 'rock',
    name: 'Rock',
    description: 'Aggressive strumming, strong accents, minimal ghost notes',
    strumIntensity: 0.88,
    timingFeel: 'tight',
    dynamicsRange: 0.35,
    ghostStrokeFrequency: 0.02,
    palmMuteFrequency: 0.15,
    voicingPreference: 'bright',
    accentStrength: 0.8,
    letRingFactor: 0.2,
    bassEmphasis: 0.6,
    swingRatio: 0.50,
  },

  worship: {
    id: 'worship',
    name: 'Worship / Ballad',
    description: 'Swelling dynamics, ambient, emotional builds',
    strumIntensity: 0.55,
    timingFeel: 'laid-back',
    dynamicsRange: 0.6,
    ghostStrokeFrequency: 0.06,
    palmMuteFrequency: 0.01,
    voicingPreference: 'warm',
    accentStrength: 0.4,
    letRingFactor: 0.85,
    bassEmphasis: 0.25,
    swingRatio: 0.51,
  },

  fingerstyle: {
    id: 'fingerstyle',
    name: 'Fingerstyle',
    description: 'Classical fingerpicking with thumb bass and melody',
    strumIntensity: 0.40,
    timingFeel: 'natural',
    dynamicsRange: 0.55,
    ghostStrokeFrequency: 0.0,
    palmMuteFrequency: 0.0,
    voicingPreference: 'varied',
    accentStrength: 0.3,
    letRingFactor: 0.9,
    bassEmphasis: 0.7,
    swingRatio: 0.50,
  },

  indie: {
    id: 'indie',
    name: 'Indie / Folk',
    description: 'Alternative strumming patterns, occasional muting, organic feel',
    strumIntensity: 0.60,
    timingFeel: 'natural',
    dynamicsRange: 0.45,
    ghostStrokeFrequency: 0.10,
    palmMuteFrequency: 0.06,
    voicingPreference: 'varied',
    accentStrength: 0.55,
    letRingFactor: 0.55,
    bassEmphasis: 0.35,
    swingRatio: 0.52,
  },
}

/**
 * Derive personality from song collection tags.
 */
export function personalityFromCollections(collections: string[]): GuitaristPersonality {
  if (collections.includes('Campfire')) return PERSONALITIES.campfire
  if (collections.includes('Worship')) return PERSONALITIES.worship
  if (collections.includes('Rock')) return PERSONALITIES.rock
  if (collections.includes('Indie')) return PERSONALITIES.indie
  if (collections.includes('Bollywood')) return PERSONALITIES.bollywood
  if (collections.includes('Romantic') || collections.includes('Ballad')) return PERSONALITIES.worship
    if (collections.includes('Pop')) return PERSONALITIES['pop']
    return PERSONALITIES['pop']
  }
