// ── Audio Engine Re-export ────────────────────────────────────────────────────
//
// Re-exports the audio engine for the new modular path.
// The actual implementation lives in utils/guitarSound.ts for backward compat.
// New code should import from this path.

export {
  type GuitarType,
  type EngineMode,
  type GuitarVoicing,
  type IGuitarEngine,
  initAudioEngine,
  setCapoFret,
  getCapoFret,
  setGuitarType,
  getGuitarType,
  setEngineMode,
  getEngineMode,
  setAudioMuted,
  isAudioMuted,
  setStrummingEnabled,
  isStrummingActive,
  toggleStrumming,
  getAudioCaptureStream,
  connectMicrophoneToRecording,
  disconnectMicrophoneFromRecording,
  createPerformanceRecordingStream,
  CHORD_NOTES,
  triggerGuitarChord,
  playGuitarChord,
  playStrum,
  playDownStrum,
  playUpStrum,
  playMuteStrum,
  playPatternBeat,
  playPluckNote,
  setGuitarSampleBaseUrl,
  getGuitarSampleBaseUrl,
} from '../../utils/guitarSound'
