'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';

function playCreakSound() {
  if (typeof window === 'undefined') return;
  const audio = new Audio('/stairs and doors.mp3');
  audio.volume = 0.4;
  audio.play().catch(() => {});
}

// ─── 1. Realistic Abandoned Victorian Iron Bed with Rumpled Bedding ─────────────
function AbandonedVictorianBed({
  position,
  rotY = 0,
  clothTex,
}: {
  position: [number, number, number];
  rotY?: number;
  clothTex: THREE.Texture;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* ── Solid Bed Collider (Base + Headboard + Footboard) ── */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.45, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[2.3, 0.9, 2.7]} />
        </mesh>
      </RigidBody>

      {/* Heavy Rusted Iron Bedframe Base Rails */}
      <mesh position={[0, 0.35, 0]} receiveShadow>
        <boxGeometry args={[2.16, 0.08, 2.56]} />
        <meshStandardMaterial color="#1a1816" roughness={0.7} metalness={0.7} />
      </mesh>

      {/* Sagging Dusty Mattress (Lower in center due to years of weight) */}
      <mesh position={[0, 0.52, 0]} receiveShadow>
        <boxGeometry args={[2.02, 0.28, 2.42]} />
        <meshStandardMaterial color="#3a322a" roughness={0.9} />
      </mesh>

      {/* ── Curved Wrought Iron Headboard with Spindles & Brass Finials ── */}
      <group position={[0, 0, -1.25]}>
        {/* Main Arch Frame */}
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[2.24, 0.06, 0.06]} />
          <meshStandardMaterial color="#1c1916" roughness={0.6} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <boxGeometry args={[2.24, 0.05, 0.05]} />
          <meshStandardMaterial color="#1c1916" roughness={0.6} metalness={0.8} />
        </mesh>
        {/* Outer Heavy Posts */}
        {[-1.08, 1.08].map((px) => (
          <group key={`hpost-${px}`} position={[px, 0, 0]}>
            <mesh position={[0, 0.85, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 1.7, 8]} />
              <meshStandardMaterial color="#181512" roughness={0.65} metalness={0.75} />
            </mesh>
            {/* Antique Brass Ball Finials */}
            <mesh position={[0, 1.75, 0]}>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshStandardMaterial color="#b3904a" roughness={0.4} metalness={0.85} />
            </mesh>
          </group>
        ))}
        {/* Vertical Spindle Rods */}
        {[-0.8, -0.55, -0.3, 0, 0.3, 0.55, 0.8].map((sx) => (
          <mesh key={`hspindle-${sx}`} position={[sx, 0.88, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.46, 6]} />
            <meshStandardMaterial color="#221e1a" roughness={0.6} metalness={0.7} />
          </mesh>
        ))}
      </group>

      {/* ── Wrought Iron Footboard ── */}
      <group position={[0, 0, 1.25]}>
        <mesh position={[0, 0.72, 0]}>
          <boxGeometry args={[2.24, 0.05, 0.05]} />
          <meshStandardMaterial color="#1c1916" roughness={0.6} metalness={0.8} />
        </mesh>
        {[-1.08, 1.08].map((px) => (
          <group key={`fpost-${px}`} position={[px, 0, 0]}>
            <mesh position={[0, 0.52, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 1.04, 8]} />
              <meshStandardMaterial color="#181512" roughness={0.65} metalness={0.75} />
            </mesh>
            <mesh position={[0, 1.08, 0]}>
              <sphereGeometry args={[0.07, 10, 10]} />
              <meshStandardMaterial color="#b3904a" roughness={0.4} metalness={0.85} />
            </mesh>
          </group>
        ))}
        {[-0.75, -0.45, -0.15, 0.15, 0.45, 0.75].map((sx) => (
          <mesh key={`fspindle-${sx}`} position={[sx, 0.52, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.38, 6]} />
            <meshStandardMaterial color="#221e1a" roughness={0.6} metalness={0.7} />
          </mesh>
        ))}
      </group>

      {/* ── Multi-Fold Dirty Rumpled Quilt & Bedding (Ref Image 1 & 2) ── */}
      {/* Base Draped Sheet Dropping Over Edge */}
      <mesh position={[0, 0.62, 0.1]} receiveShadow>
        <boxGeometry args={[2.08, 0.12, 2.25]} />
        <meshStandardMaterial map={clothTex} roughness={0.92} color="#cdc6b8" />
      </mesh>

      {/* Wrinkled Top Blanket Folds */}
      <mesh position={[-0.1, 0.72, 0.2]} rotation={[0.04, -0.05, 0.03]} receiveShadow>
        <boxGeometry args={[1.92, 0.14, 1.85]} />
        <meshStandardMaterial map={clothTex} roughness={0.95} color="#8a7e72" />
      </mesh>

      {/* Side Drapes Hanging Down Over Iron Bedframe Rail */}
      <mesh position={[-1.02, 0.45, 0.2]} rotation={[0, 0, -0.25]} receiveShadow>
        <boxGeometry args={[0.16, 0.42, 1.8]} />
        <meshStandardMaterial map={clothTex} roughness={0.95} color="#756b60" />
      </mesh>
      <mesh position={[1.02, 0.42, 0.3]} rotation={[0, 0, 0.3]} receiveShadow>
        <boxGeometry args={[0.16, 0.46, 1.7]} />
        <meshStandardMaterial map={clothTex} roughness={0.95} color="#756b60" />
      </mesh>

      {/* Foot Blanket Drape hanging off footboard */}
      <mesh position={[0.1, 0.44, 1.22]} rotation={[0.32, 0.05, 0]} receiveShadow>
        <boxGeometry args={[1.6, 0.38, 0.18]} />
        <meshStandardMaterial map={clothTex} roughness={0.95} color="#665c52" />
      </mesh>

      {/* Eerie Form / Lump Shrouded Under the Quilt (From Reference Image 1) */}
      <mesh position={[-0.15, 0.82, -0.15]} rotation={[-0.08, 0.12, -0.04]} receiveShadow>
        <sphereGeometry args={[0.42, 10, 8]} scale={[1.2, 0.45, 1.6]} />
        <meshStandardMaterial map={clothTex} roughness={0.92} color="#7d7265" />
      </mesh>

      {/* Stained Wrinkled Pillows */}
      <group position={[0, 0.78, -0.88]}>
        <mesh position={[-0.52, 0, 0]} rotation={[0.15, -0.08, 0.05]} receiveShadow>
          <boxGeometry args={[0.72, 0.18, 0.48]} />
          <meshStandardMaterial map={clothTex} roughness={0.9} color="#baa993" />
        </mesh>
        <mesh position={[0.48, 0.04, -0.02]} rotation={[0.22, 0.1, -0.08]} receiveShadow>
          <boxGeometry args={[0.74, 0.19, 0.5]} />
          <meshStandardMaterial map={clothTex} roughness={0.9} color="#a6947e" />
        </mesh>
      </group>
    </group>
  );
}

// ─── 2. Vintage Bedside Nightstand with Interactable Open/Close Drawer ─────────
function BedsideNightstandWithLamp({
  position,
  rotY = 0,
  woodTex,
}: {
  position: [number, number, number];
  rotY?: number;
  woodTex: THREE.Texture;
}) {
  const setInteractPrompt = useGameStore((s) => s.setInteractPrompt);
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const canInteractRef = useRef(false);
  const drawerRef = useRef<THREE.Group>(null);

  const lampLightRef = useRef<THREE.PointLight>(null);
  const bulbMeshRef = useRef<THREE.Mesh>(null);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);

    // Smooth Drawer sliding animation
    if (drawerRef.current) {
      const targetZ = isOpen ? 0.28 : 0.03;
      const diff = targetZ - drawerRef.current.position.z;
      if (Math.abs(diff) > 0.002) {
        drawerRef.current.position.z += diff * Math.min(1, dt * 6.0);
      }
    }

    if (lampLightRef.current) {
      const t = state.clock.elapsedTime * 5;
      const noise = Math.sin(t * 1.7) * Math.cos(t * 3.1) * 1.5;
      const target = Math.max(2.0, 7.5 + noise);
      lampLightRef.current.intensity = THREE.MathUtils.lerp(lampLightRef.current.intensity, target, dt * 10);

      if (bulbMeshRef.current) {
        const mat = bulbMeshRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = lampLightRef.current.intensity * 0.25;
      }
    }
  });

  useEffect(() => {
    const handleKey = (evt: KeyboardEvent) => {
      if (evt.code === 'KeyE' && canInteractRef.current) {
        playCreakSound();
        const next = !isOpenRef.current;
        setIsOpen(next);
        isOpenRef.current = next;
        setInteractPrompt(next ? 'Press E to Close Nightstand Drawer' : 'Press E to Open Nightstand Drawer');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setInteractPrompt]);

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Nightstand RigidBody Collider */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.4, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[0.8, 0.8, 0.65]} />
        </mesh>
      </RigidBody>

      {/* Main Table Top */}
      <mesh position={[0, 0.72, 0]} receiveShadow>
        <boxGeometry args={[0.78, 0.06, 0.62]} />
        <meshStandardMaterial map={woodTex} color="#352014" roughness={0.7} />
      </mesh>

      {/* Drawer Outer Frame */}
      <mesh position={[0, 0.55, 0]} receiveShadow>
        <boxGeometry args={[0.72, 0.28, 0.56]} />
        <meshStandardMaterial map={woodTex} color="#2b180d" roughness={0.8} />
      </mesh>

      {/* Interactable Sliding Drawer */}
      <group ref={drawerRef} position={[0, 0.55, 0.03]}>
        <mesh position={[0, 0, 0.2]} receiveShadow>
          <boxGeometry args={[0.64, 0.22, 0.38]} />
          <meshStandardMaterial map={woodTex} color="#201107" roughness={0.85} />
        </mesh>
        {/* Brass Ring */}
        <mesh position={[0, 0, 0.4]}>
          <torusGeometry args={[0.025, 0.006, 6, 10]} />
          <meshStandardMaterial color="#b3904a" roughness={0.35} metalness={0.9} />
        </mesh>
      </group>

      {/* 4 Carved Spindle Legs */}
      {[-0.32, 0.32].map((lx) =>
        [-0.24, 0.24].map((lz) => (
          <mesh key={`nleg-${lx}-${lz}`} position={[lx, 0.21, lz]} receiveShadow>
            <cylinderGeometry args={[0.025, 0.035, 0.42, 8]} />
            <meshStandardMaterial map={woodTex} color="#231308" roughness={0.75} />
          </mesh>
        ))
      )}

      {/* ── Antique Tabletop Lamp ── */}
      <group position={[0.08, 0.75, -0.05]}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.11, 0.13, 0.04, 10]} />
          <meshStandardMaterial color="#947336" roughness={0.4} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.04, 0.07, 0.28, 8]} />
          <meshStandardMaterial color="#4a2d10" roughness={0.2} metalness={0.4} />
        </mesh>
        <mesh ref={bulbMeshRef} position={[0, 0.36, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color="#fff0c0"
            emissive="#ffaa33"
            emissiveIntensity={2.5}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0, 0.48, 0]} rotation={[0.08, 0.1, -0.06]}>
          <cylinderGeometry args={[0.12, 0.24, 0.32, 12, 1, true]} />
          <meshStandardMaterial
            color="#e2d3b5"
            roughness={0.9}
            side={THREE.DoubleSide}
            emissive="#ffaa33"
            emissiveIntensity={0.25}
          />
        </mesh>
        <pointLight
          ref={lampLightRef}
          position={[0, 0.45, 0]}
          intensity={8.0}
          distance={6.5}
          color="#ff9d42"
          castShadow={false}
        />
      </group>

      {/* Tabletop Props */}
      <mesh position={[-0.22, 0.83, 0.1]}>
        <cylinderGeometry args={[0.025, 0.03, 0.12, 8]} />
        <meshStandardMaterial color="#4a2505" roughness={0.15} metalness={0.2} transparent opacity={0.88} />
      </mesh>

      {/* Interaction Sensor Zone */}
      <RigidBody
        type="fixed"
        position={[0, 0.5, 0.4]}
        sensor
        onIntersectionEnter={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            canInteractRef.current = true;
            setInteractPrompt(isOpenRef.current ? 'Press E to Close Nightstand Drawer' : 'Press E to Open Nightstand Drawer');
          }
        }}
        onIntersectionExit={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            canInteractRef.current = false;
            setInteractPrompt(null);
          }
        }}
      >
        <CuboidCollider args={[0.8, 0.8, 0.8]} />
      </RigidBody>
    </group>
  );
}

// ─── 3. Dilapidated Dresser with ALL Openable/Closable Drawers ──────────────────
function DilapidatedDresser({
  position,
  rotY = 0,
  woodTex,
  clothTex,
}: {
  position: [number, number, number];
  rotY?: number;
  woodTex: THREE.Texture;
  clothTex: THREE.Texture;
}) {
  const setInteractPrompt = useGameStore((s) => s.setInteractPrompt);
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const canInteractRef = useRef(false);

  const drawersRef = useRef<Array<THREE.Group | null>>([]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    drawersRef.current.forEach((drGroup, idx) => {
      if (drGroup) {
        // Individual staggered open positions when open
        const pullOffsets = [0.15, 0.35, 0.2, 0.42, 0.18];
        const targetZ = isOpen ? pullOffsets[idx] : 0.02;
        const diff = targetZ - drGroup.position.z;
        if (Math.abs(diff) > 0.002) {
          drGroup.position.z += diff * Math.min(1, dt * 5.0);
        }
      }
    });
  });

  useEffect(() => {
    const handleKey = (evt: KeyboardEvent) => {
      if (evt.code === 'KeyE' && canInteractRef.current) {
        playCreakSound();
        const next = !isOpenRef.current;
        setIsOpen(next);
        isOpenRef.current = next;
        setInteractPrompt(next ? 'Press E to Close Drawers' : 'Press E to Open Drawers');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setInteractPrompt]);

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Dresser RigidBody Collider */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.9, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[1.5, 1.8, 0.8]} />
        </mesh>
      </RigidBody>

      {/* Heavy Outer Wooden Carcase */}
      <mesh position={[0, 0.9, 0]} receiveShadow>
        <boxGeometry args={[1.42, 1.76, 0.72]} />
        <meshStandardMaterial map={woodTex} color="#2c160b" roughness={0.78} />
      </mesh>

      {/* Top Mantle Overhang */}
      <mesh position={[0, 1.8, 0]} receiveShadow>
        <boxGeometry args={[1.52, 0.06, 0.8]} />
        <meshStandardMaterial map={woodTex} color="#351a0d" roughness={0.7} />
      </mesh>

      {/* 5 Stacked Interactive Sliding Drawers */}
      {[1.52, 1.22, 0.92, 0.62, 0.32].map((yPos, idx) => (
        <group
          key={`idrawer-${idx}`}
          ref={(el) => {
            drawersRef.current[idx] = el;
          }}
          position={[0, yPos, 0.02]}
        >
          <mesh position={[0, 0, 0.22]} receiveShadow>
            <boxGeometry args={[1.28, 0.24, 0.36]} />
            <meshStandardMaterial map={woodTex} color="#241208" roughness={0.85} />
          </mesh>
          {/* Brass Drawer Knobs */}
          {[-0.38, 0.38].map((kx) => (
            <mesh key={`knob-${kx}`} position={[kx, 0, 0.41]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.015, 0.03, 8]} />
              <meshStandardMaterial color="#a6843c" roughness={0.4} metalness={0.85} />
            </mesh>
          ))}

          {/* Clothes spilling out of 4th drawer */}
          {idx === 3 && (
            <mesh position={[-0.2, 0.06, 0.3]} rotation={[0.4, 0.15, -0.1]} receiveShadow>
              <boxGeometry args={[0.38, 0.24, 0.16]} />
              <meshStandardMaterial map={clothTex} color="#8a7c6e" roughness={0.95} />
            </mesh>
          )}
        </group>
      ))}

      {/* Props on Top of Dresser */}
      <mesh position={[-0.35, 2.05, -0.05]} rotation={[-0.12, 0.2, 0]}>
        <boxGeometry args={[0.38, 0.48, 0.04]} />
        <meshStandardMaterial color="#1a0c06" roughness={0.8} />
      </mesh>
      <mesh position={[-0.35, 2.05, -0.03]} rotation={[-0.12, 0.2, 0]}>
        <planeGeometry args={[0.32, 0.42]} />
        <meshStandardMaterial color="#403830" roughness={0.5} />
      </mesh>

      <group position={[0.35, 1.86, 0.05]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.22, 0.14, 0.12, 10]} />
          <meshStandardMaterial color="#8e9da3" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.26, 8]} />
          <meshStandardMaterial color="#7b8b91" roughness={0.45} />
        </mesh>
      </group>

      {/* Interaction Trigger Zone */}
      <RigidBody
        type="fixed"
        position={[0, 0.9, 0.6]}
        sensor
        onIntersectionEnter={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            canInteractRef.current = true;
            setInteractPrompt(isOpenRef.current ? 'Press E to Close Drawers' : 'Press E to Open Drawers');
          }
        }}
        onIntersectionExit={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            canInteractRef.current = false;
            setInteractPrompt(null);
          }
        }}
      >
        <CuboidCollider args={[1.2, 1.0, 1.0]} />
      </RigidBody>
    </group>
  );
}

// ─── 4. Openable / Closable Victorian Almari (Armoire / Wardrobe) ──────────────
function InteractableAlmari({
  position,
  rotY = 0,
  woodTex,
}: {
  position: [number, number, number];
  rotY?: number;
  woodTex: THREE.Texture;
}) {
  const setInteractPrompt = useGameStore((s) => s.setInteractPrompt);
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const canInteractRef = useRef(false);

  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const targetAngleLeft = isOpen ? -Math.PI / 1.8 : 0;
    const targetAngleRight = isOpen ? Math.PI / 1.8 : 0;

    if (leftDoorRef.current) {
      const diff = targetAngleLeft - leftDoorRef.current.rotation.y;
      if (Math.abs(diff) > 0.002) {
        leftDoorRef.current.rotation.y += diff * Math.min(1, dt * 5.0);
      }
    }
    if (rightDoorRef.current) {
      const diff = targetAngleRight - rightDoorRef.current.rotation.y;
      if (Math.abs(diff) > 0.002) {
        rightDoorRef.current.rotation.y += diff * Math.min(1, dt * 5.0);
      }
    }
  });

  useEffect(() => {
    const handleKey = (evt: KeyboardEvent) => {
      if (evt.code === 'KeyE' && canInteractRef.current) {
        playCreakSound();
        const next = !isOpenRef.current;
        setIsOpen(next);
        isOpenRef.current = next;
        setInteractPrompt(next ? 'Press E to Close Almari' : 'Press E to Open Almari');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setInteractPrompt]);

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Armoire Body Collider */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1.5, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[1.7, 3.0, 0.85]} />
        </mesh>
      </RigidBody>

      {/* Main Outer Wardrobe Carcase */}
      <mesh position={[0, 1.5, 0]} receiveShadow>
        <boxGeometry args={[1.62, 2.95, 0.78]} />
        <meshStandardMaterial map={woodTex} color="#241107" roughness={0.8} />
      </mesh>

      {/* Hollow Interior Cavity */}
      <mesh position={[0, 1.48, 0.04]}>
        <boxGeometry args={[1.5, 2.7, 0.68]} />
        <meshStandardMaterial color="#080402" roughness={0.95} />
      </mesh>

      {/* Ornate Top Pediment Crest */}
      <mesh position={[0, 3.04, 0]}>
        <boxGeometry args={[1.74, 0.18, 0.86]} />
        <meshStandardMaterial map={woodTex} color="#1b0b04" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.18, 0.1]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.22, 0.16, 4]} />
        <meshStandardMaterial color="#1b0b04" roughness={0.7} />
      </mesh>

      {/* ── Left Door (Hinged at left edge X = -0.73) ── */}
      <group position={[-0.73, 1.48, 0.38]} ref={leftDoorRef}>
        <mesh position={[0.35, 0, 0]} receiveShadow>
          <boxGeometry args={[0.7, 2.5, 0.04]} />
          <meshStandardMaterial map={woodTex} color="#1f0e05" roughness={0.85} />
        </mesh>
        {/* Brass handle */}
        <mesh position={[0.64, 0, 0.03]}>
          <cylinderGeometry args={[0.012, 0.012, 0.08, 6]} />
          <meshStandardMaterial color="#9e7c35" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* ── Right Door (Hinged at right edge X = 0.73) ── */}
      <group position={[0.73, 1.48, 0.38]} ref={rightDoorRef}>
        <mesh position={[-0.35, 0, 0]} receiveShadow>
          <boxGeometry args={[0.7, 2.5, 0.04]} />
          <meshStandardMaterial map={woodTex} color="#1f0e05" roughness={0.85} />
        </mesh>
        {/* Brass handle */}
        <mesh position={[-0.64, 0, 0.03]}>
          <cylinderGeometry args={[0.012, 0.012, 0.08, 6]} />
          <meshStandardMaterial color="#9e7c35" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* Hanging Black Silhouette Garments Inside */}
      <mesh position={[0, 1.5, -0.05]} rotation={[0, 0.1, 0]}>
        <boxGeometry args={[0.7, 1.6, 0.25]} />
        <meshStandardMaterial color="#0d0806" roughness={0.95} />
      </mesh>

      {/* Interaction Sensor Zone */}
      <RigidBody
        type="fixed"
        position={[0, 1.5, 0.8]}
        sensor
        onIntersectionEnter={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            canInteractRef.current = true;
            setInteractPrompt(isOpenRef.current ? 'Press E to Close Almari' : 'Press E to Open Almari');
          }
        }}
        onIntersectionExit={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            canInteractRef.current = false;
            setInteractPrompt(null);
          }
        }}
      >
        <CuboidCollider args={[1.4, 1.5, 1.2]} />
      </RigidBody>
    </group>
  );
}

// ─── 5. Boarded Window with Moonlight Rays (Back Wall at Z = 25.45) ──────────
function BoardedHorrorWindow({
  position,
  windowTex,
  woodTex,
}: {
  position: [number, number, number];
  windowTex: THREE.Texture;
  woodTex: THREE.Texture;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[2.2, 2.8, 0.16]} />
        <meshStandardMaterial color="#1a0f08" roughness={0.85} />
      </mesh>

      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[1.85, 2.45]} />
        <meshStandardMaterial
          map={windowTex}
          color="#8ab0c8"
          emissive="#3a5a75"
          emissiveIntensity={1.4}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[0.06, 2.45, 0.04]} />
        <meshStandardMaterial color="#120a05" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.3, 0.07]}>
        <boxGeometry args={[1.85, 0.06, 0.04]} />
        <meshStandardMaterial color="#120a05" roughness={0.9} />
      </mesh>

      {[
        { y: 0.55, z: 0.1, rotZ: 0.12, len: 2.1 },
        { y: 0.05, z: 0.11, rotZ: -0.18, len: 2.2 },
        { y: -0.45, z: 0.1, rotZ: 0.08, len: 2.05 },
      ].map((pl, idx) => (
        <group key={`plank-${idx}`} position={[0, pl.y, pl.z]} rotation={[0, 0, pl.rotZ]}>
          <mesh receiveShadow>
            <boxGeometry args={[pl.len, 0.18, 0.035]} />
            <meshStandardMaterial map={woodTex} color="#382113" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── 6. Haunted Fireplace with Glowing Dying Embers & Mantel Clocks ────────────
function HauntedFireplace({
  position,
  rotY = 0,
  woodTex,
}: {
  position: [number, number, number];
  rotY?: number;
  woodTex: THREE.Texture;
}) {
  const emberLightRef = useRef<THREE.PointLight>(null);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    if (emberLightRef.current) {
      const t = state.clock.elapsedTime * 3.5;
      const flicker = 4.0 + Math.sin(t * 2.3) * Math.cos(t * 1.7) * 1.5;
      emberLightRef.current.intensity = THREE.MathUtils.lerp(emberLightRef.current.intensity, flicker, dt * 10);
    }
  });

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1.2, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[2.4, 2.4, 0.7]} />
        </mesh>
      </RigidBody>

      <mesh position={[0, 1.2, 0]} receiveShadow>
        <boxGeometry args={[2.3, 2.4, 0.65]} />
        <meshStandardMaterial color="#221815" roughness={0.95} />
      </mesh>

      <mesh position={[0, 0.75, 0.1]}>
        <boxGeometry args={[1.35, 1.45, 0.52]} />
        <meshStandardMaterial color="#080505" roughness={1.0} />
      </mesh>

      <mesh position={[0, 0.16, 0.18]}>
        <boxGeometry args={[0.95, 0.12, 0.35]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.5} />
      </mesh>

      {[-0.2, 0.2].map((lx, idx) => (
        <mesh key={`log-${idx}`} position={[lx, 0.22, 0.18]} rotation={[0, idx * 0.4 - 0.2, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.08, 0.7, 6]} />
          <meshStandardMaterial color="#100b08" roughness={0.95} />
        </mesh>
      ))}

      <mesh position={[0, 0.14, 0.18]}>
        <boxGeometry args={[0.85, 0.08, 0.32]} />
        <meshStandardMaterial
          color="#ff3300"
          emissive="#ff2200"
          emissiveIntensity={1.8}
          roughness={0.9}
        />
      </mesh>

      <pointLight
        ref={emberLightRef}
        position={[0, 0.4, 0.25]}
        intensity={4.5}
        distance={4.5}
        color="#ff4411"
        castShadow={false}
      />

      <mesh position={[0, 2.44, 0.06]} receiveShadow>
        <boxGeometry args={[2.55, 0.14, 0.8]} />
        <meshStandardMaterial map={woodTex} color="#2b1408" roughness={0.7} />
      </mesh>

      <group position={[0, 2.72, 0.1]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.42, 0.44, 0.2]} />
          <meshStandardMaterial map={woodTex} color="#1e0c03" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0, 0.11]}>
          <circleGeometry args={[0.14, 12]} />
          <meshStandardMaterial color="#e0d6c0" roughness={0.6} />
        </mesh>
      </group>

      {[-0.8, 0.8].map((cx) => (
        <group key={`mcandle-${cx}`} position={[cx, 2.58, 0.1]}>
          <mesh>
            <cylinderGeometry args={[0.035, 0.045, 0.16, 8]} />
            <meshStandardMaterial color="#ded2be" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshBasicMaterial color="#ffaa33" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── 7. Slowly Rocking Antique Wooden Chair (Haunted Motion) ───────────────────
function HauntedRockingChair({
  position,
  rotY = 0,
  woodTex,
}: {
  position: [number, number, number];
  rotY?: number;
  woodTex: THREE.Texture;
}) {
  const chairRef = useRef<THREE.Group>(null);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    if (chairRef.current) {
      const t = state.clock.elapsedTime * 1.8;
      const rockAngle = Math.sin(t) * 0.065;
      chairRef.current.rotation.x = THREE.MathUtils.lerp(chairRef.current.rotation.x, rockAngle, dt * 6);
    }
  });

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.55, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[0.75, 1.1, 0.85]} />
        </mesh>
      </RigidBody>

      <group ref={chairRef}>
        {[-0.32, 0.32].map((rx) => (
          <mesh key={`rocker-${rx}`} position={[rx, 0.04, 0]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.9]} />
            <meshStandardMaterial map={woodTex} color="#2d1708" roughness={0.7} />
          </mesh>
        ))}

        <mesh position={[0, 0.46, 0]} receiveShadow>
          <boxGeometry args={[0.62, 0.05, 0.6]} />
          <meshStandardMaterial map={woodTex} color="#351b0a" roughness={0.75} />
        </mesh>

        {[-0.26, 0.26].map((lx) =>
          [-0.22, 0.22].map((lz) => (
            <mesh key={`cleg-${lx}-${lz}`} position={[lx, 0.25, lz]}>
              <cylinderGeometry args={[0.02, 0.025, 0.42, 6]} />
              <meshStandardMaterial map={woodTex} color="#251206" roughness={0.8} />
            </mesh>
          ))
        )}

        <mesh position={[0, 0.92, -0.28]} rotation={[-0.15, 0, 0]}>
          <boxGeometry args={[0.62, 0.06, 0.04]} />
          <meshStandardMaterial map={woodTex} color="#2d1708" roughness={0.7} />
        </mesh>
        {[-0.22, -0.11, 0, 0.11, 0.22].map((bx) => (
          <mesh key={`bspindle-${bx}`} position={[bx, 0.72, -0.26]} rotation={[-0.15, 0, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.48, 6]} />
            <meshStandardMaterial map={woodTex} color="#200d04" roughness={0.8} />
          </mesh>
        ))}

        {[-0.32, 0.32].map((ax) => (
          <mesh key={`arm-${ax}`} position={[ax, 0.66, -0.02]} rotation={[0.08, 0, 0]}>
            <boxGeometry args={[0.05, 0.03, 0.52]} />
            <meshStandardMaterial map={woodTex} color="#2d1708" roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ─── 8. Wall-Mounted Antique Ravi Portrait (Mounted securely on Wall!) ─────────
function WallMountedRaviPortrait({
  position,
  rotY = 0,
  raviTex,
}: {
  position: [number, number, number];
  rotY?: number;
  raviTex: THREE.Texture;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Heavy Ornate Tarnished Victorian Baroque Gold Frame */}
      <mesh receiveShadow>
        <boxGeometry args={[1.35, 1.75, 0.08]} />
        <meshStandardMaterial color="#1a1208" roughness={0.6} metalness={0.7} />
      </mesh>
      {/* Outer Carved Molding Trim */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[1.42, 1.82, 0.04]} />
        <meshStandardMaterial color="#2d220e" roughness={0.5} metalness={0.85} />
      </mesh>
      {/* Hanging Chain / Wall Anchor */}
      <mesh position={[0, 1.0, 0.01]}>
        <boxGeometry args={[0.08, 0.2, 0.02]} />
        <meshStandardMaterial color="#332a18" metalness={0.9} />
      </mesh>
      {/* Canvas with Ravi Face Texture */}
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[1.15, 1.55]} />
        <meshStandardMaterial
          map={raviTex}
          roughness={0.4}
          color="#dfd0c0"
        />
      </mesh>
    </group>
  );
}

// ─── 9. Decayed Dressing Vanity Flush Against Wall with Tracking Doll ──────────
function DecayedVanityWithDoll({
  position,
  rotY = 0,
  woodTex,
}: {
  position: [number, number, number];
  rotY?: number;
  woodTex: THREE.Texture;
}) {
  const dollHeadRef = useRef<THREE.Group>(null);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    if (dollHeadRef.current) {
      const playerPos = useGameStore.getState().playerPos;
      const dollWorldX = position[0];
      const dollWorldZ = position[2];
      const dx = playerPos.x - dollWorldX;
      const dz = playerPos.z - dollWorldZ;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 6.0 && dist > 0.3) {
        const targetAngle = Math.atan2(dx, dz) - rotY;
        dollHeadRef.current.rotation.y = THREE.MathUtils.lerp(
          dollHeadRef.current.rotation.y,
          targetAngle,
          dt * 3.5
        );
      }
    }
  });

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Vanity Collider */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.8, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[1.4, 1.6, 0.6]} />
        </mesh>
      </RigidBody>

      {/* Dressing Table Top */}
      <mesh position={[0, 0.75, 0]} receiveShadow>
        <boxGeometry args={[1.35, 0.06, 0.55]} />
        <meshStandardMaterial map={woodTex} color="#351a0d" roughness={0.7} />
      </mesh>

      {/* Side Pedestals */}
      {[-0.45, 0.45].map((px) => (
        <mesh key={`vped-${px}`} position={[px, 0.4, 0]} receiveShadow>
          <boxGeometry args={[0.36, 0.66, 0.48]} />
          <meshStandardMaterial map={woodTex} color="#261207" roughness={0.8} />
        </mesh>
      ))}

      {/* Attached Oval Mirror Frame on Table Back */}
      <mesh position={[0, 1.4, -0.22]} receiveShadow>
        <boxGeometry args={[0.88, 1.15, 0.05]} />
        <meshStandardMaterial color="#200d04" roughness={0.7} />
      </mesh>
      {/* Dull Silvered Mirror Glass */}
      <mesh position={[0, 1.4, -0.19]}>
        <planeGeometry args={[0.76, 1.02]} />
        <meshStandardMaterial metalness={0.94} roughness={0.12} color="#9cb2bc" />
      </mesh>

      {/* Stool with Creepy Victorian Porcelain Doll */}
      <group position={[0, 0, 0.45]}>
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.05, 10]} />
          <meshStandardMaterial color="#4a1515" roughness={0.9} />
        </mesh>
        {[-0.14, 0.14].map((sx) =>
          [-0.14, 0.14].map((sz) => (
            <mesh key={`sleg-${sx}-${sz}`} position={[sx, 0.18, sz]}>
              <cylinderGeometry args={[0.018, 0.018, 0.36, 6]} />
              <meshStandardMaterial color="#200e05" roughness={0.8} />
            </mesh>
          ))
        )}

        {/* Porcelain Doll Sitting on Stool */}
        <group position={[0, 0.42, 0]}>
          <mesh position={[0, 0.16, 0]}>
            <coneGeometry args={[0.15, 0.32, 8]} />
            <meshStandardMaterial color="#ded5c4" roughness={0.9} />
          </mesh>
          {[-0.05, 0.05].map((lx) => (
            <mesh key={`dleg-${lx}`} position={[lx, 0.02, 0.08]} rotation={[0.3, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.018, 0.22, 6]} />
              <meshStandardMaterial color="#f0eae1" roughness={0.3} />
            </mesh>
          ))}
          {/* Tracking Porcelain Head */}
          <group ref={dollHeadRef} position={[0, 0.36, 0]}>
            <mesh>
              <sphereGeometry args={[0.085, 10, 10]} />
              <meshStandardMaterial color="#ece5dc" roughness={0.25} />
            </mesh>
            {[-0.03, 0.03].map((ex) => (
              <mesh key={`eye-${ex}`} position={[ex, 0.015, 0.075]}>
                <sphereGeometry args={[0.014, 6, 6]} />
                <meshBasicMaterial color="#050505" />
              </mesh>
            ))}
            <mesh position={[0, 0.04, -0.02]}>
              <sphereGeometry args={[0.09, 8, 8]} />
              <meshStandardMaterial color="#151210" roughness={0.9} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

// ─── 10. Floor Debris, Stained Rug & Detailing ─────────────────────────────────
function MasterBedroomDebris({
  carpetTex,
  woodTex,
}: {
  carpetTex: THREE.Texture;
  woodTex: THREE.Texture;
}) {
  return (
    <group position={[0, 5.015, 0]}>
      {/* Stained Victorian Floor Rug Under Bed Area */}
      <mesh position={[-11.0, 0.005, 20.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.2, 4.8]} />
        <meshStandardMaterial map={carpetTex} roughness={0.95} color="#5a1818" />
      </mesh>

      {/* Scattered Torn Wooden Planks on Floor */}
      {[
        { x: -9.2, z: 22.8, r: 0.45 },
        { x: -13.1, z: 17.2, r: -0.85 },
        { x: -8.8, z: 18.2, r: 1.2 },
        { x: -12.4, z: 23.5, r: -0.3 },
      ].map((pl, idx) => (
        <mesh key={`fplank-${idx}`} position={[pl.x, 0.015, pl.z]} rotation={[-Math.PI / 2, 0, pl.r]} receiveShadow>
          <planeGeometry args={[0.9, 0.16]} />
          <meshStandardMaterial map={woodTex} color="#2b170c" roughness={0.9} />
        </mesh>
      ))}

      {/* Broken Picture Frame on Floor */}
      <group position={[-9.6, 0.02, 23.2]} rotation={[-Math.PI / 2, 0, 0.6]}>
        <mesh>
          <planeGeometry args={[0.55, 0.7]} />
          <meshStandardMaterial color="#1a0c04" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[0.45, 0.6]} />
          <meshStandardMaterial color="#c0d0d8" roughness={0.1} metalness={0.9} />
        </mesh>
      </group>

      {/* Discarded Dirty Old Boots in Corner */}
      {[-13.8, -13.6].map((bx, idx) => (
        <mesh key={`boot-${idx}`} position={[bx, 0.08, 22.8]} rotation={[0, idx * 0.5 - 0.2, 0]}>
          <boxGeometry args={[0.12, 0.15, 0.26]} />
          <meshStandardMaterial color="#1a1410" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ─── MAIN SW HORROR MASTER BEDROOM COMPONENT ──────────────────────────────────
export default function HorrorMasterBedroom() {
  const [wallpaperTex, bedClothTex, raviFaceTex, floorWoodTex, carpetTex, windowTex] = useTexture([
    '/textures/decayed_master_wallpaper.jpg',
    '/textures/stained_bed_cloth.jpg',
    '/ravi Face.png',
    '/textures/rustic_wood_planks.jpg',
    '/textures/bloody_carpet.png',
    '/textures/frosted_horror_window.jpg',
  ]);

  useMemo(() => {
    wallpaperTex.wrapS = THREE.RepeatWrapping;
    wallpaperTex.wrapT = THREE.RepeatWrapping;
    wallpaperTex.repeat.set(3.5, 1.8);

    bedClothTex.wrapS = THREE.RepeatWrapping;
    bedClothTex.wrapT = THREE.RepeatWrapping;
    bedClothTex.repeat.set(1.5, 1.5);

    floorWoodTex.wrapS = THREE.RepeatWrapping;
    floorWoodTex.wrapT = THREE.RepeatWrapping;
    floorWoodTex.repeat.set(5.0, 7.0);
  }, [wallpaperTex, bedClothTex, floorWoodTex]);

  return (
    <group>
      {/* ═══ FULL MASTER BEDROOM FLOORING (Entire room X: [-15.0, -6.5], Z: [12.5, 25.5]) ═══ */}
      <mesh position={[-10.75, 5.01, 19.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8.5, 13.0]} />
        <meshStandardMaterial map={floorWoodTex} roughness={0.65} />
      </mesh>

      {/* ═══ FULL 4-WALL WALLPAPER ENCLOSURE ═══════════════════════════════════ */}
      {/* 1. Outer West Wall (X = -14.98, Z = 12.5 to 25.5, Length = 13.0m) */}
      <mesh position={[-14.98, 7.5, 19.0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[13.0, 5.0]} />
        <meshStandardMaterial map={wallpaperTex} roughness={0.9} />
      </mesh>

      {/* 2. Back South Wall (Z = 25.48, X = -15.0 to -6.5, Width = 8.5m) */}
      <mesh position={[-10.75, 7.5, 25.48]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[8.5, 5.0]} />
        <meshStandardMaterial map={wallpaperTex} roughness={0.9} />
      </mesh>

      {/* 3. North Dividing Wall (Z = 12.52, X = -15.0 to -6.5, Width = 8.5m) */}
      <mesh position={[-10.75, 7.5, 12.52]} rotation={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8.5, 5.0]} />
        <meshStandardMaterial map={wallpaperTex} roughness={0.9} />
      </mesh>

      {/* 4. East Corridor Wall (X = -6.52, facing into room): */}
      {/* 4A. North Section (Z = 12.5 to 15.5, length = 3.0m) */}
      <mesh position={[-6.52, 7.5, 14.0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[3.0, 5.0]} />
        <meshStandardMaterial map={wallpaperTex} roughness={0.9} />
      </mesh>
      {/* 4B. South Section (Z = 18.5 to 25.5, length = 7.0m) */}
      <mesh position={[-6.52, 7.5, 22.0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7.0, 5.0]} />
        <meshStandardMaterial map={wallpaperTex} roughness={0.9} />
      </mesh>
      {/* 4C. Header Beam Above Doorway (Z = 17.0, height = 2.0m from Y = 8.0 to 10.0) */}
      <mesh position={[-6.52, 9.0, 17.0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[3.0, 2.0]} />
        <meshStandardMaterial map={wallpaperTex} roughness={0.9} />
      </mesh>

      {/* ── 1. Abandoned Victorian Wrought Iron Bed (Centerpiece) ── */}
      <AbandonedVictorianBed
        position={[-11.0, 5.0, 20.2]}
        rotY={0}
        clothTex={bedClothTex}
      />

      {/* ── 2. Bedside Nightstand with Openable Drawer & Flickering Lamp ── */}
      <BedsideNightstandWithLamp
        position={[-13.2, 5.0, 20.2]}
        rotY={Math.PI / 2}
        woodTex={floorWoodTex}
      />

      {/* ── 3. Dilapidated Dresser with ALL Openable Drawers (West Wall) ── */}
      <DilapidatedDresser
        position={[-14.35, 5.0, 15.5]}
        rotY={Math.PI / 2}
        woodTex={floorWoodTex}
        clothTex={bedClothTex}
      />

      {/* ── 4. Openable / Closable Almari (Armoire Wardrobe on West Wall) ── */}
      <InteractableAlmari
        position={[-14.35, 5.0, 23.5]}
        rotY={Math.PI / 2}
        woodTex={floorWoodTex}
      />

      {/* ── 5. Boarded Window with Moonlight Rays on Back Wall (Z = 25.45) ── */}
      <BoardedHorrorWindow
        position={[-11.0, 7.5, 25.45]}
        windowTex={windowTex}
        woodTex={floorWoodTex}
      />

      {/* ── 6. Haunted Brick Fireplace & Relic Mantle (North Wall) ── */}
      <HauntedFireplace
        position={[-12.2, 5.0, 13.0]}
        rotY={0}
        woodTex={floorWoodTex}
      />

      {/* ── 7. Wall-Mounted Ravi Kishan Antique Portrait (North Wall!) ── */}
      <WallMountedRaviPortrait
        position={[-10.75, 7.6, 12.56]}
        rotY={0}
        raviTex={raviFaceTex}
      />

      {/* ── 8. Decayed Dressing Vanity Flush with North Wall with Tracking Doll ── */}
      <DecayedVanityWithDoll
        position={[-8.5, 5.0, 13.1]}
        rotY={0}
        woodTex={floorWoodTex}
      />

      {/* ── 9. Slowly Rocking Antique Wooden Chair (Southeast Corner) ── */}
      <HauntedRockingChair
        position={[-7.8, 5.0, 23.6]}
        rotY={-Math.PI * 0.65}
        woodTex={floorWoodTex}
      />

      {/* ── 10. Floor Debris, Torn Rug & Detailing ── */}
      <MasterBedroomDebris carpetTex={carpetTex} woodTex={floorWoodTex} />
    </group>
  );
}
