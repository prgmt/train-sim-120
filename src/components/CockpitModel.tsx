import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Cockpit, CameraRig } from './Cockpit'

const COCKPIT_MODEL_URL = '/models/cockpit.glb'

export function CockpitModel() {
  const [model, setModel] = useState<THREE.Group | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
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
