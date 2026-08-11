import { useEffect, useCallback } from 'react'
import { useTrainStore } from '../store/trainStore'

export function Controls() {
  const throttle = useTrainStore((s) => s.throttle)
  const brake = useTrainStore((s) => s.brake)
  const reverser = useTrainStore((s) => s.reverser)
  const horn = useTrainStore((s) => s.horn)
  const setControl = useTrainStore((s) => s.setControl)

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

  const adjust = useCallback(
    (key: string) => {
      const s = useTrainStore.getState()
      switch (key) {
        case 'w':
        case 'arrowup':
          setControl('throttle', clamp(s.throttle + 0.04, 0, 1))
          break
        case 's':
        case 'arrowdown':
          setControl('throttle', clamp(s.throttle - 0.04, 0, 1))
          break
        case 'a':
        case 'arrowleft':
          setControl('brake', clamp(s.brake + 0.04, 0, 1))
          break
        case 'd':
        case 'arrowright':
          setControl('brake', clamp(s.brake - 0.04, 0, 1))
          break
        case 'q':
          setControl('reverser', 1)
          break
        case 'e':
          setControl('reverser', -1)
          break
        case 'r':
          setControl('reverser', 0)
          break
      }
    },
    [setControl],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === ' ' || key === 'h') {
        e.preventDefault()
        if (!e.repeat) useTrainStore.getState().toggleHorn()
        return
      }
      if (key === 'enter') {
        e.preventDefault()
        useTrainStore.getState().acknowledgeAws()
        return
      }
      if (key === 'backspace') {
        e.preventDefault()
        useTrainStore.getState().reset()
        return
      }
      if (['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'q', 'e', 'r'].includes(key)) {
        e.preventDefault()
        adjust(key)
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if ((key === ' ' || key === 'h') && useTrainStore.getState().horn) {
        useTrainStore.getState().toggleHorn()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [adjust])

  return (
    <div className="controls">
      <div className="row">
        <label>
          Throttle
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={throttle}
            onChange={(e) => setControl('throttle', parseFloat(e.target.value))}
          />
          {Math.round(throttle * 100)}%
        </label>
        <label>
          Brake
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={brake}
            onChange={(e) => setControl('brake', parseFloat(e.target.value))}
          />
          {Math.round(brake * 100)}%
        </label>
      </div>
      <div className="row">
        <div className="btn-group">
          <button className={reverser === 1 ? 'active' : ''} onClick={() => setControl('reverser', 1)}>
            Forward
          </button>
          <button className={reverser === 0 ? 'active' : ''} onClick={() => setControl('reverser', 0)}>
            Neutral
          </button>
          <button className={reverser === -1 ? 'active' : ''} onClick={() => setControl('reverser', -1)}>
            Reverse
          </button>
        </div>
        <button className={horn ? 'active' : ''} onClick={() => useTrainStore.getState().toggleHorn()}>
          Horn
        </button>
        <button onClick={() => useTrainStore.getState().acknowledgeAws()}>AWS Ack</button>
        <button onClick={() => useTrainStore.getState().reset()}>Reset</button>
      </div>
    </div>
  )
}
