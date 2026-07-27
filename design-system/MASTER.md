# AirChord Design System — Master Document

**Phase B: Figma Design System**
**Version:** 1.0.0
**Last Updated:** 2026-07-27

---

## 1. Design Philosophy

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Performance-First** | Interface fades into background during performance |
| **Minimal Cognitive Load** | Zero learning curve, intuitive gesture mapping |
| **Visual Clarity** | High contrast, large touch targets for stage lighting |
| **Musician-Centric** | Designed by musicians, for musicians |
| **Emotional Engagement** | Animations that feel alive and responsive |

### Design Tone

> "AirChord should feel less like operating software and more like playing with a real guitarist."

- **Vibrant & Energetic** — Bold colors, high contrast, musical feel
- **Premium Dark** — Cinematic atmosphere, stage-lighting aesthetic
- **Fluid Motion** — Every interaction has purposeful animation
- **Accessible** — Works in bright sunlight and dark stages

---

## 2. Color System

### Primary Palette

| Role | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Primary | `#6366F1` (Indigo 500) | `#818CF8` (Indigo 400) | CTAs, active states, brand |
| Primary Hover | `#4F46E5` (Indigo 600) | `#A5B4FC` (Indigo 300) | Hover states |
| Primary Muted | `rgba(99, 102, 241, 0.15)` | `rgba(129, 140, 248, 0.15)` | Backgrounds, badges |
| Secondary | `#F59E0B` (Amber 500) | `#FBBF24` (Amber 400) | Accent, highlights, stars |
| Secondary Muted | `rgba(245, 158, 11, 0.15)` | `rgba(251, 191, 36, 0.15)` | Backgrounds |
| Success | `#10B981` (Emerald 500) | `#34D399` (Emerald 400) | Success states, hand detected |
| Warning | `#F59E0B` (Amber 500) | `#FBBF24` (Amber 400) | Warnings, low light |
| Error | `#EF4444` (Red 500) | `#F87171` (Red 400) | Errors, critical states |
| CTA (Play) | `#22C55E` (Green 500) | `#4ADE80` (Green 400) | Play/record buttons |

### Neutral Palette

| Role | Light Mode | Dark Mode |
|------|------------|-----------|
| Background | `#F9FAFB` | `#0F0F23` |
| Surface | `#FFFFFF` | `#1E1B4B` |
| Surface Elevated | `#F3F4F6` | `#2D2A5E` |
| Border | `#E5E7EB` | `rgba(255, 255, 255, 0.1)` |
| Text Primary | `#1F2937` | `#F8FAFC` |
| Text Secondary | `#6B7280` | `#9CA3AF` |
| Text Muted | `#9CA3AF` | `#6B7280` |

### Audio-Specific Colors

| Element | Color | Usage |
|---------|-------|-------|
| Chord Active | `#818CF8` (Indigo 400) | Active chord glow |
| Chord Inactive | `rgba(255, 255, 255, 0.2)` | Inactive chord |
| String Vibrating | `#22C55E` (Green 500) | String animation |
| String Silent | `rgba(255, 255, 255, 0.3)` | Resting string |
| Waveform | `#818CF8` → `#22C55E` | Audio level gradient |
| Metronome Beat | `#F59E0B` (Amber 500) | Beat indicator |

---

## 3. Typography

### Font Stack

| Usage | Font | Import |
|-------|------|--------|
| **Headings** | Righteous | `https://fonts.google.com/share?selection.family=Righteous` |
| **Body** | Poppins (300-700) | `https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700` |

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Righteous&display=swap');

:root {
  --font-heading: 'Righteous', cursive;
  --font-body: 'Poppins', sans-serif;
}
```

### Type Scale

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Display | 48px | 700 | 1.1 | Splash screen, hero |
| H1 | 32px | 700 | 1.2 | Page titles |
| H2 | 24px | 600 | 1.3 | Section headers |
| H3 | 20px | 600 | 1.4 | Card titles |
| Body Large | 18px | 400 | 1.5 | Important body text |
| Body | 16px | 400 | 1.5 | Default body text |
| Body Small | 14px | 400 | 1.5 | Metadata, captions |
| Caption | 12px | 500 | 1.4 | Labels, badges |
| Micro | 10px | 500 | 1.3 | Timestamps |

### Chord Display Type

```css
.chord-display {
  font-family: var(--font-heading);
  font-size: 80px;
  font-weight: 700;
  text-shadow: 0 0 40px rgba(99, 102, 241, 0.9);
}
```

---

## 4. Spacing System (8px Grid)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Micro gaps |
| `--space-2` | 8px | Tight spacing |
| `--space-3` | 12px | Small gaps |
| `--space-4` | 16px | Default spacing |
| `--space-5` | 20px | Medium spacing |
| `--space-6` | 24px | Large spacing |
| `--space-8` | 32px | Section gaps |
| `--space-10` | 40px | Page margins |
| `--space-12` | 48px | Large sections |
| `--space-16` | 64px | Hero spacing |

---

## 5. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Small elements |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, modals |
| `--radius-xl` | 16px | Large cards |
| `--radius-2xl` | 24px | Bottom sheets |
| `--radius-full` | 9999px | Pills, circles |

---

## 6. Shadows & Elevation

| Level | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| Shadow SM | `0 1px 2px rgba(0,0,0,0.05)` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle lift |
| Shadow MD | `0 4px 6px rgba(0,0,0,0.1)` | `0 4px 6px rgba(0,0,0,0.4)` | Cards |
| Shadow LG | `0 10px 15px rgba(0,0,0,0.1)` | `0 10px 15px rgba(0,0,0,0.5)` | Modals |
| Shadow XL | `0 20px 25px rgba(0,0,0,0.15)` | `0 20px 25px rgba(0,0,0,0.6)` | Floating elements |
| Shadow Glow | `0 0 40px rgba(99,102,241,0.4)` | `0 0 40px rgba(129,140,248,0.3)` | Active chord |

---

## 7. Glassmorphism

```css
.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Light mode variant */
.glass-light {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

---

## 8. Component Library

### Buttons

| Variant | Style | Usage |
|---------|-------|-------|
| Primary | Filled `#6366F1`, white text | Main CTAs |
| Secondary | Outline `#6366F1`, transparent bg | Secondary actions |
| Ghost | Text only, no bg | Tertiary actions |
| Danger | Filled `#EF4444`, white text | Destructive actions |
| Play | Filled `#22C55E`, white text, circle | Record/play button |

**Touch Target:** Minimum 44x44px
**Border Radius:** 8px (default), 9999px (pill)

### Cards

| Variant | Style | Usage |
|---------|-------|-------|
| Elevation 1 | `shadow-sm`, `bg-surface` | List items |
| Elevation 2 | `shadow-md`, `bg-surface` | Cards |
| Elevation 3 | `shadow-lg`, `bg-surface-elevated` | Modals |
| Glass | Glassmorphism | Over camera view |

### Bottom Navigation

```
┌──────────────────────────────────────────────┐
│  🏠        🎸        🎤        📚        👤  │
│  Home    Play     Record    Library   Me     │
│  ●                                        │
└──────────────────────────────────────────────┘

- Height: 64px
- Background: rgba(15, 15, 35, 0.95) + blur(12px)
- Active: Indigo indicator dot + filled icon
- Inactive: Gray icon
```

### Chord Display

```
┌─────────────────────────────┐
│                             │
│         ┌─────┐             │
│         │  C  │  ← 80px    │
│         └─────┘             │
│     3 fingers               │
│                             │
│   ✊ ☝️ ✌️ 🤟 🖐️ ✋         │
│   0  1  2  3  4  5          │
└─────────────────────────────┘
```

### Song Timeline

```
♪───────────────────────────────────── ♪
C ────── G ────── Am ────── F ──────
         ▲
    Current Beat (pulsing dot)
```

### Profile Selector

```
┌──────────────────────────────────┐
│ [Classic] [Worship] [Bollywood] [Blues] │
└──────────────────────────────────┘

- Active: Indigo border + filled bg
- Inactive: White border + transparent bg
- Scrollable horizontal
```

---

## 9. Icon System

### Library: Lucide React (or Heroicons SVG)

**No emojis in UI.** Replace all emoji icons with SVG.

| Icon | Name | Usage |
|------|------|-------|
| Home | `home` | Bottom nav |
| Guitar | `music` | Play mode |
| Record | `circle` (filled red) | Record mode |
| Library | `book-open` | Song library |
| Profile | `user` | Profile/Me |
| Settings | `settings` | Settings |
| Back | `arrow-left` | Navigation |
| Close | `x` | Modal close |
| Check | `check` | Success |
| Warning | `alert-triangle` | Warnings |
| Search | `search` | Search bar |
| Filter | `sliders-horizontal` | Filters |
| Play | `play` | Play button |
| Pause | `pause` | Pause button |
| Stop | `square` | Stop button |
| Metronome | `disc` | Metronome toggle |
| Tempo | `gauge` | Tempo control |
| Capo | `layers` | Capo selector |
| Star | `star` | Ratings |
| Share | `share-2` | Share actions |
| Download | `download` | Export |
| Camera | `camera` | Camera status |
| Microphone | `mic` | Audio input |

---

## 10. Animation & Motion

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 100-150ms | `ease-in-out` | Hover, focus |
| Standard | 200-300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Transitions |
| Page | 500-800ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Page transitions |
| Spring | 500-800ms | `spring(1, 80, 10)` | Bouncy elements |

### Micro-Interactions

| Trigger | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Chord Detection | Pulse Glow | 200ms | ease-out |
| Strum Initiation | Wave Ripple | 150ms | cubic-bezier(0.4,0,0.2,1) |
| Recording Start | Ring Effect | 300ms | ease-out |
| Gesture Recognition | Hand Highlight | 100ms | ease-in-out |
| Error State | Shake | 400ms | linear |
| Success State | Checkmark Draw | 500ms | ease-out |
| Button Press | Scale 0.95 → 1 | 150ms | ease-out |
| Card Enter | Fade + Slide Up | 300ms | cubic-bezier(0.4,0,0.2,1) |
| Bottom Sheet | Slide Up | 300ms | cubic-bezier(0.4,0,0.2,1) |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Responsive Breakpoints

| Device | Width | Layout Strategy |
|--------|-------|-----------------|
| Mobile (Portrait) | ≤ 480px | Single column, floating controls |
| Mobile (Landscape) | 481-767px | Single column, optimized |
| Tablet (Portrait) | 768-1023px | Split view possible |
| Tablet (Landscape) | 1024-1279px | Split view (chords + controls) |
| Desktop | ≥ 1280px | Multi-panel, advanced controls |
| TV Mode | ≥ 1920px | Full-screen, remote navigation |

---

## 12. Z-Index Scale

| Level | Value | Usage |
|-------|-------|-------|
| Base | 1 | Default content |
| Overlay | 10 | Camera overlay |
| Hand Overlay | 40 | Hand landmarks |
| Chord Display | 50 | Chord name |
| Profile Selector | 50 | Profile buttons |
| Debug Panel | 100 | Debug info |
| Status Overlay | 200 | Loading states |
| Calibration | 300 | Calibration screen |
| Modal | 400 | Modals, dialogs |
| Toast | 500 | Toast notifications |

---

## 13. Accessibility

### Color Contrast

| Element | Ratio Required | Actual |
|---------|---------------|--------|
| Body Text | 4.5:1 | 7.0:1 ✓ |
| Large Text | 3:1 | 5.5:1 ✓ |
| UI Components | 3:1 | 4.5:1 ✓ |

### Focus States

```css
:focus-visible {
  outline: 3px solid #6366F1;
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.3);
}
```

### Screen Reader

- All images have alt text
- Form inputs have labels
- ARIA landmarks for navigation
- Live regions for dynamic content

### Keyboard Navigation

- Tab order matches visual order
- All actions accessible via keyboard
- Escape closes modals
- Arrow keys navigate menus

---

## 14. Anti-Patterns to Avoid

| Pattern | Why | Alternative |
|---------|-----|-------------|
| Emoji icons | Inconsistent rendering, accessibility | SVG icons (Lucide) |
| Flat design without depth | Boring, no hierarchy | Elevation + shadows |
| Text-heavy pages | Overwhelming | Cards + icons + whitespace |
| Scale transforms on hover | Layout shift | Color/opacity changes |
| No loading states | Poor UX | Skeletons / spinners |
| Fixed layouts | Broken on mobile | Responsive grid |
| `!important` | Specificity wars | Proper CSS architecture |
| Inline styles everywhere | Hard to maintain | CSS variables + classes |

---

## 15. CSS Custom Properties

```css
:root {
  /* Colors */
  --color-primary: #6366F1;
  --color-primary-hover: #4F46E5;
  --color-primary-muted: rgba(99, 102, 241, 0.15);
  --color-secondary: #F59E0B;
  --color-cta: #22C55E;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* Dark Mode (default) */
  --bg: #0F0F23;
  --surface: #1E1B4B;
  --surface-elevated: #2D2A5E;
  --border: rgba(255, 255, 255, 0.1);
  --text: #F8FAFC;
  --text-secondary: #9CA3AF;
  --text-muted: #6B7280;

  /* Typography */
  --font-heading: 'Righteous', cursive;
  --font-body: 'Poppins', sans-serif;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 40px rgba(99, 102, 241, 0.4);

  /* Transitions */
  --transition-fast: 100ms ease-in-out;
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 16. Implementation Notes

### React + Tailwind CSS

```bash
# Install
npm install lucide-react framer-motion clsx tailwind-merge

# Tailwind Config
plugins: [
  require('@tailwindcss/forms'),
]
```

### Component Naming

```
Button, Card, Modal, BottomSheet, Toast,
ChordDisplay, SongTimeline, ProfileSelector,
CameraView, HandOverlay, Waveform, Metronome
```

---

*End of Design System Document*
