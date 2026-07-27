# Complete Folder Structure

## 1. Overview

AirChord uses a monorepo structure with separate frontend and backend packages. The frontend is built with Angular + Capacitor for web and mobile, while the backend runs on Firebase (Cloud Functions, Firestore, Storage).

---

## 2. Root Structure

```
airchord/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy-staging.yml
│   │   └── deploy-production.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
│
├── apps/
│   ├── web/                    # Angular web app
│   └── mobile/                 # Capacitor config (shared with web)
│
├── libs/
│   ├── core/                   # Core library (shared logic)
│   │   ├── src/
│   │   │   ├── audio/          # Audio engine
│   │   │   ├── gesture/        # Gesture recognition
│   │   │   ├── models/         # Data models
│   │   │   ├── services/       # Shared services
│   │   │   └── utils/          # Utility functions
│   │   └── index.ts
│   │
│   ├── ui/                     # UI component library
│   │   ├── src/
│   │   │   ├── components/     # Reusable components
│   │   │   ├── directives/     # Custom directives
│   │   │   ├── pipes/          # Custom pipes
│   │   │   └── styles/         # Shared styles
│   │   └── index.ts
│   │
│   └── firebase/               # Firebase configuration
│       ├── src/
│       │   ├── auth/           # Authentication
│       │   ├── firestore/      # Database rules
│       │   ├── storage/        # Storage rules
│       │   └── functions/      # Cloud Functions
│       └── index.ts
│
├── docs/                       # Documentation
│   ├── PRD.md
│   ├── SRS.md
│   ├── Architecture.md
│   └── ... (20 documents)
│
├── scripts/                    # Build & utility scripts
│   ├── build.sh
│   ├── deploy.sh
│   └── seed.ts
│
├── tools/                      # Dev tools
│   └── schematics/             # React schematics
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .editorconfig
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── firebase.json
├── firestore.rules
├── storage.rules
└── README.md
```

---

## 2.5 Core Engine Structure

The core engine lives in `libs/core/` and is organized by engine, not by feature type:

```
libs/core/src/
├── engines/
│   ├── gesture-engine/
│   │   ├── gesture-classifier.ts
│   │   ├── landmark-processor.ts
│   │   ├── calibration-manager.ts
│   │   ├── gesture-profiles.ts
│   │   └── index.ts
│   │
│   ├── performance-engine/
│   │   ├── performance-orchestrator.ts
│   │   ├── chord-scheduler.ts
│   │   ├── adaptive-tempo.ts
│   │   └── index.ts
│   │
│   ├── audio-engine/
│   │   ├── audio-manager.ts
│   │   ├── sample-loader.ts
│   │   ├── chord-generator.ts
│   │   ├── strumming-engine.ts
│   │   ├── effects-chain.ts
│   │   ├── master-mixer.ts
│   │   ├── dynamic-band.ts
│   │   ├── recorder-node.ts
│   │   ├── export-engine.ts
│   │   └── index.ts
│   │
│   ├── song-engine/
│   │   ├── song-timeline.ts
│   │   ├── song-parser.ts
│   │   ├── song-provider.ts
│   │   ├── lyrics-sync.ts
│   │   └── index.ts
│   │
│   ├── recording-engine/
│   │   ├── voice-capture.ts
│   │   ├── video-capture.ts
│   │   ├── project-format.ts
│   │   ├── audio-mixer.ts
│   │   └── index.ts
│   │
│   ├── ai-engine/
│   │   ├── practice-coach.ts
│   │   ├── adaptive-performance.ts
│   │   ├── mistake-detector.ts
│   │   ├── voice-intensity.ts
│   │   └── index.ts
│   │
│   └── sync-engine/
│       ├── firestore-sync.ts
│       ├── offline-queue.ts
│       ├── conflict-resolution.ts
│       └── index.ts
│
├── plugins/
│   ├── instruments/
│   │   ├── acoustic-guitar.ts
│   │   ├── electric-guitar.ts
│   │   ├── bass-guitar.ts
│   │   ├── ukulele.ts
│   │   ├── piano.ts
│   │   ├── drums.ts
│   │   └── strings.ts
│   │
│   └── instrument-plugin.ts       # Plugin interface
│
├── models/
│   ├── chord.model.ts
│   ├── song.model.ts
│   ├── user.model.ts
│   ├── recording.model.ts
│   ├── gesture.model.ts
│   ├── practice.model.ts
│   └── project.model.ts           # .air project format
│
├── services/
│   ├── api.service.ts
│   ├── storage.service.ts
│   ├── analytics.service.ts
│   └── offline.service.ts
│
├── utils/
│   ├── chord-theory.ts
│   ├── audio-utils.ts
│   ├── date-utils.ts
│   ├── math-utils.ts
│   └── throttle.ts
│
└── index.ts
```

---

## 3. Frontend Structure (apps/web)

```
apps/web/
├── src/
│   ├── main.ts                         # Bootstrap entry
│   ├── index.html                      # Root HTML
│   ├── styles.scss                     # Global styles
│   ├── environments/
│   │   ├── environment.ts              # Dev config
│   │   ├── environment.prod.ts         # Production config
│   │   └── environment.staging.ts      # Staging config
│   │
│   ├── app/
│   │   ├── app.component.ts            # Root component
│   │   ├── app.component.html          # Root template
│   │   ├── app.component.scss          # Root styles
│   │   ├── app.routes.ts               # Route definitions
│   │   ├── app.config.ts               # App configuration
│   │   │
│   │   ├── core/                       # Core module
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── unsaved.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── error.interceptor.ts
│   │   │   │   └── loading.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── audio.service.ts
│   │   │   │   ├── gesture.service.ts
│   │   │   │   ├── camera.service.ts
│   │   │   │   ├── recording.service.ts
│   │   │   │   ├── storage.service.ts
│   │   │   │   ├── analytics.service.ts
│   │   │   │   └── notification.service.ts
│   │   │   └── core.module.ts
│   │   │
│   │   ├── features/                   # Feature modules
│   │   │   ├── home/
│   │   │   │   ├── home.component.ts
│   │   │   │   ├── home.component.html
│   │   │   │   ├── home.component.scss
│   │   │   │   └── home.routes.ts
│   │   │   │
│   │   │   ├── free-play/
│   │   │   │   ├── free-play.component.ts
│   │   │   │   ├── free-play.component.html
│   │   │   │   ├── free-play.component.scss
│   │   │   │   ├── components/
│   │   │   │   │   ├── camera-view/
│   │   │   │   │   │   ├── camera-view.component.ts
│   │   │   │   │   │   ├── camera-view.component.html
│   │   │   │   │   │   └── camera-view.component.scss
│   │   │   │   │   ├── hand-overlay/
│   │   │   │   │   ├── chord-display/
│   │   │   │   │   ├── strum-controls/
│   │   │   │   │   └── mixer-panel/
│   │   │   │   ├── stores/
│   │   │   │   │   ├── gesture.store.ts
│   │   │   │   │   ├── audio.store.ts
│   │   │   │   │   └── session.store.ts
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── use-gesture.ts
│   │   │   │   │   ├── use-audio.ts
│   │   │   │   │   └── use-camera.ts
│   │   │   │   └── free-play.routes.ts
│   │   │   │
│   │   │   ├── practice/
│   │   │   │   ├── practice.component.ts
│   │   │   │   ├── practice.component.html
│   │   │   │   ├── practice.component.scss
│   │   │   │   ├── components/
│   │   │   │   │   ├── metronome/
│   │   │   │   │   ├── chord-trainer/
│   │   │   │   │   ├── gesture-trainer/
│   │   │   │   │   ├── score-board/
│   │   │   │   │   ├── tempo-control/
│   │   │   │   │   └── progress-chart/
│   │   │   │   ├── services/
│   │   │   │   │   ├── practice.service.ts
│   │   │   │   │   └── scoring.service.ts
│   │   │   │   └── practice.routes.ts
│   │   │   │
│   │   │   ├── recording/
│   │   │   │   ├── recording.component.ts
│   │   │   │   ├── recording.component.html
│   │   │   │   ├── recording.component.scss
│   │   │   │   ├── components/
│   │   │   │   │   ├── record-button/
│   │   │   │   │   ├── mixer-view/
│   │   │   │   │   ├── timeline/
│   │   │   │   │   ├── export-modal/
│   │   │   │   │   └── waveform/
│   │   │   │   ├── services/
│   │   │   │   │   ├── recorder.service.ts
│   │   │   │   │   └── export.service.ts
│   │   │   │   └── recording.routes.ts
│   │   │   │
│   │   │   ├── library/
│   │   │   │   ├── library.component.ts
│   │   │   │   ├── library.component.html
│   │   │   │   ├── library.component.scss
│   │   │   │   ├── components/
│   │   │   │   │   ├── song-card/
│   │   │   │   │   ├── search-bar/
│   │   │   │   │   ├── filter-panel/
│   │   │   │   │   └── song-detail/
│   │   │   │   ├── services/
│   │   │   │   │   └── song.service.ts
│   │   │   │   └── library.routes.ts
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── settings.component.ts
│   │   │   │   ├── settings.component.html
│   │   │   │   ├── settings.component.scss
│   │   │   │   ├── components/
│   │   │   │   │   ├── theme-selector/
│   │   │   │   │   ├── gesture-settings/
│   │   │   │   │   ├── audio-settings/
│   │   │   │   │   ├── accessibility/
│   │   │   │   │   └── account/
│   │   │   │   └── settings.routes.ts
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   ├── profile.component.ts
│   │   │   │   ├── profile.component.html
│   │   │   │   ├── profile.component.scss
│   │   │   │   └── profile.routes.ts
│   │   │   │
│   │   │   └── auth/
│   │   │       ├── login/
│   │   │       ├── register/
│   │   │       ├── forgot-password/
│   │   │       └── auth.routes.ts
│   │   │
│   │   ├── shared/                     # Shared module
│   │   │   ├── components/
│   │   │   │   ├── button/
│   │   │   │   ├── card/
│   │   │   │   ├── modal/
│   │   │   │   ├── slider/
│   │   │   │   ├── toggle/
│   │   │   │   ├── badge/
│   │   │   │   ├── avatar/
│   │   │   │   ├── skeleton/
│   │   │   │   └── toast/
│   │   │   ├── directives/
│   │   │   │   ├── click-outside.ts
│   │   │   │   ├── long-press.ts
│   │   │   │   └── swipe.ts
│   │   │   ├── pipes/
│   │   │   │   ├── duration.pipe.ts
│   │   │   │   ├── truncate.pipe.ts
│   │   │   │   └── chord-name.pipe.ts
│   │   │   └── shared.module.ts
│   │   │
│   │   └── layouts/                    # Layout components
│   │       ├── main-layout/
│   │       │   ├── main-layout.component.ts
│   │       │   ├── main-layout.component.html
│   │       │   ├── main-layout.component.scss
│   │       │   └── components/
│   │       │       ├── header/
│   │       │       ├── sidebar/
│   │       │       └── bottom-nav/
│   │       ├── auth-layout/
│   │       └── blank-layout/
│   │
│   ├── assets/
│   │   ├── icons/
│   │   ├── images/
│   │   ├── audio/
│   │   │   ├── guitar/
│   │   │   │   ├── acoustic/
│   │   │   │   ├── electric/
│   │   │   │   └── bass/
│   │   │   ├── ukulele/
│   │   │   ├── piano/
│   │   │   ├── drums/
│   │   │   └── metronome/
│   │   ├── models/
│   │   │   ├── hand/
│   │   │   └── guitar/
│   │   └── fonts/
│   │
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   ├── _animations.scss
│   │   ├── _typography.scss
│   │   └── _utilities.scss
│   │
│   └── types/
│       ├── audio.d.ts
│       ├── gesture.d.ts
│       ├── song.d.ts
│       ├── user.d.ts
│       └── recording.d.ts
│
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── manifest.json
│   └── sw.js
│
├── karma.conf.js
├── tsconfig.spec.json
└── tsconfig.app.json
```

---

## 4. Backend Structure (libs/firebase)

```
libs/firebase/
├── src/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.guard.ts
│   │   └── auth.config.ts
│   │
│   ├── firestore/
│   │   ├── firestore.service.ts
│   │   ├── collections/
│   │   │   ├── users.collection.ts
│   │   │   ├── songs.collection.ts
│   │   │   ├── recordings.collection.ts
│   │   │   ├── practice-sessions.collection.ts
│   │   │   └── calibrations.collection.ts
│   │   └── queries/
│   │       ├── song.queries.ts
│   │       └── user.queries.ts
│   │
│   ├── storage/
│   │   ├── storage.service.ts
│   │   └── upload.helper.ts
│   │
│   └── functions/
│       ├── src/
│       │   ├── index.ts
│       │   ├── auth/
│       │   │   ├── onCreateUser.ts
│       │   │   └── onDeleteUser.ts
│       │   ├── recordings/
│       │   │   ├── processRecording.ts
│       │   │   └── deleteRecording.ts
│       │   └── analytics/
│       │       └── aggregateStats.ts
│       ├── package.json
│       └── tsconfig.json
│
├── firestore.rules
├── storage.rules
└── index.ts
```

---

## 5. Core Library (libs/core)

```
libs/core/
├── src/
│   ├── audio/
│   │   ├── audio-engine.ts
│   │   ├── guitar-synth.ts
│   │   ├── strum-engine.ts
│   │   ├── metronome.ts
│   │   ├── effects/
│   │   │   ├── reverb.ts
│   │   │   ├── delay.ts
│   │   │   └── compressor.ts
│   │   ├── instruments/
│   │   │   ├── acoustic-guitar.ts
│   │   │   ├── electric-guitar.ts
│   │   │   ├── bass-guitar.ts
│   │   │   ├── ukulele.ts
│   │   │   ├── piano.ts
│   │   │   └── drums.ts
│   │   └── index.ts
│   │
│   ├── gesture/
│   │   ├── gesture-classifier.ts
│   │   ├── landmark-processor.ts
│   │   ├── calibration-manager.ts
│   │   ├── gesture-mapper.ts
│   │   ├── chord-map.ts
│   │   └── index.ts
│   │
│   ├── models/
│   │   ├── chord.model.ts
│   │   ├── song.model.ts
│   │   ├── user.model.ts
│   │   ├── recording.model.ts
│   │   ├── gesture.model.ts
│   │   └── practice.model.ts
│   │
│   ├── services/
│   │   ├── api.service.ts
│   │   ├── storage.service.ts
│   │   ├── analytics.service.ts
│   │   └── offline.service.ts
│   │
│   ├── utils/
│   │   ├── chord-theory.ts
│   │   ├── audio-utils.ts
│   │   ├── date-utils.ts
│   │   ├── math-utils.ts
│   │   └── throttle.ts
│   │
│   └── index.ts
│
├── tsconfig.lib.json
├── tsconfig.spec.json
└── package.json
```

---

## 6. Mobile Structure (apps/mobile)

```
apps/mobile/
├── capacitor.config.ts
├── android/
│   ├── app/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── AndroidManifest.xml
│   │   │   │   └── java/
│   │   │   └── debug/
│   │   └── build.gradle
│   ├── build.gradle
│   └── gradle.properties
├── ios/
│   ├── App/
│   │   ├── App/
│   │   │   ├── AppDelegate.swift
│   │   │   ├── Info.plist
│   │   │   └── Assets.xcassets
│   │   ├── App.xcodeproj
│   │   └── Podfile
│   └── App/
└── resources/
    ├── android/
    │   ├── icon.png
    │   ├── splash.png
    │   └── adaptive-icon.png
    └── ios/
        ├── icon.png
        └── splash.png
```

---

## 7. Scripts

```
scripts/
├── build.sh                    # Build all packages
├── deploy.sh                   # Deploy to Firebase
├── seed.ts                     # Seed Firestore database
├── generate-icons.ts           # Generate app icons
├── check-bundle-size.ts        # Bundle size analysis
└── analyze-audio-latency.ts    # Audio performance testing
```

---

## 8. Configuration Files

```
├── angular.json                # Angular workspace config
├── nx.json                     # Nx monorepo config
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript base config
├── tsconfig.paths.json         # Path aliases
├── .eslintrc.json              # ESLint config
├── .prettierrc                 # Prettier config
├── .editorconfig               # Editor config
├── .gitignore                  # Git ignore
├── firebase.json               # Firebase hosting config
├── firestore.rules             # Firestore security rules
├── storage.rules               # Storage security rules
├── vitest.config.ts            # Test config
├── playwright.config.ts        # E2E test config
└── lighthouserc.json           # Lighthouse config
```

---

## 9. Key Path Aliases

```typescript
// tsconfig.paths.json
{
  "compilerOptions": {
    "paths": {
      "@airchord/core": ["libs/core/src"],
      "@airchord/ui": ["libs/ui/src"],
      "@airchord/firebase": ["libs/firebase/src"],
      "@airchord/core/*": ["libs/core/src/*"],
      "@airchord/ui/*": ["libs/ui/src/*"],
      "@airchord/firebase/*": ["libs/firebase/src/*"]
    }
  }
}
```

---

## 10. File Count Summary

| Directory | Estimated Files |
|-----------|-----------------|
| apps/web/src | ~200 |
| libs/core/src | ~50 |
| libs/ui/src | ~40 |
| libs/firebase/src | ~30 |
| docs/ | 20 |
| scripts/ | 10 |
| configs/ | 15 |
| **Total** | **~365** |
