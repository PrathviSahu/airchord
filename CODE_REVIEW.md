# AirChord — Deep Code Review

Scope: `website/` (the production React + Web Audio + MediaPipe app). Reviewed `src/core`,
`src/engines`, `src/utils`, `src/screens`, `src/hooks`, `src/services`, and the song data. The
`prototype/` folder is a near-complete separate implementation (see §M) and was considered
duplicated surface, not the live app.

Overall: the **audio engine (`utils/guitarSound.ts`) is genuinely strong** — good reverb impulse
model, tape saturation, careful humanization, graceful sample→physical-model fallback, voice
caching, audio-context recreation handling, and mic routing without feedback. The gesture math is
thoughtful. But the **orchestration/engine layer has serious architecture rot**: a large "ideal"
pipeline (`core/`, most of `engines/`, `SongLoader`) is dead, while the screens re-implement the
same logic inline. Several user-facing options are silently ignored, and a few latent crashes
hide in the unused-but-tempting-to-wire code.

---

## Severity legend
- 🔴 Critical — broken correctness / silent feature failure in shipping paths
- 🟠 High — dead architecture that will mislead or has hidden crashes; major maintainability debt
- 🟡 Medium — real bug confined to currently-unused code, or a confusing/drifting duplication
- 🟢 Low — style / minor

---

## 🔴🔴 Critical / High

### 1. `core/` (PerformanceEngine, TransportEngine) and most of `engines/` are dead code
`PerformanceEngine` and `TransportEngine` are **never imported anywhere** (verified: no importer
outside their own files). The live and practice screens each implement their **own** beat
scheduler and transport clock inline, duplicating the exact drift-corrected `setTimeout` loop and
lyric-matching logic that `TransportEngine` already contains.

- `LivePerformanceScreen.tsx` "Beat Engine" effect ≈ `PerformanceEngine.startBeatEngine()`.
- `LivePerformanceScreen.tsx` "Transport Clock" effect ≈ `TransportEngine.tick()`/`updateFromPosition()`.

**Impact:** the documented "single clock / conductor" design does not exist at runtime. Two clocks
can drift apart conceptually, fixes to `core/` don't reach users, and a new contributor will
reason about the wrong module. **This is the single biggest issue.**

**Fix:** Either (a) actually wire `PerformanceEngine`+`TransportEngine` into the screens and delete
the inline loops, or (b) delete `core/` and the unused `engines/` pieces and rename the inline
loops into a shared `useBeatClock`/`useTransport` hook. Do not leave both.

### 2. `PerformanceEngine.playNextBeat()` computes audio and throws it away
`src/core/PerformanceEngine.ts` builds a `HumanizedStrum` via `this.humanizer.humanizeStrum(...)`
and then **does nothing with it** — the only thing emitted is `audio:beat` for the UI. The comment
says "Future: connect directly to the Sample Engine." So the elaborate Virtual Guitarist →
Humanizer → Strumming pipeline produces **zero sound** even if you wired this class up.

**Fix:** route the humanized strum into `playHumanizedStrum()` (already exists). Or delete the
class (see §1).

### 3. `getActiveEngine()` silently overrides guitar type — electric / 12-string are unreachable
`src/utils/guitarSound.ts`:
```ts
function getActiveEngine(): IGuitarEngine {
  if (currentEngineMode === 'nylon') { currentGuitarType = 'nylon'; return physicalEngine }
  if (currentEngineMode === 'sampled') { currentGuitarType = 'steel'; return sampledEngine }
  currentGuitarType = 'steel'; return physicalEngine
}
```
Called on **every** playback. So whatever `currentGuitarType` was set to, the next strum resets it
to `steel`/`nylon`. Meanwhile `setGuitarType()` is **never called anywhere** in the app. Result:
the `electric` and `12string` entries in `GUITAR_TONES` are dead, and the "Sound Engine" UI in
`SongSetupScreen` only flips engine *mode* (`setEngineMode`), conflating "Nylon" with guitar type.
There is **no way to select electric or 12-string tone**.

**Fix:** decouple type from mode. Make `getActiveEngine()` read `currentGuitarType` (and the
`nylon` mode a deliberate override), or expose a real guitar-type selector that sets the type and
have the sampled/nylon synth honor it.

### 4. `LivePerformanceScreen` silently ignores 3 session settings
`SongSetupScreen` collects `humanizerPreset`, `isFingerstyle`, and `fingerstylePattern` into
`SessionConfig`, but `LivePerformanceScreen` only applies `config.personality` (mapped to style)
and `config.effectsPreset`. It never:
- applies `humanizerPreset` (the `GuitaristEngine` sets the humanizer purely from style),
- enters fingerstyle mode,
- uses `fingerstylePattern`.

`FingerstyleEngine` is therefore **dead in the live path** (and in `PracticeRoomScreen` too).
A user who turns on "Fingerstyle mode" and picks a pattern gets a normal strum — no feedback that
the option did nothing.

**Fix:** in the live/practice screens, call `guitaristRef.current.getHumanizer().setPreset(...)`
from `humanizerPreset`, and branch the beat to `FingerstyleEngine.getNextNotes(...)` when
`isFingerstyle` is true. Or remove the options from the setup screen until supported.

### 5. `PERSONALITIES.pop` resolves to `undefined` (latent crash)
`src/engines/VirtualGuitarist/personalities.ts` and `VirtualGuitarist` constructor / `setPersonality`:
```ts
return PERSONALITIES.pop   // PERSONALITIES is a plain object → no .pop → undefined
```
`?? PERSONALITIES.pop` is meant as a default, but on a plain object `.pop` is `undefined`, so for
any unknown personality string the fallback assigns `this.personality = undefined`. The next
`decideStroke()` dereferences `this.personality.strumIntensity` → throws. In
`personalityFromCollections()`, the **final branch** (`return PERSONALITIES.pop`) is hit for any
song tagged only with `Hindi`/`English`/`Beginner`/`Advanced` (none of the early branches match).

**Fix:** replace with a real default, e.g. `?? PERSONALITIES.pop` → `?? PERSONALITIES.pop` ...
the intent is clearly `?? PERSONALITIES['pop']` (or better, a named `PERSONALITIES.fallback`).

### 6. `SongLoader` + 19 JSON song files are dead code, drifting from `SEED_SONGS`
`src/services/SongLoader.ts` has **zero importers**. `App.tsx`/`SongSearchScreen`/`SongSetupScreen`
all consume `SEED_SONGS` from `utils/songLibrary.ts` (the inline ~1400-line array). The `songs/*.json`
files are a *second, parallel* copy of the same 19 songs — and they differ: the JSON files have
`fingerMapping: null` while `SEED_SONGS` has it populated. If anyone "turns on" JSON loading, the
finger-mapping fallback path (`[...song.chords, ...fill].slice(0,6)`) becomes the default and is
untested.

**Fix:** pick one source of truth. Either drive the app from `SongLoader`/`songs/*.json` (and add
`fingerMapping` to the JSON), or delete `SongLoader` + the JSON dir.

---

## 🟡 Medium

### 7. `TransportEngine.getState()` hardcodes 4/4
`beatInMeasure = Math.floor((currentSec*1000/beatMs) % 4)` and `measure` assume 4/4. Songs
**Perfect (6/8)** and **Hallelujah (6/8)** would show wrong beat/measure numbers. (Confined to dead
code today, but will misrender the moment §1 is wired.)

### 8. `TransportEngine.dispose()` calls `eventBus.clear()` on the global singleton
`eventBus` is a module-level singleton shared by the whole app. `clear()` with no argument wipes
**all** listeners, not just this engine's. `PerformanceEngine.dispose()` → `transport.dispose()`
would therefore unsubscribe unrelated components. Catastrophic if ever wired into a running app.

**Fix:** never blanket-clear a shared bus. Track per-engine subscriptions and remove only those.

### 9. `PerformanceEngine` leaks its `gesture:detected` subscription
The constructor does `eventBus.on('gesture:detected', ...)` but stores no unsubscribe handle, and
`dispose()` never removes it (it only calls `stop()` → `transport.dispose()` → the global clear of
§8). So restarting a `PerformanceEngine` would stack duplicate listeners.

### 10. Pervasive duplication
- `playBufferVoice` vs `playBufferVoiceExact` in `guitarSound.ts` are ~60 near-identical lines
  (the "exact" variant just drops randomization). Fold into one parametrized function.
- `utils/guitarSound.ts` (implementation) and `engines/AudioEngine/guitarSound.ts` (re-export of
  the same file) — split only adds confusion.
- `utils/guitaristEngine.ts` is a 13-line re-export of `engines/GuitaristEngine`; `PracticeRoomScreen`
  imports the shim while `LivePerformanceScreen` imports the real one. Pick one path.
- Two beat clocks (§1) and two transport clocks (§1).
- Two song sources (§6).

### 11. `GuitaristEngine.playBeat()` re-implements strum dispatch, bypassing `StrummingEngine`
`engines/GuitaristEngine/index.ts` calls `playMuteStrum`/`playHumanizedStrum` directly, so the
exported `StrummingEngine` (with its own accent curves) is never used by the live path. The
accent logic in `StrummingEngine` and the velocity logic in `VirtualGuitarist`/`Humanizer` can
diverge.

**Fix:** have `GuitaristEngine` delegate to `StrummingEngine`, or delete `StrummingEngine`.

### 12. Event bus is half-wired
`eventBus.emit('gesture:detected', ...)` and `eventBus.emit('audio:beat', ...)` are produced in the
screens but **no screen subscribes** to them (the screens use React state directly). The
`useTransport`/`useRecording` hooks that *do* subscribe are themselves unused (see §13). So the
bus is a producer-only firehose for those events.

### 13. `useRecording` and `useTransport` hooks are unused
Both are fully implemented (and `useRecording` correctly mirrors the inline logic in the screens)
but imported nowhere; the screens inline their own recording/transport code instead. Either adopt
these hooks or delete them to avoid two divergent implementations.

### 14. Audio is scheduled "play now", not sample-accurately to a master clock
The beat scheduler corrects the **JS** `setTimeout` (good), but `playHumanizedStrum()` schedules
each note at `ctx.currentTime + delaySec` computed at callback time. So timing is bounded by
callback/audio-thread latency, not locked to a single `AudioContext` timeline. Acceptable for this
app, but it's not the "single clock" the architecture claims, and tight patterns can jitter.

### 15. Fallback line-advance in live transport is a magic number
When `lrclib` fails, `secPerLine = (16 * 60) / (bpm || 90)` (~15 s/line at 63 BPM) is used to
advance `currentLine`. For Perfect (lyrics every 6 s) this is badly wrong; the lyric highlight will
lag badly until a good LRC is fetched. Prefer deriving a per-song gap from the local lyric times.

### 16. `GestureProfiles` "rock" entry is mislabeled and `fingerGesture` is dead-but-present
- `PRESET_GESTURE_PROFILES` id `'rock'` has `name: 'Campfire Rock'` and mapping
  `['A','E','D','G','Bm','F#m']` — inconsistent with the id.
- `TimestampedLyric.fingerGesture` is marked `@deprecated` in types but is still populated on every
  line of `SEED_SONGS` (emoji + "✊ Fist (0) → G" strings). It's never read at runtime. Either drop
  it from the data or actually use it.

### 17. `prototype/` duplicates the app
`prototype/src` contains its own `audio/AudioEngine.ts`, `gesture/GestureEngine.ts`,
`utils/...`, `camera/...`, `hooks` etc. — a second implementation of the same features as
`website/src`. Two parallel codebases for the same product is a long-term maintenance tax and a
source of divergent bugs. Recommend keeping one.

---

## 🟢 Low
- `VirtualGuitarist` personalities carry `timingFeel`, `swingRatio`, `voicingPreference` that are
  never consumed (no swing is applied). Dead config.
- `PerformanceEngine.restart()` only calls `stop()` — it never restarts. Misleading name.
- `PerformanceEngine` reads a private field via `(this.transport as any)['bpm']`; add a getter.
- `tsconfig.json` sets `noUnusedLocals`/`noUnusedParameters` to `false`, which is why dead params
  like `_beatIdx` and unused imports slip through. Consider enabling them.
- `parseLRC()` is fine, but `padEnd(3,'0')` on a 1-char ms component turns `[mm:ss.5]` into 0.5 s —
  acceptable; just note it assumes centiseconds, not milliseconds.

---

## Strengths (keep these)
- `utils/guitarSound.ts`: excellent reverb impulse (pre-delay + discrete early reflections +
  decorrelated tail), tape-style `tanh` saturation, `OfflineAudioContext` sample EQ, voice/context
  caching with generation guards, clean mic→recording routing (no speaker feedback), and graceful
  offline fallback to the Karplus-Strong model.
- Web Audio graph is built defensively (`getAudioContext()` handles closed contexts on hot reload).
- `GestureEngine` finger-counting is angle-agnostic (wrist→tip vs wrist→PIP) and uses anatomical
  palm-ratio rejection — robust against false positives.
- Screens are decomposed into focused sub-components (`CameraPanel`, `StageHUD`, `Timeline`, etc.).
- TypeScript `strict: true` is on, and `core.test.ts` already guards chord-voicing widths and
  song-data invariants — expand it to cover the bugs above.

---

## Recommended plan (in order)
1. **Resolve the dead-code fork (§1, §6, §10, §11, §13):** choose one clock, one transport, one
   song source, one guitarist path. Delete or wire the rest. This removes the biggest risk.
2. **Fix the silent no-ops (§3, §4, §5):** guitar-type selection, humanizer preset, fingerstyle
   mode. These are user-visible "nothing happens" bugs.
3. **Harden the bus & engine lifecycle (§7, §8, §9):** never global-clear; track subscriptions;
   respect time signature.
4. **De-duplicate the audio voice renderer (§10)** and add vitest coverage for `getActiveEngine`,
   `PERSONALITIES` fallback, and `LivePerformanceScreen` config application.
5. **Collapse `prototype/` (§17)** into one codebase.

---

## Fixes applied (this session)

Validation: `npx tsc --noEmit` → exit 0; `npx vitest run` → 38/38 passing.

- **§5 `PERSONALITIES.pop` → `undefined` latent crash.**
  - `src/engines/VirtualGuitarist/personalities.ts`: `personalityFromCollections()` final
    fallback (and the `Pop` branch) now returns `PERSONALITIES['pop']` instead of
    `PERSONALITIES.pop` (a plain object has no `.pop`, so the `??` resolved to `undefined`).
  - `src/engines/VirtualGuitarist/VirtualGuitarist.ts`: same fix in the constructor and
    `setPersonality()` (`?? PERSONALITIES['pop']`).

- **§3 Guitar type was unreachable (electric / 12-string dead).**
  - `src/utils/guitarSound.ts` `getActiveEngine()` no longer overwrites `currentGuitarType` on
    every playback (it still forces `nylon` only for the `nylon` engine mode). So
    `setGuitarType('electric' | '12string' | ...)` is now honored for sampled/synth modes.
  - `src/screens/SongSetupScreen.tsx`: added a real **Guitar** selector (Steel / Nylon / Electric /
    12-String) that calls `setGuitarType` and auditions the tone, so the fix is reachable from the
    UI.

- **§4 Silent no-ops in `LivePerformanceScreen` are now wired.**
  - `config.humanizerPreset` is applied via `guitaristRef.current.getHumanizer().setPreset(...)`
    in an effect ordered *after* the personality effect (which also sets a style-derived
    humanizer), so the user's choice wins.
  - `config.isFingerstyle` now branches the beat engine into `FingerstyleEngine`:
    `getNextNotes()` plucks the detected chord's voicing on the selected pattern, anchored to a
    cycle start time set when playback begins. The fingerstyle pattern is kept in sync via an
    effect. (Practice room does not yet use fingerstyle — noted as remaining work.)

- **Whisper-based lyrics follower (replaces the Web Speech API).** Per the chosen approach,
  the browser `webkitSpeechRecognition` voice follower was removed and replaced with an
  on-device Whisper pipeline:
  - `src/hooks/useWhisperFollower.ts` — loads `Xenova/whisper-tiny` (WebGPU, q8) once
    (module-level singleton), captures mic PCM at 16 kHz, gates transcription with a light
    energy VAD, and aligns recognized words to the lyric script to advance/correct the
    highlighted line. Multilingual: language is derived from song collections (`hindi` for
    Bollywood/Hindi, else `english`). Gracefully degrades to `unavailable` if the model
    or mic is missing.
  - `src/hooks/lyricsAlign.ts` — pure, extracted `normalize` / `resample` / `alignRecognizedText`
    helpers (no transformers import) so the matching logic is unit-testable.
  - `src/hooks/lyricsAlign.test.ts` — 7 tests covering normalization, resampling, and line
    alignment.
  - Live screen shows a small status badge (`Whisper loading N%` / `Listening · Whisper` /
    `Voice follow unavailable`).
  - Honest caveat carried forward: Whisper is trained on **speech, not singing**, so on sung
    vocals accuracy is limited — it works best as a drift-corrector on top of the accurate
    `lrclib` timed lyrics, not as a primary singer tracker. First load now also pulls the
    Whisper model (~75 MB) after MediaPipe + samples.

### Not yet done (still open from the review)
- §1 / §6 / §10 / §11 / §13 (dead-code fork: `core/`, `SongLoader`+JSON, duplicated voice
  renderer, unused hooks) — large deletions; left in place pending your go-ahead.
- §7 / §8 / §9 (bus global-clear, time-signature hardcoded to 4/4, subscription leak) — confined
  to the currently-dead `TransportEngine`/`PerformanceEngine`; will be addressed when that fork is
  resolved.
- §17 (`prototype/` duplicate).
