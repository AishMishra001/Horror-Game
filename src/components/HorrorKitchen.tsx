'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';

// ─── Sound Helper ─────────────────────────────────────────────────────────────
function playKitchenSound(type: 'fridge' | 'clink' | 'switch') {
  if (typeof window === 'undefined') return;
  try {
    const audio = new Audio('/stairs and doors.mp3');
    audio.volume = type === 'fridge' ? 0.4 : 0.25;
    audio.playbackRate = type === 'fridge' ? 1.4 : 1.8;
    audio.play().catch(() => {});
  } catch {}
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
  const { setInteractPrompt } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const canInteractRef = useRef(false);
  const doorGroupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  isOpenRef.current = isOpen;

  useFrame((_, delta) => {
    if (doorGroupRef.current) {
      const targetRot = isOpen ? Math.PI / 1.75 : 0;
      doorGroupRef.current.rotation.y += (targetRot - doorGroupRef.current.rotation.y) * delta * 4.5;
    }
    if (lightRef.current) {
      const targetIntensity = isOpen ? 4.5 : 0;
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, targetIntensity, delta * 8);
    }
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && canInteractRef.current) {
        const next = !isOpenRef.current;
        setIsOpen(next);
        isOpenRef.current = next;
        setInteractPrompt(next ? 'Press E to Close Fridge' : 'Press E to Open Fridge');
        playKitchenSound('fridge');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setInteractPrompt]);

  return (
    <group position={position}>
      {/* Fridge Main Body */}
      <RigidBody type="fixed" colliders="cuboid">
        {/* Back Wall */}
        <mesh position={[0, 1.2, -0.45]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 2.3, 0.1]} />
          <meshStandardMaterial map={fridgeTex} roughness={0.7} metalness={0.4} color="#a0c8b0" />
        </mesh>
        {/* Left Outer Wall */}
        <mesh position={[-0.55, 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 2.3, 0.8]} />
          <meshStandardMaterial map={fridgeTex} roughness={0.7} metalness={0.4} color="#a0c8b0" />
        </mesh>
        {/* Right Outer Wall */}
        <mesh position={[0.55, 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 2.3, 0.8]} />
          <meshStandardMaterial map={fridgeTex} roughness={0.7} metalness={0.4} color="#a0c8b0" />
        </mesh>
        {/* Curved Top Roof */}
        <mesh position={[0, 2.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.1, 0.8]} />
          <meshStandardMaterial map={fridgeTex} roughness={0.7} metalness={0.4} color="#a0c8b0" />
        </mesh>
        {/* Rounded Top Cap Cylinder */}
        <mesh position={[0, 2.38, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.15, 16]} />
          <meshStandardMaterial map={fridgeTex} roughness={0.7} color="#a0c8b0" />
        </mesh>
        {/* Bottom Base */}
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.2, 0.8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
        {/* 4 Fridge Legs */}
        {[-0.5, 0.5].map((x) =>
          [-0.3, 0.3].map((z) => (
            <mesh key={`leg-${x}-${z}`} position={[x, 0.04, z]} castShadow>
              <cylinderGeometry args={[0.04, 0.05, 0.08, 10]} />
              <meshStandardMaterial color="#111" metalness={0.8} />
            </mesh>
          ))
        )}

        {/* --- Interior Liner & Shelves --- */}
        {/* Interior Off-White Enamel Liner */}
        <mesh position={[0, 1.2, -0.38]}>
          <planeGeometry args={[1.0, 2.1]} />
          <meshStandardMaterial color="#d8dfd5" roughness={0.5} />
        </mesh>
        {/* Freezer Box at Top */}
        <group position={[0, 1.85, -0.1]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.95, 0.55, 0.6]} />
            <meshStandardMaterial color="#bcc8bf" roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.31]}>
            <boxGeometry args={[0.9, 0.5, 0.02]} />
            <meshStandardMaterial color="#8ca090" roughness={0.7} />
          </mesh>
          {/* Frost & rust stains on freezer door */}
          <mesh position={[0.2, 0, 0.32]}>
            <circleGeometry args={[0.08, 8]} />
            <meshStandardMaterial color="#4a2511" roughness={0.9} />
          </mesh>
        </group>

        {/* Wire Rack Shelves */}
        {[0.5, 0.9, 1.3].map((y, idx) => (
          <group key={`wire-shelf-${idx}`} position={[0, y, -0.05]}>
            <mesh castShadow>
              <boxGeometry args={[0.96, 0.02, 0.65]} />
              <meshStandardMaterial color="#888888" wireframe metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* --- Rotting Food, Milk Cartons, Bottles & Cans inside --- */}
        {/* Milk cartons */}
        <mesh position={[-0.32, 0.65, -0.1]} castShadow>
          <boxGeometry args={[0.15, 0.28, 0.15]} />
          <meshStandardMaterial color="#c0c8b0" roughness={0.9} />
        </mesh>
        <mesh position={[-0.15, 0.65, -0.1]} castShadow>
          <boxGeometry args={[0.15, 0.28, 0.15]} />
          <meshStandardMaterial color="#a0b8a0" roughness={0.9} />
        </mesh>
        {/* Yellow/rusty Canned Goods */}
        {[0.12, 0.28, 0.38].map((x, i) => (
          <mesh key={`can-${i}`} position={[x, 0.6, -0.1 + (i % 2) * 0.1]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.16, 12]} />
            <meshStandardMaterial color={i === 1 ? '#b8860b' : '#8b4513'} metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
        {/* Green glass bottles on upper shelf */}
        {[-0.3, -0.15, 0.05].map((x, i) => (
          <mesh key={`bottle-${i}`} position={[x, 1.05, -0.1]} castShadow>
            <cylinderGeometry args={[0.04, 0.05, 0.26, 10]} />
            <meshStandardMaterial color="#1a3d24" transparent opacity={0.85} roughness={0.2} metalness={0.1} />
          </mesh>
        ))}
        {/* Rotting jar/mystery bowl */}
        <mesh position={[0.28, 1.0, -0.1]} castShadow>
          <cylinderGeometry args={[0.09, 0.07, 0.14, 10]} />
          <meshStandardMaterial color="#2c3a1c" roughness={0.9} />
        </mesh>
        {/* Rotting meat lump on bottom */}
        <mesh position={[0, 0.3, -0.1]} castShadow>
          <dodecahedronGeometry args={[0.14]} />
          <meshStandardMaterial color="#3d0a0a" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* --- Main Rounded Hinged Door --- */}
      <group position={[0.6, 1.25, 0.4]} ref={doorGroupRef}>
        {/* Door Main Slab */}
        <mesh position={[-0.6, 0, 0.05]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 2.25, 0.1]} />
          <meshStandardMaterial map={fridgeTex} roughness={0.65} metalness={0.35} color="#a0c8b0" />
        </mesh>
        {/* Rounded Outer Door Edge */}
        <mesh position={[-1.18, 0, 0.05]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 2.2, 12]} />
          <meshStandardMaterial map={fridgeTex} color="#a0c8b0" roughness={0.6} />
        </mesh>
        <mesh position={[-0.6, 1.1, 0.05]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.15, 12]} />
          <meshStandardMaterial map={fridgeTex} color="#a0c8b0" roughness={0.6} />
        </mesh>

        {/* Vintage Chrome Heavy Latch Handle */}
        <group position={[-1.05, 0.1, 0.14]}>
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.35, 0.05]} />
            <meshStandardMaterial color="#b0b0b0" metalness={0.95} roughness={0.2} />
          </mesh>
          <mesh position={[0.04, 0, 0.02]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.28, 8]} />
            <meshStandardMaterial color="#909090" metalness={0.95} roughness={0.2} />
          </mesh>
        </group>

        {/* Door Interior Shelves (Holding Condiment Bottles) */}
        <mesh position={[-0.6, -0.4, -0.04]}>
          <boxGeometry args={[0.9, 0.15, 0.12]} />
          <meshStandardMaterial color="#bcc8bf" roughness={0.8} />
        </mesh>
        <mesh position={[-0.4, -0.3, -0.04]}>
          <cylinderGeometry args={[0.035, 0.04, 0.18, 8]} />
          <meshStandardMaterial color="#554422" roughness={0.5} />
        </mesh>
      </group>

      {/* Internal Yellow-Green Eerie Fridge Glow */}
      <pointLight ref={lightRef} position={[0, 1.4, 0]} color="#bbf599" distance={3.5} intensity={0} />

      {/* Proximity Interaction Sensor */}
      <RigidBody
        type="fixed"
        position={[0, 1, 0.8]}
        sensor
        onIntersectionEnter={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            canInteractRef.current = true;
            setInteractPrompt(isOpenRef.current ? 'Press E to Close Fridge' : 'Press E to Open Fridge');
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
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <group>
        {/* Lower Cabinet Base (Dark weathered wood planks) */}
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.84, 0.9]} />
          <meshStandardMaterial map={woodTex} roughness={0.9} color="#4a3222" />
        </mesh>
        {/* Cabinet Slatted Doors with Dark Panel Lines */}
        {[-1.1, -0.4, 0.4, 1.1].map((x, idx) => (
          <group key={`cab-door-${idx}`} position={[x, 0.4, 0.46]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.65, 0.72, 0.04]} />
              <meshStandardMaterial map={woodTex} roughness={0.95} color="#382417" />
            </mesh>
            {/* Brass Pull Knob */}
            <mesh position={[idx % 2 === 0 ? 0.24 : -0.24, 0.05, 0.03]} castShadow>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshStandardMaterial color="#8c7040" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* Counter Top Slab (Dark distressed soapstone) */}
        <mesh position={[0, 0.86, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.3, 0.08, 0.95]} />
          <meshStandardMaterial color="#1e1e1e" roughness={0.8} metalness={0.2} />
        </mesh>

        {/* Backsplash Tiled Wall strip behind counter */}
        <mesh position={[0, 1.35, -0.47]} receiveShadow>
          <planeGeometry args={[3.3, 0.9]} />
          <meshStandardMaterial map={tileTex} roughness={0.7} />
        </mesh>

        {/* Thick Farmhouse Porcelain Apron-Front Sink Basin */}
        <group position={[-0.4, 0.88, 0.05]}>
          {/* Sink Rim / Outer Box */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.3, 0.28, 0.75]} />
            <meshStandardMaterial color="#c8cfc2" roughness={0.4} />
          </mesh>
          {/* Sink Inner Cavity (Dark dirty stained water inside) */}
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[1.14, 0.18, 0.6]} />
            <meshStandardMaterial color="#1f261c" roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Grimy Stagnant Water Surface */}
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.12, 0.58]} />
            <meshStandardMaterial color="#152012" roughness={0.1} transparent opacity={0.9} />
          </mesh>
          {/* Brass Drain Stopper */}
          <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.04, 12]} />
            <meshStandardMaterial color="#4a3e1a" metalness={0.8} roughness={0.4} />
          </mesh>
        </group>

        {/* Vintage Twin Brass Cross-Handle Gooseneck Faucet */}
        <group position={[-0.4, 1.1, -0.3]}>
          {/* Base plate */}
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.03, 0.08]} />
            <meshStandardMaterial color="#6a542b" metalness={0.85} roughness={0.3} />
          </mesh>
          {/* Curved Gooseneck Spout */}
          <mesh position={[0, 0.16, 0.08]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.32, 10]} />
            <meshStandardMaterial color="#6a542b" metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.32, 0.14]} rotation={[Math.PI / 3, 0, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.14, 10]} />
            <meshStandardMaterial color="#6a542b" metalness={0.85} roughness={0.3} />
          </mesh>
          {/* Left / Right Cross Valves */}
          {[-0.1, 0.1].map((x, i) => (
            <group key={`valve-${i}`} position={[x, 0.06, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.06, 8]} />
                <meshStandardMaterial color="#554220" metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.03, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
                <boxGeometry args={[0.06, 0.015, 0.015]} />
                <meshStandardMaterial color="#7a6230" metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.03, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
                <boxGeometry args={[0.06, 0.015, 0.015]} />
                <meshStandardMaterial color="#7a6230" metalness={0.9} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Stack of Chipped Ceramic Plates on Right Side */}
        <group position={[0.85, 0.95, 0]}>
          {[0, 0.03, 0.06, 0.09, 0.12].map((y, i) => (
            <mesh key={`plate-${i}`} position={[0, y, 0]} castShadow>
              <cylinderGeometry args={[0.16, 0.12, 0.02, 16]} />
              <meshStandardMaterial color="#dfdfd0" roughness={0.5} />
            </mesh>
          ))}
          {/* Stained Coffee Mug */}
          <mesh position={[0.25, 0.04, -0.1]} castShadow>
            <cylinderGeometry args={[0.06, 0.055, 0.12, 12]} />
            <meshStandardMaterial color="#8b4513" roughness={0.7} />
          </mesh>
        </group>

        {/* Distressed Wooden Cutting Board & Knife */}
        <group position={[-1.2, 0.92, 0.1]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.4, 0.03, 0.3]} />
            <meshStandardMaterial map={woodTex} roughness={0.9} color="#5a3d28" />
          </mesh>
          {/* Small paring knife */}
          <mesh position={[0.05, 0.025, 0]} rotation={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.22, 0.01, 0.03]} />
            <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>
    </RigidBody>
  );
}

// ─── 3. Vintage Heavy Enamel Gas Stove & Oven Range ────────────────────────────
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
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <group>
        {/* Main Stove Body */}
        <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.92, 0.9]} />
          <meshStandardMaterial map={stoveTex} roughness={0.75} color="#e0dacf" />
        </mesh>

        {/* Dark Oven Door with Dirty Glass Window */}
        <group position={[0, 0.38, 0.46]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.35, 0.58, 0.04]} />
            <meshStandardMaterial map={stoveTex} roughness={0.8} color="#c8c0b0" />
          </mesh>
          {/* Glass window */}
          <mesh position={[0, 0.02, 0.02]}>
            <planeGeometry args={[0.8, 0.32]} />
            <meshStandardMaterial color="#1a1510" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Horizontal Oven Handle */}
          <mesh position={[0, 0.22, 0.06]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.9, 10]} />
            <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.3} />
          </mesh>
        </group>

        {/* Lower Storage Drawer */}
        <mesh position={[0, 0.06, 0.46]}>
          <boxGeometry args={[1.35, 0.14, 0.03]} />
          <meshStandardMaterial color="#7a7060" roughness={0.9} />
        </mesh>

        {/* Top Control Panel with Knobs */}
        <group position={[0, 0.78, 0.47]}>
          <mesh>
            <boxGeometry args={[1.35, 0.12, 0.02]} />
            <meshStandardMaterial color="#333333" roughness={0.8} />
          </mesh>
          {/* 4 Burner Dial Knobs */}
          {[-0.45, -0.15, 0.15, 0.45].map((x, i) => (
            <mesh key={`knob-${i}`} position={[x, 0, 0.02]} rotation={[Math.PI / 2, 0, i * 0.8]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.03, 10]} />
              <meshStandardMaterial color="#111" metalness={0.8} />
            </mesh>
          ))}
        </group>

        {/* Top Cast-Iron Burner Grates */}
        <mesh position={[0, 0.93, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.46, 0.04, 0.86]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.9} metalness={0.8} />
        </mesh>
        {/* 4 Heavy Burners */}
        {[-0.38, 0.38].map((x) =>
          [-0.22, 0.22].map((z, j) => (
            <group key={`stove-burner-${x}-${z}`} position={[x, 0.96, z]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.13, 0.02, 8, 16]} />
                <meshStandardMaterial color="#080808" metalness={0.9} roughness={0.4} />
              </mesh>
              {/* Soft ember glow under one burner */}
              {x > 0 && z > 0 && (
                <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[0.11, 16]} />
                  <meshStandardMaterial color="#ff3300" emissive="#ff3300" emissiveIntensity={0.6} />
                </mesh>
              )}
            </group>
          ))
        )}

        {/* Heavy Cooking Pot with Lid on Front-Left Burner */}
        <group position={[-0.38, 1.1, 0.22]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.17, 0.24, 16]} />
            <meshStandardMaterial color="#282828" metalness={0.7} roughness={0.5} />
          </mesh>
          {/* Pot Handles */}
          {[-0.2, 0.2].map((hx) => (
            <mesh key={`p-handle-${hx}`} position={[hx, 0.06, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <torusGeometry args={[0.04, 0.012, 6, 12]} />
              <meshStandardMaterial color="#111" metalness={0.9} />
            </mesh>
          ))}
          {/* Lid with knob */}
          <mesh position={[0, 0.13, 0]} castShadow>
            <cylinderGeometry args={[0.19, 0.19, 0.02, 16]} />
            <meshStandardMaterial color="#333" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.16, 0]} castShadow>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </group>

        {/* Cast Iron Frying Pan on Front-Right Burner */}
        <group position={[0.38, 0.98, 0.22]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.16, 0.14, 0.04, 16]} />
            <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.6} />
          </mesh>
          {/* Handle */}
          <mesh position={[0.22, 0.02, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.22, 8]} />
            <meshStandardMaterial color="#111111" metalness={0.9} />
          </mesh>
        </group>

        {/* Back Wall Occult Sigil Glowing Decal & Backsplash (From Photo 3) */}
        <group position={[0, 1.8, -0.47]}>
          <mesh receiveShadow>
            <planeGeometry args={[1.5, 1.4]} />
            <meshStandardMaterial map={tileTex} roughness={0.8} />
          </mesh>
          {/* Glowing Occult Sigil */}
          <mesh position={[0, 0.1, 0.01]}>
            <planeGeometry args={[0.9, 0.9]} />
            <meshStandardMaterial
              map={sigilTex}
              transparent
              opacity={0.85}
              emissive="#ff1100"
              emissiveIntensity={0.8}
            />
          </mesh>
          {/* Ominous red pointlight */}
          <pointLight position={[0, 0.1, 0.3]} distance={3} intensity={4} color="#ff2200" />
        </group>
      </group>
    </RigidBody>
  );
}

// ─── 4. Wall Shelves, Wooden Cupboards & Hanging Utensil Rack ─────────────────
function WallShelvesAndUtensils({ 
  position, 
  woodTex 
}: { 
  position: [number, number, number]; 
  woodTex: THREE.Texture; 
}) {
  return (
    <group position={position}>
      {/* ── Upper Wooden Hanging Cupboard with decorative panel doors (Photo 1 & 3) ── */}
      <group position={[1.5, 0.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.6, 1.1, 0.45]} />
          <meshStandardMaterial map={woodTex} roughness={0.9} color="#3c2617" />
        </mesh>
        {/* Double Doors with wire mesh / recessed frame */}
        {[-0.38, 0.38].map((dx, idx) => (
          <group key={`w-cupboard-${idx}`} position={[dx, 0, 0.24]}>
            <mesh castShadow>
              <boxGeometry args={[0.7, 0.98, 0.03]} />
              <meshStandardMaterial map={woodTex} roughness={0.95} color="#2b1a0e" />
            </mesh>
            {/* Recessed patterned inset */}
            <mesh position={[0, 0, 0.02]}>
              <planeGeometry args={[0.55, 0.8]} />
              <meshStandardMaterial color="#1a1109" roughness={0.9} wireframe />
            </mesh>
            {/* Small knob */}
            <mesh position={[idx === 0 ? 0.28 : -0.28, 0, 0.03]} castShadow>
              <sphereGeometry args={[0.02, 6, 6]} />
              <meshStandardMaterial color="#887755" metalness={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── Open Rustic Wall Shelves with Jars, Bowls & Bottles ── */}
      <group position={[-1.2, 0.4, 0]}>
        {/* 2 Long Wood Plank Shelves */}
        {[0, 0.5].map((sy, i) => (
          <group key={`shelf-${i}`} position={[0, sy, 0]}>
            {/* Shelf Plank */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.2, 0.05, 0.35]} />
              <meshStandardMaterial map={woodTex} roughness={0.9} color="#4a301b" />
            </mesh>
            {/* Metal L-Brackets */}
            {[-0.8, 0.8].map((bx) => (
              <mesh key={`brk-${bx}`} position={[bx, -0.08, -0.1]} castShadow>
                <boxGeometry args={[0.04, 0.16, 0.16]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Shelf 1 Items: Glass bottles, jars, ceramic cups */}
        {[-0.8, -0.6, -0.4, -0.2].map((x, i) => (
          <mesh key={`jar-${i}`} position={[x, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.15, 10]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#4a6b50' : '#8b5a2b'}
              transparent
              opacity={0.8}
              roughness={0.3}
            />
          </mesh>
        ))}
        {[0.2, 0.4, 0.6, 0.8].map((x, i) => (
          <mesh key={`cup-${i}`} position={[x, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.04, 0.1, 10]} />
            <meshStandardMaterial color="#d8d2c2" roughness={0.7} />
          </mesh>
        ))}

        {/* Shelf 2 Items: Canned goods & stacked plates */}
        {[-0.7, -0.5, -0.3, -0.1, 0.1].map((x, i) => (
          <mesh key={`tin-${i}`} position={[x, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 0.14, 10]} />
            <meshStandardMaterial color="#554433" metalness={0.7} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* ── Metal Hanging Utensil Rack (Butcher Cleaver, Chef Knife, Ladle) ── */}
      <group position={[-1.2, -0.35, 0.1]}>
        {/* Metal Bar */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 2.0, 8]} />
          <meshStandardMaterial color="#222" metalness={0.9} />
        </mesh>
        {/* Wall mounting pegs */}
        {[-0.9, 0.9].map((px) => (
          <mesh key={`peg-${px}`} position={[px, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
            <meshStandardMaterial color="#111" metalness={0.9} />
          </mesh>
        ))}

        {/* Butcher Cleaver */}
        <group position={[-0.6, -0.22, 0]}>
          {/* Blade */}
          <mesh position={[0, -0.08, 0]} castShadow>
            <boxGeometry args={[0.12, 0.22, 0.01]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.95} roughness={0.3} />
          </mesh>
          {/* Wooden Handle */}
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[0.035, 0.12, 0.02]} />
            <meshStandardMaterial color="#3a1e0b" roughness={0.8} />
          </mesh>
        </group>

        {/* Large Chef Knife */}
        <group position={[-0.25, -0.24, 0]}>
          <mesh position={[0, -0.1, 0]} castShadow>
            <boxGeometry args={[0.06, 0.26, 0.01]} />
            <meshStandardMaterial color="#bbbbbb" metalness={0.95} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[0.03, 0.1, 0.02]} />
            <meshStandardMaterial color="#2a1205" roughness={0.8} />
          </mesh>
        </group>

        {/* Soup Ladle */}
        <group position={[0.15, -0.22, 0]}>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.28, 6]} />
            <meshStandardMaterial color="#333" metalness={0.9} />
          </mesh>
          <mesh position={[0, -0.16, 0.03]} rotation={[Math.PI / 4, 0, 0]} castShadow>
            <sphereGeometry args={[0.045, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#333" metalness={0.9} />
          </mesh>
        </group>

        {/* Slotted Spatula */}
        <group position={[0.55, -0.22, 0]}>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.26, 6]} />
            <meshStandardMaterial color="#444" metalness={0.9} />
          </mesh>
          <mesh position={[0, -0.15, 0]} castShadow>
            <boxGeometry args={[0.07, 0.12, 0.008]} />
            <meshStandardMaterial color="#444" metalness={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ─── 5. Rustic Wooden Dining Table & Chairs ───────────────────────────────────
function RusticDiningSet({ 
  position, 
  woodTex 
}: { 
  position: [number, number, number]; 
  woodTex: THREE.Texture; 
}) {
  return (
    <group position={position}>
      {/* Heavy Plank Table */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.42, 0]}>
        {/* Table Top Planks */}
        <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.08, 1.4]} />
          <meshStandardMaterial map={woodTex} roughness={0.85} color="#5a3820" />
        </mesh>
        {/* Table Apron Frame */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.1, 1.2]} />
          <meshStandardMaterial map={woodTex} roughness={0.9} color="#452714" />
        </mesh>
        {/* Chunky Square Legs */}
        {[-1.0, 1.0].map((x) =>
          [-0.55, 0.55].map((z) => (
            <mesh key={`t-leg-${x}-${z}`} position={[x, 0, z]} castShadow receiveShadow>
              <boxGeometry args={[0.12, 0.76, 0.12]} />
              <meshStandardMaterial map={woodTex} roughness={0.9} color="#3c200e" />
            </mesh>
          ))
        )}

        {/* ── Table Top Props (Bottles, Rotting Fruit Bowl, Cups) ── */}
        {/* Standing Green Wine Bottle */}
        <group position={[-0.3, 0.56, 0.1]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.045, 0.05, 0.28, 12]} />
            <meshStandardMaterial color="#1a381e" transparent opacity={0.88} roughness={0.2} metalness={0.1} />
          </mesh>
          <mesh position={[0, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.025, 0.1, 10]} />
            <meshStandardMaterial color="#1a381e" transparent opacity={0.88} />
          </mesh>
        </group>

        {/* Knocked-Over Fallen Bottle with Stain */}
        <group position={[0.4, 0.46, -0.2]} rotation={[0, 0.4, Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.045, 0.26, 10]} />
            <meshStandardMaterial color="#2d4a22" transparent opacity={0.85} roughness={0.25} />
          </mesh>
        </group>
        {/* Dark Wine / Liquid Stain */}
        <mesh position={[0.45, 0.43, -0.1]} rotation={[-Math.PI / 2, 0, 0.3]}>
          <planeGeometry args={[0.4, 0.25]} />
          <meshStandardMaterial color="#1c0707" transparent opacity={0.7} />
        </mesh>

        {/* Large Ceramic Fruit/Serving Bowl */}
        <group position={[0.1, 0.48, 0.1]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.12, 0.12, 16]} />
            <meshStandardMaterial color="#4a4235" roughness={0.8} />
          </mesh>
          {/* Rotting items / fruit inside bowl */}
          <mesh position={[-0.05, 0.06, 0]} castShadow>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#354020" roughness={0.9} />
          </mesh>
          <mesh position={[0.06, 0.06, 0.04]} castShadow>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color="#4a2818" roughness={0.9} />
          </mesh>
        </group>
      </RigidBody>

      {/* ── Farmhouse Wooden Chairs ── */}
      {/* Chair 1 (Front, slightly angled) */}
      <group position={[-0.3, 0, 1.0]} rotation={[0, -0.1, 0]}>
        {/* Seat */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.48, 0.05, 0.48]} />
          <meshStandardMaterial map={woodTex} roughness={0.9} color="#4a2c16" />
        </mesh>
        {/* Legs */}
        {[-0.2, 0.2].map((x) =>
          [-0.2, 0.2].map((z) => (
            <mesh key={`c1-leg-${x}-${z}`} position={[x, 0.22, z]} castShadow>
              <boxGeometry args={[0.05, 0.44, 0.05]} />
              <meshStandardMaterial map={woodTex} roughness={0.9} color="#381f0d" />
            </mesh>
          ))
        )}
        {/* High Backrest Posts */}
        {[-0.2, 0.2].map((x) => (
          <mesh key={`c1-post-${x}`} position={[x, 0.72, 0.2]} castShadow>
            <boxGeometry args={[0.05, 0.52, 0.05]} />
            <meshStandardMaterial map={woodTex} roughness={0.9} color="#381f0d" />
          </mesh>
        ))}
        {/* Backrest Slat */}
        <mesh position={[0, 0.88, 0.2]} castShadow>
          <boxGeometry args={[0.42, 0.14, 0.03]} />
          <meshStandardMaterial map={woodTex} roughness={0.9} color="#4a2c16" />
        </mesh>
      </group>

      {/* Chair 2 (Opposite side) */}
      <group position={[0.2, 0, -1.0]} rotation={[0, Math.PI + 0.15, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.48, 0.05, 0.48]} />
          <meshStandardMaterial map={woodTex} roughness={0.9} color="#4a2c16" />
        </mesh>
        {[-0.2, 0.2].map((x) =>
          [-0.2, 0.2].map((z) => (
            <mesh key={`c2-leg-${x}-${z}`} position={[x, 0.22, z]} castShadow>
              <boxGeometry args={[0.05, 0.44, 0.05]} />
              <meshStandardMaterial map={woodTex} roughness={0.9} color="#381f0d" />
            </mesh>
          ))
        )}
        {[-0.2, 0.2].map((x) => (
          <mesh key={`c2-post-${x}`} position={[x, 0.72, 0.2]} castShadow>
            <boxGeometry args={[0.05, 0.52, 0.05]} />
            <meshStandardMaterial map={woodTex} roughness={0.9} color="#381f0d" />
          </mesh>
        ))}
        <mesh position={[0, 0.88, 0.2]} castShadow>
          <boxGeometry args={[0.42, 0.14, 0.03]} />
          <meshStandardMaterial map={woodTex} roughness={0.9} color="#4a2c16" />
        </mesh>
      </group>

      {/* Chair 3 (Side / Head of table) */}
      <group position={[1.4, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.48, 0.05, 0.48]} />
          <meshStandardMaterial map={woodTex} roughness={0.9} color="#4a2c16" />
        </mesh>
        {[-0.2, 0.2].map((x) =>
          [-0.2, 0.2].map((z) => (
            <mesh key={`c3-leg-${x}-${z}`} position={[x, 0.22, z]} castShadow>
              <boxGeometry args={[0.05, 0.44, 0.05]} />
              <meshStandardMaterial map={woodTex} roughness={0.9} color="#381f0d" />
            </mesh>
          ))
        )}
        {[-0.2, 0.2].map((x) => (
          <mesh key={`c3-post-${x}`} position={[x, 0.72, 0.2]} castShadow>
            <boxGeometry args={[0.05, 0.52, 0.05]} />
            <meshStandardMaterial map={woodTex} roughness={0.9} color="#381f0d" />
          </mesh>
        ))}
        <mesh position={[0, 0.88, 0.2]} castShadow>
          <boxGeometry args={[0.42, 0.14, 0.03]} />
          <meshStandardMaterial map={woodTex} roughness={0.9} color="#4a2c16" />
        </mesh>
      </group>
    </group>
  );
}

// ─── 6. Large Frosted Industrial Window with Cold Fog Backlight (Photo 2) ──────
function FrostedIndustrialWindow({ 
  position, 
  windowTex 
}: { 
  position: [number, number, number]; 
  windowTex: THREE.Texture; 
}) {
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      {/* Heavy Industrial Steel Window Frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4.2, 2.4, 0.12]} />
        <meshStandardMaterial color="#1a1c18" roughness={0.8} metalness={0.7} />
      </mesh>

      {/* Multi-Pane Glass Surface */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[3.9, 2.1]} />
        <meshStandardMaterial
          map={windowTex}
          roughness={0.2}
          transparent
          opacity={0.92}
          emissive="#6a8288"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Grid Mullion Bars */}
      {[-1.3, -0.65, 0, 0.65, 1.3].map((gx) => (
        <mesh key={`mullion-v-${gx}`} position={[gx, 0, 0.02]} castShadow>
          <boxGeometry args={[0.04, 2.1, 0.03]} />
          <meshStandardMaterial color="#111" metalness={0.8} />
        </mesh>
      ))}
      {[-0.5, 0.5].map((gy) => (
        <mesh key={`mullion-h-${gy}`} position={[0, gy, 0.02]} castShadow>
          <boxGeometry args={[3.9, 0.04, 0.03]} />
          <meshStandardMaterial color="#111" metalness={0.8} />
        </mesh>
      ))}

      {/* Cold Pale-Blue Foggy Exterior Directional / Spot Lighting streaming through */}
      <spotLight
        position={[0, 0.5, 1.8]}
        target-position={[0, -0.8, -2.5]}
        color="#a8d0db"
        intensity={28}
        distance={9}
        angle={Math.PI / 3}
        penumbra={0.8}
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

  useFrame(() => {
    // Subtle spooky sway from air currents
    if (lampGroupRef.current) {
      const time = Date.now() * 0.0015;
      lampGroupRef.current.rotation.z = Math.sin(time) * 0.03;
      lampGroupRef.current.rotation.x = Math.cos(time * 0.8) * 0.02;
    }
    // Atmospheric voltage flicker
    if (lightRef.current) {
      if (Math.random() > 0.94) {
        lightRef.current.intensity = 8 + Math.random() * 16;
      }
    }
  });

  return (
    <group position={position} ref={lampGroupRef}>
      {/* Thin Suspension Cord from Ceiling */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 1.4, 6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Vintage Green Enamel Dome Shade (Photo 1 & 2) */}
      <group position={[0, 0, 0]}>
        {/* Top Socket Fitting */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 0.1, 10]} />
          <meshStandardMaterial color="#3d4a36" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Enamel Conical Dome */}
        <mesh castShadow>
          <coneGeometry args={[0.32, 0.22, 16, 1, true]} />
          <meshStandardMaterial color="#2d5236" roughness={0.3} metalness={0.2} side={THREE.DoubleSide} />
        </mesh>
        {/* Bare Incandescent Bulb inside shade */}
        <mesh position={[0, -0.04, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#fffbe6" emissive="#fffbe6" emissiveIntensity={1.2} />
        </mesh>
      </group>

      {/* Downward Focused Sickly Yellow-Green / Warm Incandescent Cone Light */}
      <pointLight
        ref={lightRef}
        position={[0, -0.15, 0]}
        color="#e6f5c8"
        intensity={18}
        distance={8}
        castShadow={false}
      />
    </group>
  );
}

// ─── 8. Vintage Wall Clock & Cast Iron Heating Radiator ────────────────────────
function VintageWallAccents({ 
  position 
}: { 
  position: [number, number, number]; 
}) {
  return (
    <group position={position}>
      {/* Vintage Round Cream Wall Clock (Above door / near entrance, Photo 1) */}
      <group position={[-1.2, 2.7, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.24, 0.06, 20]} />
          <meshStandardMaterial color="#e0d6be" roughness={0.6} />
        </mesh>
        {/* Clock Face Dial */}
        <mesh position={[0, 0, 0.035]}>
          <circleGeometry args={[0.18, 20]} />
          <meshStandardMaterial color="#f0eae0" roughness={0.9} />
        </mesh>
        {/* Clock Hands */}
        <mesh position={[0.02, 0.03, 0.04]} rotation={[0, 0, -0.6]}>
          <planeGeometry args={[0.015, 0.1]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.03, 0.01, 0.04]} rotation={[0, 0, 1.4]}>
          <planeGeometry args={[0.012, 0.14]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      </group>

      {/* Cast Iron Ribbed Radiator (Wall heater with peeling paint, Photo 3) */}
      <group position={[1.8, 0.45, 0]}>
        {/* 8 Cast Iron Ribs */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`rad-${i}`} position={[(i - 3.5) * 0.14, 0, 0]} castShadow>
            <boxGeometry args={[0.09, 0.8, 0.22]} />
            <meshStandardMaterial color="#333833" roughness={0.8} metalness={0.7} />
          </mesh>
        ))}
        {/* Top & Bottom Connecting Pipes */}
        {[0.32, -0.32].map((py, idx) => (
          <mesh key={`pipe-${idx}`} position={[0, py, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 1.2, 8]} />
            <meshStandardMaterial color="#222" metalness={0.9} />
          </mesh>
        ))}
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
      {/* 4 Heavy Wooden Beams running across the kitchen ceiling */}
      {[-3.6, -1.2, 1.2, 3.6].map((z, idx) => (
        <mesh key={`beam-${idx}`} position={[0, 0, z]} castShadow receiveShadow>
          <boxGeometry args={[9.8, 0.28, 0.35]} />
          <meshStandardMaterial map={woodTex} roughness={0.9} color="#422814" />
        </mesh>
      ))}
      {/* Planks between beams */}
      <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9.8, 9.8]} />
        <meshStandardMaterial map={woodTex} roughness={0.95} color="#352010" />
      </mesh>
    </group>
  );
}

// ─── 10. Master Horror Kitchen Component ──────────────────────────────────────
export default function HorrorKitchen({ 
  position 
}: { 
  position: [number, number, number]; 
}) {
  // Load generated ultra-realistic horror textures
  const [
    floorTileTex,
    wallTex,
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

  // Configure texture repeat settings
  useMemo(() => {
    [floorTileTex, wallTex, woodTex, backsplashTex].forEach((tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
    });
    floorTileTex.repeat.set(6, 6);
    wallTex.repeat.set(3, 2);
    woodTex.repeat.set(4, 2);
    backsplashTex.repeat.set(4, 2);
  }, [floorTileTex, wallTex, woodTex, backsplashTex]);

  return (
    <group position={position}>
      {/* ═══ 1. Vintage Distressed Geometric Tile Floor (Photo 2) ════════════ */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9.8, 9.8]} />
        <meshStandardMaterial map={floorTileTex} roughness={0.65} metalness={0.1} />
      </mesh>

      {/* ═══ 2. Rustic Exposed Wooden Ceiling Beams (Photo 1 & 2) ═════════════ */}
      <TimberCeilingBeams woodTex={woodTex} />

      {/* ═══ 3. Vintage 1950s Mint-Green Refrigerator (Photo 1 & 2) ═══════════ */}
      <VintageRetroFridge
        position={[-3.6, 0, -3.4]}
        fridgeTex={fridgeTex}
        woodTex={woodTex}
      />

      {/* ═══ 4. Farmhouse Deep Ceramic Sink & Distressed Cabinets (Photo 2) ═══ */}
      <FarmhouseSinkCounter
        position={[-2.8, 0, 1.2]}
        woodTex={woodTex}
        tileTex={backsplashTex}
      />

      {/* ═══ 5. Vintage Heavy Enamel Stove Range & Occult Sigil (Photo 3) ═════ */}
      <VintageHeavyStove
        position={[0.2, 0, -4.3]}
        stoveTex={stoveTex}
        tileTex={backsplashTex}
        sigilTex={sigilTex}
      />

      {/* ═══ 6. Wall Shelves, Wooden Cupboard & Utensil Rack (Photo 1 & 3) ════ */}
      <WallShelvesAndUtensils
        position={[0.2, 2.2, -4.3]}
        woodTex={woodTex}
      />

      {/* ═══ 7. Large Frosted Industrial Window with Cold Fog Light (Photo 2) ═ */}
      <FrostedIndustrialWindow
        position={[-4.85, 2.1, 1.2]}
        windowTex={windowTex}
      />

      {/* ═══ 8. Rustic Plank Dining Table & High-Backed Chairs (Photo 1 & 2) ══ */}
      <RusticDiningSet
        position={[1.8, 0, 0.6]}
        woodTex={woodTex}
      />

      {/* ═══ 9. Overhead Green Enamel Pendant Lamp (Photo 1 & 2) ══════════════ */}
      <GreenEnamelPendantLamp position={[1.8, 2.6, 0.6]} />

      {/* ═══ 10. Wall Clock & Cast Iron Radiator Accents ══════════════════════ */}
      <VintageWallAccents position={[0, 0, 4.3]} />

      {/* ═══ 11. Subtle Ambient Green-Grey Fill Light ═════════════════════════ */}
      <pointLight position={[-1.5, 2.2, 0]} color="#7fa38a" intensity={4} distance={9} />
    </group>
  );
}
