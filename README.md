# Train Sim 120

A mobile-first, web-based proof-of-concept for a realistic train driving simulator. The experience is built from the driver’s cabin, with real-world controls (throttle, brake, reverser, AWS acknowledge, horn), a look-around camera, a detailed 3D dashboard, and simple physics.

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

The dev server runs on port `5254` by default. Open `http://localhost:5254`.

## Controls

| Action | Keyboard | Touch / Mouse |
|--------|----------|---------------|
| Throttle up/down | `W` / `S` | Throttle slider |
| Brake up/down | `A` / `D` | Brake slider |
| Reverser | `Q` (F), `E` (R), `R` (N) | Forward / Neutral / Reverse buttons |
| Horn | `Space` / `H` | Horn button |
| AWS acknowledge | `Enter` | AWS Ack button |
| Reset scenario | `Backspace` | Reset button |
| Look around | — | Drag / swipe (mouse or touch) |

## What’s in the POC

- First-person driver cabin with mouse/touch look-around
- 3D dashboard with speedometer, brake pressure, throttle, signal/distance displays, and a route screen
- Moving track, sleepers, trees, poles, hills, and a distant signal
- Simplified train physics (mass, tractive effort, rolling & air resistance, braking)
- Instrument overlay: speed, speed limit, brake pressure, throttle, reverser, distance to signal, signal aspect, score
- AWS-style alarm if you approach a red signal too fast or exceed the speed limit — acknowledge in time or emergency brake is applied
- Scoring rewards smooth driving and staying within limits
- GLTF cockpit loader — place a `public/models/cockpit.glb` model to replace the procedural cockpit

## Where to add real 3D models

The cabin in `src/components/Cockpit.tsx` is procedural placeholder geometry. `src/components/CockpitModel.tsx` already tries to load a GLTF cockpit from `/models/cockpit.glb` and falls back to the procedural cockpit if the model is missing.

Drop a model into `public/models/cockpit.glb` to swap in a real train cab. For other assets (tracks, scenery, signals) use the same pattern and attach them to the scene from `src/components/World.tsx`.

## Future features (roadmap)

- Multiple real-world train classes with accurate cabs and dashboards
- Realistic routes, tracks, gradients, curves, and stations
- PIS, DSD/vigilance, AWS/TPWS, ETCS signaling
- Weather, time-of-day, and lighting conditions
- Scenario-based challenges (schedule adherence, station stops, failures)
- Scoring and progression system
- Mobile packaging with Capacitor or native wrappers
- Multiplayer dispatching and shared rails
