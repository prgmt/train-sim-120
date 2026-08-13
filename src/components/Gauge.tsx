import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface RoundGaugeProps {
  value: number
  min: number
  max: number
  label: string
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

  // background
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fillStyle = '#0b0b0b'
  ctx.fill()

  // outer ring
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.lineWidth = 6
  ctx.strokeStyle = '#333'
  ctx.stroke()

  // scale ticks
  const startAngle = Math.PI * 0.75
  const endAngle = Math.PI * 2.25
  const total = endAngle - startAngle
  for (let i = 0; i <= 10; i += 1) {
    const a = startAngle + (i / 10) * total
    const x1 = cx + Math.cos(a) * (radius - 16)
    const y1 = cy + Math.sin(a) * (radius - 16)
    const x2 = cx + Math.cos(a) * (radius - 28)
    const y2 = cy + Math.sin(a) * (radius - 28)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineWidth = 2
    ctx.strokeStyle = '#aaa'
    ctx.stroke()
  }

  // colored arc
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const valueAngle = startAngle + ratio * total

  const grad = ctx.createLinearGradient(0, h, w, 0)
  grad.addColorStop(0, '#0f0')
  grad.addColorStop(0.6, color)
  grad.addColorStop(1, '#f00')

  ctx.beginPath()
  ctx.arc(cx, cy, radius - 20, startAngle, valueAngle)
  ctx.lineWidth = 10
  ctx.strokeStyle = grad
  ctx.stroke()

  // needle
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(valueAngle)
  ctx.beginPath()
  ctx.moveTo(-8, 0)
  ctx.lineTo(radius - 36, 0)
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
  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(label, cx, h - 38)

  // value
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 34px sans-serif'
  ctx.fillText(`${Math.round(value)}`, cx, h - 10)

  // unit
  ctx.fillStyle = '#888'
  ctx.font = '18px sans-serif'
  ctx.fillText(unit, cx, h + 6)
}

export function RoundGauge({ value, min, max, label, unit = '', position = [0, 0, 0], size = [0.4, 0.4], color = '#ffaa00' }: RoundGaugeProps) {
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

interface DigitalDisplayProps {
  value: string | number
  label?: string
  position?: [number, number, number]
  size?: [number, number]
}

function drawDigital(ctx: CanvasRenderingContext2D, value: string | number, label?: string) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  ctx.clearRect(0, 0, w, h)

  ctx.fillStyle = '#081008'
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = '#2a4a2a'
  ctx.lineWidth = 4
  ctx.strokeRect(4, 4, w - 8, h - 8)

  ctx.fillStyle = '#7fff00'
  ctx.font = 'bold 40px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(value), w / 2, h / 2 + 6)

  if (label) {
    ctx.fillStyle = '#aaa'
    ctx.font = '16px sans-serif'
    ctx.fillText(label, w / 2, 20)
  }
}

export function DigitalDisplay({ value, label, position = [0, 0, 0], size = [0.5, 0.2] }: DigitalDisplayProps) {
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
    drawDigital(ctx, value, label)
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
  position?: [number, number, number]
  size?: [number, number]
}

function drawScreen(ctx: CanvasRenderingContext2D, lines: string[]) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  ctx.clearRect(0, 0, w, h)

  ctx.fillStyle = '#050505'
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = '#333'
  ctx.lineWidth = 4
  ctx.strokeRect(4, 4, w - 8, h - 8)

  ctx.fillStyle = '#9cf'
  ctx.font = '16px monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  lines.forEach((line, i) => {
    ctx.fillText(line, 14, 14 + i * 22)
  })
}

export function Screen({ lines, position = [0, 0, 0], size = [0.8, 0.55] }: ScreenProps) {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 320
    c.height = 220
    return c
  }, [])
  const texture = useMemo(() => new THREE.CanvasTexture(canvas), [canvas])

  useFrame(() => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawScreen(ctx, lines)
    texture.needsUpdate = true
  })

  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  )
}
