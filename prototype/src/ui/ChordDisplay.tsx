interface ChordDisplayProps {
  chord: string;
  fingerCount: number;
  handDetected: boolean;
}

export function ChordDisplay({ chord, fingerCount, handDetected }: ChordDisplayProps) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 100,
      left: '50%',
      transform: 'translateX(-50%)',
      textAlign: 'center',
      zIndex: 50,
    }}>
      {/* Hand detection status */}
      <div style={{
        fontSize: 14,
        color: handDetected ? '#22c55e' : 'rgba(255,255,255,0.4)',
        marginBottom: 8,
        fontFamily: 'monospace',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}>
        <span style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: handDetected ? '#22c55e' : 'rgba(255,255,255,0.3)',
          display: 'inline-block',
        }} />
        {handDetected ? 'Hand detected' : 'Show your hand to camera'}
      </div>

      {/* Main chord display */}
      <div style={{
        fontSize: 80,
        fontWeight: 900,
        color: chord ? '#fff' : 'rgba(255,255,255,0.2)',
        textShadow: chord ? '0 0 40px rgba(99, 102, 241, 0.9), 0 0 80px rgba(99, 102, 241, 0.4)' : 'none',
        transition: 'all 0.12s ease-out',
        fontFamily: 'system-ui, sans-serif',
        lineHeight: 1,
      }}>
        {chord || '—'}
      </div>

      {/* Finger count */}
      {handDetected && (
        <div style={{
          fontSize: 18,
          color: 'rgba(255,255,255,0.5)',
          marginTop: 8,
          fontFamily: 'monospace',
        }}>
          {fingerCount} finger{fingerCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
