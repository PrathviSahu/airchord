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
const MODEL_FILE = 'guitar.glb'

const ext = MODEL_FILE.split('.').pop()?.toLowerCase() ?? ''

// ── Material enhancer — preserves original Blender materials & adds environmental reflections ──
function enhanceMaterials(object: THREE.Object3D) {
  object.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      mesh.castShadow = true
      mesh.receiveShadow = true

      if (mesh.material) {
        const updateMat = (mat: THREE.Material) => {
          if ('envMapIntensity' in mat) {
            (mat as any).envMapIntensity = 1.6
          }
          if ('roughness' in mat && typeof (mat as any).roughness === 'number') {
            (mat as any).roughness = Math.min(0.4, (mat as any).roughness)
          }
          return mat
        }
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(updateMat)
        } else {
          mesh.material = updateMat(mesh.material)
        }
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

    // Align model so neck points UP (+Y) and front face points forward (+Z)
    scene.rotation.set(0, Math.PI / 2, Math.PI / 2)
    scene.updateMatrixWorld(true)

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

// ── Sleek Minimalist 3D Spinner Fallback ──────────────────────────────────
function LoadingPlaceholder() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 1.5
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.8) * 0.3
    }
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[1.4, 0.03, 16, 100]} />
      <meshStandardMaterial color="#c084fc" metalness={0.9} roughness={0.1} emissive="#7c3aed" emissiveIntensity={0.5} />
    </mesh>
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
    console.warn('3D model fetch notice:', error)
  }
  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
interface RealGuitarProps {
  scrollProgress: React.MutableRefObject<number>
}

// Preload 380KB GLTF model for instantaneous rendering across all devices
if (ext === 'glb' || ext === 'gltf') {
  try {
    useGLTF.preload(`/models/${MODEL_FILE}`)
  } catch {}
}

export default function RealGuitar3D({ scrollProgress }: RealGuitarProps) {
  return (
    <ModelErrorBoundary fallback={<LoadingPlaceholder />}>
      <Suspense fallback={<LoadingPlaceholder />}>
        {(ext === 'glb' || ext === 'gltf') && <GLTFGuitar scrollProgress={scrollProgress} />}
        {ext === 'obj' && <OBJGuitar scrollProgress={scrollProgress} />}
        {ext === 'fbx' && <FBXGuitar scrollProgress={scrollProgress} />}
      </Suspense>
    </ModelErrorBoundary>
  )
}
