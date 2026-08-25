interface StatusOverlayProps {
  cameraReady: boolean;
  mediaPipeReady: boolean;
  handDetected: boolean;
}

export function StatusOverlay({ cameraReady, mediaPipeReady, handDetected }: StatusOverlayProps) {
  // Don't show overlay when everything is working
  if (cameraReady && mediaPipeReady && handDetected) {
    return null;
  }

  // Determine what's loading
  const steps = [
    { label: 'Camera', done: cameraReady },
    { label: 'Hand Tracking', done: mediaPipeReady },
    { label: 'Hand Detected', done: handDetected },
  ];

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Status steps */}
      <div style={{ marginBottom: 40 }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
            opacity: step.done ? 0.5 : 1,
          }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: step.done ? '#22c55e' : i === steps.findIndex(s => !s.done) ? '#6366f1' : 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
            }}>
              {step.done ? '✓' : i + 1}
            </div>
            <span style={{
              fontSize: 18,
              textDecoration: step.done ? 'line-through' : 'none',
              color: step.done ? '#22c55e' : '#fff',
            }}>
              {step.label}
            </span>
            {!step.done && i === steps.findIndex(s => !s.done) && (
              <span style={{ color: '#6366f1', fontSize: 14 }}>← Loading...</span>
            )}
          </div>
        ))}
      </div>

      {/* Current status message */}
      <div style={{
        fontSize: 24,
        fontWeight: 600,
        marginBottom: 12,
        color: '#6366f1',
      }}>
        {!cameraReady && '📷 Starting camera...'}
        {cameraReady && !mediaPipeReady && '🤖 Loading hand tracking...'}
        {cameraReady && mediaPipeReady && !handDetected && '✋ Show your hand to camera'}
      </div>

      {/* Subtle hint */}
      <div style={{
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
      }}>
        {cameraReady && mediaPipeReady && !handDetected && 'Wave or hold up your hand'}
      </div>
    </div>
  );
}
