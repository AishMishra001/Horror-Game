'use client';

import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import { useGameStore } from '@/store/useGameStore';
import Player from './Player';
import Mansion from './Mansion';
import Monster from './Monster';

export default function Game() {
  const { gameState } = useGameStore();

  // Ensure game is mounted only when we start? Actually it's better to keep Canvas always mounted and active to avoid load times, but pause physics/input when not playing.
  
  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Canvas shadows camera={{ fov: 75 }}>
        {/* We use a very dark ambient light, relying mostly on the player's flashlight */}
        <ambientLight intensity={0.05} color="#111" />
        
        <Suspense fallback={null}>
          <Physics 
            paused={gameState !== 'playing'}
            gravity={[0, -9.81, 0]}
          >
            <Player />
            <Mansion />
            {/* <Monster /> Temporarily paused for exploration */}
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
