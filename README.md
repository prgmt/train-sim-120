# Train Sim 120

A mobile-first, web-based proof-of-concept for a realistic train driving simulator. The experience is built from the driver’s cabin, with real-world controls (throttle, brake, reverser, AWS acknowledge, horn) and simple physics.

## Stack

- **Vite + React + TypeScript** — UI and game loop
- **@react-three/fiber + @react-three/drei + three** — 3D cabin and track rendering
- **Zustand** — game state store

## Run locally

Requires Node.js **>= 22.12.0**.

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Controls

| Action | Keyboard | Touch / Mouse |
|--------|----------|---------------|
| Throttle up/down | `W` / `S` | Throttle slider |
| Brake up/down | `A` / `D` | Brake slider |
| Reverser | `Q` (F), `E` (R), `R` (N) | Forward / Neutral / Reverse buttons |
| Horn | `Space` / `H` | Horn button |
| AWS acknowledge | `Enter` | AWS Ack button |
| Reset scenario | `Backspace` | Reset button |

## What’s in the POC

- First-person driver cabin built from primitives
- Moving track and sleepers
- A distant signal that starts red
- Simplified train physics (mass, tractive effort, rolling & air resistance, braking)
- Instrument overlay: speed, speed limit, brake pressure, throttle, reverser, distance to signal, signal aspect, score
- AWS-style alarm if you approach a red signal too fast or exceed the speed limit — acknowledge in time or emergency brake is applied
- Scoring rewards smooth driving and staying within limits

## Where to add real 3D models

The cabin in `src/components/CabinScene.tsx` is placeholder geometry. Replace the `Cabin()` group with a GLTF/GLB model loaded via `@react-three/drei`'s `useGLTF`:

```tsx
import { useGLTF } from '@react-three/drei'

function Cabin() {
  const { scene } = useGLTF('/models/cabin.glb')
  return <primitive object={scene} />
}
```

Drop model files into `public/models/`.

## Future features (roadmap)

- Multiple real-world train classes with accurate cabs and dashboards
- Realistic routes, tracks, gradients, curves, and stations
- PIS, DSD/vigilance, AWS/TPWS, ETCS signaling
- Weather, time-of-day, and lighting conditions
- Scenario-based challenges (schedule adherence, station stops, failures)
- Scoring and progression system
- Mobile packaging with Capacitor or native wrappers
- Multiplayer dispatching and shared rails
