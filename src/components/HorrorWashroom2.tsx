'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// ─── 1. Antique Curved Brass Sconce Wall Lamp (Photo 2) ───────────────────────
function AntiqueFlutedSconce({
  position,
  rotY = 0,
}: {
  position: [number, number, number];
  rotY?: number;
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const bulbRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (lightRef.current) {
      // Sickly warm flickering amber light
      const flicker =
        Math.sin(t * 8.5) * 0.12 +
        Math.sin(t * 22.0) * 0.08 +
        (Math.sin(t * 41.0) > 0.94 ? -0.55 : 0.0);
      const baseIntensity = 2.8;
      const curIntensity = Math.max(0.7, baseIntensity + flicker);
      lightRef.current.intensity = curIntensity;

      if (bulbRef.current) {
        const mat = bulbRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = curIntensity * 0.65;
      }
    }
  });

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Wall Brass Mounting Rosette */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.025, 12]} />
        <meshStandardMaterial color="#8a6c32" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Ornate Curving Gooseneck Brass Arm */}
      <group position={[0, -0.04, 0.08]}>
        <mesh position={[0, 0, 0.04]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.16, 8]} />
          <meshStandardMaterial color="#8a6c32" metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.08, 0.1]} rotation={[-0.8, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.14, 8]} />
          <meshStandardMaterial color="#8a6c32" metalness={0.85} roughness={0.3} />
        </mesh>
      </group>

      {/* Fluted Bell Glass Shade */}
      <group position={[0, 0.08, 0.22]}>
        <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.16, 0.18, 16, 1, true]} />
          <meshStandardMaterial
            color="#fff0cc"
            emissive="#ffe28a"
            emissiveIntensity={0.6}
            roughness={0.3}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Brass Shade Fitter Cap */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.03, 12]} />
          <meshStandardMaterial color="#8a6c32" metalness={0.85} />
        </mesh>

        {/* Inner Glowing Bulb */}
        <mesh ref={bulbRef} position={[0, -0.02, 0]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial
            color="#fff6dd"
            emissive="#ffeaa0"
            emissiveIntensity={2.4}
            roughness={0.2}
          />
        </mesh>

        {/* 60 FPS rule: castShadow is FALSE */}
        <pointLight
          ref={lightRef}
          position={[0, -0.1, 0]}
          color="#ffe28a"
          distance={8.0}
          intensity={2.8}
          castShadow={false}
        />
      </group>
    </group>
  );
}

// ─── 2. Black Marble Luxury Vanity with Vessel Sink (Photo 2) ─────────────────
function BlackMarbleVanity({
  position,
  rotY = 0,
  marbleTex,
  noteTex,
}: {
  position: [number, number, number];
  rotY?: number;
  marbleTex: THREE.Texture;
  noteTex: THREE.Texture;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* RigidBody Collider */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.42, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[4.2, 0.9, 0.85]} />
        </mesh>
      </RigidBody>

      {/* ── Solid Polished Black Marble Countertop Slab (Photo 2) ── */}
      <mesh position={[0, 0.82, 0]} receiveShadow>
        <boxGeometry args={[4.0, 0.08, 0.8]} />
        <meshStandardMaterial
          map={marbleTex}
          roughness={0.15}
          metalness={0.2}
          color="#222225"
        />
      </mesh>

      {/* Marble Backsplash Rim along wall */}
      <mesh position={[0, 0.92, -0.38]} receiveShadow>
        <boxGeometry args={[4.0, 0.14, 0.04]} />
        <meshStandardMaterial map={marbleTex} roughness={0.18} color="#222225" />
      </mesh>

      {/* Heavy Black Cast-Iron Vanity Legs & Support Frame */}
      {[-1.9, 1.9].map((lx) =>
        [-0.34, 0.34].map((lz) => (
          <mesh key={`vleg-${lx}-${lz}`} position={[lx, 0.4, lz]}>
            <boxGeometry args={[0.06, 0.8, 0.06]} />
            <meshStandardMaterial color="#1a1c1e" roughness={0.6} metalness={0.8} />
          </mesh>
        ))
      )}

      {/* Lower Storage Slatted Iron Towel Shelf */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[3.85, 0.02, 0.68]} />
        <meshStandardMaterial color="#141517" roughness={0.7} metalness={0.7} />
      </mesh>

      {/* ── Conical Ceramic/Stone Vessel Bowl Basin Sink (Photo 2) ── */}
      <group position={[0, 0.86, 0.02]}>
        {/* Outer Conical Basin Rim */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.3, 0.16, 0.2, 20, 1, true]} />
          <meshStandardMaterial
            color="#e0e6e8"
            roughness={0.25}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Basin Interior Base & Drain */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.03, 16]} />
          <meshStandardMaterial color="#c8d2d6" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.035, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.01, 10]} />
          <meshStandardMaterial color="#111" metalness={0.9} />
        </mesh>
      </group>

      {/* ── High-Arc Antique Brass Gooseneck Faucet & Dual Lever Handles (Photo 2) ── */}
      <group position={[0, 0.86, -0.28]}>
        {/* Main Faucet Upright Column */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.36, 10]} />
          <meshStandardMaterial color="#7a6234" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Arched Spout Neck reaching over basin */}
        <mesh position={[0, 0.38, 0.1]} rotation={[0.6, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.22, 10]} />
          <meshStandardMaterial color="#7a6234" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.36, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.08, 8]} />
          <meshStandardMaterial color="#7a6234" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Dual Side Turn Levers */}
        {[-0.14, 0.14].map((hx, idx) => (
          <group key={`vanityfaucet-${idx}`} position={[hx, 0.08, 0]}>
            <mesh>
              <cylinderGeometry args={[0.018, 0.018, 0.14, 6]} />
              <meshStandardMaterial color="#6e5628" metalness={0.85} />
            </mesh>
            <mesh position={[0, 0.08, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.07, 6]} />
              <meshStandardMaterial color="#6e5628" metalness={0.85} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── Sinister Ceramic Vase with Ghost Orchid (Photo 2) ── */}
      <group position={[-1.3, 0.86, 0.1]}>
        {/* Elegant White Porcelain Vase Body */}
        <mesh position={[0, 0.2, 0]} receiveShadow>
          <cylinderGeometry args={[0.08, 0.14, 0.4, 16]} />
          <meshStandardMaterial color="#eaeef0" roughness={0.15} metalness={0.1} />
        </mesh>
        {/* Vase Neck */}
        <mesh position={[0, 0.44, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.12, 12]} />
          <meshStandardMaterial color="#eaeef0" roughness={0.15} />
        </mesh>
        {/* Tall Graceful Curving Green Orchid Stem */}
        <mesh position={[0, 0.65, 0.02]} rotation={[0.1, 0, -0.15]}>
          <cylinderGeometry args={[0.006, 0.006, 0.38, 6]} />
          <meshStandardMaterial color="#2d4a2a" roughness={0.7} />
        </mesh>
        <mesh position={[-0.05, 0.85, 0.05]} rotation={[-0.15, 0, 0.2]}>
          <cylinderGeometry args={[0.005, 0.005, 0.28, 6]} />
          <meshStandardMaterial color="#2d4a2a" roughness={0.7} />
        </mesh>
        {/* Pale Ghostly White Orchid Blossoms */}
        {[
          { x: -0.04, y: 0.76, z: 0.04, r: 0.3 },
          { x: -0.08, y: 0.92, z: 0.06, r: -0.4 },
          { x: -0.02, y: 1.0, z: 0.03, r: 0.8 },
        ].map((pet, idx) => (
          <group key={`orchid-${idx}`} position={[pet.x, pet.y, pet.z]} rotation={[0, pet.r, 0]}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshStandardMaterial
                color="#f8faff"
                emissive="#d0e5f2"
                emissiveIntensity={0.25}
                roughness={0.4}
              />
            </mesh>
            {/* Dark creepy center stamen */}
            <mesh position={[0, 0, 0.03]}>
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshStandardMaterial color="#4a1820" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── Antique Miniature Distressed Portrait Frames (Photo 2) ── */}
      <group position={[1.1, 0.86, -0.18]} rotation={[0, -0.35, 0]}>
        {/* Frame 1 */}
        <mesh position={[0, 0.14, 0]}>
          <boxGeometry args={[0.22, 0.28, 0.03]} />
          <meshStandardMaterial color="#2a1808" roughness={0.7} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.14, 0.018]}>
          <planeGeometry args={[0.18, 0.24]} />
          <meshStandardMaterial color="#9c8c72" roughness={0.9} />
        </mesh>
        {/* Standing Kickstand behind frame */}
        <mesh position={[0, 0.1, -0.05]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[0.04, 0.2, 0.01]} />
          <meshStandardMaterial color="#1a1005" />
        </mesh>
      </group>

      <group position={[1.45, 0.86, -0.12]} rotation={[0, -0.15, 0]}>
        {/* Frame 2 */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.18, 0.24, 0.025]} />
          <meshStandardMaterial color="#18120c" roughness={0.6} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.12, 0.015]}>
          <planeGeometry args={[0.14, 0.2]} />
          <meshStandardMaterial color="#6a7880" roughness={0.8} />
        </mesh>
      </group>

      {/* ── Bloodied Warning Note Pinned to Marble ("DO NOT LOOK IN THE MIRROR" - Photo 2) ── */}
      <mesh position={[-0.55, 0.865, 0.15]} rotation={[-Math.PI / 2, 0, 0.18]}>
        <planeGeometry args={[0.36, 0.36]} />
        <meshStandardMaterial
          map={noteTex}
          roughness={0.9}
          transparent
          opacity={0.98}
        />
      </mesh>
    </group>
  );
}

// ─── 3. Large Ornate Wall Mirror with Grime & Reflections (Photo 2) ───────────
function OrnateVanityMirror({
  position,
  rotY = 0,
}: {
  position: [number, number, number];
  rotY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Heavy Bevelled Antique Dark Wood / Brass Outer Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 1.8, 0.06]} />
        <meshStandardMaterial color="#2d2216" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Inner Frame Brass Filigree Rim */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[1.38, 1.68, 0.04]} />
        <meshStandardMaterial color="#554422" metalness={0.8} roughness={0.35} />
      </mesh>

      {/* High-Reflectivity Grimy Glass Pane */}
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[1.28, 1.58]} />
        <meshStandardMaterial
          color="#cfdde4"
          metalness={0.95}
          roughness={0.06}
        />
      </mesh>
    </group>
  );
}

// ─── 4. Detailed 3D Wall Switch Plates & Sockets (Photo 2) ───────────────────
function WallSwitchPlate({
  position,
  rotY = 0,
}: {
  position: [number, number, number];
  rotY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* White/Ivory Switch Plate Housing */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.22, 0.14, 0.02]} />
        <meshStandardMaterial color="#d8d3c5" roughness={0.5} />
      </mesh>
      {/* Dual Rocker Switches */}
      {[-0.05, 0.05].map((sx, idx) => (
        <mesh key={`sw-${idx}`} position={[sx, 0, 0.012]} rotation={[idx === 0 ? 0.15 : -0.15, 0, 0]}>
          <boxGeometry args={[0.04, 0.06, 0.015]} />
          <meshStandardMaterial color="#eee8d8" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// ─── 5. High-Tank Victorian Pull-Chain Toilet Stall (Photo 3) ─────────────────
function HighTankPullChainToilet({
  position,
  rotY = 0,
  stallTex,
}: {
  position: [number, number, number];
  rotY?: number;
  stallTex: THREE.Texture;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* RigidBody for Toilet */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.45, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[0.7, 0.9, 0.8]} />
        </mesh>
      </RigidBody>

      {/* Ceramic Toilet Bowl */}
      <mesh position={[0, 0.25, 0.08]} receiveShadow>
        <cylinderGeometry args={[0.22, 0.25, 0.5, 10]} />
        <meshStandardMaterial color="#9eaab0" roughness={0.55} />
      </mesh>

      {/* Dark Walnut Wood Toilet Seat Ring */}
      <mesh position={[0, 0.52, 0.12]}>
        <torusGeometry args={[0.2, 0.045, 8, 14]} />
        <meshStandardMaterial color="#2d1708" roughness={0.65} />
      </mesh>

      {/* Upright Wooden Seat Lid */}
      <mesh position={[0, 0.74, -0.06]} rotation={[1.4, 0, 0]}>
        <boxGeometry args={[0.38, 0.42, 0.03]} />
        <meshStandardMaterial color="#2d1708" roughness={0.65} />
      </mesh>

      {/* ── High-Mounted Victorian Cistern Tank (Mounted high on wall at Y = 2.4) ── */}
      <mesh position={[0, 2.4, -0.28]} receiveShadow>
        <boxGeometry args={[0.68, 0.44, 0.28]} />
        <meshStandardMaterial color="#1a0e05" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, 2.64, -0.28]}>
        <boxGeometry args={[0.72, 0.05, 0.32]} />
        <meshStandardMaterial color="#140b04" roughness={0.6} />
      </mesh>

      {/* Long Brass Flush Pipe Connecting Cistern Down to Bowl */}
      <mesh position={[0, 1.45, -0.24]}>
        <cylinderGeometry args={[0.024, 0.024, 1.8, 8]} />
        <meshStandardMaterial color="#7a6234" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Hanging Pull Chain with White Porcelain Teardrop Handle */}
      <group position={[0.26, 2.3, -0.16]}>
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 1.2, 4]} />
          <meshStandardMaterial color="#887755" metalness={0.9} />
        </mesh>
        {/* Porcelain Handle */}
        <mesh position={[0, -1.25, 0]}>
          <cylinderGeometry args={[0.02, 0.012, 0.12, 8]} />
          <meshStandardMaterial color="#f0f4f5" roughness={0.3} />
        </mesh>
      </group>

      {/* Stall Divider Partition Enclosure (Photo 3) */}
      <mesh position={[-1.2, 1.2, 0]} receiveShadow>
        <boxGeometry args={[0.06, 2.4, 2.2]} />
        <meshStandardMaterial map={stallTex} roughness={0.85} color="#453830" />
      </mesh>
    </group>
  );
}

// ─── 6. Embalming / Restroom Drainage Wash Table & Instruments ────────────────
function EmbalmingWashTable({
  position,
  rotY = 0,
}: {
  position: [number, number, number];
  rotY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.45, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[1.3, 0.9, 2.4]} />
        </mesh>
      </RigidBody>

      {/* Stainless Steel / Porcelain Stained Table Surface */}
      <mesh position={[0, 0.82, 0]} receiveShadow>
        <boxGeometry args={[1.2, 0.08, 2.3]} />
        <meshStandardMaterial color="#82949c" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Drainage Lip Perimeter */}
      <mesh position={[0, 0.88, 0]}>
        <boxGeometry args={[1.26, 0.04, 2.36]} />
        <meshStandardMaterial color="#6a7880" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Blood stain pool in table center */}
      <mesh position={[0, 0.87, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 1.4]} />
        <meshStandardMaterial
          color="#380a06"
          emissive="#1a0402"
          emissiveIntensity={0.3}
          roughness={0.2}
        />
      </mesh>

      {/* Stainless Support Legs with Wheel Casters */}
      {[-0.52, 0.52].map((lx) =>
        [-1.02, 1.02].map((lz) => (
          <group key={`etab-${lx}-${lz}`} position={[lx, 0.4, lz]}>
            <mesh>
              <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
              <meshStandardMaterial color="#4a5258" metalness={0.9} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.38, 0]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#222" />
            </mesh>
          </group>
        ))
      )}

      {/* Surgical Instrument Tray with Rusty Scalpels */}
      <group position={[0.4, 0.88, -0.7]} rotation={[0, 0.2, 0]}>
        <mesh>
          <boxGeometry args={[0.3, 0.02, 0.45]} />
          <meshStandardMaterial color="#7a858a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Scalpel */}
        <mesh position={[-0.05, 0.02, 0]} rotation={[0, 0.1, 0]}>
          <boxGeometry args={[0.015, 0.008, 0.18]} />
          <meshStandardMaterial color="#887050" metalness={0.8} />
        </mesh>
        {/* Bone Saw */}
        <mesh position={[0.06, 0.02, 0]} rotation={[0, -0.15, 0]}>
          <boxGeometry args={[0.03, 0.01, 0.22]} />
          <meshStandardMaterial color="#4a3020" metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

// ─── MAIN 2F NE HORROR WASHROOM 2 COMPONENT ──────────────────────────────────
export default function HorrorWashroom2() {
  const [glazedTileTex, marbleTex, checkerTileTex, stallWoodTex, noteTex] = useTexture([
    '/textures/sinister_glazed_tiles.jpg',
    '/textures/black_marble_grunge.jpg',
    '/textures/grungy_checker_tiles.jpg',
    '/textures/rusted_stall_wood.jpg',
    '/textures/creepy_bloody_note.jpg',
  ]);

  useMemo(() => {
    glazedTileTex.wrapS = THREE.RepeatWrapping;
    glazedTileTex.wrapT = THREE.RepeatWrapping;
    glazedTileTex.repeat.set(4.0, 2.5);

    marbleTex.wrapS = THREE.RepeatWrapping;
    marbleTex.wrapT = THREE.RepeatWrapping;
    marbleTex.repeat.set(2.0, 1.0);

    checkerTileTex.wrapS = THREE.RepeatWrapping;
    checkerTileTex.wrapT = THREE.RepeatWrapping;
    checkerTileTex.repeat.set(5.0, 9.0);

    stallWoodTex.wrapS = THREE.RepeatWrapping;
    stallWoodTex.wrapT = THREE.RepeatWrapping;
    stallWoodTex.repeat.set(2.0, 1.5);
  }, [glazedTileTex, marbleTex, checkerTileTex, stallWoodTex]);

  return (
    <group>
      {/* ═══ 1. COMPLETE ROOM FLOOR (X: [6.5, 15.0], Z: [-4.0, 12.5]) ═══ */}
      <mesh position={[10.75, 5.01, 4.25]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8.5, 16.5]} />
        <meshStandardMaterial map={checkerTileTex} roughness={0.3} color="#dfdcce" />
      </mesh>

      {/* ═══ 2. COMPLETE 4-WALL GLAZED SINISTER TILES (Photo 2) ════════════════ */}
      {/* 2A. Outer East Wall (X = 14.98, Z: [-4.0, 12.5], Length = 16.5m) */}
      <mesh position={[14.98, 7.5, 4.25]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16.5, 5.0]} />
        <meshStandardMaterial map={glazedTileTex} roughness={0.25} />
      </mesh>

      {/* 2B. Front North Wall (Z = -3.98, X: [6.5, 15.0], Width = 8.5m) */}
      <mesh position={[10.75, 7.5, -3.98]} rotation={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8.5, 5.0]} />
        <meshStandardMaterial map={glazedTileTex} roughness={0.25} />
      </mesh>

      {/* 2C. South Dividing Wall (Z = 12.48, X: [6.5, 15.0], Width = 8.5m) */}
      <mesh position={[10.75, 7.5, 12.48]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[8.5, 5.0]} />
        <meshStandardMaterial map={glazedTileTex} roughness={0.25} />
      </mesh>

      {/* 2D. West Hallway Wall Enclosures (X = 6.52, facing into washroom): */}
      {/* North Section of West Wall (Z = -4.0 to 5.0, length = 9.0m) */}
      <mesh position={[6.52, 7.5, 0.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[9.0, 5.0]} />
        <meshStandardMaterial map={glazedTileTex} roughness={0.25} />
      </mesh>
      {/* South Section of West Wall (Z = 8.0 to 12.5, length = 4.5m) */}
      <mesh position={[6.52, 7.5, 10.25]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[4.5, 5.0]} />
        <meshStandardMaterial map={glazedTileTex} roughness={0.25} />
      </mesh>
      {/* Header Panel Above Door (Z = 5.0 to 8.0, height = 2.0m from Y = 8.0 to 10.0) */}
      <mesh position={[6.52, 9.0, 6.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[3.0, 2.0]} />
        <meshStandardMaterial map={glazedTileTex} roughness={0.25} />
      </mesh>

      {/* ═══ 3. BLACK MARBLE VANITY WITH VESSEL SINK & GHOST ORCHID (Photo 2) ═══ */}
      <BlackMarbleVanity
        position={[14.4, 5.0, 4.2]}
        rotY={-Math.PI / 2}
        marbleTex={marbleTex}
        noteTex={noteTex}
      />

      {/* ═══ 4. LARGE ORNATE MIRROR & SCONCE LAMP (Photo 2) ═══════════════════ */}
      <OrnateVanityMirror position={[14.88, 7.25, 4.2]} rotY={-Math.PI / 2} />
      <AntiqueFlutedSconce position={[14.88, 8.35, 4.2]} rotY={-Math.PI / 2} />

      {/* ═══ 5. WALL ELECTRICAL SWITCH PLATES (Photo 2) ═══════════════════════ */}
      <WallSwitchPlate position={[14.88, 6.4, 1.8]} rotY={-Math.PI / 2} />

      {/* Secondary Sconce Lamp over back area */}
      <AntiqueFlutedSconce position={[14.88, 8.0, -1.8]} rotY={-Math.PI / 2} />

      {/* ═══ 6. HIGH-TANK PULL-CHAIN TOILET STALLS (Photo 3) ═════════════════ */}
      <HighTankPullChainToilet
        position={[13.8, 5.0, -1.8]}
        rotY={-Math.PI / 2}
        stallTex={stallWoodTex}
      />

      {/* ═══ 7. EMBALMING / RESTROOM DRAINAGE TABLE (South Wing) ══════════════ */}
      <EmbalmingWashTable position={[9.2, 5.0, 9.8]} rotY={0} />

      {/* Brass Towel Ring on wall */}
      <group position={[14.88, 6.6, 6.4]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <torusGeometry args={[0.1, 0.012, 8, 16]} />
          <meshStandardMaterial color="#887030" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
