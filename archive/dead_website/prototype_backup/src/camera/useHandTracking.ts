import { useRef, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface HandResult {
  landmarks: HandLandmark[];
  handedness: string;
}

export function useHandTracking() {
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const onResultsRef = useRef<((result: HandResult | null) => void) | null>(null);
  const isProcessingRef = useRef(false);

  const initialize = useCallback(async () => {
    try {
      console.log('🔄 Loading MediaPipe Tasks Vision...');

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );

      console.log('✅ FilesetResolver ready');

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
      });

      console.log('✅ HandLandmarker ready');
    } catch (err) {
      console.error('❌ Failed to load MediaPipe:', err);
    }
  }, []);

  const processFrame = useCallback(async (video: HTMLVideoElement) => {
    if (!handLandmarkerRef.current || !video || video.readyState < 2) {
      return;
    }

    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const nowMs = performance.now();
      const results = handLandmarkerRef.current.detectForVideo(video, nowMs);

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        const handedness = results.handednesses?.[0]?.[0]?.categoryName ?? 'Right';
        onResultsRef.current?.({ landmarks, handedness });
      } else {
        onResultsRef.current?.(null);
      }
    } catch (err) {
      console.error('Detection error:', err);
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  const setOnResults = useCallback((cb: (result: HandResult | null) => void) => {
    onResultsRef.current = cb;
  }, []);

  return { initialize, processFrame, setOnResults };
}
