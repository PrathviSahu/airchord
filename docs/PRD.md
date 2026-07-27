# Product Requirement Document (PRD)

## Project Name: AirChord

### Tagline
**Sing Freely. We'll Play the Guitar.**

---

## 1. Vision
AirChord transforms a smartphone, tablet, or laptop into a virtual guitarist. By combining computer vision, real-time audio synthesis, and gesture recognition, singers can perform naturally without needing to physically play an instrument. The objective is to create the easiest way for anyone to sing with live guitar accompaniment, feeling like a premium music application rather than a technical demo.

---

## 2. Mission
Empower singers of all skill levels to perform with professional-grade guitar accompaniment using only their voice and hand gestures, removing barriers of instrument access, physical ability, and multitasking complexity.

---

## 3. Problem Statement
- Many singers cannot play guitar due to lack of skill, physical limitations, or financial constraints.
- Singing and playing guitar simultaneously is challenging, reducing vocal performance quality.
- Existing solutions (chord apps, backing tracks) lack real-time responsiveness and expressive dynamics.
- Beginner musicians face steep learning curves and high costs to achieve live accompaniment.
- Content creators need flexible, high-quality audio-visual tools for social media performance.

---

## 4. Current Market Problems
| Existing Solution | Limitations |
|-------------------|-------------|
| Chord lookup apps (Ultimate Guitar, Songsterr) | Static chord charts, no audio generation |
| Backing track apps (iReal Pro, Band-in-a-Box) | Pre-recorded, inflexible to tempo changes |
| Virtual instrument apps (GarageBand, FL Studio) | Require manual playing, steep learning curve |
| AI accompaniment (Chordify, Yousician) | Focus on learning, not live performance |
| Guitar effect processors | Require physical guitar input |

---

## 5. Our Solution
AirChord uses the device camera to detect hand gestures and finger positions, mapping each gesture to a guitar chord in real-time. The app synthesizes realistic guitar sounds using the selected strumming pattern, allowing users to sing with live accompaniment. Future extensions include drums, bass, piano, strings, AI practice, recording, exporting, cloud synchronization, and live performance mode.

---

## 6. Goals (MVP)
- Enable real-time hand tracking with sub-50ms latency.
- Detect and map at least 12 common guitar chords (major, minor, seventh) to hand gestures.
- Synthesize high-quality acoustic guitar audio via Web Audio API/Tone.js.
- Provide adjustable tempo (60-200 BPM) with metronome.
- Allow recording and export of audio/video (MP3/WAV/MP4).
- Support capo transposition (0-12 frets).
- Work offline after initial load.
- Deliver a polished, musician-friendly UI following material design principles.

---

## 7. Non-Goals (for MVP)
- Multi-instrument support (beyond guitar).
- Social sharing or community features.
- AI-generated chord progressions.
- Cloud synchronization (beyond local storage).
- Advanced audio effects (reverb, delay, amp modeling).
- Vocal processing (pitch correction, harmonization).
- Multi-user collaboration.
- Plugin marketplace.

---

## 8. Success Metrics (KPIs)
| Metric | Target (6 months post-launch) |
|--------|-------------------------------|
| Daily Active Users (DAU) | 5,000 |
| Monthly Active Users (MAU) | 20,000 |
| Average Session Duration | >8 minutes |
| Retention Rate (Day 7) | 40% |
| Retention Rate (Day 30) | 25% |
| Crash-Free Sessions | >99.5% |
| Audio Latency (end-to-end) | <50ms 90th percentile |
| Gesture Recognition Accuracy | >95% for trained chords |
| User Satisfaction (NPS) | >40 |
| Conversion to Premium (if offered) | >5% |

---

## 9. Future Roadmap
| Phase | Timeline | Features |
|-------|----------|----------|
| **Phase 1: Documentation** | Complete | All 20 design documents |
| **Phase 2: UI Design** | Weeks 1-2 | Wireframes, mockups, design system |
| **Phase 3: Prototype** | Weeks 3-6 | Core hand tracking + guitar synth |
| **Phase 4: MVP** | Weeks 7-10 | Full feature set per goals |
| **Phase 5: Beta** | Weeks 11-14 | Closed beta, feedback iteration |
| **Phase 6: Public Launch** | Week 15 | Web PWA release |
| **Phase 7: Premium Features** | Months 4-6 | Advanced audio effects, studio samples |
| **Phase 8: AI Features** | Months 7-9 | AI practice coach, mistake detection |
| **Phase 9: Mobile Deployment** | Months 10-12 | Capacitor build, Play Store submission |
| **Phase 10: Expansion** | Year 2 | Multi-instrument, live mode, plugins |

---

## 10. User Personas
| Persona | Background | Goals | Pain Points |
|---------|------------|-------|-------------|
| **Beginner Singer** | Hobbyist, no instrument skills | Sing songs with guitar backing | Can't play guitar, intimidated by learning |
| **Professional Vocalist** | Gigging musician, time-constrained | Quick setup for performances | Needs reliable, low-latency accompaniment |
| **Instagram Creator** | Content creator, mobile-first | Produce engaging music videos | Wants syncable audio/visual, no post-production |
| **Street Performer** | Busker, minimal gear | Portable, battery-efficient solution | Needs offline capability, rugged usability |
| **Music Teacher** | Educator, resource-limited | Teaching tool for chord concepts | Requires visual clarity, classroom safety |
| **Church Musician** | Volunteer musician, varying skill | Lead worship with backing tracks | Wants simple chord following, lyric display |
| **College Student** | Dorm-dweller, budget-conscious | Free/low-cost music making | Cannot afford guitar or lessons |
| **Accessibility User** | Limited motor control | Adaptive music participation | Needs customizable gesture mapping |

---

## 11. User Stories & Acceptance Criteria
### Epic: Core Gesture-to-Chord Mapping
**As a** user,  
**I want** to show a specific hand gesture and hear the corresponding guitar chord,  
**so that** I can play chords without a physical guitar.

**Acceptance Criteria:**
- [ ] MediaPipe detects hand landmarks with <50ms latency on mid-tier smartphones.
- [ ] System recognizes at least 12 distinct chord gestures (C, G, D, A, E, Am, Em, Dm, C7, G7, F, B7).
- [ ] Each correctly recognized gesture triggers the chord audio within 30ms.
- [ ] False positive rate <5% for trained gestures.
- [ ] Users can calibrate gesture sensitivity per hand size/lighting.

### Epic: Real-Time Audio Synthesis
**As a** user,  
**I want** to hear realistic guitar sound when I form a chord gesture,  
**so that** my singing feels accompanied by a live instrument.

**Acceptance Criteria:**
- [ ] Audio engine uses 48kHz sampling, 16-bit depth.
- [ ] Guitar samples are velocity-sensitive (soft/loud strum).
- [ ] Strumming patterns follow user-selected tempo (60-200 BPM).
- [ ] Audio output is stereo with panning for realism.
- [ ] No audible clicks, pops, or latency spikes during chord changes.

### Epic: Recording & Export
**As a** user,  
**I want** to record my performance and export it as a shareable video,  
**so that** I can post it on social media or keep a memory.

**Acceptance Criteria:**
- [ ] Record button captures both microphone audio and front camera video.
- [ ] Audio and video tracks are synchronized (<10ms drift).
- [ ] Export options: MP3 audio only, MP4 video (H.264/AAC).
- [ ] Exported files meet platform specs (Instagram: ≤1080p, ≤30MB).
- [ ] Recording continues while app is in background (with permission).

### Epic: Offline First
**As a** user,  
**I want** to use AirChord without internet after initial load,  
**so that** I can perform anywhere, even without connectivity.

**Acceptance Criteria:**
- [ ] All core assets (UI, audio samples, models) cached via service worker.
- [ ] Gesture recognition runs entirely client-side.
- [ ] No network calls required for chord detection/audio synthesis.
- [ ] User settings and recordings stored in IndexedDB.
- [ ] Sync queue implements when connection restores (future phase).

---

## 12. Competitive Analysis & SWOT
### Competitors
| Product | Strengths | Weaknesses vs AirChord |
|---------|-----------|------------------------|
| Ultimate Guitar | Massive chord library | No audio generation, static |
| Yousician | Interactive lessons | Requires physical instrument, subscription |
| GarageBand | Multi-track DAW | Steep learning curve, manual input |
| iReal Pro | Backing tracks, chord charts | Pre-recorded, inflexible tempo |
| Chordify | AI chord detection from audio | Focus on learning, not live play |
| BandLab | Cloud DAW, collaboration | Overkill for simple accompaniment |
| Smule | Karaoke with effects | Vocal-centric, no instrumental freedom |

### SWOT Analysis
**Strengths**
- True real-time gesture-to-sound mapping
- Zero instrument skill required
- Premium audio quality focus
- Privacy-first (local processing)
- Extensible to multiple instruments

**Weaknesses**
- Initial dependence on device camera quality
- Gesture learning curve (mitigated by training)
- Higher battery usage (camera + audio)
- Requires modern smartphone/webcam

**Opportunities**
- Accessibility market (adaptive music making)
- Education sector (chord teaching tool)
- Content creator tools (TikTok/Instagram integration)
- Live performance venues (street, cafes)
- Therapeutic applications (music therapy)

**Threats**
- Rapid advances in AI audio generation
- Potential patent encumbrances in gesture mapping
- Platform changes (camera/api restrictions)
- Competition from big audio companies (Native Instruments, etc.)

---

## 13. Unique Selling Proposition (USP)
AirChord is the **only** application that combines:
1. **Dynamic Band** – The accompaniment responds to your voice intensity. Sing softly → gentle strumming. Sing loudly → the band builds. No other app does this.
2. **Low-latency hand tracking** (<50ms) for instantaneous chord response
3. **Studio-quality guitar synthesis** responsive to dynamics and articulation
4. **Zero-touch instrument playing** – no physical contact, pick, or strings needed
5. **Adaptive Performance** – The guitar follows your natural timing, not a metronome
6. **Gesture Profiles** – Switch between Classic, Worship, Bollywood, and custom chord sets instantly
7. **Privacy-first architecture** – all processing occurs on-device unless explicitly shared

This creates a magical experience where the user feels they are genuinely playing guitar with their hands, while the app responds like a real guitarist playing alongside them.

---

## 14. Architecture Decisions (Resolved)
- [x] State management: Zustand (lightweight, real-time friendly)
- [x] Styling: Tailwind CSS + CSS Variables
- [x] Build tool: Vite 5
- [x] 3D rendering: React Three Fiber (landing page + effects only)
- [x] Offline database: IndexedDB (raw API, no wrapper)
- [x] Authentication: Firebase Authentication (Email, Google, Apple)
- [x] Audio synthesis: Karplus-Strong physical modeling via Tone.js
- [x] Gesture profiles: Classic, Worship, Bollywood, Custom
- [x] Song format: Beat-based timeline object (not plain text)

---

## 15. Approval
This PRD defines the minimum viable product for AirChord. Sign-off indicates agreement on scope, goals, and success criteria for the initial release.

**Prepared by:** Claude Code (AI Assistant)  
**Reviewed by:** [To be filled by product stakeholders]  
**Date:** 2026-07-25  
**Version:** 1.0  

---
*End of PRD.md*