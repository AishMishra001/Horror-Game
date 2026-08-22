'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, PointLight, MathUtils } from 'three';
import { useGameStore } from '@/store/useGameStore';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// ─── 5-FINGER ARTICULATED REALISTIC HAND ─────────────────────────────────────
function RealisticMonsterHand({ isLeft }: { isLeft: boolean }) {
  const side = isLeft ? -1 : 1;
  return (
    <group position={[0, -0.22, 0]}>
      {/* Palm */}
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[0.075, 0.08, 0.028]} />
        <meshStandardMaterial color="#deb190" roughness={0.65} />
      </mesh>

      {/* Thumb */}
      <group position={[side * -0.038, -0.02, 0.008]} rotation={[0.2, side * 0.5, side * 0.4]}>
        <mesh position={[0, -0.025, 0]}>
          <cylinderGeometry args={[0.009, 0.008, 0.05, 8]} />
          <meshStandardMaterial color="#deb190" roughness={0.65} />
        </mesh>
      </group>

      {/* Index Finger */}
      <group position={[side * -0.024, -0.08, 0]} rotation={[-0.2, 0, side * -0.08]}>
        <mesh position={[0, -0.03, 0]}>
          <cylinderGeometry args={[0.008, 0.007, 0.065, 8]} />
          <meshStandardMaterial color="#deb190" roughness={0.65} />
        </mesh>
      </group>

      {/* Middle Finger */}
      <group position={[side * -0.008, -0.082, 0]} rotation={[-0.25, 0, 0]}>
        <mesh position={[0, -0.034, 0]}>
          <cylinderGeometry args={[0.0085, 0.007, 0.072, 8]} />
          <meshStandardMaterial color="#deb190" roughness={0.65} />
        </mesh>
      </group>

      {/* Ring Finger */}
      <group position={[side * 0.01, -0.08, 0]} rotation={[-0.2, 0, side * 0.08]}>
        <mesh position={[0, -0.03, 0]}>
          <cylinderGeometry args={[0.008, 0.0065, 0.065, 8]} />
          <meshStandardMaterial color="#deb190" roughness={0.65} />
        </mesh>
      </group>

      {/* Pinky Finger */}
      <group position={[side * 0.026, -0.076, 0]} rotation={[-0.15, 0, side * 0.18]}>
        <mesh position={[0, -0.024, 0]}>
          <cylinderGeometry args={[0.007, 0.0055, 0.052, 8]} />
          <meshStandardMaterial color="#deb190" roughness={0.65} />
        </mesh>
      </group>
    </group>
  );
}

// ─── HIGH-FIDELITY 3D RAVI KISHAN DANCE & JUMPSCARE CHARACTER ─────────────────
export default function RaviKishanDanceMonster() {
  const isStairDanceActive = useGameStore((s) => s.isStairDanceActive);

  // Group references
  const rootGroupRef = useRef<Group>(null);
  const hipGroupRef = useRef<Group>(null);
  const spineGroupRef = useRef<Group>(null);
  const chestGroupRef = useRef<Group>(null);
  const headGroupRef = useRef<Group>(null);

  // Limbs
  const leftShoulderRef = useRef<Group>(null);
  const rightShoulderRef = useRef<Group>(null);
  const leftUpperArmRef = useRef<Group>(null);
  const rightUpperArmRef = useRef<Group>(null);
  const leftForearmRef = useRef<Group>(null);
  const rightForearmRef = useRef<Group>(null);

  const leftThighRef = useRef<Group>(null);
  const rightThighRef = useRef<Group>(null);
  const leftShinRef = useRef<Group>(null);
  const rightShinRef = useRef<Group>(null);

  const shawlRef = useRef<Group>(null);

  // Stage lighting refs
  const centerLightRef = useRef<PointLight>(null);
  const leftLightRef = useRef<PointLight>(null);
  const rightLightRef = useRef<PointLight>(null);
  const lungeFlashLightRef = useRef<PointLight>(null);

  // Texture
  const raviFaceTex = useTexture('/textures/ravi/ravi_face_clean_5.png', (tex) => {
    const t = tex as THREE.Texture;
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
  });

  // State timers
  const danceStartTime = useRef(0);
  const hasLungeAudioPlayed = useRef(false);

  // Pre-allocated vectors for zero-garbage collection
  const playerPosCheck = useRef(new Vector3());
  const initialLandingPos = useRef(new Vector3(0, 5.0, 20.6));
  const currentMonsterPos = useRef(new Vector3(0, 5.0, 20.6));
  const camPosVec = useRef(new Vector3());
  const lungeDirVec = useRef(new Vector3());

  // Reset timer on activate
  useEffect(() => {
    if (isStairDanceActive) {
      danceStartTime.current = performance.now() / 1000;
      hasLungeAudioPlayed.current = false;
    }
  }, [isStairDanceActive]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const time = state.clock.elapsedTime;
    const store = useGameStore.getState();
    const camera = state.camera;

    // ─── 1. Grand Staircase Summit Trigger Detection ──────────────────────────
    if (store.gameState === 'playing' && !store.isStairDanceTriggered) {
      playerPosCheck.current.set(camera.position.x, camera.position.y, camera.position.z);
      const px = playerPosCheck.current.x;
      const py = playerPosCheck.current.y;
      const pz = playerPosCheck.current.z;

      // Summit coordinate trigger
      if (pz >= 18.2 && pz <= 21.8 && py >= 4.6 && Math.abs(px) <= 4.2) {
        store.triggerStairDance();
      }
    }

    if (!isStairDanceActive || !rootGroupRef.current) return;

    camPosVec.current.set(camera.position.x, camera.position.y, camera.position.z);

    const now = performance.now() / 1000;
    const elapsed = now - danceStartTime.current;

    // ─── 2. Phased Sequence: Dance -> Freeze Twitch -> Climax Jumpscare Lunge ──
    // ─── 2. Phased Sequence: Dance (0-5.2s) -> Twitch (5.2-5.8s) -> Airborne Leap (5.8-7.4s) ──
    const DANCE_DURATION = 5.2;   // High-energy left-to-right side-step dance
    const TWITCH_DURATION = 0.6;  // Ominous sudden freeze & neck spasm
    const LUNGE_START = DANCE_DURATION + TWITCH_DURATION; // 5.8s
    const TOTAL_SEQUENCE_TIME = 7.4; // Clean completion

    // Auto-end after jumpscare sequence concludes
    if (elapsed >= TOTAL_SEQUENCE_TIME) {
      store.endStairDance();
      return;
    }

    const bpmFreq = 1.966; // ~118 BPM matching "Main Teri Queen"
    const beatPhase = time * bpmFreq * Math.PI * 2;
    const halfBeat = beatPhase * 0.5;

    // ═════════════════════════════════════════════════════════════════════════
    // PHASE 1: SIDE-TO-SIDE DANCE (Travelling from Left to Right and back)
    // ═════════════════════════════════════════════════════════════════════════
    if (elapsed < DANCE_DURATION) {
      // Side-to-side travel cycle across the 2F landing gallery (2 full passes in 5.2s)
      const travelCycle = (elapsed / DANCE_DURATION) * Math.PI * 3.5;
      const travelX = Math.sin(travelCycle) * 2.2; // Walks from X: -2.2 to +2.2
      const travelZ = 20.6 + Math.cos(travelCycle) * 0.3;

      currentMonsterPos.current.set(travelX, 5.0, travelZ);
      rootGroupRef.current.position.copy(currentMonsterPos.current);

      // Character body angles into travel direction with swagger
      const travelFacing = -Math.cos(travelCycle) * 0.35;
      rootGroupRef.current.rotation.set(0, travelFacing, 0);

      // A) Vertical Bounce & Hip Sway
      const bounceY = Math.abs(Math.sin(beatPhase)) * 0.12;
      const hipSway = Math.sin(halfBeat) * 0.1;
      const hipRotZ = Math.sin(halfBeat) * 0.14;

      if (hipGroupRef.current) {
        hipGroupRef.current.position.y = 0.95 + bounceY;
        hipGroupRef.current.position.x = hipSway;
        hipGroupRef.current.rotation.z = hipRotZ;
        hipGroupRef.current.rotation.y = Math.cos(halfBeat) * 0.18;
      }

      // B) Spine & Chest Groove
      if (spineGroupRef.current) {
        spineGroupRef.current.rotation.x = Math.sin(beatPhase) * 0.1;
        spineGroupRef.current.rotation.y = Math.sin(halfBeat) * 0.2;
        spineGroupRef.current.rotation.z = -hipRotZ * 0.7;
      }
      if (chestGroupRef.current) {
        chestGroupRef.current.rotation.x = -Math.sin(beatPhase) * 0.08;
        chestGroupRef.current.rotation.y = Math.cos(halfBeat) * 0.15;
      }

      // C) Signature Ravi Kishan Shoulder Popping
      const shrugL = (Math.sin(beatPhase + 0.3) * 0.5 + 0.5) * 0.18;
      const shrugR = (Math.sin(beatPhase + Math.PI + 0.3) * 0.5 + 0.5) * 0.18;
      if (leftShoulderRef.current) {
        leftShoulderRef.current.position.y = 0.28 + shrugL;
        leftShoulderRef.current.rotation.z = 0.14 + shrugL * 0.8;
      }
      if (rightShoulderRef.current) {
        rightShoulderRef.current.position.y = 0.28 + shrugR;
        rightShoulderRef.current.rotation.z = -0.14 - shrugR * 0.8;
      }

      // D) Iconic Arms & Hands Groove ("Main Teri Queen" double arm wave & pointing)
      const armCycle = Math.sin(halfBeat);
      const armFast = Math.sin(beatPhase);

      if (rightUpperArmRef.current) {
        rightUpperArmRef.current.rotation.x = -0.55 - armCycle * 0.45 + armFast * 0.35;
        rightUpperArmRef.current.rotation.y = 0.35 + armCycle * 0.4;
        rightUpperArmRef.current.rotation.z = -0.5 - Math.abs(armFast) * 0.45;
      }
      if (rightForearmRef.current) {
        rightForearmRef.current.rotation.x = -0.95 - armFast * 0.65;
        rightForearmRef.current.rotation.y = 0.4 + armCycle * 0.5;
        rightForearmRef.current.rotation.z = -0.3 + armFast * 0.4;
      }

      if (leftUpperArmRef.current) {
        leftUpperArmRef.current.rotation.x = -0.55 + armCycle * 0.45 - armFast * 0.35;
        leftUpperArmRef.current.rotation.y = -0.35 - armCycle * 0.4;
        leftUpperArmRef.current.rotation.z = 0.5 + Math.abs(armFast) * 0.45;
      }
      if (leftForearmRef.current) {
        leftForearmRef.current.rotation.x = -0.95 + armFast * 0.65;
        leftForearmRef.current.rotation.y = -0.4 - armCycle * 0.5;
        leftForearmRef.current.rotation.z = 0.3 - armFast * 0.4;
      }

      // E) Head Attitude, Tilts, and Charismatic Smirk
      if (headGroupRef.current) {
        const headNod = Math.sin(beatPhase) * 0.15;
        const headTilt = Math.sin(halfBeat) * 0.28; // Iconic head tilt
        const headPan = Math.cos(halfBeat) * 0.2;
        headGroupRef.current.rotation.set(headNod, headPan, headTilt);
      }

      // F) Legs Crossover & Side Step
      const legStep = Math.sin(halfBeat);
      if (leftThighRef.current) {
        leftThighRef.current.rotation.x = Math.max(0, -legStep) * 0.5 - bounceY * 1.8;
        leftThighRef.current.rotation.z = 0.12 + hipRotZ;
      }
      if (leftShinRef.current) {
        leftShinRef.current.rotation.x = Math.max(0, -legStep) * 0.65;
      }
      if (rightThighRef.current) {
        rightThighRef.current.rotation.x = Math.max(0, legStep) * 0.5 - bounceY * 1.8;
        rightThighRef.current.rotation.z = -0.12 + hipRotZ;
      }
      if (rightShinRef.current) {
        rightShinRef.current.rotation.x = Math.max(0, legStep) * 0.65;
      }

      // G) Silk Shawl Wave
      if (shawlRef.current) {
        shawlRef.current.rotation.x = Math.sin(beatPhase * 0.9) * 0.2;
        shawlRef.current.rotation.z = Math.sin(halfBeat) * 0.18;
      }

      // Stage Lighting Pulses
      if (centerLightRef.current) {
        centerLightRef.current.intensity = 20 + Math.sin(beatPhase) * 12;
      }
      if (leftLightRef.current) {
        leftLightRef.current.intensity = 16 + Math.sin(beatPhase + 1.2) * 10;
      }
      if (rightLightRef.current) {
        rightLightRef.current.intensity = 16 + Math.cos(beatPhase + 1.2) * 10;
      }
    }
    // ═════════════════════════════════════════════════════════════════════════
    // PHASE 2: OMINOUS FREEZE & HORRIFIC SPASM (t = 5.2s to 5.8s)
    // ═════════════════════════════════════════════════════════════════════════
    else if (elapsed < LUNGE_START) {
      // Center on landing, facing camera directly
      rootGroupRef.current.position.lerp(new Vector3(0, 5.0, 20.2), delta * 12);
      rootGroupRef.current.lookAt(camPosVec.current.x, 5.0, camPosVec.current.z);

      // Uncanny micro-tremors and neck snaps
      const spasmX = (Math.sin(time * 75) + Math.cos(time * 60)) * 0.06;
      const spasmY = (Math.cos(time * 65) + Math.sin(time * 50)) * 0.06;
      if (headGroupRef.current) {
        headGroupRef.current.rotation.set(spasmX * 2.5, spasmY * 2.5, (Math.sin(time * 80) * 0.2));
      }
      if (leftUpperArmRef.current) leftUpperArmRef.current.rotation.set(-1.2, 0.45, 0.75);
      if (rightUpperArmRef.current) rightUpperArmRef.current.rotation.set(-1.2, -0.45, -0.75);

      if (centerLightRef.current) centerLightRef.current.intensity = 40;
    }
    // ═════════════════════════════════════════════════════════════════════════
    // PHASE 3: AIRBORNE HIGH-SPEED PARABOLIC JUMP ONTO PLAYER! (t = 5.8s to 7.4s)
    // ═════════════════════════════════════════════════════════════════════════
    else {
      // Play sudden jumpscare sting audio once on leap initiation
      if (!hasLungeAudioPlayed.current) {
        hasLungeAudioPlayed.current = true;
        try {
          const lungeAudio = new Audio('/peshaan-ravi-kishan.mp3');
          lungeAudio.volume = 1.0;
          lungeAudio.play().catch(() => {});
        } catch {}
      }

      const lungeProgress = Math.min(1.0, (elapsed - LUNGE_START) / 1.1);
      // Explosive acceleration into player's face
      const easeLunge = 1 - Math.pow(1 - lungeProgress, 4);

      // Jumping parabolic leap trajectory high into the air
      const jumpArc = Math.sin(lungeProgress * Math.PI) * 0.85;

      // Monster flies directly into the player's face (stopping ~0.16m from camera lens!)
      lungeDirVec.current.subVectors(camPosVec.current, initialLandingPos.current);
      const targetLungePos = new Vector3()
        .copy(camPosVec.current)
        .sub(lungeDirVec.current.clone().normalize().multiplyScalar(0.16));
      targetLungePos.y = (camPosVec.current.y - 0.45) + jumpArc;

      rootGroupRef.current.position.lerpVectors(new Vector3(0, 5.0, 20.2), targetLungePos, easeLunge);
      rootGroupRef.current.lookAt(camPosVec.current);

      // Aggressive outstretched grasping claws wrapping around camera
      if (leftUpperArmRef.current) leftUpperArmRef.current.rotation.set(-1.85, 0.45, 0.4);
      if (rightUpperArmRef.current) rightUpperArmRef.current.rotation.set(-1.85, -0.45, -0.4);
      if (leftForearmRef.current) leftForearmRef.current.rotation.set(0.2, 0, 0);
      if (rightForearmRef.current) rightForearmRef.current.rotation.set(0.2, 0, 0);

      // Terrifying rapid head spasm
      if (headGroupRef.current) {
        const violentShake = Math.sin(time * 95) * 0.16;
        headGroupRef.current.rotation.set(violentShake, -violentShake * 0.9, violentShake * 1.3);
      }

      // Crimson demonic flash light on lunge
      if (lungeFlashLightRef.current) {
        lungeFlashLightRef.current.intensity = 80 * (1 - easeLunge * 0.2);
      }
    }
  });

  if (!isStairDanceActive) {
    return null;
  }

  return (
    <group position={[0, 5.0, 20.6]} rotation={[0, 0, 0]} ref={rootGroupRef}>
      
      {/* ═══ 1. STAGE ATMOSPHERE & JUMPSCARE LIGHTS (60 FPS - ZERO CAST SHADOW) ═══ */}
      {/* Central Golden Follow Spotlight */}
      <pointLight
        ref={centerLightRef}
        position={[0, 3.4, 0.6]}
        intensity={22}
        distance={10}
        color="#ffd700"
        castShadow={false}
      />
      {/* Left Magenta Side Stage Light */}
      <pointLight
        ref={leftLightRef}
        position={[-2.4, 1.8, -0.4]}
        intensity={18}
        distance={8}
        color="#ff0066"
        castShadow={false}
      />
      {/* Right Cyan Side Stage Light */}
      <pointLight
        ref={rightLightRef}
        position={[2.4, 1.8, -0.4]}
        intensity={18}
        distance={8}
        color="#00f0ff"
        castShadow={false}
      />
      {/* Sudden Jumpscare Blood Crimson Flash Light */}
      <pointLight
        ref={lungeFlashLightRef}
        position={[0, 1.6, -0.8]}
        intensity={0}
        distance={6}
        color="#ff1100"
        castShadow={false}
      />

      {/* ═══ 2. REALISTIC 3D CHARACTER MODEL FOR LORD RAVI KISHAN ═══════════════ */}
      {/* Hip / Root Pivot */}
      <group ref={hipGroupRef} position={[0, 0.95, 0]}>
        
        {/* Belt & Waistband */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.225, 0.22, 0.08, 16]} />
          <meshStandardMaterial color="#1a1410" roughness={0.7} />
        </mesh>
        {/* Gold Belt Buckle */}
        <mesh position={[0, 0, -0.226]}>
          <boxGeometry args={[0.075, 0.055, 0.016]} />
          <meshStandardMaterial color="#f5be2d" metalness={0.92} roughness={0.2} />
        </mesh>

        {/* Spine */}
        <group ref={spineGroupRef} position={[0, 0.06, 0]}>
          {/* Lower Torso with Tailored Blue Blazer Flare */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.245, 0.23, 0.24, 16]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
          </mesh>

          {/* Chest Group */}
          <group ref={chestGroupRef} position={[0, 0.22, 0]}>
            {/* Upper Torso / Tailored Royal Blue Double-Breasted Blazer */}
            <mesh position={[0, 0.18, 0]}>
              <boxGeometry args={[0.52, 0.38, 0.29]} />
              <meshStandardMaterial color="#1d4ed8" roughness={0.6} metalness={0.08} />
            </mesh>

            {/* Blazer Peak Lapels (Left & Right) with Satin Sheen */}
            <mesh position={[-0.14, 0.2, -0.154]} rotation={[0.04, 0.06, -0.18]}>
              <boxGeometry args={[0.11, 0.38, 0.018]} />
              <meshStandardMaterial color="#1e40af" roughness={0.4} metalness={0.2} />
            </mesh>
            <mesh position={[0.14, 0.2, -0.154]} rotation={[0.04, -0.06, 0.18]}>
              <boxGeometry args={[0.11, 0.38, 0.018]} />
              <meshStandardMaterial color="#1e40af" roughness={0.4} metalness={0.2} />
            </mesh>

            {/* Inner White Silk Shirt & Open High Collar */}
            <mesh position={[0, 0.22, -0.149]}>
              <planeGeometry args={[0.17, 0.28]} />
              <meshStandardMaterial color="#ffffff" roughness={0.65} />
            </mesh>
            <mesh position={[-0.085, 0.36, -0.13]} rotation={[-0.25, 0.35, -0.3]}>
              <boxGeometry args={[0.065, 0.12, 0.012]} />
              <meshStandardMaterial color="#fcfcfc" roughness={0.7} />
            </mesh>
            <mesh position={[0.085, 0.36, -0.13]} rotation={[-0.25, -0.35, 0.3]}>
              <boxGeometry args={[0.065, 0.12, 0.012]} />
              <meshStandardMaterial color="#fcfcfc" roughness={0.7} />
            </mesh>

            {/* 6 Embossed Gold Buttons on Blazer (2 Columns of 3) */}
            {[-0.06, 0.04, 0.14].map((yOff, bIdx) => (
              <mesh key={`blazer-btn-l-${bIdx}`} position={[-0.065, 0.12 + yOff, -0.158]}>
                <sphereGeometry args={[0.013, 10, 10]} />
                <meshStandardMaterial color="#f5be2d" metalness={0.94} roughness={0.18} />
              </mesh>
            ))}
            {[-0.06, 0.04, 0.14].map((yOff, bIdx) => (
              <mesh key={`blazer-btn-r-${bIdx}`} position={[0.065, 0.12 + yOff, -0.158]}>
                <sphereGeometry args={[0.013, 10, 10]} />
                <meshStandardMaterial color="#f5be2d" metalness={0.94} roughness={0.18} />
              </mesh>
            ))}

            {/* Left Chest Welt Pocket & Pocket Square */}
            <mesh position={[-0.165, 0.27, -0.156]}>
              <boxGeometry args={[0.09, 0.022, 0.012]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.5} />
            </mesh>
            <mesh position={[-0.165, 0.292, -0.154]} rotation={[0.1, 0, 0.15]}>
              <boxGeometry args={[0.068, 0.038, 0.01]} />
              <meshStandardMaterial color="#ffffff" roughness={0.45} />
            </mesh>

            {/* Lower Waist Flap Pockets */}
            <mesh position={[-0.17, 0.04, -0.154]} rotation={[0.05, 0, 0]}>
              <boxGeometry args={[0.11, 0.032, 0.014]} />
              <meshStandardMaterial color="#1e40af" roughness={0.6} />
            </mesh>
            <mesh position={[0.17, 0.04, -0.154]} rotation={[0.05, 0, 0]}>
              <boxGeometry args={[0.11, 0.032, 0.014]} />
              <meshStandardMaterial color="#1e40af" roughness={0.6} />
            </mesh>

            {/* ═══ SHOULDERS & ARMS ═══════════════════════════════════ */}
            {/* Left Shoulder Group */}
            <group ref={leftShoulderRef} position={[-0.32, 0.28, 0]}>
              <mesh>
                <sphereGeometry args={[0.092, 12, 12]} />
                <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
              </mesh>

              {/* Left Upper Arm */}
              <group ref={leftUpperArmRef} position={[0, -0.05, 0]}>
                <mesh position={[0, -0.14, 0]}>
                  <cylinderGeometry args={[0.07, 0.062, 0.28, 12]} />
                  <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
                </mesh>

                {/* Left Forearm */}
                <group ref={leftForearmRef} position={[0, -0.28, 0]}>
                  {/* White Shirt Sleeve Cuff */}
                  <mesh position={[0, -0.02, 0]}>
                    <cylinderGeometry args={[0.065, 0.058, 0.05, 10]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.8} />
                  </mesh>
                  {/* Forearm Sleeve */}
                  <mesh position={[0, -0.12, 0]}>
                    <cylinderGeometry args={[0.058, 0.05, 0.22, 10]} />
                    <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
                  </mesh>

                  {/* 5-Finger Hand */}
                  <RealisticMonsterHand isLeft={true} />
                </group>
              </group>
            </group>

            {/* Right Shoulder Group */}
            <group ref={rightShoulderRef} position={[0.32, 0.28, 0]}>
              <mesh>
                <sphereGeometry args={[0.092, 12, 12]} />
                <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
              </mesh>

              {/* Right Upper Arm */}
              <group ref={rightUpperArmRef} position={[0, -0.05, 0]}>
                <mesh position={[0, -0.14, 0]}>
                  <cylinderGeometry args={[0.07, 0.062, 0.28, 12]} />
                  <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
                </mesh>

                {/* Right Forearm */}
                <group ref={rightForearmRef} position={[0, -0.28, 0]}>
                  {/* White Shirt Sleeve Cuff */}
                  <mesh position={[0, -0.02, 0]}>
                    <cylinderGeometry args={[0.065, 0.058, 0.05, 10]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.8} />
                  </mesh>
                  {/* Forearm Sleeve */}
                  <mesh position={[0, -0.12, 0]}>
                    <cylinderGeometry args={[0.058, 0.05, 0.22, 10]} />
                    <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
                  </mesh>

                  {/* 5-Finger Hand */}
                  <RealisticMonsterHand isLeft={false} />
                </group>
              </group>
            </group>

            {/* ═══ NECK & SEAMLESS 3D RAVI KISHAN HEAD ═══════════════════ */}
            {/* Neck */}
            <mesh position={[0, 0.42, 0]}>
              <cylinderGeometry args={[0.08, 0.094, 0.16, 14]} />
              <meshStandardMaterial color="#cfa07c" roughness={0.7} />
            </mesh>

            {/* 3D Sculpted Head */}
            <group ref={headGroupRef} position={[0, 0.64, 0]}>
              {/* Anatomical Skull Mesh (Back Head & Cranium) */}
              <mesh position={[0, 0.04, 0.03]}>
                <sphereGeometry args={[0.21, 20, 20]} />
                <meshStandardMaterial color="#cfa07c" roughness={0.65} />
              </mesh>

              {/* Realistic Jaw & Chin Contour */}
              <mesh position={[0, -0.1, -0.05]} rotation={[0.26, 0, 0]}>
                <boxGeometry args={[0.19, 0.15, 0.16]} />
                <meshStandardMaterial color="#cfa07c" roughness={0.65} />
              </mesh>

              {/* 3D Signature Voluminous Wavy Hair Clumps */}
              <mesh position={[0, 0.16, 0.02]} rotation={[-0.14, 0, 0]}>
                <sphereGeometry args={[0.238, 16, 16]} />
                <meshStandardMaterial color="#120a05" roughness={0.88} />
              </mesh>
              {/* Signature Hair Quiff / Swept Waves */}
              <mesh position={[0.03, 0.22, -0.09]} rotation={[0.32, 0.08, -0.08]}>
                <boxGeometry args={[0.3, 0.14, 0.21]} />
                <meshStandardMaterial color="#160c07" roughness={0.88} />
              </mesh>
              <mesh position={[-0.07, 0.19, -0.08]} rotation={[0.22, -0.12, 0.08]}>
                <boxGeometry args={[0.19, 0.11, 0.17]} />
                <meshStandardMaterial color="#120a05" roughness={0.88} />
              </mesh>

              {/* Anatomical Ears */}
              <mesh position={[-0.21, 0.02, 0]}>
                <sphereGeometry args={[0.052, 10, 10]} />
                <meshStandardMaterial color="#c99874" roughness={0.7} />
              </mesh>
              <mesh position={[0.21, 0.02, 0]}>
                <sphereGeometry args={[0.052, 10, 10]} />
                <meshStandardMaterial color="#c99874" roughness={0.7} />
              </mesh>

              {/* Curved 3D Front Face Mesh with Authentic Texture */}
              <mesh position={[0, 0.02, -0.205]}>
                <planeGeometry args={[0.4, 0.42]} />
                <meshStandardMaterial
                  map={raviFaceTex}
                  transparent={true}
                  roughness={0.4}
                  color="#ffffff"
                  emissive="#441111"
                  emissiveIntensity={0.2}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Piercing Demonic Eye Sockets & Glowing Gaze */}
              <group position={[0, 0.065, -0.2]}>
                {/* Left Eye Demonic Glow */}
                <mesh position={[-0.058, 0, 0]}>
                  <sphereGeometry args={[0.013, 8, 8]} />
                  <meshBasicMaterial color="#ffdd33" />
                </mesh>
                <mesh position={[-0.058, 0, 0.005]}>
                  <sphereGeometry args={[0.006, 6, 6]} />
                  <meshBasicMaterial color="#ff1100" />
                </mesh>

                {/* Right Eye Demonic Glow */}
                <mesh position={[0.058, 0, 0]}>
                  <sphereGeometry args={[0.013, 8, 8]} />
                  <meshBasicMaterial color="#ffdd33" />
                </mesh>
                <mesh position={[0.058, 0, 0.005]}>
                  <sphereGeometry args={[0.006, 6, 6]} />
                  <meshBasicMaterial color="#ff1100" />
                </mesh>
              </group>
            </group>
          </group>
        </group>

        {/* ═══ TAILORED CRISP WHITE SUIT TROUSERS & POLISHED BLACK SHOES ═════ */}
        {/* Left Leg */}
        <group ref={leftThighRef} position={[-0.135, -0.06, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.092, 0.078, 0.42, 12]} />
            <meshStandardMaterial color="#f4f5f7" roughness={0.8} />
          </mesh>

          {/* Left Shin */}
          <group ref={leftShinRef} position={[0, -0.42, 0]}>
            <mesh position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.078, 0.068, 0.42, 12]} />
              <meshStandardMaterial color="#f4f5f7" roughness={0.8} />
            </mesh>

            {/* Left Polished Dress Shoe */}
            <mesh position={[0, -0.42, -0.06]}>
              <boxGeometry args={[0.125, 0.085, 0.25]} />
              <meshStandardMaterial color="#0a0502" roughness={0.25} metalness={0.4} />
            </mesh>
          </group>
        </group>

        {/* Right Leg */}
        <group ref={rightThighRef} position={[0.135, -0.06, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.092, 0.078, 0.42, 12]} />
            <meshStandardMaterial color="#f4f5f7" roughness={0.8} />
          </mesh>

          {/* Right Shin */}
          <group ref={rightShinRef} position={[0, -0.42, 0]}>
            <mesh position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.078, 0.068, 0.42, 12]} />
              <meshStandardMaterial color="#f4f5f7" roughness={0.8} />
            </mesh>

            {/* Right Polished Dress Shoe */}
            <mesh position={[0, -0.42, -0.06]}>
              <boxGeometry args={[0.125, 0.085, 0.25]} />
              <meshStandardMaterial color="#0a0502" roughness={0.25} metalness={0.4} />
            </mesh>
          </group>
        </group>

      </group>
    </group>
  );
}
