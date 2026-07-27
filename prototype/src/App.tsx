import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera } from './camera/Camera';
import { useHandTracking } from './camera/useHandTracking';
import { GestureEngine, type GestureResult } from './gesture/GestureEngine';
import { type GestureProfile, getProfileById } from './gesture/GestureProfiles';
import { AudioEngine } from './audio/AudioEngine';
import { DebugPanel } from './ui/DebugPanel';
import { ChordDisplay } from './ui/ChordDisplay';
import { HandOverlay } from './ui/HandOverlay';
import { ProfileSelector } from './ui/ProfileSelector';
import { StatusOverlay } from './ui/StatusOverlay';
import { latencyProfiler } from './utils/latency';
import './App.css';

function App() {
  const [fps, setFps] = useState(0);
  const [chord, setChord] = useState('');
  const [gesture, setGesture] = useState('');
  const [fingerCount, setFingerCount] = useState(0);
  const [latency, setLatency] = useState(0);
  const [mediaPipeTime, setMediaPipeTime] = useState(0);
  const [handDetected, setHandDetected] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [mediaPipeReady, setMediaPipeReady] = useState(false);
  const [activeProfile, setActiveProfile] = useState<GestureProfile>(getProfileById('classic'));
  const [landmarks, setLandmarks] = useState<{ x: number; y: number; z: number }[] | null>(null);

  const gestureEngineRef = useRef(new GestureEngine(getProfileById('classic')));
  const audioEngineRef = useRef(new AudioEngine());
  const { initialize, processFrame, setOnResults } = useHandTracking();

  // Initialize MediaPipe on mount
  useEffect(() => {
    initialize().then(() => setMediaPipeReady(true));
  }, [initialize]);

  // Initialize Audio on first user interaction
  const handleUserInteraction = useCallback(async () => {
    if (!audioReady) {
      await audioEngineRef.current.init();
      setAudioReady(true);
    }
  }, [audioReady]);

  // Handle profile change
  const handleProfileChange = useCallback((profile: GestureProfile) => {
    setActiveProfile(profile);
    gestureEngineRef.current.setProfile(profile);
    setChord('');
    setGesture('');
    setFingerCount(0);
  }, []);

  // Connect gesture engine to audio engine
  useEffect(() => {
    gestureEngineRef.current.setOnChordChange((result: GestureResult) => {
      setChord(result.chord);
      setGesture(result.gesture);
      setFingerCount(result.fingerCount);

      if (audioReady) {
        audioEngineRef.current.playChord(result.chord);

        latencyProfiler.startMeasurement();
        const totalLatency = latencyProfiler.record(result.gesture, result.chord);
        setLatency(totalLatency);
      }
    });
  }, [audioReady]);

  // Connect hand tracking to gesture engine
  useEffect(() => {
    setOnResults((handResult) => {
      if (handResult) {
        setHandDetected(true);
        setLandmarks(handResult.landmarks);

        const mpStart = performance.now();
        gestureEngineRef.current.processLandmarks(handResult.landmarks);
        setMediaPipeTime(performance.now() - mpStart);
      } else {
        setHandDetected(false);
        setLandmarks(null);
        setGesture('');
        setFingerCount(0);
      }
    });
  }, [setOnResults]);

  // Handle camera frames
  const handleFrame = useCallback(async (video: HTMLVideoElement) => {
    await processFrame(video);
  }, [processFrame]);

  // Camera ready callback
  const handleCameraReady = useCallback(() => {
    setCameraReady(true);
  }, []);

  // Latency tester — press L to export
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'l' || e.key === 'L') {
        latencyProfiler.downloadCsv();
        console.log(`Latency log exported. ${latencyProfiler.count} entries.`);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="app" onClick={handleUserInteraction}>
      {/* Camera feed */}
      <div className="camera-wrapper">
        <Camera onFrame={handleFrame} onFps={setFps} onReady={handleCameraReady} />
      </div>

      {/* Hand overlay */}
      <HandOverlay landmarks={landmarks} width={640} height={480} />

      {/* Status overlay */}
      <StatusOverlay
        cameraReady={cameraReady}
        mediaPipeReady={mediaPipeReady}
        handDetected={handDetected}
      />

      {/* Chord display */}
      <ChordDisplay
        chord={chord}
        fingerCount={fingerCount}
        handDetected={handDetected}
      />

      {/* Profile selector */}
      <ProfileSelector
        activeProfile={activeProfile}
        onSelect={handleProfileChange}
      />

      {/* Debug panel */}
      <DebugPanel
        fps={fps}
        handDetected={handDetected}
        gesture={gesture}
        chord={chord}
        latency={latency}
        mediaPipeTime={mediaPipeTime}
        profileName={activeProfile.name}
        fingerCount={fingerCount}
      />

      {/* Audio status */}
      {!audioReady && cameraReady && mediaPipeReady && (
        <div className="tap-overlay" style={{ position: 'absolute', bottom: 60, top: 'auto', height: 'auto', padding: '20px 40px' }}>
          <div className="tap-text">👆 Tap anywhere to enable audio</div>
        </div>
      )}

      {/* Latency hint */}
      <div className="latency-hint">
        Press <kbd>L</kbd> to export latency log
      </div>
    </div>
  );
}

export default App;
