# AirChord Component Specifications

**Phase B: Component Library**
**Version:** 1.0.0

---

## 1. Button Components

### Primary Button
```tsx
<button className="btn-primary">
  Get Started
</button>
```
- **Background:** `#6366F1` (primary)
- **Text:** `#FFFFFF`
- **Padding:** `16px 32px`
- **Border Radius:** `12px`
- **Font:** Poppins 600 16px
- **Min Height:** `56px`
- **Touch Target:** `44px` minimum
- **Hover:** `#4F46E5` (primary-hover)
- **Active:** `#4338CA` (primary-700)
- **Transition:** `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`

### Secondary Button
```tsx
<button className="btn-secondary">
  Skip
</button>
```
- **Background:** transparent
- **Border:** `1px solid rgba(255, 255, 255, 0.1)`
- **Text:** `#9CA3AF` (text-secondary)
- **Padding:** `12px 24px`
- **Border Radius:** `8px`

### Ghost Button
```tsx
<button className="btn-ghost">
  Cancel
</button>
```
- **Background:** transparent
- **Text:** `#9CA3AF`
- **Padding:** `8px 16px`
- **Border:** none

### Play/Record Button
```tsx
<div className="record-btn">
  <div className="inner"></div>
</div>
```
- **Size:** `56px × 56px`
- **Background:** `#EF4444` (error/red)
- **Border:** `4px solid rgba(239, 68, 68, 0.3)`
- **Inner:** `20px × 20px` white square (recording) or circle (play)
- **Shadow:** `0 0 30px rgba(239, 68, 68, 0.3)`

---

## 2. Card Components

### Mode Card (Home)
```tsx
<div className="mode-card">
  <div className="icon-circle">🎸</div>
  <div className="label">Free Play</div>
</div>
```
- **Background:** `#1E1B4B` (surface)
- **Border:** `1px solid rgba(255, 255, 255, 0.1)`
- **Border Radius:** `16px`
- **Padding:** `20px`
- **Icon Circle:** `56px × 56px`, background `rgba(99, 102, 241, 0.15)`
- **Hover:** Border color `#6366F1`, `transform: translateY(-2px)`

### Song Card
```tsx
<div className="song-card">
  <div className="cover">🎵</div>
  <div className="song-info">
    <div className="song-title">Wonderwall</div>
    <div className="song-artist">Oasis</div>
  </div>
  <div className="song-meta">
    <div className="difficulty">★★★☆☆</div>
    <div className="key">Em</div>
  </div>
</div>
```
- **Background:** `#1E1B4B`
- **Border:** `1px solid rgba(255, 255, 255, 0.1)`
- **Border Radius:** `12px`
- **Padding:** `14px`
- **Cover:** `48px × 48px`, border-radius `8px`
- **Hover:** Border color `#6366F1`

### Practice Mode Card
```tsx
<div className="practice-mode-card">
  <div className="icon">🎯</div>
  <div className="info">
    <h3>Chord Trainer</h3>
    <p>Practice individual chords</p>
  </div>
  <div className="arrow">→</div>
</div>
```
- **Background:** `#1E1B4B`
- **Border:** `1px solid rgba(255, 255, 255, 0.1)`
- **Border Radius:** `16px`
- **Padding:** `16px`
- **Icon:** `48px × 48px`, border-radius `12px`

### Settings Card
```tsx
<div className="settings-card">
  <div className="settings-item">
    <div className="item-left">
      <div className="item-icon">🎨</div>
      <span className="item-label">Theme</span>
    </div>
    <span className="item-value">Dark</span>
  </div>
</div>
```
- **Background:** `#1E1B4B`
- **Border:** `1px solid rgba(255, 255, 255, 0.1)`
- **Border Radius:** `12px`
- **Item Padding:** `14px 16px`
- **Item Border:** `1px solid rgba(255, 255, 255, 0.1)` (bottom only)

---

## 3. Navigation Components

### Bottom Navigation
```tsx
<nav className="bottom-nav">
  <div className="bottom-nav-item active">
    <div className="icon">🏠</div>
    <span>Home</span>
    <div className="indicator"></div>
  </div>
  {/* ... */}
</nav>
```
- **Height:** `83px` (including safe area)
- **Background:** `rgba(15, 15, 35, 0.95)` + `backdrop-filter: blur(12px)`
- **Border Top:** `1px solid rgba(255, 255, 255, 0.1)`
- **Item Width:** flex 1
- **Icon Size:** `24px × 24px`
- **Label Size:** `10px`
- **Active Color:** `#6366F1`
- **Inactive Color:** `#6B7280`
- **Active Indicator:** `4px × 4px` circle below icon

### Tab Bar (Horizontal)
```tsx
<div className="filter-chips">
  <div className="filter-chip active">All</div>
  <div className="filter-chip">Pop</div>
  <div className="filter-chip">Rock</div>
</div>
```
- **Height:** `32px`
- **Padding:** `6px 14px`
- **Border Radius:** `24px`
- **Active Background:** `#6366F1`
- **Inactive Background:** `#1E1B4B`
- **Font:** Poppins 12px

---

## 4. Input Components

### Search Bar
```tsx
<div className="search-bar">
  <span>🔍</span>
  <input type="text" placeholder="Search songs...">
</div>
```
- **Background:** `#1E1B4B`
- **Border:** `1px solid rgba(255, 255, 255, 0.1)`
- **Border Radius:** `12px`
- **Padding:** `10px 16px`
- **Font:** Poppins 14px
- **Placeholder Color:** `#6B7280`

### Toggle Switch
```tsx
<div className="toggle active"></div>
```
- **Width:** `44px`
- **Height:** `24px`
- **Border Radius:** `12px`
- **Inactive Background:** `rgba(255, 255, 255, 0.1)`
- **Active Background:** `#6366F1`
- **Thumb:** `20px × 20px` white circle
- **Thumb Position:** `2px` from edge
- **Transition:** `transform 0.2s`

### Slider
```tsx
<div className="slider">
  <div className="slider-track">
    <div className="slider-progress"></div>
    <div className="slider-thumb"></div>
  </div>
</div>
```
- **Track Height:** `4px`
- **Track Background:** `rgba(255, 255, 255, 0.1)`
- **Progress Background:** `#6366F1`
- **Thumb:** `16px × 16px` white circle

---

## 5. Display Components

### Chord Display
```tsx
<div className="chord-display">
  <div className="current-chord">C</div>
  <div className="finger-count">3 fingers</div>
</div>
```
- **Font:** Righteous 72px
- **Color:** `#6366F1`
- **Text Shadow:** `0 0 40px rgba(99, 102, 241, 0.5)`
- **Animation:** `pulse-glow 2s ease-in-out infinite`

### Status Bar
```tsx
<div className="status-bar">
  <span className="time">9:41</span>
  <span className="icons">📶 🔋</span>
</div>
```
- **Height:** `44px`
- **Font:** Poppins 600 15px
- **Padding:** `0 24px`

### Loading Indicator
```tsx
<div className="splash-loader"></div>
```
- **Width:** `40px`
- **Height:** `4px`
- **Background:** `rgba(255, 255, 255, 0.1)`
- **Progress:** `#6366F1`
- **Animation:** `loading 1.5s ease-in-out infinite`

---

## 6. Overlay Components

### Camera Area
```tsx
<div className="camera-area">
  <div className="camera-placeholder">Camera Feed</div>
  <div className="hand-overlay-placeholder">
    <div className="hand-skeleton">✋</div>
  </div>
</div>
```
- **Height:** `50%` of viewport
- **Background:** `linear-gradient(180deg, #1a1a2e, #0a0a15)`
- **Hand Overlay:** `position: absolute`, `z-index: 40`
- **Landmarks SVG:** `stroke: rgba(99, 102, 241, 0.6)`, `strokeWidth: 2`

### Waveform Display
```tsx
<div className="waveform-area">
  <div className="waveform-bars">
    <div className="waveform-bar"></div>
    {/* ... */}
  </div>
</div>
```
- **Height:** `80px`
- **Background:** `#1E1B4B`
- **Bar Width:** `4px`
- **Bar Gap:** `3px`
- **Bar Gradient:** `linear-gradient(to top, #6366F1, #22C55E)`
- **Animation:** `waveform 1s ease-in-out infinite`

---

## 7. Feedback Components

### Toast Notification
```tsx
<div className="toast">
  <span className="toast-icon">✓</span>
  <span className="toast-message">Chord saved!</span>
</div>
```
- **Position:** `bottom: 100px`, centered
- **Background:** `rgba(16, 185, 129, 0.9)` (success)
- **Border Radius:** `12px`
- **Padding:** `12px 20px`
- **Animation:** `slideIn 0.3s ease-out`

### Error Banner
```tsx
<div className="error-banner">
  <span>⚠️</span>
  <span>Camera access denied</span>
  <button>Enable in Settings</button>
</div>
```
- **Background:** `rgba(239, 68, 68, 0.15)`
- **Border:** `1px solid #EF4444`
- **Border Radius:** `8px`
- **Text:** `#F87171`

---

## 8. Layout Components

### Page Layout
```tsx
<div className="page">
  <div className="status-bar">...</div>
  <div className="content">
    {/* Page content */}
  </div>
  <div className="bottom-nav">...</div>
</div>
```
- **Status Bar:** `44px` fixed top
- **Bottom Nav:** `83px` fixed bottom
- **Content:** `flex: 1`, `overflow-y: auto`
- **Safe Area:** `env(safe-area-inset-bottom)` for notch devices

### Modal
```tsx
<div className="modal-overlay">
  <div className="modal">
    <div className="modal-header">
      <h3>Title</h3>
      <button className="close">×</button>
    </div>
    <div className="modal-body">Content</div>
    <div className="modal-footer">Actions</div>
  </div>
</div>
```
- **Overlay:** `rgba(0, 0, 0, 0.6)`
- **Modal Background:** `#1E1B4B`
- **Border Radius:** `24px` (bottom sheet) or `16px` (center)
- **Max Height:** `80vh`
- **Animation:** `slideUp 0.3s ease-out`

### Bottom Sheet
```tsx
<div className="bottom-sheet-overlay">
  <div className="bottom-sheet">
    <div className="handle"></div>
    <div className="sheet-content">Content</div>
  </div>
</div>
```
- **Handle:** `40px × 4px` centered, `rgba(255, 255, 255, 0.2)`
- **Border Radius:** `24px 24px 0 0`
- **Animation:** `slideUp 0.3s ease-out`

---

## 9. Chart Components

### Bar Chart (Profile)
```tsx
<div className="chart-bars">
  <div className="chart-bar-group">
    <div className="chart-bar" style={{ height: '60px' }}></div>
    <div className="chart-bar-label">M</div>
  </div>
  {/* ... */}
</div>
```
- **Bar Width:** flex 1
- **Bar Background:** `#6366F1`
- **Bar Border Radius:** `4px 4px 0 0`
- **Min Height:** `4px`
- **Label Font:** `10px`
- **Label Color:** `#6B7280`

### Timeline
```tsx
<div className="timeline">
  <div className="timeline-track">
    <div className="timeline-progress"></div>
    <div className="timeline-beat"></div>
  </div>
  <div className="chord-timeline">
    <span className="chord active">C</span>
    <span className="chord">G</span>
    <span className="chord">Am</span>
  </div>
</div>
```
- **Track Height:** `4px`
- **Track Background:** `rgba(255, 255, 255, 0.1)`
- **Progress Background:** `#6366F1`
- **Beat Dot:** `12px × 12px`, `#6366F1`, `box-shadow: 0 0 10px rgba(99, 102, 241, 0.5)`
- **Chord Labels:** `12px`, `#6B7280` (inactive), `#6366F1` (active)

---

## 10. Icon Components

### Icon System
```tsx
// Using Lucide React
import { Home, Music, Mic, BookOpen, User, Settings, ArrowLeft, X, Check, AlertTriangle, Search, Play, Pause, Square, Camera, Star, Share2, Download, Gauge, Layers, Disc } from 'lucide-react';

// Icon sizes
<Icon size={24} /> // Default
<Icon size={20} /> // Small
<Icon size={16} /> // Extra small
<Icon size={32} /> // Large

// Icon colors
<Icon color="currentColor" /> // Inherit
<Icon color="#6366F1" /> // Primary
<Icon color="#9CA3AF" /> // Muted
```

---

*End of Component Specifications*
