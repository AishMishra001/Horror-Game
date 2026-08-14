'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';

export default function MapUI() {
  const { showMap } = useGameStore();
  const playerIconRef = useRef<HTMLDivElement>(null);
  const floorTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMap) return;

    let animationFrameId: number;
    
    const updateMap = () => {
      const pos = useGameStore.getState().playerPos;
      
      // Map coordinates to UI percentages
      // World Bounds: X: -16 to 16, Z: -22 to 26
      const worldWidth = 32;
      const worldDepth = 48;
      
      const percentX = ((pos.x + 16) / worldWidth) * 100;
      const percentZ = ((pos.z + 22) / worldDepth) * 100;

      if (playerIconRef.current) {
        playerIconRef.current.style.left = `${percentX}%`;
        playerIconRef.current.style.top = `${percentZ}%`;
      }

      if (floorTextRef.current) {
        floorTextRef.current.innerText = pos.y > 4.5 ? '2F' : '1F';
      }

      animationFrameId = requestAnimationFrame(updateMap);
    };

    updateMap();
    return () => cancelAnimationFrame(animationFrameId);
  }, [showMap]);

  if (!showMap) return null;

  // Static Map SVGs to resemble old blueprints
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 pointer-events-auto backdrop-blur-sm">
      <div className="relative w-full max-w-4xl aspect-[2/3] max-h-[90vh] bg-[#1a1a15] border-4 border-[#3a3a2c] shadow-[0_0_50px_rgba(0,0,0,1)] rounded-sm p-4 overflow-hidden font-mono text-[#a39b7d]">
        
        <div className="absolute top-4 left-4 text-3xl tracking-widest font-bold uppercase drop-shadow-md">
          Mansion Map
        </div>
        <div ref={floorTextRef} className="absolute top-4 right-4 text-4xl font-bold tracking-widest text-red-800 drop-shadow-md">
          1F
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 text-sm bg-black/50 p-3 border border-[#3a3a2c]">
          <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-red-600 rounded-full"></div> Player</div>
          <div className="flex items-center gap-2 mb-1"><div className="w-4 h-1 bg-blue-500"></div> Door</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 border border-[#a39b7d] flex items-center justify-center">?</div> Puzzle / Item</div>
        </div>

        {/* Map Grid Container */}
        <div className="relative w-full h-full mt-12 border-2 border-[#3a3a2c]/50 bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')] opacity-90">
          
          {/* Ground Floor Rooms (Approximated based on bounds) */}
          <div className="absolute inset-0">
            {/* Main Hall */}
            <div className="absolute left-[34%] top-[4%] w-[31%] h-[41%] border-2 border-[#a39b7d] bg-[#2a2a22] flex items-center justify-center text-xs opacity-70">Main Hall</div>
            
            {/* Kitchen */}
            <div className="absolute left-[3%] top-[4%] w-[31%] h-[31%] border-2 border-[#a39b7d] bg-[#222a22] flex items-center justify-center text-xs opacity-70">Kitchen</div>
            
            {/* Dining Room */}
            <div className="absolute left-[3%] top-[35%] w-[31%] h-[31%] border-2 border-[#a39b7d] bg-[#2a2222] flex items-center justify-center text-xs opacity-70">Dining Room</div>
            
            {/* Living Room */}
            <div className="absolute left-[65%] top-[4%] w-[31%] h-[62%] border-2 border-[#a39b7d] bg-[#22222a] flex items-center justify-center text-xs opacity-70">Living Room</div>
            
            {/* Grand Staircase */}
            <div className="absolute left-[34%] top-[45%] w-[31%] h-[20%] border-2 border-[#a39b7d] bg-[#3a3a2c] flex items-center justify-center text-xs opacity-70">Stairs</div>
          </div>

          {/* Player Indicator */}
          <div 
            ref={playerIconRef}
            className="absolute w-4 h-4 bg-red-600 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_red] transition-all duration-75 z-10"
            style={{ left: '50%', top: '50%' }}
          >
          </div>
        </div>

      </div>
    </div>
  );
}
