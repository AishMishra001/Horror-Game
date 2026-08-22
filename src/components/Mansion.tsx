'use client';

import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '@/store/useGameStore';
import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';

import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import HorrorKitchen from './HorrorKitchen';
import HorrorBathroom from './HorrorBathroom';
import HorrorMasterBedroom from './HorrorMasterBedroom';
import HorrorRitualBedroom from './HorrorRitualBedroom';
import HorrorWashroom1 from './HorrorWashroom1';
import HorrorWashroom2 from './HorrorWashroom2';
import InteractableRoomDoor from './InteractableRoomDoor';
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
      <mesh>
        <boxGeometry args={[2.2, 2.2, 0.06]} />
        <meshStandardMaterial color="#3a2210" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[1.9, 1.9]} />
        <meshStandardMaterial metalness={0.96} roughness={0.08} color="#cddde4" />
      </mesh>
    </group>
  );
}

// ─── Victorian Pull-Chain Toilet ─────────────────────────────────────────────
function VictorianToilet({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Porcelain Bowl */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.65]} />
        <meshStandardMaterial color="#c5d3d8" roughness={0.4} />
      </mesh>
      {/* Dark Wood Seat */}
      <mesh position={[0, 0.52, 0.05]}>
        <torusGeometry args={[0.2, 0.05, 6, 12]} />
        <meshStandardMaterial color="#2d1505" roughness={0.7} />
      </mesh>
      {/* High Wall Tank */}
      <mesh position={[0, 2.3, -0.25]}>
        <boxGeometry args={[0.6, 0.45, 0.3]} />
        <meshStandardMaterial color="#1a0c02" roughness={0.8} />
      </mesh>
      {/* Flush Pipe */}
      <mesh position={[0, 1.35, -0.22]}>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 6]} />
        <meshStandardMaterial color="#887755" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ─── Victorian Pedestal Sink ─────────────────────────────────────────────────
function PedestalSink({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Basin */}
      <mesh position={[0, 0.88, 0]}>
        <boxGeometry args={[0.7, 0.2, 0.5]} />
        <meshStandardMaterial color="#d2dee2" roughness={0.3} />
      </mesh>
      {/* Pedestal column */}
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.72, 8]} />
        <meshStandardMaterial color="#d2dee2" roughness={0.3} />
      </mesh>
      {/* Brass Faucet */}
      <mesh position={[0, 1.04, -0.16]}>
        <cylinderGeometry args={[0.025, 0.025, 0.18, 6]} />
        <meshStandardMaterial color="#998040" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ─── Victorian Clawfoot Bathtub ──────────────────────────────────────────────
function ClawfootBathtub({ position, rotY = 0, bloody = false }: { position: [number, number, number]; rotY?: number; bloody?: boolean }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Outer porcelain tub body */}
      <mesh position={[0, 0.45, 0]} receiveShadow>
        <boxGeometry args={[1.1, 0.65, 2.2]} />
        <meshStandardMaterial color="#c0cfd6" roughness={0.35} />
      </mesh>
      {/* Inner tub cavity / water */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.9, 0.45, 1.95]} />
        <meshStandardMaterial 
          color={bloody ? '#550505' : '#1a2a35'} 
          roughness={0.1} 
          metalness={0.2}
          emissive={bloody ? '#300000' : '#000000'}
        />
      </mesh>
      {/* 4 Brass Feet */}
      {[-0.48, 0.48].map((x) =>
        [-0.95, 0.95].map((z) => (
          <mesh key={`claw-${x}-${z}`} position={[x, 0.1, z]}>
            <cylinderGeometry args={[0.04, 0.07, 0.2, 6]} />
            <meshStandardMaterial color="#8a7330" metalness={0.8} roughness={0.3} />
          </mesh>
        ))
      )}
      {/* Brass antique taps */}
      <mesh position={[0, 0.85, -1.02]}>
        <cylinderGeometry args={[0.03, 0.03, 0.22, 6]} />
        <meshStandardMaterial color="#8a7330" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ─── Master Victorian 4-Poster Canopy Bed ─────────────────────────────────────
function FourPosterBed({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Mattress base */}
      <mesh position={[0, 0.4, 0]} receiveShadow>
        <boxGeometry args={[2.2, 0.4, 2.6]} />
        <meshStandardMaterial color="#2d1606" roughness={0.8} />
      </mesh>
      {/* Quilt Mattress */}
      <mesh position={[0, 0.65, 0]} receiveShadow>
        <boxGeometry args={[2.0, 0.25, 2.4]} />
        <meshStandardMaterial color="#4a1015" roughness={0.9} />
      </mesh>
      {/* Pillows */}
      {[-0.55, 0.55].map((x, idx) => (
        <mesh key={`pillow-${idx}`} position={[x, 0.82, -0.85]}>
          <boxGeometry args={[0.7, 0.16, 0.45]} />
          <meshStandardMaterial color="#ded1bc" roughness={0.9} />
        </mesh>
      ))}
      {/* Headboard */}
      <mesh position={[0, 1.2, -1.25]}>
        <boxGeometry args={[2.2, 1.4, 0.12]} />
        <meshStandardMaterial color="#1f0e04" roughness={0.7} />
      </mesh>
      {/* 4 Carved Wooden Corner Posts */}
      {[-1.05, 1.05].map((x) =>
        [-1.25, 1.25].map((z) => (
          <mesh key={`post-${x}-${z}`} position={[x, 1.6, z]}>
            <cylinderGeometry args={[0.06, 0.07, 3.2, 6]} />
            <meshStandardMaterial color="#1a0a02" roughness={0.7} />
          </mesh>
        ))
      )}
      {/* Top Canopy Roof Frame */}
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[2.2, 0.08, 2.6]} />
        <meshStandardMaterial color="#30080c" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ─── Antique Armoire / Wardrobe ──────────────────────────────────────────────
function AntiqueArmoire({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Main cabinet body */}
      <mesh position={[0, 1.6, 0]} receiveShadow>
        <boxGeometry args={[1.6, 3.2, 0.8]} />
        <meshStandardMaterial color="#241106" roughness={0.8} />
      </mesh>
      {/* Ornate Top Crest */}
      <mesh position={[0, 3.3, 0]}>
        <boxGeometry args={[1.75, 0.22, 0.9]} />
        <meshStandardMaterial color="#1a0c04" roughness={0.7} />
      </mesh>
      {/* Double Doors Panels */}
      {[-0.38, 0.38].map((x, idx) => (
        <mesh key={`door-${idx}`} position={[x, 1.6, 0.42]}>
          <boxGeometry args={[0.68, 2.7, 0.04]} />
          <meshStandardMaterial color="#180a03" roughness={0.9} />
        </mesh>
      ))}
      {/* Brass Handles */}
      {[-0.08, 0.08].map((x, idx) => (
        <mesh key={`h-${idx}`} position={[x, 1.6, 0.46]}>
          <cylinderGeometry args={[0.015, 0.015, 0.12, 6]} />
          <meshStandardMaterial color="#a08830" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Victorian Writing Desk ──────────────────────────────────────────────────
function VictorianDesk({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Desktop */}
      <mesh position={[0, 0.8, 0]} receiveShadow>
        <boxGeometry args={[1.6, 0.08, 0.9]} />
        <meshStandardMaterial color="#381a09" roughness={0.7} />
      </mesh>
      {/* Left drawer pedestal */}
      <mesh position={[-0.6, 0.38, 0]}>
        <boxGeometry args={[0.35, 0.76, 0.8]} />
        <meshStandardMaterial color="#271206" roughness={0.8} />
      </mesh>
      {/* Right drawer pedestal */}
      <mesh position={[0.6, 0.38, 0]}>
        <boxGeometry args={[0.35, 0.76, 0.8]} />
        <meshStandardMaterial color="#271206" roughness={0.8} />
      </mesh>
      {/* Antique Skull on Desk */}
      <mesh position={[0.4, 0.95, -0.1]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#dfd8c8" roughness={0.8} />
      </mesh>
      {/* Open Cursed Diary */}
      <mesh position={[-0.1, 0.86, 0.1]} rotation={[-0.05, 0.15, 0]}>
        <boxGeometry args={[0.32, 0.04, 0.24]} />
        <meshStandardMaterial color="#501010" roughness={0.9} />
      </mesh>
      {/* Candle with warm flame */}
      <mesh position={[-0.5, 0.92, -0.2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.16, 6]} />
        <meshStandardMaterial color="#e8dfcb" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ─── Victorian Brick Fireplace ───────────────────────────────────────────────
function VictorianFireplace({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Outer Brick Frame */}
      <mesh position={[0, 1.2, 0]} receiveShadow>
        <boxGeometry args={[2.2, 2.4, 0.6]} />
        <meshStandardMaterial color="#301815" roughness={0.95} />
      </mesh>
      {/* Firebox Cavity */}
      <mesh position={[0, 0.7, 0.08]}>
        <boxGeometry args={[1.3, 1.4, 0.5]} />
        <meshStandardMaterial color="#0a0505" roughness={1.0} />
      </mesh>
      {/* Ornate Wooden Mantle Shelf */}
      <mesh position={[0, 2.45, 0.05]}>
        <boxGeometry args={[2.5, 0.15, 0.8]} />
        <meshStandardMaterial color="#200d04" roughness={0.7} />
      </mesh>
      {/* Glowing Dying Embers in hearth */}
      <mesh position={[0, 0.15, 0.1]}>
        <boxGeometry args={[0.8, 0.1, 0.3]} />
        <meshStandardMaterial color="#ff3300" emissive="#ff2200" emissiveIntensity={1.2} />
      </mesh>
      <pointLight position={[0, 0.35, 0.25]} intensity={6} distance={4} color="#ff4411" castShadow={false} />
    </group>
  );
}

// ─── Occult Ritual Pentagram & Red Candles ────────────────────────────────────
function OccultRitualCircle({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Ritual Pentagram Ring on Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.6, 1.75, 16]} />
        <meshStandardMaterial color="#880000" emissive="#550000" emissiveIntensity={0.6} roughness={0.9} />
      </mesh>
      {/* Inverted Star lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.58, 5]} />
        <meshStandardMaterial color="#3a0005" roughness={0.95} transparent opacity={0.6} />
      </mesh>
      {/* 5 Ritual Candles along the circle points */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const cx = Math.cos(angle) * 1.68;
        const cz = Math.sin(angle) * 1.68;
        return (
          <group key={`rcandle-${i}`} position={[cx, 0, cz]}>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.3, 6]} />
              <meshStandardMaterial color="#200000" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.33, 0]}>
              <sphereGeometry args={[0.025, 6, 6]} />
              <meshBasicMaterial color="#ff2200" />
            </mesh>
          </group>
        );
      })}
      <pointLight position={[0, 0.8, 0]} intensity={10} distance={5} color="#ff1100" castShadow={false} />
    </group>
  );
}

// ─── Gothic Cursed Bookshelf ──────────────────────────────────────────────────
function GothicBookshelf({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Frame */}
      <mesh position={[0, 1.8, 0]} receiveShadow>
        <boxGeometry args={[1.8, 3.6, 0.5]} />
        <meshStandardMaterial color="#1a0c04" roughness={0.85} />
      </mesh>
      {/* Shelves rows */}
      {[-0.8, -0.1, 0.6, 1.3].map((y, idx) => (
        <group key={`shelf-${idx}`} position={[0, 1.8 + y, 0]}>
          <mesh position={[0, 0.18, 0.05]}>
            <boxGeometry args={[1.55, 0.32, 0.32]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#4a1212' : '#1c2415'} roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Skull on top shelf */}
      <mesh position={[0.4, 3.25, 0.05]}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshStandardMaterial color="#dfd4be" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ─── Gothic Wooden Balustrade / Railing (High Performance) ───────────────────
function GothicRailing({
  position,
  length,
  rotY = 0,
}: {
  position: [number, number, number];
  length: number;
  rotY?: number;
}) {
  const numPosts = Math.max(3, Math.floor(length / 2.0));
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Top Handrail */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.14, 0.08, length]} />
        <meshStandardMaterial color="#2d1505" roughness={0.6} />
      </mesh>
      {/* Bottom Rail */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.12, 0.06, length]} />
        <meshStandardMaterial color="#220e03" roughness={0.7} />
      </mesh>
      {/* Gothic Patterned Rail Infill Slab */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.04, 0.78, length * 0.98]} />
        <meshStandardMaterial color="#1a0c02" roughness={0.8} />
      </mesh>
      {/* Key Sturdy Balustrade Posts */}
      {Array.from({ length: numPosts }).map((_, i) => {
        const zPos = -length / 2 + (i + 0.5) * (length / numPosts);
        return (
          <mesh key={`post-${i}`} position={[0, 0.5, zPos]}>
            <boxGeometry args={[0.08, 0.9, 0.08]} />
            <meshStandardMaterial color="#220e03" roughness={0.6} />
          </mesh>
        );
      })}
      {/* RigidBody Collider for safe walking along balcony */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.5, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[0.2, 1.0, length]} />
        </mesh>
      </RigidBody>
    </group>
  );
}

// ─── Gothic Key Pedestal on Front Balcony ─────────────────────────────────────
function KeyPedestal({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Stone base plinth */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[0.8, 0.3, 0.8]} />
        <meshStandardMaterial color="#1a1816" roughness={0.9} />
      </mesh>
      {/* Column shaft */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.7, 8]} />
        <meshStandardMaterial color="#252220" roughness={0.85} />
      </mesh>
      {/* Top plinth table */}
      <mesh position={[0, 1.0, 0]} receiveShadow>
        <boxGeometry args={[0.7, 0.1, 0.7]} />
        <meshStandardMaterial color="#1a1816" roughness={0.9} />
      </mesh>
      {/* Red velvet display cushion */}
      <mesh position={[0, 1.08, 0]}>
        <boxGeometry args={[0.45, 0.06, 0.45]} />
        <meshStandardMaterial color="#55000a" roughness={0.9} />
      </mesh>
      {/* Pedestal Candles */}
      {[-0.26, 0.26].map((x, idx) => (
        <group key={`pedcandle-${idx}`} position={[x, 1.05, -0.26]}>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.16, 6]} />
            <meshStandardMaterial color="#eeddcc" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Creepy Main Entrance Door ────────────────────────────────────────────────
function CreepyMainDoor({ hasKey, bloodTex }: { hasKey: boolean; bloodTex: THREE.Texture }) {
  return (
    <group position={[0, 0, -19.85]}>
      {/* Heavy Gothic Stone Outer Arch Frame */}
      <mesh position={[-2.6, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.6, 5.2, 0.6]} />
        <meshStandardMaterial color="#1a1816" roughness={0.9} />
      </mesh>
      <mesh position={[2.6, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.6, 5.2, 0.6]} />
        <meshStandardMaterial color="#1a1816" roughness={0.9} />
      </mesh>
      <mesh position={[0, 5.2, 0]} receiveShadow>
        <boxGeometry args={[5.8, 0.6, 0.7]} />
        <meshStandardMaterial color="#1a1816" roughness={0.9} />
      </mesh>
      <mesh position={[0, 5.6, 0.1]}>
        <boxGeometry args={[0.9, 0.7, 0.8]} />
        <meshStandardMaterial color="#2c2824" roughness={0.8} />
      </mesh>
      <mesh position={[0, 5.6, 0.52]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#0d0b0a" roughness={0.5} />
      </mesh>

      {/* Double Gothic Doors */}
      <group position={[-1.18, 2.4, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[2.3, 4.8, 0.2]} />
          <meshStandardMaterial color="#23130c" roughness={0.8} />
        </mesh>
        <mesh position={[0.8, 0, 0.14]}>
          <torusGeometry args={[0.16, 0.03, 8, 12]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.2} />
        </mesh>
      </group>

      <group position={[1.18, 2.4, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[2.3, 4.8, 0.2]} />
          <meshStandardMaterial color="#23130c" roughness={0.8} />
        </mesh>
        <mesh position={[-0.8, 0, 0.14]}>
          <torusGeometry args={[0.16, 0.03, 8, 12]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.2} />
        </mesh>
      </group>

      {/* Central Lockplate Escutcheon & Keyhole */}
      <group position={[0, 2.2, 0.14]}>
        <mesh>
          <boxGeometry args={[0.35, 0.7, 0.04]} />
          <meshStandardMaterial color="#151515" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.05, 0.025]}>
          <circleGeometry args={[0.06, 12]} />
          <meshStandardMaterial
            color={hasKey ? '#ffd700' : '#8b0000'}
            emissive={hasKey ? '#ffd700' : '#330000'}
            emissiveIntensity={hasKey ? 0.8 : 0.2}
          />
        </mesh>
        <pointLight position={[0, 0, 0.3]} intensity={hasKey ? 10 : 3} distance={3} color={hasKey ? '#ffd700' : '#ff2200'} castShadow={false} />
      </group>

      {/* Blood Stain Decal across Door */}
      <mesh position={[-0.4, 2.0, 0.12]} rotation={[0, 0, -0.3]}>
        <planeGeometry args={[1.6, 2.2]} />
        <meshStandardMaterial map={bloodTex} transparent opacity={0.65} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─── Victorian Double Kitchen Door ───────────────────────────────────────────
function InteractableKitchenDoor({ wallTex, woodTex }: { wallTex: THREE.Texture; woodTex: THREE.Texture }) {
  const setInteractPrompt = useGameStore((s) => s.setInteractPrompt);
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const canInteractRef = useRef(false);

  const leftPivotRef = useRef<THREE.Group>(null);
  const rightPivotRef = useRef<THREE.Group>(null);

  const playDoorSound = () => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/stairs and doors.mp3');
      audio.volume = 0.6;
      audio.play().catch(() => {});
    }
  };

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const targetLeft = isOpen ? Math.PI * 0.48 : 0;
    const targetRight = isOpen ? -Math.PI * 0.48 : 0;
    const lerpFactor = Math.min(1, delta * 5.0);

    if (leftPivotRef.current) {
      const diff = targetLeft - leftPivotRef.current.rotation.y;
      if (Math.abs(diff) > 0.002) {
        leftPivotRef.current.rotation.y += diff * lerpFactor;
      }
    }
    if (rightPivotRef.current) {
      const diff = targetRight - rightPivotRef.current.rotation.y;
      if (Math.abs(diff) > 0.002) {
        rightPivotRef.current.rotation.y += diff * lerpFactor;
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
    <group position={[-5, 0, -7.5]}>
      {/* ── Wall Header Beam above Doorway (Y = 3.0 to 4.0, width 2.4m) ── */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 3.5, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.5, 1.0, 2.4]} />
          <meshStandardMaterial map={wallTex} roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* ── Timber Doorframe Trim ── */}
      <mesh position={[0, 1.5, -1.2]} receiveShadow>
        <boxGeometry args={[0.54, 3.0, 0.12]} />
        <meshStandardMaterial color="#1a0f0a" map={woodTex} roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.5, 1.2]} receiveShadow>
        <boxGeometry args={[0.54, 3.0, 0.12]} />
        <meshStandardMaterial color="#1a0f0a" map={woodTex} roughness={0.75} />
      </mesh>
      <mesh position={[0, 3.01, 0]} receiveShadow>
        <boxGeometry args={[0.56, 0.12, 2.52]} />
        <meshStandardMaterial color="#1a0f0a" map={woodTex} roughness={0.75} />
      </mesh>

      {/* ── Left Door Leaf ── */}
      <group position={[0, 1.46, -1.14]} ref={leftPivotRef}>
        <mesh position={[0, 0, 0.57]} receiveShadow>
          <boxGeometry args={[0.08, 2.88, 1.13]} />
          <meshStandardMaterial color="#2d180e" map={woodTex} roughness={0.7} />
        </mesh>
        <mesh position={[0.05, -0.05, 1.02]}>
          <boxGeometry args={[0.012, 0.28, 0.06]} />
          <meshStandardMaterial color="#967830" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* ── Right Door Leaf ── */}
      <group position={[0, 1.46, 1.14]} ref={rightPivotRef}>
        <mesh position={[0, 0, -0.57]} receiveShadow>
          <boxGeometry args={[0.08, 2.88, 1.13]} />
          <meshStandardMaterial color="#2d180e" map={woodTex} roughness={0.7} />
        </mesh>
        <mesh position={[0.05, -0.05, -1.02]}>
          <boxGeometry args={[0.012, 0.28, 0.06]} />
          <meshStandardMaterial color="#967830" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* ── Solid Doorway Barrier Collider (Active only when closed) ── */}
      {!isOpen && (
        <RigidBody type="fixed" colliders="cuboid" position={[0, 1.46, 0]}>
          <mesh visible={false}>
            <boxGeometry args={[0.3, 2.9, 2.3]} />
          </mesh>
        </RigidBody>
      )}

      {/* ── Interaction Trigger Zone ── */}
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
        <CuboidCollider args={[2.5, 1.5, 2.2]} />
      </RigidBody>
    </group>
  );
}

// High-performance wall helper (receives shadows, doesn't cast)
function Wall({
  pos,
  size,
  texMap,
}: {
  pos: [number, number, number];
  size: [number, number, number];
  texMap?: THREE.Texture;
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh receiveShadow>
        <boxGeometry args={size} />
        {texMap ? (
          <meshStandardMaterial map={texMap} roughness={0.9} />
        ) : (
          <meshStandardMaterial color="#4a4035" roughness={0.9} />
        )}
      </mesh>
    </RigidBody>
  );
}

// ─── Main Mansion Component ───────────────────────────────────────────────────
export default function Mansion() {
  const hasKey = useGameStore((s) => s.hasKey);
  const setHasKey = useGameStore((s) => s.setHasKey);
  const setInteractPrompt = useGameStore((s) => s.setInteractPrompt);
  const setGameState = useGameStore((s) => s.setGameState);
  const isKitchenJumpscareTriggered = useGameStore((s) => s.isKitchenJumpscareTriggered);
  const triggerKitchenJumpscare = useGameStore((s) => s.triggerKitchenJumpscare);
  const isRitualDoorClosed = useGameStore((s) => s.isRitualDoorClosed);
  const isRitualDoorLocked = useGameStore((s) => s.isRitualDoorLocked);

  const flickLightRef = useRef<THREE.PointLight>(null);
  const flickLight2Ref = useRef<THREE.PointLight>(null);
  const keyRef = useRef<THREE.Group>(null);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    if (keyRef.current) {
      keyRef.current.rotation.y += delta * 1.5;
      keyRef.current.position.y = 6.25 + Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
    }
  });

  const [floorTex, wallTex, panelTex, bloodTex, tileTex, grungeWallTex, doorWoodTex] = useTexture([
    '/textures/floor.png',
    '/textures/wallpaper.png',
    '/textures/panel.png',
    '/textures/bloody_carpet.png',
    '/textures/floor.png',
    '/textures/grunge_concrete_wall.jpg',
    '/textures/rustic_wood_planks.jpg',
  ]);

  [floorTex, wallTex, panelTex, bloodTex, tileTex, grungeWallTex, doorWoodTex].forEach((tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  });

  floorTex.repeat.set(10, 10);
  wallTex.repeat.set(15, 3);
  panelTex.repeat.set(5, 5);
  bloodTex.repeat.set(4, 4);
  tileTex.repeat.set(3, 3);
  grungeWallTex.repeat.set(3, 2);
  doorWoodTex.repeat.set(1.5, 3);

  return (
    <group>
      {/* ═══ ATMOSPHERIC LIGHTING ════════════════════════════════════════════ */}
      <LobbyLights />
      {/* Upper Landing Chandelier */}
      <pointLight position={[0, 8.8, 22.0]} intensity={12} distance={12} color="#ffaa55" castShadow={false} />
      {/* Front Balcony Key area */}
      <pointLight position={[0, 7.5, 2.0]} intensity={8} distance={8} color="#ffd700" castShadow={false} />

      {/* ═══ GROUND FLOOR SLAB ═══════════════════════════════════════════════ */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0, 2.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[32, 48]} />
          <meshStandardMaterial map={bloodTex} roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* ═══ SMOOTH 20-STEP GRAND STAIRCASE (Z = 9.0 to 19.0, Y = 0 to 5) ═══ */}
      <group>
        {Array.from({ length: 20 }).map((_, i) => {
          const stepZ = 9.0 + i * 0.5 + 0.25;
          const stepH = (i + 1) * 0.25;
          const stepY = stepH / 2;
          return (
            <group key={`grand-stair-${i}`}>
              {/* Solid wooden riser and tread */}
              <mesh position={[0, stepY, stepZ]} receiveShadow>
                <boxGeometry args={[8.0, stepH, 0.5]} />
                <meshStandardMaterial map={floorTex} roughness={0.5} />
              </mesh>
              {/* Crimson velvet carpet runner down center */}
              <mesh position={[0, stepH + 0.005, stepZ]} receiveShadow>
                <boxGeometry args={[3.4, 0.02, 0.51]} />
                <meshStandardMaterial color="#6a040f" roughness={0.85} />
              </mesh>
            </group>
          );
        })}

        {/* Carved Wooden Newel Posts at Bottom of Stairs */}
        {[-3.9, 3.9].map((x, idx) => (
          <group key={`bottom-newel-${idx}`} position={[x, 0, 9.2]}>
            <mesh position={[0, 0.7, 0]}>
              <boxGeometry args={[0.25, 1.4, 0.25]} />
              <meshStandardMaterial color="#2d1505" roughness={0.6} />
            </mesh>
            <mesh position={[0, 1.45, 0]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color="#3d1d07" roughness={0.5} metalness={0.2} />
            </mesh>
          </group>
        ))}

        {/* Carved Wooden Newel Posts at Top of Stairs */}
        {[-3.9, 3.9].map((x, idx) => (
          <group key={`top-newel-${idx}`} position={[x, 5.0, 18.8]}>
            <mesh position={[0, 0.7, 0]}>
              <boxGeometry args={[0.25, 1.4, 0.25]} />
              <meshStandardMaterial color="#2d1505" roughness={0.6} />
            </mesh>
            <mesh position={[0, 1.45, 0]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color="#3d1d07" roughness={0.5} metalness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Seamless Staircase Invisible Ramp Collider */}
      <RigidBody
        type="fixed"
        colliders={false}
        position={[0, 2.5, 14.0]}
        rotation={[-Math.atan2(5.0, 10.0), 0, 0]}
      >
        <CuboidCollider args={[4.0, 0.08, 5.59]} friction={0} />
      </RigidBody>

      {/* ═══ CONTINUOUS 2ND FLOOR PLATFORM (Y = 4.75, top at Y = 5.0) ═══════ */}
      {/* 1) West Wing Floor */}
      <RigidBody type="fixed" colliders="cuboid" position={[-9.5, 4.75, 10.75]}>
        <mesh receiveShadow>
          <boxGeometry args={[11.0, 0.5, 29.5]} />
          <meshStandardMaterial map={floorTex} roughness={0.55} />
        </mesh>
      </RigidBody>

      {/* 2) East Wing Floor */}
      <RigidBody type="fixed" colliders="cuboid" position={[9.5, 4.75, 10.75]}>
        <mesh receiveShadow>
          <boxGeometry args={[11.0, 0.5, 29.5]} />
          <meshStandardMaterial map={floorTex} roughness={0.55} />
        </mesh>
      </RigidBody>

      {/* 3) Back Landing Gallery Floor */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 4.75, 22.25]}>
        <mesh receiveShadow>
          <boxGeometry args={[8.0, 0.5, 6.5]} />
          <meshStandardMaterial map={floorTex} roughness={0.55} />
        </mesh>
      </RigidBody>

      {/* 4) Front Balcony Floor */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 4.75, 2.5]}>
        <mesh receiveShadow>
          <boxGeometry args={[8.0, 0.5, 13.0]} />
          <meshStandardMaterial map={floorTex} roughness={0.55} />
        </mesh>
      </RigidBody>

      {/* ═══ 2ND FLOOR SAFETY RAILINGS AROUND CENTRAL STAIR OPENING ═════════ */}
      <GothicRailing position={[-4.05, 5.0, 14.0]} length={10.0} rotY={0} />
      <GothicRailing position={[4.05, 5.0, 14.0]} length={10.0} rotY={0} />
      <GothicRailing position={[0, 5.0, -4.0]} length={13.0} rotY={Math.PI / 2} />

      {/* ═══ FULL HEIGHT OUTER MANSION WALLS (Y = 0 to 10) ═══════════════════ */}
      <Wall pos={[-15.5, 5, 2.5]} size={[1, 10, 47]} texMap={wallTex} />
      <Wall pos={[15.5, 5, 2.5]} size={[1, 10, 47]} texMap={wallTex} />
      <Wall pos={[0, 5, -20.5]} size={[32, 10, 1]} texMap={wallTex} />
      <Wall pos={[0, 5, 25.5]} size={[32, 10, 1]} texMap={wallTex} />

      {/* ═══ GROUND FLOOR INNER WALLS, KITCHEN & BATHROOM ═════════════════════ */}
      {/* West Wing (Kitchen & Dining) */}
      <Wall pos={[-10, 2, -5]} size={[10, 4, 0.5]} texMap={grungeWallTex} />
      <Wall pos={[-5, 2, -14.35]} size={[0.5, 4, 11.3]} texMap={grungeWallTex} />
      <Wall pos={[-5, 2, -5.65]} size={[0.5, 4, 1.3]} texMap={grungeWallTex} />
      <Wall pos={[-5, 2, 2.5]} size={[0.5, 4, 15]} texMap={wallTex} />

      {/* East Wing (Bathroom & Ballroom) */}
      <Wall pos={[10, 2, -5]} size={[10, 4, 0.5]} texMap={grungeWallTex} />
      <Wall pos={[5, 2, 2.5]} size={[0.5, 4, 15]} texMap={wallTex} />

      {/* Victorian Double Kitchen Door */}
      <InteractableKitchenDoor wallTex={grungeWallTex} woodTex={doorWoodTex} />

      {/* Kitchen Jumpscare Sensor - Ground Floor Kitchen Entry */}
      {!isKitchenJumpscareTriggered && (
        <RigidBody
          type="fixed"
          colliders={false}
          position={[-10, 2, -12.5]}
        >
          <CuboidCollider
            args={[4.8, 2.0, 7.3]}
            sensor
            onIntersectionEnter={(e) => {
              if (e.other.rigidBodyObject?.name === 'player') {
                const store = useGameStore.getState();
                if (!store.isKitchenJumpscareTriggered) {
                  store.triggerKitchenJumpscare();
                }
              }
            }}
          />
        </RigidBody>
      )}

      {/* Ground Floor Horror Kitchen (West Wing) */}
      <HorrorKitchen position={[-10, 0, -12.5]} />

      {/* Ground Floor Horror Bathroom (East Wing) */}
      <HorrorBathroom position={[10, 0, -12.5]} />

      {/* ═══ 2ND FLOOR INTERIOR WALLS & ARCHWAYS (Y = 5.0 to 10.0) ═══════════ */}
      {/* North-South Dividing Walls */}
      <Wall pos={[-10.75, 7.5, 12.5]} size={[8.5, 5.0, 0.3]} texMap={wallTex} />
      <Wall pos={[10.75, 7.5, 12.5]} size={[8.5, 5.0, 0.3]} texMap={wallTex} />

      {/* Front Enclosing Walls for 2F Washrooms */}
      <Wall pos={[-10.75, 7.5, -4.0]} size={[8.5, 5.0, 0.3]} texMap={wallTex} />
      <Wall pos={[10.75, 7.5, -4.0]} size={[8.5, 5.0, 0.3]} texMap={wallTex} />

      {/* West Corridor Wall */}
      <Wall pos={[-6.5, 7.5, 0.5]} size={[0.3, 5.0, 9.0]} texMap={wallTex} />
      <Wall pos={[-6.5, 9.0, 6.5]} size={[0.3, 2.0, 3.0]} texMap={wallTex} />
      <Wall pos={[-6.5, 7.5, 11.75]} size={[0.3, 5.0, 7.5]} texMap={wallTex} />
      <Wall pos={[-6.5, 9.0, 17.0]} size={[0.3, 2.0, 3.0]} texMap={wallTex} />
      <Wall pos={[-6.5, 7.5, 22.0]} size={[0.3, 5.0, 7.0]} texMap={wallTex} />

      {/* East Corridor Wall */}
      <Wall pos={[6.5, 7.5, 0.5]} size={[0.3, 5.0, 9.0]} texMap={wallTex} />
      <Wall pos={[6.5, 9.0, 6.5]} size={[0.3, 2.0, 3.0]} texMap={wallTex} />
      <Wall pos={[6.5, 7.5, 11.75]} size={[0.3, 5.0, 7.5]} texMap={wallTex} />
      <Wall pos={[6.5, 9.0, 17.0]} size={[0.3, 2.0, 3.0]} texMap={wallTex} />
      <Wall pos={[6.5, 7.5, 22.0]} size={[0.3, 5.0, 7.0]} texMap={wallTex} />

      {/* ═══ 1ST/2ND FLOOR INTERACTABLE DOORS & GATES ════════════════════════ */}
      {/* 1. Master Bedroom Entrance Door */}
      <InteractableRoomDoor position={[-6.5, 5.0, 17.0]} rotY={0} woodTex={doorWoodTex} doorName="Master Bedroom Door" />
      {/* 2. Ritual Bedroom Entrance Door */}
      <InteractableRoomDoor
        position={[6.5, 5.0, 17.0]}
        rotY={0}
        woodTex={doorWoodTex}
        doorName="Ritual Bedroom Door"
        isForcedClosed={isRitualDoorClosed}
        isLocked={isRitualDoorLocked}
        lockedMessage="🔒 The Ritual Bedroom is sealed shut by dark occult magic..."
      />
      {/* 3. Washroom 1 Entrance Door */}
      <InteractableRoomDoor position={[-6.5, 5.0, 6.5]} rotY={0} woodTex={doorWoodTex} doorName="Washroom 1 Door" />
      {/* 4. Washroom 2 Entrance Door */}
      <InteractableRoomDoor position={[6.5, 5.0, 6.5]} rotY={0} woodTex={doorWoodTex} doorName="Washroom 2 Door" />

      {/* ═══ 4 FULLY FURNISHED 2ND FLOOR ROOMS ═══════════════════════════════ */}
      {/* ROOM 1: WASHROOM 1 (North-West Dilapidated Clinical Restroom) */}
      <HorrorWashroom1 />

      {/* ROOM 2: BEDROOM 1 (South-West Master Victorian Dread) */}
      <HorrorMasterBedroom />

      {/* ROOM 3: WASHROOM 2 (North-East Sinister Luxury Vanity Restroom) */}
      <HorrorWashroom2 />

      {/* ROOM 4: BEDROOM 2 (South-East Occult Asylum & Seance Ward) */}
      <HorrorRitualBedroom />

      {/* UPPER GRAND LANDING GALLERY */}
      <mesh position={[0, 7.8, 25.2]}>
        <boxGeometry args={[3.2, 4.0, 0.08]} />
        <meshStandardMaterial color="#1a1510" roughness={0.8} />
      </mesh>
      <mesh position={[0, 7.8, 25.25]}>
        <planeGeometry args={[2.8, 3.6]} />
        <meshStandardMaterial color="#102030" emissive="#051020" emissiveIntensity={0.6} />
      </mesh>

      {/* ═══ FRONT BALCONY & GOLDEN HIDDEN KEY ════════════════════════════════ */}
      <KeyPedestal position={[0, 5.0, 2.0]} />

      {/* Floating Glowing Key */}
      {!hasKey && (
        <RigidBody
          type="fixed"
          colliders="cuboid"
          position={[0, 6.2, 2.0]}
          sensor
          onIntersectionEnter={(e) => {
            if (e.other.rigidBodyObject?.name === 'player') {
              setInteractPrompt('Press E to Pick Up Gate Key');
              const handleKey = (evt: KeyboardEvent) => {
                if (evt.code === 'KeyE') {
                  setHasKey(true);
                  setInteractPrompt(null);
                  window.removeEventListener('keydown', handleKey);
                }
              };
              window.addEventListener('keydown', handleKey);
            }
          }}
          onIntersectionExit={(e) => {
            if (e.other.rigidBodyObject?.name === 'player') {
              setInteractPrompt(null);
            }
          }}
        >
          <group ref={keyRef}>
            <mesh>
              <torusGeometry args={[0.18, 0.04, 8, 14]} />
              <meshStandardMaterial
                color="#ffd700"
                metalness={0.95}
                roughness={0.15}
                emissive="#ffd700"
                emissiveIntensity={0.6}
              />
            </mesh>
            <mesh position={[0, -0.32, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.45, 8]} />
              <meshStandardMaterial
                color="#ffd700"
                metalness={0.95}
                roughness={0.15}
                emissive="#ffd700"
                emissiveIntensity={0.6}
              />
            </mesh>
            <mesh position={[0.08, -0.45, 0]}>
              <boxGeometry args={[0.14, 0.18, 0.05]} />
              <meshStandardMaterial
                color="#ffd700"
                metalness={0.95}
                roughness={0.15}
                emissive="#ffd700"
                emissiveIntensity={0.6}
              />
            </mesh>
            <pointLight distance={3} intensity={6} color="#ffd700" castShadow={false} />
          </group>
          <CuboidCollider args={[1.6, 1.6, 1.6]} />
        </RigidBody>
      )}

      {/* ═══ MANSION CEILING ═════════════════════════════════════════════════ */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 10, 2.5]}>
        <mesh receiveShadow>
          <boxGeometry args={[32, 1, 47]} />
          <meshStandardMaterial map={panelTex} roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* ═══ DETAILED MAIN ENTRANCE DOOR & ESCAPE TRIGGER ════════════════════ */}
      <CreepyMainDoor hasKey={hasKey} bloodTex={bloodTex} />

      <RigidBody
        type="fixed"
        colliders="cuboid"
        position={[0, 2.4, -19.85]}
        sensor
        onIntersectionEnter={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            setInteractPrompt(hasKey ? 'Press E to Escape Mansion' : 'Grand Gate is Locked. Find the Key on 2F Balcony.');
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

