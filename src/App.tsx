import { Canvas } from '@react-three/fiber'
import { CabinScene } from './components/CabinScene'
import { Controls } from './components/Controls'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas gl={{ alpha: false }} camera={{ position: [0, 1.45, 1.6], fov: 70, near: 0.1, far: 1000 }}>
        <CabinScene />
      </Canvas>
      <div className="ui-overlay">
        <Controls />
      </div>
    </div>
  )
}

export default App
