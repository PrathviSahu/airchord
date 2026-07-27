# User Flow Documentation

## 1. Overview

AirChord's user journey is designed for zero learning curve. Users should play their first chord within 30 seconds of opening the app. Every flow prioritizes simplicity, visual feedback, and accessibility.

---

## 2. Splash Screen

### 2.1 Flow

```
App Launch → Splash Screen (2 seconds)
    ↓
Animated AirChord logo with guitar chord sound
    ↓
Check auth status:
    - Not logged in → Onboarding / Auth
    - Logged in → Home Dashboard
```

### 2.2 Elements

| Element | Description |
|---------|-------------|
| Logo | AirChord logo centered |
| Tagline | "Turn Your Hand Into a Live Guitar" |
| Loading indicator | Subtle pulsing animation |
| Version | Small text at bottom |

---

## 3. Onboarding

### 3.1 Flow

```
Welcome Screen → "Get Started" Button
    ↓
Screen 1: "Play guitar with your hands"
    - Animated hand gesture → chord sound
    - "Next" button
    ↓
Screen 2: "No guitar needed"
    - Camera preview with hand overlay
    - "Next" button
    ↓
Screen 3: "Sing and perform"
    - Microphone icon + guitar icon
    - "Get Started" button
    ↓
Permission Requests:
    1. Camera permission → Allow / Deny
    2. Microphone permission → Allow / Deny
    ↓
Calibration Tutorial (optional):
    - "Let's calibrate your hand"
    - Show hand positioning guide
    - "Skip" or "Calibrate"
    ↓
Home Dashboard
```

### 3.2 Permission Handling

| Scenario | Response |
|----------|----------|
| Both granted | Proceed to Home |
| Camera denied | Show help modal, allow continue with buttons only |
| Mic denied | Proceed, recording unavailable |
| Both denied | Show limited mode notice |

---

## 4. Home Dashboard

### 4.1 Layout

```
┌─────────────────────────────────────┐
│  AirChord          ⚙️ Settings      │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────┐  ┌─────────┐         │
│  │ 🎸      │  │ 🎵      │         │
│  │ Free    │  │ Practice│         │
│  │ Play    │  │ Mode    │         │
│  └─────────┘  └─────────┘         │
│                                     │
│  ┌─────────┐  ┌─────────┐         │
│  │ 🎤      │  │ 📚      │         │
│  │ Record  │  │ Song    │         │
│  │ Studio  │  │ Library │         │
│  └─────────┘  └─────────┘         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎯 Daily Challenge          │   │
│  │ Play C→G→Am→F at 100 BPM   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Recent: Yesterday's Session 82%   │
│                                     │
├─────────────────────────────────────┤
│  🏠    🎸    🎤    📚    👤       │
│  Home  Play  Rec   Lib   Me       │
└─────────────────────────────────────┘
```

### 4.2 Interactions

| Element | Action |
|---------|--------|
| Free Play | Navigate to Free Play mode |
| Practice Mode | Navigate to Practice selection |
| Record Studio | Navigate to Recording screen |
| Song Library | Navigate to Song Library |
| Settings | Navigate to Settings |
| Daily Challenge | Start daily practice challenge |
| Recent Session | Resume/review last session |
| Bottom Nav | Switch between main sections |

---

## 5. Free Play Mode

### 5.1 Flow

```
Home → Free Play
    ↓
Camera activates → Hand overlay appears
    ↓
Main Screen:
    - Camera view (top 50%)
    - Song Timeline (if song loaded) OR Chord Display (free mode)
    - Strum pattern selector
    - Tempo slider
    - Capo selector
    - Record button
    ↓
User forms gesture → Chord detected → Sound plays
    ↓
Song Timeline Mode (when song is loaded):
    ♪─────────────────────────────────── ♪
    C ────── G ────── Am ────── F ─────
             ▲
        Current Beat
    ↓
User can:
    - Change gesture → Different chord
    - Adjust tempo → Faster/slower strumming
    - Change pattern → Different rhythm
    - Add capo → Transpose key
    - Record → Start recording
    ↓
Back button → Return to Home
```

### 5.2 Controls

| Control | Location | Interaction |
|---------|----------|-------------|
| Camera view | Top 50% | Always visible |
| Song Timeline | Middle | Beat-based chord progression (scrolling) |
| Chord display | Center overlay | Shows current chord name (free mode) |
| Strum pattern | Bottom left | Dropdown/toggle selector |
| Tempo slider | Bottom center | Horizontal slider 40-240 |
| Capo selector | Bottom right | Number selector 0-12 |
| Dynamic Band toggle | Bottom left | Enable/disable adaptive accompaniment |
| Record button | Bottom right corner | Large circular button |
| Settings gear | Top right | Opens settings panel |
| Back arrow | Top left | Returns to Home |

### 5.3 Gesture Feedback

| State | Visual | Audio |
|-------|--------|-------|
| No hand detected | "Show your hand" prompt | Silence |
| Hand detected | Landmark overlay appears | Silence |
| Gesture recognized | Chord name pulses green | Chord plays |
| Low confidence | Chord name yellow | Chord plays softer |
| Chord change | Smooth transition animation | Chord changes |

---

## 6. Practice Mode

### 6.1 Flow

```
Home → Practice Mode
    ↓
Practice Selection Screen:
    ┌─────────────────────────────────┐
    │  Choose Practice Mode           │
    │                                 │
    │  🎯 Chord Trainer              │
    │  🔄 Transition Trainer         │
    │  🥁 Strumming Coach            │
    │  🎵 Song Practice              │
    │  ⚡ Challenge Mode              │
    └─────────────────────────────────┘
    ↓
[Chord Trainer Selected]
    ↓
Settings Screen:
    - Select chord(s) to practice
    - Set tempo (BPM)
    - Set duration
    - Enable/disable metronome
    - "Start Practice" button
    ↓
Practice Screen:
    - Camera view with hand overlay
    - Current chord to play (displayed)
    - Metronome visual
    - Score counter
    - Timer
    - Stop button
    ↓
Practice in progress:
    - Show target chord
    - User performs gesture
    - System scores accuracy
    - Real-time feedback ("Perfect!", "Try again")
    ↓
Session Complete:
    - Final score (0-100)
    - Accuracy breakdown
    - Timing analysis
    - Improvement suggestions
    - "Save" / "Retry" / "Home" buttons
```

### 6.2 Practice Modes

#### Chord Trainer

| Step | Action |
|------|--------|
| 1 | Select chord from grid |
| 2 | View hand position guide |
| 3 | Perform gesture repeatedly |
| 4 | Receive accuracy feedback |
| 5 | See progress over time |

#### Transition Trainer

| Step | Action |
|------|--------|
| 1 | Select chord pair (e.g., C → G) |
| 2 | Metronome plays at set tempo |
| 3 | Switch chords on beat |
| 4 | System measures transition time |
| 5 | Score displayed after 10 transitions |

#### Strumming Coach

| Step | Action |
|------|--------|
| 1 | Select strumming pattern |
| 2 | Watch pattern animation |
| 3 | Perform pattern with gestures |
| 4 | System scores rhythm accuracy |
| 5 | Gradually increase tempo |

---

## 7. Recording Studio

### 7.1 Flow

```
Home → Record Studio
    ↓
Recording Setup Screen:
    - Song selection (optional)
    - Instrument selection
    - Metronome on/off + tempo
    - Countdown timer (3-2-1)
    - "Start Recording" button
    ↓
Recording Screen:
    - Camera view (video recording)
    - Waveform display (audio levels)
    - Recording timer (00:00:00)
    - Current chord display
    - "Stop" button (large, red)
    ↓
Recording in progress:
    - Audio captured from mic + guitar
    - Video captured from camera
    - Waveform visualizes audio levels
    - Timer counts up
    ↓
Stop Recording:
    - "Processing..." indicator
    - Preview screen appears
    ↓
Preview Screen:
    - Playback controls (play/pause/seek)
    - Waveform timeline
    - Volume mixer (guitar vs voice)
    - "Retake" / "Save" buttons
    ↓
Export Screen:
    - Format selection: MP3 / WAV / MP4
    - Quality selection: Low / Medium / High
    - File size preview
    - "Export" button
    ↓
Export Complete:
    - "Saved to Library" confirmation
    - "Share" options:
      - Save to device
      - Instagram
      - TikTok
      - YouTube
      - WhatsApp
      - Copy link (future)
    - "Done" button → Home
```

### 7.2 Recording Controls

| Control | Location | Action |
|---------|----------|--------|
| Record button | Bottom center | Start/stop recording |
| Metronome toggle | Bottom left | Enable/disable click |
| Tempo control | Bottom center | Adjust BPM |
| Timer | Top center | Shows elapsed time |
| Waveform | Middle | Real-time audio levels |
| Chord display | Overlay | Shows current chord |

### 7.3 Export Options

| Format | Quality | Size (1 min) | Platform |
|--------|---------|--------------|----------|
| MP3 128 | Standard | ~1 MB | WhatsApp, Email |
| MP3 320 | High | ~2.5 MB | General sharing |
| WAV | Lossless | ~5 MB | DAW import |
| MP4 720p | Standard | ~15 MB | Instagram, TikTok |
| MP4 1080p | High | ~30 MB | YouTube |

---

## 8. Song Library

### 8.1 Flow

```
Home → Song Library
    ↓
Library Screen:
    - Search bar (top)
    - Filter chips (Genre, Difficulty, Key)
    - Song list/grid
    ↓
Song Card:
    - Song title
    - Artist name
    - Key + Tempo
    - Difficulty stars (1-5)
    - Genre tag
    ↓
Song Tap → Song Detail:
    - Chord progression timeline
    - Lyrics display (if available)
    - "Practice" button
    - "Play Along" button
    - "Add to Favorites" button
    ↓
Practice: Opens Practice Mode with this song
Play Along: Opens Free Play with chord guide
```

### 8.2 Search & Filter

| Filter | Options |
|--------|---------|
| Genre | Pop, Rock, Folk, Blues, Jazz, Country, Classical |
| Difficulty | Easy, Medium, Hard, Expert |
| Key | C, D, E, F, G, A, B (major/minor) |
| Sort | Name, Artist, Difficulty, Recently Added |

---

## 9. Settings

### 9.1 Flow

```
Home → Settings (gear icon)
    ↓
Settings Screen:
    ┌─────────────────────────────────┐
    │  ⚙️ Settings                   │
    │                                 │
    │  🎨 Appearance                 │
    │     Theme: Light / Dark / Auto  │
    │                                 │
    │  🤚 Gesture Profiles           │
    │     Active: Classic ▼           │
    │     [Classic] [Worship]         │
    │     [Bollywood] [Custom]        │
    │     ─────────────────           │
    │                                 │
    │  🎸 Audio                      │
    │     Quality: Low / Med / High   │
    │     Metronome: Click / Wood     │
    │     Volume: ──────●─────       │
    │                                 │
    │  🤚 Gestures                   │
    │     Handedness: Right / Left    │
    │     Sensitivity: ──────●─────  │
    │     Calibrate →               │
    │     Custom Mapping →          │
    │                                 │
    │  ♿ Accessibility              │
    │     High Contrast: Toggle      │
    │     Text Size: ──────●─────   │
    │     Reduced Motion: Toggle     │
    │                                 │
    │  📱 Device                     │
    │     Camera: Front / Rear       │
    │     Audio Output: Speaker/Head │
    │                                 │
    │  ☁️ Account                    │
    │     Profile →                 │
    │     Cloud Sync: Toggle        │
    │     Sign Out                  │
    │                                 │
    │  ℹ️ About                     │
    │     Version: 1.0.0            │
    │     Help →                   │
    │     Privacy Policy →          │
    │     Terms →                  │
    └─────────────────────────────────┘
```

---

## 10. Profile

### 10.1 Flow

```
Bottom Nav → Profile
    ↓
Profile Screen:
    - Avatar + Name
    - Member since date
    - Stats:
      - Total sessions
      - Total practice time
      - Average score
      - Current streak
    - Achievements grid
    - Practice history chart
    - Edit Profile button
    ↓
Edit Profile:
    - Name field
    - Avatar upload
    - Email (read-only)
    - Save button
```

---

## 11. Help

### 11.1 Flow

```
Settings → Help
    ↓
Help Screen:
    - Search bar
    - FAQ categories:
      - Getting Started
      - Gesture Recognition
      - Audio Issues
      - Recording
      - Account
      - Troubleshooting
    - Contact Support button
    - Video tutorials (links)
    ↓
FAQ Article:
    - Question
    - Answer with images
    - "Was this helpful?" feedback
    - Related articles
```

---

## 12. Error States

### 12.1 Camera Errors

| Error | Screen | Action |
|-------|--------|--------|
| Permission denied | Help modal | "Enable in Settings" button |
| Camera in use | Error screen | "Close other apps" message |
| No camera found | Error screen | "No camera detected" message |
| Low light | Warning banner | "Improve lighting" tip |

### 12.2 Audio Errors

| Error | Screen | Action |
|-------|--------|--------|
| Audio context blocked | Overlay | "Tap to enable audio" |
| Audio buffer error | Toast | "Audio restarted" message |
| Export failed | Dialog | "Try again" / "Contact support" |

### 12.3 Network Errors

| Error | Screen | Action |
|-------|--------|--------|
| No connection | Banner | "Offline mode" notice |
| Sync failed | Toast | "Will retry when online" |
| API error | Dialog | "Something went wrong" |

---

## 13. Subscription Flow (Future)

### 13.1 Flow

```
Premium Feature Click → Paywall Screen
    ↓
Paywall Screen:
    - Feature preview (locked)
    - Plan comparison:
      - Free: $0/month
      - Pro: $9.99/month
      - Studio: $19.99/month
    - "Subscribe" button
    ↓
Payment Screen:
    - Plan selection
    - Payment method (Google Play / Apple IAP)
    - "Confirm" button
    ↓
Processing → Success Screen
    ↓
Feature unlocked
```

---

## 14. Cloud Sync Flow (Future)

### 14.1 Flow

```
Settings → Cloud Sync: Enable
    ↓
Auth check:
    - Not logged in → Login prompt
    - Logged in → Sync setup
    ↓
Sync Setup:
    - Select data to sync:
      - ☑️ Recordings
      - ☑️ Practice history
      - ☑️ Settings
      - ☑️ Song library
    - "Start Sync" button
    ↓
Syncing:
    - Progress indicator
    - "Syncing recordings... 3/10"
    ↓
Sync Complete:
    - "All data synced" confirmation
    - Auto-sync toggle
```
