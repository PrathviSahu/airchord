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
    <group ref={groupRef} position={[0, -0.4, 0]} scale={[1.25, 1.25, 1.25]}>
      {/* Guitar Lower Body Bout */}
      <mesh position={[0, -1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.7, 1.2, 48]} />
        <meshStandardMaterial color="#3d1e12" roughness={0.22} metalness={0.12} envMapIntensity={1.4} />
      </mesh>

      {/* Guitar Waist & Upper Bout */}
      <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.45, 1.1, 48]} />
        <meshStandardMaterial color="#482415" roughness={0.22} metalness={0.12} envMapIntensity={1.4} />
      </mesh>

      {/* Front Spruce Soundboard Veneer */}
      <mesh position={[0, -0.65, 0.58]} castShadow receiveShadow>
        <boxGeometry args={[2.9, 2.3, 0.04]} />
        <meshStandardMaterial color="#8B4513" roughness={0.3} metalness={0.08} envMapIntensity={1.1} />
      </mesh>

      {/* Soundhole Ring & Pearl Rosette */}
      <mesh position={[0, -0.1, 0.61]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.34, 0.52, 48]} />
        <meshStandardMaterial color="#e6c687" roughness={0.25} metalness={0.85} envMapIntensity={1.8} />
      </mesh>
      <mesh position={[0, -0.1, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.33, 48]} />
        <meshBasicMaterial color="#050508" />
      </mesh>

      {/* Classic Tortoise Pickguard */}
      <mesh position={[0.36, -0.42, 0.61]} rotation={[0, 0, -0.32]}>
        <planeGeometry args={[0.55, 0.85]} />
        <meshStandardMaterial color="#1f0903" roughness={0.15} metalness={0.1} envMapIntensity={1.5} />
      </mesh>

      {/* Mahogany Neck */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.32, 2.4, 0.22]} />
        <meshStandardMaterial color="#2a140b" roughness={0.35} metalness={0.05} />
      </mesh>

      {/* Rosewood Fretboard Surface */}
      <mesh position={[0, 1.5, 0.12]}>
        <boxGeometry args={[0.34, 2.4, 0.04]} />
        <meshStandardMaterial color="#141416" roughness={0.45} metalness={0.15} />
      </mesh>

      {/* Metal Fret Wires */}
      {[-0.8, -0.4, 0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4].map((y, fi) => (
        <mesh key={fi} position={[0, y, 0.145]}>
          <boxGeometry args={[0.33, 0.02, 0.02]} />
          <meshStandardMaterial color="#d4d4d4" metalness={0.92} roughness={0.15} />
        </mesh>
      ))}

      {/* Pearl Fret Position Markers */}
      {[-0.4, 0.4, 1.2, 2.0].map((y, pi) => (
        <mesh key={pi} position={[0, y, 0.146]}>
          <circleGeometry args={[0.03, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.9} />
        </mesh>
      ))}

      {/* Headstock */}
      <mesh position={[0, 3.0, 0.05]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[0.44, 0.72, 0.18]} />
        <meshStandardMaterial color="#3d1e12" roughness={0.25} metalness={0.1} />
      </mesh>

      {/* Gold Tuning Pegs */}
      {[-0.27, 0.27].map((x, xi) =>
        [2.78, 2.98, 3.18].map((y, yi) => (
          <mesh key={`${xi}-${yi}`} position={[x, y, 0.05]}>
            <cylinderGeometry args={[0.045, 0.045, 0.22, 16]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#e5c158" metalness={0.95} roughness={0.15} />
          </mesh>
        ))
      )}

      {/* Steel/Brass Guitar Strings */}
      {[-0.11, -0.066, -0.022, 0.022, 0.066, 0.11].map((x, i) => (
        <mesh key={i} position={[x, 0.78, 0.155]}>
          <cylinderGeometry args={[0.007, 0.007, 4.9, 8]} />
          <meshStandardMaterial color="#fce592" metalness={0.96} roughness={0.08} envMapIntensity={2.0} />
        </mesh>
      ))}

      {/* Dark Rosewood Bridge & Saddle */}
      <mesh position={[0, -1.3, 0.62]}>
        <boxGeometry args={[0.92, 0.22, 0.08]} />
        <meshStandardMaterial color="#1a0c06" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* White Bridge Pins */}
      {[-0.3, -0.18, -0.06, 0.06, 0.18, 0.3].map((x, bi) => (
        <mesh key={bi} position={[x, -1.3, 0.66]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.5} />
        </mesh>
      ))}
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
      <ProceduralGuitar scrollProgress={scrollProgress} />
    </ModelErrorBoundary>
  )
}
