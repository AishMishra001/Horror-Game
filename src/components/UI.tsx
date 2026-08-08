'use client';

import { useGameStore } from '@/store/useGameStore';
import { useEffect } from 'react';

export default function UI() {
  const { gameState, setGameState, hasKey, interactPrompt } = useGameStore();

  // Listen for pause action if needed (or handle in PointerLockControls)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow restarting from gameover/win with 'R' maybe?
      if (e.key === 'r' || e.key === 'R') {
        if (gameState === 'gameover' || gameState === 'win') {
          // Restart logic would likely need to reload or reset scene state too
          window.location.reload(); 
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
      {/* Main Menu */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-black/90 pointer-events-auto flex flex-col items-center justify-center text-red-700 font-mono">
          <h1 className="text-7xl font-bold mb-8 tracking-widest drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] text-center">
            RAVI KISHAN<br/>
            <span className="text-4xl text-red-900">THE MANSION</span>
          </h1>
          <p className="text-gray-400 mb-12 max-w-md text-center">
            Find the key. Unlock the door. Do not let him catch you.
          </p>
          <button 
            onClick={() => setGameState('playing')}
            className="px-8 py-3 mb-8 text-2xl border border-red-700 hover:bg-red-950/50 hover:text-red-500 transition-all duration-300"
          >
            START GAME
          </button>

          <div className="text-gray-500 font-sans text-sm md:text-base grid grid-cols-2 gap-x-12 gap-y-2 bg-black/50 p-6 border border-gray-800 rounded-md">
            <h3 className="col-span-2 text-center text-red-700 font-bold mb-2 tracking-widest font-mono">CONTROLS</h3>
            <div className="text-right">W, A, S, D</div><div className="text-left font-bold text-gray-300">Move</div>
            <div className="text-right">Mouse</div><div className="text-left font-bold text-gray-300">Look</div>
            <div className="text-right">Left Ctrl / C</div><div className="text-left font-bold text-gray-300">Crouch / Hide</div>
            <div className="text-right">E</div><div className="text-left font-bold text-gray-300">Interact</div>
            <div className="text-right">ESC</div><div className="text-left font-bold text-gray-300">Pause</div>
          </div>
        </div>
      )}

      {/* HUD */}
      {gameState === 'playing' && (
        <>
          {/* Crosshair */}
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/50 rounded-full -translate-x-1/2 -translate-y-1/2" />
          
          {/* Key Indicator */}
          <div className="absolute bottom-8 right-8 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full border-2 ${hasKey ? 'border-yellow-500 bg-yellow-500/20' : 'border-gray-700 bg-black/50'} flex items-center justify-center`}>
              <span className={`text-xl ${hasKey ? 'text-yellow-500' : 'text-gray-700'}`}>🗝️</span>
            </div>
            <span className={`font-mono text-sm uppercase ${hasKey ? 'text-yellow-500' : 'text-gray-500'}`}>
              {hasKey ? 'Key Acquired' : 'Find the Key'}
            </span>
          </div>

          {/* Interaction Prompt */}
          {interactPrompt && (
            <div className="absolute top-[60%] text-white font-mono text-xl tracking-wider text-center drop-shadow-md">
              {interactPrompt}
            </div>
          )}
        </>
      )}

      {/* Pause Menu */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-black/80 pointer-events-auto flex flex-col items-center justify-center text-white font-mono">
          <h2 className="text-5xl font-bold mb-8 tracking-widest">PAUSED</h2>
          
          <div className="text-gray-400 font-sans text-sm grid grid-cols-2 gap-x-8 gap-y-2 mb-12">
            <div className="text-right">W, A, S, D</div><div className="text-left text-gray-200">Move</div>
            <div className="text-right">Left Ctrl / C</div><div className="text-left text-gray-200">Crouch</div>
            <div className="text-right">E</div><div className="text-left text-gray-200">Interact</div>
          </div>

          <button 
            onClick={() => setGameState('playing')} // Note: typically PointerLockControls resumes playing when you click
            className="px-8 py-3 mb-4 text-xl border border-gray-500 hover:bg-gray-800 transition-all duration-300"
          >
            CONTINUE
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 text-xl border border-red-900 text-red-600 hover:bg-red-950/50 hover:text-red-500 transition-all duration-300"
          >
            RESTART
          </button>
        </div>
      )}

      {/* Game Over */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-red-950/90 pointer-events-auto flex flex-col items-center justify-center text-red-500 font-mono">
          <h2 className="text-7xl font-bold mb-4 tracking-widest text-red-600 drop-shadow-[0_0_20px_rgba(255,0,0,1)]">
            YOU DIED
          </h2>
          <p className="text-2xl mb-12 text-red-800">
            He found you...
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 text-2xl border border-red-700 hover:bg-red-900/50 hover:text-red-400 transition-all duration-300 shadow-[0_0_10px_rgba(255,0,0,0.5)]"
          >
            TRY AGAIN
          </button>
        </div>
      )}

      {/* Win Screen */}
      {gameState === 'win' && (
        <div className="absolute inset-0 bg-white/90 pointer-events-auto flex flex-col items-center justify-center text-black font-mono">
          <h2 className="text-7xl font-bold mb-4 tracking-widest text-black drop-shadow-[0_0_20px_rgba(255,255,255,1)]">
            ESCAPED
          </h2>
          <p className="text-2xl mb-12 text-gray-700">
            You survived the night.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 text-2xl border border-black hover:bg-black hover:text-white transition-all duration-300"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
