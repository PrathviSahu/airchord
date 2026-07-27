# Practice Mode & Educational Engine Specification

## Overview

Practice Mode in AirChord provides step-by-step interactive song learning. Unlike Studio Performance Mode (which runs non-stop), Practice Mode enforces real-time timing accuracy and gesture precision by pausing progression whenever an error occurs.

---

## 🎯 Core Features

### 1. Pause-on-Error Mechanics
When learning a song (e.g. *Perfect* by Ed Sheeran or *Tum Hi Ho* by Arijit Singh):
- Target Chord: **`C Major`**
- User Played Gesture: **`Am`**
- **Action**: The timeline immediately pauses.
- **Diagnostic Alert Banner**:
  ```
  Expected: C  |  Detected: Am
  Try again! Change hand gesture to play C to advance.
  ```
- **Resume Condition**: Progression continues only after the correct gesture for `C Major` is detected.

---

### 2. End-of-Session Performance Scorecard Modal
Upon completing all steps of a song, Practice Mode generates a comprehensive scorecard:

| Metric | Target | Description |
|--------|--------|-------------|
| **Chord Accuracy** | 94% | Percentage of correct first-attempt gesture triggers |
| **Timing Score** | 91% | Rhythm alignment accuracy relative to target beat timing |
| **Wrong Chords Count** | 3 | Total number of incorrect chord triggers |
| **Avg Detection Latency** | 31 ms | MediaPipe ML hand tracking inferencing speed |

---

## 💻 Technical Implementation (`PracticeMode.tsx`)

```tsx
// Hand tracking callback inside PracticeMode.tsx
useHandTracking(videoRef, canvasRef, isCameraActive, (fingerCount) => {
  const chord = mapping[fingerCount] || 'G'
  const expectedChord = currentTarget.chord

  if (chord === expectedChord) {
    // Correct chord! Clear error & advance step
    setErrorDiagnostic(null)
    setCurrentStep(prev => prev + 1)
  } else {
    // Error! Pause timeline and show diagnostic overlay
    setErrorDiagnostic({ expected: expectedChord, detected: chord })
  }
})
```
