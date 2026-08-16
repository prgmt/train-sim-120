import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useLook } from '../hooks/useLook'
import { Dashboard } from './Dashboard'
import { useTrainStore } from '../store/trainStore'

export function Cockpit() {
  return (
    <group>
      <CabinShell />
      <Dashboard />
      <ControlLevers />
    </group>
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
    <group ref={ref} position={[0, 1.7, 1.6]}>
      <PerspectiveCamera makeDefault fov={70} near={0.1} far={3000} />
    </group>
  )
}

function CabinShell() {
  const glassMat = (
    <meshBasicMaterial color="#aaccff" transparent opacity={0.15} side={THREE.DoubleSide} />
  )

  return (
    <group>
      {/* floor */}
      <mesh position={[0, -0.02, -1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 8]} />
        <meshStandardMaterial color="#181818" roughness={0.8} />
      </mesh>
      {/* roof */}
      <mesh position={[0, 3.2, -2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* front wall below windshield */}
      <mesh position={[0, 0.4, -1.6]}>
        <boxGeometry args={[5, 0.8, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* dashboard top filler */}
      <mesh position={[0, 1.05, -1.59]}>
        <boxGeometry args={[4, 0.2, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* front windshield */}
      <mesh position={[0, 2.05, -1.56]}>
        <planeGeometry args={[4.6, 2.0]} />
        {glassMat}
      </mesh>
      <SideWall side="left" position={[-2.45, 0, -1]} />
      <SideWall side="right" position={[2.45, 0, -1]} />
      {/* pillars */}
      <Pillar position={[-2.35, 1.4, -1.6]} />
      <Pillar position={[2.35, 1.4, -1.6]} />
    </group>
  )
}

function SideWall({ side, position }: { side: 'left' | 'right'; position: [number, number, number] }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-5, 0)
    shape.lineTo(3, 0)
    shape.lineTo(3, 3.6)
    shape.lineTo(-5, 3.6)
    shape.lineTo(-5, 0)

    const hole = new THREE.Path()
    hole.moveTo(-2.8, 0.0)
    hole.lineTo(-2.8, 2.0)
    hole.lineTo(0.8, 2.0)
    hole.lineTo(0.8, 0.0)
    hole.lineTo(-2.8, 0.0)
    shape.holes.push(hole)

    return new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false, curveSegments: 1 })
  }, [])

  const glassMat = useMemo(
    () => <meshBasicMaterial color="#aaccff" transparent opacity={0.15} side={THREE.DoubleSide} />,
    [],
  )

  const scale: [number, number, number] = side === 'left' ? [1, 1, -1] : [1, 1, 1]

  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]} scale={scale}>
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshStandardMaterial color="#202020" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-1.0, 1.05, 0.05]}>
        <planeGeometry args={[3.6, 1.9]} />
        {glassMat}
      </mesh>
    </group>
  )
}

function Pillar({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.15, 3.4, 0.15]} />
      <meshStandardMaterial color="#111" />
    </mesh>
  )
}

function ControlLevers() {
  const throttle = useTrainStore((s) => s.throttle)
  const brake = useTrainStore((s) => s.brake)

  return (
    <group position={[1.6, 0.9, 0.4]}>
      {/* throttle lever */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 16]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[0.5 + throttle * 0.8, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
        <meshStandardMaterial color="#888" />
      </mesh>

      {/* brake lever */}
      <mesh position={[0.25, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 16]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0.25, 0.3, 0]} rotation={[0.5 + brake * 0.8, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
        <meshStandardMaterial color="#a44" />
      </mesh>
    </group>
  )
}
