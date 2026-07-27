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

const HOLD_FRAMES = 3
const DEBOUNCE_MS = 150

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

    const thumbTip = landmarks[4]
    const thumbIP = landmarks[3]
    const indexMCP = landmarks[5]
    const indexTip = landmarks[8]

    // Calculate distances
    const tipToPalm = Math.hypot(thumbTip.x - indexMCP.x, thumbTip.y - indexMCP.y)
    const ipToPalm = Math.hypot(thumbIP.x - indexMCP.x, thumbIP.y - indexMCP.y)
    const tipToIndexTip = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y)

    // Thumb is extended if tip is further from palm than IP AND far from index tip
    const thumbExtended = (tipToPalm > ipToPalm * 1.1) && (tipToIndexTip > 0.15)

    // Index: tip (8) significantly above PIP (6)
    const indexPIP = landmarks[6]
    const indexExtended = (indexPIP.y - indexTip.y) > 0.035

    // Middle: tip (12) significantly above PIP (10)
    const middleTip = landmarks[12]
    const middlePIP = landmarks[10]
    const middleExtended = (middlePIP.y - middleTip.y) > 0.035

    // Ring: tip (16) significantly above PIP (14)
    const ringTip = landmarks[16]
    const ringPIP = landmarks[14]
    const ringExtended = (ringPIP.y - ringTip.y) > 0.035

    // Pinky: tip (20) above PIP (18)
    const pinkyTip = landmarks[20]
    const pinkyPIP = landmarks[18]
    const pinkyExtended = (pinkyPIP.y - pinkyTip.y) > 0.03

    let count = 0
    if (thumbExtended) count++
    if (indexExtended) count++
    if (middleExtended) count++
    if (ringExtended) count++
    if (pinkyExtended) count++

    return count
  }

  processLandmarks(landmarks: { x: number; y: number; z?: number }[]): GestureResult | null {
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
