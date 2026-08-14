'use client';

import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '@/store/useGameStore';
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Mesh } from 'three';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import HorrorKitchen from './HorrorKitchen';
import LobbyLights from './LobbyLights';

const doorAudio = typeof window !== 'undefined' ? new Audio('/stairs and doors.mp3') : null;

function playDoorUnlock() {
  if (typeof window === 'undefined' || !doorAudio) return;
  doorAudio.currentTime = 0;
  doorAudio.play().catch(() => {});
}

// ─── Washroom Mirror ──────────────────────────────────────────────────────────
function WashroomMirror({ position, rotY }: { position: [number, number, number]; rotY: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Mirror frame */}
      <mesh castShadow>
        <boxGeometry args={[2.2, 2.2, 0.06]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Reflective mirror surface */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[1.9, 1.9]} />
        <meshStandardMaterial
          metalness={0.98}
          roughness={0.06}
          color="#d5e2e8"
        />
      </mesh>
      {/* Subtle light above mirror */}
      <pointLight position={[0, 1.3, 0.5]} intensity={8} distance={5} color="#ffe8d0" />
    </group>
  );
}

// ─── Bathroom Toilet ─────────────────────────────────────────────────────────
function Toilet({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.5, 0.44, 0.6]} />
        <meshStandardMaterial color="#dde8ee" roughness={0.3} />
      </mesh>
      {/* Tank */}
      <mesh position={[0, 0.72, -0.18]} castShadow>
        <boxGeometry args={[0.44, 0.5, 0.22]} />
        <meshStandardMaterial color="#dde8ee" roughness={0.3} />
      </mesh>
      {/* Seat rim */}
      <mesh position={[0, 0.46, 0.04]} castShadow>
        <torusGeometry args={[0.18, 0.04, 8, 24]} />
        <meshStandardMaterial color="#c8d8e0" roughness={0.4} />
      </mesh>
    </group>
  );
}

// ─── Bathroom Sink ────────────────────────────────────────────────────────────
function Sink({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Basin */}
      <mesh position={[0, 0.88, 0]} castShadow>
        <boxGeometry args={[0.5, 0.18, 0.4]} />
        <meshStandardMaterial color="#dde8ee" roughness={0.2} />
      </mesh>
      {/* Pedestal */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.72, 10]} />
        <meshStandardMaterial color="#dde8ee" roughness={0.3} />
      </mesh>
      {/* Tap */}
      <mesh position={[0, 1.0, -0.12]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
        <meshStandardMaterial color="#b0b0b0" roughness={0.1} metalness={0.8} />
      </mesh>
    </group>
  );
}

// ─── Bedroom Bed ──────────────────────────────────────────────────────────────
function Bed({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Frame */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.28, 2.2]} />
        <meshStandardMaterial color="#5c3010" roughness={0.8} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.16, 2.0]} />
        <meshStandardMaterial color="#c8b89a" roughness={0.9} />
      </mesh>
      {/* Pillow */}
      <mesh position={[0, 0.52, -0.8]} castShadow>
        <boxGeometry args={[1.0, 0.12, 0.4]} />
        <meshStandardMaterial color="#f0e8d8" roughness={0.9} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 0.7, -1.1]} castShadow>
        <boxGeometry args={[1.4, 0.9, 0.1]} />
        <meshStandardMaterial color="#5c3010" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ─── Desk ────────────────────────────────────────────────────────────────────
function Desk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Top */}
      <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.06, 0.55]} />
        <meshStandardMaterial color="#6b3a1a" roughness={0.7} />
      </mesh>
      {/* Legs */}
      {([-0.48, 0.48] as number[]).flatMap((x) =>
        ([-0.22, 0.22] as number[]).map((z, j) => (
          <mesh key={`${x}-${z}`} position={[x, 0.35, z]} castShadow>
            <boxGeometry args={[0.06, 0.72, 0.06]} />
            <meshStandardMaterial color="#4a2a0e" roughness={0.8} />
          </mesh>
        ))
      )}
      {/* Candle on desk */}
      <mesh position={[0.3, 0.82, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.18, 8]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.9} />
      </mesh>
      <pointLight position={[0.3, 0.92, 0]} intensity={4} distance={3} color="#ff9922" />
    </group>
  );
}

function InteractableKitchenGate({ wallTex }: { wallTex: THREE.Texture }) {
  const { setInteractPrompt } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const canInteractRef = useRef(false);
  const gateRef = useRef<RapierRigidBody>(null);
  const pivotRef = useRef<THREE.Group>(null);
  
  isOpenRef.current = isOpen;

  const playGateSound = () => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/stairs and doors.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  };

  useFrame((_, delta) => {
    if (pivotRef.current) {
      const targetRotation = isOpen ? Math.PI / 1.8 : 0;
      pivotRef.current.rotation.y += (targetRotation - pivotRef.current.rotation.y) * delta * 5;
      
      if (gateRef.current) {
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, pivotRef.current.rotation.y, 0));
        gateRef.current.setNextKinematicRotation(q);
      }
    }
  });

  useEffect(() => {
    const handleKey = (evt: KeyboardEvent) => {
      if (evt.code === 'KeyE' && canInteractRef.current) {
        playGateSound();
        const next = !isOpenRef.current;
        setIsOpen(next);
        isOpenRef.current = next;
        setInteractPrompt(next ? 'Press E to Close Gate' : 'Press E to Open Gate');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setInteractPrompt]);

  return (
    <group position={[-5, 0, -7.5]}>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 3.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.5, 1, 2]} />
          <meshStandardMaterial map={wallTex} />
        </mesh>
      </RigidBody>
      
      <group position={[0, 1.5, -0.9]} ref={pivotRef}>
        <RigidBody ref={gateRef} type="kinematicPosition" colliders="cuboid" position={[0, 0, 0.9]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.1, 3, 1.8]} />
            <meshStandardMaterial color="#1a0a00" roughness={0.9} />
          </mesh>
        </RigidBody>
      </group>

      <RigidBody
        type="fixed"
        position={[0, 1.5, 0]}
        sensor
        onIntersectionEnter={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            canInteractRef.current = true;
            setInteractPrompt(isOpenRef.current ? 'Press E to Close Gate' : 'Press E to Open Gate');
          }
        }}
        onIntersectionExit={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            canInteractRef.current = false;
            setInteractPrompt(null);
          }
        }}
      >
        <CuboidCollider args={[2, 1.5, 2]} />
      </RigidBody>
    </group>
  );
}



// ─── Creepy Main Entrance Door ────────────────────────────────────────────────
function CreepyMainDoor({ hasKey, bloodTex }: { hasKey: boolean; bloodTex: THREE.Texture }) {
  return (
    <group position={[0, 0, -19.85]}>
      {/* Heavy Gothic Stone Outer Arch Frame */}
      {/* Left Frame Post */}
      <mesh position={[-2.6, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 5.2, 0.6]} />
        <meshStandardMaterial color="#1a1816" roughness={0.9} />
      </mesh>
      {/* Right Frame Post */}
      <mesh position={[2.6, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 5.2, 0.6]} />
        <meshStandardMaterial color="#1a1816" roughness={0.9} />
      </mesh>
      {/* Top Header Beam */}
      <mesh position={[0, 5.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.8, 0.6, 0.7]} />
        <meshStandardMaterial color="#1a1816" roughness={0.9} />
      </mesh>
      {/* Gothic Keystone Emblem at Arch Peak */}
      <mesh position={[0, 5.6, 0.1]} castShadow>
        <boxGeometry args={[0.9, 0.7, 0.8]} />
        <meshStandardMaterial color="#2c2824" roughness={0.8} />
      </mesh>
      {/* Skull detail on Keystone */}
      <mesh position={[0, 5.6, 0.52]} castShadow>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#0d0b0a" roughness={0.5} />
      </mesh>

      {/* Double Gothic Doors (Left & Right Leaves) */}
      {/* Left Door Leaf */}
      <group position={[-1.18, 2.4, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.3, 4.8, 0.2]} />
          <meshStandardMaterial color="#23130c" roughness={0.8} />
        </mesh>
        {/* Recessed Panels */}
        <mesh position={[0, 1.1, 0.05]} castShadow>
          <boxGeometry args={[1.7, 1.8, 0.06]} />
          <meshStandardMaterial color="#180c07" roughness={0.9} />
        </mesh>
        <mesh position={[0, -1.1, 0.05]} castShadow>
          <boxGeometry args={[1.7, 1.8, 0.06]} />
          <meshStandardMaterial color="#180c07" roughness={0.9} />
        </mesh>
        {/* Vertical Wood Plank Grooves */}
        {[-0.6, 0, 0.6].map((x, idx) => (
          <mesh key={`l-plank-${idx}`} position={[x, 0, 0.11]}>
            <boxGeometry args={[0.04, 4.6, 0.02]} />
            <meshStandardMaterial color="#0f0704" roughness={1} />
          </mesh>
        ))}
        {/* Iron Strap Hinges */}
        {[1.3, -1.3].map((y, idx) => (
          <group key={`l-hinge-${idx}`} position={[-0.3, y, 0.12]}>
            <mesh castShadow>
              <boxGeometry args={[1.4, 0.14, 0.04]} />
              <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.4} />
            </mesh>
            {[-0.5, 0, 0.5].map((rx, rIdx) => (
              <mesh key={`r-${rIdx}`} position={[rx, 0, 0.03]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.3} />
              </mesh>
            ))}
          </group>
        ))}
        {/* Iron Ring Handle / Knocker */}
        <mesh position={[0.8, 0, 0.14]} castShadow>
          <torusGeometry args={[0.16, 0.03, 10, 20]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.2} />
        </mesh>
      </group>

      {/* Right Door Leaf */}
      <group position={[1.18, 2.4, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.3, 4.8, 0.2]} />
          <meshStandardMaterial color="#23130c" roughness={0.8} />
        </mesh>
        {/* Recessed Panels */}
        <mesh position={[0, 1.1, 0.05]} castShadow>
          <boxGeometry args={[1.7, 1.8, 0.06]} />
          <meshStandardMaterial color="#180c07" roughness={0.9} />
        </mesh>
        <mesh position={[0, -1.1, 0.05]} castShadow>
          <boxGeometry args={[1.7, 1.8, 0.06]} />
          <meshStandardMaterial color="#180c07" roughness={0.9} />
        </mesh>
        {/* Vertical Wood Plank Grooves */}
        {[-0.6, 0, 0.6].map((x, idx) => (
          <mesh key={`r-plank-${idx}`} position={[x, 0, 0.11]}>
            <boxGeometry args={[0.04, 4.6, 0.02]} />
            <meshStandardMaterial color="#0f0704" roughness={1} />
          </mesh>
        ))}
        {/* Iron Strap Hinges */}
        {[1.3, -1.3].map((y, idx) => (
          <group key={`r-hinge-${idx}`} position={[0.3, y, 0.12]}>
            <mesh castShadow>
              <boxGeometry args={[1.4, 0.14, 0.04]} />
              <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.4} />
            </mesh>
            {[-0.5, 0, 0.5].map((rx, rIdx) => (
              <mesh key={`rr-${rIdx}`} position={[rx, 0, 0.03]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.3} />
              </mesh>
            ))}
          </group>
        ))}
        {/* Iron Ring Handle / Knocker */}
        <mesh position={[-0.8, 0, 0.14]} castShadow>
          <torusGeometry args={[0.16, 0.03, 10, 20]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.2} />
        </mesh>
      </group>

      {/* Central Lockplate Escutcheon & Keyhole */}
      <group position={[0, 2.2, 0.14]}>
        {/* Heavy Iron Lock Plate */}
        <mesh castShadow>
          <boxGeometry args={[0.35, 0.7, 0.04]} />
          <meshStandardMaterial color="#151515" metalness={0.9} roughness={0.3} />
        </mesh>
        {/* Keyhole Rim */}
        <mesh position={[0, 0.05, 0.025]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial color={hasKey ? '#ffd700' : '#8b0000'} emissive={hasKey ? '#ffd700' : '#330000'} emissiveIntensity={hasKey ? 0.8 : 0.2} />
        </mesh>
        {/* Keyhole Slit */}
        <mesh position={[0, -0.02, 0.026]}>
          <planeGeometry args={[0.03, 0.08]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Ominous Keyhole Light Glow */}
        <pointLight position={[0, 0, 0.3]} intensity={hasKey ? 12 : 4} distance={3} color={hasKey ? '#ffd700' : '#ff2200'} />
      </group>

      {/* Blood Stain Decal across Door */}
      <mesh position={[-0.4, 2.0, 0.12]} rotation={[0, 0, -0.3]}>
        <planeGeometry args={[1.6, 2.2]} />
        <meshStandardMaterial map={bloodTex} transparent opacity={0.65} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─── Main Mansion Component ───────────────────────────────────────────────────
export default function Mansion() {
  const { hasKey, setHasKey, setInteractPrompt, setGameState, isKitchenJumpscareTriggered, triggerKitchenJumpscare } = useGameStore();
  const flickLightRef = useRef<THREE.PointLight>(null);
  const flickLight2Ref = useRef<THREE.PointLight>(null);

  const [canInteractKey, setCanInteractKey] = useState(false);
  const [canInteractDoor, setCanInteractDoor] = useState(false);

  const keyRef = useRef<Mesh>(null);
  useFrame(() => {
    if (keyRef.current) {
      keyRef.current.rotation.y += 0.02;
      keyRef.current.position.y = 5.5 + Math.sin(Date.now() * 0.005) * 0.1;
    }
    if (flickLightRef.current) {
      if (Math.random() > 0.9) {
        flickLightRef.current.intensity = 5 + Math.random() * 40;
      }
    }
    if (flickLight2Ref.current) {
      if (Math.random() > 0.92) {
        flickLight2Ref.current.intensity = 2 + Math.random() * 20;
      }
    }
  });

  const [floorTex, wallTex, panelTex, bloodTex, tileTex, grungeWallTex] = useTexture([
    '/textures/floor.png',
    '/textures/wallpaper.png',
    '/textures/panel.png',
    '/textures/bloody_carpet.png',
    '/textures/floor.png', // reuse floor as tile for washrooms
    '/textures/grunge_concrete_wall.jpg',
  ]);

  [floorTex, wallTex, panelTex, bloodTex, tileTex, grungeWallTex].forEach((tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  });

  floorTex.repeat.set(10, 10);
  wallTex.repeat.set(15, 3);
  panelTex.repeat.set(5, 5);
  bloodTex.repeat.set(4, 4);
  tileTex.repeat.set(3, 3);
  grungeWallTex.repeat.set(3, 2);

  // Wall helper: a simple fixed RigidBody wall
  const Wall = ({
    pos, size, texMap = wallTex,
  }: { pos: [number, number, number]; size: [number, number, number]; texMap?: THREE.Texture }) => (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial map={texMap} roughness={0.9} />
      </mesh>
    </RigidBody>
  );

  return (
    <group>
      {/* ═══ LIGHTING & CREEPY LOBBY LIGHTS ════════════════════════════════ */}
      <LobbyLights />
      {/* Bedroom 1 */}
      <pointLight position={[-8, 8.5, 18]} intensity={10} distance={10} color="#ffaa44" />
      {/* Bedroom 2 */}
      <pointLight ref={flickLight2Ref} position={[8, 8.5, 18]} intensity={15} distance={10} color="#ff6633" />

      {/* ═══ GROUND FLOOR ════════════════════════════════════════════════════ */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[30, 40]} />
          <meshStandardMaterial map={bloodTex} roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* ═══ GRAND STAIRCASE ════════════════════════════════════════════════ */}
      <group>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={`stair-${i}`} position={[0, i * 0.5 + 0.25, 10 + i]} receiveShadow castShadow>
            <boxGeometry args={[8, 0.5, 1]} />
            <meshStandardMaterial map={floorTex} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Invisible Ramp Collider */}
      <RigidBody type="fixed" colliders={false} position={[0, 2.475, 14.25]} rotation={[-Math.atan2(5.05, 10.5), 0, 0]}>
        <CuboidCollider args={[4, 0.1, 5.825]} friction={0} />
      </RigidBody>

      {/* ═══ SECOND FLOOR PLATFORM (stairwell opening x=-4.5 to 4.5, z=9.5 to 19.5) ═══ */}
      {/* 1) South section — full width, z=-5 to 9.5 */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 4.75, 2.25]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[30, 0.5, 14.5]} />
          <meshStandardMaterial map={floorTex} roughness={0.5} />
        </mesh>
      </RigidBody>
      {/* 2) Left wing — x=-15 to -4.5, z=9.5 to 25.5 */}
      <RigidBody type="fixed" colliders="cuboid" position={[-9.75, 4.75, 17.5]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[10.5, 0.5, 16]} />
          <meshStandardMaterial map={floorTex} roughness={0.5} />
        </mesh>
      </RigidBody>
      {/* 3) Right wing — x=4.5 to 15, z=9.5 to 25.5 */}
      <RigidBody type="fixed" colliders="cuboid" position={[9.75, 4.75, 17.5]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[10.5, 0.5, 16]} />
          <meshStandardMaterial map={floorTex} roughness={0.5} />
        </mesh>
      </RigidBody>
      {/* 4) Back landing behind stairwell — x=-4.5 to 4.5, z=19.5 to 25.5 */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 4.75, 22.5]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[9, 0.5, 6]} />
          <meshStandardMaterial map={floorTex} roughness={0.5} />
        </mesh>
      </RigidBody>

      {/* ═══ OUTER WALLS (full height) ══════════════════════════════════════ */}
      {/* Left wall */}
      <Wall pos={[-15.5, 5, 2.5]} size={[1, 10, 45]} />
      {/* Right wall */}
      <Wall pos={[15.5, 5, 2.5]} size={[1, 10, 45]} />
      {/* Front wall */}
      <Wall pos={[0, 5, -20.5]} size={[32, 10, 1]} />
      {/* Back wall */}
      <Wall pos={[0, 5, 25.5]} size={[32, 10, 1]} />

      {/* ═══ GROUND FLOOR INNER WALLS ═══════════════════════════════════════ */}
      {/* Kitchen Walls (Left side ground floor) with grunge concrete */}
      <Wall pos={[-10, 2, -5]} size={[10, 4, 0.5]} texMap={grungeWallTex} />
      <Wall pos={[-5, 2, -15]} size={[0.5, 4, 10]} texMap={grungeWallTex} />
      
      {/* Narrowed Kitchen Entrance */}
      <Wall pos={[-5, 2, -9.25]} size={[0.5, 4, 1.5]} texMap={grungeWallTex} />
      <Wall pos={[-5, 2, -5.75]} size={[0.5, 4, 1.5]} texMap={grungeWallTex} />
      
      <Wall pos={[-5, 2, 2.5]} size={[0.5, 4, 15]} />
      <Wall pos={[5, 2, -5]} size={[0.5, 4, 30]} />
      
      {/* Kitchen Door Area */}
      <InteractableKitchenGate wallTex={wallTex} />

      {/* The Precise Jumpscare Sensor - Now covers the whole kitchen */}
      {!isKitchenJumpscareTriggered && (
        <RigidBody 
          type="fixed" 
          colliders="cuboid" 
          position={[-10, 2, -10]} 
          sensor
          onIntersectionEnter={(e) => {
            // Trigger jumpscare for any intersection (since player is the only moving body)
            triggerKitchenJumpscare();
            
            // Play creaky door sound when entering
            if (typeof window !== 'undefined') {
              const audio = new Audio('/stairs and doors.mp3');
              audio.volume = 0.5;
              audio.play().catch(() => {});
            }
          }}
        >
          <mesh visible={false}>
            <boxGeometry args={[9, 4, 9]} />
          </mesh>
        </RigidBody>
      )}

      {/* Master Survival Horror Kitchen (z = -15 to -5, x = -15 to -5) */}
      <HorrorKitchen position={[-10, 0, -10]} />

      {/* ═══ SECOND FLOOR LAYOUT ════════════════════════════════════════════
          Central Corridor: x = -4.5 to +4.5 (100% open for stairwell at z=9.5 to 19.5)
          Left Rooms (Washroom 1 & Bedroom 1): x = -15 to -4.5
          Right Rooms (Washroom 2 & Bedroom 2): x = 4.5 to 15
      ══════════════════════════════════════════════════════════════════════ */}

      {/* ─── Left Corridor Wall (x = -4.5) ─────────────────────────────────── */}
      <Wall pos={[-4.5, 7.5, 6.25]} size={[0.3, 5, 2.5]} />
      <Wall pos={[-4.5, 9.25, 9]} size={[0.3, 1.5, 3]} /> {/* Washroom 1 door header */}
      <Wall pos={[-4.5, 7.5, 12.25]} size={[0.3, 5, 3.5]} />
      <Wall pos={[-4.5, 9.25, 15.5]} size={[0.3, 1.5, 3]} /> {/* Bedroom 1 door header */}
      <Wall pos={[-4.5, 7.5, 21.25]} size={[0.3, 5, 8.5]} />

      {/* ─── Right Corridor Wall (x = +4.5) ────────────────────────────────── */}
      <Wall pos={[4.5, 7.5, 6.25]} size={[0.3, 5, 2.5]} />
      <Wall pos={[4.5, 9.25, 9]} size={[0.3, 1.5, 3]} /> {/* Washroom 2 door header */}
      <Wall pos={[4.5, 7.5, 12.25]} size={[0.3, 5, 3.5]} />
      <Wall pos={[4.5, 9.25, 15.5]} size={[0.3, 1.5, 3]} /> {/* Bedroom 2 door header */}
      <Wall pos={[4.5, 7.5, 21.25]} size={[0.3, 5, 8.5]} />

      {/* ─── WASHROOM 1 (Left side, z=5 to 12) ───────────────────────────── */}
      {/* North wall dividing Washroom 1 & Bedroom 1 */}
      <Wall pos={[-9.75, 7.5, 12]} size={[10.2, 5, 0.3]} />
      {/* Washroom 1 tile floor */}
      <mesh position={[-9.75, 5.02, 8.5]} receiveShadow>
        <boxGeometry args={[10.2, 0.04, 7]} />
        <meshStandardMaterial map={tileTex} roughness={0.3} color="#d0e4ec" />
      </mesh>
      {/* Mirror on west wall of washroom 1 */}
      <WashroomMirror position={[-14.8, 7.2, 8.5]} rotY={Math.PI / 2} />
      {/* Toilet */}
      <Toilet position={[-12, 5, 11]} />
      {/* Sink */}
      <Sink position={[-10, 5, 11.5]} />
      {/* Dim washroom light */}
      <pointLight position={[-9.75, 8.8, 8.5]} intensity={6} distance={8} color="#ffe0c8" />

      {/* ─── WASHROOM 2 (Right side, z=5 to 12) ──────────────────────────── */}
      {/* North wall dividing Washroom 2 & Bedroom 2 */}
      <Wall pos={[9.75, 7.5, 12]} size={[10.2, 5, 0.3]} />
      {/* Washroom 2 tile floor */}
      <mesh position={[9.75, 5.02, 8.5]} receiveShadow>
        <boxGeometry args={[10.2, 0.04, 7]} />
        <meshStandardMaterial map={tileTex} roughness={0.3} color="#d0e4ec" />
      </mesh>
      {/* Mirror on east wall of washroom 2 */}
      <WashroomMirror position={[14.8, 7.2, 8.5]} rotY={-Math.PI / 2} />
      {/* Toilet */}
      <Toilet position={[12, 5, 11]} />
      {/* Sink */}
      <Sink position={[10, 5, 11.5]} />
      <pointLight position={[9.75, 8.8, 8.5]} intensity={6} distance={8} color="#ffe0c8" />

      {/* ─── BEDROOM 1 (Left, z=12 to 25.5) ──────────────────────────────── */}
      <Bed position={[-10, 5, 20]} rotY={0} />
      <Desk position={[-12, 5, 13.5]} />
      <mesh position={[-9.75, 7.5, 25.2]} castShadow>
        <boxGeometry args={[1.2, 1.6, 0.05]} />
        <meshStandardMaterial color="#1a0a00" roughness={1} />
      </mesh>

      {/* ─── BEDROOM 2 (Right, z=12 to 25.5) ─────────────────────────────── */}
      <Bed position={[10, 5, 20]} rotY={Math.PI} />
      <mesh position={[8, 5.38, 14]} castShadow receiveShadow rotation={[0, 0.4, 0.2]}>
        <boxGeometry args={[0.4, 0.06, 0.4]} />
        <meshStandardMaterial color="#5c3010" roughness={0.9} />
      </mesh>
      <mesh position={[8, 5.6, 14.2]} castShadow rotation={[0.3, 0.4, 0]}>
        <boxGeometry args={[0.08, 0.5, 0.06]} />
        <meshStandardMaterial color="#5c3010" roughness={0.9} />
      </mesh>
      <mesh position={[14.8, 7, 16]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial map={bloodTex} transparent opacity={0.7} />
      </mesh>

      {/* ─── HALLWAY / CORRIDOR (between washrooms and bedrooms) ─────────── */}
      {/* Corridor is open — just the floor slab covers it */}

      {/* ─── SECOND FLOOR INNER BALCONY RAILING (decorative low walls) ───── */}
      {/* Rail overlooking stairs — south edge of 2nd floor */}
      <Wall pos={[0, 5.65, 5.15]} size={[30, 0.3, 0.1]} />

      {/* ─── CEILING ──────────────────────────────────────────────────────── */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 10, 2.5]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[32, 1, 45]} />
          <meshStandardMaterial map={panelTex} roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* ═══ INTERACTABLES ══════════════════════════════════════════════════ */}
      {/* Hidden Key on 2nd floor front balcony */}
      {!hasKey && (
        <RigidBody
          type="fixed"
          colliders="hull"
          position={[0, 5.5, 6]}
          sensor
          onIntersectionEnter={(e) => {
            if (e.other.rigidBodyObject?.name === 'player') {
              setCanInteractKey(true);
              setInteractPrompt('Press E to pick up Key');
              const handleKey = (evt: KeyboardEvent) => {
                if (evt.code === 'KeyE') {
                  setHasKey(true);
                  setInteractPrompt(null);
                  setCanInteractKey(false);
                  window.removeEventListener('keydown', handleKey);
                }
              };
              window.addEventListener('keydown', handleKey);
            }
          }}
          onIntersectionExit={(e) => {
            if (e.other.rigidBodyObject?.name === 'player') {
              setCanInteractKey(false);
              setInteractPrompt(null);
            }
          }}
        >
          <mesh ref={keyRef} castShadow>
            <boxGeometry args={[0.5, 0.2, 0.5]} />
            <meshStandardMaterial color="gold" emissive="gold" emissiveIntensity={0.5} />
            <pointLight distance={3} intensity={5} color="gold" />
          </mesh>
        </RigidBody>
      )}

      {/* Detailed Creepy Main Entrance Gate / Door */}
      <CreepyMainDoor hasKey={hasKey} bloodTex={bloodTex} />

      {/* Main Door Collision & Sensor Trigger */}
      <RigidBody
        type="fixed"
        colliders="cuboid"
        position={[0, 2.4, -19.85]}
        sensor
        onIntersectionEnter={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            setCanInteractDoor(true);
            setInteractPrompt(hasKey ? 'Press E to Escape' : 'Locked. Find the Key.');
            const handleKey = (evt: KeyboardEvent) => {
              if (evt.code === 'KeyE') {
                if (useGameStore.getState().hasKey) {
                  playDoorUnlock();
                  setTimeout(() => setGameState('win'), 500);
                }
                window.removeEventListener('keydown', handleKey);
              }
            };
            window.addEventListener('keydown', handleKey);
          }
        }}
        onIntersectionExit={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            setCanInteractDoor(false);
            setInteractPrompt(null);
          }
        }}
      >
        <mesh receiveShadow>
          <boxGeometry args={[4, 4, 0.2]} />
          <meshStandardMaterial color="#3a1c1c" />
        </mesh>
      </RigidBody>
    </group>
  );
}
