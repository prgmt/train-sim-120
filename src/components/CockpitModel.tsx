import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Cockpit, CameraRig } from './Cockpit'

// Drop a real cab model in public/models/cockpit.glb and set this to '/models/cockpit.glb'
const COCKPIT_MODEL_URL: string | null = null

export function CockpitModel() {
  const [model, setModel] = useState<THREE.Group | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!COCKPIT_MODEL_URL) {
      setError(true)
      return
    }
    const loader = new GLTFLoader()
    loader.load(
      COCKPIT_MODEL_URL,
      (gltf: GLTF) => {
        gltf.scene.traverse((child: THREE.Object3D) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            mesh.castShadow = true
            mesh.receiveShadow = true
          }
        })
        setModel(gltf.scene)
      },
      undefined,
      () => setError(true),
    )
  }, [])

  return (
    <>
      <CameraRig />
      {model && <primitive object={model} position={[0, 0, 0]} />}
      {!model && !error && <Cockpit />}
      {error && <Cockpit />}
    </>
  )
}
