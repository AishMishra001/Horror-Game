'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, PointLight, Group } from 'three';
import { useGameStore } from '@/store/useGameStore';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// ─── Long Spindly Claw Arm Component ──────────────────────────────────────────
function MonsterArm({ isLeft }: { isLeft: boolean }) {
  const side = isLeft ? -1 : 1;
  const upperArmRef = useRef<Group>(null);
  const forearmRef = useRef<Group>(null);
  const handRef = useRef<Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime * 8;
    const twitch = Math.sin(time * 3 + (isLeft ? 0 : 2)) * 0.15;
    const lungeReach = Math.sin(time * 1.5) * 0.12;

    if (upperArmRef.current) {
      upperArmRef.current.rotation.z = side * (0.35 + twitch * 0.5);
      upperArmRef.current.rotation.x = -0.55 + lungeReach;
      upperArmRef.current.rotation.y = side * (0.2 + twitch * 0.3);
    }
    if (forearmRef.current) {
      forearmRef.current.rotation.x = -0.7 - lungeReach * 1.2;
      forearmRef.current.rotation.y = side * -0.35;
    }
    if (handRef.current) {
      handRef.current.rotation.x = 0.4 + twitch * 0.8;
      handRef.current.rotation.z = side * (0.2 + twitch * 0.4);
    }
  });

  return (
    <group position={[side * 0.42, 0.2, 0]}>
      {/* Shoulder Joint */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#1a1412" roughness={0.9} />
      </mesh>

      {/* Upper Arm (Elongated) */}
      <group ref={upperArmRef}>
        <mesh position={[side * 0.18, -0.45, 0.1]} rotation={[0.2, 0, side * -0.2]}>
          <cylinderGeometry args={[0.045, 0.035, 0.95, 6]} />
          <meshStandardMaterial color="#1c1613" roughness={0.85} />
        </mesh>

        {/* Elbow Joint */}
        <group position={[side * 0.35, -0.9, 0.2]} ref={forearmRef}>
          <mesh>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color="#140f0d" roughness={0.9} />
          </mesh>

          {/* Forearm (Extra Long & Spindly Reaching Forward) */}
          <mesh position={[side * 0.12, -0.45, -0.35]} rotation={[-0.7, side * 0.2, side * -0.1]}>
            <cylinderGeometry args={[0.038, 0.026, 1.05, 6]} />
            <meshStandardMaterial color="#1a1411" roughness={0.85} />
          </mesh>

          {/* Wrist & Claw Hand */}
          <group position={[side * 0.24, -0.95, -0.75]} ref={handRef}>
            <mesh>
              <boxGeometry args={[0.08, 0.14, 0.05]} />
              <meshStandardMaterial color="#181210" roughness={0.9} />
            </mesh>

            {/* 5 Long Sharp Curved Claws */}
            {[-0.04, -0.02, 0, 0.02, 0.04].map((fingerX, idx) => (
              <group key={`claw-${idx}`} position={[fingerX, -0.07, -0.02]}>
                {/* Finger Segment 1 */}
                <mesh position={[0, -0.12, -0.08]} rotation={[-0.75, 0, (idx - 2) * 0.15]}>
                  <cylinderGeometry args={[0.01, 0.007, 0.25, 4]} />
                  <meshStandardMaterial color="#100b09" roughness={0.7} />
                </mesh>
                {/* Sharp Curved Claw Tip */}
                <mesh position={[0, -0.26, -0.18]} rotation={[-1.2, 0, (idx - 2) * 0.2]}>
                  <coneGeometry args={[0.009, 0.18, 4]} />
                  <meshStandardMaterial color="#0a0504" roughness={0.5} metalness={0.4} />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}

// ─── Long Spindly Leg Component ────────────────────────────────────────────────
function MonsterLeg({ isLeft }: { isLeft: boolean }) {
  const side = isLeft ? -1 : 1;
  const legRef = useRef<Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime * 6;
    const twitch = Math.sin(time * 2.5 + (isLeft ? 0 : 1.5)) * 0.08;
    if (legRef.current) {
      legRef.current.rotation.z = side * (0.15 + twitch);
      legRef.current.rotation.x = 0.2 + twitch * 0.5;
    }
  });

  return (
    <group position={[side * 0.22, -0.75, 0]} ref={legRef}>
      {/* Hip Joint */}
      <mesh>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshStandardMaterial color="#1a1412" roughness={0.9} />
      </mesh>

      {/* Thigh (Elongated) */}
      <mesh position={[side * 0.05, -0.55, 0.05]} rotation={[-0.1, 0, side * -0.08]}>
        <cylinderGeometry args={[0.05, 0.038, 1.15, 6]} />
        <meshStandardMaterial color="#1c1512" roughness={0.88} />
      </mesh>

      {/* Knee Joint */}
      <group position={[side * 0.1, -1.15, 0.1]}>
        <mesh>
          <sphereGeometry args={[0.055, 6, 6]} />
          <meshStandardMaterial color="#130e0c" roughness={0.9} />
        </mesh>

        {/* Shin (Spindly & Long) */}
        <mesh position={[0, -0.65, -0.1]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.036, 0.024, 1.35, 6]} />
          <meshStandardMaterial color="#181210" roughness={0.88} />
        </mesh>

        {/* Sharp Ankle & Talons */}
        <group position={[0, -1.35, -0.2]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.04, 0.28, 4]} />
            <meshStandardMaterial color="#0b0604" roughness={0.6} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ─── Long Messy Creepy Hair Strands ───────────────────────────────────────────
function MonsterHair() {
  const hairGroupRef = useRef<Group>(null);

  // Generate deterministic hair strands cascading down and framing the face
  const hairStrands = useMemo(() => {
    const strands: Array<{
      id: number;
      x: number;
      y: number;
      z: number;
      rotX: number;
      rotY: number;
      rotZ: number;
      length: number;
      thickness: number;
    }> = [];

    // Strands around top, temples, sides, and back
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const isFront = Math.sin(angle) > 0.4;
      const radius = isFront ? 0.32 : 0.34;
      const hx = Math.cos(angle) * radius;
      const hz = Math.sin(angle) * radius * 0.85;
      const hy = 0.3 + Math.sin(i * 3.7) * 0.08;
      const len = 0.7 + Math.sin(i * 5.1) * 0.35 + (isFront ? -0.15 : 0.25);
      const th = 0.012 + (i % 3) * 0.005;

      strands.push({
        id: i,
        x: hx,
        y: hy,
        z: hz,
        rotX: (Math.sin(i * 2.3) * 0.3) + (isFront ? 0.25 : -0.2),
        rotY: angle,
        rotZ: Math.cos(i * 1.7) * 0.3 + (hx > 0 ? 0.15 : -0.15),
        length: len,
        thickness: th,
      });
    }
    return strands;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime * 12;
    if (hairGroupRef.current) {
      hairGroupRef.current.children.forEach((child, idx) => {
        const offset = idx * 0.4;
        child.rotation.z = Math.sin(time + offset) * 0.12 + (child.position.x > 0 ? 0.15 : -0.15);
        child.rotation.x = Math.cos(time * 0.8 + offset) * 0.1;
      });
    }
  });

  return (
    <group position={[0, 0.45, 0]} ref={hairGroupRef}>
      {hairStrands.map((strand) => (
        <group
          key={`hair-${strand.id}`}
          position={[strand.x, strand.y, strand.z]}
          rotation={[strand.rotX, strand.rotY, strand.rotZ]}
        >
          {/* Main Hair Strand */}
          <mesh position={[0, -strand.length / 2, 0]}>
            <cylinderGeometry args={[strand.thickness * 0.6, strand.thickness, strand.length, 4]} />
            <meshStandardMaterial
              color="#090706"
              roughness={0.95}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Main Kitchen Jumpscare Horror Monster ──────────────────────────────────────
export default function KitchenJumpscare() {
  const gameState = useGameStore((s) => s.gameState);
  const isKitchenJumpscareTriggered = useGameStore((s) => s.isKitchenJumpscareTriggered);
  const isKitchenJumpscareActive = useGameStore((s) => s.isKitchenJumpscareActive);

  const { camera } = useThree();
  const monsterGroupRef = useRef<Group>(null);
  const headGroupRef = useRef<Group>(null);
  const pointLightRef = useRef<PointLight>(null);

  // Load Ravi Kishan face texture
  const raviFaceTex = useTexture('/ravi Face.png');
  useMemo(() => {
    raviFaceTex.wrapS = THREE.ClampToEdgeWrapping;
    raviFaceTex.wrapT = THREE.ClampToEdgeWrapping;
  }, [raviFaceTex]);

  // Pre-allocated vectors for 60 FPS zero garbage collection
  const camFwd = useRef(new Vector3());
  const targetPos = useRef(new Vector3());
  const camPos = useRef(new Vector3());

  useFrame((state) => {
    const store = useGameStore.getState();

    // 1. Fail-safe ground floor kitchen coordinate trigger
    if (store.gameState === 'playing' && !store.isKitchenJumpscareTriggered) {
      const px = camera.position.x;
      const py = camera.position.y;
      const pz = camera.position.z;
      // Kitchen bounding box on ground floor: X: [-15, -5.2], Z: [-20, -5.0], Y < 3.5
      if (px <= -5.2 && px >= -15.0 && pz <= -5.0 && pz >= -20.0 && py < 3.5) {
        store.triggerKitchenJumpscare();
      }
    }

    // 2. Animate and lock monster directly onto player's face if active
    if (store.gameState !== 'playing' || !store.isKitchenJumpscareActive || !monsterGroupRef.current) {
      return;
    }

    const time = state.clock.elapsedTime;

    // Get camera forward direction
    camera.getWorldDirection(camFwd.current);
    camPos.current.copy(camera.position);

    // Violent jumpscare lunge distance (lunges aggressively into the camera lens)
    const lungeDist = 0.95 + Math.sin(time * 24) * 0.08 - Math.sin(time * 6) * 0.15;

    // Monster position right in front of the camera
    targetPos.current.copy(camPos.current).addScaledVector(camFwd.current, lungeDist);
    
    // Add horrific micro-jitter/violent spasm motion
    const jitterX = (Math.sin(time * 50) + Math.cos(time * 37)) * 0.022;
    const jitterY = (Math.cos(time * 48) + Math.sin(time * 31)) * 0.022 - 0.12; // slightly lower so face aligns with eyes
    const jitterZ = Math.sin(time * 42) * 0.018;

    targetPos.current.x += jitterX;
    targetPos.current.y += jitterY;
    targetPos.current.z += jitterZ;

    monsterGroupRef.current.position.copy(targetPos.current);

    // Face directly towards camera with violent head snaps
    monsterGroupRef.current.lookAt(camPos.current);

    if (headGroupRef.current) {
      const snapX = Math.sin(time * 35) * 0.12;
      const snapY = Math.cos(time * 28) * 0.15;
      const snapZ = Math.sin(time * 45) * 0.18;
      headGroupRef.current.rotation.set(snapX, snapY, snapZ);
    }

    // Violent demonic red strobe light
    if (pointLightRef.current) {
      const strobe = Math.sin(time * 40) > 0 ? 35 : 12;
      pointLightRef.current.intensity = strobe + Math.sin(time * 70) * 10;
    }
  });

  if (!isKitchenJumpscareActive) {
    return null;
  }

  return (
    <group ref={monsterGroupRef}>
      {/* ═══ MONSTER TORSO & SKELETAL CHEST ═══════════════════════════════ */}
      <group position={[0, 0, 0]}>
        {/* Slender Creepy Spine Column */}
        <mesh position={[0, -0.2, 0.05]}>
          <cylinderGeometry args={[0.07, 0.09, 0.8, 8]} />
          <meshStandardMaterial color="#1a1411" roughness={0.9} />
        </mesh>

        {/* Emaciated Ribcage Structure */}
        {[-0.05, -0.15, -0.25, -0.35].map((ry, idx) => (
          <group key={`rib-${idx}`} position={[0, ry, 0.02]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.18 - idx * 0.02, 0.02, 6, 12, Math.PI]} />
              <meshStandardMaterial color="#221915" roughness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Rotting Dark Flesh Core */}
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.32, 0.65, 0.22]} />
          <meshStandardMaterial color="#140f0c" roughness={0.92} />
        </mesh>
      </group>

      {/* ═══ HEAD WITH RAVI KISHAN FACE & LONG HAIR ══════════════════════ */}
      <group position={[0, 0.35, 0]} ref={headGroupRef}>
        {/* Head Base Skull */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.52, 0.62, 0.44]} />
          <meshStandardMaterial color="#140e0c" roughness={0.9} />
        </mesh>

        {/* Ravi Kishan Front Face Quad */}
        <mesh position={[0, 0, 0.23]}>
          <planeGeometry args={[0.54, 0.64]} />
          <meshStandardMaterial
            map={raviFaceTex}
            roughness={0.4}
            color="#ffdddd"
            emissive="#551111"
            emissiveIntensity={0.6}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Demonic Glowing Eyes */}
        <group position={[0, 0.08, 0.24]}>
          {/* Left Eye */}
          <mesh position={[-0.11, 0, 0]}>
            <sphereGeometry args={[0.038, 8, 8]} />
            <meshBasicMaterial color="#ff1100" />
          </mesh>
          <mesh position={[-0.11, 0, 0.015]}>
            <sphereGeometry args={[0.018, 6, 6]} />
            <meshBasicMaterial color="#ffff55" />
          </mesh>

          {/* Right Eye */}
          <mesh position={[0.11, 0, 0]}>
            <sphereGeometry args={[0.038, 8, 8]} />
            <meshBasicMaterial color="#ff1100" />
          </mesh>
          <mesh position={[0.11, 0, 0.015]}>
            <sphereGeometry args={[0.018, 6, 6]} />
            <meshBasicMaterial color="#ffff55" />
          </mesh>
        </group>

        {/* Long Messy Dark Creepy Hair Strands */}
        <MonsterHair />
      </group>

      {/* ═══ LONG SPINDLY ARMS & CLAWS (REACHING FOR PLAYER) ═════════════ */}
      <MonsterArm isLeft={true} />
      <MonsterArm isLeft={false} />

      {/* ═══ LONG SPINDLY LEGS ════════════════════════════════════════════ */}
      <MonsterLeg isLeft={true} />
      <MonsterLeg isLeft={false} />

      {/* ═══ SINISTER RED STROBE POINT LIGHT (ZERO SHADOWS FOR 60 FPS) ═══ */}
      <pointLight
        ref={pointLightRef}
        position={[0, 0.2, 0.6]}
        distance={6}
        intensity={30}
        color="#ff1a1a"
        castShadow={false}
      />
    </group>
  );
}

