import { useEffect, useRef } from 'react'

const SENSITIVITY = 0.003
const MIN_YAW = -1.4
const MAX_YAW = 1.4
const MIN_PITCH = -0.6
const MAX_PITCH = 0.4

export function useLook() {
  const euler = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.tagName !== 'CANVAS') return
      dragging.current = true
      last.current = { x: e.clientX, y: e.clientY }
    }

    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - last.current.x
      const dy = e.clientY - last.current.y
      last.current = { x: e.clientX, y: e.clientY }

      euler.current.x -= dx * SENSITIVITY
      euler.current.y -= dy * SENSITIVITY

      euler.current.x = Math.max(MIN_YAW, Math.min(MAX_YAW, euler.current.x))
      euler.current.y = Math.max(MIN_PITCH, Math.min(MAX_PITCH, euler.current.y))
    }

    const onUp = () => {
      dragging.current = false
    }

    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  return euler
}
