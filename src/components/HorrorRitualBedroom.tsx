'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import RaviKishanCharacter from './RaviKishanCharacter';
import { useGameStore } from '@/store/useGameStore';

// ─── 1. Vaulted Ceiling Hanging Fabric Swags (Inspired by Ref Image 4) ─────────
function CeilingHangingDrapes({ clothTex }: { clothTex: THREE.Texture }) {
  return (
    <group position={[10.75, 9.6, 18.75]}>
      {/* Transverse Wooden Ceiling Support Beams */}
      {[-3.5, 0, 3.5].map((bz) => (
        <mesh key={`beam-${bz}`} position={[0, 0.2, bz]} receiveShadow>
          <boxGeometry args={[8.4, 0.2, 0.25]} />
          <meshStandardMaterial color="#1a110a" roughness={0.85} />
        </mesh>
      ))}

      {/* Draped Tattered Cloth Swags looping down across the room (Ref Image 4) */}
      {/* Drape 1: Left to Center */}
      <group position={[-2.2, -0.6, -1.8]} rotation={[0.08, 0.1, -0.2]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[0.05, 0.25, 3.8, 8, 1, true]} />
          <meshStandardMaterial map={clothTex} color="#5e6660" roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Drape 2: Right to Center Loop */}
      <group position={[2.2, -0.6, 1.2]} rotation={[-0.1, -0.15, 0.22]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[0.05, 0.28, 4.0, 8, 1, true]} />
          <meshStandardMaterial map={clothTex} color="#525c56" roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Drape 3: Central Hanging Tarp Swag */}
      <group position={[0, -0.9, 0]} rotation={[0, 0.4, 0]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[0.08, 0.35, 4.4, 8, 1, true]} />
          <meshStandardMaterial map={clothTex} color="#454f49" roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

// ─── 2. Vintage Hospital / Asylum Iron Bed with Draped Medical Sheet ───────────
function AsylumIronBed({
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
      {/* RigidBody Collider */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.45, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[2.2, 0.9, 2.6]} />
        </mesh>
      </RigidBody>

      {/* Iron Frame Base & Spring Support Rails */}
      <mesh position={[0, 0.38, 0]} receiveShadow>
        <boxGeometry args={[2.08, 0.08, 2.48]} />
        <meshStandardMaterial color="#22282a" roughness={0.65} metalness={0.8} />
      </mesh>

      {/* Stained Medical Mattress */}
      <mesh position={[0, 0.54, 0]} receiveShadow>
        <boxGeometry args={[1.96, 0.26, 2.36]} />
        <meshStandardMaterial color="#303834" roughness={0.9} />
      </mesh>

      {/* ── Antique Ward Headboard (Tubular Cast Iron with Chipped Paint) ── */}
      <group position={[0, 0, -1.22]}>
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[2.14, 0.06, 0.06]} />
          <meshStandardMaterial color="#2d3335" roughness={0.6} metalness={0.75} />
        </mesh>
        {/* Posts */}
        {[-1.02, 1.02].map((px) => (
          <group key={`aph-${px}`} position={[px, 0, 0]}>
            <mesh position={[0, 0.72, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 1.44, 8]} />
              <meshStandardMaterial color="#252a2c" roughness={0.6} metalness={0.8} />
            </mesh>
            <mesh position={[0, 1.48, 0]}>
              <sphereGeometry args={[0.065, 8, 8]} />
              <meshStandardMaterial color="#1a1e20" roughness={0.5} metalness={0.9} />
            </mesh>
          </group>
        ))}
        {/* Vertical Spindles */}
        {[-0.7, -0.35, 0, 0.35, 0.7].map((sx) => (
          <mesh key={`asph-${sx}`} position={[sx, 0.76, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.42, 6]} />
            <meshStandardMaterial color="#1c2022" roughness={0.6} metalness={0.7} />
          </mesh>
        ))}
      </group>

      {/* ── Ward Footboard ── */}
      <group position={[0, 0, 1.22]}>
        <mesh position={[0, 0.68, 0]}>
          <boxGeometry args={[2.14, 0.05, 0.05]} />
          <meshStandardMaterial color="#2d3335" roughness={0.6} metalness={0.75} />
        </mesh>
        {[-1.02, 1.02].map((px) => (
          <group key={`apf-${px}`} position={[px, 0, 0]}>
            <mesh position={[0, 0.48, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.96, 8]} />
              <meshStandardMaterial color="#252a2c" roughness={0.6} metalness={0.8} />
            </mesh>
            <mesh position={[0, 1.0, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color="#1a1e20" roughness={0.5} metalness={0.9} />
            </mesh>
          </group>
        ))}
        {[-0.6, -0.2, 0.2, 0.6].map((sx) => (
          <mesh key={`aspf-${sx}`} position={[sx, 0.48, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.36, 6]} />
            <meshStandardMaterial color="#1c2022" roughness={0.6} metalness={0.7} />
          </mesh>
        ))}
      </group>

      {/* ── Rumpled Stained Medical Sheets (Ref Image 3 & 4) ── */}
      <mesh position={[0, 0.64, 0.1]} receiveShadow>
        <boxGeometry args={[2.02, 0.1, 2.22]} />
        <meshStandardMaterial map={clothTex} color="#b8b2a4" roughness={0.92} />
      </mesh>

      {/* Stained Drape hanging down left side towards floorboards (Ref Image 3) */}
      <mesh position={[-0.98, 0.4, 0.2]} rotation={[0, 0, -0.2]} receiveShadow>
        <boxGeometry args={[0.18, 0.52, 1.85]} />
        <meshStandardMaterial map={clothTex} color="#a09a8c" roughness={0.95} />
      </mesh>

      {/* Leather Restraint Straps Hanging Off Side Rail */}
      {[-0.4, 0.4].map((sz) => (
        <mesh key={`strap-${sz}`} position={[1.02, 0.3, sz]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.03, 0.36, 0.08]} />
          <meshStandardMaterial color="#2a180e" roughness={0.8} />
        </mesh>
      ))}

      {/* Pillows */}
      <mesh position={[0, 0.76, -0.85]} rotation={[0.18, 0, 0]} receiveShadow>
        <boxGeometry args={[1.4, 0.18, 0.5]} />
        <meshStandardMaterial map={clothTex} color="#8a8478" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ─── 3. Occult Ritual Altar & Seance Table with Pulsing Sigil & Candles ─────────
function OccultAltarTable({
  position,
  sigilTex,
  woodTex,
}: {
  position: [number, number, number];
  sigilTex: THREE.Texture;
  woodTex: THREE.Texture;
}) {
  const occultLightRef = useRef<THREE.PointLight>(null);
  const sigilMeshRef = useRef<THREE.Mesh>(null);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;

    // Menacing rhythmic pulsing occult glow
    const pulse = 7.0 + Math.sin(t * 2.2) * 3.0 + Math.sin(t * 5.7) * 1.2;
    if (occultLightRef.current) {
      occultLightRef.current.intensity = THREE.MathUtils.lerp(occultLightRef.current.intensity, pulse, dt * 8);
    }
    if (sigilMeshRef.current) {
      const mat = sigilMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.4 + Math.sin(t * 2.2) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* ── Floor Glowing Occult Sigil Circle ── */}
      <mesh ref={sigilMeshRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 3.2]} />
        <meshStandardMaterial
          map={sigilTex}
          color="#aa1111"
          emissive="#770000"
          emissiveIntensity={0.6}
          roughness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Red Ritual Light Source (castShadow=false strictly for 60fps) */}
      <pointLight
        ref={occultLightRef}
        position={[0, 1.2, 0]}
        intensity={8.0}
        distance={7.0}
        color="#ff1a1a"
        castShadow={false}
      />

      {/* ── Ritual Altar Table ── */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.48, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[1.8, 1.0, 1.1]} />
        </mesh>
      </RigidBody>

      {/* Heavy Carved Dark Oak Tabletop */}
      <mesh position={[0, 0.82, 0]} receiveShadow>
        <boxGeometry args={[1.74, 0.08, 1.04]} />
        <meshStandardMaterial map={woodTex} color="#1c0b05" roughness={0.85} />
      </mesh>

      {/* 4 Thick Carved Table Legs */}
      {[-0.75, 0.75].map((lx) =>
        [-0.42, 0.42].map((lz) => (
          <mesh key={`aleg-${lx}-${lz}`} position={[lx, 0.42, lz]} receiveShadow>
            <boxGeometry args={[0.1, 0.8, 0.1]} />
            <meshStandardMaterial map={woodTex} color="#140703" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* ── Altar Ritual Relics & Props ── */}
      {/* Horned Ram / Occult Skull in Table Center */}
      <group position={[0, 0.95, 0]} rotation={[0.1, 0, 0]}>
        {/* Cranium */}
        <mesh>
          <sphereGeometry args={[0.13, 8, 8]} scale={[1.0, 0.8, 1.3]} />
          <meshStandardMaterial color="#ded5be" roughness={0.7} />
        </mesh>
        {/* Snout */}
        <mesh position={[0, -0.04, 0.14]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.1, 0.08, 0.16]} />
          <meshStandardMaterial color="#cfc5ab" roughness={0.7} />
        </mesh>
        {/* Curved Horns */}
        {[-0.14, 0.14].map((hx, idx) => (
          <mesh key={`horn-${idx}`} position={[hx, 0.08, -0.06]} rotation={[0.4, idx === 0 ? -0.6 : 0.6, 0]}>
            <cylinderGeometry args={[0.02, 0.05, 0.28, 6]} />
            <meshStandardMaterial color="#4a3e30" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Ceremonial Obsidian Athame Dagger */}
      <group position={[-0.45, 0.87, 0.15]} rotation={[0, 0.8, 0]}>
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[0.035, 0.008, 0.22]} />
          <meshStandardMaterial color="#1a2024" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[0.03, 0.02, 0.08]} />
          <meshStandardMaterial color="#8a6e2e" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>

      {/* Spilled Brass Chalice with Dried Red Crust */}
      <group position={[0.48, 0.89, -0.15]} rotation={[Math.PI / 2, 0, -0.7]}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.03, 0.14, 8]} />
          <meshStandardMaterial color="#947a32" metalness={0.85} roughness={0.35} />
        </mesh>
        {/* Spilled Dark Red Pool */}
        <mesh position={[0.06, 0, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.12, 8]} />
          <meshStandardMaterial color="#500000" roughness={0.3} />
        </mesh>
      </group>

      {/* 7 Crimson Ritual Taper Candles Around the Altar Edge */}
      {[
        { x: -0.68, z: -0.38, h: 0.24 },
        { x: -0.25, z: -0.42, h: 0.18 },
        { x: 0.25, z: -0.42, h: 0.28 },
        { x: 0.68, z: -0.38, h: 0.16 },
        { x: -0.68, z: 0.38, h: 0.22 },
        { x: 0.68, z: 0.38, h: 0.2 },
        { x: 0, z: 0.42, h: 0.26 },
      ].map((c, idx) => (
        <group key={`candle-${idx}`} position={[c.x, 0.86, c.z]}>
          {/* Melted Wax Base */}
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.06, 0.07, 0.02, 8]} />
            <meshStandardMaterial color="#4a0005" roughness={0.9} />
          </mesh>
          {/* Candle Column */}
          <mesh position={[0, c.h / 2, 0]}>
            <cylinderGeometry args={[0.025, 0.03, c.h, 6]} />
            <meshStandardMaterial color="#7a080e" roughness={0.85} />
          </mesh>
          {/* Glowing Flame */}
          <mesh position={[0, c.h + 0.03, 0]}>
            <sphereGeometry args={[0.018, 6, 6]} scale={[0.8, 1.6, 0.8]} />
            <meshBasicMaterial color="#ff3300" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── 4. Weathered Medical Apothecary Cabinet (Inspired by Ref Image 3) ─────────
function ApothecaryCabinet({
  position,
  rotY = 0,
  woodTex,
}: {
  position: [number, number, number];
  rotY?: number;
  woodTex: THREE.Texture;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* RigidBody Collider */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1.4, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[1.5, 2.8, 0.7]} />
        </mesh>
      </RigidBody>

      {/* Outer Dark Wood Cabinet Frame */}
      <mesh position={[0, 1.4, 0]} receiveShadow>
        <boxGeometry args={[1.45, 2.76, 0.65]} />
        <meshStandardMaterial map={woodTex} color="#22150d" roughness={0.8} />
      </mesh>

      {/* Inner Recessed Shelves Cavity */}
      <mesh position={[0, 1.5, 0.08]}>
        <boxGeometry args={[1.28, 2.3, 0.5]} />
        <meshStandardMaterial color="#0e0805" roughness={0.95} />
      </mesh>

      {/* Glass Front Door Panels with Grime */}
      {[-0.32, 0.32].map((gx, idx) => (
        <mesh key={`cglass-${idx}`} position={[gx, 1.5, 0.33]}>
          <planeGeometry args={[0.58, 2.25]} />
          <meshStandardMaterial
            color="#8ab0b8"
            transparent
            opacity={0.35}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      ))}

      {/* Specimen Jars & Apothecary Jars on Shelves (Ref Image 3) */}
      {[0.75, 1.25, 1.75, 2.2].map((sy, rowIdx) => (
        <group key={`shelf-jars-${rowIdx}`} position={[0, sy, 0.12]}>
          {/* Shelf Plank */}
          <mesh position={[0, -0.02, 0]}>
            <boxGeometry args={[1.26, 0.04, 0.45]} />
            <meshStandardMaterial map={woodTex} color="#2b1a10" roughness={0.85} />
          </mesh>

          {/* Row of Jars & Bottles */}
          {[-0.45, -0.15, 0.15, 0.45].map((jx, colIdx) => (
            <group key={`jar-${rowIdx}-${colIdx}`} position={[jx, 0.1, 0]}>
              <mesh>
                <cylinderGeometry args={[0.04, 0.04, 0.18, 8]} />
                <meshStandardMaterial
                  color={colIdx % 2 === 0 ? '#1b4030' : '#4a2c10'}
                  transparent
                  opacity={0.8}
                  roughness={0.2}
                  metalness={0.3}
                />
              </mesh>
              {/* Cork Stopper */}
              <mesh position={[0, 0.11, 0]}>
                <cylinderGeometry args={[0.03, 0.035, 0.04, 6]} />
                <meshStandardMaterial color="#8a6840" roughness={0.9} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

// ─── 5. Creepy Wall Sconce & Hanging Trenchcoat / Tarp (Ref Image 3) ───────────
function WallSconceAndCoat({
  position,
  rotY = 0,
  clothTex,
}: {
  position: [number, number, number];
  rotY?: number;
  clothTex: THREE.Texture;
}) {
  const sconceLightRef = useRef<THREE.PointLight>(null);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    if (sconceLightRef.current) {
      const t = state.clock.elapsedTime * 4;
      const flicker = 6.5 + Math.sin(t * 1.9) * Math.cos(t * 2.8) * 1.5 + (Math.random() - 0.5) * 0.7;
      sconceLightRef.current.intensity = THREE.MathUtils.lerp(sconceLightRef.current.intensity, flicker, dt * 10);
    }
  });

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* ── Victorian Iron Wall Sconce (From Reference Image 3) ── */}
      <group position={[0, 0, 0]}>
        {/* Wall Mounting Plate */}
        <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.04, 8]} />
          <meshStandardMaterial color="#1a1816" roughness={0.7} metalness={0.8} />
        </mesh>
        {/* Curved Sconce Arm */}
        <mesh position={[0, 0.08, 0.15]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.28, 6]} />
          <meshStandardMaterial color="#1a1816" roughness={0.7} metalness={0.8} />
        </mesh>
        {/* Bulb Glass Hurricane Chimney */}
        <mesh position={[0, 0.24, 0.22]}>
          <cylinderGeometry args={[0.06, 0.04, 0.22, 8, 1, true]} />
          <meshStandardMaterial color="#fceabb" transparent opacity={0.6} roughness={0.1} />
        </mesh>
        {/* Glowing Filament */}
        <mesh position={[0, 0.22, 0.22]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#ffeedd" emissive="#ff9922" emissiveIntensity={2.5} />
        </mesh>

        {/* Warm Moody Wall Light */}
        <pointLight
          ref={sconceLightRef}
          position={[0, 0.24, 0.35]}
          intensity={7.0}
          distance={7.0}
          color="#ffaa44"
          castShadow={false}
        />
      </group>

      {/* ── Hanging Weathered Trenchcoat / Tarp (Directly from Ref Image 3) ── */}
      <group position={[1.4, -0.3, 0.05]}>
        {/* Wall Hook */}
        <mesh position={[0, 0.72, 0]}>
          <boxGeometry args={[0.06, 0.12, 0.08]} />
          <meshStandardMaterial color="#2a2018" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Coat Shoulders */}
        <mesh position={[0, 0.58, 0.08]} rotation={[0.1, 0, 0]} receiveShadow>
          <boxGeometry args={[0.55, 0.2, 0.18]} />
          <meshStandardMaterial map={clothTex} color="#484e46" roughness={0.95} />
        </mesh>
        {/* Hanging Coat Body with Heavy Folds */}
        <mesh position={[0, -0.15, 0.12]} rotation={[0.05, 0, 0]} receiveShadow>
          <cylinderGeometry args={[0.26, 0.42, 1.35, 8, 1, true]} />
          <meshStandardMaterial map={clothTex} color="#3c423b" roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ── Antique Wall Clock (Ref Image 3) ── */}
      <group position={[-1.4, 0.2, 0.05]}>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
          <cylinderGeometry args={[0.3, 0.32, 0.08, 12]} />
          <meshStandardMaterial color="#1a1109" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <circleGeometry args={[0.25, 12]} />
          <meshStandardMaterial color="#d8cfb8" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// ─── 6. Barred Gothic Arched Moonlit Window (Back Wall at Z = 25.2) ───────────
function BarredGothicWindow({
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
      {/* Heavy Gothic Stone/Timber Arch Frame */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[2.2, 2.8, 0.16]} />
        <meshStandardMaterial color="#181a1c" roughness={0.9} />
      </mesh>

      {/* Grimed Glass with Eerie Cold Moonlight Glow */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[1.85, 2.45]} />
        <meshStandardMaterial
          map={windowTex}
          color="#527d99"
          emissive="#2a5575"
          emissiveIntensity={1.5}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Vertical Cast-Iron Asylum Safety Bars */}
      {[-0.6, -0.3, 0, 0.3, 0.6].map((bx) => (
        <mesh key={`bar-${bx}`} position={[bx, 0, 0.08]}>
          <cylinderGeometry args={[0.02, 0.02, 2.45, 6]} />
          <meshStandardMaterial color="#111518" metalness={0.9} roughness={0.4} />
        </mesh>
      ))}

      {/* Horizontal Bar Reinforcements */}
      {[-0.5, 0.5].map((by) => (
        <mesh key={`hbar-${by}`} position={[0, by, 0.09]}>
          <boxGeometry args={[1.85, 0.04, 0.03]} />
          <meshStandardMaterial color="#111518" metalness={0.9} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// ─── 7. Ritual Room Floor Debris & Occult Relics ───────────────────────────────
function RitualRoomDebris({
  woodTex,
}: {
  woodTex: THREE.Texture;
}) {
  return (
    <group position={[0, 5.01, 0]}>
      {/* Scattered Torn Spell Pages / Grimoire Parchments */}
      {[
        { x: 9.4, z: 17.5, r: 0.3 },
        { x: 12.1, z: 14.8, r: -0.6 },
        { x: 8.8, z: 22.2, r: 1.1 },
        { x: 12.8, z: 18.9, r: -0.9 },
      ].map((p, idx) => (
        <mesh key={`page-${idx}`} position={[p.x, 0.008, p.z]} rotation={[-Math.PI / 2, 0, p.r]}>
          <planeGeometry args={[0.3, 0.4]} />
          <meshStandardMaterial color="#dfd2b5" roughness={0.9} />
        </mesh>
      ))}

      {/* Loose Distressed Wooden Planks */}
      {[
        { x: 13.2, z: 21.5, r: 0.8 },
        { x: 8.5, z: 19.8, r: -0.4 },
      ].map((pl, idx) => (
        <mesh key={`rplank-${idx}`} position={[pl.x, 0.015, pl.z]} rotation={[-Math.PI / 2, 0, pl.r]}>
          <planeGeometry args={[0.85, 0.16]} />
          <meshStandardMaterial map={woodTex} color="#20150d" roughness={0.9} />
        </mesh>
      ))}

      {/* Creepy Animal Horn Relic in Corner */}
      <mesh position={[14.1, 0.12, 13.8]} rotation={[0.4, 0.8, -0.5]}>
        <coneGeometry args={[0.08, 0.42, 6]} />
        <meshStandardMaterial color="#d0c6b0" roughness={0.7} />
      </mesh>
    </group>
  );
}

// ─── MAIN SE HORROR RITUAL BEDROOM COMPONENT ──────────────────────────────────
export default function HorrorRitualBedroom() {
  const isRitualJumpscareTriggered = useGameStore((s) => s.isRitualJumpscareTriggered);
  const triggerRitualJumpscare = useGameStore((s) => s.triggerRitualJumpscare);
  const isRitualRaviDisappeared = useGameStore((s) => s.isRitualRaviDisappeared);

  const [wardWallTex, bedClothTex, sigilTex, floorWoodTex, windowTex] = useTexture([
    '/textures/occult_ward_wall.jpg',
    '/textures/stained_bed_cloth.jpg',
    '/textures/occult_sigil_glow.jpg',
    '/textures/rustic_wood_planks.jpg',
    '/textures/frosted_horror_window.jpg',
  ]);

  useMemo(() => {
    wardWallTex.wrapS = THREE.RepeatWrapping;
    wardWallTex.wrapT = THREE.RepeatWrapping;
    wardWallTex.repeat.set(2.5, 1.8);

    bedClothTex.wrapS = THREE.RepeatWrapping;
    bedClothTex.wrapT = THREE.RepeatWrapping;
    bedClothTex.repeat.set(1.5, 1.5);

    floorWoodTex.wrapS = THREE.RepeatWrapping;
    floorWoodTex.wrapT = THREE.RepeatWrapping;
    floorWoodTex.repeat.set(4, 4);
  }, [wardWallTex, bedClothTex, floorWoodTex]);

  // Fail-safe coordinate trigger for 2F Ritual Bedroom
  useFrame((state) => {
    const store = useGameStore.getState();
    if (store.gameState === 'playing' && !store.isRitualJumpscareTriggered) {
      const px = state.camera.position.x;
      const py = state.camera.position.y;
      const pz = state.camera.position.z;
      // 2F Ritual Bedroom bounding box: X in [7.2, 14.5], Z in [13.0, 24.5], Y in [4.5, 9.0]
      if (px >= 7.2 && px <= 14.5 && pz >= 13.0 && pz <= 24.5 && py >= 4.5) {
        store.triggerRitualJumpscare();
      }
    }
  });

  return (
    <group>
      {/* ── Room Interior Wall Surface Decor & Occult Runes Plaster Overlays ── */}
      {/* Outer East Wall Occult Murals (X = 15.0) */}
      <mesh position={[14.98, 7.5, 18.75]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[12.4, 4.9]} />
        <meshStandardMaterial map={wardWallTex} roughness={0.9} />
      </mesh>

      {/* Back South Wall Occult Murals (Z = 25.48) */}
      <mesh position={[10.75, 7.5, 25.48]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[8.4, 4.9]} />
        <meshStandardMaterial map={wardWallTex} roughness={0.9} />
      </mesh>

      {/* North Dividing Wall Occult Murals (Z = 12.52) */}
      <mesh position={[10.75, 7.5, 12.52]} receiveShadow>
        <planeGeometry args={[8.4, 4.9]} />
        <meshStandardMaterial map={wardWallTex} roughness={0.9} />
      </mesh>

      {/* ── 1. Vaulted Ceiling Hanging Fabric Swags (Ref Image 4) ── */}
      <CeilingHangingDrapes clothTex={bedClothTex} />

      {/* ── 2. Vintage Hospital / Asylum Iron Bed with Draped Sheet ── */}
      <AsylumIronBed
        position={[11.0, 5.0, 20.2]}
        rotY={0}
        clothTex={bedClothTex}
      />

      {/* ── 3. Occult Ritual Altar & Pulsing Sigil Circle ── */}
      <OccultAltarTable
        position={[10.75, 5.0, 15.4]}
        sigilTex={sigilTex}
        woodTex={floorWoodTex}
      />

      {/* ── 4. Weathered Medical Apothecary Cabinet ── */}
      <ApothecaryCabinet
        position={[14.4, 5.0, 23.6]}
        rotY={-Math.PI / 2}
        woodTex={floorWoodTex}
      />

      {/* ── 5. Creepy Wall Sconce & Hanging Trenchcoat / Clock (Ref Image 3) ── */}
      <WallSconceAndCoat
        position={[14.8, 7.2, 18.5]}
        rotY={-Math.PI / 2}
        clothTex={bedClothTex}
      />

      {/* ── 6. Barred Gothic Arched Moonlit Window ── */}
      <BarredGothicWindow
        position={[10.75, 7.5, 25.45]}
        windowTex={windowTex}
        woodTex={floorWoodTex}
      />

      {/* ── 7. Floor Debris, Torn Pages & Detailing ── */}
      <RitualRoomDebris woodTex={floorWoodTex} />

      {/* ═══ 8. RAVI KISHAN HORROR CHARACTER (Standing in Ritual Room) ═════ */}
      {!isRitualRaviDisappeared && (
        <RaviKishanCharacter
          position={[10.75, 5.0, 17.5]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={1.05}
        />
      )}

      {/* ── 9. Ritual Room Entry Jumpscare Sensor Threshold ── */}
      {!isRitualJumpscareTriggered && (
        <RigidBody
          type="fixed"
          position={[7.5, 6.2, 17.0]}
          sensor
          onIntersectionEnter={(e) => {
            if (e.other.rigidBodyObject?.name === 'player') {
              const store = useGameStore.getState();
              if (!store.isRitualJumpscareTriggered) {
                store.triggerRitualJumpscare();
              }
            }
          }}
        >
          <mesh visible={false}>
            <boxGeometry args={[1.5, 2.8, 3.0]} />
          </mesh>
        </RigidBody>
      )}
    </group>
  );
}
