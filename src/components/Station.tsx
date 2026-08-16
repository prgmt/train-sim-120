import { forwardRef, useMemo } from 'react'
import * as THREE from 'three'

interface StationProps {
  name: string
  side: 'left' | 'right'
  length?: number
}

function createSignTexture(name: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.fillStyle = '#003366'
  ctx.fillRect(0, 0, 512, 128)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 60px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(name, 256, 64)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export const Station = forwardRef<THREE.Group, StationProps>(function Station(
  { name, side, length = 80 },
  ref,
) {
  const x = side === 'left' ? -3.7 : 3.7
  const signRotation = side === 'left' ? -Math.PI / 2 : Math.PI / 2
  const signTexture = useMemo(() => createSignTexture(name), [name])
  const half = length / 2

  const pillarCount = Math.max(2, Math.floor(length / 10) + 1)
  const pillarZs = useMemo(() => {
    const arr: number[] = []
    for (let i = 0; i < pillarCount; i += 1) {
      arr.push(-half + (i / (pillarCount - 1)) * length)
    }
    return arr
  }, [pillarCount, length, half])

  return (
    <group ref={ref} position={[x, 0, 0]}>
      {/* platform */}
      <mesh position={[0, 0.075, 0]} receiveShadow>
        <boxGeometry args={[3, 0.15, length]} />
        <meshStandardMaterial color="#777" />
      </mesh>

      {/* platform safety line */}
      <mesh position={[side === 'left' ? 1.45 : -1.45, 0.085, 0]}>
        <boxGeometry args={[0.08, 0.02, length]} />
        <meshStandardMaterial color="#ffcc00" />
      </mesh>

      {/* canopy roof */}
      <mesh position={[0, 3.0, 0]}>
        <boxGeometry args={[2.8, 0.1, length]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* canopy pillars */}
      {pillarZs.map((z, i) => (
        <mesh key={i} position={[0, 1.5, z]}>
          <boxGeometry args={[0.12, 3, 0.12]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      ))}

      {/* small station building / shelter */}
      <mesh position={[0, 1.5, half - 12]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 3, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* station sign at the front */}
      <group position={[0, 2.4, -half + 2]}>
        <mesh position={[0, 0, 0]} rotation={[0, signRotation, 0]}>
          <planeGeometry args={[3, 0.75]} />
          <meshBasicMaterial map={signTexture} transparent toneMapped={false} />
        </mesh>
        <mesh position={[0, -1.0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 2]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      </group>
    </group>
  )
})
