# AirChord code review

**Review date:** 2026-08-06  
**Scope:** `website/` production UI, `prototype/` technical demo, audio/gesture/recording paths, and project documentation.

## Executive summary

AirChord is a strong visual prototype with a useful separation between gesture recognition, the guitarist/orchestration layer, and the audio renderer. The main risk was that the app described itself as production-grade while several important paths were still demo-quality: the audio recorder did not contain the guitar engine, “sampled” audio fell back to a simple oscillator patch, mute played pitched notes with long tails, and the website had no typecheck script or automated tests.

The audio path has now been tightened up in `website/src/utils/guitarSound.ts`:

- sample-first playback with a deduplicated, lazy SoundFont loader;
- humanized Karplus-Strong physical-model fallback for immediate/offline playback;
- per-string timing, velocity, pitch, pick attack, damping, brightness, body EQ, stereo position, and reverb variation;
- genuine percussive muted strums rather than quiet sustained notes;
- headroom-conscious compressor/limiter settings;
- a recording mix bus so MediaRecorder can capture guitar plus microphone;
- microphone permission fallback so camera practice still works when mic access is denied;
- smooth audio muting, immediate beat-one start, and drift-corrected beat timers;
- lazy route/3D loading to reduce the first JavaScript payload;
- detector confidence passed through to gesture classification and hand inference capped at 30 FPS;
- live elapsed time and strum position preserved across pause/resume.

A truly recorded “real guitar” sound still requires licensed local multi-samples. The remote FluidR3 GM acoustic-guitar files are optional convenience assets, not a studio guitar library: they do not provide per-string/per-fret/velocity/articulation samples and they may be unavailable offline or blocked by a network policy. The physical model is therefore the reliable fallback, not a claim of recorded audio.

## Findings

### Fixed in this review

| Priority | Finding | Impact | Resolution |
|---|---|---|---|
| P0 | Performance recordings used the camera stream only. The Web Audio guitar output was not in the recorded video. Live mode also requested no microphone. | A downloaded performance could be silent except for camera audio, or contain no voice. | Added a recording-only Web Audio mix bus, microphone mixing helpers, and combined recorder streams. Live and practice request mic audio with a camera-only fallback. |
| P0 | `playMuteStrum` triggered pitched guitar notes and allowed the normal multi-second decay. | “Mute” was not a palm-muted guitar hit. | Added filtered noise/percussive mute hits with a ~50 ms envelope. |
| P1 | The old sample fallback was a three-oscillator periodic-wave patch. | It sounded synthetic and did not satisfy the physical-model promise. | Added lazy Karplus-Strong string buffers and used them immediately while samples load or offline. |
| P1 | Master gain was `1.85` before compression/limiting and six-string gains summed aggressively. | Normal chords were repeatedly driven into the limiter, causing a crushed/harsh sound. | Reduced per-string gain, added headroom, and retained the limiter only as peak protection. |
| P1 | Every audio initialization could start another sequential preload of ~30 remote files. | Duplicate requests, slow startup, unnecessary bandwidth, and poor offline behavior. | Added request de-duplication and an eight-note warm cache; other notes load lazily. |
| P1 | Camera + microphone permission was requested as one all-or-nothing operation in practice and live flows. | Declining the mic also prevented camera practice. | Added a camera-only retry and an accurate optional-mic status in practice. |
| P1 | Auto-strum used an interval whose first callback happened one full beat after start. | Countdown ended into a silent beat. | The first beat is fired immediately, then the interval continues. |
| P1 | Empty custom patterns could be passed as `['']`; custom tokens were not validated. | A malformed pattern could create a silent or unusable session. | Added custom pattern parsing and a safe fallback pattern. |
| P1 | The prototype had incorrect Am/C/D/A/Dm/B7 string positions and skipped notes such as `G#3`/`D#3`; its renderer had no strum timing or pick variation. | Chords could sound musically wrong and diverged from the website engine. | Corrected voicings and upgraded the prototype renderer with the same lightweight humanized physical-model approach. |
| P2 | Prototype camera lint reported missing React effect dependencies. | Lint was not clean and future callback changes could be missed. | Added the callback dependencies; prototype build/lint is now clean. |
| P2 | Website had no explicit typecheck command. | Type errors were easy to miss because Vite transpiles without typechecking. | Added `npm run typecheck` to `website/package.json`. |
| P1 | The initial bundle eagerly imported every screen and the Three.js scene. | Camera, recorder, and 3D dependencies delayed the first screen and inflated the entry chunk. | Added lazy route imports and lazy-loaded `StageScene`; the main entry is now about 319 kB minified, with route chunks loaded on demand. |
| P1 | Detector confidence was discarded and inference ran at display refresh rate. | Weak frames could become false chords and 60/120 FPS cameras competed with audio. | Passed MediaPipe confidence into `GestureEngine`, reject frames below the threshold, and cap detection at 30 FPS. |
| P1 | Live pause/resume restarted elapsed time and strum pattern position. | Lyrics and the beat indicator jumped backward after a pause. | Preserved transport seconds and pattern index across pause/resume and replaced interval drift with a corrected timeout. |

### Remaining bugs / risks

1. **No automated audio, gesture, or end-to-end tests.** The documentation claims large test counts, but there are no test files or test runner in either app. Add Vitest tests for chord voicings, capo math, pattern parsing, humanization bounds, and recording-stream composition. Add Playwright tests for permission-denied and record/download flows.
2. **The website and prototype are two separate applications.** They duplicate hand tracking, gesture profiles, and audio behavior. A fix in one can silently diverge from the other. Move shared domain/audio code into a workspace package or explicitly declare the prototype as a frozen demo.
3. **The website still has a large landing chunk.** Route splitting reduced the entry chunk to about 319 kB minified and moved Three.js into a separate chunk, but the landing route is still about 719 kB and `website/public/models/guitar.glb` is about 59 MB. Draco/Meshopt-compress the model, split the landing effects further, and set a performance budget in CI.
4. **The model and MediaPipe assets are remote runtime dependencies.** The hand model, WASM, SoundFont notes, and LRCLIB lyrics can fail due to CORS, ad blockers, offline use, or CDN changes. Add local/versioned assets or an explicit offline/error state and pin integrity/versioned URLs.
5. **Gesture confidence is now passed through, but needs calibration.** `GestureEngine` rejects low-confidence frames and no longer reports a fake `0.95`; threshold tuning, handedness-aware thumb logic, and a visible “uncertain” state still need recorded-landmark validation.
6. **Frame processing is still main-thread work.** Inference is now capped at 30 FPS, but `detectForVideo` still runs from a `requestAnimationFrame` loop. Use a worker where supported and keep audio scheduling independent from camera frame load.
7. **Live timing is improved but is not yet an AudioContext look-ahead transport.** Pause/resume now preserves elapsed seconds and pattern position, and the timer is drift-corrected. Schedule a beat window against `AudioContext.currentTime` for better background-tab and CPU-load behavior.
8. **Lyrics and external synced lyrics need licensing/product review.** Full copyrighted lyrics are bundled in `songLibrary.ts`, and LRCLIB is queried at runtime. Obtain rights or limit the product to user-provided/licensed lyrics, add attribution/terms, and avoid treating an external service as a guaranteed API.
9. **Recording lifecycle needs a dedicated service.** URL objects, recorder streams, countdown timers, and popup windows should all be cleaned up on route change/unmount. Add a single `useRecordingSession` hook with explicit `idle → recording → stopping → ready → disposed` states.
10. **Accessibility is incomplete.** Several icon-only controls lack accessible labels, camera/audio permission errors are not consistently announced, and the camera UI needs keyboard/focus verification. Add `aria-label`, live regions, focus-visible styles, and reduced-motion coverage.

## Recommended next milestones

### Milestone 1 — Make the audio library genuinely recorded

- Add a local asset manifest such as `public/audio/guitar/steel/{string}/{fret}/{velocity}.webm` or an equivalent compressed format.
- Record or license at least open strings plus representative frets, three velocity layers, down/up articulations, and release/noise samples.
- Use nearest-neighbor or velocity crossfade selection, then pitch-shift only small intervals; do not stretch one General MIDI note across the whole guitar.
- Keep the Karplus-Strong renderer as the offline/low-memory fallback.
- Add an A/B debug panel and an automated “sample available / fallback active” status.

### Milestone 2 — Make timing musical

- Replace `setInterval` beat triggering with a look-ahead scheduler (25–100 ms schedule window).
- Represent song position in beats, not independent lyric and strum clocks.
- Schedule chord changes and strums against `AudioContext.currentTime`.
- Preserve sustained shared strings intentionally, but track their actual release/damping state rather than only the last chord name.

### Milestone 3 — Make the repository shippable

- Add CI for `website` typecheck/build and `prototype` typecheck/build/lint.
- Add unit tests and a browser smoke test with mocked camera/model/network dependencies.
- Split or archive the prototype and reduce the initial bundle/model payload.
- Replace claims such as “full production” and “studio-quality samples” with capability-accurate language until licensed samples and backend services exist.

## Validation performed

From the repository root:

```bash
cd website
npm run typecheck
npm run build

cd ../prototype
npm run build
npm run lint
```

The website build succeeds. The build still reports a Vite chunk-size warning, which is an optimization task rather than a build failure.
