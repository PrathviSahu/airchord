import { useRef, useEffect, Suspense } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
//  ⚙️  CONFIG: set MODEL_FILE to the filename you dropped in /public/models/
//     Supported formats: .fbx  .obj  .glb  .gltf
//
//     e.g.  'guitar.fbx'   or   'acoustic_guitar.obj'  or  'guitar.glb'
// ─────────────────────────────────────────────────────────────────────────────
const MODEL_FILE = 'guitar.obj'

const ext = MODEL_FILE.split('.').pop()?.toLowerCase() ?? ''

// ── Material enhancer — converts mesh materials to premium PBR MeshStandardMaterial ──
function enhanceMaterials(object: THREE.Object3D) {
  object.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      mesh.castShadow = true
      mesh.receiveShadow = true

      const name = (mesh.name || '').toLowerCase()

      const convertMat = (oldMat: THREE.Material) => {
        const matName = (oldMat?.name || '').toLowerCase()
        const isString = name.includes('string') || name.includes('wire') || matName.includes('string')
        const isFretOrHardware = name.includes('fret') || name.includes('peg') || name.includes('tuner') || name.includes('metal') || name.includes('hardware')
        const isFingerboard = name.includes('neck') || name.includes('finger') || name.includes('fretboard')

        const newMat = new THREE.MeshStandardMaterial()

        if (isString) {
          newMat.color = new THREE.Color('#e2c07c')
          newMat.metalness = 0.92
          newMat.roughness = 0.12
        } else if (isFretOrHardware) {
          newMat.color = new THREE.Color('#d8d8d8')
          newMat.metalness = 0.95
          newMat.roughness = 0.15
        } else if (isFingerboard) {
          newMat.color = new THREE.Color('#161616')
          newMat.metalness = 0.05
          newMat.roughness = 0.45
        } else {
          // Premium obsidian black body finish with rich specular reflections
          newMat.color = new THREE.Color('#0a0a0c')
          newMat.metalness = 0.12
          newMat.roughness = 0.18
        }
        newMat.envMapIntensity = 1.8
        return newMat
      }

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(convertMat)
      } else if (mesh.material) {
        mesh.material = convertMat(mesh.material)
      }
    }
  })
}

// ── FBX loader component ──────────────────────────────────────────────────────
function FBXGuitar({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const fbx = useLoader(FBXLoader, `/models/${MODEL_FILE}`)
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!fbx) return
    enhanceMaterials(fbx)

    // Auto-scale: fit the model into a ~6-unit bounding box
    const box = new THREE.Box3().setFromObject(fbx)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const targetSize = 8.8
    fbx.scale.setScalar(targetSize / maxDim)

    // Centre the model at origin
    box.setFromObject(fbx)
    const center = new THREE.Vector3()
    box.getCenter(center)
    fbx.position.sub(center)
  }, [fbx])

  useFrame(() => {
    if (!groupRef.current) return
    const scroll = scrollProgress.current
    // Pure scroll-based rotation with smooth lerp
    const targetRotY = scroll * Math.PI * 2.0
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.08
  })

  return (
    <group ref={groupRef}>
      <primitive object={fbx} />
    </group>
  )
}

// ── OBJ loader component ──────────────────────────────────────────────────────
function OBJGuitar({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const obj = useLoader(OBJLoader, `/models/${MODEL_FILE}`)
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!obj) return
    enhanceMaterials(obj)

    // Align model so neck points UP (+Y) and front body face points forward (+Z)
    obj.rotation.set(0, Math.PI / 2, Math.PI / 2)
    obj.updateMatrixWorld(true)

    const box = new THREE.Box3().setFromObject(obj)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const targetSize = 8.8
    obj.scale.setScalar(targetSize / maxDim)

    box.setFromObject(obj)
    const center = new THREE.Vector3()
    box.getCenter(center)
    obj.position.sub(center)
  }, [obj])

  useFrame(() => {
    if (!groupRef.current) return
    const scroll = scrollProgress.current
    // Pure scroll-based rotation with smooth lerp
    const targetRotY = scroll * Math.PI * 2.0
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.08
  })

  return (
    <group ref={groupRef}>
      <primitive object={obj} />
    </group>
  )
}

// ── GLB/GLTF loader component ─────────────────────────────────────────────────
function GLTFGuitar({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const { scene } = useGLTF(`/models/${MODEL_FILE}`)
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!scene) return
    enhanceMaterials(scene)

    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const targetSize = 8.8
    scene.scale.setScalar(targetSize / maxDim)

    box.setFromObject(scene)
    const center = new THREE.Vector3()
    box.getCenter(center)
    scene.position.sub(center)
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const scroll = scrollProgress.current
    // Pure scroll-based rotation with smooth lerp
    const targetRotY = scroll * Math.PI * 2.0
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.08
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

// ── Procedural Acoustic Guitar (Zero-dependency fail-safe 3D Model) ───────────
function ProceduralGuitar({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current) return
    const scroll = scrollProgress.current
    const targetRotY = scroll * Math.PI * 2.0
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.08
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={[1.4, 1.4, 1.4]}>
      {/* Guitar Lower Body */}
      <mesh position={[0, -1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.7, 1.2, 32]} />
        <meshStandardMaterial color="#3d1d0e" roughness={0.25} metalness={0.15} envMapIntensity={1.2} />
      </mesh>

      {/* Guitar Upper Body */}
      <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.4, 1.1, 32]} />
        <meshStandardMaterial color="#4a2412" roughness={0.25} metalness={0.15} envMapIntensity={1.2} />
      </mesh>

      {/* Soundhole Ring & Rosette */}
      <mesh position={[0, -0.1, 0.56]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.48, 32]} />
        <meshStandardMaterial color="#e6c687" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.1, 0.57]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.34, 32]} />
        <meshBasicMaterial color="#050508" />
      </mesh>

      {/* Pickguard */}
      <mesh position={[0.35, -0.4, 0.57]} rotation={[0, 0, -0.3]}>
        <planeGeometry args={[0.5, 0.8]} />
        <meshStandardMaterial color="#1a0c06" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.32, 2.4, 0.22]} />
        <meshStandardMaterial color="#21120b" roughness={0.4} metalness={0.05} />
      </mesh>

      {/* Fretboard Surface */}
      <mesh position={[0, 1.5, 0.12]}>
        <boxGeometry args={[0.34, 2.4, 0.04]} />
        <meshStandardMaterial color="#111113" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Headstock */}
      <mesh position={[0, 3.0, 0.05]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.42, 0.7, 0.2]} />
        <meshStandardMaterial color="#3d1d0e" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Tuning Pegs */}
      {[-0.26, 0.26].map((x, xi) =>
        [2.8, 3.0, 3.2].map((y, yi) => (
          <mesh key={`${xi}-${yi}`} position={[x, y, 0.05]}>
            <cylinderGeometry args={[0.04, 0.04, 0.2, 16]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>
        ))
      )}

      {/* Strings (Brass/Gold) */}
      {[-0.1, -0.06, -0.02, 0.02, 0.06, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 0.8, 0.15]}>
          <cylinderGeometry args={[0.006, 0.006, 4.8, 8]} />
          <meshStandardMaterial color="#f0d58d" metalness={0.95} roughness={0.1} />
        </mesh>
      ))}

      {/* Bridge */}
      <mesh position={[0, -1.3, 0.58]}>
        <boxGeometry args={[0.9, 0.2, 0.1]} />
        <meshStandardMaterial color="#1a0c06" roughness={0.5} metalness={0.1} />
      </mesh>
    </group>
  )
}

// ── Error Boundary for Model Load Failures ────────────────────────────────────
import { Component, ReactNode } from 'react'

class ModelErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: any) {
    console.warn('3D model fetch failed or unsupported — falling back to procedural guitar:', error)
  }
  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

// ── Fallback while loading ────────────────────────────────────────────────────
function LoadingPlaceholder() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.5
  })
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 2, 0.3]} />
      <meshStandardMaterial color="#222" roughness={0.3} metalness={0.1} />
    </mesh>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
interface RealGuitarProps {
  scrollProgress: React.MutableRefObject<number>
}

export default function RealGuitar3D({ scrollProgress }: RealGuitarProps) {
  return (
    <ModelErrorBoundary fallback={<ProceduralGuitar scrollProgress={scrollProgress} />}>
      <Suspense fallback={<ProceduralGuitar scrollProgress={scrollProgress} />}>
        {ext === 'fbx' && <FBXGuitar scrollProgress={scrollProgress} />}
        {ext === 'obj' && <OBJGuitar scrollProgress={scrollProgress} />}
        {(ext === 'glb' || ext === 'gltf') && <GLTFGuitar scrollProgress={scrollProgress} />}
      </Suspense>
    </ModelErrorBoundary>
  )
}
