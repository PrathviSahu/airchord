# AirChord: Complete AI Guitar Performance Studio & Music Ecosystem

**Sing Freely. We'll Play the Guitar.**

AirChord is an AI-powered virtual guitar performance ecosystem that transforms camera hand gestures, vocal rhythm humming, and real-time audio synthesis into a complete studio experience. Designed for singers, performers, and learners, AirChord allows anyone to play realistic guitar accompaniment without physically owning an instrument.

---

## 🚀 Key Modules & Architecture

### 1. 🌟 Interactive 3D Scrolling Guitar Landing Page
- Dynamic 3D Acoustic Guitar model rotating on scroll.
- Cosmic star lightfall particle streaks and hero section.
- Interactive gesture preview cards.

### 2. 🎛️ Session Launcher Hub (`SessionLauncher.tsx`)
Entry hub providing 6 dedicated session workflows:
- 🎸 **Studio Performance**: Perform complete songs with live teleprompter, 3D animated guitar, and non-stop timeline.
- 🎯 **Practice Mode**: Step-by-step chord trainer with pause-on-error logic (`Expected: C | Detected: Am — Try Again`) and performance scorecards.
- 🎼 **Free Play**: Unconstrained jam mode with custom gesture mappings and voice strum builder.
- 🪕 **Fingerstyle Experience**: P-I-M-A picking lessons and camera-free ambient relax lounge across 6 themes.
- 📚 **Song Library**: Extensible catalog across collections (*Hindi*, *English*, *Bollywood*, *Pop*, *Rock*, *Indie*, *Campfire*, *Worship*, *Beginner*, *Advanced*).
- ⚙️ **Gesture Profiles**: Assign any chord to 0–5 finger gestures.

### 3. 🎸 Studio Performance Mode (`StudioPerformance.tsx`)
Asymmetrical 3-column performance workspace:
- **Left Column**: Webcam feed + MediaPipe hand tracking skeleton + active gesture badge (`✋ = G`) + confidence score (`98%`).
- **Center Column**: Interactive 3D Three.js guitar with string vibration physics & fret highlights.
- **Right Column**:
  - *Logic Pro Teleprompter*: Stacked lines (`Current`, `Next`, `Upcoming`).
  - *Chord Cascade*: Stacked upcoming chord progression (`Current: G` → `Next: Em` → `After: C`).
- **Bottom Bar**: Song section indicator (`Verse/Chorus`), BPM, and live beat strum indicator.
- **Non-stop Engine**: Performance timeline never pauses during studio performance.

### 4. 🎯 Practice Mode (`PracticeMode.tsx`)
- **Pause-on-Error Engine**: If the song expects `C` but you play `Am`, the timeline pauses immediately with a diagnostic alert (`Expected: C | Detected: Am — Try Again`). Advances only when corrected!
- **Performance Scorecard**:
  - Chord Accuracy % (e.g. 94%)
  - Timing Score % (e.g. 91%)
  - Wrong Chords Count
  - Average Detection Latency (31 ms)

### 5. 🪕 Fingerstyle Experience (`FingerstyleLounge.tsx`)
- 🎓 **Learn Fingerstyle**: Guided `P-I-M-A` (Thumb, Index, Middle, Ring) finger picking lessons and string targeting.
- 🎧 **Relax & Listen (Ambient Lounge)**: **No camera required!** Sit back and enjoy continuous acoustic fingerstyle guitar playback across 6 ambient themes (*Night Lounge*, *Rainy Evening*, *Campfire*, *Forest Whispers*, *Ocean Waves*, *Acoustic Sunset*).

### 6. 🎙️ Voice AI Strumming Pattern Detector (`strumVoiceDetector.ts`)
- Web Audio API Time-Domain RMS onset detection engine.
- Hum or speak rhythm patterns (e.g., *"Down Down Up Up"* or *"Dha Dhin Dhin Dha"*) to generate live strumming patterns on screen.
- Integrated Live Microphone Level VU Meter.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, Vite
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Vision ML**: Google MediaPipe tasks-vision (`HandLandmarker`)
- **Audio Engine**: Web Audio API (Multi-timbre Synthesis: Steel, Nylon, Electric, 12-String)
- **Animations**: Framer Motion

---

## ⚡ Quick Start

```bash
# Navigate to web application directory
cd website

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:5175/
```

---

## 📁 Repository Structure

```
guitar project/
├── README.md                 ← Main System Overview & Documentation
├── .gitignore                ← Project Git Ignore Rules
├── docs/                     ← Architecture & SRS Specifications
│   ├── Architecture.md       # Full System Architecture
│   ├── PRD.md                # Product Requirements
│   ├── PracticeMode.md       # Practice Mode Specification
│   ├── UserFlow.md           # User Workflow Diagrams
│   └── ...
│
├── website/                  ← Production Application
│   ├── src/
│   │   ├── components/       # StudioPerformance, PracticeMode, FingerstyleLounge, SessionLauncher, Guitar3D
│   │   ├── screens/          # LandingPage (3D Scrolling Guitar), HomeDashboard
│   │   └── utils/            # songLibrary, gestureProfiles, guitarSound, strumVoiceDetector
│   ├── index.html
│   └── vite.config.ts
```

---

## 🤝 License

Created for AirChord AI Performance Studio. All rights reserved.
