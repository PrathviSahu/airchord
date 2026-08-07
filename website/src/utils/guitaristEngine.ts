// ── Guitarist Engine (Backward-Compatible Re-export) ──────────────────────────
//
// The GuitaristEngine has been split into modular components:
//   - VoicingResolver  → chord voicing selection
//   - StrummingEngine  → stroke direction + accent + audio dispatch
//
// This file re-exports the legacy-compatible wrapper class so existing
// imports from 'utils/guitaristEngine' continue to work.
//
// New code should import from 'engines/GuitaristEngine' instead.

export { GuitaristEngine } from '../engines/GuitaristEngine'
export type { PlayStyle } from '../core/types'
