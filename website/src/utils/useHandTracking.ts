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
  /** MediaPipe's handedness confidence for the detected hand. */
  confidence: number
}

export function useHandTracking() {
  const handLandmarkerRef = useRef<HandLandmarker | null>(null)
  const onResultsRef = useRef<((result: HandResult | null) => void) | null>(null)
  const isProcessingRef = useRef(false)
  const lastVideoTimeRef = useRef(-1)
  const lastProcessedAtRef = useRef(0)
  const initializePromiseRef = useRef<Promise<void> | null>(null)
  const lifecycleRef = useRef(0)
  const disposedRef = useRef(false)
  const TARGET_FRAME_INTERVAL_MS = 1000 / 30

  const initialize = useCallback(async () => {
    disposedRef.current = false
    if (handLandmarkerRef.current) return
    if (initializePromiseRef.current) return initializePromiseRef.current
    const lifecycle = ++lifecycleRef.current

    const promise = (async () => {
      try {
        console.log('🔄 Initializing MediaPipe HandLandmarker...')

        // Match installed package version (@mediapipe/tasks-vision@0.10.35)
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
        )
        if (disposedRef.current || lifecycleRef.current !== lifecycle) return

        const options = {
          runningMode: 'VIDEO' as const,
          numHands: 1,
          minHandDetectionConfidence: 0.50,
          minHandPresenceConfidence: 0.50,
          minTrackingConfidence: 0.50,
        }

        // Try GPU delegate first, fallback to CPU for mobile browsers / iOS Safari
        try {
          const gpuLandmarker = await HandLandmarker.createFromOptions(vision, {
            ...options,
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'GPU',
            },
          })
          if (disposedRef.current || lifecycleRef.current !== lifecycle) {
            gpuLandmarker.close()
            return
          }
          handLandmarkerRef.current = gpuLandmarker
          console.log('✅ HandLandmarker GPU initialized successfully')
        } catch (gpuErr) {
          if (disposedRef.current || lifecycleRef.current !== lifecycle) return
          console.warn('⚠️ GPU delegate failed on this device, falling back to CPU delegate...', gpuErr)
          const cpuLandmarker = await HandLandmarker.createFromOptions(vision, {
            ...options,
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'CPU',
            },
          })
          if (disposedRef.current || lifecycleRef.current !== lifecycle) {
            cpuLandmarker.close()
            return
          }
          handLandmarkerRef.current = cpuLandmarker
          console.log('✅ HandLandmarker CPU fallback initialized successfully')
        }
      } catch (err) {
        console.error('❌ Failed to initialize MediaPipe HandLandmarker:', err)
      }
    })()

    initializePromiseRef.current = promise
    await promise
    if (lifecycleRef.current === lifecycle && !handLandmarkerRef.current) {
      initializePromiseRef.current = null
    }
  }, [])

  const processFrame = useCallback((video: HTMLVideoElement) => {
    if (!handLandmarkerRef.current || !video || video.readyState < 2) {
      return
    }

    // Skip duplicate frames and cap inference at 30 FPS. The render loop can
    // run at 60/120 FPS, but running the detector at display refresh rate
    // wastes CPU/GPU and makes camera load compete with audio scheduling.
    const nowMs = performance.now()
    if (video.currentTime === lastVideoTimeRef.current) return
    if (nowMs - lastProcessedAtRef.current < TARGET_FRAME_INTERVAL_MS) return
    lastVideoTimeRef.current = video.currentTime
    lastProcessedAtRef.current = nowMs

    if (isProcessingRef.current) return
    isProcessingRef.current = true

    try {
      const results = handLandmarkerRef.current.detectForVideo(video, nowMs)

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0]
        const handednessCategory = results.handednesses?.[0]?.[0]
        const handedness = handednessCategory?.categoryName ?? 'Right'
        // Older runtimes may omit the category score even when landmarks are
        // valid; do not turn that compatibility case into a permanent no-hand state.
        const confidence = handednessCategory?.score ?? 1
        onResultsRef.current?.({ landmarks, handedness, confidence })
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

  const dispose = useCallback(() => {
    disposedRef.current = true
    lifecycleRef.current += 1
    try { handLandmarkerRef.current?.close() } catch { /* already disposed */ }
    handLandmarkerRef.current = null
    onResultsRef.current = null
    isProcessingRef.current = false
    lastVideoTimeRef.current = -1
    lastProcessedAtRef.current = 0
    initializePromiseRef.current = null
  }, [])

  return { initialize, processFrame, setOnResults, dispose }
}
