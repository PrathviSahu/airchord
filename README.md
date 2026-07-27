# AirChord

**Sing Freely. We'll Play the Guitar.**

AirChord is a commercial-grade, AI-powered virtual guitar companion that allows singers to perform songs without physically playing a guitar. Using device camera hand-tracking, each gesture is mapped to a guitar chord — the app plays realistic guitar sounds with selected strumming patterns so users can sing with live guitar accompaniment.

---

## 🎯 Current Status

**Phase:** Technical Prototype ✅

The core interaction loop is working:
- ✅ Camera hand tracking (MediaPipe)
- ✅ Gesture recognition (finger counting)
- ✅ Chord mapping (6 chords via gestures)
- ✅ Guitar audio synthesis (Karplus-Strong)
- ✅ Gesture profiles (Classic, Worship, Bollywood, Blues)
- ✅ Calibration screen
- ✅ Debug panel with latency measurement

**Next:** Figma UI design → Production MVP

---

## 🚀 Quick Start

```bash
# Navigate to prototype
cd prototype

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:5174
```

### Controls

| Action | How |
|--------|-----|
| Play chord | Show hand gesture to camera |
| Change chord | Change finger count |
| Switch profile | Click profile buttons (bottom left) |
| Export latency log | Press `L` |

### Gesture Map (Classic Profile)

| Fingers | Gesture | Chord |
|---------|---------|-------|
| 0 (fist) | ✊ | Em |
| 1 | ☝️ | Am |
| 2 | ✌️ | G |
| 3 | 🤟 | C |
| 4 | 🖐️ | D |
| 5 (palm) | ✋ | F |

---

## 📁 Project Structure

```
guitar project/
├── README.md                 ← You are here
├── docs/                     ← 20 documentation files (8,340+ lines)
│   ├── PRD.md
│   ├── SRS.md
│   ├── Architecture.md
│   ├── FeatureList.md
│   ├── GestureRecognition.md
│   ├── AudioEngine.md
│   └── ... (14 more)
│
├── prototype/                ← Working prototype
│   ├── src/
│   │   ├── camera/           # Camera feed + MediaPipe
│   │   ├── gesture/          # Gesture engine + profiles
│   │   ├── audio/            # Guitar synthesis
│   │   ├── ui/               # UI components
│   │   └── utils/            # Latency profiler
│   ├── index.html
│   └── package.json
│
├── assets/                   ← (future)
├── backend/                  ← (future)
├── config/                   ← (future)
├── deployment/               ← (future)
├── scripts/                  ← (future)
├── src/                      ← (future production code)
└── tests/                    ← (future)
```

---

## 🛠️ Tech Stack

### Prototype (Current)

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript 5, Vite 5 |
| Computer Vision | MediaPipe Tasks Vision (@mediapipe/tasks-vision) |
| Audio | Web Audio API (Karplus-Strong synthesis) |
| State | React hooks (useState, useRef, useCallback) |

### Production (Planned)

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript 5, Vite 5, Tailwind CSS |
| 3D Rendering | Three.js / React Three Fiber (landing page only) |
| Computer Vision | MediaPipe Hands |
| Audio | Tone.js, Web Audio API |
| Backend | Node.js, Firebase Cloud Functions |
| Database | Firestore + IndexedDB (offline) |
| Auth | Firebase Authentication |
| Deployment | Firebase Hosting, Capacitor (mobile) |

---

## 🏗️ Architecture

### Core Engines

```
AirChord Core Engine
├── Gesture Engine          # Hand detection + gesture classification
├── Performance Engine      # Orchestrates gesture → chord → audio
├── Audio Engine            # Synthesis, mixing, effects
├── Recording Engine        # Voice/video capture, .air projects
├── Song Engine             # Chord timeline, lyrics sync
├── AI Engine               # Practice coach, adaptive performance
└── Sync Engine             # Cross-device sync
```

### Data Flow

```
Camera → MediaPipe → Gesture Engine → Chord Mapping
    ↓
Audio Engine → Guitar Synthesis → Speaker
    ↓
UI Update → Chord Display + Debug Panel
```

---

## 📊 Documentation

| # | Document | Lines | Description |
|---|----------|-------|-------------|
| 1 | PRD.md | 242 | Product vision, goals, USP |
| 2 | SRS.md | 479 | Software requirements |
| 3 | FeatureList.md | 308 | 119 features across 6 categories |
| 4 | UserFlow.md | 582 | All screen flows |
| 5 | UIUX.md | 206 | Design system, 3D guidelines |
| 6 | Architecture.md | 531 | Core engine design |
| 7 | Frontend.md | 325 | React component architecture |
| 8 | Backend.md | 460 | Firebase services |
| 9 | Database.md | 349 | Firestore schema |
| 10 | API.md | 319 | REST endpoints |
| 11 | GestureRecognition.md | 473 | MediaPipe pipeline |
| 12 | AudioEngine.md | 479 | Karplus-Strong synthesis |
| 13 | RecordingStudio.md | 393 | .air project format |
| 14 | PracticeMode.md | 416 | AI practice coach |
| 15 | AIFeatures.md | 435 | Dynamic Band, adaptive tempo |
| 16 | Security.md | 439 | Auth, encryption, privacy |
| 17 | Testing.md | 458 | Test strategy |
| 18 | Deployment.md | 420 | CI/CD, Play Store |
| 19 | Roadmap.md | 421 | 10-phase development plan |
| 20 | FolderStructure.md | 605 | Complete file structure |

**Total: 8,340+ lines of documentation**

---

## 🎵 Signature Features

### Dynamic Band
The accompaniment responds to your voice intensity:
- Sing softly → gentle strumming
- Sing loudly → band builds
- Pause → guitar sustains

### Gesture Profiles
Switch between chord sets instantly:
- **Classic**: Em, Am, G, C, D, F
- **Worship**: Am, C, G, Em, F, D
- **Bollywood**: Am, C, G, F, Em, D
- **Blues**: E, A, B7, Am, D, G

### Song Timeline
Beat-based chord progression display:
```
♪─────────────────────────────── ♪
C ────── G ────── Am ────── F ─────
         ▲
    Current Beat
```

---

## 📈 Roadmap

| Phase | What | Status |
|-------|------|--------|
| Phase 0 | Documentation | ✅ Complete |
| Phase A | Technical Prototype | ✅ Complete |
| Phase B | Figma UI Design | ⏳ Next |
| Phase C | Production MVP | Planned |
| Phase D | Beta + Launch | Planned |

---

## 🎯 Mission Statement

> **"AirChord should feel less like operating software and more like playing with a real guitarist."**

Every decision is filtered through: **Does this make the experience feel more like performing with a musician?**

---

## License

Proprietary — All Rights Reserved © AirChord
