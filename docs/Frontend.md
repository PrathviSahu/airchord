# Frontend Documentation

## Recommended Framework

**React 18 + TypeScript 5 + Vite 5**

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Framework | React 18 (Concurrent Features) | Ecosystem maturity, component reuse, React Three Fiber integration |
| Build Tool | Vite 5 | Sub-second HMR, ESBuild-powered, Rollup for production |
| Language | TypeScript 5 | Type safety for complex gesture/audio state |
| Styling | Tailwind CSS v3 + CSS Variables | Theme switching, responsive utilities, consistent spacing |
| State (Client) | Zustand | Lightweight, minimal boilerplate, good for gesture/audio state |
| State (Server) | React Query (TanStack Query) | Caching, background refetch, optimistic updates |
| Routing | React Router v6 | Nested routes, lazy loading, protected routes |
| Forms | React Hook Form + Zod | Performant, schema-validated inputs |
| Animations | Framer Motion + GSAP (optional) | Framer Motion for micro-interactions, GSAP only if timeline complexity demands |
| 3D | React Three Fiber + Drei | React bindings for Three.js, easy instrument rendering |
| Audio | Tone.js + Web Audio API | Professional-grade synthesis, built-in timing |

---

## Folder Structure

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Root layout + routes
├── index.css                   # Tailwind imports + CSS variables
├── vite-env.d.ts               # Vite type declarations
│
├── components/
│   ├── ui/                     # Atomic design primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Slider.tsx
│   │   ├── Toggle.tsx
│   │   ├── Badge.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Skeleton.tsx
│   │
│   ├── layout/
│   │   ├── Header.tsx          # Top nav with app title + settings
│   │   ├── Sidebar.tsx         # Collapsible navigation (desktop)
│   │   ├── BottomBar.tsx       # Mobile tab bar (Home/Practice/Record/Library)
│   │   └── PageTransition.tsx  # Route transition wrapper
│   │
│   ├── camera/
│   │   ├── CameraView.tsx      # WebRTC video feed + overlay
│   │   ├── HandOverlay.tsx     # MediaPipe landmarks visualization
│   │   ├── CalibrationGuide.tsx# Step-by-step calibration flow
│   │   └── GestureConfidence.tsx# Real-time confidence score display
│   │
│   ├── audio/
│   │   ├── MixerPanel.tsx      # Volume, pan, instrument selection
│   │   ├── StrumPatternCtrl.tsx# Pattern grid visual + timing control
│   │   ├── InstrumentSelector.tsx# Guitar/Piano/Bass/Ukulele/Drums toggle
│   │   └── AudioVisualizer.tsx # Waveform + spectrum display
│   │
│   ├── chords/
│   │   ├── ChordGrid.tsx       # Chord selector grid
│   │   ├── ChordDiagram.tsx    # Fretboard diagram (2D or 3D)
│   │   ├── ProgressionView.tsx # Song-level chord progression timeline
│   │   └── CapoControls.tsx    # Capo selector + transpose buttons
│   │
│   ├── recorder/
│   │   ├── RecordButton.tsx    # Large circular record control
│   │   ├── RecordingTimeline.tsx# Visual timeline of recorded audio
│   │   ├── MixerView.tsx       # Per-track mixer during recording
│   │   └── ExportModal.tsx     # Format selection, quality options, download
│   │
│   ├── practice/
│   │   ├── Metronome.tsx       # Visual + audible metronome
│   │   ├── TempoSlider.tsx     # BPM control (60-200)
│   │   ├── ScoreBoard.tsx      # Real-time accuracy score
│   │   └── CoachFeedback.tsx   # AI coaching text display
│   │
│   ├── library/
│   │   ├── SongCard.tsx        # Song thumbnail + metadata
│   │   ├── SearchBar.tsx       # Debounced search with auto-complete
│   │   ├── FilterPanel.tsx     # Genre, difficulty, key filters
│   │   └── QueuePanel.tsx      # Up-next song queue
│   │
│   ├── settings/
│   │   ├── ThemeSelector.tsx   # Light/Dark/System toggle
│   │   ├── AccessibilityPanel.tsx # Contrast, text size, reduced motion
│   │   ├── DeviceSettings.tsx  # Camera/audio device selection
│   │   └── ProfilePanel.tsx    # Profile editing, account management
│   │
│   └── 3d/
│       ├── GuitarScene.tsx     # Three.js scene + guitar model
│       ├── HandModel.tsx       # 3D hand mesh synced with MediaPipe
│       └── ParticleEffects.tsx # Strum sparkles, recording pulse rings
│
├── hooks/
│   ├── useMediaPipe.ts         # Camera stream + MediaPipe pipeline
│   ├── useAudioEngine.ts       # Tone.js + AudioContext management
│   ├── useRecording.ts         # MediaRecorder + upload queue
│   ├── useGestures.ts          # Landmark → chord mapping + calibration
│   ├── usePracticeSession.ts   # Score calculation + progress tracking
│   ├── useSongs.ts             # CRUD operations for song library
│   └── useTheme.ts             # Dark/light mode toggle
│
├── stores/
│   ├── audioStore.ts           # Audio state (muted, volume, instruments)
│   ├── gestureStore.ts         # Current gesture, confidence, calibration
│   ├── songStore.ts            # Song library, current song, playback state
│   ├── userStore.ts            # Auth state, profile, preferences
│   └── recordingStore.ts       # Recording sessions, exported files
│
├── services/
│   ├── api.ts                  # Axios/Fetch instance with interceptors
│   ├── auth.ts                 # Auth service: login, register, token refresh
│   ├── songs.ts                # Song CRUD API clients
│   ├── recordings.ts           # Recording upload + status polling
│   ├── gestures.ts             # Gesture calibration API
│   └── websocket.ts            # Socket.io client manager
│
├── utils/
│   ├── audioUtils.ts           # Format conversion, duration extraction
│   ├── gestureUtils.ts         # Landmark normalization, feature extraction
│   ├── chordUtils.ts           # Chord theory: transposition, intervals, voicings
│   ├── dateUtils.ts            # Session timestamps, duration formatting
│   └── throttle.ts             # Performance throttle utility
│
├── types/                      # Shared TypeScript interfaces
│   ├── audio.ts
│   ├── gesture.ts
│   ├── song.ts
│   ├── user.ts
│   └── recording.ts
│
├── constants/
│   ├── chords.ts               # All chord definitions
│   ├── strumPatterns.ts        # Default strum pattern library
│   ├── themes.ts               # Color theme definitions
│   └── breakpoints.ts          # Responsive breakpoint values
│
└── pages/                      # Route-level page components
    ├── HomePage.tsx
    ├── PracticePage.tsx
    ├── FreePlayPage.tsx
    ├── RecordingPage.tsx
    ├── LibraryPage.tsx
    ├── SettingsPage.tsx
    ├── ProfilePage.tsx
    └── HelpPage.tsx
```

---

## State Management Architecture

### Zustand Stores Separation of Concerns

```typescript
// gestureStore.ts - Minimal, fast updates for real-time
interface GestureState {
  currentGesture: string | null;
  confidence: number;
  landmarks: Landmark[] | null;
  isCalibrated: boolean;
  calibrationData: CalibrationRecord[];
  
  // Actions (sync, <1ms)
  setGesture: (gesture) => void;
  setLandmarks: (landmarks) => void;
  startCalibration: () => void;
  saveCalibration: (data) => void;
}

// songStore.ts - Handles song CRUD + playback queue
interface SongState {
  songs: Song[];
  currentSong: Song | null;
  playbackQueue: Song[];
  isPlaying: boolean;
  currentChordIndex: number;
  
  // Actions
  loadSongs: () => Promise<void>;
  setCurrentSong: (song) => void;
  nextChord: () => void;
  togglePlayback: () => void;
}
```

### React Query Usage Pattern

- **Server State** (songs, recordings, user profile): React Query with optimistic updates
- **Mutations**: `useMutation` with `onMutate` → `onError` → `onSettled` pattern
- **Invalidation**: Tag-based invalidation (`['songs']`, `['recordings']`)

---

## Routing (React Router v6)

```tsx
// App.tsx routes
<Routes>
  <Route path="/" element={<HomeLayout />}>
    <Route index element={<HomePage />} />
    <Route path="practice" element={<PracticePage />} />
    <Route path="freeplay" element={<FreePlayPage />} />
    <Route path="record" element={<RecordingPage />} />
    <Route path="library" element={<LibraryPage />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="help" element={<HelpPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route>
  <Route path="/auth/*" element={<AuthLayout />} />
</Routes>
```

---

## Camera Handling (MediaPipe Integration)

```typescript
// useMediaPipe.ts
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export function useMediaPipe() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
  
  useEffect(() => {
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,       // Balanced speed/accuracy
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });
    
    hands.onResults(onResults);
    
    const camera = new Camera(videoRef.current!, {
      onFrame: async () => {
        await hands.send({image: videoRef.current});
      },
      width: 1280,
      height: 720,
    });
    camera.start();
    
    return () => camera.stop();
  }, []);
  
  return { videoRef, landmarks };
}
```

---

## Offline Handling

```typescript
// Service Worker registration + Workbox
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// Cache static assets with stale-while-revalidate
registerRoute(
  ({request}) => request.destination === 'script' || request.destination === 'worker',
  new StaleWhileRevalidate()
);

// Cache audio samples on first load
navigator.serviceWorker.register('/sw.js');

// IndexedDB for user data
const db = await openDB('airchord', 1, {
  upgrade(db) {
    db.createObjectStore('recordings');
    db.createObjectStore('songs');
    db.createObjectStore('preferences');
  }
});
```

---

## Performance Optimization

| Strategy | Implementation |
|----------|---------------|
| Code Splitting | Route-level lazy loading via `React.lazy()` |
| Memoization | `React.memo`, `useMemo`, `useCallback` on gesture processing |
| Off-Main-Thread | Gesture processing in Web Worker |
| CSS Containment | `contain: layout style` on panels |
| Image Optimization | Compressed thumbnails, lazy loading |
| Audio Buffering | Pre-load next chord samples while silent |
| Animation Performance | GPU-accelerated transforms only (`transform`, `opacity`) |
| Bundle Analysis | `rollup-plugin-visualizer` in build config |

---

## Error Handling

```typescript
// Error boundary for route-level failures
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <FallbackUI error={this.state.error} retry={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}

// Audio context resume on user interaction (browser autoplay policy)
document.addEventListener('click', async () => {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
});
```