import { useMemo } from 'react'
import * as THREE from 'three'
import { useTrainStore } from '../store/trainStore'
import { RoundGauge, Speedometer, DigitalDisplay, Screen, WarningLamp } from './Gauge'

function kmh(ms: number) {
  return Math.round(ms * 3.6)
}

function mbar(ratio: number) {
  return Math.round(ratio * 5 * 100)
}

export function Dashboard() {
  const speed = useTrainStore((s) => s.speed)
  const speedLimit = useTrainStore((s) => s.speedLimit)
  const brake = useTrainStore((s) => s.brake)
  const throttle = useTrainStore((s) => s.throttle)
  const reverser = useTrainStore((s) => s.reverser)
  const distance = useTrainStore((s) => s.distance)
  const routeDistance = useTrainStore((s) => s.routeDistance)
  const startStation = useTrainStore((s) => s.startStation)
  const endStation = useTrainStore((s) => s.endStation)
  const finished = useTrainStore((s) => s.finished)
  const signalDistance = useTrainStore((s) => s.signalDistance)
  const signalRed = useTrainStore((s) => s.signalRed)
  const score = useTrainStore((s) => s.score)
  const awsAlarm = useTrainStore((s) => s.awsAlarm)
  const emergencyBrake = useTrainStore((s) => s.emergencyBrake)
  const horn = useTrainStore((s) => s.horn)

  const distToSignal = Math.max(0, Math.round(signalDistance - distance))
  const distToFinish = Math.max(0, Math.round(routeDistance - distance))
  const brakePipe = mbar(1 - brake)

  const screenLines = useMemo(
    () => [
      `${startStation} -> ${endStation}`,
      `To finish: ${distToFinish} m`,
      `Speed limit: ${kmh(speedLimit)} km/h`,
      `Next signal: ${distToSignal} m`,
      `Aspect: ${signalRed ? 'RED' : 'GREEN'}`,
      finished ? `>>> FINISHED <<<` : `Score: ${Math.floor(score)}`,
    ],
    [startStation, endStation, distToFinish, speedLimit, distToSignal, signalRed, finished, score],
  )

  return (
    <group position={[0, 0.42, -1.12]}>
      {/* main instrument panel */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 0.75, 0.08]} />
        <meshStandardMaterial color="#252525" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* left gauge cluster */}
      <group position={[-0.72, 0.1, 0.05]}>
        <RoundGauge
          value={brakePipe}
          min={0}
          max={500}
          label="BP"
          unit="kPa"
          color={brakePipe < 250 ? '#ff0000' : '#ffaa00'}
          position={[-0.16, 0.12, 0]}
          size={[0.22, 0.22]}
        />
        <RoundGauge
          value={throttle * 100}
          min={0}
          max={100}
          label="TR"
          unit="%"
          color="#00aaff"
          position={[0.16, 0.12, 0]}
          size={[0.22, 0.22]}
        />
        <DigitalDisplay
          value={`${kmh(speedLimit)} km/h`}
          label="LIMIT"
          position={[0, -0.12, 0]}
          size={[0.45, 0.12]}
        />
      </group>

      {/* main speedometer */}
      <Speedometer value={kmh(speed)} max={120} position={[0.1, 0.14, 0.05]} size={[0.48, 0.48]} />

      {/* INTEL screen and brake display */}
      <group position={[0.82, 0.12, 0.05]}>
        <Screen lines={screenLines} title="INTEL" position={[0, 0.1, 0]} size={[0.58, 0.36]} />
        <DigitalDisplay
          value={`${brakePipe} kPa`}
          label="BRAKE PIPE"
          textColor={brakePipe < 250 ? '#ff0000' : '#ff9900'}
          position={[0, -0.18, 0]}
          size={[0.5, 0.12]}
        />
      </group>

      {/* warning lamps */}
      <group position={[0.05, -0.2, 0.06]}>
        <WarningLamp on={awsAlarm} color="#f00" position={[-0.4, 0, 0]} />
        <WarningLamp on={!emergencyBrake && speed > 0.1} color="#0f0" position={[-0.14, 0, 0]} />
        <WarningLamp on={reverser !== 0} color="#ffcc00" position={[0.14, 0, 0]} />
        <WarningLamp on={horn} color="#0af" position={[0.4, 0, 0]} />
      </group>

      {/* keypad */}
      <Keypad position={[0.82, -0.24, 0.06]} />

      {/* button row */}
      <ButtonRow y={-0.33} />
    </group>
  )
}

function Keypad({ position }: { position: [number, number, number] }) {
  const buttons = useMemo(() => {
    const arr: THREE.Vector3[] = []
    for (let r = 0; r < 4; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        arr.push(new THREE.Vector3((c - 1) * 0.07, (1 - r) * 0.07, 0))
      }
    }
    return arr
  }, [])

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.28, 0.38, 0.02]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {buttons.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, 0.015]}>
          <boxGeometry args={[0.05, 0.05, 0.02]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      ))}
    </group>
  )
}

function ButtonRow({ y }: { y: number }) {
  const count = 8
  const startX = -0.9
  const gap = 0.26
  return (
    <group position={[0, y, 0.07]}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[startX + i * gap, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshStandardMaterial color={i === 2 ? '#c00' : i === 3 ? '#0c0' : '#666'} />
        </mesh>
      ))}
    </group>
  )
}
