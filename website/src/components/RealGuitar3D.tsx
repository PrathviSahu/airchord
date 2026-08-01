import { useRef, useEffect, Suspense, Component, ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_FILE = 'guitar.glb'
const ext = MODEL_FILE.split('.').pop()?.toLowerCase() ?? ''

function enhanceMaterials(object: THREE.Object3D) {
  object.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      // Enable shadows but preserve ALL original Blender material properties
      mesh.castShadow = true
      mesh.receiveShadow = true

      const applyMat = (mat: THREE.Material) => {
        // Mark material as needing update so textures/colors render correctly on mobile
        mat.needsUpdate = true
        // Do NOT override color, roughness, metalness, or envMapIntensity
        // — let the original Blender-exported values come through exactly
        return mat
      }

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(applyMat)
      } else if (mesh.material) {
        applyMat(mesh.material)
      }
    }
  })
}

function GLTFGuitar({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const { scene } = useGLTF(`/models/${MODEL_FILE}`)
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!scene) return
    enhanceMaterials(scene)

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
