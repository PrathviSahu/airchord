import { useRef, useEffect, Suspense, Component, ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_FILE = 'guitar.glb'
const ext = MODEL_FILE.split('.').pop()?.toLowerCase() ?? ''

// Material palette — original black guitar color scheme
const MATERIAL_PALETTE: Record<string, {
  color: string
  metalness: number
  roughness: number
}> = {
  // Guitar body — premium obsidian black with subtle sheen
  Material: { color: '#0a0a0c', metalness: 0.15, roughness: 0.18 },
  // Tuner pegs, neck, body parts — deep matte black
  Plastic: { color: '#0d0d0f', metalness: 0.1, roughness: 0.35 },
  // Steel frets, saddle, hardware — polished silver
  Steel: { color: '#d0d0d0', metalness: 0.95, roughness: 0.12 },
  // Wound strings (low E, A, D) — warm gold
  Strings: { color: '#e2c07c', metalness: 0.95, roughness: 0.08 },
  // Plain strings (G, B, high e) — bright steel
  Strings3: { color: '#f0f0f0', metalness: 0.97, roughness: 0.05 },
  // Fretboard dots / nut
  White: { color: '#e8e8e8', metalness: 0.05, roughness: 0.30 },
}

function applyMaterials(object: THREE.Object3D) {
  // Build a cache so we share one material instance per Blender material name
  const matCache = new Map<string, THREE.MeshStandardMaterial>()

  object.traverse(child => {
    if (!(child as THREE.Mesh).isMesh) return
    const mesh = child as THREE.Mesh
    mesh.castShadow = true
    mesh.receiveShadow = true

    const getMat = (old: THREE.Material) => {
      const key = old.name || 'Material'
      if (matCache.has(key)) return matCache.get(key)!

      const preset = MATERIAL_PALETTE[key] ?? MATERIAL_PALETTE['Material']
      const m = new THREE.MeshStandardMaterial({
        color: new THREE.Color(preset.color),
        metalness: preset.metalness,
        roughness: preset.roughness,
        envMapIntensity: 0.8,
      })
      matCache.set(key, m)
      return m
    }

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map(getMat)
    } else if (mesh.material) {
      mesh.material = getMat(mesh.material)
    }
  })
}

function GLTFGuitar({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const { scene } = useGLTF(`/models/${MODEL_FILE}`)
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!scene) return
    applyMaterials(scene)

    scene.rotation.set(0, Math.PI / 2, Math.PI / 2)
    scene.updateMatrixWorld(true)

    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    scene.scale.setScalar(8.8 / maxDim)

    box.setFromObject(scene)
    const center = new THREE.Vector3()
    box.getCenter(center)
    scene.position.sub(center)
  }, [scene])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const scroll = scrollProgress.current
    const t = clock.getElapsedTime()

    const targetRotY = scroll * Math.PI * 2.2
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.06

    groupRef.current.position.y = Math.sin(t * 1.2) * 0.18
    groupRef.current.rotation.z = Math.sin(t * 0.9) * 0.04
    groupRef.current.rotation.x = Math.cos(t * 0.7) * 0.03
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

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

interface RealGuitarProps {
  scrollProgress: React.MutableRefObject<number>
}

if (ext === 'glb' || ext === 'gltf') {
  try {
    useGLTF.preload(`/models/${MODEL_FILE}`)
  } catch {}
}

export default function RealGuitar3D({ scrollProgress }: RealGuitarProps) {
  return (
    <ModelErrorBoundary fallback={<LoadingPlaceholder />}>
      <Suspense fallback={<LoadingPlaceholder />}>
        <GLTFGuitar scrollProgress={scrollProgress} />
      </Suspense>
    </ModelErrorBoundary>
  )
}
