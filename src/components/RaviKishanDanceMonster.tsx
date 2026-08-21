'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, PointLight } from 'three';
import { useGameStore } from '@/store/useGameStore';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// ─── 3D ARTICULATED DANCING RAVI KISHAN MONSTER ──────────────────────────────
export default function RaviKishanDanceMonster() {
  const isStairDanceActive = useGameStore((s) => s.isStairDanceActive);

  // Group references for skeleton hierarchy
  const rootGroupRef = useRef<Group>(null);
  const hipGroupRef = useRef<Group>(null);
  const spineGroupRef = useRef<Group>(null);
  const chestGroupRef = useRef<Group>(null);
  const headGroupRef = useRef<Group>(null);

  // Arm & Shoulder references
  const leftShoulderRef = useRef<Group>(null);
  const rightShoulderRef = useRef<Group>(null);
  const leftUpperArmRef = useRef<Group>(null);
  const rightUpperArmRef = useRef<Group>(null);
  const leftForearmRef = useRef<Group>(null);
  const rightForearmRef = useRef<Group>(null);
  const leftHandRef = useRef<Group>(null);
  const rightHandRef = useRef<Group>(null);

  // Leg references
  const leftThighRef = useRef<Group>(null);
  const rightThighRef = useRef<Group>(null);
  const leftShinRef = useRef<Group>(null);
  const rightShinRef = useRef<Group>(null);
  const leftFootRef = useRef<Group>(null);
  const rightFootRef = useRef<Group>(null);

  // Scarf / Shawl dynamic flow
  const shawlRef = useRef<Group>(null);

  // Stage lights
  const goldSpotRef = useRef<PointLight>(null);
  const magentaLightRef = useRef<PointLight>(null);
  const cyanLightRef = useRef<PointLight>(null);

  // Load Ravi Kishan face texture
  const raviFaceTex = useTexture('/ravi Face.png', (tex) => {
    const t = tex as THREE.Texture;
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
  });

  // Pre-allocated vector for zero garbage collection
  const playerPosCheck = useRef(new Vector3());

  // Particles for celebratory hype aura
  const particleCount = 18;
  const particlePositions = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 0.9 + (i % 3) * 0.25;
      arr.push([Math.cos(angle) * radius, 0.4 + (i * 0.12), Math.sin(angle) * radius]);
    }
    return arr;
  }, [particleCount]);
  const particleRefs = useRef<Group[]>([]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const time = state.clock.elapsedTime;
    const store = useGameStore.getState();
    const camera = state.camera;

    // ─── 1. Grand Staircase Summit Trigger Detection ──────────────────────────
    // Grand stairs: Z: 9.0 to 19.0, top landing Y >= 4.7, Z >= 18.2 to 21.0
    if (store.gameState === 'playing' && !store.isStairDanceTriggered) {
      playerPosCheck.current.set(camera.position.x, camera.position.y, camera.position.z);
      const px = playerPosCheck.current.x;
      const py = playerPosCheck.current.y;
      const pz = playerPosCheck.current.z;

      // Trigger condition: Player climbs to the very top of stairs landing
      if (pz >= 18.2 && pz <= 21.8 && py >= 4.6 && Math.abs(px) <= 4.2) {
        store.triggerStairDance();
      }
    }

    if (!isStairDanceActive || !rootGroupRef.current) return;

    // ─── 2. Procedural Choreography: Iconic "Main Teri Queen" Dance Routine ───
    // Song BPM ~ 118 BPM => beat frequency = 118 / 60 = 1.966 Hz
    const bpmFreq = 1.966;
    const beatPhase = time * bpmFreq * Math.PI * 2;
    const halfBeat = beatPhase * 0.5;

    // A) Hips & Vertical Bounce
    const bounceY = Math.abs(Math.sin(beatPhase)) * 0.09;
    const hipSwayX = Math.sin(halfBeat) * 0.07;
    const hipRotZ = Math.sin(halfBeat) * 0.08;
    const hipRotY = Math.cos(halfBeat) * 0.12;

    if (hipGroupRef.current) {
      hipGroupRef.current.position.y = 0.95 + bounceY;
      hipGroupRef.current.position.x = hipSwayX;
      hipGroupRef.current.rotation.z = hipRotZ;
      hipGroupRef.current.rotation.y = hipRotY;
    }

    // B) Spine & Chest Groove
    if (spineGroupRef.current) {
      spineGroupRef.current.rotation.x = Math.sin(beatPhase) * 0.06;
      spineGroupRef.current.rotation.y = Math.sin(halfBeat) * 0.15;
      spineGroupRef.current.rotation.z = -hipRotZ * 0.6;
    }
    if (chestGroupRef.current) {
      chestGroupRef.current.rotation.x = -Math.sin(beatPhase) * 0.05;
      chestGroupRef.current.rotation.y = Math.cos(halfBeat) * 0.1;
    }

    // C) Iconic Ravi Kishan Shoulder Shrugs & Pops
    const shrugL = (Math.sin(beatPhase + 0.4) * 0.5 + 0.5) * 0.12;
    const shrugR = (Math.sin(beatPhase + Math.PI + 0.4) * 0.5 + 0.5) * 0.12;
    if (leftShoulderRef.current) {
      leftShoulderRef.current.position.y = 0.28 + shrugL;
      leftShoulderRef.current.rotation.z = 0.1 + shrugL * 0.8;
    }
    if (rightShoulderRef.current) {
      rightShoulderRef.current.position.y = 0.28 + shrugR;
      rightShoulderRef.current.rotation.z = -0.1 - shrugR * 0.8;
    }

    // D) Iconic Arms & Hands Dance Movement ("Queen Aa Ve" Pumps & Pointing)
    // 4-beat cycle: Beat 1 & 2: Right arm points & grooves, Left arm holds chest/hip
    // Beat 3 & 4: Left arm points & grooves, Right arm rolls with double hand wave
    const armCycle = Math.sin(halfBeat);
    const armFast = Math.sin(beatPhase);

    // Right Arm
    if (rightUpperArmRef.current) {
      rightUpperArmRef.current.rotation.x = -0.45 - armCycle * 0.35 + armFast * 0.25;
      rightUpperArmRef.current.rotation.y = 0.25 + armCycle * 0.3;
      rightUpperArmRef.current.rotation.z = -0.4 - Math.abs(armFast) * 0.35;
    }
    if (rightForearmRef.current) {
      rightForearmRef.current.rotation.x = -0.85 - armFast * 0.5;
      rightForearmRef.current.rotation.y = 0.3 + armCycle * 0.4;
      rightForearmRef.current.rotation.z = -0.2 + armFast * 0.3;
    }
    if (rightHandRef.current) {
      rightHandRef.current.rotation.x = armFast * 0.4;
      rightHandRef.current.rotation.z = armCycle * 0.3;
    }

    // Left Arm
    if (leftUpperArmRef.current) {
      leftUpperArmRef.current.rotation.x = -0.45 + armCycle * 0.35 - armFast * 0.25;
      leftUpperArmRef.current.rotation.y = -0.25 - armCycle * 0.3;
      leftUpperArmRef.current.rotation.z = 0.4 + Math.abs(armFast) * 0.35;
    }
    if (leftForearmRef.current) {
      leftForearmRef.current.rotation.x = -0.85 + armFast * 0.5;
      leftForearmRef.current.rotation.y = -0.3 - armCycle * 0.4;
      leftForearmRef.current.rotation.z = 0.2 - armFast * 0.3;
    }
    if (leftHandRef.current) {
      leftHandRef.current.rotation.x = -armFast * 0.4;
      leftHandRef.current.rotation.z = -armCycle * 0.3;
    }

    // E) Head Attitude, Tilts, and Charismatic Smirk Grooves
    if (headGroupRef.current) {
      const headNod = Math.sin(beatPhase) * 0.1;
      const headTilt = Math.sin(halfBeat) * 0.22; // Signature Ravi Kishan head tilt
      const headPan = Math.cos(halfBeat) * 0.16;
      headGroupRef.current.rotation.set(headNod, headPan, headTilt);
    }

    // F) Dynamic Flowing Shawl / Stole
    if (shawlRef.current) {
      shawlRef.current.rotation.x = Math.sin(beatPhase * 0.9) * 0.15;
      shawlRef.current.rotation.z = Math.sin(halfBeat) * 0.12;
    }

    // G) Legs & Knee Bounces
    const legStep = Math.sin(halfBeat);
    if (leftThighRef.current) {
      leftThighRef.current.rotation.x = Math.max(0, -legStep) * 0.3 - bounceY * 1.5;
      leftThighRef.current.rotation.z = 0.05 + hipRotZ;
    }
    if (leftShinRef.current) {
      leftShinRef.current.rotation.x = Math.max(0, -legStep) * 0.45;
    }
    if (rightThighRef.current) {
      rightThighRef.current.rotation.x = Math.max(0, legStep) * 0.3 - bounceY * 1.5;
      rightThighRef.current.rotation.z = -0.05 + hipRotZ;
    }
    if (rightShinRef.current) {
      rightShinRef.current.rotation.x = Math.max(0, legStep) * 0.45;
    }

    // H) Dynamic Stage Lighting Pulses
    if (goldSpotRef.current) {
      goldSpotRef.current.intensity = 18 + Math.sin(beatPhase) * 10;
    }
    if (magentaLightRef.current) {
      magentaLightRef.current.intensity = 14 + Math.sin(beatPhase + 1.2) * 8;
    }
    if (cyanLightRef.current) {
      cyanLightRef.current.intensity = 14 + Math.cos(beatPhase + 1.2) * 8;
    }

    // I) Floating Aura Sparkles / Energy Ring
    particleRefs.current.forEach((pGroup, idx) => {
      if (pGroup) {
        pGroup.position.y = (0.4 + ((time * 0.8 + idx * 0.18) % 2.4));
        const rotA = time * 1.5 + idx * 0.35;
        pGroup.position.x = Math.cos(rotA) * (0.85 + Math.sin(time + idx) * 0.15);
        pGroup.position.z = Math.sin(rotA) * (0.85 + Math.sin(time + idx) * 0.15);
        pGroup.rotation.y = time * 3;
      }
    });
  });

  if (!isStairDanceActive) {
    return null;
  }

  return (
    // Monster placed at top landing of grand staircase (X: 0, Y: 5.0, Z: 20.6, facing stairs towards -Z)
    <group position={[0, 5.0, 20.6]} rotation={[0, 0, 0]} ref={rootGroupRef}>
      
      {/* ═══ 1. STAGE PARTY & HORROR LIGHTING (60 FPS COMPLIANT - ZERO CAST SHADOW) ═══ */}
      {/* Top Main Gold Stage Spotlight */}
      <pointLight
        ref={goldSpotRef}
        position={[0, 3.2, 0.4]}
        intensity={22}
        distance={9}
        color="#ffd700"
        castShadow={false}
      />
      {/* Left Vibrant Magenta Stage Light */}
      <pointLight
        ref={magentaLightRef}
        position={[-1.8, 1.6, -0.6]}
        intensity={16}
        distance={7}
        color="#ff007f"
        castShadow={false}
      />
      {/* Right Electric Cyan Stage Light */}
      <pointLight
        ref={cyanLightRef}
        position={[1.8, 1.6, -0.6]}
        intensity={16}
        distance={7}
        color="#00f0ff"
        castShadow={false}
      />

      {/* ═══ 2. CELEBRATORY SPARKS / HYPE AURA PARTICLES ═════════════════ */}
      {particlePositions.map((_, i) => (
        <group key={`dance-spark-${i}`} ref={(el) => { if (el) particleRefs.current[i] = el; }}>
          <mesh>
            <octahedronGeometry args={[0.038, 0]} />
            <meshBasicMaterial color={i % 2 === 0 ? '#ffdd44' : '#ff44aa'} />
          </mesh>
        </group>
      ))}

      {/* ═══ 3. DANCING 3D SKELETAL CHARACTER MODEL ═════════════════════ */}
      {/* Hip / Root Pivot */}
      <group ref={hipGroupRef} position={[0, 0.95, 0]}>
        
        {/* Belt & Waistband */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.1, 14]} />
          <meshStandardMaterial color="#1a1510" roughness={0.7} />
        </mesh>
        {/* Gold Belt Buckle */}
        <mesh position={[0, 0, -0.225]}>
          <boxGeometry args={[0.09, 0.07, 0.02]} />
          <meshStandardMaterial color="#e6af2e" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Spine */}
        <group ref={spineGroupRef} position={[0, 0.08, 0]}>
          {/* Lower Torso */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.24, 0.22, 0.24, 14]} />
            <meshStandardMaterial color="#4a0e17" roughness={0.65} />
          </mesh>

          {/* Chest Group */}
          <group ref={chestGroupRef} position={[0, 0.24, 0]}>
            {/* Upper Torso / Royal Kurta & Blazer */}
            <mesh position={[0, 0.18, 0]}>
              <boxGeometry args={[0.52, 0.38, 0.28]} />
              <meshStandardMaterial color="#6b0f1a" roughness={0.6} />
            </mesh>

            {/* Inner White Silk Shirt Front */}
            <mesh position={[0, 0.2, -0.145]}>
              <planeGeometry args={[0.16, 0.28]} />
              <meshStandardMaterial color="#f4f4f4" roughness={0.8} />
            </mesh>

            {/* Gold Buttons on Blazer */}
            {[-0.04, 0.04, 0.12].map((yOff, bIdx) => (
              <mesh key={`btn-${bIdx}`} position={[0.02, 0.15 + yOff, -0.148]}>
                <sphereGeometry args={[0.012, 8, 8]} />
                <meshStandardMaterial color="#f39c12" metalness={0.9} roughness={0.2} />
              </mesh>
            ))}

            {/* Dynamic Silk Shawl / Stole draped across shoulder */}
            <group ref={shawlRef} position={[-0.14, 0.25, 0]}>
              <mesh position={[0, -0.32, -0.16]} rotation={[0.1, 0, 0.15]}>
                <boxGeometry args={[0.14, 0.65, 0.03]} />
                <meshStandardMaterial color="#d4af37" roughness={0.4} metalness={0.3} />
              </mesh>
            </group>

            {/* ═══ SHOULDERS & ARMS ═══════════════════════════════════ */}
            {/* Left Shoulder Group */}
            <group ref={leftShoulderRef} position={[-0.32, 0.28, 0]}>
              {/* Shoulder Joint Mesh */}
              <mesh>
                <sphereGeometry args={[0.09, 10, 10]} />
                <meshStandardMaterial color="#590d16" roughness={0.6} />
              </mesh>

              {/* Left Upper Arm */}
              <group ref={leftUpperArmRef} position={[0, -0.05, 0]}>
                <mesh position={[0, -0.14, 0]}>
                  <cylinderGeometry args={[0.07, 0.065, 0.28, 10]} />
                  <meshStandardMaterial color="#6b0f1a" roughness={0.6} />
                </mesh>

                {/* Left Forearm */}
                <group ref={leftForearmRef} position={[0, -0.28, 0]}>
                  {/* Sleeve Cuff */}
                  <mesh position={[0, -0.02, 0]}>
                    <cylinderGeometry args={[0.068, 0.062, 0.05, 10]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.8} />
                  </mesh>
                  {/* Forearm */}
                  <mesh position={[0, -0.13, 0]}>
                    <cylinderGeometry args={[0.058, 0.05, 0.24, 10]} />
                    <meshStandardMaterial color="#eec09e" roughness={0.7} />
                  </mesh>

                  {/* Left Hand with dynamic gestures */}
                  <group ref={leftHandRef} position={[0, -0.26, 0]}>
                    <mesh position={[0, 0, 0]}>
                      <boxGeometry args={[0.08, 0.1, 0.04]} />
                      <meshStandardMaterial color="#eec09e" roughness={0.7} />
                    </mesh>
                    {/* Expressive Fingers */}
                    {[-0.025, 0, 0.025].map((fx, fIdx) => (
                      <mesh key={`lf-${fIdx}`} position={[fx, -0.07, 0]}>
                        <cylinderGeometry args={[0.01, 0.008, 0.06, 6]} />
                        <meshStandardMaterial color="#e0b292" roughness={0.7} />
                      </mesh>
                    ))}
                  </group>
                </group>
              </group>
            </group>

            {/* Right Shoulder Group */}
            <group ref={rightShoulderRef} position={[0.32, 0.28, 0]}>
              {/* Shoulder Joint Mesh */}
              <mesh>
                <sphereGeometry args={[0.09, 10, 10]} />
                <meshStandardMaterial color="#590d16" roughness={0.6} />
              </mesh>

              {/* Right Upper Arm */}
              <group ref={rightUpperArmRef} position={[0, -0.05, 0]}>
                <mesh position={[0, -0.14, 0]}>
                  <cylinderGeometry args={[0.07, 0.065, 0.28, 10]} />
                  <meshStandardMaterial color="#6b0f1a" roughness={0.6} />
                </mesh>

                {/* Right Forearm */}
                <group ref={rightForearmRef} position={[0, -0.28, 0]}>
                  {/* Sleeve Cuff */}
                  <mesh position={[0, -0.02, 0]}>
                    <cylinderGeometry args={[0.068, 0.062, 0.05, 10]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.8} />
                  </mesh>
                  {/* Forearm */}
                  <mesh position={[0, -0.13, 0]}>
                    <cylinderGeometry args={[0.058, 0.05, 0.24, 10]} />
                    <meshStandardMaterial color="#eec09e" roughness={0.7} />
                  </mesh>

                  {/* Right Hand with dynamic gestures */}
                  <group ref={rightHandRef} position={[0, -0.26, 0]}>
                    <mesh position={[0, 0, 0]}>
                      <boxGeometry args={[0.08, 0.1, 0.04]} />
                      <meshStandardMaterial color="#eec09e" roughness={0.7} />
                    </mesh>
                    {/* Expressive Fingers */}
                    {[-0.025, 0, 0.025].map((fx, fIdx) => (
                      <mesh key={`rf-${fIdx}`} position={[fx, -0.07, 0]}>
                        <cylinderGeometry args={[0.01, 0.008, 0.06, 6]} />
                        <meshStandardMaterial color="#e0b292" roughness={0.7} />
                      </mesh>
                    ))}
                  </group>
                </group>
              </group>
            </group>

            {/* ═══ NECK & 3D RAVI KISHAN HEAD ═══════════════════════════ */}
            {/* Neck */}
            <mesh position={[0, 0.42, 0]}>
              <cylinderGeometry args={[0.08, 0.095, 0.14, 12]} />
              <meshStandardMaterial color="#eec09e" roughness={0.75} />
            </mesh>

            {/* Head Group */}
            <group ref={headGroupRef} position={[0, 0.62, 0]}>
              {/* Back Head & Cranium Volume */}
              <mesh position={[0, 0.02, 0.04]}>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshStandardMaterial color="#eec09e" roughness={0.7} />
              </mesh>

              {/* Signature 3D Voluminous Hair Mesh */}
              <mesh position={[0, 0.16, 0.02]} rotation={[-0.15, 0, 0]}>
                <sphereGeometry args={[0.24, 14, 14]} />
                <meshStandardMaterial color="#140b05" roughness={0.9} />
              </mesh>
              {/* Signature Front Hair Puff / Quiff */}
              <mesh position={[0, 0.22, -0.08]} rotation={[0.35, 0, 0]}>
                <boxGeometry args={[0.3, 0.14, 0.2]} />
                <meshStandardMaterial color="#1a0f08" roughness={0.9} />
              </mesh>

              {/* Ears */}
              <mesh position={[-0.22, 0, 0]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#deb190" roughness={0.8} />
              </mesh>
              <mesh position={[0.22, 0, 0]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#deb190" roughness={0.8} />
              </mesh>

              {/* RAVI KISHAN AUTHENTIC FACE TEXTURE QUAD */}
              <mesh position={[0, 0.02, -0.215]} rotation={[0, 0, 0]}>
                <planeGeometry args={[0.42, 0.42]} />
                <meshStandardMaterial
                  map={raviFaceTex}
                  transparent={true}
                  roughness={0.45}
                  color="#ffffff"
                  emissive="#331111"
                  emissiveIntensity={0.25}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Demonic / Mystical Sparkling Eyes Glow */}
              <group position={[0, 0.06, -0.22]}>
                {/* Left Eye Glimmer */}
                <mesh position={[-0.062, 0, 0]}>
                  <sphereGeometry args={[0.012, 8, 8]} />
                  <meshBasicMaterial color="#ffdd33" />
                </mesh>
                {/* Right Eye Glimmer */}
                <mesh position={[0.062, 0, 0]}>
                  <sphereGeometry args={[0.012, 8, 8]} />
                  <meshBasicMaterial color="#ffdd33" />
                </mesh>
              </group>
            </group>
          </group>
        </group>

        {/* ═══ LEGS & DRESS SHOES ═════════════════════════════════════ */}
        {/* Left Leg */}
        <group ref={leftThighRef} position={[-0.14, -0.06, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.09, 0.078, 0.42, 10]} />
            <meshStandardMaterial color="#18181b" roughness={0.85} />
          </mesh>

          {/* Left Shin */}
          <group ref={leftShinRef} position={[0, -0.42, 0]}>
            <mesh position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.075, 0.065, 0.42, 10]} />
              <meshStandardMaterial color="#18181b" roughness={0.85} />
            </mesh>

            {/* Left Foot / Dress Shoe */}
            <group ref={leftFootRef} position={[0, -0.44, 0]}>
              <mesh position={[0, 0.04, -0.06]}>
                <boxGeometry args={[0.13, 0.09, 0.24]} />
                <meshStandardMaterial color="#0c0703" roughness={0.3} metalness={0.4} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Right Leg */}
        <group ref={rightThighRef} position={[0.14, -0.06, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.09, 0.078, 0.42, 10]} />
            <meshStandardMaterial color="#18181b" roughness={0.85} />
          </mesh>

          {/* Right Shin */}
          <group ref={rightShinRef} position={[0, -0.42, 0]}>
            <mesh position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.075, 0.065, 0.42, 10]} />
              <meshStandardMaterial color="#18181b" roughness={0.85} />
            </mesh>

            {/* Right Foot / Dress Shoe */}
            <group ref={rightFootRef} position={[0, -0.44, 0]}>
              <mesh position={[0, 0.04, -0.06]}>
                <boxGeometry args={[0.13, 0.09, 0.24]} />
                <meshStandardMaterial color="#0c0703" roughness={0.3} metalness={0.4} />
              </mesh>
            </group>
          </group>
        </group>

      </group>
    </group>
  );
}
