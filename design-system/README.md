# AirChord Design System — Phase B

**Version:** 1.0.0
**Last Updated:** 2026-07-27

---

## 📁 Files

| File | Description |
|------|-------------|
| `MASTER.md` | Complete design system (colors, typography, spacing, components) |
| `COMPONENTS.md` | Component specifications for all UI elements |
| `wireframes.html` | Interactive wireframes for all 12 screens |

---

## 🎨 Design Tokens

### Colors
- **Primary:** `#6366F1` (Indigo 500)
- **Secondary:** `#F59E0B` (Amber 500)
- **CTA:** `#22C55E` (Green 500)
- **Background:** `#0F0F23` (Dark)
- **Surface:** `#1E1B4B`

### Typography
- **Headings:** Righteous
- **Body:** Poppins

### Spacing
- 8px grid system
- Tokens: `--space-1` (4px) to `--space-16` (64px)

---

## 📱 Wireframe Screens

1. **Splash Screen** — Logo, tagline, loading animation
2. **Onboarding** — 3-step intro with illustrations
3. **Permission Request** — Camera/mic access
4. **Home Dashboard** — Mode grid, daily challenge, recent session
5. **Free Play** — Camera, chord display, controls
6. **Practice Mode** — 5 practice types
7. **Recording Studio** — Camera, waveform, controls
8. **Song Library** — Search, filter, song list
9. **Song Detail** — Cover, chords, actions
10. **Settings** — All app settings
11. **Profile** — Stats, achievements, practice chart
12. **Help** — FAQ, search, contact

---

## 🚀 Next Steps

### Figma Design (Manual)
1. Create Figma project
2. Import design tokens from `MASTER.md`
3. Build component library
4. Design high-fidelity mockups for all 12 screens
5. Create interactive prototype
6. Export design specs for development

### Design System Implementation
1. Install Tailwind CSS
2. Configure design tokens in `tailwind.config.js`
3. Install Lucide React for icons
4. Install Framer Motion for animations
5. Build component library in React

---

## 📐 Design Principles

1. **Performance-First** — Interface fades into background during performance
2. **Minimal Cognitive Load** — Zero learning curve
3. **Visual Clarity** — High contrast, large touch targets
4. **Musician-Centric** — Designed by musicians, for musicians
5. **Emotional Engagement** — Animations that feel alive

---

## 🎵 Signature Features

### Dynamic Band
- Sing softly → gentle strumming
- Sing loudly → band builds
- Pause → guitar sustains

### Gesture Profiles
- Classic: Em, Am, G, C, D, F
- Worship: Am, C, G, Em, F, D
- Bollywood: Am, C, G, F, Em, D
- Blues: E, A, B7, Am, D, G

---

*AirChord — Sing Freely. We'll Play the Guitar.*
