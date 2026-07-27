interface DebugPanelProps {
  fps: number;
  handDetected: boolean;
  gesture: string;
  chord: string;
  latency: number;
  mediaPipeTime: number;
  profileName?: string;
  fingerCount?: number;
}

export function DebugPanel({
  fps,
  handDetected,
  gesture,
  chord,
  latency,
  mediaPipeTime,
  profileName,
  fingerCount,
}: DebugPanelProps) {
  // Visual finger representation
  const fingerNames = ['✊', '☝️', '✌️', '🤟', '🖐️', '✋'];
  const fingerLabel = fingerCount !== undefined ? fingerNames[fingerCount] : '—';

  return (
    <div style={{
      position: 'absolute',
      top: 12,
      right: 12,
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#0f0',
      fontFamily: 'monospace',
      fontSize: 12,
      padding: '12px 16px',
      borderRadius: 8,
      minWidth: 180,
      zIndex: 100,
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(0, 255, 0, 0.2)',
    }}>
      <div style={{ color: '#0f0', marginBottom: 6, fontWeight: 'bold', fontSize: 13 }}>
        AIRCHORD DEBUG
      </div>
      {profileName && (
        <div style={{ marginBottom: 4 }}>Profile: <span style={{ color: '#c084fc' }}>{profileName}</span></div>
      )}
      <div style={{ marginBottom: 4 }}>FPS: <span style={{ color: fps >= 50 ? '#0f0' : fps >= 30 ? '#ff0' : '#f00' }}>{fps}</span></div>
      <div style={{ marginBottom: 4 }}>Hand: <span style={{ color: handDetected ? '#0f0' : '#f00' }}>
        {handDetected ? '✓ Detected' : '✗ Lost'}
      </span></div>

      {handDetected && (
        <>
          <div style={{ marginBottom: 4 }}>Fingers: <span style={{ color: '#ff0', fontSize: 16 }}>{fingerLabel}</span> <span style={{ color: '#888' }}>({fingerCount})</span></div>
          <div style={{ marginBottom: 4 }}>Gesture: <span style={{ color: '#ff0' }}>{gesture || '—'}</span></div>
        </>
      )}

      <div style={{ marginBottom: 4, fontSize: 14 }}>Chord: <span style={{ color: '#0ff', fontWeight: 'bold' }}>{chord || '—'}</span></div>
      <div style={{ marginBottom: 4 }}>Latency: <span style={{ color: latency < 50 ? '#0f0' : '#f00' }}>
        {latency.toFixed(0)} ms
      </span></div>
      <div>MP: <span style={{ color: mediaPipeTime < 20 ? '#0f0' : '#ff0' }}>
        {mediaPipeTime.toFixed(0)} ms
      </span></div>
    </div>
  );
}
