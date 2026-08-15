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

  const mPosVec = useRef(new Vector3());
  const targetVec = useRef(new Vector3());
  const dirVec = useRef(new Vector3());
  
  useFrame((_, rawDelta) => {
    if (!bodyRef.current || gameState !== 'playing') return;

    const delta = Math.min(rawDelta, 0.05);
    const monsterPos = bodyRef.current.translation();
    mPosVec.current.set(monsterPos.x, monsterPos.y, monsterPos.z);
    
    // Simple Line of Sight check (distance based for now, raycasting is better but heavier)
    const distToPlayer = mPosVec.current.distanceTo(camera.position);
    
    if (distToPlayer < SIGHT_RANGE && state === 'patrol') {
      setState('chase');
    } else if (distToPlayer > SIGHT_RANGE * 1.5 && state === 'chase') {
      setState('patrol');
    }

    let speed = 0;

    if (state === 'chase') {
      targetVec.current.copy(camera.position);
      targetVec.current.y = mPosVec.current.y; // Keep it on the ground
      speed = CHASE_SPEED;
    } else {
      targetVec.current.copy(WAYPOINTS[currentWaypoint]);
      speed = PATROL_SPEED;
      
      if (mPosVec.current.distanceTo(targetVec.current) < 1) {
        setCurrentWaypoint((prev) => (prev + 1) % WAYPOINTS.length);
      }
    }

    dirVec.current.subVectors(targetVec.current, mPosVec.current).normalize();
    const velocity = dirVec.current.multiplyScalar(speed);
    
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
