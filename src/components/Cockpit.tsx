import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useLook } from '../hooks/useLook'
import { Dashboard } from './Dashboard'
import { NoSmokingSign } from './Gauge'
import { useTrainStore } from '../store/trainStore'

export function Cockpit() {
  return (
    <group>
      <CabinShell />
      <Dashboard />
      <ControlLevers />
      <CabinLight />
    </group>
  )
}

function CabinLight() {
  return (
    <pointLight
      position={[0, 1.8, 0.2]}
      intensity={0.35}
      color="#fffaf0"
      distance={6}
      decay={2}
    />
  )
}

export function CameraRig() {
  const ref = useRef<THREE.Group>(null)
  const look = useLook()

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y = look.current.x
      ref.current.rotation.x = look.current.y
    }
  })

  return (
    <group ref={ref} position={[0.15, 1.5, 0.05]}>
      <PerspectiveCamera makeDefault fov={70} near={0.1} far={3000} />
    </group>
  )
}

function CabinShell() {
  return (
    <group>
      <Floor />
      <Roof />
      <FrontWall />
      <SideWall side="left" />
      <SideWall side="right" />
      <Seat />
      <ControlDesk />
      <NoSmokingSign
        position={[1.31, 1.05, -0.25]}
        rotation={[0, -Math.PI / 2, 0]}
        size={[0.18, 0.18]}
      />
    </group>
  )
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.2]} receiveShadow>
      <planeGeometry args={[2.9, 4.2]} />
      <meshStandardMaterial color="#2c2c2c" roughness={0.9} />
    </mesh>
  )
}

function Roof() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.1, -0.2]}>
      <planeGeometry args={[2.9, 4.2]} />
      <meshStandardMaterial color="#dcdcd4" roughness={0.8} />
    </mesh>
  )
}

function FrontWall() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-1.45, 0)
    shape.lineTo(1.45, 0)
    shape.lineTo(1.45, 2.1)
    shape.lineTo(-1.45, 2.1)
    shape.lineTo(-1.45, 0)

    const hole = new THREE.Path()
    hole.moveTo(-1.25, 0.85)
    hole.lineTo(1.25, 0.85)
    hole.lineTo(1.25, 1.95)
    hole.lineTo(-1.25, 1.95)
    hole.lineTo(-1.25, 0.85)
    shape.holes.push(hole)

    return new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false, curveSegments: 1 })
  }, [])

  return (
    <group position={[0, 0, -1.3]}>
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshStandardMaterial color="#e8e6dc" roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.4, 0.06]}>
        <planeGeometry args={[2.5, 1.1]} />
        <meshBasicMaterial color="#aaccff" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function SideWall({ side }: { side: 'left' | 'right' }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    const w = 2.0
    const h = 2.1
    shape.moveTo(-w, 0)
    shape.lineTo(w, 0)
    shape.lineTo(w, h)
    shape.lineTo(-w, h)
    shape.lineTo(-w, 0)

    const hole = new THREE.Path()
    const wx1 = -0.5
    const wx2 = 1.3
    const wy1 = 0.25
    const wy2 = 1.7
    hole.moveTo(wx1, wy1)
    hole.lineTo(wx2, wy1)
    hole.lineTo(wx2, wy2)
    hole.lineTo(wx1, wy2)
    hole.lineTo(wx1, wy1)
    shape.holes.push(hole)

    return new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false, curveSegments: 1 })
  }, [])

  const scale: [number, number, number] = side === 'left' ? [1, 1, -1] : [1, 1, 1]
  const x = side === 'left' ? -1.4 : 1.4

  return (
    <group position={[x, 0, -0.4]} rotation={[0, -Math.PI / 2, 0]} scale={scale}>
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshStandardMaterial color="#e8e6dc" roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
      <group position={[0.4, 0.975, 0.05]}>
        <mesh>
          <planeGeometry args={[1.8, 1.45]} />
          <meshBasicMaterial color="#aaccff" transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
        <WindowFrame width={1.8} height={1.45} color="#888" />
      </group>
    </group>
  )
}

function WindowFrame({ width, height, color }: { width: number; height: number; color: string }) {
  const t = 0.04
  const hw = width / 2
  const hh = height / 2
  return (
    <group>
      <mesh position={[0, hh, 0]}>
        <boxGeometry args={[width + t, t, t]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, -hh, 0]}>
        <boxGeometry args={[width + t, t, t]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-hw, 0, 0]}>
        <boxGeometry args={[t, height, t]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[hw, 0, 0]}>
        <boxGeometry args={[t, height, t]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

function Seat() {
  return (
    <group position={[0.85, 0, -0.1]}>
      {/* base */}
      <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
        <boxGeometry args={[0.55, 0.12, 0.55]} />
        <meshStandardMaterial color="#2a5c9e" roughness={0.9} />
      </mesh>
      {/* backrest */}
      <mesh position={[0, 0.45, -0.22]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.55, 0.7, 0.08]} />
        <meshStandardMaterial color="#2a5c9e" roughness={0.9} />
      </mesh>
      {/* headrest */}
      <mesh position={[0, 0.85, -0.28]}>
        <boxGeometry args={[0.42, 0.2, 0.12]} />
        <meshStandardMaterial color="#1a3c6e" roughness={0.9} />
      </mesh>
      {/* left armrest */}
      <mesh position={[-0.28, 0.45, 0]}>
        <boxGeometry args={[0.06, 0.5, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* base frame */}
      <mesh position={[0, 0.04, -0.28]}>
        <boxGeometry args={[0.55, 0.08, 0.1]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  )
}

function ControlDesk() {
  return (
    <group position={[-1.15, 0, -0.2]}>
      {/* main cabinet */}
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[0.5, 0.7, 1.8]} />
        <meshStandardMaterial color="#d0d0c8" roughness={0.7} />
      </mesh>
      {/* sloped worktop */}
      <mesh position={[0, 0.72, 0]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.52, 0.06, 1.7]} />
        <meshStandardMaterial color="#333" roughness={0.6} />
      </mesh>
      {/* side panel */}
      <mesh position={[0.26, 0.4, 0]}>
        <boxGeometry args={[0.04, 0.75, 1.8]} />
        <meshStandardMaterial color="#b0b0a8" />
      </mesh>
      {/* radio handset holder */}
      <mesh position={[0.18, 0.82, 0.35]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.08, 0.18, 0.04]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  )
}

function ControlLevers() {
  const throttle = useTrainStore((s) => s.throttle)
  const brake = useTrainStore((s) => s.brake)

  return (
    <group position={[0.65, 0.72, -0.5]} scale={[0.6, 0.6, 0.6]}>
      <mesh>
        <boxGeometry args={[0.42, 0.05, 0.22]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <Lever value={throttle} color="#888" position={[-0.1, 0.02, 0]} />
      <Lever value={brake} color="#c44" position={[0.1, 0.02, 0]} />
    </group>
  )
}

function Lever({
  value,
  color,
  position,
}: {
  value: number
  color: string
  position: [number, number, number]
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.16, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <group position={[0, 0.16, 0]} rotation={[value * 1.2, 0, 0]}>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.16, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.18, 0.02]}>
          <boxGeometry args={[0.07, 0.04, 0.12]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>
    </group>
  )
}
