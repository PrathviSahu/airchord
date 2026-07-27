# UI/UX Design Documentation

## Design Philosophy

AirChord follows a **"Performance-First"** approach:

1. **Minimal Cognitive Load** - Interface fades into background during performance
2. **Zero Learning Curve** - Intuitive gestures map directly to guitar actions
3. **Visual Clarity** - High contrast, large touch targets for stage lighting
4. **Musician-Centric** - Designed by musicians, for musicians
5. **Emotional Engagement** - Animations that feel alive and responsive

---

## Color Palette

| Role | Light Mode | Dark Mode |
|------|------------|-----------|
| Primary | `#6366F1` (Indigo 500) | `#818CF8` |
| Secondary | `#F59E0B` (Amber 500) | `#FBBF24` |
| Success | `#10B981` (Emerald 500) | `#34D399` |
| Warning | `#F59E0B` (Amber 500) | `#FBBF24` |
| Error | `#EF4444` (Red 500) | `#F87171` |
| Background | `#F9FAFB` | `#111827` |
| Surface | `#FFFFFF` | `#1F2937` |
| Text Primary | `#1F2937` | `#F9FAFB` |
| Text Secondary | `#6B7280` | `#9CA3AF` |

---

## Typography

| Usage | Font | Size | Weight |
|-------|------|------|--------|
| App Title | Inter Bold | 28px | 700 |
| Section Header | Inter SemiBold | 20px | 600 |
| Body Text | Inter Regular | 16px | 400 |
| Button Text | Inter Medium | 14px | 500 |
| Metadata | Inter Light | 12px | 300 |

---

## Spacing System (8px Grid)

```
xs: 4px   | sm: 8px   | md: 16px  | lg: 24px  | xl: 32px  |
2xl: 48px | 3xl: 64px | 4xl: 96px | 5xl: 128px
```

---

## Component Library

| Component | Variant 1 | Variant 2 | Variant 3 |
|-----------|-----------|-----------|-----------|
| Button | Primary (Filled) | Secondary (Outline) | Ghost (Text) |
| Card | Elevation 1 | Elevation 2 | Elevation 3 |
| Modal | Center | Full Screen | Bottom Sheet |
| Slider | Horizontal | Vertical | Circular |
| Toggle | Switch | Checkbox | Radio |
| Chip | Filter | Category | Tag |
| Avatar | Circle | Square | Initials |

---

## Micro-Interactions

| Trigger | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Chord Detection | Pulse Glow | 200ms | ease-out |
| Strum Initiation | Wave Ripple | 150ms | cubic-bezier(0.4,0,0.2,1) |
| Recording Start | Ring Effect | 300ms | ease-out |
| Gesture Recognition | Hand Highlight | 100ms | ease-in-out |
| Error State | Shake | 400ms | linear |
| Success State | Checkmark Draw | 500ms | ease-out |

---

## Glassmorphism Usage

Applied to:
- Control panel backgrounds (blur 12px, opacity 0.75)
- Chord selection overlay
- Performance feedback layer
- Settings drawer

Formula: `backdrop-filter: blur(12px); background: rgba(255,255,255,0.25);`

---

## Responsive Breakpoints

| Device | Width | Layout Strategy |
|--------|-------|-----------------|
| Mobile (Portrait) | ≤ 480px | Single column, floating controls |
| Tablet (Landscape) | 768-1024px | Split view (chords + controls) |
| Desktop | ≥ 1024px | Multi-panel, advanced controls visible |
| TV Mode | ≥ 1920px | Full-screen, remote-friendly navigation |

---

## Accessibility

- **Color Contrast**: Minimum 4.5:1 (text), 3:1 (UI components)
- **Focus Indicators**: 3px solid `#6366F1` with glow effect
- **Screen Reader**: Full ARIA labeling, landmark regions
- **Reduced Motion**: `prefers-reduced-motion` media query support
- **Text Scaling**: Supports up to 200% zoom without breaking layout
- **Keyboard Navigation**: All actions accessible via Tab/Enter

---

## Motion Principles

1. **Purposeful Motion** - Every animation serves a functional purpose
2. **Consistent Easing** - `cubic-bezier(0.4,0,0.2,1)` for all transitions
3. **Duration Ranges** - 150ms-300ms for micro-interactions, 500ms-800ms for page transitions
4. **Performance First** - GPU-accelerated transforms, 60fps target

---

## Iconography

- **Style**: Two-tone, outline with filled variants
- **Grid**: 24x24px base, 20px stroke width
- **Library**: Custom-designed set + Heroicons for fallbacks
- **Usage**: Primary actions filled, secondary outlined

---

## Dark Mode Philosophy

Dark mode is **not just an aesthetic choice**—it's a performance feature:

- Reduces eye strain during extended practice sessions
- Enhances contrast for stage lighting conditions
- Lowers battery consumption on OLED displays
- Creates cinematic atmosphere for recording

---

## Data Visualization

For analytics and progress tracking:

- **Line Charts**: Progress trends over time
- **Radial Bars**: Daily practice completion
- **Heatmap**: Practice intensity by day of week
- **Sparklines**: Weekly performance snapshots

All charts use CSS variables for theme-aware coloring.

---

## 3D UI Guidelines

### Philosophy

3D is used **strategically** for wow-factor, not everywhere. Performance mode stays lightweight for smooth frame rates on mobile.

### Where 3D Is Used

| Screen | 3D Usage | Performance Priority |
|--------|----------|---------------------|
| **Landing Page** | Rich 3D guitar animation, floating strings, particle effects | Low (desktop-quality) |
| **Home Screen** | Subtle lighting, motion accents | Medium |
| **Free Play** | Small 3D chord diagram, hand model overlay | High (60fps) |
| **Performance Mode** | Minimal 3D, 2D UI dominant | Critical (must not drop frames) |
| **Recording** | 2D only (maximize recording resources) | N/A |

### Landing Page 3D Specs

- **Guitar model**: Low-poly acoustic guitar (5K triangles max)
- **String animation**: Strings vibrate when chord plays
- **Particle effects**: Sparkles on chord transitions
- **Lighting**: Subtle ambient + directional
- **Background**: Gradient, not 3D scene

### Performance Mode 2D-First

```
Performance Mode Layout:
┌─────────────────────────────────┐
│  [Tempo] [Capo] [Metronome]    │  ← Top bar (2D)
│                                 │
│     ┌───────────────────┐      │
│     │                   │      │
│     │   Camera View     │      │  ← Camera (native)
│     │   + Hand Overlay  │      │
│     │                   │      │
│     └───────────────────┘      │
│                                 │
│  ♪ ──────●───────────── ♪      │  ← Song Timeline (2D)
│  Em ──── G ──── C ──── D       │
│                                 │
│  [Record] [Settings] [Back]    │  ← Controls (2D)
└─────────────────────────────────┘
```

### 3D Performance Rules

1. **Never drop below 30fps** in performance mode
2. **Lazy load** 3D scenes (only when needed)
3. **Use 2D fallbacks** on low-end devices
4. **Disable particles** when recording
5. **Use `requestAnimationFrame`** for all 3D animations
6. **Limit triangle count**: Landing (5K), In-app (2K), Performance (500)