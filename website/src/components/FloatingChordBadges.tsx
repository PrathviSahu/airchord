import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { playStrum, playPluckNote } from '../utils/guitarSound'

interface ChordData {
  name: string
  subtitle: string
  pos: [number, number, number]
  scrollRange: [number, number] // [fadeStart, fadeEnd]
  notes: string[]
}

const CHORDS: ChordData[] = [
  {
    name: 'Cmaj7',
    subtitle: 'Warm Open',
    pos: [-3.4, 2.2, 1.2],
    scrollRange: [0.0, 0.25],
    notes: ['C5', 'G4', 'E4', 'B3'],
  },
  {
    name: 'Am9',
    subtitle: 'Melodic Accent',
    pos: [3.4, 1.2, -0.4],
    scrollRange: [0.15, 0.45],
    notes: ['A4', 'E4', 'C4', 'G3', 'B4'],
  },
  {
    name: 'F#m7',
    subtitle: 'Concert Depth',
    pos: [-3.6, -0.8, 0.8],
    scrollRange: [0.35, 0.65],
    notes: ['E4', 'C5', 'A4', 'F#4'],
  },
  {
    name: 'Gsus4',
    subtitle: 'Resonant Lift',
    pos: [3.5, -1.8, 1.5],
    scrollRange: [0.55, 0.85],
    notes: ['G4', 'C5', 'D5', 'G3'],
  },
  {
    name: 'Eadd9',
    subtitle: 'Final Ring',
    pos: [-2.9, -2.8, -0.6],
    scrollRange: [0.75, 1.0],
    notes: ['E4', 'B4', 'F#5', 'G#4'],
  },
]

function SingleChordBadge({ chord, index, scrollProgress }: { chord: ChordData; index: number; scrollProgress: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null)
  const badgeRef = useRef<HTMLDivElement>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const scroll = scrollProgress.current

    // Subtle floating bobbing
    if (groupRef.current) {
      groupRef.current.position.y = chord.pos[1] + Math.sin(t * 1.2 + index * 1.4) * 0.12
      groupRef.current.position.x = chord.pos[0] + Math.cos(t * 0.9 + index * 1.1) * 0.08
    }

    // Scroll visibility calculations
    const [start, end] = chord.scrollRange
    const distFromRange = Math.min(Math.abs(scroll - start), Math.abs(scroll - end))
    const inRange = scroll >= start - 0.1 && scroll <= end + 0.1
    let opacity = 0

    if (inRange) {
      const mid = (start + end) / 2
      const halfLen = (end - start) / 2
      opacity = Math.max(0, 1 - Math.abs(scroll - mid) / (halfLen + 0.1))
    }

    if (badgeRef.current) {
      badgeRef.current.style.opacity = opacity.toFixed(2)
      badgeRef.current.style.transform = `scale(${0.85 + opacity * 0.15})`
      badgeRef.current.style.pointerEvents = opacity > 0.3 ? 'auto' : 'none'
    }
  })

  return (
    <group ref={groupRef} position={chord.pos}>
      <Html center distanceFactor={12} zIndexRange={[100, 0]}>
        <div
          ref={badgeRef}
          onClick={() => {
            playStrum(chord.notes, 0.14)
          }}
          style={{
            padding: '8px 16px',
            background: 'rgba(12, 12, 16, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            color: '#fff',
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(179, 120, 177, 0.15)',
            cursor: 'pointer',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className="chord-badge-hover"
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#b378b1',
              textTransform: 'uppercase',
            }}
          >
            {chord.name}
          </span>
          <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
          <span style={{ fontSize: '10px', fontWeight: 400, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.02em' }}>
            {chord.subtitle}
          </span>
        </div>
      </Html>
    </group>
  )
}

export default function FloatingChordBadges({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  return (
    <>
      {CHORDS.map((chord, idx) => (
        <SingleChordBadge key={chord.name} chord={chord} index={idx} scrollProgress={scrollProgress} />
      ))}
    </>
  )
}
