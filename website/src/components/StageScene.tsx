import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import RealGuitar3D from './RealGuitar3D'
import LightfallBackground from './LightfallBackground'
import FloatingChordBadges from './FloatingChordBadges'

// ── Lighting — dynamic studio lighting with multi-angle spotlights ───
function StageLighting() {
  const spotRef = useRef<THREE.SpotLight>(null)
  const { pointer } = useThree()

  useFrame(() => {
    if (spotRef.current) {
      const targetSpotX = pointer.x * 2.0
      spotRef.current.position.x += (targetSpotX - spotRef.current.position.x) * 0.05
    }
  })

  return (
    <>
      {/* 1. Main Overhead Stage Spotlight (follows cursor) */}
      <spotLight
        ref={spotRef}
        position={[0, 16, 8]}
        angle={0.4}
        penumbra={0.7}
        intensity={35}
        color="#FFF8EE"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        distance={50}
        decay={1.1}
      />
      {/* 2. Direct Front Studio Light — illuminates front wood body & soundhole */}
      <directionalLight position={[0, 5, 12]} intensity={4.5} color="#FFF5E6" />

      {/* 3. Top-Right Studio Accent Spotlight — highlights fretboard & neck */}
      <spotLight position={[6, 12, 8]} angle={0.5} penumbra={0.6} intensity={18} color="#F3E8FF" />

      {/* 4. Front-Left Key Fill — highlights body curve */}
      <directionalLight position={[-6, 4, 8]} intensity={3.2} color="#FFFFFF" />

      {/* 5. Electric Blue Stage Rim (Left Back) */}
      <pointLight position={[-9, 5, -2]} intensity={6.0} color="#60A5FA" distance={35} decay={1.5} />

      {/* 6. Warm Amber Stage Rim (Right Back) */}
      <pointLight position={[9, -1, 4]} intensity={5.0} color="#F59E0B" distance={30} decay={1.5} />

      {/* 7. Bright Ambient Fill — prevents dark shadow blackouts */}
      <ambientLight intensity={0.95} color="#FFFFFF" />
    </>
  )
}

// ── Shadow floor ──────────────────────────────────────────────────────
function StageFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.5, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <shadowMaterial opacity={0.4} />
    </mesh>
  )
}

// ── Camera rig — responsive mouse tilt parallax + scroll ──────────────
function CameraRig({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const { camera, pointer } = useThree()

  useFrame(() => {
    const scroll = scrollProgress.current

    // Smooth cursor tilt parallax (-1 to 1 normalized mouse coordinates)
    const mouseX = pointer.x * 0.85
    const mouseY = pointer.y * 0.55

    const targetX = mouseX + scroll * 1.4
    const targetY = mouseY + 1.2 + scroll * -0.5
    const targetZ = 14.5 - scroll * 1.8

    camera.position.x += (targetX - camera.position.x) * 0.05
    camera.position.y += (targetY - camera.position.y) * 0.05
    camera.position.z += (targetZ - camera.position.z) * 0.05

    camera.lookAt(mouseX * 0.35, 0.5 + mouseY * 0.25, 0)
  })

  return null
}

// ── Scene ─────────────────────────────────────────────────────────────
interface StageSceneProps {
  scrollProgress: React.MutableRefObject<number>
  onLoaded?: () => void
}

function SceneContents({ scrollProgress, onLoaded }: StageSceneProps) {
  useEffect(() => {
    // Fire onLoaded after a short frame settle so canvas has painted
    const t = setTimeout(() => { onLoaded?.() }, 800)
    return () => clearTimeout(t)
  }, [onLoaded])

  return (
    <>
      {/* Lightfall shader as fullscreen background — same WebGL context */}
      <LightfallBackground />

      <StageLighting />
      <StageFloor />
      <CameraRig scrollProgress={scrollProgress} />

      {/* Environment for bright reflections on guitar clearcoat & metallic hardware */}
      <Environment preset="studio" environmentIntensity={0.85} />

      {/* Real downloaded guitar model */}
      <group position={[0, 0, 0]}>
        <RealGuitar3D scrollProgress={scrollProgress} />
      </group>

      {/* Floating interactive chord tags synced to scroll */}
      <FloatingChordBadges scrollProgress={scrollProgress} />

      <ContactShadows
        position={[0, -4.2, 0]}
        opacity={0.45}
        scale={10}
        blur={3.5}
        far={5}
        color="#000000"
      />
    </>
  )
}

export default function StageScene({ scrollProgress, onLoaded }: StageSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 1.2, 14.5], fov: 40, near: 0.1, far: 70 }}
      shadows
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,                              // transparent so Lightfall shows behind
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.45,
      }}
      style={{
        width: '100%',
        height: '100%',
        background: 'transparent',              // canvas itself is transparent
      }}
    >
      <SceneContents scrollProgress={scrollProgress} onLoaded={onLoaded} />
    </Canvas>
  )
}
