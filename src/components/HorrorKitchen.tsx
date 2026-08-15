'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { playFlashlightClickSound, playItemPickupSound } from '@/utils/creepyAudio';

// Sound helper
function playKitchenSound(type: 'fridge' | 'creak') {
  if (typeof window === 'undefined') return;
  const soundPath = '/stairs and doors.mp3';
  const audio = new Audio(soundPath);
  audio.volume = 0.45;
  audio.play().catch(() => {});
}

// ─── 0. Survival Horror 3D Flashlight Item ─────────────────────────────────────
function VintageFlashlightItem({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0.45, 0]}>
      {/* Heavy Cylindrical Ribbed Handle */}
      <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.26, 10]} />
        <meshStandardMaterial color="#22252a" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Brass Trim Ring */}
      <mesh position={[0, 0.04, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.042, 0.04, 0.02, 10]} />
        <meshStandardMaterial color="#c5a059" roughness={0.3} metalness={0.95} />
      </mesh>

      {/* Flared Reflector Head Bezel */}
      <mesh position={[0, 0.04, 0.17]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.065, 0.042, 0.07, 10]} />
        <meshStandardMaterial color="#30353c" roughness={0.35} metalness={0.85} />
      </mesh>

      {/* Front Glass Lens with Occult / Warm Glow */}
      <mesh position={[0, 0.04, 0.206]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.058, 12]} />
        <meshStandardMaterial
          color="#fffae6"
          emissive="#ffe082"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Slide Switch */}
      <mesh position={[0, 0.082, 0.02]}>
        <boxGeometry args={[0.016, 0.012, 0.04]} />
        <meshStandardMaterial color="#b71c1c" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Subtle Warm Highlight Light */}
      <pointLight position={[0, 0.15, 0.15]} color="#ffe082" distance={1.2} intensity={2.0} castShadow={false} />
    </group>
  );
}

// ─── 1. Vintage 1950s Rounded Retro Refrigerator ───────────────────────────────
function VintageRetroFridge({ 
  position, 
  fridgeTex, 
  woodTex 
}: { 
  position: [number, number, number]; 
  fridgeTex: THREE.Texture; 
  woodTex: THREE.Texture; 
}) {
  const hasFlashlight = useGameStore((s) => s.hasFlashlight);
  const setHasFlashlight = useGameStore((s) => s.setHasFlashlight);
  const setIsFlashlightOn = useGameStore((s) => s.setIsFlashlightOn);
  const setInteractPrompt = useGameStore((s) => s.setInteractPrompt);

  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const canInteractRef = useRef(false);
  const doorGroupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  isOpenRef.current = isOpen;

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    if (doorGroupRef.current) {
      const targetRot = isOpen ? Math.PI / 1.75 : 0;
      const diff = targetRot - doorGroupRef.current.rotation.y;
      if (Math.abs(diff) > 0.002) {
        doorGroupRef.current.rotation.y += diff * Math.min(1, dt * 5.0);
      }
    }
    if (lightRef.current) {
      const targetIntensity = isOpen ? 7.0 : 0.8;
      if (Math.abs(lightRef.current.intensity - targetIntensity) > 0.05) {
        lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, targetIntensity, Math.min(1, dt * 8));
      }
    }
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && canInteractRef.current) {
        const store = useGameStore.getState();
        if (!isOpenRef.current) {
          setIsOpen(true);
          isOpenRef.current = true;
          playKitchenSound('fridge');
          if (!store.hasFlashlight) {
            setInteractPrompt('Press E to Take Flashlight');
          } else {
            setInteractPrompt('Press E to Close Fridge');
          }
        } else {
          if (!store.hasFlashlight) {
            setHasFlashlight(true);
            setIsFlashlightOn(true);
            playItemPickupSound();
            playFlashlightClickSound(true);
            setInteractPrompt('Press E to Close Fridge');
          } else {
            setIsOpen(false);
            isOpenRef.current = false;
            playKitchenSound('fridge');
            setInteractPrompt('Press E to Open Fridge');
          }
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setHasFlashlight, setIsFlashlightOn, setInteractPrompt]);

  return (
    <group position={position}>
      <RigidBody type="fixed" colliders="cuboid">
        {/* Main Body Shell */}
        <mesh position={[0, 1.2, -0.45]} receiveShadow>
          <boxGeometry args={[1.2, 2.3, 0.1]} />
          <meshStandardMaterial map={fridgeTex} roughness={0.7} metalness={0.4} color="#a0c8b0" />
        </mesh>
        <mesh position={[-0.55, 1.2, 0]} receiveShadow>
          <boxGeometry args={[0.1, 2.3, 0.9]} />
          <meshStandardMaterial map={fridgeTex} roughness={0.7} metalness={0.4} color="#a0c8b0" />
        </mesh>
        <mesh position={[0.55, 1.2, 0]} receiveShadow>
          <boxGeometry args={[0.1, 2.3, 0.9]} />
          <meshStandardMaterial map={fridgeTex} roughness={0.7} metalness={0.4} color="#a0c8b0" />
        </mesh>
        <mesh position={[0, 2.35, 0]} receiveShadow>
          <boxGeometry args={[1.2, 0.1, 0.9]} />
          <meshStandardMaterial map={fridgeTex} roughness={0.7} metalness={0.4} color="#a0c8b0" />
        </mesh>
        {/* Bottom Base */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[1.15, 0.2, 0.85]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* Interior Compartments */}
      <group position={[0, 0, 0]}>
        {/* Top Freezer Box */}
        <mesh position={[0, 1.95, -0.05]}>
          <boxGeometry args={[1.0, 0.45, 0.7]} />
          <meshStandardMaterial color="#e5eae6" roughness={0.5} />
        </mesh>
        {/* Wire Shelves */}
        {[0.8, 1.2, 1.55].map((y, idx) => (
          <mesh key={`shelf-${idx}`} position={[0, y, 0]}>
            <boxGeometry args={[1.0, 0.02, 0.7]} />
            <meshStandardMaterial color="#889988" metalness={0.8} roughness={0.4} />
          </mesh>
        ))}

        {/* Rotting Food / Jars / Props */}
        <mesh position={[-0.32, 0.65, -0.1]}>
          <boxGeometry args={[0.14, 0.32, 0.14]} />
          <meshStandardMaterial color="#e6dec3" roughness={0.9} />
        </mesh>
        <mesh position={[0.2, 0.6, -0.1]}>
          <cylinderGeometry args={[0.05, 0.05, 0.16, 8]} />
          <meshStandardMaterial color="#e5b83b" roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[-0.2, 1.05, -0.1]}>
          <cylinderGeometry args={[0.04, 0.045, 0.26, 8]} />
          <meshStandardMaterial color="#2d4a2d" roughness={0.2} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, 0.3, -0.1]}>
          <cylinderGeometry args={[0.18, 0.16, 0.22, 10]} />
          <meshStandardMaterial color="#4a4030" roughness={0.7} metalness={0.5} />
        </mesh>

        {/* Flashlight Inside Fridge */}
        {!hasFlashlight && (
          <VintageFlashlightItem position={[0.0, 1.22, 0.05]} />
        )}
      </group>

      {/* Fridge Door */}
      <group position={[0.55, 1.2, 0.45]} ref={doorGroupRef}>
        <mesh position={[-0.6, 0, 0.05]} receiveShadow>
          <boxGeometry args={[1.2, 2.25, 0.1]} />
          <meshStandardMaterial map={fridgeTex} roughness={0.65} metalness={0.35} color="#a0c8b0" />
        </mesh>
        {/* Latch Handle */}
        <mesh position={[-1.05, 0.1, 0.14]}>
          <boxGeometry args={[0.06, 0.35, 0.05]} />
          <meshStandardMaterial color="#b0b0b0" metalness={0.95} roughness={0.2} />
        </mesh>
      </group>

      {/* Internal Yellow-Green Eerie Fridge Glow */}
      <pointLight ref={lightRef} position={[0, 1.4, 0]} color="#bbf599" distance={3.0} intensity={0.8} castShadow={false} />

      {/* Proximity Interaction Sensor */}
      <RigidBody
        type="fixed"
        position={[0, 1, 0.8]}
        sensor
        onIntersectionEnter={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            canInteractRef.current = true;
            const store = useGameStore.getState();
            if (!isOpenRef.current) {
              setInteractPrompt('Press E to Open Fridge');
            } else if (!store.hasFlashlight) {
              setInteractPrompt('Press E to Take Flashlight');
            } else {
              setInteractPrompt('Press E to Close Fridge');
            }
          }
        }}
        onIntersectionExit={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            canInteractRef.current = false;
            setInteractPrompt(null);
          }
        }}
      >
        <CuboidCollider args={[1.2, 1.2, 1.2]} />
      </RigidBody>
    </group>
  );
}

// ─── 2. Farmhouse Ceramic Apron Sink & Dirty Counter Cabinets ─────────────────
function FarmhouseSinkCounter({ 
  position, 
  woodTex, 
  tileTex 
}: { 
  position: [number, number, number]; 
  woodTex: THREE.Texture; 
  tileTex: THREE.Texture; 
}) {
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders="cuboid">
        {/* Weathered Wooden Base Cabinet */}
        <mesh position={[0, 0.42, 0]} receiveShadow>
          <boxGeometry args={[2.8, 0.84, 0.9]} />
          <meshStandardMaterial map={woodTex} roughness={0.85} color="#5a3d24" />
        </mesh>

        {/* 3 Distressed Cabinet Doors */}
        {[-0.9, 0, 0.9].map((x, idx) => (
          <group key={`cab-door-${idx}`} position={[x, 0.42, 0.46]}>
            <mesh>
              <boxGeometry args={[0.82, 0.76, 0.03]} />
              <meshStandardMaterial map={woodTex} roughness={0.9} color="#442a16" />
            </mesh>
            <mesh position={[idx % 2 === 0 ? 0.24 : -0.24, 0.05, 0.03]}>
              <sphereGeometry args={[0.025, 6, 6]} />
              <meshStandardMaterial color="#887755" metalness={0.9} roughness={0.4} />
            </mesh>
          </group>
        ))}

        {/* Stone Countertop */}
        <mesh position={[0, 0.86, 0]} receiveShadow>
          <boxGeometry args={[2.9, 0.08, 0.95]} />
          <meshStandardMaterial map={woodTex} roughness={0.7} color="#2b2622" />
        </mesh>

        {/* Deep Stained Ceramic Farmhouse Apron Sink Basin */}
        <group position={[0, 0.85, 0.05]}>
          <mesh receiveShadow>
            <boxGeometry args={[1.2, 0.44, 0.75]} />
            <meshStandardMaterial color="#ddd6c4" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[1.05, 0.35, 0.6]} />
            <meshStandardMaterial color="#948b78" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.04, 0.59]} />
            <meshStandardMaterial color="#2d3328" roughness={0.1} metalness={0.6} transparent opacity={0.88} />
          </mesh>
        </group>
      </RigidBody>

      {/* Brass Gooseneck Faucet */}
      <group position={[0, 1.15, -0.3]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.05, 0.12, 8]} />
          <meshStandardMaterial color="#7a6332" metalness={0.85} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.22, 0.1]} rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.32, 6]} />
          <meshStandardMaterial color="#7a6332" metalness={0.85} roughness={0.4} />
        </mesh>
      </group>

      {/* Plates Stack on Counter */}
      <group position={[-1.0, 0.95, 0.05]}>
        <mesh>
          <cylinderGeometry args={[0.18, 0.14, 0.1, 10]} />
          <meshStandardMaterial color="#cfc7b0" roughness={0.7} />
        </mesh>
      </group>

      {/* Cutting Board */}
      <group position={[1.0, 0.9, 0.0]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.4, 0.03, 0.55]} />
          <meshStandardMaterial map={woodTex} roughness={0.9} color="#6e4f35" />
        </mesh>
      </group>
    </group>
  );
}

// ─── 3. Vintage Heavy Enamel Gas Stove Range & Occult Sigil ───────────────────
function VintageHeavyStove({ 
  position, 
  stoveTex, 
  tileTex, 
  sigilTex 
}: { 
  position: [number, number, number]; 
  stoveTex: THREE.Texture; 
  tileTex: THREE.Texture; 
  sigilTex: THREE.Texture; 
}) {
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders="cuboid">
        {/* Backsplash Tile Wall with Glowing Occult Seal */}
        <mesh position={[0, 1.8, -0.42]} receiveShadow>
          <planeGeometry args={[1.6, 2.0]} />
          <meshStandardMaterial map={tileTex} roughness={0.7} />
        </mesh>
        {/* Glowing Red Occult Sigil Decal */}
        <mesh position={[0, 1.7, -0.4]}>
          <planeGeometry args={[1.2, 1.2]} />
          <meshStandardMaterial
            map={sigilTex}
            transparent
            opacity={0.92}
            emissive="#ff1100"
            emissiveIntensity={1.4}
            roughness={0.3}
          />
        </mesh>

        {/* Occult Red Ambient Light */}
        <pointLight position={[0, 1.7, 0]} color="#ff2200" intensity={6} distance={3.0} castShadow={false} />

        {/* Heavy Cast Iron Stove Body */}
        <mesh position={[0, 0.46, 0]} receiveShadow>
          <boxGeometry args={[1.3, 0.92, 0.85]} />
          <meshStandardMaterial map={stoveTex} roughness={0.65} metalness={0.3} color="#e5dfd0" />
        </mesh>

        {/* Oven Door */}
        <mesh position={[0, 0.4, 0.43]}>
          <boxGeometry args={[1.05, 0.55, 0.04]} />
          <meshStandardMaterial color="#1a1816" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.64, 0.48]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.9, 6]} />
          <meshStandardMaterial color="#aaa" metalness={0.95} roughness={0.2} />
        </mesh>

        {/* Cast Iron Cooktop Grates Surface */}
        <mesh position={[0, 0.93, 0]}>
          <boxGeometry args={[1.34, 0.04, 0.88]} />
          <meshStandardMaterial color="#1c1916" roughness={0.9} metalness={0.7} />
        </mesh>

        {/* Cooking Stockpot on Burner */}
        <group position={[-0.32, 1.05, -0.2]}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.15, 0.24, 10]} />
            <meshStandardMaterial color="#66686a" metalness={0.85} roughness={0.4} />
          </mesh>
        </group>
      </RigidBody>
    </group>
  );
}

// ─── 4. Wall Shelves, Cupboards & Hanging Utensil Rack ────────────────────────
function WallShelvesAndUtensils({ 
  position, 
  woodTex 
}: { 
  position: [number, number, number]; 
  woodTex: THREE.Texture; 
}) {
  return (
    <group position={position}>
      {/* Wall Hanging Wooden Cupboard */}
      <group position={[-1.2, 0, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[1.0, 0.9, 0.35]} />
          <meshStandardMaterial map={woodTex} roughness={0.9} color="#452c18" />
        </mesh>
        <mesh position={[0, 0, 0.18]}>
          <boxGeometry args={[0.9, 0.82, 0.02]} />
          <meshStandardMaterial color="#2d1c10" roughness={0.8} />
        </mesh>
      </group>

      {/* Open Wooden Shelves */}
      <group position={[0.8, 0, 0]}>
        {[-0.3, 0.25].map((sy, idx) => (
          <mesh key={`shelf-plank-${idx}`} position={[0, sy, 0]} receiveShadow>
            <boxGeometry args={[1.5, 0.04, 0.3]} />
            <meshStandardMaterial map={woodTex} roughness={0.9} color="#553a22" />
          </mesh>
        ))}

        {/* Combined Cans / Bottles */}
        {[-0.4, 0.0, 0.4].map((jx, i) => (
          <mesh key={`jar-${i}`} position={[jx, -0.17, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.12, 6]} />
            <meshStandardMaterial color={i === 0 ? '#445533' : '#774433'} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ─── 5. Rustic Dining Table & High-Backed Farmhouse Chairs ─────────────────────
function RusticDiningSet({ 
  position, 
  woodTex 
}: { 
  position: [number, number, number]; 
  woodTex: THREE.Texture; 
}) {
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders="cuboid">
        {/* Weathered Thick Wood Tabletop */}
        <mesh position={[0, 0.78, 0]} receiveShadow>
          <boxGeometry args={[2.5, 0.09, 1.4]} />
          <meshStandardMaterial map={woodTex} roughness={0.88} color="#482e18" />
        </mesh>
        {/* 4 Chunky Turned Table Legs */}
        {[-1.05, 1.05].map((x) =>
          [-0.55, 0.55].map((z) => (
            <mesh key={`t-leg-${x}-${z}`} position={[x, 0.35, z]}>
              <cylinderGeometry args={[0.055, 0.045, 0.7, 8]} />
              <meshStandardMaterial map={woodTex} roughness={0.9} color="#3a2312" />
            </mesh>
          ))
        )}
      </RigidBody>

      {/* Table Top Props */}
      <group position={[0, 0.83, 0]}>
        <mesh position={[-0.4, 0.2, 0.15]}>
          <cylinderGeometry args={[0.038, 0.045, 0.38, 8]} />
          <meshStandardMaterial color="#1b3320" roughness={0.25} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 0.05, 0.1]}>
          <cylinderGeometry args={[0.24, 0.12, 0.09, 8]} />
          <meshStandardMaterial color="#cfc2a8" roughness={0.6} />
        </mesh>
      </group>

      {/* Farmhouse Chairs */}
      <SingleFarmhouseChair position={[0, 0, -0.9]} rotationY={0} woodTex={woodTex} />
      <SingleFarmhouseChair position={[-0.5, 0, 0.9]} rotationY={Math.PI} woodTex={woodTex} />
    </group>
  );
}

function SingleFarmhouseChair({ 
  position, 
  rotationY, 
  woodTex 
}: { 
  position: [number, number, number]; 
  rotationY: number; 
  woodTex: THREE.Texture; 
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Seat Plank */}
      <mesh position={[0, 0.44, 0]} receiveShadow>
        <boxGeometry args={[0.5, 0.04, 0.48]} />
        <meshStandardMaterial map={woodTex} roughness={0.9} color="#442a16" />
      </mesh>
      {/* 4 Chair Legs */}
      {[-0.2, 0.2].map((x) =>
        [-0.19, 0.19].map((z) => (
          <mesh key={`c-leg-${x}-${z}`} position={[x, 0.22, z]}>
            <cylinderGeometry args={[0.022, 0.018, 0.44, 6]} />
            <meshStandardMaterial map={woodTex} roughness={0.9} color="#352010" />
          </mesh>
        ))
      )}
      {/* High Backrest */}
      <mesh position={[0, 0.76, -0.21]}>
        <boxGeometry args={[0.48, 0.6, 0.03]} />
        <meshStandardMaterial map={woodTex} color="#442a16" />
      </mesh>
    </group>
  );
}

// ─── 6. Large Frosted Industrial Window with Cold Exterior Fog Light ──────────
function FrostedIndustrialWindow({ 
  position, 
  windowTex 
}: { 
  position: [number, number, number]; 
  windowTex: THREE.Texture; 
}) {
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      {/* Outer Heavy Steel Frame */}
      <mesh receiveShadow>
        <boxGeometry args={[4.0, 2.2, 0.12]} />
        <meshStandardMaterial color="#1e1c1a" metalness={0.9} roughness={0.5} />
      </mesh>

      {/* Frosted Glass Panes */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[3.8, 2.0]} />
        <meshStandardMaterial
          map={windowTex}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.88}
          color="#dbebf0"
          emissive="#244456"
          emissiveIntensity={0.55}
        />
      </mesh>

      {/* Cold Fog Light */}
      <pointLight
        position={[0, 0.5, 1.2]}
        color="#82b8d4"
        intensity={14}
        distance={9}
        castShadow={false}
      />
    </group>
  );
}

// ─── 7. Overhead Green Enamel Pendant Lamp with Atmospheric Flicker ───────────
function GreenEnamelPendantLamp({ 
  position 
}: { 
  position: [number, number, number]; 
  }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const lampGroupRef = useRef<THREE.Group>(null);
  const bulbMeshRef = useRef<THREE.Mesh>(null);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const time = state.clock.elapsedTime;

    if (lampGroupRef.current) {
      lampGroupRef.current.rotation.z = Math.sin(time * 1.5) * 0.02;
    }

    if (lightRef.current) {
      const noise = Math.sin(time * 2.8) * 0.2 + Math.sin(time * 8.3) * 0.12;
      const targetInt = 18 * Math.max(0.2, 1.0 + noise);
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, targetInt, dt * 10);
      if (bulbMeshRef.current) {
        const mat = bulbMeshRef.current.material as THREE.MeshStandardMaterial;
        if (mat) mat.emissiveIntensity = THREE.MathUtils.clamp(lightRef.current.intensity / 18, 0.3, 1.8);
      }
    }
  });

  return (
    <group position={position} ref={lampGroupRef}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 1.4, 6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.1, 8]} />
          <meshStandardMaterial color="#3d4a36" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh>
          <coneGeometry args={[0.32, 0.22, 12, 1, true]} />
          <meshStandardMaterial color="#2d5236" roughness={0.3} metalness={0.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={bulbMeshRef} position={[0, -0.04, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#fffbe6" emissive="#fffbe6" emissiveIntensity={1.2} />
        </mesh>
      </group>

      <pointLight
        ref={lightRef}
        position={[0, -0.15, 0]}
        color="#e6f5c8"
        intensity={18}
        distance={9.0}
        castShadow={false}
      />
    </group>
  );
}

// ─── 7B. Creepy Overhead Industrial Cage Lamp over Retro Refrigerator ─────────
function CreepyFridgeCornerLamp({ 
  position 
}: { 
  position: [number, number, number]; 
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const fixtureGroupRef = useRef<THREE.Group>(null);
  const bulbMeshRef = useRef<THREE.Mesh>(null);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const time = state.clock.elapsedTime;

    if (fixtureGroupRef.current) {
      fixtureGroupRef.current.rotation.z = Math.sin(time * 1.8 + 1.2) * 0.025;
    }

    if (lightRef.current) {
      const hum = Math.sin(time * 3.2) * 0.2 + Math.sin(time * 9.7) * 0.15;
      const targetInt = 20 * Math.max(0.1, 1.0 + hum);
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, targetInt, dt * 12);

      if (bulbMeshRef.current) {
        const mat = bulbMeshRef.current.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.emissiveIntensity = THREE.MathUtils.clamp((lightRef.current.intensity / 20) * 1.8, 0.2, 2.2);
        }
      }
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.05, 8]} />
        <meshStandardMaterial color="#1a1816" metalness={0.9} roughness={0.4} />
      </mesh>

      <group ref={fixtureGroupRef} position={[0, 1.1, 0]}>
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 1.1, 6]} />
          <meshStandardMaterial color="#111111" />
        </mesh>

        <group position={[0, -1.1, 0]}>
          <mesh position={[0, 0.06, 0]}>
            <coneGeometry args={[0.26, 0.14, 10, 1, true]} />
            <meshStandardMaterial color="#263a2f" metalness={0.7} roughness={0.4} side={THREE.DoubleSide} />
          </mesh>

          <mesh ref={bulbMeshRef} position={[0, -0.04, 0]}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial
              color="#e6fff2"
              emissive="#7ef2be"
              emissiveIntensity={1.8}
              roughness={0.2}
              transparent
              opacity={0.92}
            />
          </mesh>

          <pointLight
            ref={lightRef}
            position={[0, -0.1, 0]}
            color="#a8ffd4"
            intensity={20}
            distance={8.5}
            castShadow={false}
          />
        </group>
      </group>
    </group>
  );
}

// ─── 8. Vintage Wall Accents ───────────────────────────────────────────────────
function VintageWallAccents({ 
  position 
}: { 
  position: [number, number, number]; 
}) {
  return (
    <group position={position}>
      {/* Wall Clock */}
      <group position={[-1.2, 2.7, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.24, 0.06, 12]} />
          <meshStandardMaterial color="#e0d6be" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <circleGeometry args={[0.18, 12]} />
          <meshStandardMaterial color="#f0eae0" roughness={0.9} />
        </mesh>
      </group>

      {/* Cast Iron Radiator */}
      <group position={[1.8, 0.45, 0]}>
        <mesh>
          <boxGeometry args={[1.2, 0.8, 0.22]} />
          <meshStandardMaterial color="#333833" roughness={0.8} metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

// ─── 9. Rustic Timber Ceiling Beams ───────────────────────────────────────────
function TimberCeilingBeams({ 
  woodTex 
}: { 
  woodTex: THREE.Texture; 
}) {
  return (
    <group position={[0, 3.85, 0]}>
      {[-5.0, 0, 5.0].map((z, idx) => (
        <mesh key={`beam-${idx}`} position={[0, 0, z]} receiveShadow>
          <boxGeometry args={[10.0, 0.28, 0.35]} />
          <meshStandardMaterial map={woodTex} roughness={0.9} color="#422814" />
        </mesh>
      ))}
      <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10.0, 15.0]} />
        <meshStandardMaterial map={woodTex} roughness={0.95} color="#352010" />
      </mesh>
    </group>
  );
}

// ─── 10. Complete 4-Wall Horror Cladding ───────────────────────────────────────
function FourKitchenWallsCladding({ 
  grungeWallTex 
}: { 
  grungeWallTex: THREE.Texture; 
}) {
  return (
    <group>
      {/* North Wall */}
      <mesh position={[0, 2.25, -7.42]} receiveShadow>
        <planeGeometry args={[10.0, 4.5]} />
        <meshStandardMaterial map={grungeWallTex} roughness={0.9} />
      </mesh>

      {/* West Wall */}
      <mesh position={[-4.92, 2.25, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[15.0, 4.5]} />
        <meshStandardMaterial map={grungeWallTex} roughness={0.9} />
      </mesh>

      {/* South Wall */}
      <mesh position={[0, 2.25, 7.42]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[10.0, 4.5]} />
        <meshStandardMaterial map={grungeWallTex} roughness={0.9} />
      </mesh>

      {/* East Wall */}
      <mesh position={[4.92, 2.25, -1.85]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[11.3, 4.5]} />
        <meshStandardMaterial map={grungeWallTex} roughness={0.9} />
      </mesh>
      <mesh position={[4.92, 2.25, 6.85]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[1.3, 4.5]} />
        <meshStandardMaterial map={grungeWallTex} roughness={0.9} />
      </mesh>
      <mesh position={[4.92, 3.75, 5.0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[2.4, 1.5]} />
        <meshStandardMaterial map={grungeWallTex} roughness={0.9} />
      </mesh>
    </group>
  );
}

// ─── 11. Master Horror Kitchen Component ──────────────────────────────────────
export default function HorrorKitchen({ 
  position 
}: { 
  position: [number, number, number]; 
}) {
  const [
    floorTileTex,
    grungeWallTex,
    fridgeTex,
    woodTex,
    stoveTex,
    windowTex,
    sigilTex,
    backsplashTex,
  ] = useTexture([
    '/textures/vintage_horror_tile.jpg',
    '/textures/grunge_concrete_wall.jpg',
    '/textures/rusty_mint_fridge.jpg',
    '/textures/rustic_wood_planks.jpg',
    '/textures/dirty_enamel_stove.jpg',
    '/textures/frosted_horror_window.jpg',
    '/textures/occult_sigil_glow.jpg',
    '/textures/dirty_wall_tiles.jpg',
  ]);

  useMemo(() => {
    [floorTileTex, grungeWallTex, woodTex, backsplashTex].forEach((tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
    });
    floorTileTex.repeat.set(6, 9);
    grungeWallTex.repeat.set(4, 2);
    woodTex.repeat.set(4, 2);
    backsplashTex.repeat.set(4, 2);
  }, [floorTileTex, grungeWallTex, woodTex, backsplashTex]);

  return (
    <group position={position}>
      {/* Floor */}
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10.0, 15.0]} />
        <meshStandardMaterial map={floorTileTex} roughness={0.65} metalness={0.1} />
      </mesh>

      {/* Cladding */}
      <FourKitchenWallsCladding grungeWallTex={grungeWallTex} />

      {/* Ceiling */}
      <TimberCeilingBeams woodTex={woodTex} />

      {/* Refrigerator */}
      <VintageRetroFridge
        position={[-3.8, 0, -5.8]}
        fridgeTex={fridgeTex}
        woodTex={woodTex}
      />

      {/* Lamp over fridge */}
      <CreepyFridgeCornerLamp position={[-3.8, 2.7, -5.2]} />

      {/* Stove */}
      <VintageHeavyStove
        position={[-0.5, 0, -6.9]}
        stoveTex={stoveTex}
        tileTex={backsplashTex}
        sigilTex={sigilTex}
      />

      {/* Shelves */}
      <WallShelvesAndUtensils
        position={[-0.5, 2.2, -6.9]}
        woodTex={woodTex}
      />

      {/* Sink */}
      <FarmhouseSinkCounter
        position={[-4.0, 0, 0.0]}
        woodTex={woodTex}
        tileTex={backsplashTex}
      />

      {/* Window */}
      <FrostedIndustrialWindow
        position={[-4.88, 2.2, 0.0]}
        windowTex={windowTex}
      />

      {/* Dining Set */}
      <RusticDiningSet
        position={[1.2, 0, -1.0]}
        woodTex={woodTex}
      />

      {/* Pendant Lamp */}
      <GreenEnamelPendantLamp position={[1.2, 2.6, -1.0]} />

      {/* Wall Accents */}
      <VintageWallAccents position={[-1.0, 0, 6.9]} />

      {/* Atmospheric Creepy Ambient Fill Lights */}
      <pointLight position={[-3.0, 2.2, -3.0]} color="#488a6c" intensity={6} distance={8.0} castShadow={false} />
      <pointLight position={[2.0, 2.2, 1.5]} color="#6e5635" intensity={5} distance={8.0} castShadow={false} />
    </group>
  );
}

