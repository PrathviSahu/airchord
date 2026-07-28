import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface GuitarProps {
  scrollProgress?: React.MutableRefObject<number>
  onStringHit?: (stringIndex: number) => void
}

export default function Guitar({ scrollProgress }: GuitarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const stringsRef = useRef<THREE.Mesh[]>([])
  const stringAnimRef = useRef<number[]>([0, 0, 0, 0, 0, 0])
  const baseRotY = useRef(0)

  // ── Guitar body shape (acoustic guitar silhouette) ──────────────────
  const bodyShape = useMemo(() => {
    const shape = new THREE.Shape()
    // Start at bottom center, trace clockwise
    shape.moveTo(0, -2.4)
    // Right side – lower bout
    shape.bezierCurveTo( 0.6, -2.4,  1.85, -1.9,  1.95, -0.9)
    shape.bezierCurveTo( 2.05, -0.0,  1.9,  0.6,   1.75,  1.05)
    // Waist (narrow)
    shape.bezierCurveTo( 1.4,  1.6,   1.2,  1.85,  1.25,  2.3)
    // Upper bout
    shape.bezierCurveTo( 1.3,  2.75,  1.7,  3.1,   1.7,   3.7)
    shape.bezierCurveTo( 1.7,  4.3,   1.1,  4.7,   0,     4.7)
    // Left side (mirror)
    shape.bezierCurveTo(-1.1,  4.7,  -1.7,  4.3,  -1.7,   3.7)
    shape.bezierCurveTo(-1.7,  3.1,  -1.3,  2.75, -1.25,  2.3)
    shape.bezierCurveTo(-1.2,  1.85, -1.4,  1.6,  -1.75,  1.05)
    shape.bezierCurveTo(-1.9,  0.6,  -2.05, -0.0, -1.95, -0.9)
    shape.bezierCurveTo(-1.85,-1.9,  -0.6, -2.4,   0,    -2.4)
    return shape
  }, [])

  const bodyGeo = useMemo(() => {
    const settings: THREE.ExtrudeGeometryOptions = {
      depth: 0.42,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.06,
      bevelOffset: 0,
      bevelSegments: 12,
    }
    const g = new THREE.ExtrudeGeometry(bodyShape, settings)
    g.center()
    return g
  }, [bodyShape])

  // ── Rosette ring (sound hole decoration) ────────────────────────────
  const rosetteGeo = useMemo(() => {
    const ring = new THREE.RingGeometry(0.55, 0.72, 64)
    return ring
  }, [])

  // ── Fret dots geometry ───────────────────────────────────────────────
  const fretDotPositions = [1.0, 1.6, 2.2, 3.1, 4.0]

  // ── String geometries ────────────────────────────────────────────────
  // Strings run from bridge (y≈-1.1) to nut (y≈6.54) — total ≈ 7.65 units
  // CylinderGeometry is Y-aligned by default → no rotation needed
  const STRING_HEIGHT = 7.65
  const STRING_CENTER_Y = (-1.1 + 6.54) / 2   // ≈ 2.72
  const stringGeos = useMemo(() =>
    [0.022, 0.018, 0.014, 0.011, 0.009, 0.007].map(r => {
      const g = new THREE.CylinderGeometry(r, r, STRING_HEIGHT, 8)
      return g
    })
  , [])

  // ── Animate ──────────────────────────────────────────────────────────
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    const scroll = scrollProgress?.current ?? 0

    // Breathing
    const breatheY = Math.sin(t * 0.4) * 0.04
    const breatheS = 1 + Math.sin(t * 0.4) * 0.004

    // Scroll-driven: rotate and move
    const targetRotY = scroll * Math.PI * 0.6
    baseRotY.current += (targetRotY - baseRotY.current) * 0.04
    const idleRotY = Math.sin(t * 0.15) * 0.06

    groupRef.current.rotation.y = baseRotY.current + idleRotY
    groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.02 + scroll * 0.15
    groupRef.current.rotation.z = Math.sin(t * 0.12) * 0.01
    groupRef.current.position.y = breatheY + scroll * -0.8
    groupRef.current.scale.setScalar(breatheS)

    // String vibration
    stringsRef.current.forEach((mesh, i) => {
      if (!mesh) return
      const amp = stringAnimRef.current[i]
      if (amp > 0.001) {
        const vib = Math.sin(t * 40 * (1 + i * 0.15)) * amp * 0.012
        mesh.rotation.z = vib
        stringAnimRef.current[i] *= 0.95
      } else {
        mesh.rotation.z = 0
        stringAnimRef.current[i] = 0
      }
    })
  })

  // Expose string hit trigger
  useEffect(() => {
    const handleHit = (e: Event) => {
      const idx = (e as CustomEvent).detail?.index ?? 0
      stringAnimRef.current[idx] = 1
    }
    window.addEventListener('guitar:hit', handleHit)
    return () => window.removeEventListener('guitar:hit', handleHit)
  }, [])

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* ── Body ─────────────────────────────────────────────────── */}
      <mesh geometry={bodyGeo} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#8B4513"
          roughness={0.25}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Body top face (warm amber sunburst wood) */}
      <mesh geometry={bodyGeo} position={[0, 0, 0.23]}>
        <meshPhysicalMaterial
          color="#D2691E"
          roughness={0.20}
          metalness={0.15}
          clearcoat={1.0}
          clearcoatRoughness={0.03}
          envMapIntensity={1.0}
        />
      </mesh>

      {/* ── Sound hole ───────────────────────────────────────────── */}
      <mesh position={[0, -0.1, 0.245]}>
        <circleGeometry args={[0.62, 64]} />
        <meshBasicMaterial color="#000" />
      </mesh>

      {/* Rosette */}
      <mesh geometry={rosetteGeo} position={[0, -0.1, 0.248]}>
        <meshStandardMaterial
          color="#C9A84C"
          metalness={0.7}
          roughness={0.25}
          emissive="#C9A84C"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* ── Bridge ───────────────────────────────────────────────── */}
      <mesh position={[0, -1.1, 0.245]}>
        <boxGeometry args={[1.3, 0.22, 0.05]} />
        <meshPhysicalMaterial color="#1A0A00" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Saddle */}
      <mesh position={[0, -1.18, 0.275]}>
        <boxGeometry args={[1.1, 0.06, 0.06]} />
        <meshStandardMaterial color="#E8E0D0" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* ── Neck ─────────────────────────────────────────────────── */}
      <mesh position={[0, 4.35, 0.04]} castShadow>
        <boxGeometry args={[0.72, 4.4, 0.22]} />
        <meshPhysicalMaterial
          color="#2C1A08"
          roughness={0.45}
          metalness={0.0}
          clearcoat={0.3}
        />
      </mesh>

      {/* Fretboard */}
      <mesh position={[0, 4.35, 0.16]}>
        <boxGeometry args={[0.65, 4.38, 0.06]} />
        <meshPhysicalMaterial
          color="#150800"
          roughness={0.55}
          metalness={0.0}
        />
      </mesh>

      {/* Frets */}
      {[0, 0.58, 1.12, 1.63, 2.12, 2.58, 3.02].map((y, i) => (
        <mesh key={i} position={[0, 2.6 + y, 0.195]}>
          <boxGeometry args={[0.66, 0.022, 0.022]} />
          <meshStandardMaterial color="#B8B0A8" metalness={0.85} roughness={0.15} />
        </mesh>
      ))}

      {/* Fret position dots */}
      {[1.1, 1.95, 2.8, 3.6].map((y, i) => (
        <mesh key={i} position={[0, y + 2.0, 0.21]}>
          <circleGeometry args={[0.055, 16]} />
          <meshStandardMaterial color="#D0C8B8" roughness={0.4} />
        </mesh>
      ))}

      {/* Nut */}
      <mesh position={[0, 6.54, 0.185]}>
        <boxGeometry args={[0.66, 0.08, 0.05]} />
        <meshStandardMaterial color="#F0EAE0" roughness={0.3} />
      </mesh>

      {/* ── Headstock ────────────────────────────────────────────── */}
      <mesh position={[0, 7.3, 0.04]}>
        <boxGeometry args={[0.84, 1.55, 0.22]} />
        <meshPhysicalMaterial color="#1E0F08" roughness={0.3} clearcoat={0.8} />
      </mesh>
      {/* Headstock logo plate */}
      <mesh position={[0, 7.5, 0.16]}>
        <boxGeometry args={[0.65, 0.9, 0.02]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Tuning pegs (3 each side) */}
      {[-0.28, 0, 0.28].map((x, i) => (
        <group key={i}>
          <mesh position={[x - 0.52, 7.0 + i * 0.45, 0.04]}>
            <cylinderGeometry args={[0.06, 0.06, 0.12, 8]} />
            <meshStandardMaterial color="#A0A0A0" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[x - 0.52, 7.0 + i * 0.45, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
            <meshStandardMaterial color="#888" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[x + 0.52, 7.0 + i * 0.45, 0.04]}>
            <cylinderGeometry args={[0.06, 0.06, 0.12, 8]} />
            <meshStandardMaterial color="#A0A0A0" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[x + 0.52, 7.0 + i * 0.45, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
            <meshStandardMaterial color="#888" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      ))}

      {/* ── Strings ──────────────────────────────────────────────── */}
      {stringGeos.map((geo, i) => {
        // 6 strings evenly spaced across the neck width (~1.0 units total)
        const xOff = (i - 2.5) * 0.14
        return (
          <mesh
            key={i}
            ref={(el: THREE.Mesh | null) => { if (el) stringsRef.current[i] = el }}
            geometry={geo}
            // Centered between bridge (-1.1) and nut (6.54), sitting on top of guitar face
            position={[xOff, STRING_CENTER_Y, 0.26]}
            // No rotation — CylinderGeometry is already Y-axis aligned (vertical)
          >
            <meshStandardMaterial
              color={i < 2 ? '#C9A040' : '#E0DDD6'}
              metalness={0.92}
              roughness={i < 2 ? 0.22 : 0.06}
              envMapIntensity={1.2}
            />
          </mesh>
        )
      })}

      {/* ── Pick guard ───────────────────────────────────────────── */}
      <mesh position={[0.55, -0.3, 0.248]} rotation={[0, 0, -0.2]}>
        <planeGeometry args={[0.7, 1.1]} />
        <meshPhysicalMaterial
          color="#0A0500"
          roughness={0.5}
          metalness={0.0}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  )
}
