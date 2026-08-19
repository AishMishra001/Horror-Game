'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';

function playDoorSound() {
  if (typeof window === 'undefined') return;
  const audio = new Audio('/stairs and doors.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
}

// ─── 1. Wall Pipe Conduits & Plumbing ─────────────────────────────────────────
function ExposedWallPipes({ length = 8.0, position }: { length?: number; position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main horizontal water supply pipe */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, length, 8]} />
        <meshStandardMaterial color="#8a5a36" metalness={0.75} roughness={0.35} />
      </mesh>
      {/* Secondary thinner electrical conduit */}
      <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, length, 6]} />
        <meshStandardMaterial color="#4a4d52" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* Pipe mounting brackets */}
      {[-length / 3, 0, length / 3].map((xOffset, i) => (
        <group key={`bracket-${i}`} position={[xOffset, 0, 0.02]}>
          <mesh>
            <boxGeometry args={[0.04, 0.14, 0.04]} />
            <meshStandardMaterial color="#2a2d30" metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── 2. Vintage Dilapidated Bathtub & Moldy Shower Curtain ────────────────────
function CreepyBathtubWithCurtain({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Heavy cast-iron porcelain bathtub body */}
      <mesh position={[0, 0.42, 0]} receiveShadow>
        <boxGeometry args={[1.15, 0.68, 2.3]} />
        <meshStandardMaterial color="#8e9ba0" roughness={0.5} />
      </mesh>

      {/* Dirty inner basin rim */}
      <mesh position={[0, 0.77, 0]}>
        <boxGeometry args={[1.25, 0.05, 2.4]} />
        <meshStandardMaterial color="#7a878c" roughness={0.6} />
      </mesh>

      {/* Stagnant murky greenish-black dirty bath water */}
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[0.95, 0.45, 2.05]} />
        <meshStandardMaterial
          color="#162220"
          emissive="#081412"
          roughness={0.08}
          metalness={0.3}
        />
      </mesh>

      {/* Stained antique claw feet */}
      {[-0.52, 0.52].map((x) =>
        [-1.02, 1.02].map((z) => (
          <mesh key={`btclaw-${x}-${z}`} position={[x, 0.08, z]}>
            <cylinderGeometry args={[0.05, 0.08, 0.16, 6]} />
            <meshStandardMaterial color="#4a402a" metalness={0.7} roughness={0.4} />
          </mesh>
        ))
      )}

      {/* Rusty brass faucet & taps with water stains */}
      <group position={[0, 0.88, -1.08]}>
        <mesh position={[0, 0.08, 0]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.035, 0.22, 6]} />
          <meshStandardMaterial color="#685530" metalness={0.8} roughness={0.35} />
        </mesh>
        {/* Hot & Cold cross handles */}
        {[-0.14, 0.14].map((hx, idx) => (
          <mesh key={`tap-${idx}`} position={[hx, 0.06, 0.02]}>
            <boxGeometry args={[0.06, 0.03, 0.06]} />
            <meshStandardMaterial color={idx === 0 ? '#8a3030' : '#30508a'} metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Overhead Metal Shower Curtain Rod */}
      <mesh position={[0.55, 2.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2.35, 8]} />
        <meshStandardMaterial color="#6a6a6a" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Curtain rings along the rod */}
      {Array.from({ length: 9 }).map((_, i) => {
        const rz = -1.05 + i * 0.26;
        return (
          <mesh key={`cring-${i}`} position={[0.55, 2.3, rz]}>
            <torusGeometry args={[0.035, 0.006, 6, 10]} />
            <meshStandardMaterial color="#888888" metalness={0.9} />
          </mesh>
        );
      })}

      {/* Grungy Translucent Blue Vinyl Shower Curtain with Mold at bottom */}
      <mesh position={[0.55, 1.45, 0]} receiveShadow>
        <planeGeometry args={[2.3, 1.68, 6, 4]} />
        <meshStandardMaterial
          color="#2a586d"
          emissive="#0d2430"
          emissiveIntensity={0.2}
          roughness={0.4}
          metalness={0.1}
          transparent
          opacity={0.78}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Dark mold/slime stain hem on curtain bottom */}
      <mesh position={[0.552, 0.72, 0]}>
        <planeGeometry args={[2.3, 0.25]} />
        <meshStandardMaterial
          color="#1a2e22"
          roughness={0.8}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── 3. Vintage Dirty Toilet with High/Low Tank & Waste Pipe ──────────────────
function CreepyVintageToilet({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Ceramic base pedestal */}
      <mesh position={[0, 0.22, 0.05]} receiveShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.44, 8]} />
        <meshStandardMaterial color="#9eaab0" roughness={0.6} />
      </mesh>

      {/* Main Toilet Bowl */}
      <mesh position={[0, 0.48, 0.1]} receiveShadow>
        <boxGeometry args={[0.48, 0.35, 0.62]} />
        <meshStandardMaterial color="#9eaab0" roughness={0.55} />
      </mesh>

      {/* Dirty water inside toilet bowl */}
      <mesh position={[0, 0.52, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.16, 10]} />
        <meshStandardMaterial
          color="#18201a"
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>

      {/* Stained open wooden/plastic seat lid raised up */}
      <mesh position={[0, 0.88, -0.16]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.46, 0.52, 0.04]} />
        <meshStandardMaterial color="#544336" roughness={0.7} />
      </mesh>

      {/* Water Tank */}
      <mesh position={[0, 1.08, -0.22]} receiveShadow>
        <boxGeometry args={[0.54, 0.52, 0.28]} />
        <meshStandardMaterial color="#94a1a6" roughness={0.6} />
      </mesh>
      {/* Tank lid */}
      <mesh position={[0, 1.36, -0.22]}>
        <boxGeometry args={[0.58, 0.06, 0.31]} />
        <meshStandardMaterial color="#88969b" roughness={0.6} />
      </mesh>

      {/* Flush lever */}
      <mesh position={[0.28, 1.25, -0.15]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
        <meshStandardMaterial color="#6a7378" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Exposed rear waste pipe going into wall */}
      <mesh position={[0, 0.22, -0.26]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.3, 8]} />
        <meshStandardMaterial color="#40464a" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Wall-mounted toilet paper dispenser with paper roll */}
      <group position={[0.42, 0.75, -0.15]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.08, 0.04, 0.06]} />
          <meshStandardMaterial color="#5a6065" metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.13, 8]} />
          <meshStandardMaterial color="#d8d3c5" roughness={0.9} />
        </mesh>
        {/* Dangling ripped paper piece */}
        <mesh position={[0.02, -0.15, 0.03]} rotation={[0.1, 0, 0]}>
          <planeGeometry args={[0.12, 0.12]} />
          <meshStandardMaterial color="#cfc9ba" roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

// ─── 4. Stained Wall-Mounted Sink & Plumbing ──────────────────────────────────
function CreepyPorcelainSink({ 
  position, 
  rotY = 0,
  cinderTex 
}: { 
  position: [number, number, number]; 
  rotY?: number;
  cinderTex: THREE.Texture;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Heavy stained porcelain sink basin */}
      <mesh position={[0, 0.82, 0]} receiveShadow>
        <boxGeometry args={[0.88, 0.22, 0.6]} />
        <meshStandardMaterial color="#9bb0b8" roughness={0.45} />
      </mesh>

      {/* Backsplash lip against wall */}
      <mesh position={[0, 1.02, -0.27]}>
        <boxGeometry args={[0.88, 0.2, 0.06]} />
        <meshStandardMaterial color="#94a9b1" roughness={0.5} />
      </mesh>

      {/* Basin inner cavity with brown rust stains */}
      <mesh position={[0, 0.81, 0.02]}>
        <boxGeometry args={[0.74, 0.18, 0.44]} />
        <meshStandardMaterial color="#788b92" roughness={0.6} />
      </mesh>

      {/* Dirty drain hole */}
      <mesh position={[0, 0.73, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.045, 8]} />
        <meshStandardMaterial color="#221108" metalness={0.8} />
      </mesh>

      {/* Vintage brass/rust dual faucet spout */}
      <group position={[0, 0.98, -0.18]}>
        <mesh rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.03, 0.2, 8]} />
          <meshStandardMaterial color="#4a3e28" metalness={0.8} roughness={0.4} />
        </mesh>
        {[-0.14, 0.14].map((tx, idx) => (
          <mesh key={`sinktap-${idx}`} position={[tx, 0.04, 0.02]}>
            <boxGeometry args={[0.05, 0.03, 0.05]} />
            <meshStandardMaterial color="#3a3020" metalness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Exposed rusty P-Trap drain plumbing under sink */}
      <group position={[0, 0.52, 0]}>
        <mesh position={[0, 0.1, 0.02]}>
          <cylinderGeometry args={[0.03, 0.03, 0.25, 6]} />
          <meshStandardMaterial color="#48382c" metalness={0.75} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.04, -0.06]} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.08, 0.03, 6, 8]} />
          <meshStandardMaterial color="#48382c" metalness={0.75} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.04, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.22, 6]} />
          <meshStandardMaterial color="#48382c" metalness={0.75} roughness={0.4} />
        </mesh>
      </group>

      {/* Dirty Soap Dish with Bar of Soap */}
      <group position={[-0.32, 0.94, -0.14]}>
        <mesh>
          <boxGeometry args={[0.12, 0.02, 0.09]} />
          <meshStandardMaterial color="#50585c" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.08, 0.025, 0.05]} />
          <meshStandardMaterial color="#cfc7a7" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// ─── 5. Oval Mirror with Sconce Lamp & "YOU DON'T WANNA SEE IT AGAIN" ────────
function CreepyMirrorAndScrawl({
  position,
  rotY = 0,
  scrawlTex,
}: {
  position: [number, number, number];
  rotY?: number;
  scrawlTex: THREE.Texture;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Vintage Oval Wall Mirror with Tarnished Rim */}
      <group position={[0, 1.85, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.04, 24]} />
          <meshStandardMaterial color="#2d2218" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <circleGeometry args={[0.51, 24]} />
          <meshStandardMaterial
            color="#8fa8b3"
            metalness={0.92}
            roughness={0.12}
          />
        </mesh>
      </group>

      {/* Antique Wall Sconce Lamp beside Mirror */}
      <group position={[0.75, 2.1, 0.08]}>
        {/* Wall mounting plate */}
        <mesh>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 8]} />
          <meshStandardMaterial color="#332515" metalness={0.8} />
        </mesh>
        {/* Curved brass arm */}
        <mesh position={[0, 0.08, 0.09]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.2, 6]} />
          <meshStandardMaterial color="#6a5225" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Fluted glass lamp shade */}
        <mesh position={[0, 0.16, 0.16]}>
          <cylinderGeometry args={[0.06, 0.13, 0.15, 8]} />
          <meshStandardMaterial
            color="#ffeec0"
            emissive="#ffcc66"
            emissiveIntensity={0.8}
            roughness={0.3}
          />
        </mesh>
        {/* Warm sconce localized glow (zero shadow for 60fps) */}
        <pointLight position={[0, 0.16, 0.25]} color="#ffe099" distance={4.5} intensity={5.0} castShadow={false} />
      </group>

      {/* Creepy "YOU DON'T WANNA SEE IT AGAIN" Wall / Board Decal from Photo 1 */}
      <group position={[-1.4, 1.8, 0.02]}>
        {/* Stained wooden board / mirror frame backing */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[1.1, 1.5, 0.04]} />
          <meshStandardMaterial color="#1a1815" roughness={0.9} />
        </mesh>
        {/* High-res graffiti scrawl texture */}
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[1.02, 1.42]} />
          <meshStandardMaterial
            map={scrawlTex}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      </group>
    </group>
  );
}

// ─── 6. Vintage Washing Machine & Soap Powder Box ─────────────────────────────
function CreepyWashingMachine({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Heavy metal washer cabinet body */}
      <mesh position={[0, 0.55, 0]} receiveShadow>
        <boxGeometry args={[0.88, 1.1, 0.88]} />
        <meshStandardMaterial color="#7d8a90" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Top panel lid bevel */}
      <mesh position={[0, 1.12, 0]}>
        <boxGeometry args={[0.9, 0.05, 0.9]} />
        <meshStandardMaterial color="#657278" roughness={0.65} metalness={0.35} />
      </mesh>

      {/* Front Circular Porthole Door */}
      <group position={[0, 0.55, 0.45]}>
        {/* Outer ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.26, 0.035, 8, 16]} />
          <meshStandardMaterial color="#404b50" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Dark glass porthole */}
        <mesh>
          <circleGeometry args={[0.24, 16]} />
          <meshStandardMaterial color="#11181c" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Door handle latch */}
        <mesh position={[0.28, 0, 0.03]}>
          <boxGeometry args={[0.04, 0.1, 0.03]} />
          <meshStandardMaterial color="#2d3336" metalness={0.9} />
        </mesh>
      </group>

      {/* Top control dials */}
      {[-0.25, -0.08, 0.15].map((cx, i) => (
        <mesh key={`dial-${i}`} position={[cx, 1.0, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 8]} />
          <meshStandardMaterial color="#222" metalness={0.6} />
        </mesh>
      ))}

      {/* Detergent Powder Box sitting on top (from Photo 2) */}
      <group position={[0.2, 1.25, -0.1]} rotation={[0, 0.25, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.18, 0.24, 0.12]} />
          <meshStandardMaterial color="#c44d18" roughness={0.85} />
        </mesh>
        {/* Bright label strip */}
        <mesh position={[0, 0, 0.062]}>
          <planeGeometry args={[0.16, 0.14]} />
          <meshStandardMaterial color="#f0d040" roughness={0.8} />
        </mesh>
      </group>

      {/* Dark Laundry Hamper / Bucket beside washer (from Photo 1) */}
      <group position={[-0.72, 0.35, 0.1]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[0.26, 0.2, 0.7, 10]} />
          <meshStandardMaterial color="#3b2b1d" roughness={0.9} />
        </mesh>
        {/* Soiled towel overflowing */}
        <mesh position={[0.05, 0.38, 0]} rotation={[0.2, 0.4, 0.1]}>
          <boxGeometry args={[0.28, 0.12, 0.28]} />
          <meshStandardMaterial color="#6a7378" roughness={0.95} />
        </mesh>
      </group>
    </group>
  );
}

// ─── 7. Wall Medicine Cabinet & Multi-Colored Bottles ────────────────────────
function WallMedicineCabinet({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Wooden / Metal Cabinet frame */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[0.9, 1.2, 0.28]} />
        <meshStandardMaterial color="#302820" roughness={0.85} />
      </mesh>

      {/* Inner Cavity Shelves */}
      {[-0.2, 0.25].map((sy, idx) => (
        <mesh key={`cshelf-${idx}`} position={[0, sy, 0.04]}>
          <boxGeometry args={[0.82, 0.03, 0.2]} />
          <meshStandardMaterial color="#221b15" roughness={0.8} />
        </mesh>
      ))}

      {/* Cabinet Door Ajar with Glass Panel */}
      <group position={[-0.42, 0, 0.14]} rotation={[0, -0.65, 0]}>
        <mesh position={[0.42, 0, 0]}>
          <boxGeometry args={[0.86, 1.16, 0.03]} />
          <meshStandardMaterial color="#28221c" roughness={0.8} />
        </mesh>
        <mesh position={[0.42, 0, 0.02]}>
          <planeGeometry args={[0.65, 0.95]} />
          <meshStandardMaterial color="#7a96a3" metalness={0.7} roughness={0.2} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Various Toiletries & Chemical Detergent Bottles inside Cabinet (Photo 2) */}
      {/* Top shelf bottles */}
      <mesh position={[-0.25, 0.42, 0.05]}>
        <cylinderGeometry args={[0.04, 0.04, 0.24, 8]} />
        <meshStandardMaterial color="#1a6d45" roughness={0.5} />
      </mesh>
      <mesh position={[-0.08, 0.4, 0.05]}>
        <cylinderGeometry args={[0.045, 0.045, 0.2, 8]} />
        <meshStandardMaterial color="#2d4f8a" roughness={0.5} />
      </mesh>
      <mesh position={[0.1, 0.38, 0.05]}>
        <boxGeometry args={[0.07, 0.18, 0.07]} />
        <meshStandardMaterial color="#b33939" roughness={0.7} />
      </mesh>
      <mesh position={[0.28, 0.36, 0.05]}>
        <cylinderGeometry args={[0.035, 0.035, 0.14, 6]} />
        <meshStandardMaterial color="#d9a832" roughness={0.6} />
      </mesh>

      {/* Middle shelf: Pill bottles & spare toilet roll */}
      <mesh position={[-0.26, -0.06, 0.05]}>
        <cylinderGeometry args={[0.025, 0.025, 0.12, 6]} />
        <meshStandardMaterial color="#b86028" roughness={0.4} />
      </mesh>
      <mesh position={[-0.12, -0.07, 0.05]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 6]} />
        <meshStandardMaterial color="#cfc7a7" roughness={0.8} />
      </mesh>
      <mesh position={[0.18, -0.05, 0.05]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 8]} />
        <meshStandardMaterial color="#ded8c8" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ─── 8. Wall Shelf with 3 Distinct Bottles & Towel Bar (Photo 1) ──────────────
function WallShelfAndTowelBar({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Wall Shelf (Wire/Metal rack) */}
      <group position={[0, 0.6, 0]}>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[0.7, 0.02, 0.2]} />
          <meshStandardMaterial color="#303538" metalness={0.85} />
        </mesh>
        {/* 3 Distinct Bottles from Photo 1 (Yellow, Teal, Pink) */}
        <mesh position={[-0.2, 0.12, 0.1]}>
          <cylinderGeometry args={[0.045, 0.05, 0.22, 8]} />
          <meshStandardMaterial color="#e0a030" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.13, 0.1]}>
          <cylinderGeometry args={[0.048, 0.048, 0.24, 8]} />
          <meshStandardMaterial color="#30a898" roughness={0.4} />
        </mesh>
        <mesh position={[0.2, 0.12, 0.1]}>
          <cylinderGeometry args={[0.042, 0.045, 0.22, 8]} />
          <meshStandardMaterial color="#b84070" roughness={0.4} />
        </mesh>
      </group>

      {/* Towel Bar with Dirty Hanging Towel (Photo 1) */}
      <group position={[0, -0.2, 0]}>
        {/* Chrome bar */}
        <mesh position={[0, 0, 0.08]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.8, 6]} />
          <meshStandardMaterial color="#6a7278" metalness={0.9} />
        </mesh>
        {/* Stained rough beige towel draped over bar */}
        <mesh position={[0, -0.32, 0.08]} receiveShadow>
          <boxGeometry args={[0.42, 0.65, 0.03]} />
          <meshStandardMaterial color="#b3aba0" roughness={0.95} />
        </mesh>
      </group>
    </group>
  );
}

// ─── 9. Overflowing Trash Can & Wooden Stool (Photo 2 & 3) ─────────────────────
function TrashCanAndStool({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Turquoise / Grey Step Trash Can propped open */}
      <group position={[0, 0.3, 0]}>
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[0.34, 0.6, 0.28]} />
          <meshStandardMaterial color="#38605c" metalness={0.4} roughness={0.65} />
        </mesh>
        {/* Propped lid */}
        <mesh position={[0, 0.32, -0.06]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[0.36, 0.04, 0.3]} />
          <meshStandardMaterial color="#2d4a47" metalness={0.5} roughness={0.6} />
        </mesh>
        {/* Overflowing crumpled paper balls */}
        {[-0.06, 0.04, 0.0].map((px, idx) => (
          <mesh key={`pball-${idx}`} position={[px, 0.35 + idx * 0.04, 0.02]}>
            <dodecahedronGeometry args={[0.06, 0]} />
            <meshStandardMaterial color="#d4cebe" roughness={0.95} />
          </mesh>
        ))}
      </group>

      {/* Discarded crumpled paper balls spilled around the floor */}
      {[
        [-0.22, 0.04, 0.25],
        [0.26, 0.04, 0.2],
        [-0.08, 0.04, 0.36],
        [0.15, 0.04, 0.42],
      ].map(([fx, fy, fz], i) => (
        <mesh key={`floorp-${i}`} position={[fx, fy, fz]}>
          <dodecahedronGeometry args={[0.045, 0]} />
          <meshStandardMaterial color="#cdc6b4" roughness={0.95} />
        </mesh>
      ))}

      {/* Rough Wooden Stool (Photo 2) */}
      <group position={[0.78, 0, 0]}>
        {/* Top seat */}
        <mesh position={[0, 0.45, 0]} receiveShadow>
          <boxGeometry args={[0.42, 0.05, 0.42]} />
          <meshStandardMaterial color="#4a2e18" roughness={0.8} />
        </mesh>
        {/* 4 Wooden Legs */}
        {[-0.16, 0.16].map((lx) =>
          [-0.16, 0.16].map((lz) => (
            <mesh key={`stleg-${lx}-${lz}`} position={[lx, 0.22, lz]}>
              <boxGeometry args={[0.05, 0.44, 0.05]} />
              <meshStandardMaterial color="#352010" roughness={0.85} />
            </mesh>
          ))
        )}
      </group>
    </group>
  );
}

// ─── 10. Overhead Industrial Lighting & Exposed Ceiling Beams ─────────────────
function CreepyCeilingLightingAndBeams({ 
  flickerRef,
  woodPlanksTex 
}: { 
  flickerRef: React.RefObject<THREE.PointLight | null>;
  woodPlanksTex: THREE.Texture;
}) {
  return (
    <group position={[0, 4.3, 0]}>
      {/* Heavy Transverse Timber Ceiling Beams */}
      {[-5.0, -1.8, 1.8, 5.0].map((bz, i) => (
        <mesh key={`beam-${i}`} position={[0, -0.15, bz]} receiveShadow>
          <boxGeometry args={[9.8, 0.35, 0.35]} />
          <meshStandardMaterial map={woodPlanksTex} roughness={0.85} color="#2b1a10" />
        </mesh>
      ))}

      {/* Linear Industrial Fluorescent Light Fixture (Photo 2) */}
      <group position={[0, -0.1, -1.5]}>
        {/* Metal casing fixture */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.2, 0.08, 0.25]} />
          <meshStandardMaterial color="#33383c" metalness={0.8} roughness={0.35} />
        </mesh>
        {/* Glowing dual fluorescent tube */}
        <mesh position={[0, -0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 2.9, 10]} />
          <meshStandardMaterial
            color="#e0f8ff"
            emissive="#88d8f0"
            emissiveIntensity={1.2}
            roughness={0.1}
          />
        </mesh>
        {/* Cold blue-cyan ambient horror tube light (60fps compliant, castShadow=false) */}
        <pointLight
          ref={flickerRef}
          position={[0, -0.4, 0]}
          color="#88d8f0"
          distance={11.0}
          intensity={8.5}
          castShadow={false}
        />
      </group>

      {/* Hanging Black Cone Industrial Pendant Lamp (Photo 3) */}
      <group position={[0, 0, 3.5]}>
        {/* Hanging electrical cord */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 1.0, 4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Black metal shade cone */}
        <mesh position={[0, -1.05, 0]}>
          <cylinderGeometry args={[0.06, 0.32, 0.22, 12, 1, true]} />
          <meshStandardMaterial color="#1f2326" roughness={0.5} metalness={0.7} side={THREE.DoubleSide} />
        </mesh>
        {/* Bright central bulb */}
        <mesh position={[0, -1.02, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#c0e8ff"
            emissiveIntensity={1.5}
          />
        </mesh>
        <pointLight
          position={[0, -1.2, 0]}
          color="#a0d8f0"
          distance={8.0}
          intensity={6.0}
          castShadow={false}
        />
      </group>
    </group>
  );
}

// ─── 11. Interactable Creaky Bathroom Door ────────────────────────────────────
function InteractableBathroomDoor({ woodTex }: { woodTex: THREE.Texture }) {
  const setInteractPrompt = useGameStore((s) => s.setInteractPrompt);
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const canInteractRef = useRef(false);
  const pivotRef = useRef<THREE.Group>(null);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const targetRot = isOpen ? Math.PI * 0.52 : 0;
    if (pivotRef.current) {
      const diff = targetRot - pivotRef.current.rotation.y;
      if (Math.abs(diff) > 0.002) {
        pivotRef.current.rotation.y += diff * Math.min(1, delta * 5.0);
      }
    }
  });

  useEffect(() => {
    const handleKey = (evt: KeyboardEvent) => {
      if (evt.code === 'KeyE' && canInteractRef.current) {
        playDoorSound();
        const next = !isOpenRef.current;
        setIsOpen(next);
        isOpenRef.current = next;
        setInteractPrompt(next ? 'Press E to Close Door' : 'Press E to Open Door');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setInteractPrompt]);

  return (
    <group position={[-4.9, 0, 5.0]}>
      {/* Timber Doorframe Trim */}
      <mesh position={[0, 1.5, -0.7]} receiveShadow>
        <boxGeometry args={[0.4, 3.0, 0.1]} />
        <meshStandardMaterial color="#1a0f0a" map={woodTex} roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.5, 0.7]} receiveShadow>
        <boxGeometry args={[0.4, 3.0, 0.1]} />
        <meshStandardMaterial color="#1a0f0a" map={woodTex} roughness={0.75} />
      </mesh>
      <mesh position={[0, 3.01, 0]} receiveShadow>
        <boxGeometry args={[0.42, 0.12, 1.5]} />
        <meshStandardMaterial color="#1a0f0a" map={woodTex} roughness={0.75} />
      </mesh>

      {/* Door Leaf on Hinge Pivot */}
      <group position={[0, 1.46, -0.65]} ref={pivotRef}>
        <mesh position={[0, 0, 0.65]} receiveShadow>
          <boxGeometry args={[0.08, 2.88, 1.3]} />
          <meshStandardMaterial color="#2d180e" map={woodTex} roughness={0.7} />
        </mesh>
        {/* Brass Knob */}
        <mesh position={[0.06, 0, 1.18]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#967830" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Solid Collision Barrier when closed */}
      {!isOpen && (
        <RigidBody type="fixed" colliders="cuboid" position={[0, 1.46, 0]}>
          <mesh visible={false}>
            <boxGeometry args={[0.2, 2.9, 1.4]} />
          </mesh>
        </RigidBody>
      )}

      {/* Interaction Sensor Zone */}
      <RigidBody
        type="fixed"
        position={[0, 1.46, 0]}
        sensor
        onIntersectionEnter={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            canInteractRef.current = true;
            setInteractPrompt(isOpenRef.current ? 'Press E to Close Door' : 'Press E to Open Door');
          }
        }}
        onIntersectionExit={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            canInteractRef.current = false;
            setInteractPrompt(null);
          }
        }}
      >
        <CuboidCollider args={[1.8, 1.5, 1.8]} />
      </RigidBody>
    </group>
  );
}

// ─── MAIN 1ST FLOOR HORROR BATHROOM COMPONENT ─────────────────────────────────
export default function HorrorBathroom({ position = [10, 0, -12.5] }: { position?: [number, number, number] }) {
  const tubeLightRef = useRef<THREE.PointLight>(null);
  const flickerTimerRef = useRef(0);

  // High performance flickering tube light in useFrame (Zero GC, clamped delta)
  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    flickerTimerRef.current += dt;

    if (tubeLightRef.current) {
      if (flickerTimerRef.current > 3.0) {
        // Sudden horror stutter flicker
        const noise = Math.sin(flickerTimerRef.current * 40.0);
        if (noise > 0.6) {
          tubeLightRef.current.intensity = 2.0;
        } else {
          tubeLightRef.current.intensity = 8.5;
        }
        if (flickerTimerRef.current > 3.4) {
          flickerTimerRef.current = 0;
          tubeLightRef.current.intensity = 8.5;
        }
      }
    }
  });

  const [
    bathTilesTex,
    cinderblockTex,
    mirrorScrawlTex,
    woodPlanksTex,
    bloodyCarpetTex,
    panelTex,
  ] = useTexture([
    '/textures/bathroom_tiles.jpg',
    '/textures/cinderblock_wall.jpg',
    '/textures/mirror_scrawl.jpg',
    '/textures/rustic_wood_planks.jpg',
    '/textures/bloody_carpet.png',
    '/textures/panel.png',
  ]);

  [bathTilesTex, cinderblockTex, woodPlanksTex, bloodyCarpetTex, panelTex].forEach((tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  });

  bathTilesTex.repeat.set(4, 6);
  cinderblockTex.repeat.set(3, 2);
  woodPlanksTex.repeat.set(2, 4);
  bloodyCarpetTex.repeat.set(1.5, 3);
  panelTex.repeat.set(3, 3);

  return (
    <group position={position}>
      {/* ═══ 1. CHECKERED GRIMY BATHROOM FLOOR SLAB (10m x 15m) ═════════════ */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.02, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 15]} />
          <meshStandardMaterial map={bathTilesTex} roughness={0.35} metalness={0.15} />
        </mesh>
      </RigidBody>

      {/* Grimy Floor Rug / Runner in center (Photo 2) */}
      <mesh position={[-0.5, 0.03, -0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.2, 3.8]} />
        <meshStandardMaterial map={bloodyCarpetTex} roughness={0.9} color="#707880" />
      </mesh>

      {/* Damp gloss water puddles on tile floor */}
      {[-2.0, 1.8].map((px, i) => (
        <mesh key={`puddle-${i}`} position={[px, 0.035, i * 2.5 - 2.0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.9, 12]} />
          <meshStandardMaterial color="#0c181a" roughness={0.05} metalness={0.5} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* ═══ 2. WALLS & PARTITIONS (Height = 4.5m) ════════════════════════════ */}
      {/* North Wall (Back) */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 2.25, -7.4]}>
        <mesh receiveShadow>
          <boxGeometry args={[10, 4.5, 0.2]} />
          <meshStandardMaterial map={cinderblockTex} roughness={0.85} />
        </mesh>
      </RigidBody>

      {/* South Wall (Front) */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 2.25, 7.4]}>
        <mesh receiveShadow>
          <boxGeometry args={[10, 4.5, 0.2]} />
          <meshStandardMaterial map={cinderblockTex} roughness={0.85} />
        </mesh>
      </RigidBody>

      {/* East Outer Wall */}
      <RigidBody type="fixed" colliders="cuboid" position={[4.9, 2.25, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.2, 4.5, 15]} />
          <meshStandardMaterial map={cinderblockTex} roughness={0.85} />
        </mesh>
      </RigidBody>

      {/* West Dividing Wall Segments (with doorway at Z = 5.0) */}
      {/* Segment 1: North portion (Z = -7.5 to 4.2, length = 11.7m) */}
      <RigidBody type="fixed" colliders="cuboid" position={[-4.9, 2.25, -1.65]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.2, 4.5, 11.5]} />
          <meshStandardMaterial map={cinderblockTex} roughness={0.85} />
        </mesh>
      </RigidBody>
      {/* Segment 2: South portion (Z = 5.8 to 7.5, length = 1.7m) */}
      <RigidBody type="fixed" colliders="cuboid" position={[-4.9, 2.25, 6.65]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.2, 4.5, 1.5]} />
          <meshStandardMaterial map={cinderblockTex} roughness={0.85} />
        </mesh>
      </RigidBody>
      {/* Doorway Header Beam (Y = 3.0 to 4.5 above door) */}
      <RigidBody type="fixed" colliders="cuboid" position={[-4.9, 3.75, 5.0]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.2, 1.5, 1.8]} />
          <meshStandardMaterial map={cinderblockTex} roughness={0.85} />
        </mesh>
      </RigidBody>

      {/* Interactable Door connecting Bathroom to 1F Hallway */}
      <InteractableBathroomDoor woodTex={woodPlanksTex} />

      {/* ═══ 3. EXPOSED WALL PIPES & CONDUITS (Photo 2) ═════════════════════ */}
      <ExposedWallPipes position={[0, 3.6, -7.28]} length={9.4} />
      <ExposedWallPipes position={[0, 3.6, 7.28]} length={9.4} />

      {/* ═══ 4. CEILING & INDUSTRIAL LIGHTING ═════════════════════════════════ */}
      <CreepyCeilingLightingAndBeams flickerRef={tubeLightRef} woodPlanksTex={woodPlanksTex} />

      {/* ═══ 5. BATHROOM FURNITURE & FIXTURES (FROM PHOTOS 1, 2, 3) ════════════ */}
      {/* Dilapidated Bathtub with Moldy Shower Curtain along North Wall (Photo 2) */}
      <CreepyBathtubWithCurtain position={[3.4, 0, -5.8]} rotY={0} />

      {/* Stained Vintage Toilet in Corner (Photo 1, 2, 3) */}
      <CreepyVintageToilet position={[-3.6, 0, -6.4]} rotY={0} />

      {/* Stained Porcelain Sink with Exposed P-Trap Plumbing (Photo 2 & 3) */}
      <CreepyPorcelainSink position={[-1.2, 0, -7.0]} rotY={0} cinderTex={cinderblockTex} />

      {/* Oval Mirror, Sconce Lamp, and "YOU DON'T WANNA SEE IT AGAIN" Mirror Scrawl (Photo 1 & 2) */}
      <CreepyMirrorAndScrawl position={[-1.2, 0, -7.28]} rotY={0} scrawlTex={mirrorScrawlTex} />

      {/* Vintage Washing Machine & Laundry Area (Photo 1 & 2) */}
      <CreepyWashingMachine position={[-3.6, 0, 1.0]} rotY={Math.PI / 2} />

      {/* Wall Medicine Cabinet with Detergent Bottles & Toiletries (Photo 2 & 3) */}
      <WallMedicineCabinet position={[4.76, 2.2, -1.0]} rotY={-Math.PI / 2} />

      {/* Wall Shelf with 3 Shampoo/Chemical Bottles & Towel Bar (Photo 1) */}
      <WallShelfAndTowelBar position={[4.78, 1.8, -4.2]} rotY={-Math.PI / 2} />

      {/* Overflowing Trash Can with Crumpled Papers & Wooden Stool (Photo 2 & 3) */}
      <TrashCanAndStool position={[-2.4, 0, -6.5]} rotY={0} />
    </group>
  );
}
