# AirChord 🎸

**Sing Freely. We'll Play the Guitar.**

AirChord is a commercial-grade, AI-powered virtual guitar companion web application that allows singers and musicians to perform songs using camera hand-tracking gestures. Each gesture maps dynamically to guitar chords — accompanied by realistic pluggable guitar audio engines, strumming pattern drivers, and interactive practice rooms.

---

## 🎯 Current Status

**Phase:** Interactive MVP / production prototype

### Key Achievements & Features Implemented:
- ✅ **Pluggable Audio Engine Architecture (`IGuitarEngine`)**:
  - 🎸 **Studio Acoustic**: Optional SoundFont note samples with a humanized Karplus–Strong physical-model fallback.
  - 🎻 **Nylon Classical**: Mellow physical-model nylon tone.
  - ⚡ **Physical Model**: Per-string body EQ, soundboard-style resonance, pick transients, stereo placement, reverb, and safe limiting.
- ✅ **Humanized Acoustic Dynamics**:
  - Sample-accurate strum gaps with small timing jitter (about `±1.2ms` around the string gap).
  - Small per-pluck pitch variation (about `±2.6 cents`) and attack/decay variation.
  - Dynamic string velocity, per-string brightness/pan, pick noise, chord-change scratch, and real percussive mute hits.
  - Separate recording mix bus for guitar + microphone capture.

> The optional remote SoundFont is not a licensed studio multi-sample library. For genuinely recorded guitar, add local/licensed samples per string, fret, velocity, and articulation. See [`docs/CodeReview.md`](docs/CodeReview.md).
- ✅ **Interactive Practice Room (`PracticeRoomScreen.tsx`)**:
  - Step-by-step chord trainer with gesture badges (`✊ 0 - Fist`, `☝️ 1 - Index`, `✌️ 2 - Peace`, etc.).
  - Real-time MediaPipe hand landmark matching with audio feedback & stage transition unlock.
- ✅ **Studio Performance Recording Engine (`LivePerformanceScreen.tsx`)**:
  - High-definition MediaRecorder canvas + video stream recorder.
  - Cross-browser format resolution (`video/webm`, `video/mp4`).
  - Instant Recording Preview modal with direct video download.
- ✅ **Expanded Song Library with Full Lyrics**:
  - 15+ full-length songs with multi-verse, chorus, bridge, and outro lyrics.
  - Includes iconic Hindi / Bollywood hits (*Channa Mereya*, *Tum Hi Ho*, *Kesariya*, *Kabira*, *Apna Bana Le*, *Agar Tum Saath Ho*, *Jeena Jeena*, *Kal Ho Naa Ho*, *Pani Da Rang*, *Tera Ban Jaunga*, *Pehli Nazar Mein*, *Tu Jaane Na*) and English Pop/Rock classics (*Perfect*, *Hotel California*, *Riptide*, *Shape of You*, *Count On Me*, *Zombie*).
- ✅ **Live Teleprompter & Strum Engine**:
  - Auto-advancing lyrics and BPM beat engine (`60` to `180` BPM).
  - Strum pattern visualizer with active beat indicators (`↓ ↓ ↑ ↑ ↓ ↑`, `↓ • ↓ ↑ ↓ ↑`).

---

## 🚀 Quick Start

```bash
# Navigate to website
cd website

# Install dependencies
npm install

# Start development server
npm run dev

# Typecheck + build for production
npm run typecheck
npm run build
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript 5, Vite 5, Tailwind CSS |
| Computer Vision | MediaPipe Tasks Vision (`@mediapipe/tasks-vision`) |
| Audio Architecture | Web Audio API, Pluggable Audio Engine (`IGuitarEngine`), Master Dynamics Compressor |
| Animation & Motion | Framer Motion |
| Recording Module | MediaStream API, MediaRecorder |

---

## 📁 Project Structure

```
guitar project/
├── README.md                 ← Main project documentation
├── website/                  ← AirChord Web Application
│   ├── src/
│   │   ├── screens/
│   │   │   ├── LandingPage.tsx           # 3D interactive landing screen
│   │   │   ├── SongSearchScreen.tsx       # Song catalog with collection filters
│   │   │   ├── SongSetupScreen.tsx        # BPM, Capo, Finger mapping & Engine selector
│   │   │   ├── PracticeRoomScreen.tsx     # Interactive step-by-step chord trainer
│   │   │   └── LivePerformanceScreen.tsx  # Live stage teleprompter & recording studio
│   │   ├── utils/
│   │   │   ├── guitarSound.ts             # Modular Audio Engine (Sampled, Nylon, Synth)
│   │   │   ├── songLibrary.ts             # Full song database & chord mappings
│   │   │   ├── gestureEngine.ts           # Hand landmark processing & finger counting
│   │   │   └── useHandTracking.ts         # MediaPipe camera hook
│   │   └── App.tsx                        # Screen routing & state management
│   ├── index.html
│   └── package.json
```

---

## 🎵 Gesture Mapping System

| Finger Count | Gesture | Standard Chord Assignment |
|--------------|---------|---------------------------|
| 0 (Fist)     | ✊       | Root 1 (e.g. `C` / `Em` / `Am`) |
| 1 Finger     | ☝️       | Chord 2 (e.g. `G` / `Am` / `D`) |
| 2 Fingers    | ✌️       | Chord 3 (e.g. `Am` / `D` / `F`) |
| 3 Fingers    | 🤟       | Chord 4 (e.g. `F` / `C` / `G`)  |
| 4 Fingers    | 🖐️       | Chord 5 (e.g. `Em` / `G`) |
| 5 (Palm)     | ✋       | Chord 6 (e.g. `Dm` / `B7`) |

*(All finger mappings are fully customizable in the Song Setup screen per song!)*
