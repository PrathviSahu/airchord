// ── Effects Chain ─────────────────────────────────────────────────────────────
//
// Signal path:
//   Sample Engine (dry signal)
//     ↓
//   EQ (body resonance, string brightness)
//     ↓
//   Compression (dynamic control)
//     ↓
//   Reverb (spatial depth)
//     ↓
//   Chorus (optional — adds width)
//     ↓
//   Output Bus

export interface EffectsConfig {
  /** Reverb wet/dry mix (0-1). Default: 0.15 */
  reverbMix: number
  /** Reverb decay time in seconds. Default: 0.9 */
  reverbDecay: number
  /** Room size (0-1). Larger = more reflections. Default: 0.5 */
  roomSize: number
  /** Body EQ boost in dB around 120-200 Hz. Default: 3.5 */
  bodyBoostDb: number
  /** String brightness cutoff in Hz. Default: 8000 */
  brightnessCutoffHz: number
  /** Compression threshold in dB. Default: -18 */
  compressionThresholdDb: number
  /** Compression ratio. Default: 3 */
  compressionRatio: number
  /** Chorus depth (0-1). 0 = off. Default: 0 */
  chorusDepth: number
  /** Master output level (0-1). Default: 0.82 */
  masterLevel: number
}

export const EFFECTS_PRESETS: Record<string, EffectsConfig> = {
  /** Default acoustic guitar tone. */
  acoustic: {
    reverbMix: 0.15,
    reverbDecay: 0.9,
    roomSize: 0.5,
    bodyBoostDb: 3.5,
    brightnessCutoffHz: 8000,
    compressionThresholdDb: -18,
    compressionRatio: 3,
    chorusDepth: 0,
    masterLevel: 0.82,
  },

  /** Close-mic, intimate, no reverb — like recording in a bedroom. */
  intimate: {
    reverbMix: 0.05,
    reverbDecay: 0.4,
    roomSize: 0.2,
    bodyBoostDb: 5.0,
    brightnessCutoffHz: 6000,
    compressionThresholdDb: -14,
    compressionRatio: 4,
    chorusDepth: 0,
    masterLevel: 0.85,
  },

  /** Large hall reverb — concert or church feel. */
  concert: {
    reverbMix: 0.30,
    reverbDecay: 2.0,
    roomSize: 0.9,
    bodyBoostDb: 2.5,
    brightnessCutoffHz: 10000,
    compressionThresholdDb: -20,
    compressionRatio: 2.5,
    chorusDepth: 0.08,
    masterLevel: 0.78,
  },

  /** Warm, mellow — nylon-string feel even on steel. */
  warm: {
    reverbMix: 0.18,
    reverbDecay: 1.2,
    roomSize: 0.6,
    bodyBoostDb: 4.5,
    brightnessCutoffHz: 4500,
    compressionThresholdDb: -16,
    compressionRatio: 3.5,
    chorusDepth: 0.05,
    masterLevel: 0.80,
  },

  /** Bright, present, compressed — cuts through a mix. */
  studio: {
    reverbMix: 0.10,
    reverbDecay: 0.6,
    roomSize: 0.3,
    bodyBoostDb: 2.0,
    brightnessCutoffHz: 12000,
    compressionThresholdDb: -15,
    compressionRatio: 4,
    chorusDepth: 0,
    masterLevel: 0.88,
  },

  /** Campfire — small room, warm, moderate reverb. */
  campfire: {
    reverbMix: 0.20,
    reverbDecay: 0.7,
    roomSize: 0.35,
    bodyBoostDb: 4.0,
    brightnessCutoffHz: 6500,
    compressionThresholdDb: -16,
    compressionRatio: 3,
    chorusDepth: 0,
    masterLevel: 0.82,
  },
}

/**
 * Build a reverb impulse response buffer.
 * This generates a synthetic room impulse that approximates
 * real acoustic reflections.
 */
export function buildReverbImpulse(
  sampleRate: number,
  decaySeconds: number,
  roomSize: number,
): AudioBuffer {
  const length = Math.floor(sampleRate * decaySeconds)
  // Use OfflineAudioContext for buffer creation
  // Since we can't create AudioBuffer without context, return config
  // The actual buffer creation happens in the audio engine
  return null as any // Placeholder — actual creation in guitarSound.ts
}

/**
 * Get the effects chain configuration for a given preset.
 */
export function getEffectsConfig(preset: string): EffectsConfig {
  return { ...(EFFECTS_PRESETS[preset] ?? EFFECTS_PRESETS.acoustic) }
}

/**
 * Merge partial overrides with a base preset.
 */
export function mergeEffectsConfig(
  base: string,
  overrides: Partial<EffectsConfig>,
): EffectsConfig {
  return { ...getEffectsConfig(base), ...overrides }
}
