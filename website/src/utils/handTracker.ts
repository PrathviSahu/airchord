// ── Real-time MediaPipe Hand Gesture & Finger Count Detector ───────────────

export interface Point2D {
  x: number
  y: number
}

export interface HandDetectionResult {
  fingerCount: number
  landmarks: Point2D[]
  confidence: number
}

/**
 * Count extended fingers based on 21 MediaPipe hand landmark positions
 * Landmark IDs:
 * 0: Wrist
 * 4: Thumb Tip, 3: Thumb IP, 2: Thumb MCP
 * 8: Index Tip, 6: Index PIP
 * 12: Middle Tip, 10: Middle PIP
 * 16: Ring Tip, 14: Ring PIP
 * 20: Pinky Tip, 18: Pinky PIP
 */
export function countFingers(landmarks: Point2D[]): number {
  if (!landmarks || landmarks.length < 21) return 0

  let extended = 0

  // 1. Index finger
  if (landmarks[8].y < landmarks[6].y) extended++

  // 2. Middle finger
  if (landmarks[12].y < landmarks[10].y) extended++

  // 3. Ring finger
  if (landmarks[16].y < landmarks[14].y) extended++

  // 4. Pinky finger
  if (landmarks[20].y < landmarks[18].y) extended++

  // 5. Thumb finger (x distance relative to IP joint)
  const thumbDist = Math.abs(landmarks[4].x - landmarks[2].x)
  if (thumbDist > 0.05) extended++

  return Math.min(5, Math.max(0, extended))
}

/**
 * Draw glowing AI neon hand skeleton on canvas
 */
export function drawHandSkeleton(ctx: CanvasRenderingContext2D, landmarks: Point2D[], width: number, height: number) {
  ctx.clearRect(0, 0, width, height)
  if (!landmarks || landmarks.length < 21) return

  // Connections according to MediaPipe hand topology
  const CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],           // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],           // Index
    [5, 9], [9, 10], [10, 11], [11, 12],       // Middle
    [9, 13], [13, 14], [14, 15], [15, 16],     // Ring
    [13, 17], [17, 18], [18, 19], [19, 20],   // Pinky
    [0, 17],                                  // Palm base
  ]

  ctx.save()
  ctx.lineWidth = 3
  ctx.strokeStyle = 'rgba(179, 120, 177, 0.85)' // Purple glow
  ctx.shadowColor = '#b378b1'
  ctx.shadowBlur = 12

  // Draw bone connection lines
  CONNECTIONS.forEach(([start, end]) => {
    const p1 = landmarks[start]
    const p2 = landmarks[end]
    ctx.beginPath()
    ctx.moveTo(p1.x * width, p1.y * height)
    ctx.lineTo(p2.x * width, p2.y * height)
    ctx.stroke()
  })

  // Draw glowing joint points
  landmarks.forEach((p, idx) => {
    const x = p.x * width
    const y = p.y * height
    ctx.beginPath()
    ctx.arc(x, y, idx % 4 === 0 ? 5 : 3.5, 0, 2 * Math.PI)
    ctx.fillStyle = idx === 8 || idx === 12 || idx === 16 || idx === 20 || idx === 4 ? '#ffffff' : '#e2c07c'
    ctx.fill()
  })

  ctx.restore()
}

/**
 * Dynamically load MediaPipe Hands library from Google CDN
 */
export async function loadMediaPipeHands(): Promise<unknown> {
  if (typeof window === 'undefined') return null
  const win = window as unknown as { Hands?: unknown }

  if (win.Hands) return win.Hands

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
    script.crossOrigin = 'anonymous'
    script.onload = () => {
      resolve(win.Hands)
    }
    script.onerror = () => reject(new Error('Failed to load MediaPipe Hands from CDN'))
    document.head.appendChild(script)
  })
}
