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
    <Suspense fallback={<LoadingPlaceholder />}>
      {ext === 'fbx' && <FBXGuitar scrollProgress={scrollProgress} />}
      {ext === 'obj' && <OBJGuitar scrollProgress={scrollProgress} />}
      {(ext === 'glb' || ext === 'gltf') && <GLTFGuitar scrollProgress={scrollProgress} />}
    </Suspense>
  )
}
