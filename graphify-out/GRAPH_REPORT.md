# Graph Report - guitar project  (2026-08-25)

## Corpus Check
- 143 files · ~127,533 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 713 nodes · 1260 edges · 41 communities (39 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Virtual Guitarist & Voicing Resolver Engine
- Core Event Bus & Engine Events
- Prototype Vision & Camera Pipeline
- UI Landing & Floating Chord Badges
- Live Performance & Practice Screen Loop
- Website Build & Three.js Tooling
- Prototype MediaPipe Dependencies
- Animation & UI Utility Libraries
- Guitar Synthesis & Physical Modeling Core
- Prototype TSConfig App
- Adaptive Chord Preview UI
- DSP Audio Effects & Saturation Pipeline
- Website TSConfig Environment
- Prototype Audio Engine
- Prototype Node Config
- Recording Hook & Mic Capture Pipeline
- Song Setup & Search UI
- Fingerstyle Picking Engine
- Humanizer & Microtiming Engine
- Song Types & Lyric Synchronization
- Guitar Engine Interface & Strum Dispatch
- Prototype Linting Config
- Song Loader & Content Service
- Website App Shell & Routing
- Audio Effects Chain & Presets
- LRCLIB Lyrics Integration
- Prototype Hand Calibration Screen
- Root Vercel Deployment Config
- Audio Visualizer Component
- Performance Timeline Component
- Three.js JSX Definitions
- Karplus-Strong Algorithm & Note Parsing
- Shared Humanizer & Strum Helpers
- Prototype Root TSConfig
- Screen Props & Session Config
- Website Vercel Config

## God Nodes (most connected - your core abstractions)
1. `react` - 29 edges
2. `PerformanceEngine` - 28 edges
3. `initAudioEngine()` - 24 edges
4. `VirtualGuitarist` - 23 edges
5. `playHumanizedStrum()` - 21 edges
6. `compilerOptions` - 18 edges
7. `TransportEngine` - 18 edges
8. `PlayStyle` - 18 edges
9. `PracticeRoomScreen()` - 17 edges
10. `compilerOptions` - 17 edges

## Surprising Connections (you probably didn't know these)
- `ProfileSelectorProps` --references--> `GestureProfile`  [EXTRACTED]
  prototype/src/ui/ProfileSelector.tsx → prototype/src/gesture/GestureProfiles.ts
- `SingleChordBadge()` --calls--> `playStrum()`  [EXTRACTED]
  website/src/components/FloatingChordBadges.tsx → website/src/utils/guitarSound.ts
- `PerformanceEngine` --references--> `FingerstyleEngine`  [EXTRACTED]
  website/src/core/PerformanceEngine.ts → website/src/engines/Fingerstyle/FingerstyleEngine.ts
- `PerformanceEngine` --references--> `Humanizer`  [EXTRACTED]
  website/src/core/PerformanceEngine.ts → website/src/engines/Humanizer/Humanizer.ts
- `PerformanceEngine` --references--> `VirtualGuitarist`  [EXTRACTED]
  website/src/core/PerformanceEngine.ts → website/src/engines/VirtualGuitarist/VirtualGuitarist.ts

## Import Cycles
- None detected.

## Communities (41 total, 2 thin omitted)

### Community 0 - "Virtual Guitarist & Voicing Resolver Engine"
Cohesion: 0.07
Nodes (24): GuitarVoicing, PlayStyle, GuitaristEngine, SECTION_VOLUME, ACCENT_CURVES, SECTION_VOLUME, StrummingEngine, CHORD_VOICINGS (+16 more)

### Community 1 - "Core Event Bus & Engine Events"
Cohesion: 0.06
Nodes (16): EventBus, EventHandler, Unsubscribe, PerformanceEngine, TransportEngine, AirChordEvents, EffectsPreset, EngineMode (+8 more)

### Community 2 - "Prototype Vision & Camera Pipeline"
Cohesion: 0.06
Nodes (29): App(), Camera(), checkBrightness(), measureFps(), startCamera(), CameraProps, HandLandmark, HandResult (+21 more)

### Community 3 - "UI Landing & Floating Chord Badges"
Cohesion: 0.05
Nodes (26): LandingPage, ChordData, CHORDS, FloatingChordBadges(), SingleChordBadge(), GuitarLoadingScreen(), GuitarLoadingScreenProps, TIPS (+18 more)

### Community 4 - "Live Performance & Practice Screen Loop"
Cohesion: 0.08
Nodes (23): PracticeRoomScreen, LivePerformanceScreen(), AVAILABLE_CHORDS, GESTURE_LABELS, PracticeRoomScreen(), STROKE_GLYPH(), STRUM_PRESETS, FINGER_GESTURE_NAMES (+15 more)

### Community 5 - "Website Build & Three.js Tooling"
Cohesion: 0.06
Nodes (31): autoprefixer, postcss, @types/three, vitest, devDependencies, autoprefixer, postcss, tailwindcss (+23 more)

### Community 6 - "Prototype MediaPipe Dependencies"
Cohesion: 0.06
Nodes (31): oxlint, dependencies, @mediapipe/tasks-vision, react, react-dom, devDependencies, oxlint, @types/node (+23 more)

### Community 7 - "Animation & UI Utility Libraries"
Cohesion: 0.06
Nodes (31): class-variance-authority, clsx, framer-motion, gsap, lucide-react, ogl, @react-three/drei, @react-three/fiber (+23 more)

### Community 8 - "Guitar Synthesis & Physical Modeling Core"
Cohesion: 0.07
Nodes (25): applyEffectsConfig(), BufferVoiceOptions, COMMON_SAMPLE_NOTES, DEFAULT_EM, DEFAULT_VOICING, EffectsConfig, GUITAR_TONES, GuitarTone (+17 more)

### Community 9 - "Prototype TSConfig App"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+15 more)

### Community 10 - "Adaptive Chord Preview UI"
Cohesion: 0.13
Nodes (17): react, AdaptiveChordPreview(), AdaptiveChordPreviewProps, GESTURE_DESC, GESTURE_LABELS, CameraPanel(), CameraPanelProps, CountdownOverlay() (+9 more)

### Community 11 - "DSP Audio Effects & Saturation Pipeline"
Cohesion: 0.16
Nodes (21): buildMaster(), buildReverbImpulse(), buildSaturationCurve(), canonicalNote(), capoRatio(), centsRatio(), clamp(), dynamicsLevel() (+13 more)

### Community 12 - "Website TSConfig Environment"
Cohesion: 0.09
Nodes (22): DOM.Iterable, ES2020, compilerOptions, allowImportingTsExtensions, forceConsistentCasingInFileNames, isolatedModules, jsx, lib (+14 more)

### Community 13 - "Prototype Audio Engine"
Cohesion: 0.14
Nodes (13): AudioEngine, CHORD_VOICINGS, createKarplusStrongBuffer(), getNoiseBuffer(), noteFrequency(), PITCH_OFFSETS, randomBetween(), STRING_ATTACK (+5 more)

### Community 14 - "Prototype Node Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 15 - "Recording Hook & Mic Capture Pipeline"
Cohesion: 0.14
Nodes (17): useRecording(), connectMicrophoneToRecording(), createPerformanceRecordingStream(), disconnectMicrophoneFromRecording(), getAudioCaptureStream(), getCapoFret(), getGuitarSampleBaseUrl(), getGuitarType() (+9 more)

### Community 16 - "Song Setup & Search UI"
Cohesion: 0.14
Nodes (18): SongSearchScreen(), ALL_CHORDS, EFFECTS_OPTIONS, FINGERSTYLE_PATTERNS, GESTURE_LABELS, HUMANIZER_OPTIONS, parseCustomPattern(), PERSONALITY_OPTIONS (+10 more)

### Community 17 - "Fingerstyle Picking Engine"
Cohesion: 0.18
Nodes (7): Finger, FINGER_DEFAULT_STRINGS, FingerEvent, FINGERSTYLE_PATTERNS, FingerstyleEngine, FingerstylePattern, PluckedNote

### Community 18 - "Humanizer & Microtiming Engine"
Cohesion: 0.16
Nodes (7): clamp(), HumanizedNote, HumanizedStrum, Humanizer, HUMANIZER_PRESETS, HumanizerParams, randBetween()

### Community 19 - "Song Types & Lyric Synchronization"
Cohesion: 0.20
Nodes (11): SongSearchScreen, Song, SONG_COLLECTIONS, SongSection, TimestampedLyric, DIFFICULTY_DOT, SongRowProps, SongSearchScreenProps (+3 more)

### Community 20 - "Guitar Engine Interface & Strum Dispatch"
Cohesion: 0.21
Nodes (5): IGuitarEngine, PhysicalGuitarEngine, playPluckNote(), SampledGuitarEngine, scheduleStrum()

### Community 21 - "Prototype Linting Config"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 22 - "Song Loader & Content Service"
Cohesion: 0.28
Nodes (6): loadAllSongs(), loadSong(), precacheSongs(), SONG_IDS, songCache, songImporters

### Community 23 - "Website App Shell & Routing"
Cohesion: 0.29
Nodes (4): App(), AppMode, LivePerformanceScreen, SongSetupScreen

### Community 24 - "Audio Effects Chain & Presets"
Cohesion: 0.52
Nodes (4): EFFECTS_PRESETS, EffectsConfig, getEffectsConfig(), mergeEffectsConfig()

### Community 25 - "LRCLIB Lyrics Integration"
Cohesion: 0.38
Nodes (6): cache, fetchSyncedLyrics(), fetchWithTimeout(), LrclibResponse, parseLRC(), SyncedLine

### Community 26 - "Prototype Hand Calibration Screen"
Cohesion: 0.40
Nodes (3): CALIBRATION_STEPS, CalibrationScreenProps, CalibrationStep

### Community 27 - "Root Vercel Deployment Config"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

### Community 28 - "Audio Visualizer Component"
Cohesion: 0.67
Nodes (3): AudioVisualizer(), AudioVisualizerProps, getAudioAnalyser()

### Community 29 - "Performance Timeline Component"
Cohesion: 0.50
Nodes (3): STRUM_SYMBOL_MAP, Timeline(), TimelineProps

### Community 30 - "Three.js JSX Definitions"
Cohesion: 0.50
Nodes (3): IntrinsicElements, JSX, React

### Community 31 - "Karplus-Strong Algorithm & Note Parsing"
Cohesion: 0.67
Nodes (4): createKarplusStrongBuffer(), getModelBuffer(), noteFrequency(), parseNote()

### Community 32 - "Shared Humanizer & Strum Helpers"
Cohesion: 0.67
Nodes (4): getSharedHumanizer(), playDownStrum(), playPatternBeat(), playUpStrum()

### Community 34 - "Screen Props & Session Config"
Cohesion: 0.67
Nodes (3): LivePerformanceScreenProps, PracticeRoomScreenProps, SessionConfig

## Knowledge Gaps
- **234 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+229 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Adaptive Chord Preview UI` to `Core Event Bus & Engine Events`, `Prototype Vision & Camera Pipeline`, `UI Landing & Floating Chord Badges`, `Live Performance & Practice Screen Loop`, `Recording Hook & Mic Capture Pipeline`, `Song Setup & Search UI`, `Song Types & Lyric Synchronization`, `Prototype Linting Config`, `Website App Shell & Routing`, `Prototype Hand Calibration Screen`, `Audio Visualizer Component`, `Performance Timeline Component`?**
  _High betweenness centrality (0.204) - this node is a cross-community bridge._
- **Why does `Song` connect `Song Types & Lyric Synchronization` to `Core Event Bus & Engine Events`, `Screen Props & Session Config`, `Song Setup & Search UI`, `Song Loader & Content Service`, `Website App Shell & Routing`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `PerformanceEngine` connect `Core Event Bus & Engine Events` to `Virtual Guitarist & Voicing Resolver Engine`, `Fingerstyle Picking Engine`, `Humanizer & Microtiming Engine`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _234 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Virtual Guitarist & Voicing Resolver Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.06693803708729082 - nodes in this community are weakly interconnected._
- **Should `Core Event Bus & Engine Events` be split into smaller, more focused modules?**
  _Cohesion score 0.061367621274108705 - nodes in this community are weakly interconnected._
- **Should `Prototype Vision & Camera Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.058001397624039136 - nodes in this community are weakly interconnected._