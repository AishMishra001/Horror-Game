'use client';

import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import Player from './Player';
import Mansion from './Mansion';
import KitchenJumpscare from './KitchenJumpscare';

export default function Game() {
  const { gameState } = useGameStore();

  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Canvas 
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.25]}
        gl={{ 
          antialias: true, 
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        camera={{ fov: 75, near: 0.1, far: 80 }}
      >
        {/* Dark ambient base light */}
        <ambientLight intensity={0.08} color="#151515" />
        
        <Suspense fallback={null}>
          <Physics 
            paused={gameState !== 'playing'}
            gravity={[0, -9.81, 0]}
            timeStep="vary"
          >
            <Player />
            <Mansion />
            <KitchenJumpscare />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
