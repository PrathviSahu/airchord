# Gesture Recognition Documentation

## 1. Overview

AirChord's gesture recognition system converts real-time hand movements into musical chord triggers. The system uses MediaPipe Hands for landmark detection, a custom gesture classifier for chord mapping, and a calibration layer for personalization. The entire pipeline runs client-side with a target latency of <50ms from camera frame to chord event.

---

## 2. MediaPipe Pipeline

### 2.1 Initialization

```
Camera Stream (30fps, 1280×720)
    ↓
MediaPipe Hands (WASM, CDN-loaded)
    ↓
21 Landmarks × 2 Hands (x, y, z normalized)
    ↓
Handedness Classification (Left/Right)
    ↓
Gesture Event Bus
```

### 2.2 Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `maxNumHands` | 1 | Single-hand chord gestures reduce ambiguity |
| `modelComplexity` | 1 (Full) | Balance between accuracy and speed |
| `minDetectionConfidence` | 0.7 | High threshold to reduce false positives |
| `minTrackingConfidence` | 0.5 | Allow smooth tracking between frames |
| `inputResolution` | 1280×720 | HD for accurate landmark detection |
| `processingResolution` | 640×480 | Downscaled for performance |

### 2.3 MediaPipe Landmark Model

MediaPipe Hands outputs 21 landmarks per hand:

```
0:  WRIST
1:  THUMB_CMC
2:  THUMB_MCP
3:  THUMB_IP
4:  THUMB_TIP
5:  INDEX_FINGER_MCP
6:  INDEX_FINGER_PIP
7:  INDEX_FINGER_DIP
8:  INDEX_FINGER_TIP
9:  MIDDLE_FINGER_MCP
10: MIDDLE_FINGER_PIP
11: MIDDLE_FINGER_DIP
12: MIDDLE_FINGER_TIP
13: RING_FINGER_MCP
14: RING_FINGER_PIP
15: RING_FINGER_DIP
16: RING_FINGER_TIP
17: PINKY_MCP
18: PINKY_PIP
19: PINKY_DIP
20: PINKY_TIP
```

Each landmark contains normalized `[x, y, z]` coordinates where:
- `x`: 0.0 (left) to 1.0 (right) of image
- `y`: 0.0 (top) to 1.0 (bottom) of image
- `z`: Depth relative to wrist (negative = closer to camera)

---

## 3. Camera Pipeline

### 3.1 Stream Management

```typescript
interface CameraConfig {
  width: 1280;
  height: 720;
  facingMode: 'user';        // Front camera
  frameRate: { ideal: 30 };  // Target 30fps
}
```

### 3.2 Camera Lifecycle

```
Request Permission → Open Stream → Attach to <video> Element
    ↓
Start MediaPipe Processing Loop
    ↓
Process Each Frame (onFrame callback)
    ↓
Cleanup on Unmount (stop stream, release camera)
```

### 3.3 Error Handling

| Error | Handling |
|-------|----------|
| Camera permission denied | Show help modal with manual instructions |
| Camera in use by another app | Show "Camera busy" message with retry |
| Low light detected | Show brightness adjustment tutorial |
| Camera not found | Fallback to rear camera option |
| Stream中断 | Auto-reconnect with 2s delay |

### 3.4 Performance Optimization

- **Frame Skipping**: Process every 2nd frame if <24fps detected
- **Resolution Scaling**: Auto-downscale on low-end devices
- **Web Worker**: MediaPipe processing off main thread
- **RequestAnimationFrame**: Sync with display refresh rate

---

## 4. Finger Detection

### 4.1 Finger State Algorithm

Each finger is classified as **extended** or **curled** based on landmark positions:

```typescript
function isFingerExtended(landmarks: Landmark[], finger: FingerType): boolean {
  const tips = [4, 8, 12, 16, 20];  // Thumb, Index, Middle, Ring, Pinky
  const pips = [3, 6, 10, 14, 18];  // Second-to-last joints

  if (finger === 'thumb') {
    // Thumb uses x-axis comparison (lateral movement)
    return landmarks[4].x < landmarks[3].x; // For right hand
  }

  // Other fingers use y-axis (vertical extension)
  return landmarks[tips[finger]].y < landmarks[pips[finger]].y;
}
```

### 4.2 Finger Combinations → Chord Mapping

| Gesture | Thumb | Index | Middle | Ring | Pinky | Classic | Worship | Bollywood |
|---------|-------|-------|--------|------|-------|---------|---------|-----------|
| Open Palm | ✓ | ✓ | ✓ | ✓ | ✓ | C | G | A |
| Fist | ✗ | ✗ | ✗ | ✗ | ✗ | G | D | F#m |
| Peace Sign | ✗ | ✓ | ✓ | ✗ | ✗ | D | Em | D |
| Point | ✗ | ✓ | ✗ | ✗ | ✗ | A | C | E |
| Shaka | ✓ | ✗ | ✗ | ✗ | ✓ | E | Am | Bm |
| OK Sign | ✓ | ✓ | ✗ | ✗ | ✗ | Am | F | C#m |
| Three Fingers | ✗ | ✓ | ✓ | ✓ | ✗ | Em | Bm | G |
| Chin Pinch | ✓ | ✓ | ✓ | ✗ | ✗ | Dm | D | F#m |
| Hook | ✗ | ✓ | ✗ | ✗ | ✓ | C7 | G7 | A7 |
| Spider | ✓ | ✓ | ✗ | ✓ | ✗ | G7 | C7 | E7 |
| Cross Fingers | ✗ | ✓ | ✓ | ✗ | ✓ | F | C | Bm |
| Claw | ✓ | ✗ | ✓ | ✗ | ✓ | B7 | E7 | D7 |

### 4.3 Gesture Profiles

Users can switch between pre-defined chord sets instantly. Each profile maps the same hand gestures to different chords, optimized for different music styles.

```typescript
interface GestureProfile {
  name: string;
  description: string;
  genre: string[];
  mappings: Record<string, string>; // gesture → chord
  isCustom: boolean;
}

// Built-in profiles
const PROFILES: GestureProfile[] = [
  {
    name: 'Classic',
    description: 'Standard guitar chord mapping',
    genre: ['Pop', 'Rock', 'Folk'],
    mappings: {
      open_palm: 'C', fist: 'G', peace: 'D', point: 'A',
      shaka: 'E', ok_sign: 'Am', three_fingers: 'Em',
      chin_pinch: 'Dm', hook: 'C7', spider: 'G7',
      cross: 'F', claw: 'B7'
    }
  },
  {
    name: 'Worship',
    description: 'Common worship song chords',
    genre: ['Worship', 'CCM', 'Gospel'],
    mappings: {
      open_palm: 'G', fist: 'D', peace: 'Em', point: 'C',
      shaka: 'Am', ok_sign: 'F', three_fingers: 'Bm',
      chin_pinch: 'D', hook: 'G7', spider: 'C7',
      cross: 'C', claw: 'E7'
    }
  },
  {
    name: 'Bollywood',
    description: 'Popular Bollywood chord progressions',
    genre: ['Bollywood', 'Indian Pop', 'Hindi'],
    mappings: {
      open_palm: 'A', fist: 'F#m', peace: 'D', point: 'E',
      shaka: 'Bm', ok_sign: 'C#m', three_fingers: 'G',
      chin_pinch: 'F#m', hook: 'A7', spider: 'E7',
      cross: 'Bm', claw: 'D7'
    }
  },
  {
    name: 'Custom',
    description: 'User-defined chord mapping',
    genre: [],
    mappings: {},
    isCustom: true
  }
];
```

#### Profile Switching

```
Settings → Gesture Profiles → Select Profile
    ↓
Instant remap: same gestures → different chords
    ↓
Visual update: chord diagrams update to show new shapes
```

### 4.3 Gesture Confidence Scoring

```typescript
interface GestureResult {
  chord: string;
  confidence: number;    // 0.0 - 1.0
  landmarks: Landmark[];
  timestamp: number;
  handedness: 'left' | 'right';
}

// Confidence calculation
confidence = (
  landmark_accuracy * 0.4 +      // How well landmarks match template
  finger_state_match * 0.3 +     // Correct finger extensions
  temporal_stability * 0.2 +     // Consistency over last N frames
  gesture_uniqueness * 0.1       // How different from other gestures
);
```

---

## 5. Gesture Mapping

### 5.1 Default Chord Map (12 Chords)

| Gesture Name | Gesture Type | Chord | Key |
|--------------|-------------|-------|-----|
| open_palm | Open Hand | C | Major |
| fist | Closed Fist | G | Major |
| peace | Two Fingers | D | Major |
| point | One Finger | A | Major |
| shaka | Thumb+Pinky | E | Major |
| ok_sign | OK Circle | Am | Minor |
| three_fingers | Three Fingers | Em | Minor |
| chin_pinch | Pinch | Dm | Minor |
| hook | Hook Shape | C7 | Seventh |
| spider | Spider Hand | G7 | Seventh |
| cross | Crossed Fingers | F | Major |
| claw | Claw Shape | B7 | Seventh |

### 5.2 Extended Chord Set (24 Chords)

For advanced users, additional gestures using wrist rotation and finger combinations:

| Gesture | Modifier | Chord |
|---------|----------|-------|
| open_palm + wrist_clockwise | Rotation | C/G (C with G bass) |
| fist + wrist_anticlockwise | Rotation | G/B |
| peace + index_bend | Micro-gesture | D/F# |
| All others | Combinations | Fm, Bm, Bbm, Eb, Ab, Db, Gb, Cm, Fm7, Bm7, Em7, Am7 |

### 5.3 Custom Gesture Mapping

Users can reassign any gesture to any chord:

```
Settings → Gesture Mapping → Select Gesture → Select Chord → Save
```

Custom mappings stored in:
- **Local**: IndexedDB (offline-first)
- **Cloud**: Firestore (sync across devices)

---

## 6. Latency Optimization

### 6.1 Latency Budget

| Stage | Target | Max | Optimization |
|-------|--------|-----|--------------|
| Camera Frame Capture | 16ms | 25ms | RequestAnimationFrame sync |
| MediaPipe Processing | 16ms | 25ms | WASM, GPU acceleration |
| Landmark Extraction | 1ms | 2ms | Direct array access |
| Gesture Classification | 2ms | 5ms | Pre-computed lookup tables |
| Chord Trigger | 1ms | 2ms | Event bus, no async |
| Audio Synthesis Start | 5ms | 10ms | Pre-loaded buffers |
| **Total** | **41ms** | **69ms** | **Target <50ms** |

### 6.2 Optimization Techniques

1. **Web Worker Processing**: MediaPipe runs off main thread
2. **Lookup Tables**: Gesture→Chord mapping pre-computed
3. **Frame Skipping**: Process every 2nd frame on low-end devices
4. **Prediction**: Anticipate next gesture based on trajectory
5. **Pre-loading**: Audio buffers loaded before gesture trigger
6. **Batch Processing**: Process landmarks in bulk, not individually

### 6.3 Latency Monitoring

```typescript
interface LatencyMetrics {
  cameraToMediaPipe: number;
  mediaPipeToGesture: number;
  gestureToAudio: number;
  totalEndToEnd: number;
  timestamp: number;
}

// Alert if P90 latency exceeds 50ms
monitor.onLatencyAlert((metrics) => {
  if (metrics.totalEndToEnd > 50) {
    analytics.track('latency_warning', metrics);
    downgradeQuality();  // Reduce processing resolution
  }
});
```

---

## 7. False Positive Reduction

### 7.1 Multi-Frame Validation

```
Frame N: Gesture detected (confidence: 0.85)
Frame N+1: Same gesture (confidence: 0.88)  → Count: 2
Frame N+2: Same gesture (confidence: 0.91)  → Count: 3
Frame N+3: ✅ CONFIRMED → Trigger chord
```

**Minimum 3 consecutive frames** required before chord trigger.

### 7.2 Gesture Uniqueness Check

```typescript
function isGestureUnique(newGesture: string, recentGestures: string[]): boolean {
  // Reject if same gesture as last 2 triggers
  if (recentGestures.slice(-2).every(g => g === newGesture)) {
    return false;
  }
  return true;
}
```

### 7.3 Confidence Thresholds

| Level | Threshold | Action |
|-------|-----------|--------|
| High | >0.85 | Trigger chord immediately (after 3 frames) |
| Medium | 0.65-0.85 | Show "Possible Chord" with alternatives |
| Low | <0.65 | Ignore — do not trigger |

### 7.4 Debouncing

```typescript
const DEBOUNCE_MS = 150; // Minimum time between same chord triggers

function shouldTrigger(chord: string, lastTrigger: number): boolean {
  return Date.now() - lastTrigger > DEBOUNCE_MS;
}
```

---

## 8. Gesture Customization

### 8.1 Calibration Mode

```
Settings → Gesture Calibration → Start Calibration
```

**Calibration Flow:**

1. Select chord to calibrate (e.g., "C Major")
2. Show recommended hand position (3D model)
3. User performs gesture 5 times
4. System captures landmarks for each attempt
5. Calculate average landmark positions
6. Store as custom template
7. Test gesture → Confirm accuracy

### 8.2 Sensitivity Adjustment

| Setting | Range | Effect |
|---------|-------|--------|
| Detection Threshold | 0.5-0.95 | Minimum confidence to recognize |
| Debounce Time | 50-300ms | Time between repeated triggers |
| Smoothing Factor | 0.1-0.9 | Landmark interpolation strength |
| Handedness | Auto/Left/Right | Which hand to track |

### 8.3 Handedness Adaptation

- **Right Hand**: Default chord mapping
- **Left Hand**: Mirror-flipped chord diagrams
- **Auto**: Detect dominant hand from first 10 frames

---

## 9. Gesture Training Data

### 9.1 Built-in Gesture Library

AirChord ships with pre-trained gesture models for:

- 12 basic chord gestures (MVP)
- 24 advanced chord gestures (Post-MVP)
- 6 strumming motion gestures (future)

### 9.2 User-Generated Data

- Calibration data stored locally (IndexedDB)
- Optional anonymous contribution to improve model
- Privacy-first: no facial data, only hand landmarks

### 9.3 Model Updates

- Gesture model loaded from CDN on app start
- Cached offline via Service Worker
- Updated monthly with improved accuracy

---

## 10. Accessibility

| Feature | Implementation |
|---------|----------------|
| Screen Reader | Announces detected chord via ARIA live region |
| Keyboard Alternative | On-screen chord buttons as fallback |
| Reduced Motion | Simplified hand overlay (no animations) |
| High Contrast | Landmarks rendered with 3:1+ contrast ratio |
| Voice Commands | Future: "Play C chord" via Speech API |

---

## 11. Device Compatibility

| Device Class | Performance | Notes |
|--------------|-------------|-------|
| iPhone 12+ | Excellent | Neural Engine acceleration |
| iPhone X-11 | Good | CPU-based processing |
| Pixel 6+ | Excellent | GPU acceleration |
| Samsung S21+ | Good | GPU acceleration |
| Mid-range Android | Acceptable | May reduce to 24fps |
| Desktop Chrome | Excellent | WebGL acceleration |
| Desktop Safari | Good | Limited WebGL |
| iPad Pro | Excellent | Large screen, good camera |
| Budget phones (<$200) | Warning | May not meet latency targets |

---

## 12. Future Enhancements

| Phase | Feature | Description |
|-------|---------|-------------|
| Phase 4 | Two-hand chords | Complex chords using both hands |
| Phase 5 | Strum detection | Detect strumming motion direction |
| Phase 6 | Finger picking | Individual string plucking |
| Phase 7 | Expression gestures | Vibrato, bend, slide via motion |
| Phase 8 | AI gesture learning | Custom gesture creation via AI |
| Phase 9 | Watch integration | Apple Watch / WearOS gesture input |
