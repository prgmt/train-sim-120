import { useTrainStore } from '../store/trainStore'

function kmh(ms: number) {
  return Math.round(ms * 3.6)
}

function mbar(ratio: number) {
  return Math.round(ratio * 5 * 100) // 0..1 maps to 0..500 kPa
}

export function Instruments() {
  const speed = useTrainStore((s) => s.speed)
  const speedLimit = useTrainStore((s) => s.speedLimit)
  const brake = useTrainStore((s) => s.brake)
  const throttle = useTrainStore((s) => s.throttle)
  const reverser = useTrainStore((s) => s.reverser)
  const distance = useTrainStore((s) => s.distance)
  const score = useTrainStore((s) => s.score)
  const awsAlarm = useTrainStore((s) => s.awsAlarm)
  const emergency = useTrainStore((s) => s.emergencyBrake)
  const signalRed = useTrainStore((s) => s.signalRed)
  const signalDistance = useTrainStore((s) => s.signalDistance)
  const dist = Math.max(0, Math.round(signalDistance - distance))

  return (
    <div className="instruments">
      <div className="gauge speed">
        <span className="value" style={{ color: speed > speedLimit ? '#ff4444' : '#fff' }}>
          {kmh(speed)}
        </span>
        <span className="label">km/h</span>
      </div>
      <div className="gauge">
        <span className="value">{kmh(speedLimit)}</span>
        <span className="label">limit</span>
      </div>
      <div className="gauge">
        <span className="value">{mbar(brake)}</span>
        <span className="label">brake kPa</span>
      </div>
      <div className="gauge">
        <span className="value">{Math.round(throttle * 100)}%</span>
        <span className="label">throttle</span>
      </div>
      <div className="gauge">
        <span className="value">{reverser > 0 ? 'F' : reverser < 0 ? 'R' : 'N'}</span>
        <span className="label">reverser</span>
      </div>
      <div className="gauge">
        <span className="value">{dist}m</span>
        <span className="label">to signal</span>
      </div>
      <div className="gauge">
        <span className="value" style={{ color: signalRed ? '#ff4444' : '#44ff44' }}>
          {signalRed ? 'RED' : 'GREEN'}
        </span>
        <span className="label">signal</span>
      </div>
      <div className="gauge">
        <span className="value">{Math.floor(score)}</span>
        <span className="label">score</span>
      </div>
      {awsAlarm && <div className="alarm">AWS ALARM — ACKNOWLEDGE</div>}
      {emergency && <div className="emergency">EMERGENCY BRAKE</div>}
    </div>
  )
}
