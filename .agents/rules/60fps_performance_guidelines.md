# MANDATORY 60 FPS PERFORMANCE & RENDERING ARCHITECTURE RULES

## 🚨 CRITICAL RULE FOR ALL AGENTS
Under NO circumstances should any agent make changes that degrade game performance below a silky-smooth, locked 60 FPS. The following architectural standards are MANDATORY across all 3D components, rendering loops, physics simulations, and UI layers.

---

### 1. ⚙️ Rapier Physics Configuration
- **Fixed 60Hz Timestep**: In `<Physics>`, ALWAYS maintain fixed `timeStep={1 / 60}` and `interpolate={true}`.
- **NEVER use `timeStep="vary"`**: Variable physics timestep causes severe micro-stuttering, velocity jitter, and physics desynchronization during frame delta variances.

---

### 2. 💡 Lighting & Real-Time Shadow Rules
- **NEVER enable `castShadow={true}` on PointLights**:
  - In Three.js / WebGL, point light shadows require a 6-sided cubemap render pass (`+x, -x, +y, -y, +z, -z`).
  - In indoor environments with hundreds of meshes, a single PointLight shadow adds >1,000 extra draw calls every single frame and destroys the framerate (drops from 60 FPS to ~25-30 FPS).
- **SpotLight for Flashlight ONLY**:
  - Real-time shadows are reserved exclusively for the player's flashlight (`<spotLight castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.0005} />`), which executes a single, fast 1-pass perspective shadow render.

---

### 3. 🖥️ WebGL Canvas & Resolution Scaling
- **Canvas Settings (`Game.tsx`)**:
  - `dpr={[1, 1.25]}`: Clamp Device Pixel Ratio to a maximum of `1.25` to avoid Retina/4K fill-rate GPU choking.
  - `gl={{ antialias: false, powerPreference: 'high-performance', stencil: false, depth: true, alpha: false }}`: `alpha: false` avoids unnecessary compositor blending passes with the HTML body.
  - `frameloop="always"` and `performance={{ min: 0.5 }}`.

---

### 4. 🔄 Zero-Garbage-Collection (GC) `useFrame` Loops
- **Pre-allocate Vectors & Objects**:
  - Never call `new Vector3()`, `new Euler()`, `new Matrix4()`, or create temporary object literals inside `useFrame` loops.
  - Pre-allocate reusable `Vector3` instances in component refs (e.g. `frontVec = useRef(new Vector3())`).
- **Clamp Frame Delta**:
  - In `useFrame((_, delta) => ...)`, always clamp delta: `const dt = Math.min(delta, 0.05);` to prevent physics explosions and camera snapping during occasional frame timing fluctuations.
- **Gate Idle Calculations**:
  - If an animated element (like a swinging door or opening fridge) has reached its target position, early exit or gate the interpolation math to avoid wasted CPU cycles.

---

### 5. ⚡ UI & State Management Performance
- **Direct DOM Updates for High-Frequency HUD Elements**:
  - Do NOT trigger React state updates (e.g., `setStamina()`) on every frame tick. Update the DOM element directly (e.g. `staminaBar.style.width = ...`).
- **No Uncontrolled React Re-render Triggers**:
  - Store mutations for high-frequency data (like mini-map coordinates) must not trigger full React component tree re-renders during active gameplay.
