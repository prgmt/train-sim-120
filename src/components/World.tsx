import { useRef, useMemo, forwardRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTrainStore } from '../store/trainStore'
import { Station } from './Station'

const SLEEPER_SPACING = 1.5
const SLEEPER_COUNT = 80
const TREE_COUNT = 60
const POLE_COUNT = 30
const TREE_SPACING = 18
const POLE_SPACING = 35

export function World() {
  const trackRef = useRef<THREE.InstancedMesh>(null)
  const trunkRef = useRef<THREE.InstancedMesh>(null)
  const topRef = useRef<THREE.InstancedMesh>(null)
  const poleRef = useRef<THREE.InstancedMesh>(null)
  const signalRef = useRef<THREE.Group>(null)
  const stationARef = useRef<THREE.Group>(null)
  const stationBRef = useRef<THREE.Group>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const store = useTrainStore.getState()

    const mass = 400_000 // kg
    const maxTractive = 350_000 // N
    const maxBrake = 650_000 // N
    const rolling = 12_000 + 0.004 * mass * 9.81
    const air = 0.5 * 1.225 * 11 * store.speed * store.speed
    const gradeForce = 0

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

    let newDistance = store.distance + newSpeed * dt
    const finished = newDistance >= store.routeDistance
    if (finished) {
      newDistance = store.routeDistance
      newSpeed = 0
    }
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
      finished,
      score,
    })

    // track sleepers
    if (trackRef.current) {
      const offset = newDistance % SLEEPER_SPACING
      for (let i = 0; i < SLEEPER_COUNT; i += 1) {
        const z = -4 - i * SLEEPER_SPACING + offset
        dummy.position.set(0, 0.05, z)
        dummy.scale.set(1, 1, 1)
        dummy.rotation.set(0, 0, 0)
        dummy.updateMatrix()
        trackRef.current.setMatrixAt(i, dummy.matrix)
      }
      trackRef.current.instanceMatrix.needsUpdate = true
    }

    // trees
    if (trunkRef.current && topRef.current) {
      for (let i = 0; i < TREE_COUNT; i += 1) {
        const z = -i * TREE_SPACING + (newDistance % TREE_SPACING)
        const side = i % 2 === 0 ? -1 : 1
        const x = side * (5 + (i % 5) * 2.5)
        const scale = 0.8 + (i % 4) * 0.2

        dummy.position.set(x, 0, z)
        dummy.scale.set(scale, scale, scale)
        dummy.rotation.set(0, 0, 0)
        dummy.updateMatrix()
        trunkRef.current.setMatrixAt(i, dummy.matrix)

        dummy.position.set(x, 1.2 * scale, z)
        dummy.updateMatrix()
        topRef.current.setMatrixAt(i, dummy.matrix)
      }
      trunkRef.current.instanceMatrix.needsUpdate = true
      topRef.current.instanceMatrix.needsUpdate = true
    }

    // poles
    if (poleRef.current) {
      for (let i = 0; i < POLE_COUNT; i += 1) {
        const z = -i * POLE_SPACING + (newDistance % POLE_SPACING)
        const side = i % 2 === 0 ? -1 : 1
        dummy.position.set(side * 3.2, 1.8, z)
        dummy.scale.set(1, 1, 1)
        dummy.rotation.set(0, 0, 0)
        dummy.updateMatrix()
        poleRef.current.setMatrixAt(i, dummy.matrix)
      }
      poleRef.current.instanceMatrix.needsUpdate = true
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

    if (stationARef.current) {
      stationARef.current.position.set(3.7, 0, newDistance)
    }
    if (stationBRef.current) {
      stationBRef.current.position.set(-3.7, 0, newDistance - store.routeDistance)
    }
  })

  return (
    <>
      <color attach="background" args={['#87ceeb']} />
      <fog attach="fog" args={['#87ceeb', 50, 400]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[100, 80, -50]} intensity={1.2} castShadow />
      <Ground />
      <Hills />
      <Track ref={trackRef} />
      <Trees trunkRef={trunkRef} topRef={topRef} />
      <Poles ref={poleRef} />
      <Signal ref={signalRef} />
      <Station ref={stationARef} name="Central" side="right" length={80} />
      <Station ref={stationBRef} name="Riverside" side="left" length={100} />
    </>
  )
}

function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -500]} receiveShadow>
        <planeGeometry args={[400, 2000]} />
        <meshStandardMaterial color="#3d7c3d" />
      </mesh>
      {/* road on left side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-25, -0.04, -500]} receiveShadow>
        <planeGeometry args={[8, 2000]} />
        <meshStandardMaterial color="#555" />
      </mesh>
    </group>
  )
}

function Hills() {
  return (
    <group>
      <mesh position={[-120, 25, -600]}>
        <dodecahedronGeometry args={[40]} />
        <meshStandardMaterial color="#2f5a2f" flatShading />
      </mesh>
      <mesh position={[100, 20, -700]}>
        <dodecahedronGeometry args={[50]} />
        <meshStandardMaterial color="#2f5a2f" flatShading />
      </mesh>
      <mesh position={[-60, 15, -900]}>
        <dodecahedronGeometry args={[35]} />
        <meshStandardMaterial color="#2f5a2f" flatShading />
      </mesh>
      <mesh position={[80, 30, -1000]}>
        <dodecahedronGeometry args={[60]} />
        <meshStandardMaterial color="#2f5a2f" flatShading />
      </mesh>
      {/* distant forested ridge */}
      <mesh position={[-200, 10, -400]}>
        <dodecahedronGeometry args={[80]} />
        <meshStandardMaterial color="#1f4a1f" flatShading />
      </mesh>
    </group>
  )
}

const Track = forwardRef<THREE.InstancedMesh>(function Track(_, ref) {
  const sleeperGeo = useMemo(() => new THREE.BoxGeometry(3.6, 0.12, 0.55), [])
  const sleeperMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a3b2a' }), [])

  return (
    <group>
      <mesh position={[-1.5, 0.04, -500]}>
        <boxGeometry args={[0.12, 0.07, 2000]} />
        <meshStandardMaterial color="#777" />
      </mesh>
      <mesh position={[1.5, 0.04, -500]}>
        <boxGeometry args={[0.12, 0.07, 2000]} />
        <meshStandardMaterial color="#777" />
      </mesh>
      <mesh position={[0, 0.02, -500]}>
        <boxGeometry args={[4.2, 0.08, 2000]} />
        <meshStandardMaterial color="#6a6a6a" />
      </mesh>
      <instancedMesh ref={ref} args={[sleeperGeo, sleeperMat, SLEEPER_COUNT]} />
    </group>
  )
})

function Trees({ trunkRef, topRef }: { trunkRef: RefObject<THREE.InstancedMesh | null>; topRef: RefObject<THREE.InstancedMesh | null> }) {
  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.12, 0.18, 1.2, 8), [])
  const trunkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#5c4033' }), [])
  const topGeo = useMemo(() => new THREE.ConeGeometry(0.9, 2.2, 8), [])
  const topMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2d5a27' }), [])

  return (
    <>
      <instancedMesh ref={trunkRef} args={[trunkGeo, trunkMat, TREE_COUNT]} />
      <instancedMesh ref={topRef} args={[topGeo, topMat, TREE_COUNT]} />
    </>
  )
}

const Poles = forwardRef<THREE.InstancedMesh>(function Poles(_, ref) {
  const poleGeo = useMemo(() => new THREE.CylinderGeometry(0.05, 0.07, 5, 8), [])
  const poleMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#777' }), [])
  return <instancedMesh ref={ref} args={[poleGeo, poleMat, POLE_COUNT]} />
})

const Signal = forwardRef<THREE.Group>(function Signal(_, ref) {
  return (
    <group ref={ref} name="signal">
      <mesh position={[2.5, 2.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 5]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh name="light" position={[2.5, 5, 0]}>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
    </group>
  )
})

