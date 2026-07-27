# Practice Mode Documentation

## 1. Overview

AirChord's Practice Mode provides structured learning tools for users to improve their chord transitions, strumming accuracy, and timing. The mode includes a metronome, chord trainer, gesture trainer, performance scoring, and progress tracking.

---

## 2. Practice Modes

| Mode | Description | Difficulty |
|------|-------------|------------|
| Free Play | Play any chord, no structure | Beginner |
| Chord Trainer | Practice specific chord transitions | Beginner-Intermediate |
| Strumming Coach | Practice strumming patterns | Intermediate |
| Song Mode | Play along with chord progression | Intermediate-Advanced |
| Challenge Mode | Timed challenges with scoring | Advanced |

---

## 3. Tempo Trainer

### 3.1 Features

- **BPM Control**: 40-240 BPM with fine adjustment
- **Tap Tempo**: Tap to set desired BPM
- **Gradual Speed-Up**: Automatically increase tempo by X BPM every Y measures
- **Tempo Lock**: Lock tempo to prevent accidental changes

### 3.2 Gradual Speed-Up Settings

| Parameter | Range | Default |
|-----------|-------|---------|
| Start BPM | 40-200 | 80 |
| End BPM | 60-240 | 140 |
| Increment | 1-10 BPM | 2 |
| Measures per increment | 1-8 | 4 |

### 3.3 Flow

```
User Sets Start BPM → Start Practice
    ↓
Metronome Plays at Start BPM
    ↓
After X Measures → Increase BPM by Y
    ↓
Repeat Until End BPM Reached
    ↓
Show Completion Stats
```

---

## 4. Metronome

### 4.1 Visual Metronome

```
    ┌─────────────┐
    │     ●       │  ← Pendulum at peak
    │    / \      │
    │   /   \     │
    │  /     \    │
    │ /       \   │
    │/         \  │
    └─────────────┘
    Beat: 1 of 4
    BPM: 120
```

### 4.2 Audible Metronome

| Beat | Sound | Volume |
|------|-------|--------|
| Downbeat (1) | High click | 100% |
| Upbeat | Low click | 60% |
| Off-beat | Soft click | 30% |

### 4.3 Time Signature Support

| Signature | Display | Accent Pattern |
|-----------|---------|----------------|
| 4/4 | 4 beats | **Strong**-Medium-Medium-Medium |
| 3/4 | 3 beats | **Strong**-Medium-Medium |
| 6/8 | 6 beats | **Strong**-weak-weak-**Medium**-weak-weak |
| 2/4 | 2 beats | **Strong**-Medium |
| 5/4 | 5 beats | **Strong**-Medium-Medium-Medium-Medium |

---

## 5. Chord Trainer

### 5.1 Single Chord Practice

```
Select Chord (e.g., "C Major") → Show Hand Position Guide
    ↓
User Forms Gesture → System Detects
    ↓
Feedback: Correct ✅ or Incorrect ❌
    ↓
Track Accuracy % Over Time
```

### 5.2 Chord Transition Practice

```
Select Transition (e.g., "C → G") → Show Both Chord Shapes
    ↓
Metronome Plays → User Must Switch on Beat
    ↓
System Measures:
    - Transition time (ms)
    - Accuracy (correct chord on beat?)
    - Smoothness (no gaps or mistakes?)
    ↓
Score: 0-100
```

### 5.3 Transition Difficulty Matrix

| From/To | Easy | Medium | Hard |
|---------|------|--------|------|
| C | G, Am, F | D, Em | B7, Fm |
| G | C, D, Em | Am, E | Bm, F#m |
| D | G, A, Em | C, Bm | Fm, Bbm |
| Am | C, F, G | Dm, E | B7, G7 |
| Em | G, C, Am | D, A | B7, F#7 |

### 5.4 Common Progression Practice

| Progression | Chords | Genre |
|-------------|--------|-------|
| I-IV-V-I | C-F-G-C | Pop, Rock |
| I-V-vi-IV | C-G-Am-F | Pop |
| ii-V-I | Dm-G-C | Jazz |
| I-vi-IV-V | C-Am-F-G | 50s Pop |
| 12-Bar Blues | C-C-C-C-F-F-C-C-G-F-C-G | Blues |

---

## 6. Gesture Trainer

### 6.1 Gesture Recognition Practice

```
Show Target Gesture (3D hand model)
    ↓
User Copies Gesture
    ↓
System Shows:
    - Confidence score
    - Landmark overlay
    - Comparison to target
    ↓
Tips for Improvement:
    - "Extend your index finger more"
    - "Spread your fingers wider"
    - "Straighten your thumb"
```

### 6.2 Gesture Speed Drill

- Display random chord names
- User must form gesture as fast as possible
- Track reaction time (ms)
- Target: <500ms per gesture

### 6.3 Gesture Accuracy Drill

- Display chord progression
- User plays through progression
- System tracks:
  - Correct gestures: X/Y
  - Timing accuracy: X%
  - Overall score: 0-100

---

## 7. Performance Scoring & AI Feedback

### 7.1 Score Components

| Component | Weight | Measurement |
|-----------|--------|-------------|
| Chord Accuracy | 40% | Correct gestures / total attempts |
| Timing Accuracy | 35% | On-beat triggers / total triggers |
| Transition Smoothness | 15% | Gap-free chord changes |
| Strum Accuracy | 10% | Correct strum patterns |

### 7.2 Score Calculation

```typescript
function calculateScore(metrics: PracticeMetrics): number {
  const chordScore = metrics.correctChords / metrics.totalChords * 100;
  const timingScore = metrics.onBeatTriggers / metrics.totalTriggers * 100;
  const transitionScore = metrics.smoothTransitions / metrics.totalTransitions * 100;
  const strumScore = metrics.correctStrums / metrics.totalStrums * 100;

  return Math.round(
    chordScore * 0.40 +
    timingScore * 0.35 +
    transitionScore * 0.15 +
    strumScore * 0.10
  );
}
```

### 7.3 Score Ranges

| Score | Rating | Feedback |
|-------|--------|----------|
| 90-100 | ⭐ Excellent | "Perfect performance!" |
| 80-89 | 🎵 Great | "Almost flawless!" |
| 70-79 | 👍 Good | "Solid performance" |
| 60-69 | 📈 Improving | "Keep practicing!" |
| Below 60 | 🔄 Needs Work | "Try slowing down the tempo" |

### 7.4 AI Practice Coach (Detailed Feedback)

Instead of generic "Wrong chord" messages, the AI provides **teacher-level feedback**:

```
Practice Session Complete!

Duration: 12 minutes
Song: "Let It Be" (Key of C)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall Score: 94% ⭐

Chord Accuracy: 96%
  ✅ C Major — 100% (12/12)
  ✅ G Major — 100% (12/12)
  ⚠️ Am — 83% (10/12) — Missed beats 16, 24
  ✅ F Major — 100% (12/12)

Timing Accuracy: 92%
  Average latency: +35ms (slightly behind beat)
  Worst transition: Am → F (+280ms late)
  Best transition: C → G (+15ms)

Transition Analysis:
  C → G:   Excellent (15ms, clean)
  G → Am:  Good (45ms, slight hesitation)
  Am → F:  Needs work (280ms, prepare hand earlier)
  F → C:   Good (30ms, smooth)

Strum Pattern: Folk Strum
  Consistency: 94%
  Humanize factor: Natural (0.3)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 AI Recommendations:
1. Practice Am → F transition at 80 BPM
2. Prepare your Am hand shape earlier (beat 14 instead of 16)
3. You're rushing slightly on C → G — try relaxing

🎯 Focus Area: Am chord transitions
📈 Progress: +8% from last session (86% → 94%)
```

### 7.5 Feedback Types

| Trigger | AI Feedback |
|---------|-------------|
| Correct chord on beat | "Perfect! 🎵" |
| Late chord change | "You switched to G 280ms late. Try preparing your hand earlier." |
| Wrong chord | "That was {wrong}. The target was {correct}." |
| Rushing | "You're ahead of the beat. Slow down and listen." |
| Dragging | "You're behind the beat. Anticipate the change." |
| Good streak | "5 in a row! Keep it up! 🔥" |
| Pattern detected | "Nice folk strum pattern!" |
| Improvement | "You improved 8% from last session!" |

---

## 8. Timing Analysis

### 8.1 Metrics Tracked

| Metric | Description | Target |
|--------|-------------|--------|
| Average Latency | ms from beat to trigger | <50ms |
| Timing Variance | Standard deviation of timing | <20ms |
| Beat Accuracy | % of triggers on beat | >90% |
| Rush/Drift | Consistently early/late | 0 |

### 8.2 Visual Feedback

```
Beat Grid:
    |---|---|---|---|
    ↓       ↓       ↓   ← Ideal (on beat)
      ↓     ↓     ↓     ← Actual (slightly early)
    
    Timing Error: -15ms average (rushing)
    Suggestion: "Try to relax and wait for the beat"
```

---

## 9. Progress Tracking

### 9.1 Session History

| Data Point | Storage |
|------------|---------|
| Session date/time | Firestore |
| Duration (minutes) | Firestore |
| Chords practiced | Firestore |
| Average score | Firestore |
| Improvement trend | Calculated |

### 9.2 Progress Dashboard

```
┌─────────────────────────────────────┐
│  Weekly Practice Overview           │
│  ████████░░░░░░░░░░░░  Mon: 15 min  │
│  ████████████░░░░░░░░  Tue: 20 min  │
│  ████████████████░░░░  Wed: 25 min  │
│  ████████████████████  Thu: 30 min  │
│  ██████████████░░░░░░  Fri: 22 min  │
│  ░░░░░░░░░░░░░░░░░░░░  Sat: --      │
│  ░░░░░░░░░░░░░░░░░░░░  Sun: --      │
│                                     │
│  Total: 112 min | Streak: 5 days   │
│  Best Score: 94% | Avg Score: 82%  │
└─────────────────────────────────────┘
```

### 9.3 Milestones

| Milestone | Requirement |
|-----------|-------------|
| First Chord | Complete first successful gesture |
| 10 Chords | Play 10 different chords |
| Perfect Score | Score 100% on any practice |
| 7-Day Streak | Practice 7 consecutive days |
| Speed Demon | Complete transition in <300ms |
| Song Master | Complete full song in practice mode |
| 100 Sessions | Complete 100 practice sessions |

---

## 10. Achievements

### 10.1 Achievement Categories

| Category | Examples |
|----------|----------|
| Consistency | "7-Day Streak", "30-Day Streak" |
| Accuracy | "Perfect Score", "100% Accuracy" |
| Speed | "Lightning Fast", "Speed Demon" |
| Repertoire | "10 Songs", "50 Songs" |
| Social | "First Share", "10 Shares" |

### 10.2 Achievement Display

- Profile page shows unlocked achievements
- Notification on unlock
- Share achievement to social media

---

## 11. Daily Practice

### 11.1 Daily Challenge

```
Today's Challenge:
    - Play C → G → Am → F progression
    - Target BPM: 100
    - Target Score: 80%
    - Reward: "Daily Champion" badge
```

### 11.2 Practice Reminders

| Setting | Options |
|---------|---------|
| Reminder Time | Custom time |
| Frequency | Daily / Weekdays / Custom |
| Notification | Push notification |
| Streak Protection | Miss one day without losing streak |

---

## 12. Adaptive Difficulty

### 12.1 AI-Powered Adaptation

The practice mode adapts to user skill level:

```typescript
interface UserSkillProfile {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  knownChords: string[];
  transitionSpeed: number; // avg ms
  accuracy: number; // avg %
  weakTransitions: string[]; // pairs that need work
}
```

### 12.2 Difficulty Scaling

| Skill Level | Tempo Range | Chord Complexity | Scoring Strictness |
|-------------|-------------|------------------|-------------------|
| Beginner | 60-100 BPM | Basic major/minor | Lenient |
| Intermediate | 80-140 BPM | 7ths, barre chords | Normal |
| Advanced | 100-180 BPM | All chords, complex progressions | Strict |
| Expert | 120-240 BPM | Jazz chords, custom | Very Strict |
