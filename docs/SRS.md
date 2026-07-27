# AirChord Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose

This document defines the complete software requirements for AirChord, an AI-powered virtual guitar companion application. It specifies functional requirements, non-functional requirements, performance criteria, security standards, and compatibility requirements.

### 1.2 Scope

AirChord is a cross-platform application (Web PWA, Android, iOS) that uses computer vision to detect hand gestures and map them to guitar chords in real-time. The application synthesizes realistic guitar audio and provides practice, recording, and performance features.

### 1.3 Definitions

| Term | Definition |
|------|------------|
| Gesture | A specific hand shape detected by MediaPipe |
| Chord | A group of notes played simultaneously |
| Strum | The act of playing multiple strings in sequence |
| Latency | Time from gesture input to audio output |
| BPM | Beats per minute (tempo) |
| Capo | Device that transposes guitar pitch |
| Landmark | A point on the hand detected by MediaPipe (21 points) |

---

## 2. Functional Requirements

### 2.1 Camera-Based Hand Tracking

**FR-001: Camera Initialization**
- The system shall request camera permission from the user
- The system shall initialize the front-facing camera at 1280×720 resolution
- The system shall capture video at 30fps minimum
- The system shall handle camera permission denial gracefully

**FR-002: Hand Detection**
- The system shall detect one hand in the camera frame
- The system shall output 21 landmarks per detected hand
- The system shall classify handedness (left/right)
- The system shall process frames in real-time without blocking UI

**FR-003: Landmark Processing**
- The system shall normalize landmarks relative to hand size
- The system shall filter noise from landmark positions
- The system shall interpolate between frames for smooth tracking

### 2.2 Gesture Recognition

**FR-010: Gesture Classification**
- The system shall recognize 12 distinct chord gestures (MVP)
- The system shall output gesture name and confidence score (0.0-1.0)
- The system shall classify gestures within 50ms of frame capture
- The system shall reject gestures below 0.65 confidence threshold

**FR-011: Gesture Validation**
- The system shall require 3 consecutive frames of same gesture before triggering
- The system shall debounce repeated triggers of same chord (150ms minimum)
- The system shall prevent false positives from random hand movements

**FR-012: Gesture Calibration**
- The system shall allow users to calibrate gestures for their hand size
- The system shall store calibration data locally (IndexedDB)
- The system shall allow recalibration at any time
- The system shall support left-handed and right-handed users

**FR-013: Custom Gesture Mapping**
- The system shall allow users to reassign gestures to different chords
- The system shall persist custom mappings across sessions
- The system shall provide a gesture mapping editor UI

### 2.3 Audio Synthesis

**FR-020: Guitar Sound Generation**
- The system shall synthesize acoustic guitar sounds using Karplus-Strong algorithm
- The system shall support 6-string guitar range (E2-E6)
- The system shall produce 48kHz, 16-bit audio output
- The system shall render stereo audio with panning

**FR-021: Chord Playback**
- The system shall play chord when gesture is confirmed
- The system shall pluck multiple strings with realistic timing offset (5-50ms)
- The system shall support velocity-sensitive dynamics
- The system shall sustain notes for user-configurable duration

**FR-022: Strumming Patterns**
- The system shall provide 8 built-in strumming patterns
- The system shall sync strumming to tempo (BPM)
- The system shall apply humanize factor for natural timing variation
- The system shall allow custom pattern creation

**FR-023: Capo Transposition**
- The system shall support capo positions 0-12
- The system shall transpose all chords by capo offset
- The system shall update chord display to show transposed chords
- The system shall auto-recommend capo position based on song key

**FR-024: Tempo Control**
- The system shall support tempo range 40-240 BPM
- The system shall provide tap tempo functionality
- The system shall sync chord changes to beat grid
- The system shall support time signatures: 4/4, 3/4, 6/8, 2/4

**FR-025: Metronome**
- The system shall provide audible metronome click
- The system shall provide visual metronome animation
- The system shall support 5 time signatures
- The system shall allow metronome volume adjustment (0-100%)

### 2.4 Recording

**FR-030: Audio Recording**
- The system shall record microphone audio during performance
- The system shall capture system audio (guitar synthesis)
- The system shall synchronize audio tracks (<10ms drift)
- The system shall display recording timer

**FR-031: Video Recording**
- The system shall record front camera video during performance
- The system shall capture at 1080p, 30fps
- The system shall overlay chord display on video
- The system shall synchronize audio and video (<10ms drift)

**FR-032: Export**
- The system shall export audio as MP3 (128-320 kbps)
- The system shall export audio as WAV (48kHz, 16-bit)
- The system shall export video as MP4 (H.264 + AAC)
- The system shall optimize exports for social media platforms

**FR-033: Recording Management**
- The system shall store recordings locally (IndexedDB)
- The system shall allow playback of recorded sessions
- The system shall allow deletion of recordings
- The system shall display recording metadata (duration, date, format)

### 2.5 Song Library

**FR-040: Song Storage**
- The system shall store songs locally (IndexedDB)
- The system shall sync songs to cloud (Firestore) when online
- The system shall support song metadata (title, artist, key, tempo, genre)

**FR-041: Song Browsing**
- The system shall display songs in list/grid view
- The system shall filter by genre, difficulty, key
- The system shall search by title and artist
- The system shall sort by name, date, difficulty

**FR-042: Song Playback**
- The system shall display chord progression timeline
- The system shall highlight current chord during playback
- The system shall auto-scroll chord display
- The system shall follow tempo and time signature

### 2.6 Practice Mode

**FR-050: Chord Training**
- The system shall guide user through chord practice
- The system shall provide visual hand position guide
- The system shall score accuracy (0-100%)
- The system shall track practice history

**FR-051: Transition Training**
- The system shall practice chord-to-chord transitions
- The system shall measure transition time and accuracy
- The system shall suggest tempo based on skill level

**FR-052: Scoring**
- The system shall calculate overall practice score
- The system shall track chord accuracy (40% weight)
- The system shall track timing accuracy (35% weight)
- The system shall track transition smoothness (15% weight)

---

## 3. Non-Functional Requirements

### 3.1 Performance

**NFR-001: Latency**
- End-to-end latency (gesture → audio) shall be <50ms at 90th percentile
- Camera frame processing shall be <25ms
- Gesture classification shall be <5ms
- Audio synthesis start shall be <10ms

**NFR-002: Frame Rate**
- Gesture processing shall maintain 30fps on mid-tier devices
- Gesture processing shall maintain 24fps minimum on low-end devices
- UI shall maintain 60fps during all interactions

**NFR-003: Memory**
- Application memory usage shall not exceed 500MB
- Audio buffer memory shall not exceed 100MB
- Memory leaks shall not exceed 1MB per hour of use

**NFR-004: Bundle Size**
- Initial JavaScript bundle shall be <500KB (gzipped)
- Audio assets shall be lazy-loaded
- Total application size shall be <5MB

### 3.2 Reliability

**NFR-010: Uptime**
- Web application shall maintain 99.9% uptime
- API services shall maintain 99.9% uptime
- Planned maintenance windows shall be announced 24 hours in advance

**NFR-011: Crash Rate**
- Crash-free sessions shall exceed 99.5%
- Application shall recover gracefully from errors
- Error boundaries shall prevent full application crashes

**NFR-012: Data Durability**
- User recordings shall be persisted reliably
- Cloud sync shall handle network interruptions
- Local data shall survive application restarts

### 3.3 Scalability

**NFR-020: User Capacity**
- System shall support 100,000 concurrent users
- API shall handle 10,000 requests per second
- Database shall support 1M+ user accounts

**NFR-021: Storage**
- User recordings shall be stored without limit (paid tier)
- Free tier shall provide 500MB storage
- Pro tier shall provide 10GB storage

### 3.4 Usability

**NFR-030: Learnability**
- New user shall play first chord within 30 seconds
- Calibration flow shall complete in <2 minutes
- UI shall be intuitive without documentation

**NFR-031: Accessibility**
- Application shall meet WCAG 2.1 AA standards
- All actions shall be keyboard accessible
- Screen reader support shall be complete
- Color contrast shall meet 4.5:1 minimum

**NFR-032: Internationalization**
- Application shall support English (MVP)
- Application shall be translatable to 10+ languages
- UI shall handle text expansion (30% longer strings)

---

## 4. Security Requirements

### 4.1 Authentication

**SEC-001: User Authentication**
- System shall support email/password authentication
- System shall support Google OAuth 2.0
- System shall support Apple Sign In
- System shall enforce password complexity (8+ chars, mixed case)

**SEC-002: Token Management**
- Access tokens shall expire in 15 minutes
- Refresh tokens shall expire in 7 days
- Tokens shall use RS256 algorithm
- Refresh tokens shall be rotated on use

### 4.2 Data Protection

**SEC-010: Encryption**
- All network traffic shall use TLS 1.3
- Data at rest shall use AES-256 encryption
- Passwords shall be hashed with bcrypt (12 rounds)
- PII shall be encrypted at field level

**SEC-011: Camera/Microphone Privacy**
- Camera feed shall never leave the device
- Audio shall be processed locally (unless user records)
- Permissions shall be revocable at any time
- Visual indicator shall show when camera/mic is active

### 4.3 API Security

**SEC-020: Rate Limiting**
- Authentication endpoints: 5 requests per 15 minutes
- General API: 100 requests per 15 minutes
- File upload: 10 requests per hour

**SEC-021: Input Validation**
- All API inputs shall be validated with Zod schemas
- SQL injection shall be prevented via parameterized queries
- XSS shall be prevented via output encoding
- CSRF shall be prevented via tokens

---

## 5. Accessibility Requirements

### 5.1 WCAG 2.1 AA Compliance

| Criterion | Requirement |
|-----------|-------------|
| 1.1.1 Text Alternatives | Alt text for all images |
| 1.3.1 Info and Relationships | Semantic HTML structure |
| 1.4.3 Contrast Minimum | 4.5:1 for text, 3:1 for UI |
| 2.1.1 Keyboard | All actions keyboard accessible |
| 2.4.1 Skip Navigation | Skip to main content link |
| 2.4.7 Focus Visible | Visible focus indicators |
| 3.3.1 Error Identification | Clear error messages |
| 4.1.2 Name, Role, Value | ARIA labels for components |

### 5.2 Assistive Technology

| Technology | Support Level |
|------------|---------------|
| VoiceOver (iOS/macOS) | Full support |
| TalkBack (Android) | Full support |
| NVDA (Windows) | Full support |
| JAWS (Windows) | Full support |
| Switch Control | Full support |
| Voice Control | Full support |

### 5.3 Motor Accessibility

- All touch targets minimum 44×44 pixels
- Keyboard shortcuts for all major actions
- Adjustable gesture sensitivity
- Alternative on-screen chord buttons
- Configurable auto-play tempo

---

## 6. Device Compatibility

### 6.1 Web Browser Support

| Browser | Minimum Version | Support Level |
|---------|-----------------|---------------|
| Chrome | 90+ | Full |
| Safari | 15+ | Full |
| Firefox | 90+ | Full |
| Edge | 90+ | Full |
| Samsung Internet | 15+ | Full |
| Opera | 75+ | Partial |

### 6.2 iOS Support

| Device | Minimum iOS | Support Level |
|--------|-------------|---------------|
| iPhone 12+ | iOS 15+ | Full |
| iPhone X-11 | iOS 15+ | Full |
| iPhone 8-SE | iOS 15+ | Partial (lower FPS) |
| iPad Pro | iOS 15+ | Full |
| iPad Air | iOS 15+ | Full |
| iPad Mini | iOS 15+ | Partial |

### 6.3 Android Support

| Device | Minimum Android | Support Level |
|--------|-----------------|---------------|
| Pixel 6+ | Android 11+ | Full |
| Samsung S21+ | Android 11+ | Full |
| OnePlus 9+ | Android 11+ | Full |
| Mid-range (2020+) | Android 11+ | Partial |
| Budget (<$200) | Android 11+ | Limited |

### 6.4 Desktop Support

| OS | Browser | Support Level |
|----|---------|---------------|
| Windows 10+ | Chrome, Edge, Firefox | Full |
| macOS 12+ | Chrome, Safari, Firefox | Full |
| Linux | Chrome, Firefox | Full |
| ChromeOS | Chrome | Full |

---

## 7. Audio Quality Requirements

### 7.1 Synthesis Quality

| Parameter | Requirement |
|-----------|-------------|
| Sample Rate | 48kHz |
| Bit Depth | 16-bit minimum |
| Dynamic Range | >60dB |
| THD (Total Harmonic Distortion) | <1% |
| Frequency Response | 80Hz - 8kHz (guitar range) |

### 7.2 Recording Quality

| Format | Sample Rate | Bitrate | Channels |
|--------|-------------|---------|----------|
| MP3 Low | 22.05 kHz | 64 kbps | Mono |
| MP3 Medium | 44.1 kHz | 128 kbps | Stereo |
| MP3 High | 48 kHz | 320 kbps | Stereo |
| WAV | 48 kHz | 1411 kbps | Stereo |
| AAC | 48 kHz | 256 kbps | Stereo |

### 7.3 Latency Requirements

| Stage | Target | Maximum |
|-------|--------|---------|
| Camera → MediaPipe | 16ms | 25ms |
| MediaPipe → Gesture | 2ms | 5ms |
| Gesture → Audio | 1ms | 3ms |
| Audio Processing | 5ms | 10ms |
| **Total** | **24ms** | **43ms** |

---

## 8. Camera Requirements

### 8.1 Camera Specifications

| Parameter | Minimum | Recommended |
|-----------|---------|-------------|
| Resolution | 720p (1280×720) | 1080p (1920×1080) |
| Frame Rate | 24 fps | 30 fps |
| Focus | Fixed | Auto-focus |
| Low Light | Usable | Good |

### 8.2 Camera Permissions

| Permission | Required | Purpose |
|------------|----------|---------|
| Camera | Yes | Hand gesture detection |
| Microphone | Optional | Voice recording |
| Both | Recommended | Full functionality |

---

## 9. Offline Capabilities

### 9.1 Offline Scope

| Feature | Offline Support |
|---------|-----------------|
| Gesture recognition | ✅ Full |
| Audio synthesis | ✅ Full |
| Metronome | ✅ Full |
| Practice mode | ✅ Full |
| Recording (local) | ✅ Full |
| Song library (cached) | ✅ Full |
| Cloud sync | ❌ Requires internet |
| User account | ❌ Requires internet |
| Export to social | ❌ Requires internet |

### 9.2 Offline Storage

| Data Type | Storage | Max Size |
|-----------|---------|----------|
| Application cache | Service Worker | 20MB |
| Audio samples | Cache API | 100MB |
| User recordings | IndexedDB | Device limit |
| Song library | IndexedDB | 50MB |
| Settings | IndexedDB | 1MB |

---

## 10. Browser API Requirements

### 10.1 Required APIs

| API | Purpose | Fallback |
|-----|---------|----------|
| Web Audio API | Audio synthesis | None (required) |
| getUserMedia | Camera access | None (required) |
| MediaRecorder | Recording | None (required) |
| Service Worker | Offline support | Online-only mode |
| IndexedDB | Local storage | LocalStorage (limited) |
| WebGL | 3D rendering | 2D fallback |

### 10.2 Optional APIs

| API | Purpose | Fallback |
|-----|---------|----------|
| Web MIDI | MIDI controllers | Not supported |
| Web Share | Native sharing | Copy to clipboard |
| Fullscreen API | Immersive mode | Windowed mode |
| Wake Lock | Prevent sleep | None |
