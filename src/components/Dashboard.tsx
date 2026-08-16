import { useMemo } from 'react'
import { useTrainStore } from '../store/trainStore'
import { RoundGauge, DigitalDisplay, Screen } from './Gauge'
import * as THREE from 'three'

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

  const distToSignal = Math.max(0, Math.round(signalDistance - distance))
  const distToFinish = Math.max(0, Math.round(routeDistance - distance))
  const screenLines = useMemo(
    () => [
      `From: ${startStation}`,
      `To: ${endStation}`,
      `To finish: ${distToFinish} m`,
      `Speed limit: ${kmh(speedLimit)} km/h`,
      `Next signal: ${distToSignal} m`,
      `Aspect: ${signalRed ? 'RED' : 'GREEN'}`,
      finished ? `>>> FINISHED <<<` : `Score: ${Math.floor(score)}`,
    ],
    [startStation, endStation, distToFinish, speedLimit, distToSignal, signalRed, finished, score],
  )

  return (
    <group position={[0, 0.82, -1.55]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.8, 0.9, 0.12]} />
        <meshStandardMaterial color="#151515" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* left screen */}
      <Screen lines={screenLines} position={[-1.35, 0.08, 0.07]} size={[0.9, 0.55]} />

      {/* dual gauge screen placeholder */}
      <mesh position={[-0.35, 0.08, 0.07]}>
        <planeGeometry args={[0.7, 0.5]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>
      <RoundGauge
        value={kmh(speed)}
        min={0}
        max={160}
        label="km/h"
        unit=""
        color="#ffaa00"
        position={[-0.5, 0.12, 0.08]}
        size={[0.26, 0.26]}
      />
      <RoundGauge
        value={throttle * 100}
        min={0}
        max={100}
        label="PWR"
        unit="%"
        color="#00aaff"
        position={[-0.2, 0.12, 0.08]}
        size={[0.26, 0.26]}
      />

      {/* main speedometer */}
      <RoundGauge
        value={kmh(speed)}
        min={0}
        max={160}
        label="SPEED"
        unit="km/h"
        color="#ffaa00"
        position={[0.35, 0.12, 0.08]}
        size={[0.55, 0.55]}
      />

      {/* right displays */}
      <DigitalDisplay value={`${kmh(speedLimit)} km/h`} label="LIMIT" position={[0.95, 0.25, 0.08]} size={[0.55, 0.16]} />
      <DigitalDisplay value={`${mbar(brake)} kPa`} label="BRAKE" position={[0.95, 0.05, 0.08]} size={[0.55, 0.16]} />
      <DigitalDisplay value={reverser > 0 ? 'F' : reverser < 0 ? 'R' : 'N'} label="REV" position={[0.95, -0.15, 0.08]} size={[0.55, 0.16]} />

      <RoundGauge
        value={mbar(brake)}
        min={0}
        max={500}
        label="BP"
        unit="kPa"
        color="#ff4400"
        position={[1.45, 0.18, 0.08]}
        size={[0.35, 0.35]}
      />
      <RoundGauge
        value={throttle * 100}
        min={0}
        max={100}
        label="THR"
        unit="%"
        color="#00ff44"
        position={[1.45, -0.22, 0.08]}
        size={[0.35, 0.35]}
      />

      {/* keypad */}
      <Keypad position={[0.35, -0.28, 0.08]} />

      {/* button rows */}
      <ButtonRow y={-0.42} />
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
  const startX = -1.5
  const gap = 0.22
  return (
    <group position={[0, y, 0.07]}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[startX + i * gap, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshStandardMaterial color={i === 2 ? '#c00' : i === 3 ? '#0c0' : '#555'} />
        </mesh>
      ))}
    </group>
  )
}
