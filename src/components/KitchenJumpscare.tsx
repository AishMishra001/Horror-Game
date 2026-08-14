'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useGameStore } from '@/store/useGameStore';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const CHASE_SPEED = 12;

export default function KitchenJumpscare() {
  const { gameState, setGameState, isKitchenJumpscareTriggered } = useGameStore();
  const bodyRef = useRef<RapierRigidBody>(null);
  const { camera } = useThree();
  
  // Load the Ravi Kishan face texture
  const raviFaceTex = useTexture('/ravi-kishan-face.png');
  // It shouldn't repeat, just map to the front face
  raviFaceTex.wrapS = THREE.ClampToEdgeWrapping;
  raviFaceTex.wrapT = THREE.ClampToEdgeWrapping;

  const [visible, setVisible] = useState(true);

  useFrame(() => {
    if (!bodyRef.current || gameState !== 'playing' || !isKitchenJumpscareTriggered || !visible) return;

    const monsterPos = bodyRef.current.translation();
    const mPos = new Vector3(monsterPos.x, monsterPos.y, monsterPos.z);
    
    let target = new Vector3();
    target.copy(camera.position);
    target.y = mPos.y; // Keep it on the ground

    const direction = target.clone().sub(mPos).normalize();
    const velocity = direction.multiplyScalar(CHASE_SPEED);
    
    // Preserve vertical velocity (falling/gravity)
    const linVel = bodyRef.current.linvel();
    bodyRef.current.setLinvel({ x: velocity.x, y: linVel.y, z: velocity.z }, true);
  });

  if (!isKitchenJumpscareTriggered || !visible) return null;

  return (
    <RigidBody 
      ref={bodyRef} 
      // Spawn near the kitchen stove
      position={[-10, 2, -13]} 
      colliders="cuboid" 
      lockRotations 
      name="jumpscare_monster"
      onIntersectionEnter={(e) => {
        if (e.other.rigidBodyObject?.name === 'player') {
          // Just scare, don't kill. Vanish on impact!
          setVisible(false);
        }
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 2.5, 1.5]} />
        <meshStandardMaterial attach="material-0" color="#111111" />
        <meshStandardMaterial attach="material-1" color="#111111" />
        <meshStandardMaterial attach="material-2" color="#111111" />
        <meshStandardMaterial attach="material-3" color="#111111" />
        <meshStandardMaterial attach="material-4" map={raviFaceTex} color="#ffcccc" emissive="#330000" />
        <meshStandardMaterial attach="material-5" color="#111111" />
      </mesh>
      {/* Scary red light emitting from the monster */}
      <pointLight position={[0, 1, 1]} distance={10} intensity={20} color="red" />
    </RigidBody>
  );
}
