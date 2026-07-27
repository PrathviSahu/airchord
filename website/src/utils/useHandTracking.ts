import { useRef, useCallback } from 'react'
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

export interface HandLandmark {
  x: number
  y: number
  z?: number
}

export interface HandResult {
  landmarks: HandLandmark[]
  handedness: string
}

export function useHandTracking() {
  const handLandmarkerRef = useRef<HandLandmarker | null>(null)
  const onResultsRef = useRef<((result: HandResult | null) => void) | null>(null)
  const isProcessingRef = useRef(false)
  const lastVideoTimeRef = useRef(-1)

  const initialize = useCallback(async () => {
    try {
      console.log('🔄 Initializing MediaPipe HandLandmarker...')

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      )

      handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.4,
        minHandPresenceConfidence: 0.4,
        minTrackingConfidence: 0.4,
      })

      console.log('✅ HandLandmarker initialized successfully')
    } catch (err) {
      console.error('❌ Failed to initialize MediaPipe HandLandmarker:', err)
    }
  }, [])

  const processFrame = useCallback((video: HTMLVideoElement) => {
    if (!handLandmarkerRef.current || !video || video.readyState < 2) {
      return
    }

    // Skip processing if video timestamp has not advanced (prevents GPU/CPU loop overload)
    if (video.currentTime === lastVideoTimeRef.current) return
    lastVideoTimeRef.current = video.currentTime

    if (isProcessingRef.current) return
    isProcessingRef.current = true

    try {
      const nowMs = performance.now()
      const results = handLandmarkerRef.current.detectForVideo(video, nowMs)

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0]
        const handedness = results.handednesses?.[0]?.[0]?.categoryName ?? 'Right'
        onResultsRef.current?.({ landmarks, handedness })
      } else {
        onResultsRef.current?.(null)
      }
    } catch (err) {
      console.error('Hand detection error:', err)
    } finally {
      isProcessingRef.current = false
    }
  }, [])

  const setOnResults = useCallback((cb: (result: HandResult | null) => void) => {
    onResultsRef.current = cb
  }, [])

  return { initialize, processFrame, setOnResults }
}
