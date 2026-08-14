'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group } from 'three';
import { useGameStore } from '@/store/useGameStore';

export default function PlayerCharacter() {
  const groupRef = useRef<Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    const pos = useGameStore.getState().playerPos;

    // Position character at player body centre (camera is at eye level ~1.6 above body centre)
    groupRef.current.position.set(pos.x, pos.y - 1.0, pos.z);

    // Face the same horizontal direction as the camera
    groupRef.current.rotation.y = camera.rotation.y + Math.PI; // +PI so we face the camera in mirrors
  });

  return (
    <group ref={groupRef}>
      {/* === HEAD (Hidden in first-person to avoid clipping) === */}
      <mesh position={[0, 1.65, 0]} castShadow visible={false}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#f0c8a0" roughness={0.8} />
      </mesh>

      {/* === HAIR === */}
      <mesh position={[0, 1.83, 0]} castShadow visible={false}>
        <sphereGeometry args={[0.185, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a0f00" roughness={0.9} />
      </mesh>

      {/* === EYES (subtle dark dots) === */}
      <mesh position={[-0.07, 1.66, 0.16]} castShadow visible={false}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#1a0a00" roughness={1} />
      </mesh>
      <mesh position={[0.07, 1.66, 0.16]} castShadow visible={false}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#1a0a00" roughness={1} />
      </mesh>

      {/* === NECK === */}
      <mesh position={[0, 1.43, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.09, 0.18, 12]} />
        <meshStandardMaterial color="#f0c8a0" roughness={0.8} />
      </mesh>

      {/* === TORSO (Navy shirt) === */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.42, 0.6, 0.22]} />
        <meshStandardMaterial color="#1a3a6c" roughness={0.85} />
      </mesh>

      {/* === SHIRT COLLAR === */}
      <mesh position={[0, 1.38, 0.08]} castShadow>
        <boxGeometry args={[0.18, 0.08, 0.06]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
      </mesh>

      {/* === LEFT ARM (upper) === */}
      <mesh position={[-0.27, 1.1, 0]} rotation={[0, 0, 0.15]} castShadow>
        <cylinderGeometry args={[0.07, 0.065, 0.32, 10]} />
        <meshStandardMaterial color="#1a3a6c" roughness={0.85} />
      </mesh>
      {/* === LEFT FOREARM (skin) === */}
      <mesh position={[-0.3, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.05, 0.3, 10]} />
        <meshStandardMaterial color="#f0c8a0" roughness={0.8} />
      </mesh>

      {/* === RIGHT ARM (upper) === */}
      <mesh position={[0.27, 1.1, 0]} rotation={[0, 0, -0.15]} castShadow>
        <cylinderGeometry args={[0.07, 0.065, 0.32, 10]} />
        <meshStandardMaterial color="#1a3a6c" roughness={0.85} />
      </mesh>
      {/* === RIGHT FOREARM (skin) === */}
      <mesh position={[0.3, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.05, 0.3, 10]} />
        <meshStandardMaterial color="#f0c8a0" roughness={0.8} />
      </mesh>

      {/* === BELT === */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[0.44, 0.06, 0.24]} />
        <meshStandardMaterial color="#3a200a" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Belt buckle */}
      <mesh position={[0, 0.78, 0.12]} castShadow>
        <boxGeometry args={[0.06, 0.05, 0.01]} />
        <meshStandardMaterial color="#b8860b" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* === LEFT LEG (dark charcoal trousers) === */}
      <mesh position={[-0.11, 0.42, 0]} castShadow>
        <boxGeometry args={[0.18, 0.62, 0.2]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.9} />
      </mesh>

      {/* === RIGHT LEG === */}
      <mesh position={[0.11, 0.42, 0]} castShadow>
        <boxGeometry args={[0.18, 0.62, 0.2]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.9} />
      </mesh>

      {/* === LEFT SHOE === */}
      <mesh position={[-0.11, 0.07, 0.04]} castShadow>
        <boxGeometry args={[0.16, 0.1, 0.28]} />
        <meshStandardMaterial color="#2a1205" roughness={0.6} />
      </mesh>

      {/* === RIGHT SHOE === */}
      <mesh position={[0.11, 0.07, 0.04]} castShadow>
        <boxGeometry args={[0.16, 0.1, 0.28]} />
        <meshStandardMaterial color="#2a1205" roughness={0.6} />
      </mesh>
    </group>
  );
}
