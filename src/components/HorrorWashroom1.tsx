'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// ─── 1. Overhead Hanging Pendant Light (Photo 1) ──────────────────────────────
function HangingPendantLamp({
  position,
}: {
  position: [number, number, number];
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const bulbMeshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (lightRef.current) {
      // Atmospheric clinical flickering light
      const flicker =
        Math.sin(t * 12.0) * 0.15 +
        Math.sin(t * 27.0) * 0.1 +
        (Math.sin(t * 53.0) > 0.92 ? -0.7 : 0.0);
      const baseIntensity = 3.2;
      const curIntensity = Math.max(0.6, baseIntensity + flicker);
      lightRef.current.intensity = curIntensity;

      if (bulbMeshRef.current) {
        const mat = bulbMeshRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = curIntensity * 0.7;
      }
    }
  });

  return (
    <group position={position}>
      {/* Ceiling mounting rose / junction box */}
      <mesh position={[0, 2.3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.8} />
      </mesh>

      {/* Hanging black twisted electrical cord */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 2.3, 6]} />
        <meshStandardMaterial color="#0e0e0e" roughness={0.9} />
      </mesh>

      {/* Industrial Bell Lampshade */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.06, 0.28, 0.24, 16, 1, true]} />
          <meshStandardMaterial
            color="#222628"
            roughness={0.6}
            metalness={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Shade top cap */}
        <mesh position={[0, 0.21, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
          <meshStandardMaterial color="#111315" roughness={0.5} metalness={0.9} />
        </mesh>

        {/* Exposed Glowing Bulb */}
        <mesh ref={bulbMeshRef} position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#aef3e7"
            emissiveIntensity={2.5}
            roughness={0.2}
          />
        </mesh>

        {/* Cast shadow is FALSE for 60 FPS rule */}
        <pointLight
          ref={lightRef}
          position={[0, -0.05, 0]}
          color="#9ee8dc"
          distance={8.5}
          intensity={3.2}
          castShadow={false}
        />

        {/* Translucent Volumetric Light Cone Haze */}
        <mesh position={[0, -1.4, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[1.5, 2.8, 16, 1, true]} />
          <meshBasicMaterial
            color="#a2ede1"
            transparent
            opacity={0.065}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

// ─── 2. Dilapidated Open Medicine Cabinet with Bottles & Gauze (Photo 1) ─────
function OpenMedicineCabinet({
  position,
  rotY = 0,
}: {
  position: [number, number, number];
  rotY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Cabinet Frame Body */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[0.72, 0.95, 0.18]} />
        <meshStandardMaterial color="#4a423b" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Inner Cavity Hollow (White/Stained Enamel) */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.64, 0.87, 0.15]} />
        <meshStandardMaterial color="#c0c9cb" roughness={0.6} />
      </mesh>

      {/* Glass / Metal Shelves */}
      {[-0.15, 0.15].map((sy, i) => (
        <mesh key={`medshelf-${i}`} position={[0, sy, 0.03]}>
          <boxGeometry args={[0.62, 0.02, 0.13]} />
          <meshStandardMaterial color="#7a9099" roughness={0.3} metalness={0.4} />
        </mesh>
      ))}

      {/* Open Ajar Mirrored Door (Hinged at left edge) */}
      <group position={[-0.34, 0, 0.1]} rotation={[0, 0.75, 0]}>
        {/* Door Frame */}
        <mesh position={[0.34, 0, 0]}>
          <boxGeometry args={[0.68, 0.92, 0.03]} />
          <meshStandardMaterial color="#3d352e" roughness={0.7} />
        </mesh>
        {/* Cracked Mirror Panel on Door Face */}
        <mesh position={[0.34, 0, 0.018]}>
          <planeGeometry args={[0.6, 0.84]} />
          <meshStandardMaterial
            color="#b0c8d0"
            metalness={0.92}
            roughness={0.12}
          />
        </mesh>
        {/* Mirror Handle */}
        <mesh position={[0.62, 0, 0.03]}>
          <cylinderGeometry args={[0.01, 0.01, 0.12, 6]} />
          <meshStandardMaterial color="#887755" metalness={0.8} />
        </mesh>
      </group>

      {/* Shelf Props: Medicine bottles, pill containers, bandage rolls, syringe */}
      {/* Top Shelf: Bandages and pill jars */}
      <group position={[0, 0.22, 0.03]}>
        {/* Rolled gauze bandages */}
        {[-0.22, -0.14].map((bx, idx) => (
          <mesh key={`gauze-${idx}`} position={[bx, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.07, 10]} />
            <meshStandardMaterial color="#dcd5c5" roughness={0.95} />
          </mesh>
        ))}
        {/* Amber Medicine Bottle */}
        <group position={[0.02, 0.06, 0]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 0.11, 8]} />
            <meshStandardMaterial color="#553010" roughness={0.2} metalness={0.4} transparent opacity={0.88} />
          </mesh>
          <mesh position={[0, 0.065, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.03, 8]} />
            <meshStandardMaterial color="#f0f0f0" roughness={0.6} />
          </mesh>
        </group>
        {/* Clear Glass Prescription Vial */}
        <group position={[0.16, 0.05, 0]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 0.09, 8]} />
            <meshStandardMaterial color="#88b5c5" roughness={0.1} metalness={0.6} transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 0.055, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.025, 8]} />
            <meshStandardMaterial color="#111111" roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* Middle Shelf: Syringe & Ointment Tins */}
      <group position={[0, -0.07, 0.03]}>
        {/* Glass medical syringe lying down */}
        <group position={[-0.1, 0.015, 0]} rotation={[0, 0.3, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.01, 0.01, 0.12, 6]} />
            <meshStandardMaterial color="#a0d0e0" roughness={0.1} transparent opacity={0.75} />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.002, 0.002, 0.04, 4]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
          </mesh>
        </group>
        {/* Metal ointment tin */}
        <mesh position={[0.15, 0.02, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.03, 10]} />
          <meshStandardMaterial color="#7a6b55" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>

      {/* Bottom Shelf: Tipped over bottle & cotton swab jar */}
      <group position={[0, -0.36, 0.03]}>
        {/* Tipped over brown bottle */}
        <mesh position={[-0.14, 0.025, 0]} rotation={[0, 0.2, Math.PI / 2]}>
          <cylinderGeometry args={[0.028, 0.028, 0.1, 8]} />
          <meshStandardMaterial color="#402010" roughness={0.3} />
        </mesh>
        {/* Glass Cotton Jar */}
        <mesh position={[0.12, 0.06, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.11, 8]} />
          <meshStandardMaterial color="#9cb8c5" roughness={0.2} transparent opacity={0.65} />
        </mesh>
      </group>
    </group>
  );
}

// ─── 3. Vintage Dilapidated Wall-Mounted Sink with Exposed P-Trap (Photo 1) ───
function GrungyWallMountedSink({
  position,
  rotY = 0,
}: {
  position: [number, number, number];
  rotY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* RigidBody Collider for Sink */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.1, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[0.85, 0.7, 0.6]} />
        </mesh>
      </RigidBody>

      {/* Porcelain Basin Outer Shell */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[0.82, 0.26, 0.54]} />
        <meshStandardMaterial color="#b8c8cc" roughness={0.5} />
      </mesh>

      {/* High Splashback Panel against Wall */}
      <mesh position={[0, 0.42, -0.25]} receiveShadow>
        <boxGeometry args={[0.82, 0.32, 0.04]} />
        <meshStandardMaterial color="#b8c8cc" roughness={0.5} />
      </mesh>

      {/* Hollow Inner Sink Basin with Rust/Grime Stains */}
      <mesh position={[0, 0.17, 0.02]}>
        <boxGeometry args={[0.68, 0.18, 0.4]} />
        <meshStandardMaterial color="#88989c" roughness={0.7} />
      </mesh>

      {/* Dark Rust Stain Decal inside Basin Bottom */}
      <mesh position={[0, 0.09, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 0.25]} />
        <meshStandardMaterial color="#4a2512" roughness={0.9} />
      </mesh>

      {/* Chrome/Rusty Drain Hole */}
      <mesh position={[0, 0.095, 0.02]}>
        <cylinderGeometry args={[0.035, 0.035, 0.01, 10]} />
        <meshStandardMaterial color="#2a1f18" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Dual Rusty Turn Faucets & Central High Spout */}
      <group position={[0, 0.36, -0.22]}>
        {/* Central Spout */}
        <mesh position={[0, 0.05, 0.06]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.022, 0.14, 8]} />
          <meshStandardMaterial color="#6a583e" metalness={0.75} roughness={0.35} />
        </mesh>
        {/* Hot & Cold Cross Turn Handles */}
        {[-0.18, 0.18].map((hx, idx) => (
          <group key={`sinkfaucet-${idx}`} position={[hx, 0.04, 0.02]}>
            <mesh>
              <cylinderGeometry args={[0.016, 0.016, 0.06, 6]} />
              <meshStandardMaterial color="#5a4830" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.035, 0]}>
              <boxGeometry args={[0.07, 0.015, 0.07]} />
              <meshStandardMaterial color={idx === 0 ? '#8b3a3a' : '#3a5a8b'} roughness={0.4} metalness={0.6} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── Exposed Under-Sink Plumbing & P-Trap ── */}
      <group position={[0, 0, 0.02]}>
        {/* Vertical Tailpiece Pipe */}
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.24, 8]} />
          <meshStandardMaterial color="#55585c" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Curved P-Trap U-Bend */}
        <mesh position={[0, -0.26, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.065, 0.022, 8, 12, Math.PI]} />
          <meshStandardMaterial color="#4a4d50" metalness={0.85} roughness={0.35} />
        </mesh>
        {/* Drain pipe into wall */}
        <mesh position={[0, -0.26, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.18, 8]} />
          <meshStandardMaterial color="#4a4d50" metalness={0.85} roughness={0.35} />
        </mesh>
        {/* Wall Escutcheon Flange */}
        <mesh position={[0, -0.26, -0.25]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 10]} />
          <meshStandardMaterial color="#333" metalness={0.9} />
        </mesh>
      </group>

      {/* Wall Bracket Supports Under Basin */}
      {[-0.32, 0.32].map((bx, idx) => (
        <mesh key={`sinkbracket-${idx}`} position={[bx, -0.08, -0.12]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.04, 0.28, 0.04]} />
          <meshStandardMaterial color="#2a2520" metalness={0.8} roughness={0.5} />
        </mesh>
      ))}

      {/* Moldy Stained Soap Dish */}
      <mesh position={[0.26, 0.3, -0.16]}>
        <boxGeometry args={[0.12, 0.03, 0.08]} />
        <meshStandardMaterial color="#7a7060" metalness={0.7} />
      </mesh>
      <mesh position={[0.26, 0.325, -0.16]}>
        <boxGeometry args={[0.08, 0.02, 0.05]} />
        <meshStandardMaterial color="#3a483a" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ─── 4. Wall-Mounted Toilet Paper Roll Dispenser (Photo 1) ───────────────────
function WallToiletPaperHolder({
  position,
  rotY = 0,
}: {
  position: [number, number, number];
  rotY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Chrome Wall Bracket */}
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[0.2, 0.08, 0.04]} />
        <meshStandardMaterial color="#444" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Side Arms */}
      {[-0.09, 0.09].map((ax, idx) => (
        <mesh key={`tparm-${idx}`} position={[ax, 0, 0.03]}>
          <boxGeometry args={[0.02, 0.06, 0.12]} />
          <meshStandardMaterial color="#444" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      {/* Center Spindle & Toilet Paper Roll */}
      <mesh position={[0, 0, 0.06]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, 0.16, 12]} />
        <meshStandardMaterial color="#e5ded2" roughness={0.95} />
      </mesh>
      {/* Dangling Unrolled Paper Strip */}
      <mesh position={[0, -0.12, 0.11]} rotation={[0.15, 0, 0]}>
        <planeGeometry args={[0.15, 0.16]} />
        <meshStandardMaterial
          color="#dcd5c6"
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── 5. Open Mint Step Trash Can with Overflowing Dirty Paper (Photo 1) ───────
function OverflowingTrashBin({
  position,
  rotY = 0,
}: {
  position: [number, number, number];
  rotY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.25, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[0.45, 0.55, 0.45]} />
        </mesh>
      </RigidBody>

      {/* Mint/Teal Metal Can Body */}
      <mesh position={[0, 0.24, 0]} receiveShadow>
        <boxGeometry args={[0.34, 0.48, 0.32]} />
        <meshStandardMaterial color="#3a6064" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Foot Pedal */}
      <mesh position={[0, 0.02, 0.18]}>
        <boxGeometry args={[0.08, 0.02, 0.06]} />
        <meshStandardMaterial color="#222" metalness={0.9} />
      </mesh>

      {/* Propped Open Lid (Tilted Up) */}
      <group position={[0, 0.48, -0.15]} rotation={[-0.95, 0, 0]}>
        <mesh position={[0, 0, 0.16]}>
          <boxGeometry args={[0.36, 0.03, 0.34]} />
          <meshStandardMaterial color="#325458" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>

      {/* Overflowing Mound of Crumpled Paper Towels & Bloody Gauze */}
      <group position={[0, 0.46, 0]}>
        {[
          { x: 0, y: 0.04, z: 0, s: 0.12, c: '#dcd3be' },
          { x: -0.06, y: 0.08, z: 0.04, s: 0.1, c: '#8b3a3a' },
          { x: 0.07, y: 0.07, z: -0.03, s: 0.09, c: '#c8c0aa' },
          { x: 0.02, y: 0.13, z: 0.02, s: 0.08, c: '#5a2218' },
        ].map((p, idx) => (
          <mesh key={`trashmound-${idx}`} position={[p.x, p.y, p.z]} rotation={[idx * 0.4, idx * 0.7, 0]}>
            <dodecahedronGeometry args={[p.s, 0]} />
            <meshStandardMaterial color={p.c} roughness={0.95} />
          </mesh>
        ))}
      </group>

      {/* Scattered Crumpled Paper Balls on Floor Around the Bin */}
      {[
        { x: -0.28, z: 0.18, r: 0.4, c: '#dfd7c4' },
        { x: -0.35, z: -0.12, r: 1.1, c: '#6d261e' },
        { x: 0.26, z: 0.22, r: -0.8, c: '#dcd2bd' },
        { x: 0.32, z: -0.08, r: 0.6, c: '#c4bcab' },
        { x: 0.15, z: 0.38, r: 2.1, c: '#7a2f26' },
      ].map((pb, idx) => (
        <mesh key={`scatpaper-${idx}`} position={[pb.x, 0.04, pb.z]} rotation={[pb.r, pb.r * 1.5, 0]}>
          <dodecahedronGeometry args={[0.045, 0]} />
          <meshStandardMaterial color={pb.c} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

// ─── 6. Grungy Dilapidated Toilet with Exposed Drain Pipe (Photo 1) ──────────
function GrungyClinicToilet({
  position,
  rotY = 0,
}: {
  position: [number, number, number];
  rotY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Collider */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.45, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[0.65, 0.9, 0.85]} />
        </mesh>
      </RigidBody>

      {/* Ceramic Base Pedestal */}
      <mesh position={[0, 0.22, 0.08]} receiveShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.44, 10]} />
        <meshStandardMaterial color="#94a2a6" roughness={0.6} />
      </mesh>

      {/* Main Toilet Bowl */}
      <mesh position={[0, 0.44, 0.12]} receiveShadow>
        <cylinderGeometry args={[0.24, 0.19, 0.18, 12]} />
        <meshStandardMaterial color="#94a2a6" roughness={0.6} />
      </mesh>

      {/* Murky Stagnant Dirty Water in Bowl Bottom */}
      <mesh position={[0, 0.38, 0.12]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 10]} />
        <meshStandardMaterial
          color="#253528"
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      {/* Raised Plastic/Wood Toilet Seat Ring (Upright) */}
      <mesh position={[0, 0.65, -0.06]} rotation={[1.4, 0, 0]}>
        <torusGeometry args={[0.19, 0.035, 6, 12]} />
        <meshStandardMaterial color="#4a4038" roughness={0.7} />
      </mesh>

      {/* Raised Toilet Lid (Upright Against Cistern) */}
      <mesh position={[0, 0.68, -0.1]} rotation={[1.5, 0, 0]}>
        <boxGeometry args={[0.38, 0.42, 0.03]} />
        <meshStandardMaterial color="#88989c" roughness={0.6} />
      </mesh>

      {/* Rear Low Cistern Tank */}
      <mesh position={[0, 0.72, -0.24]} receiveShadow>
        <boxGeometry args={[0.54, 0.46, 0.22]} />
        <meshStandardMaterial color="#94a2a6" roughness={0.6} />
      </mesh>
      {/* Cistern Lid */}
      <mesh position={[0, 0.96, -0.24]}>
        <boxGeometry args={[0.57, 0.05, 0.25]} />
        <meshStandardMaterial color="#8a989c" roughness={0.5} />
      </mesh>
      {/* Metal Flush Lever */}
      <mesh position={[-0.24, 0.88, -0.12]}>
        <cylinderGeometry args={[0.01, 0.01, 0.06, 6]} />
        <meshStandardMaterial color="#665544" metalness={0.8} />
      </mesh>

      {/* ── Large S-Curve Waste Drain Pipe into Wall (Photo 1) ── */}
      <group position={[0, 0.18, -0.12]}>
        {/* Rear horizontal pipe segment */}
        <mesh position={[0, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.22, 8]} />
          <meshStandardMaterial color="#404548" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Wall Flange Collar */}
        <mesh position={[0, 0, -0.24]}>
          <cylinderGeometry args={[0.08, 0.08, 0.03, 10]} />
          <meshStandardMaterial color="#2b2d30" metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// ─── 7. Dark Wooden / Rusted Iron Toilet Stall Partitions (Photo 3) ───────────
function RustedToiletStalls({
  stallTex,
}: {
  stallTex: THREE.Texture;
}) {
  return (
    <group>
      {/* Dividing Wall separating Stall 1 and Stall 2 (Z = 0.5, X from -14.9 to -10.0) */}
      <RigidBody type="fixed" colliders="cuboid" position={[-12.45, 6.2, 0.5]}>
        <mesh receiveShadow>
          <boxGeometry args={[4.9, 2.4, 0.08]} />
          <meshStandardMaterial map={stallTex} roughness={0.85} color="#453830" />
        </mesh>
      </RigidBody>

      {/* Stall Front Support Post */}
      <mesh position={[-10.0, 6.2, 0.5]}>
        <cylinderGeometry args={[0.04, 0.04, 2.4, 6]} />
        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.4} />
      </mesh>

      {/* Second Dividing Partition (Z = -2.2, X from -14.9 to -10.0) */}
      <RigidBody type="fixed" colliders="cuboid" position={[-12.45, 6.2, -2.2]}>
        <mesh receiveShadow>
          <boxGeometry args={[4.9, 2.4, 0.08]} />
          <meshStandardMaterial map={stallTex} roughness={0.85} color="#453830" />
        </mesh>
      </RigidBody>

      {/* Stall 1 Door (Ajar at ~35 degrees - Photo 3) */}
      <group position={[-10.0, 5.0, 0.5]} rotation={[0, 0.6, 0]}>
        <mesh position={[0.45, 1.2, 0]}>
          <boxGeometry args={[0.9, 2.2, 0.05]} />
          <meshStandardMaterial map={stallTex} roughness={0.85} color="#3d3028" />
        </mesh>
        {/* Rusted Iron Hinges */}
        {[0.4, 1.9].map((hy, idx) => (
          <mesh key={`hinge-${idx}`} position={[0.02, hy, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.08, 6]} />
            <meshStandardMaterial color="#332211" metalness={0.8} />
          </mesh>
        ))}
        {/* Metal Latch Plate */}
        <mesh position={[0.85, 1.1, 0.03]}>
          <boxGeometry args={[0.06, 0.04, 0.02]} />
          <meshStandardMaterial color="#554433" metalness={0.8} />
        </mesh>
      </group>

      {/* Secondary Stall Toilet (Inside back cubicle) */}
      <GrungyClinicToilet position={[-13.8, 5.0, -1.2]} rotY={Math.PI / 2} />
    </group>
  );
}

// ─── 8. Grungy Cast-Iron Clawfoot Bathtub with Moldy Curtain (Photo 1/3) ───────
function GrungyCornerBathtub({
  position,
  rotY = 0,
}: {
  position: [number, number, number];
  rotY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.4, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[1.2, 0.8, 2.3]} />
        </mesh>
      </RigidBody>

      {/* Outer Cast-Iron Porcelain Tub */}
      <mesh position={[0, 0.42, 0]} receiveShadow>
        <boxGeometry args={[1.1, 0.65, 2.2]} />
        <meshStandardMaterial color="#7e8c92" roughness={0.6} />
      </mesh>

      {/* Tub Basin Rim */}
      <mesh position={[0, 0.76, 0]}>
        <boxGeometry args={[1.2, 0.05, 2.3]} />
        <meshStandardMaterial color="#6a787e" roughness={0.7} />
      </mesh>

      {/* Murky Blood/Grime Water */}
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[0.92, 0.42, 1.95]} />
        <meshStandardMaterial
          color="#381a14"
          emissive="#1a0805"
          emissiveIntensity={0.3}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Claw feet */}
      {[-0.5, 0.5].map((x) =>
        [-0.95, 0.95].map((z) => (
          <mesh key={`cft-${x}-${z}`} position={[x, 0.08, z]}>
            <cylinderGeometry args={[0.04, 0.07, 0.16, 6]} />
            <meshStandardMaterial color="#3a3020" metalness={0.7} roughness={0.5} />
          </mesh>
        ))
      )}

      {/* Overhead Curtain Rod with Dirty Vinyl Curtain */}
      <mesh position={[0.52, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 2.25, 8]} />
        <meshStandardMaterial color="#555" metalness={0.85} />
      </mesh>

      {/* Moldy Translucent Blue/Green Vinyl Curtain */}
      <mesh position={[0.52, 1.4, 0]} receiveShadow>
        <planeGeometry args={[2.2, 1.55]} />
        <meshStandardMaterial
          color="#224c52"
          roughness={0.5}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── 9. Overhead Exposed Steam & Water Conduits ────────────────────────────────
function WallPipesAndConduits({
  position,
  length = 6.0,
}: {
  position: [number, number, number];
  length?: number;
}) {
  return (
    <group position={position}>
      {/* Main Copper Pipe */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, length, 8]} />
        <meshStandardMaterial color="#7a4e2e" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Secondary Iron Conduit */}
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, length, 6]} />
        <meshStandardMaterial color="#3a3d40" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* Mounting Brackets */}
      {[-length / 3, 0, length / 3].map((bx, idx) => (
        <mesh key={`pbracket-${idx}`} position={[bx, 0.04, 0.02]}>
          <boxGeometry args={[0.04, 0.16, 0.04]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} />
        </mesh>
      ))}
      {/* Round Pressure Gauge Dial */}
      <group position={[0, 0, 0.05]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.03, 12]} />
          <meshStandardMaterial color="#6a583e" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.02]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.12, 0.12]} />
          <meshStandardMaterial color="#dcd2be" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// ─── MAIN 2F NW HORROR WASHROOM 1 COMPONENT ──────────────────────────────────
export default function HorrorWashroom1() {
  const [tealTileTex, checkerTileTex, stallWoodTex] = useTexture([
    '/textures/grungy_teal_tiles.jpg',
    '/textures/grungy_checker_tiles.jpg',
    '/textures/rusted_stall_wood.jpg',
  ]);

  useMemo(() => {
    tealTileTex.wrapS = THREE.RepeatWrapping;
    tealTileTex.wrapT = THREE.RepeatWrapping;
    tealTileTex.repeat.set(4.0, 2.5);

    checkerTileTex.wrapS = THREE.RepeatWrapping;
    checkerTileTex.wrapT = THREE.RepeatWrapping;
    checkerTileTex.repeat.set(5.0, 9.0);

    stallWoodTex.wrapS = THREE.RepeatWrapping;
    stallWoodTex.wrapT = THREE.RepeatWrapping;
    stallWoodTex.repeat.set(2.0, 1.5);
  }, [tealTileTex, checkerTileTex, stallWoodTex]);

  return (
    <group>
      {/* ═══ 1. COMPLETE ROOM FLOOR (X: [-15.0, -6.5], Z: [-4.0, 12.5]) ═══ */}
      <mesh position={[-10.75, 5.01, 4.25]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8.5, 16.5]} />
        <meshStandardMaterial map={checkerTileTex} roughness={0.4} color="#bcd8db" />
      </mesh>

      {/* ═══ 2. COMPLETE 4-WALL TEAL TILE INNER SURFACES ═══════════════════════ */}
      {/* 2A. Outer West Wall (X = -14.98, Z: [-4.0, 12.5], Length = 16.5m) */}
      <mesh position={[-14.98, 7.5, 4.25]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16.5, 5.0]} />
        <meshStandardMaterial map={tealTileTex} roughness={0.35} />
      </mesh>

      {/* 2B. Front North Wall (Z = -3.98, X: [-15.0, -6.5], Width = 8.5m) */}
      <mesh position={[-10.75, 7.5, -3.98]} rotation={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8.5, 5.0]} />
        <meshStandardMaterial map={tealTileTex} roughness={0.35} />
      </mesh>

      {/* 2C. South Dividing Wall (Z = 12.48, X: [-15.0, -6.5], Width = 8.5m) */}
      <mesh position={[-10.75, 7.5, 12.48]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[8.5, 5.0]} />
        <meshStandardMaterial map={tealTileTex} roughness={0.35} />
      </mesh>

      {/* 2D. East Hallway Wall Enclosures (X = -6.52, facing into washroom): */}
      {/* North Section of East Wall (Z = -4.0 to 5.0, length = 9.0m) */}
      <mesh position={[-6.52, 7.5, 0.5]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[9.0, 5.0]} />
        <meshStandardMaterial map={tealTileTex} roughness={0.35} />
      </mesh>
      {/* South Section of East Wall (Z = 8.0 to 12.5, length = 4.5m) */}
      <mesh position={[-6.52, 7.5, 10.25]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[4.5, 5.0]} />
        <meshStandardMaterial map={tealTileTex} roughness={0.35} />
      </mesh>
      {/* Header Panel Above Door (Z = 5.0 to 8.0, height = 2.0m from Y = 8.0 to 10.0) */}
      <mesh position={[-6.52, 9.0, 6.5]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[3.0, 2.0]} />
        <meshStandardMaterial map={tealTileTex} roughness={0.35} />
      </mesh>

      {/* ═══ 3. OVERHEAD HANGING CONE PENDANT LIGHT (Photo 1) ═════════════════ */}
      <HangingPendantLamp position={[-11.5, 7.6, 4.0]} />
      {/* Secondary Ambient Spooky Light in back stall area */}
      <pointLight
        position={[-13.5, 7.5, -1.0]}
        color="#7eddd0"
        distance={6.0}
        intensity={1.2}
        castShadow={false}
      />

      {/* ═══ 4. DILAPIDATED OPEN MEDICINE CABINET (Photo 1) ═══════════════════ */}
      <OpenMedicineCabinet position={[-14.85, 7.3, 3.5]} rotY={Math.PI / 2} />

      {/* ═══ 5. VINTAGE WALL-MOUNTED SINK WITH P-TRAP (Photo 1) ═══════════════ */}
      <GrungyWallMountedSink position={[-14.5, 5.85, 1.8]} rotY={Math.PI / 2} />

      {/* ═══ 6. WALL TOILET PAPER ROLL DISPENSER (Photo 1) ════════════════════ */}
      <WallToiletPaperHolder position={[-14.88, 6.0, 0.8]} rotY={Math.PI / 2} />

      {/* ═══ 7. OVERFLOWING MINT TRASH CAN & SCATTERED PAPER (Photo 1) ═════════ */}
      <OverflowingTrashBin position={[-14.2, 5.0, 0.1]} rotY={0.3} />

      {/* ═══ 8. GRUNGY CLINICAL TOILET WITH EXPOSED PIPE (Photo 1) ════════════ */}
      <GrungyClinicToilet position={[-13.8, 5.0, 7.2]} rotY={Math.PI / 2} />

      {/* ═══ 9. RUSTED WOODEN STALL PARTITIONS (Photo 3) ═════════════════════ */}
      <RustedToiletStalls stallTex={stallWoodTex} />

      {/* ═══ 10. CORNER CLAWFOOT BATHTUB WITH MOLDY CURTAIN ═══════════════════ */}
      <GrungyCornerBathtub position={[-9.2, 5.0, 10.2]} rotY={Math.PI} />

      {/* ═══ 11. UPPER WALL PIPES & GAUGES ═══════════════════════════════════ */}
      <WallPipesAndConduits position={[-14.85, 9.2, 4.0]} length={10.0} />
      <WallPipesAndConduits position={[-10.75, 9.2, 12.4]} length={6.0} />
    </group>
  );
}
