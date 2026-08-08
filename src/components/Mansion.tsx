'use client';

import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '@/store/useGameStore';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Mesh } from 'three';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const doorAudio = typeof window !== 'undefined' ? new Audio('/stairs and doors.mp3') : null;

function playDoorUnlock() {
  if (typeof window === 'undefined' || !doorAudio) return;
  doorAudio.currentTime = 0;
  doorAudio.play().catch(() => {});
}

export default function Mansion() {
  const { hasKey, setHasKey, setInteractPrompt, setGameState } = useGameStore();
  const flickLightRef = useRef<THREE.PointLight>(null);
  
  const [canInteractKey, setCanInteractKey] = useState(false);
  const [canInteractDoor, setCanInteractDoor] = useState(false);

  const keyRef = useRef<Mesh>(null);
  useFrame(() => {
    if (keyRef.current) {
      keyRef.current.rotation.y += 0.02;
      keyRef.current.position.y = 5.5 + Math.sin(Date.now() * 0.005) * 0.1; // Key is on 2nd floor now
    }
    if (flickLightRef.current) {
      // Creepy flickering logic
      if (Math.random() > 0.9) {
        flickLightRef.current.intensity = 5 + Math.random() * 40;
      }
    }
  });

  const [floorTex, wallTex, panelTex, bloodTex] = useTexture([
    '/textures/floor.png',
    '/textures/wallpaper.png',
    '/textures/panel.png',
    '/textures/bloody_carpet.png'
  ]);

  // Make textures repeat
  [floorTex, wallTex, panelTex, bloodTex].forEach((tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  });

  floorTex.repeat.set(10, 10);
  wallTex.repeat.set(15, 3);
  panelTex.repeat.set(5, 5);
  bloodTex.repeat.set(4, 4);

  return (
    <group>
      {/* --- LIGHTING --- */}
      {/* Ground Floor Main Hall Light */}
      <pointLight position={[0, 4, 0]} intensity={40} distance={20} color="#ffaa55" castShadow />
      
      {/* Second Floor Flickering Chandelier */}
      <pointLight ref={flickLightRef} position={[0, 9, 0]} intensity={30} distance={25} color="#ff7733" castShadow />

      {/* --- GROUND FLOOR --- */}
      {/* Main Hall Bloody Carpet */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[30, 40]} />
          <meshStandardMaterial map={bloodTex} roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Grand Staircase */}
      {Array.from({ length: 10 }).map((_, i) => (
        <RigidBody key={`stair-${i}`} type="fixed" colliders="cuboid" position={[0, i * 0.5 + 0.25, 10 + i]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[8, 0.5, 1]} />
            <meshStandardMaterial map={floorTex} roughness={0.5} />
          </mesh>
        </RigidBody>
      ))}

      {/* --- SECOND FLOOR (y = 5) --- */}
      {/* Back Landing (top of stairs) */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 5, 22.5]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[30, 0.5, 5]} />
          <meshStandardMaterial map={floorTex} roughness={0.5} />
        </mesh>
      </RigidBody>
      
      {/* Left Balcony */}
      <RigidBody type="fixed" colliders="cuboid" position={[-12.5, 5, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[5, 0.5, 40]} />
          <meshStandardMaterial map={floorTex} roughness={0.5} />
        </mesh>
      </RigidBody>

      {/* Right Balcony */}
      <RigidBody type="fixed" colliders="cuboid" position={[12.5, 5, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[5, 0.5, 40]} />
          <meshStandardMaterial map={floorTex} roughness={0.5} />
        </mesh>
      </RigidBody>

      {/* Front Balcony (Bridge) */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 5, -17.5]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[20, 0.5, 5]} />
          <meshStandardMaterial map={floorTex} roughness={0.5} />
        </mesh>
      </RigidBody>

      {/* --- OUTER WALLS --- */}
      <RigidBody type="fixed" colliders="cuboid" position={[-15.5, 5, 2.5]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1, 10, 45]} />
          <meshStandardMaterial map={wallTex} roughness={0.9} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[15.5, 5, 2.5]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1, 10, 45]} />
          <meshStandardMaterial map={wallTex} roughness={0.9} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 5, -20.5]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[32, 10, 1]} />
          <meshStandardMaterial map={wallTex} roughness={0.9} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 5, 25.5]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[32, 10, 1]} />
          <meshStandardMaterial map={wallTex} roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* --- CEILING --- */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 10, 2.5]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[32, 1, 45]} />
          <meshStandardMaterial map={panelTex} roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* --- INTERACTABLES --- */}
      {/* Hidden Key (Moved to 2nd Floor Front Balcony) */}
      {!hasKey && (
        <RigidBody 
          type="fixed" 
          colliders="hull" 
          position={[0, 5.5, -17.5]}
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

      {/* Main Door (Ground Floor Front) */}
      <RigidBody 
        type="fixed" 
        colliders="cuboid" 
        position={[0, 2, -19.9]}
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
