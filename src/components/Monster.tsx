'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useGameStore } from '@/store/useGameStore';
import { PositionalAudio } from '@react-three/drei';

const WAYPOINTS = [
  new Vector3(10, 0, 10),
  new Vector3(10, 0, -10),
  new Vector3(-10, 0, -10),
  new Vector3(-10, 0, 10),
];

const PATROL_SPEED = 2;
const CHASE_SPEED = 4;
const SIGHT_RANGE = 15;

export default function Monster() {
  const { gameState, setGameState } = useGameStore();
  const bodyRef = useRef<RapierRigidBody>(null);
  const { camera } = useThree();
  
  const [state, setState] = useState<'patrol' | 'chase'>('patrol');
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  
  useFrame(() => {
    if (!bodyRef.current || gameState !== 'playing') return;

    const monsterPos = bodyRef.current.translation();
    const mPos = new Vector3(monsterPos.x, monsterPos.y, monsterPos.z);
    
    // Simple Line of Sight check (distance based for now, raycasting is better but heavier)
    const distToPlayer = mPos.distanceTo(camera.position);
    
    if (distToPlayer < SIGHT_RANGE && state === 'patrol') {
      setState('chase');
    } else if (distToPlayer > SIGHT_RANGE * 1.5 && state === 'chase') {
      setState('patrol');
    }

    let target = new Vector3();
    let speed = 0;

    if (state === 'chase') {
      target.copy(camera.position);
      target.y = mPos.y; // Keep it on the ground
      speed = CHASE_SPEED;
    } else {
      target.copy(WAYPOINTS[currentWaypoint]);
      speed = PATROL_SPEED;
      
      if (mPos.distanceTo(target) < 1) {
        setCurrentWaypoint((prev) => (prev + 1) % WAYPOINTS.length);
      }
    }

    const direction = target.clone().sub(mPos).normalize();
    const velocity = direction.multiplyScalar(speed);
    
    // Preserve vertical velocity (falling/gravity)
    const linVel = bodyRef.current.linvel();
    bodyRef.current.setLinvel({ x: velocity.x, y: linVel.y, z: velocity.z }, true);
  });

  return (
    <RigidBody 
      ref={bodyRef} 
      position={[0, 2, -10]} 
      colliders="cuboid" 
      lockRotations 
      name="monster"
      onIntersectionEnter={(e) => {
        if (e.other.rigidBodyObject?.name === 'player') {
          setGameState('gameover');
        }
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#8b0000" />
        
        {/* Placeholder Audio. Ensure files exist in public/audio/ or they will crash the app! */}
        {/* Uncomment these when you add chase_theme.mp3 and ravi_mumble.mp3 to the public/audio/ folder:
        <PositionalAudio
          url="/audio/chase_theme.mp3"
          distance={5}
          loop
          autoplay={state === 'chase'}
        />
        <PositionalAudio
          url="/audio/ravi_mumble.mp3"
          distance={3}
          loop
          autoplay={state === 'patrol'}
        /> 
        */}
      </mesh>
    </RigidBody>
  );
}
