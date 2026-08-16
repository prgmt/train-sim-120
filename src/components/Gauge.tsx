import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface RoundGaugeProps {
  value: number
  min?: number
  max?: number
  label?: string
  unit?: string
  position?: [number, number, number]
  size?: [number, number]
  color?: string
}

function drawRoundGauge(
  ctx: CanvasRenderingContext2D,
  value: number,
  min: number,
  max: number,
  label: string,
  unit: string,
  color: string,
) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  const cx = w / 2
  const cy = h / 2
  const radius = w * 0.4

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#0b0b0b'
  ctx.fillRect(0, 0, w, h)

  // outer ring
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.lineWidth = 6
  ctx.strokeStyle = '#555'
  ctx.stroke()

  // scale ticks and numbers
  const startAngle = Math.PI * 0.8
  const endAngle = Math.PI * 2.2
  const total = endAngle - startAngle
  for (let i = 0; i <= 10; i += 1) {
    const a = startAngle + (i / 10) * total
    const x1 = cx + Math.cos(a) * (radius - 14)
    const y1 = cy + Math.sin(a) * (radius - 14)
    const x2 = cx + Math.cos(a) * (radius - 26)
    const y2 = cy + Math.sin(a) * (radius - 26)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineWidth = 2
    ctx.strokeStyle = '#ccc'
    ctx.stroke()

    const numX = cx + Math.cos(a) * (radius - 38)
    const numY = cy + Math.sin(a) * (radius - 38)
    ctx.fillStyle = '#aaa'
    ctx.font = '18px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(Math.round(min + (i / 10) * (max - min))), numX, numY)
  }

  // colored arc
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const valueAngle = startAngle + ratio * total

  ctx.beginPath()
  ctx.arc(cx, cy, radius - 20, startAngle, valueAngle)
  ctx.lineWidth = 10
  ctx.strokeStyle = color
  ctx.stroke()

  // needle
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(valueAngle)
  ctx.beginPath()
  ctx.moveTo(-8, 0)
  ctx.lineTo(radius - 34, 0)
  ctx.lineWidth = 4
  ctx.strokeStyle = '#fff'
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, 8, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.restore()

  // label
  ctx.fillStyle = '#aaa'
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(label, cx, h - 42)

  // value
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 30px sans-serif'
  ctx.fillText(`${Math.round(value)}`, cx, h - 14)

  // unit
  ctx.fillStyle = '#888'
  ctx.font = '16px sans-serif'
  ctx.fillText(unit, cx, h + 4)
}

export function RoundGauge({
  value,
  min = 0,
  max = 100,
  label = '',
  unit = '',
  position = [0, 0, 0],
  size = [0.3, 0.3],
  color = '#ffaa00',
}: RoundGaugeProps) {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 256
    return c
  }, [])
  const texture = useMemo(() => new THREE.CanvasTexture(canvas), [canvas])

  useFrame(() => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawRoundGauge(ctx, value, min, max, label, unit, color)
    texture.needsUpdate = true
  })

  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  )
}

interface SpeedometerProps {
  value: number
  max?: number
  position?: [number, number, number]
  size?: [number, number]
}

function drawSpeedometer(ctx: CanvasRenderingContext2D, value: number, max: number) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  const cx = w / 2
  const cy = h / 2
  const radius = w * 0.42

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, w, h)

  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.lineWidth = 8
  ctx.strokeStyle = '#444'
  ctx.stroke()

  const startAngle = Math.PI * 0.8
  const endAngle = Math.PI * 2.2
  const total = endAngle - startAngle
  const step = max / 10

  for (let i = 0; i <= 10; i += 1) {
    const a = startAngle + (i / 10) * total
    const isRed = i * step >= 80
    const x1 = cx + Math.cos(a) * (radius - 16)
    const y1 = cy + Math.sin(a) * (radius - 16)
    const x2 = cx + Math.cos(a) * (radius - 30)
    const y2 = cy + Math.sin(a) * (radius - 30)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineWidth = 3
    ctx.strokeStyle = isRed ? '#f44' : '#ccc'
    ctx.stroke()

    const nx = cx + Math.cos(a) * (radius - 44)
    const ny = cy + Math.sin(a) * (radius - 44)
    ctx.fillStyle = isRed ? '#f44' : '#aaa'
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(i * step), nx, ny)
  }

  // red zone arc
  const redRatio = Math.max(0, Math.min(1, (80 - 0) / (max - 0)))
  const redStart = startAngle + redRatio * total
  ctx.beginPath()
  ctx.arc(cx, cy, radius - 22, redStart, endAngle)
  ctx.lineWidth = 12
  ctx.strokeStyle = 'rgba(255, 50, 50, 0.4)'
  ctx.stroke()

  const ratio = Math.max(0, Math.min(1, value / max))
  const valueAngle = startAngle + ratio * total

  ctx.beginPath()
  ctx.arc(cx, cy, radius - 22, startAngle, valueAngle)
  ctx.lineWidth = 12
  ctx.strokeStyle = '#ff9900'
  ctx.stroke()

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(valueAngle)
  ctx.beginPath()
  ctx.moveTo(-10, 0)
  ctx.lineTo(radius - 36, 0)
  ctx.lineWidth = 5
  ctx.strokeStyle = '#fff'
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, 10, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.restore()

  // digital speed
  ctx.fillStyle = '#ff9900'
  ctx.font = 'bold 46px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${Math.round(value)}`, cx, cy + 10)

  ctx.fillStyle = '#aaa'
  ctx.font = 'bold 20px sans-serif'
  ctx.fillText('km/h', cx, cy + 38)
}

export function Speedometer({ value, max = 120, position = [0, 0, 0], size = [0.5, 0.5] }: SpeedometerProps) {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 320
    c.height = 320
    return c
  }, [])
  const texture = useMemo(() => new THREE.CanvasTexture(canvas), [canvas])

  useFrame(() => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawSpeedometer(ctx, value, max)
    texture.needsUpdate = true
  })

  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  )
}

interface DigitalDisplayProps {
  value: string | number
  label?: string
  textColor?: string
  position?: [number, number, number]
  size?: [number, number]
}

function drawDigital(ctx: CanvasRenderingContext2D, value: string | number, label: string, textColor: string) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  ctx.clearRect(0, 0, w, h)

  ctx.fillStyle = '#050505'
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = '#555'
  ctx.lineWidth = 4
  ctx.strokeRect(4, 4, w - 8, h - 8)

  ctx.fillStyle = textColor
  ctx.font = 'bold 40px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(value), w / 2, h / 2 + 6)

  if (label) {
    ctx.fillStyle = '#aaa'
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText(label, w / 2, 20)
  }
}

export function DigitalDisplay({
  value,
  label,
  textColor = '#7fff00',
  position = [0, 0, 0],
  size = [0.5, 0.2],
}: DigitalDisplayProps) {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 100
    return c
  }, [])
  const texture = useMemo(() => new THREE.CanvasTexture(canvas), [canvas])

  useFrame(() => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawDigital(ctx, value, label || '', textColor)
    texture.needsUpdate = true
  })

  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  )
}

interface ScreenProps {
  lines: string[]
  title?: string
  position?: [number, number, number]
  size?: [number, number]
}

function drawScreen(ctx: CanvasRenderingContext2D, lines: string[], title: string) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  ctx.clearRect(0, 0, w, h)

  // bezel
  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#111'
  ctx.fillRect(8, 30, w - 16, h - 60)

  // header
  ctx.fillStyle = '#444'
  ctx.fillRect(8, 6, w - 16, 22)
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(title, 14, 17)

  // content
  ctx.fillStyle = '#9cf'
  ctx.font = '15px monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  lines.forEach((line, i) => {
    ctx.fillText(line, 18, 40 + i * 22)
  })

  // footer buttons
  ctx.fillStyle = '#333'
  ctx.fillRect(8, h - 26, w - 16, 18)
  ctx.fillStyle = '#aaa'
  ctx.font = '12px sans-serif'
  ctx.fillText('[OK]  [MENU]  [BACK]', 14, h - 17)
}

export function Screen({ lines, title = 'INTEL', position = [0, 0, 0], size = [0.6, 0.4] }: ScreenProps) {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 360
    c.height = 240
    return c
  }, [])
  const texture = useMemo(() => new THREE.CanvasTexture(canvas), [canvas])

  useFrame(() => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawScreen(ctx, lines, title)
    texture.needsUpdate = true
  })

  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  )
}

interface NoSmokingProps {
  position?: [number, number, number]
  size?: [number, number]
  rotation?: [number, number, number]
}

function drawNoSmoking(ctx: CanvasRenderingContext2D) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  ctx.clearRect(0, 0, w, h)

  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = '#d00'
  ctx.lineWidth = Math.max(8, w * 0.05)
  ctx.beginPath()
  ctx.arc(w / 2, h / 2, h * 0.4, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(w * 0.22, h * 0.22)
  ctx.lineTo(w * 0.78, h * 0.78)
  ctx.stroke()
}

export function NoSmokingSign({ position = [0, 0, 0], size = [0.2, 0.2], rotation = [0, 0, 0] }: NoSmokingProps) {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 128
    return c
  }, [])
  const texture = useMemo(() => {
    const ctx = canvas.getContext('2d')
    if (ctx) drawNoSmoking(ctx)
    return new THREE.CanvasTexture(canvas)
  }, [canvas])

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

interface WarningLampProps {
  on: boolean
  color: string
  label?: string
  position?: [number, number, number]
  size?: number
}

export function WarningLamp({ on, color, position = [0, 0, 0], size = 0.045 }: WarningLampProps) {
  return (
    <mesh position={position}>
      <circleGeometry args={[size, 32]} />
      <meshStandardMaterial color={on ? color : '#333'} emissive={on ? color : '#000'} emissiveIntensity={on ? 1.5 : 0} />
    </mesh>
  )
}
