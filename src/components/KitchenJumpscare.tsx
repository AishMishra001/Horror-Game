'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, PointLight, Group } from 'three';
import { useGameStore } from '@/store/useGameStore';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// ─── Realistic Articulated Ghost Finger Component ─────────────────────────────
function RealisticFinger({
  length,
  thickness,
  spreadAngle,
  fingerIndex,
}: {
  length: number;
  thickness: number;
  spreadAngle: number;
  fingerIndex: number;
}) {
  const joint1Ref = useRef<Group>(null);
  const joint2Ref = useRef<Group>(null);
  const joint3Ref = useRef<Group>(null);

  const seg1Len = length * 0.42;
  const seg2Len = length * 0.33;
  const seg3Len = length * 0.25;

  useFrame((state) => {
    const time = state.clock.elapsedTime * 14;
    const offset = fingerIndex * 0.55;
    // Horrific twitching and claw grasping animation
    const grasp = (Math.sin(time + offset) * 0.35 + 0.45);
    const twitch = (Math.sin(time * 3.2 + offset) * 0.12);

    if (joint1Ref.current) {
      joint1Ref.current.rotation.x = -grasp * 0.6 + twitch;
      joint1Ref.current.rotation.z = spreadAngle * 0.7;
    }
    if (joint2Ref.current) {
      joint2Ref.current.rotation.x = -grasp * 0.9 + twitch * 0.8;
    }
    if (joint3Ref.current) {
      joint3Ref.current.rotation.x = -grasp * 1.1 + twitch * 0.6;
    }
  });

  return (
    <group ref={joint1Ref}>
      {/* Knuckle Joint 1 */}
      <mesh>
        <sphereGeometry args={[thickness * 1.15, 8, 8]} />
        <meshStandardMaterial color="#2d2825" roughness={0.7} />
      </mesh>

      {/* Phalanx 1 */}
      <mesh position={[0, seg1Len / 2, -seg1Len * 0.1]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[thickness * 0.9, thickness, seg1Len, 7]} />
        <meshStandardMaterial color="#423b37" roughness={0.65} metalness={0.1} />
      </mesh>

      {/* Joint 2 */}
      <group position={[0, seg1Len, -seg1Len * 0.2]} ref={joint2Ref}>
        <mesh>
          <sphereGeometry args={[thickness * 0.95, 8, 8]} />
          <meshStandardMaterial color="#2a2522" roughness={0.7} />
        </mesh>

        {/* Phalanx 2 */}
        <mesh position={[0, seg2Len / 2, -seg2Len * 0.15]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[thickness * 0.75, thickness * 0.85, seg2Len, 7]} />
          <meshStandardMaterial color="#3d3733" roughness={0.65} />
        </mesh>

        {/* Joint 3 & Claw Tip */}
        <group position={[0, seg2Len, -seg2Len * 0.3]} ref={joint3Ref}>
          <mesh>
            <sphereGeometry args={[thickness * 0.8, 6, 6]} />
            <meshStandardMaterial color="#221e1b" roughness={0.7} />
          </mesh>

          {/* Phalanx 3 */}
          <mesh position={[0, seg3Len / 2, -seg3Len * 0.2]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[thickness * 0.55, thickness * 0.7, seg3Len, 6]} />
            <meshStandardMaterial color="#36302d" roughness={0.6} />
          </mesh>

          {/* Sharp Black Talon / Fingernail */}
          <mesh position={[0, seg3Len + 0.04, -seg3Len * 0.45]} rotation={[-1.2, 0, 0]}>
            <coneGeometry args={[thickness * 0.65, 0.14, 6]} />
            <meshStandardMaterial color="#0f0c0a" roughness={0.3} metalness={0.6} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ─── Realistic Grasping Ghost Hand Component ──────────────────────────────────
function RealisticGhostHand({ isLeft }: { isLeft: boolean }) {
  const handGroupRef = useRef<Group>(null);
  const side = isLeft ? -1 : 1;

  useFrame((state) => {
    const time = state.clock.elapsedTime * 10;
    const lungeX = Math.sin(time * 1.8 + (isLeft ? 0 : 1.5)) * 0.04;
    const lungeY = Math.cos(time * 1.5) * 0.05;
    const lungeZ = Math.sin(time * 2.2) * 0.06;
    const shakeRot = (Math.sin(time * 3.5) + Math.cos(time * 4.2)) * 0.08;

    if (handGroupRef.current) {
      handGroupRef.current.position.x = side * 0.52 + lungeX;
      handGroupRef.current.position.y = -0.15 + lungeY;
      handGroupRef.current.position.z = -0.58 + lungeZ;

      handGroupRef.current.rotation.z = side * (-0.35 + shakeRot * 0.5);
      handGroupRef.current.rotation.y = side * (-0.45 + shakeRot * 0.4);
      handGroupRef.current.rotation.x = -0.4 + shakeRot * 0.6;
    }
  });

  return (
    <group ref={handGroupRef}>
      {/* Palm Base */}
      <mesh position={[0, 0, 0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.22, 0.28, 0.06]} />
        <meshStandardMaterial color="#3c3632" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Forearm Stump fading into darkness */}
      <mesh position={[0, -0.35, 0.15]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 0.55, 8]} />
        <meshStandardMaterial color="#1a1614" roughness={0.9} />
      </mesh>

      {/* 5 Articulated Fingers */}
      {/* Thumb */}
      <group position={[side * -0.11, -0.05, 0.02]} rotation={[0, side * 0.7, side * 0.6]}>
        <RealisticFinger length={0.24} thickness={0.024} spreadAngle={side * -0.3} fingerIndex={0} />
      </group>

      {/* Index */}
      <group position={[side * -0.07, 0.14, 0]} rotation={[0, 0, side * -0.15]}>
        <RealisticFinger length={0.32} thickness={0.022} spreadAngle={side * -0.12} fingerIndex={1} />
      </group>

      {/* Middle */}
      <group position={[side * -0.02, 0.155, 0]} rotation={[0, 0, 0]}>
        <RealisticFinger length={0.36} thickness={0.023} spreadAngle={0} fingerIndex={2} />
      </group>

      {/* Ring */}
      <group position={[side * 0.035, 0.145, 0]} rotation={[0, 0, side * 0.1]}>
        <RealisticFinger length={0.33} thickness={0.021} spreadAngle={side * 0.1} fingerIndex={3} />
      </group>

      {/* Pinky */}
      <group position={[side * 0.08, 0.115, 0]} rotation={[0, 0, side * 0.25]}>
        <RealisticFinger length={0.26} thickness={0.018} spreadAngle={side * 0.22} fingerIndex={4} />
      </group>
    </group>
  );
}

// ─── Main Kitchen Jumpscare Horror Monster (Face & Reaching Hands Only) ────────
export default function KitchenJumpscare() {
  const gameState = useGameStore((s) => s.gameState);
  const isKitchenJumpscareTriggered = useGameStore((s) => s.isKitchenJumpscareTriggered);
  const isKitchenJumpscareActive = useGameStore((s) => s.isKitchenJumpscareActive);

  const { camera } = useThree();
  const jumpscareGroupRef = useRef<Group>(null);
  const headGroupRef = useRef<Group>(null);
  const strobeLightRef = useRef<PointLight>(null);
  const paleLightRef = useRef<PointLight>(null);

  // Load Ravi Kishan face texture
  const raviFaceTex = useTexture('/ravi Face.png');
  useMemo(() => {
    raviFaceTex.wrapS = THREE.ClampToEdgeWrapping;
    raviFaceTex.wrapT = THREE.ClampToEdgeWrapping;
    raviFaceTex.colorSpace = THREE.SRGBColorSpace;
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
    if (store.gameState !== 'playing' || !store.isKitchenJumpscareActive || !jumpscareGroupRef.current) {
      return;
    }

    const time = state.clock.elapsedTime;

    // Get camera forward direction
    camera.getWorldDirection(camFwd.current);
    camPos.current.copy(camera.position);

    // Violent jumpscare lunge distance (lunges aggressively into the camera lens)
    const lungeDist = 0.82 + Math.sin(time * 26) * 0.05 - Math.sin(time * 5) * 0.1;

    // Monster position directly centered on camera
    targetPos.current.copy(camPos.current).addScaledVector(camFwd.current, lungeDist);

    // Horrific micro-jitter / violent camera-relative spasm
    const jitterX = (Math.sin(time * 55) + Math.cos(time * 42)) * 0.016;
    const jitterY = (Math.cos(time * 52) + Math.sin(time * 36)) * 0.016 - 0.02;
    const jitterZ = Math.sin(time * 48) * 0.014;

    targetPos.current.x += jitterX;
    targetPos.current.y += jitterY;
    targetPos.current.z += jitterZ;

    jumpscareGroupRef.current.position.copy(targetPos.current);

    // Face directly towards camera with violent head snaps
    jumpscareGroupRef.current.lookAt(camPos.current);

    if (headGroupRef.current) {
      const snapX = Math.sin(time * 38) * 0.09;
      const snapY = Math.cos(time * 32) * 0.12;
      const snapZ = Math.sin(time * 50) * 0.14;
      headGroupRef.current.rotation.set(snapX, snapY, snapZ);
    }

    // Violent strobe and demonic horror illumination
    if (strobeLightRef.current) {
      const strobe = Math.sin(time * 45) > 0 ? 40 : 12;
      strobeLightRef.current.intensity = strobe + Math.sin(time * 80) * 12;
    }
    if (paleLightRef.current) {
      paleLightRef.current.intensity = 18 + Math.sin(time * 20) * 6;
    }
  });

  if (!isKitchenJumpscareActive) {
    return null;
  }

  return (
    <group ref={jumpscareGroupRef}>
      {/* ═══ 1. RAVI KISHAN HORROR FACE ═══════════════════════════════════ */}
      <group position={[0, 0, 0]} ref={headGroupRef}>
        {/* Dark shadowy backdrop sphere for depth */}
        <mesh position={[0, 0, -0.08]}>
          <planeGeometry args={[1.1, 1.1]} />
          <meshBasicMaterial color="#050403" transparent opacity={0.8} />
        </mesh>

        {/* Ravi Kishan Transparent Face Quad */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[0.95, 0.98]} />
          <meshStandardMaterial
            map={raviFaceTex}
            transparent={true}
            alphaTest={0.05}
            roughness={0.4}
            color="#ffffff"
            emissive="#551111"
            emissiveIntensity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Demonic Piercing Glowing Eyes */}
        <group position={[0, 0.06, 0.06]}>
          {/* Left Eye Glow */}
          <mesh position={[-0.13, 0, 0]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshBasicMaterial color="#ff1100" />
          </mesh>
          <mesh position={[-0.13, 0, 0.01]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshBasicMaterial color="#ffff44" />
          </mesh>

          {/* Right Eye Glow */}
          <mesh position={[0.13, 0, 0]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshBasicMaterial color="#ff1100" />
          </mesh>
          <mesh position={[0.13, 0, 0.01]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshBasicMaterial color="#ffff44" />
          </mesh>
        </group>
      </group>

      {/* ═══ 2. REALISTIC REACHING GHOST CLAW HANDS ═════════════════════ */}
      <RealisticGhostHand isLeft={true} />
      <RealisticGhostHand isLeft={false} />

      {/* ═══ 3. HORROR JUMPSCARE LIGHTING (60 FPS PERFORMANCE COMPLIANT) ═ */}
      {/* Flickering Demonic Crimson Strobe */}
      <pointLight
        ref={strobeLightRef}
        position={[0, 0.2, 0.4]}
        distance={4.5}
        intensity={35}
        color="#ff1111"
        castShadow={false}
      />

      {/* Cold Pale Ghost Light to illuminate claws and face */}
      <pointLight
        ref={paleLightRef}
        position={[0, -0.2, 0.5]}
        distance={4.0}
        intensity={18}
        color="#a8d0d5"
        castShadow={false}
      />
    </group>
  );
}

