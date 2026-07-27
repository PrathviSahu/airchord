interface HandOverlayProps {
  landmarks: { x: number; y: number; z: number }[] | null;
  width: number;
  height: number;
}

export function HandOverlay({ landmarks, width, height }: HandOverlayProps) {
  if (!landmarks || landmarks.length === 0) return null;

  // MediaPipe landmarks are normalized 0-1, convert to pixels
  // Note: x is mirrored (0 = right side of screen)
  const toPixel = (lm: { x: number; y: number }) => ({
    x: (1 - lm.x) * width,  // Mirror x
    y: lm.y * height,
  });

  // Draw connections between landmarks
  const connections = [
    // Thumb
    [0, 1], [1, 2], [2, 3], [3, 4],
    // Index
    [0, 5], [5, 6], [6, 7], [7, 8],
    // Middle
    [0, 9], [9, 10], [10, 11], [11, 12],
    // Ring
    [0, 13], [13, 14], [14, 15], [15, 16],
    // Pinky
    [0, 17], [17, 18], [18, 19], [19, 20],
    // Palm
    [5, 9], [9, 13], [13, 17],
  ];

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 40,
      }}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Draw connections */}
      {connections.map(([i, j], idx) => {
        const p1 = toPixel(landmarks[i]);
        const p2 = toPixel(landmarks[j]);
        return (
          <line
            key={idx}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="rgba(99, 102, 241, 0.6)"
            strokeWidth={2}
          />
        );
      })}

      {/* Draw landmarks */}
      {landmarks.map((lm, idx) => {
        const p = toPixel(lm);
        const isTip = [4, 8, 12, 16, 20].includes(idx);
        return (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={isTip ? 6 : 3}
            fill={isTip ? '#6366f1' : 'rgba(255, 255, 255, 0.8)'}
          />
        );
      })}
    </svg>
  );
}
