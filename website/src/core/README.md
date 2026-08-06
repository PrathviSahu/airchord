# AirChord Architecture v3 — The Virtual Guitarist

> "People won't say 'it has great hand tracking.' They'll say: **It sounds like a real guitarist is playing with you.**"

## The Pipeline

```
Gesture Engine
  ↓
Performance Engine (conductor + single clock)
  ↓
Song Timeline (beat, measure, section, chord)
  ↓
Virtual Guitarist (musical decisions)
  ↓
Humanizer (micro-timing, velocity, pitch variation)
  ↓
Sample Engine (plays the actual audio)
  ↓
Effects Chain (reverb, EQ, compression)
  ↓
Output
```

**The Humanizer sits ABOVE the sample engine.** The sample engine only plays audio. The Humanizer makes musical decisions.

## New Folder Structure

```
website/src/
├── core/                          # Foundation layer
│   ├── types.ts                   # Central type definitions
│   ├── EventBus.ts                # Publish/subscribe decoupling
│   ├── TransportEngine.ts         # Single-clock timeline (DAW-style)
│   └── PerformanceEngine.ts       # The conductor
│
├── engines/
│   ├── VirtualGuitarist/          # ⭐ THE BRAIN
│   │   ├── VirtualGuitarist.ts    # Style-aware performance decisions
│   │   ├── personalities.ts       # Campfire, Pop, Bollywood, Rock, etc.
│   │   └── types.ts               # StrokeDecision, TransitionPlan, etc.
│   │
│   ├── Humanizer/                 # ⭐ MAKES IT SOUND HUMAN
│   │   └── Humanizer.ts           # ±4ms timing, ±2dB velocity, ±3 cents pitch
│   │
│   ├── Fingerstyle/               # ⭐ DEDICATED FINGERSTYLE ENGINE
│   │   └── FingerstyleEngine.ts   # P-I-M-A patterns (Travis, Arpeggio, etc.)
│   │
│   ├── Effects/                   # Signal processing chain
│   │   └── EffectsChain.ts        # Reverb, EQ, compression, chorus
│   │
│   ├── GuitaristEngine/           # Backward-compatible wrapper
│   │   ├── index.ts               # v2 now uses VirtualGuitarist + Humanizer
│   │   ├── VoicingResolver.ts     # Chord voicing selection
│   │   └── StrummingEngine.ts     # Stroke direction + audio dispatch
│   │
│   └── AudioEngine/               # Low-level audio output
│       ├── guitarSound.ts         # Karplus-Strong + sample playback
│       └── index.ts
│
├── services/
│   └── SongLoader.ts              # JSON-based song loading
│
├── hooks/
│   ├── useTransport.ts            # React hook for transport state
│   └── useRecording.ts            # React hook for MediaRecorder
│
├── components/LivePerformance/    # Decomposed performance screen
│   ├── CameraPanel.tsx
│   ├── StageHUD.tsx
│   ├── LyricsPanel.tsx
│   ├── Timeline.tsx
│   ├── CountdownOverlay.tsx
│   └── RecordingPreview.tsx
│
├── screens/                       # Route-level screens
├── songs/                         # JSON song files (19 songs)
└── utils/                         # Legacy compat re-exports
```

## Virtual Guitarist — Style Personalities

Each personality changes HOW the guitarist plays:

| Personality | Intensity | Feel | Dynamics | Let Ring | Accent |
|---|---|---|---|---|---|
| **Campfire** | 0.65 | Laid-back | 0.3 | 0.7 | 0.5 |
| **Pop** | 0.72 | Natural | 0.4 | 0.4 | 0.65 |
| **Bollywood** | 0.70 | Natural | 0.5 | 0.5 | 0.6 |
| **Rock** | 0.88 | Tight | 0.35 | 0.2 | 0.8 |
| **Worship** | 0.55 | Laid-back | 0.6 | 0.85 | 0.4 |
| **Fingerstyle** | 0.40 | Natural | 0.55 | 0.9 | 0.3 |
| **Indie** | 0.60 | Natural | 0.45 | 0.55 | 0.55 |

The Virtual Guitarist decides:
- **Which voicing** to use (from multiple variants)
- **Whether to accent or ghost** this beat
- **Whether to palm-mute** or let ring
- **How to transition** between chords (shared strings ring through)
- **Whether to add fret noise** on position changes

## Humanizer — Making It Sound Real

The same chord never sounds exactly the same twice.

```
Random Sample Selection
  ↓
±4 ms Timing Jitter
  ↓
±8% Velocity Variation
  ↓
±2.5 cents Pitch Drift
  ↓
Per-String Emphasis
  ↓
Output
```

| Preset | Timing | Velocity | Pitch | Dead Notes | Fret Squeak |
|---|---|---|---|---|---|
| **Tight** | ±1.5ms | ±4% | ±1¢ | 2% | 10% |
| **Natural** | ±3.5ms | ±8% | ±2.5¢ | 6% | 30% |
| **Loose** | ±5.5ms | ±14% | ±4¢ | 10% | 50% |
| **Campfire** | ±4ms | ±10% | ±3¢ | 8% | 40% |
| **Studio** | ±2ms | ±5% | ±1.5¢ | 3% | 15% |

## Fingerstyle Engine

Fingerstyle is NOT "play chord and arpeggiate." It's a dedicated engine:

```
P (Thumb)  → Bass note
  ↓
I (Index)  → String 3
  ↓
M (Middle) → String 2
  ↓
A (Ring)   → String 1
  ↓
(repeat)
```

With variable timing, bass accents, melody emphasis, and per-finger attack character.

**Preset Patterns:**
- Travis Picking (alternating bass + melody)
- Simple Arpeggio (P-I-M-A)
- Waltz (Oom-pah-pah)
- Bollywood Pick (bass emphasis)
- Worship Ambient (slow, spacious)
- Campfire Boom-Chick

## Chord Transitions

Going from G → Em:
- Some strings **continue ringing** (shared notes)
- Some **stop** (damped strings)
- Some are **restruck** (different pitch)

The Virtual Guitarist decides. That's what makes the transition sound alive.

## Effects Chain

| Preset | Reverb | Room | Body EQ | Brightness | Compression |
|---|---|---|---|---|---|
| **Acoustic** | 15% | Medium | +3.5dB | 8kHz | -18dB / 3:1 |
| **Intimate** | 5% | Small | +5dB | 6kHz | -14dB / 4:1 |
| **Concert** | 30% | Large | +2.5dB | 10kHz | -20dB / 2.5:1 |
| **Warm** | 18% | Medium | +4.5dB | 4.5kHz | -16dB / 3.5:1 |
| **Studio** | 10% | Small | +2dB | 12kHz | -15dB / 4:1 |
| **Campfire** | 20% | Small | +4dB | 6.5kHz | -16dB / 3:1 |

## Test Coverage

```
✅ 38 tests passing
   - 12 Humanizer tests (timing, velocity, pitch, ordering)
   - 12 Virtual Guitarist tests (personalities, decisions, transitions)
   - 8 Fingerstyle tests (patterns, timing, velocity)
   - 6 Core tests (chord data, gesture profiles, LRC parsing)
```

## Budget Roadmap

### $0 Budget (Now)
- [x] Virtual Guitarist architecture
- [x] Humanizer engine
- [x] 7 style personalities
- [x] 6 fingerstyle patterns
- [x] 6 effects presets
- [ ] Karplus-Strong synthesis (already working)

### Phase 2 — Sample Integration
- [ ] Use legally licensed sample library
- [ ] Connect Humanizer output to sample playback
- [ ] Multiple attack variants per chord

### Phase 3 — AirChord Guitar Library
- [ ] Record professional guitarist
- [ ] 5-10 downstrokes per chord
- [ ] 5-10 upstrokes per chord
- [ ] Muted, slides, fret noise
- [ ] Multiple mic positions

### Phase 4 — Advanced Features
- [ ] Adaptive Chord Preview (animate next gesture)
- [ ] Performance Themes (Campfire/Studio/Concert visual modes)
- [ ] Online song sync
- [ ] User-created songs via JSON format
