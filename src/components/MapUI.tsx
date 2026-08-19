'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';

export default function MapUI() {
  const showMap = useGameStore((s) => s.showMap);
  const hasKey = useGameStore((s) => s.hasKey);
  const hasFlashlight = useGameStore((s) => s.hasFlashlight);

  const playerIconRef = useRef<HTMLDivElement>(null);
  const floorTextRef = useRef<HTMLDivElement>(null);
  const floorSubtextRef = useRef<HTMLDivElement>(null);
  const floor1FRef = useRef<HTMLDivElement>(null);
  const floor2FRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMap) return;

    let animationFrameId: number;

    const updateMap = () => {
      const pos = useGameStore.getState().playerPos;

      // Map coordinates to UI percentages
      // World Bounds: X: -16 to 16, Z: -22 to 26
      const worldWidth = 32;
      const worldDepth = 48;

      const percentX = Math.min(98, Math.max(2, ((pos.x + 16) / worldWidth) * 100));
      const percentZ = Math.min(98, Math.max(2, ((pos.z + 22) / worldDepth) * 100));

      if (playerIconRef.current) {
        playerIconRef.current.style.left = `${percentX}%`;
        playerIconRef.current.style.top = `${percentZ}%`;
      }

      const is2F = pos.y >= 4.5;
      const floorStr = is2F ? '2F' : '1F';
      const subtextStr = is2F 
        ? 'SECOND FLOOR - PRIVATE QUARTERS & BALCONY' 
        : 'GROUND FLOOR - ENTRANCE HALL & KITCHEN';

      if (floorTextRef.current && floorTextRef.current.innerText !== floorStr) {
        floorTextRef.current.innerText = floorStr;
      }
      if (floorSubtextRef.current && floorSubtextRef.current.innerText !== subtextStr) {
        floorSubtextRef.current.innerText = subtextStr;
      }
      if (floor1FRef.current) {
        floor1FRef.current.style.display = is2F ? 'none' : 'block';
      }
      if (floor2FRef.current) {
        floor2FRef.current.style.display = is2F ? 'block' : 'none';
      }

      animationFrameId = requestAnimationFrame(updateMap);
    };

    updateMap();
    return () => cancelAnimationFrame(animationFrameId);
  }, [showMap]);

  if (!showMap) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 pointer-events-auto backdrop-blur-md">
      <div className="relative w-full max-w-4xl aspect-[2/3] max-h-[90vh] bg-[#151410] border-4 border-[#3a3525] shadow-[0_0_60px_rgba(0,0,0,1)] rounded-sm p-6 overflow-hidden font-mono text-[#b3a88a]">
        {/* Header Bar */}
        <div className="flex justify-between items-center border-b border-[#3a3525] pb-2 mb-2">
          <div>
            <div className="text-xl md:text-3xl tracking-widest font-black uppercase text-red-700 drop-shadow-md">
              MANSION BLUEPRINT
            </div>
            <div ref={floorSubtextRef} className="text-[10px] md:text-xs text-gray-400 tracking-wider truncate max-w-[200px] md:max-w-none">
              GROUND FLOOR - ENTRANCE HALL & KITCHEN
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div
              ref={floorTextRef}
              className="text-3xl md:text-5xl font-black tracking-widest text-red-600 drop-shadow-[0_0_12px_rgba(255,0,0,0.5)]"
            >
              1F
            </div>
            {/* Mobile / Desktop Close Button */}
            <button
              onClick={() => useGameStore.getState().setShowMap(false)}
              className="px-3 py-1 rounded bg-red-950/80 border border-red-700 text-red-300 font-bold text-xs md:text-sm hover:bg-red-800 active:scale-95 transition-all cursor-pointer shadow-md"
            >
              ✕ CLOSE
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-2 md:bottom-4 left-3 md:left-6 right-3 md:right-6 flex flex-wrap items-center justify-between text-[10px] md:text-xs bg-black/80 p-2 md:p-2.5 border border-[#3a3525] rounded z-20 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-2.5 h-2.5 bg-red-600 rounded-full border border-white animate-pulse" />
            <span className="text-gray-300 font-semibold">Player</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-3 h-3 bg-amber-500/20 border border-amber-400 rounded-sm flex items-center justify-center text-[8px] md:text-[10px] text-amber-300 font-bold">
              🔦
            </div>
            <span className="text-amber-300 font-semibold">Flashlight</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-3 h-3 bg-yellow-500/20 border border-yellow-400 rounded-sm flex items-center justify-center text-[8px] md:text-[10px] text-yellow-300 font-bold">
              🗝
            </div>
            <span className="text-yellow-400 font-semibold">Key Pedestal</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-3.5 h-1.5 bg-amber-700 rounded-sm" />
            <span className="text-gray-300 font-semibold">Door / Archway</span>
          </div>
          <div className="text-gray-400 font-mono text-[10px] md:text-xs">Tap [✕] or [M] to Close</div>
        </div>

        {/* Blueprint Map Container */}
        <div className="relative w-full h-[calc(100%-110px)] border-2 border-[#3a3525]/80 bg-[#1a1914] rounded overflow-hidden">
          {/* Grid lines overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#332d2015_1px,transparent_1px),linear-gradient(to_bottom,#332d2015_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* ═════════ 1F GROUND FLOOR BLUEPRINT ═════════ */}
          <div ref={floor1FRef} className="absolute inset-0 p-3">
            {/* Main Entrance & Lobby */}
            <div className="absolute left-[33%] top-[4%] w-[34%] h-[40%] border-2 border-red-950 bg-red-950/20 flex flex-col items-center justify-center text-xs font-bold text-gray-300 shadow-inner">
              <span className="text-red-500 mb-1">MAIN HALL</span>
              <span className="text-[10px] text-gray-500">Grand Double Gate 🚪</span>
            </div>

            {/* Decayed Horror Kitchen */}
            <div className="absolute left-[3%] top-[4%] w-[28%] h-[32%] border-2 border-[#3a4430] bg-[#1e2a18]/40 flex flex-col items-center justify-center text-xs font-bold text-emerald-400 shadow-inner p-1 text-center">
              <span>KITCHEN</span>
              {!hasFlashlight ? (
                <span className="text-[9px] text-amber-300 mt-1 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/60 animate-pulse">
                  🔦 FLASHLIGHT IN FRIDGE
                </span>
              ) : (
                <span className="text-[9px] text-red-400 mt-1">⚠ Decayed Danger</span>
              )}
            </div>

            {/* Dining Room */}
            <div className="absolute left-[3%] top-[38%] w-[28%] h-[26%] border-2 border-[#3a3525] bg-[#221c16]/40 flex flex-col items-center justify-center text-xs font-bold text-amber-200">
              <span>DINING ROOM</span>
            </div>

            {/* Decayed Horror Bathroom / Restroom */}
            <div className="absolute left-[69%] top-[4%] w-[28%] h-[32%] border-2 border-[#2a4d50] bg-[#142628]/40 flex flex-col items-center justify-center text-xs font-bold text-cyan-300 shadow-inner p-1 text-center">
              <span>BATHROOM</span>
              <span className="text-[9px] text-cyan-400 mt-1 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/50">
                🛁 Decayed Tub & Scrawl
              </span>
            </div>

            {/* Living Room / Parlor */}
            <div className="absolute left-[69%] top-[38%] w-[28%] h-[26%] border-2 border-[#3a3525] bg-[#1c1822]/40 flex flex-col items-center justify-center text-xs font-bold text-purple-200">
              <span>BALLROOM & PARLOR</span>
            </div>

            {/* Grand Staircase Ascent */}
            <div className="absolute left-[33%] top-[46%] w-[34%] h-[20%] border-2 border-amber-900/80 bg-amber-950/30 flex flex-col items-center justify-center text-xs font-bold text-amber-400">
              <span>GRAND STAIRCASE</span>
              <span className="text-[10px] text-yellow-300 mt-1">▲ Up to 2F Balcony</span>
            </div>
          </div>

          {/* ═════════ 2F UPPER FLOOR BLUEPRINT ═════════ */}
          <div ref={floor2FRef} className="absolute inset-0 p-3" style={{ display: 'none' }}>
            {/* Front Balcony (Where Key is located) */}
            <div className="absolute left-[33%] top-[4%] w-[34%] h-[24%] border-2 border-yellow-600/70 bg-yellow-950/25 flex flex-col items-center justify-center text-xs font-bold text-yellow-300 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
              <span className="text-yellow-400 tracking-wider">FRONT BALCONY</span>
              {!hasKey ? (
                <span className="text-[10px] text-yellow-200 mt-1 bg-yellow-900/60 px-2 py-0.5 rounded border border-yellow-500/50 animate-pulse">
                  🗝 GATE KEY HERE
                </span>
              ) : (
                <span className="text-[10px] text-green-400 mt-1">✓ KEY COLLECTED</span>
              )}
            </div>

            {/* Room 1: Washroom 1 (NW Blood Bath) */}
            <div className="absolute left-[3%] top-[4%] w-[28%] h-[34%] border-2 border-cyan-900/70 bg-cyan-950/30 flex flex-col items-center justify-center text-xs font-bold text-cyan-300">
              <span>WASHROOM 1</span>
              <span className="text-[9px] text-cyan-500 mt-0.5">Clawfoot Tub & Mirror</span>
            </div>

            {/* Room 2: Bedroom 1 (SW Master Bedroom) */}
            <div className="absolute left-[3%] top-[40%] w-[28%] h-[40%] border-2 border-red-900/70 bg-red-950/30 flex flex-col items-center justify-center text-xs font-bold text-red-300">
              <span>MASTER BEDROOM</span>
              <span className="text-[9px] text-red-400 mt-0.5">4-Poster Bed & Fireplace</span>
            </div>

            {/* Room 3: Washroom 2 (NE Medical Restroom) */}
            <div className="absolute left-[69%] top-[4%] w-[28%] h-[34%] border-2 border-emerald-900/70 bg-emerald-950/30 flex flex-col items-center justify-center text-xs font-bold text-emerald-300">
              <span>WASHROOM 2</span>
              <span className="text-[9px] text-emerald-500 mt-0.5">Twin Vanity & Toilet</span>
            </div>

            {/* Room 4: Bedroom 2 (SE Ritual Room) */}
            <div className="absolute left-[69%] top-[40%] w-[28%] h-[40%] border-2 border-rose-900/70 bg-rose-950/30 flex flex-col items-center justify-center text-xs font-bold text-rose-300">
              <span>RITUAL BEDROOM</span>
              <span className="text-[9px] text-rose-400 mt-0.5">Pentagram & Bookshelf</span>
            </div>

            {/* Grand Staircase Descent */}
            <div className="absolute left-[33%] top-[30%] w-[34%] h-[22%] border-2 border-dashed border-amber-800/60 bg-black/40 flex flex-col items-center justify-center text-xs font-bold text-amber-500">
              <span>STAIRWELL OPENING</span>
              <span className="text-[10px] text-gray-400 mt-0.5">▼ Down to 1F</span>
            </div>

            {/* Grand Upper Landing Gallery */}
            <div className="absolute left-[33%] top-[54%] w-[34%] h-[26%] border-2 border-amber-900/80 bg-amber-950/30 flex flex-col items-center justify-center text-xs font-bold text-amber-300">
              <span>UPPER LANDING</span>
              <span className="text-[9px] text-amber-500 mt-0.5">Gothic Stained Glass</span>
            </div>

            {/* Walkway Connector Highlights */}
            <div className="absolute left-[29%] top-[4%] w-[4%] h-[76%] border-l-2 border-r-2 border-amber-700/40 bg-amber-950/10 pointer-events-none" />
            <div className="absolute left-[67%] top-[4%] w-[4%] h-[76%] border-l-2 border-r-2 border-amber-700/40 bg-amber-950/10 pointer-events-none" />
          </div>


          {/* Player Real-Time Tracking Dot */}
          <div
            ref={playerIconRef}
            className="absolute w-4 h-4 bg-red-600 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_12px_red] transition-all duration-75 z-30"
            style={{ left: '50%', top: '50%' }}
          >
            <div className="w-full h-full rounded-full animate-ping bg-red-500/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
