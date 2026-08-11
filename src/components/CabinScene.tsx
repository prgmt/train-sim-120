import { useRef, useMemo, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTrainStore } from '../store/trainStore'

const SLEEPER_SPACING = 1.5
const SLEEPER_COUNT = 60

export function CabinScene() {
  const trackRef = useRef<THREE.InstancedMesh>(null)
  const signalRef = useRef<THREE.Group>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const store = useTrainStore.getState()

    const mass = 400_000 // kg
    const maxTractive = 350_000 // N
    const maxBrake = 650_000 // N
    const rolling = 12_000 + 0.004 * mass * 9.81
    const air = 0.5 * 1.225 * 11 * store.speed * store.speed
    const gradeForce = 0 // flat POC track

    let force = 0
    if (store.reverser !== 0) {
      force += store.throttle * maxTractive * Math.sign(store.reverser)
    }

    const brakeForce = store.brake * maxBrake + (store.emergencyBrake ? maxBrake : 0)
    const drag = (rolling + air) * Math.sign(store.speed || 0)
    force -= brakeForce * Math.sign(store.speed || 0)
    force -= drag + gradeForce

    let newSpeed = store.speed + (force / mass) * dt
    if (newSpeed < 0) newSpeed = 0

    const newDistance = store.distance + newSpeed * dt
    const distToSignal = store.signalDistance - newDistance

    const approachingRed = store.signalRed && distToSignal > 0 && distToSignal < 600
    const overspeed = newSpeed > store.speedLimit

    let alarm = store.awsAlarm
    let alarmTimer = store.alarmTimer
    if (approachingRed || overspeed) {
      if (!alarm) {
        alarm = true
        alarmTimer = 0
      } else {
        alarmTimer += dt
      }
    } else {
      alarm = false
      alarmTimer = 0
    }

    let emergency = store.emergencyBrake
    if (alarm && alarmTimer > 3 && !store.awsAcknowledged) {
      emergency = true
    }
    if (store.signalRed && distToSignal < 0 && newSpeed > 0.5) {
      emergency = true
    }

    let score = store.score
    if (!emergency) {
      score += newSpeed * dt * 0.05
      if (newSpeed <= store.speedLimit) score += dt * 0.2
    } else {
      score -= dt * 5
    }

    useTrainStore.setState({
      speed: newSpeed,
      distance: newDistance,
      awsAlarm: alarm,
      alarmTimer,
      emergencyBrake: emergency,
      score,
    })

    if (trackRef.current) {
      const offset = newDistance % SLEEPER_SPACING
      for (let i = 0; i < SLEEPER_COUNT; i += 1) {
        const z = -5 - i * SLEEPER_SPACING + offset
        dummy.position.set(0, 0, z)
        dummy.updateMatrix()
        trackRef.current.setMatrixAt(i, dummy.matrix)
      }
      trackRef.current.instanceMatrix.needsUpdate = true
    }

    if (signalRef.current) {
      const signalZ = newDistance - store.signalDistance
      signalRef.current.position.set(0, 0, signalZ)
      const light = signalRef.current.getObjectByName('light') as THREE.Mesh | undefined
      if (light) {
        const mat = light.material as THREE.MeshStandardMaterial
        const color = store.signalRed ? 0xff0000 : 0x00ff00
        mat.emissive.setHex(color)
        mat.color.setHex(color)
      }
    }
  })

  return (
    <>
      <color attach="background" args={['#87ceeb']} />
      <fog attach="fog" args={['#87ceeb', 30, 90]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />
      <Cabin />
      <Track ref={trackRef} />
      <Signal ref={signalRef} />
    </>
  )
}

function Cabin() {
  return (
    <group>
      <mesh position={[0, -0.05, -2]} receiveShadow>
        <boxGeometry args={[4, 0.1, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-2, 2, -2]}>
        <boxGeometry args={[0.1, 4, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[2, 2, -2]}>
        <boxGeometry args={[0.1, 4, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0, 4, -2]}>
        <boxGeometry args={[4, 0.1, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[-2, 2, -6]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.1, 4, 4]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0, 1.2, -1.5]} castShadow>
        <boxGeometry args={[3.5, 0.8, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0.5, 0.5]} castShadow>
        <boxGeometry args={[1.2, 0.5, 1]} />
        <meshStandardMaterial color="#3d2e20" />
      </mesh>
      <mesh position={[0, 2.1, -1.75]}>
        <boxGeometry args={[3.2, 1.3, 0.05]} />
        <meshPhysicalMaterial
          color="#aaddff"
          transparent
          opacity={0.25}
          roughness={0}
          metalness={0.1}
          transmission={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

const Track = forwardRef<THREE.InstancedMesh>(function Track(_, ref) {
  const sleeperGeo = useMemo(() => new THREE.BoxGeometry(3.6, 0.15, 0.6), [])
  const sleeperMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3d2e20' }), [])

  return (
    <group>
      <mesh position={[-1.5, 0.05, -50]}>
        <boxGeometry args={[0.12, 0.08, 200]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[1.5, 0.05, -50]}>
        <boxGeometry args={[0.12, 0.08, 200]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[0, -0.1, -50]} receiveShadow>
        <boxGeometry args={[8, 0.1, 200]} />
        <meshStandardMaterial color="#3b7c3b" />
      </mesh>
      <instancedMesh ref={ref} args={[sleeperGeo, sleeperMat, SLEEPER_COUNT]} />
    </group>
  )
})

const Signal = forwardRef<THREE.Group>(function Signal(_, ref) {
  return (
    <group ref={ref} name="signal">
      <mesh position={[2.5, 2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 4]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh name="light" position={[2.5, 4, 0]}>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
    </group>
  )
})
