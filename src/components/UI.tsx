'use client';

import { useGameStore } from '@/store/useGameStore';
import { useEffect, useRef } from 'react';
import MapUI from './MapUI';
import { playCreepyAudio } from '@/utils/creepyAudio';

export default function UI() {
  const { 
    gameState, 
    setGameState, 
    hasKey, 
    interactPrompt, 
    isKitchenJumpscareTriggered,
    isSprinting,
    stamina 
  } = useGameStore();

  const hasPlayedAudioRef = useRef(false);
  const jumpscareAudioPlayed = useRef(false);

  // Restart shortcut on Game Over / Win
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (gameState === 'gameover' || gameState === 'win') {
          window.location.reload(); 
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Jumpscare event handler
  useEffect(() => {
    if (isKitchenJumpscareTriggered && !jumpscareAudioPlayed.current) {
      jumpscareAudioPlayed.current = true;
      playCreepyAudio('/peshaan-ravi-kishan.mp3');
      
      const jsAudio = new Audio('/peshaan-ravi-kishan.mp3');
      jsAudio.volume = 1;
      jsAudio.play().catch(() => {});
      
      const flash = document.createElement('div');
      flash.className = 'fixed inset-0 bg-red-700/60 z-50 pointer-events-none transition-opacity duration-1000';
      document.body.appendChild(flash);
      setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 1000);
      }, 50);
    }
  }, [isKitchenJumpscareTriggered]);

  const handleStartGame = () => {
    setGameState('playing');
    if (!hasPlayedAudioRef.current) {
      hasPlayedAudioRef.current = true;
      playCreepyAudio('/koteshwaraye-ravi-kishan.mp3');
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center font-sans">
      {/* ═══ MAIN MENU ════════════════════════════════════════════════════ */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-black/95 pointer-events-auto flex flex-col items-center justify-center text-red-600 font-mono px-4">
          <div className="text-center mb-8">
            <h1 className="text-6xl md:text-8xl font-black tracking-widest text-red-600 drop-shadow-[0_0_25px_rgba(255,0,0,0.8)]">
              RAVI KISHAN
            </h1>
            <p className="text-2xl md:text-3xl text-red-800 tracking-[0.3em] uppercase mt-2">
              The Haunted Mansion
            </p>
          </div>

          <p className="text-gray-400 mb-10 max-w-lg text-center text-sm md:text-base leading-relaxed">
            Search the eerie corridors and the decayed kitchen. Uncover the hidden key to unlock the grand gates. Stay in the shadows.
          </p>

          <button 
            onClick={handleStartGame}
            className="px-10 py-4 mb-10 text-2xl font-bold tracking-wider border-2 border-red-700 text-red-500 bg-red-950/30 hover:bg-red-900/60 hover:text-white hover:border-red-500 transition-all duration-300 shadow-[0_0_20px_rgba(255,0,0,0.4)] rounded-sm cursor-pointer"
          >
            ENTER THE MANSION
          </button>

          <div className="text-gray-400 text-xs md:text-sm grid grid-cols-2 gap-x-8 gap-y-2.5 bg-black/70 p-6 border border-red-950/60 rounded-md backdrop-blur-sm max-w-md w-full">
            <div className="col-span-2 text-center text-red-500 font-bold mb-1 tracking-widest uppercase">CONTROLS</div>
            <div className="text-right text-gray-500 font-mono">W, A, S, D</div><div className="text-left font-semibold text-gray-200">Move</div>
            <div className="text-right text-gray-500 font-mono">Shift (Hold)</div><div className="text-left font-semibold text-gray-200">Sprint</div>
            <div className="text-right text-gray-500 font-mono">C / Left Ctrl</div><div className="text-left font-semibold text-gray-200">Crouch / Sneak</div>
            <div className="text-right text-gray-500 font-mono">E</div><div className="text-left font-semibold text-gray-200">Interact (Door / Fridge / Key)</div>
            <div className="text-right text-gray-500 font-mono">M</div><div className="text-left font-semibold text-gray-200">View Mansion Map</div>
            <div className="text-right text-gray-500 font-mono">ESC</div><div className="text-left font-semibold text-gray-200">Pause</div>
          </div>
        </div>
      )}

      {/* ═══ IN-GAME HUD ═══════════════════════════════════════════════════ */}
      {gameState === 'playing' && (
        <>
          {/* Top-Left Objective Bar */}
          <div className="absolute top-6 left-6 flex flex-col gap-1 pointer-events-none select-none">
            <div className="text-[11px] font-mono uppercase tracking-widest text-red-500 font-bold flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-ping" />
              CURRENT OBJECTIVE
            </div>
            <div className="text-base md:text-lg font-mono text-gray-200 bg-black/60 px-3.5 py-1.5 rounded border border-gray-800 backdrop-blur-sm shadow-md">
              {hasKey ? '🔓 Unlock the Grand Main Entrance Gate to Escape' : '🗝️ Search the 2nd Floor Balcony for the Hidden Key'}
            </div>
          </div>

          {/* Dynamic Crosshair / Interaction Reticle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {interactPrompt ? (
              <div className="w-5 h-5 rounded-full border-2 border-yellow-400 bg-yellow-400/20 animate-pulse flex items-center justify-center shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-white/70 shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
            )}
          </div>

          {/* Interaction Toast Prompt */}
          {interactPrompt && (
            <div className="absolute top-[62%] px-5 py-2 rounded-full bg-black/85 border border-yellow-500/80 text-yellow-300 font-mono text-lg tracking-wider text-center drop-shadow-[0_0_15px_rgba(0,0,0,0.9)] backdrop-blur-md animate-bounce">
              {interactPrompt}
            </div>
          )}

          {/* Bottom-Center Stamina Bar (Direct DOM update for zero React re-render lag) */}
          <div 
            id="stamina-container" 
            className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-black/60 rounded-full overflow-hidden border border-gray-800 transition-opacity duration-300 opacity-0"
          >
            <div 
              id="stamina-progress-bar"
              className="h-full bg-amber-400 w-full transition-[width] duration-75"
            />
          </div>

          {/* Bottom-Left Controls Reminder */}
          <div className="absolute bottom-6 left-6 text-gray-500 font-mono text-xs hidden md:flex items-center gap-4 bg-black/40 px-3 py-1.5 rounded border border-gray-900 backdrop-blur-sm">
            <span><strong className="text-gray-300">[SHIFT]</strong> Sprint</span>
            <span><strong className="text-gray-300">[C]</strong> Crouch</span>
            <span><strong className="text-gray-300">[E]</strong> Interact</span>
            <span><strong className="text-gray-300">[M]</strong> Map</span>
          </div>

          {/* Bottom-Right Key Status Indicator */}
          <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-black/60 px-4 py-2 rounded border border-gray-800 backdrop-blur-sm shadow-md">
            <div className={`w-9 h-9 rounded-full border-2 ${hasKey ? 'border-yellow-400 bg-yellow-400/20 shadow-[0_0_12px_rgba(255,215,0,0.6)]' : 'border-gray-700 bg-black/40'} flex items-center justify-center text-lg`}>
              {hasKey ? '🗝️' : '🔒'}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">GATE KEY</span>
              <span className={`font-mono text-sm font-bold uppercase ${hasKey ? 'text-yellow-400' : 'text-gray-500'}`}>
                {hasKey ? 'ACQUIRED' : 'MISSING'}
              </span>
            </div>
          </div>
        </>
      )}

      {/* ═══ PAUSE MENU ═══════════════════════════════════════════════════ */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-black/85 pointer-events-auto flex flex-col items-center justify-center text-white font-mono z-40 backdrop-blur-sm">
          <h2 className="text-5xl font-bold mb-6 tracking-widest text-red-600 drop-shadow-[0_0_15px_rgba(255,0,0,0.7)]">
            GAME PAUSED
          </h2>
          
          <div className="text-gray-400 text-sm grid grid-cols-2 gap-x-8 gap-y-2 mb-8 bg-black/60 p-6 border border-gray-800 rounded-md">
            <div className="text-right text-gray-500 font-mono">W, A, S, D</div><div className="text-left text-gray-200">Move</div>
            <div className="text-right text-gray-500 font-mono">Shift (Hold)</div><div className="text-left text-gray-200">Sprint</div>
            <div className="text-right text-gray-500 font-mono">Left Ctrl / C</div><div className="text-left text-gray-200">Crouch</div>
            <div className="text-right text-gray-500 font-mono">E</div><div className="text-left text-gray-200">Interact</div>
            <div className="text-right text-gray-500 font-mono">M</div><div className="text-left text-gray-200">Map</div>
          </div>

          <div className="flex flex-col gap-3 w-64">
            <button 
              onClick={() => setGameState('playing')}
              className="py-3 text-lg font-bold border border-gray-600 bg-gray-900/50 hover:bg-gray-800 hover:text-white transition-all duration-300 rounded cursor-pointer"
            >
              RESUME
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="py-3 text-lg font-bold border border-red-900 text-red-500 hover:bg-red-950/60 hover:text-red-300 transition-all duration-300 rounded cursor-pointer"
            >
              RESTART
            </button>
          </div>
        </div>
      )}

      {/* ═══ GAME OVER SCREEN ═════════════════════════════════════════════ */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-red-950/95 pointer-events-auto flex flex-col items-center justify-center text-red-500 font-mono z-50 px-4">
          <h2 className="text-7xl md:text-8xl font-black mb-4 tracking-widest text-red-600 drop-shadow-[0_0_30px_rgba(255,0,0,1)]">
            YOU DIED
          </h2>
          <p className="text-2xl md:text-3xl mb-10 text-red-800 font-serif italic">
            You became part of the mansion...
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 text-2xl font-bold border-2 border-red-700 bg-red-900/40 hover:bg-red-800 hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,0,0,0.6)] rounded cursor-pointer"
          >
            TRY AGAIN (R)
          </button>
        </div>
      )}

      {/* ═══ ESCAPE / WIN SCREEN ═══════════════════════════════════════════ */}
      {gameState === 'win' && (
        <div className="absolute inset-0 bg-black/95 pointer-events-auto flex flex-col items-center justify-center text-white font-mono z-50 px-4">
          <h2 className="text-7xl md:text-8xl font-black mb-4 tracking-widest text-white drop-shadow-[0_0_30px_rgba(255,255,255,1)]">
            YOU ESCAPED
          </h2>
          <p className="text-2xl md:text-3xl mb-10 text-gray-400 font-serif italic">
            You survived the nightmare.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 text-2xl font-bold border-2 border-white bg-white/10 hover:bg-white hover:text-black transition-all duration-300 rounded cursor-pointer"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* Map UI Overlay */}
      <MapUI />
    </div>
  );
}
