<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MANDATORY 60 FPS PERFORMANCE & RENDERING RULES

**CRITICAL INSTRUCTION FOR ALL CODING AGENTS:**
Maintain a silky-smooth, locked 60 FPS gameplay experience at all times. Never alter these settings or introduce code patterns that degrade framerates:

1. **Rapier Physics**: Always use `<Physics timeStep={1 / 60} interpolate={true}>`. NEVER use `timeStep="vary"`.
2. **PointLights & Shadows**: NEVER enable `castShadow={true}` on `PointLight` components (which forces a 6-pass cubemap render). Real-time shadows are reserved exclusively for the player's single `SpotLight` flashlight.
3. **Canvas & WebGL Settings**: Keep `dpr={[1, 1.25]}`, `gl={{ antialias: false, powerPreference: 'high-performance', stencil: false, depth: true, alpha: false }}`, and `frameloop="always"`.
4. **useFrame & Zero-GC**: Never instantiate `new Vector3()` or objects inside `useFrame` loops; pre-allocate in `useRef()`. Always clamp delta `Math.min(delta, 0.05)`.
5. **UI & State**: Use direct DOM updates for high-frequency gameplay elements (e.g., stamina) rather than React state to avoid frame drops.

