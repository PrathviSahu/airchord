/**
 * Gesture Engine — detects hand gestures and maps to chords
 * Uses profiles for different chord mappings
 */

import { type GestureProfile, getChordForFingers } from './GestureProfiles'

export interface GestureResult {
  gesture: string
  chord: string
  confidence: number
  fingerCount: number
  profileId: string
}

// Smoothing state
interface SmoothingState {
  lastFingerCount: number
  lastTriggerTime: number
  holdCount: number
}

const HOLD_FRAMES = 6    // ~200ms at 30fps — eliminates mid-transition flicker
const DEBOUNCE_MS = 100   // shorter debounce so intentional fast changes still work

const FINGER_GESTURE_NAMES: Record<number, string> = {
  0: 'Fist (0 fingers)',
  1: 'One Finger',
  2: 'Two Fingers',
  3: 'Three Fingers',
  4: 'Four Fingers',
  5: 'Open Palm (5)',
}

export class GestureEngine {
  private profile: GestureProfile
  private state: SmoothingState = {
    lastFingerCount: -1,
    lastTriggerTime: 0,
    holdCount: 0,
  }
  private onChordChange?: (result: GestureResult) => void

  constructor(profile: GestureProfile) {
    this.profile = profile
  }

  setProfile(profile: GestureProfile) {
    this.profile = profile
    this.state = { lastFingerCount: -1, lastTriggerTime: 0, holdCount: 0 }
  }

  setOnChordChange(callback: (result: GestureResult) => void) {
    this.onChordChange = callback
  }

  countFingers(landmarks: { x: number; y: number; z?: number }[]): number {
    if (!landmarks || landmarks.length < 21) return 0

    // Landmark indices:
    // 0: WRIST
    // Thumb: 1(CMC), 2(MCP), 3(IP), 4(TIP)
    // Index: 5(MCP), 6(PIP), 7(DIP), 8(TIP)
    // Middle: 9(MCP), 10(PIP), 11(DIP), 12(TIP)
    // Ring: 13(MCP), 14(PIP), 15(DIP), 16(TIP)
    // Pinky: 17(MCP), 18(PIP), 19(DIP), 20(TIP)

    const wrist = landmarks[0]

    // Wrist-to-Tip vs Wrist-to-PIP distance ratio (angle-agnostic & tilt-proof)
    const isExtended = (tipIdx: number, pipIdx: number, threshold = 1.08) => {
      const distTip = Math.hypot(landmarks[tipIdx].x - wrist.x, landmarks[tipIdx].y - wrist.y)
      const distPIP = Math.hypot(landmarks[pipIdx].x - wrist.x, landmarks[pipIdx].y - wrist.y)
      return distTip > distPIP * threshold
    }

    const indexExtended = isExtended(8, 6, 1.08)
    const middleExtended = isExtended(12, 10, 1.08)
    const ringExtended = isExtended(16, 14, 1.08)
    const pinkyExtended = isExtended(20, 18, 1.05) // Forgiving pinky threshold

    // Thumb extension: Perpendicular lateral distance from Wrist -> IndexMCP axis
    const thumbTip = landmarks[4]
    const indexMCP = landmarks[5]

    const palmDx = indexMCP.x - wrist.x
    const palmDy = indexMCP.y - wrist.y
    const palmLen = Math.hypot(palmDx, palmDy) || 0.1

    const thumbDx = thumbTip.x - wrist.x
    const thumbDy = thumbTip.y - wrist.y

    // Cross product yields exact perpendicular distance from palm central line
    const perpDist = Math.abs(thumbDx * palmDy - thumbDy * palmDx) / palmLen

    // Thumb is extended ONLY if it sticks out laterally beyond the palm boundary (>= 0.085)
    const thumbExtended = perpDist > 0.085

    let count = 0
    if (thumbExtended) count++
    if (indexExtended) count++
    if (middleExtended) count++
    if (ringExtended) count++
    if (pinkyExtended) count++

    return count
  }

  processLandmarks(landmarks: { x: number; y: number; z?: number }[]): GestureResult | null {
    if (!landmarks || landmarks.length < 21) return null

    // Anatomical hand ratio check (rejects ear / face / background false positives)
    const wrist = landmarks[0]
    const middleMCP = landmarks[9]
    const indexMCP = landmarks[5]
    const pinkyMCP = landmarks[17]

    const palmLength = Math.hypot(middleMCP.x - wrist.x, middleMCP.y - wrist.y)
    const palmWidth = Math.hypot(pinkyMCP.x - indexMCP.x, pinkyMCP.y - indexMCP.y)

    // A real hand in video frame must have valid palm proportions
    if (palmLength < 0.055 || palmWidth < 0.032) {
      return null
    }

    const fingerCount = this.countFingers(landmarks)
    const chord = getChordForFingers(this.profile, fingerCount)

    if (!chord) return null

    const now = performance.now()
    const confidence = 0.95

    // Smoothing: require held for N frames
    if (fingerCount === this.state.lastFingerCount) {
      this.state.holdCount++
    } else {
      this.state.lastFingerCount = fingerCount
      this.state.holdCount = 1
    }

    // Trigger after hold threshold + debounce
    if (
      this.state.holdCount >= HOLD_FRAMES &&
      now - this.state.lastTriggerTime > DEBOUNCE_MS
    ) {
      this.state.lastTriggerTime = now

      const result: GestureResult = {
        gesture: FINGER_GESTURE_NAMES[fingerCount] || `fingers_${fingerCount}`,
        chord,
        confidence,
        fingerCount,
        profileId: this.profile.id,
      }

      this.onChordChange?.(result)
      return result
    }

    return null
  }
}
