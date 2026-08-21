'use client';

/**
 * HeldItem.tsx
 * Renders the flashlight and/or key directly in front of the camera
 * in "viewmodel" space — classic FPS first-person held item effect.
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Group, Vector3, Quaternion } from 'three';
import { useGameStore } from '@/store/useGameStore';

// Pre-allocated for zero-GC in useFrame
const _camRight = new Vector3();
const _camUp    = new Vector3();
const _camFwd   = new Vector3();
const _pos      = new Vector3();
const _quat     = new Quaternion();

// ─── Flashlight Viewmodel ─────────────────────────────────────────────────────
function HeldFlashlight() {
  const groupRef = useRef<Group>(null);
  const revealT  = useRef(0);

  const hasFlashlight  = useGameStore((s) => s.hasFlashlight);
  const isFlashlightOn = useGameStore((s) => s.isFlashlightOn);

  useFrame(({ camera }, rawDelta) => {
    if (!groupRef.current) return;
    const delta = Math.min(rawDelta, 0.05);

    if (hasFlashlight) {
      revealT.current = MathUtils.lerp(revealT.current, 1, delta * 4.5);
    } else {
      revealT.current = 0;
    }

    const t = revealT.current;
    if (t < 0.01) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    camera.getWorldDirection(_camFwd);
    _camRight.crossVectors(_camFwd, camera.up).normalize();
    _camUp.copy(camera.up).normalize();
    _quat.copy(camera.quaternion);

    const slideIn = (1 - t) * 0.35;

    _pos.copy(camera.position)
      .addScaledVector(_camRight,  0.28)
      .addScaledVector(_camUp,    -0.22 - slideIn)
      .addScaledVector(_camFwd,    0.5);

    groupRef.current.position.copy(_pos);
    groupRef.current.quaternion.copy(_quat);
    groupRef.current.rotateX(Math.PI * 0.08);
    groupRef.current.rotateY(-Math.PI * 0.04);
    groupRef.current.rotateZ(-Math.PI * 0.06);
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* Main barrel */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.22, 12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Grip (rear) */}
      <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.028, 0.1, 12]} />
        <meshStandardMaterial color="#0d0d0d" metalness={0.3} roughness={0.9} />
      </mesh>

      {/* Head / lens bezel */}
      <mesh position={[0, 0, -0.125]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.038, 0.025, 0.03, 14]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Lens — glows when on */}
      <mesh position={[0, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.03, 16]} />
        <meshStandardMaterial
          color={isFlashlightOn ? '#fffde7' : '#1a1a2e'}
          emissive={isFlashlightOn ? '#fff9c4' : '#000000'}
          emissiveIntensity={isFlashlightOn ? 6 : 0}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Power button indicator ring */}
      <mesh position={[0, 0.031, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.014, 0.004, 6, 12]} />
        <meshStandardMaterial
          color={isFlashlightOn ? '#00e676' : '#333'}
          emissive={isFlashlightOn ? '#00c853' : '#000'}
          emissiveIntensity={isFlashlightOn ? 3 : 0}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

// ─── Key Viewmodel ────────────────────────────────────────────────────────────
// The key geometry is built with the shaft along the Y axis.
// When held, we want it horizontal — shaft pointing into the screen (Z axis),
// ring at the top-left, teeth visible on the near side.
// We achieve this by rotating the inner mesh group 90° around X so Y→Z,
// then keeping the outer group aligned to camera without extra tilts.
function HeldKey() {
  const groupRef = useRef<Group>(null);
  const revealT  = useRef(0);

  const hasKey = useGameStore((s) => s.hasKey);

  useFrame(({ camera }, rawDelta) => {
    if (!groupRef.current) return;
    const delta = Math.min(rawDelta, 0.05);

    if (hasKey) {
      revealT.current = MathUtils.lerp(revealT.current, 1, delta * 4.5);
    } else {
      revealT.current = 0;
    }

    const t = revealT.current;
    if (t < 0.01) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    camera.getWorldDirection(_camFwd);
    _camRight.crossVectors(_camFwd, camera.up).normalize();
    _camUp.copy(camera.up).normalize();
    _quat.copy(camera.quaternion);

    // Slide up from below on pickup
    const slideIn = (1 - t) * 0.35;

    // Position: lower-left, close, slightly in front
    _pos.copy(camera.position)
      .addScaledVector(_camRight, -0.16)
      .addScaledVector(_camUp,    -0.18 - slideIn)
      .addScaledVector(_camFwd,    0.42);

    // Apply camera orientation — no extra rotations so it stays straight
    groupRef.current.position.copy(_pos);
    groupRef.current.quaternion.copy(_quat);
  });

  return (
    <group ref={groupRef} visible={false}>
      {/*
        Inner group rotated so the key shaft (Y axis) now points along Z (into screen)
        and the ring faces the player — exactly like gripping a key in your fist
        with the teeth pointing forward.
      */}
      <group rotation={[Math.PI / 2, 0, Math.PI / 4]} scale={[1.1, 1.1, 1.1]}>
        {/* Key ring */}
        <mesh position={[0, 0.055, 0]}>
          <torusGeometry args={[0.04, 0.009, 8, 24]} />
          <meshStandardMaterial
            color="#ffd700" metalness={0.95} roughness={0.08}
            emissive="#ffaa00" emissiveIntensity={0.8}
          />
        </mesh>

        {/* Key shaft */}
        <mesh position={[0, -0.025, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.13, 8]} />
          <meshStandardMaterial
            color="#ffca28" metalness={0.92} roughness={0.12}
            emissive="#ffa000" emissiveIntensity={0.5}
          />
        </mesh>

        {/* Tooth 1 (larger) */}
        <mesh position={[0.016, -0.05, 0]}>
          <boxGeometry args={[0.024, 0.012, 0.009]} />
          <meshStandardMaterial
            color="#ffca28" metalness={0.92} roughness={0.12}
            emissive="#ffa000" emissiveIntensity={0.5}
          />
        </mesh>

        {/* Tooth 2 */}
        <mesh position={[0.014, -0.075, 0]}>
          <boxGeometry args={[0.018, 0.011, 0.009]} />
          <meshStandardMaterial
            color="#ffca28" metalness={0.92} roughness={0.12}
            emissive="#ffa000" emissiveIntensity={0.5}
          />
        </mesh>

        {/* Tip */}
        <mesh position={[0.008, -0.093, 0]}>
          <boxGeometry args={[0.011, 0.011, 0.009]} />
          <meshStandardMaterial
            color="#ffca28" metalness={0.92} roughness={0.12}
            emissive="#ffa000" emissiveIntensity={0.5}
          />
        </mesh>

        {/* Warm gold glow */}
        <pointLight position={[0, 0, 0]} color="#ffd700" intensity={1.2} distance={0.5} castShadow={false} />
      </group>
    </group>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function HeldItem() {
  return (
    <>
      <HeldFlashlight />
      <HeldKey />
    </>
  );
}
