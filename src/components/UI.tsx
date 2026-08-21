'use client';

import { useGameStore } from '@/store/useGameStore';
import { useTouchControls, enterFullscreenLandscape } from '@/store/useTouchControls';
import { useEffect, useRef, useState } from 'react';
import MapUI from './MapUI';
import MobileControls from './MobileControls';
import LandscapePrompt from './LandscapePrompt';
import { playCreepyAudio, stopCreepyAudio, playFlashlightClickSound } from '@/utils/creepyAudio';

export default function UI() {
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);
  const hasKey = useGameStore((s) => s.hasKey);
  const hasFlashlight = useGameStore((s) => s.hasFlashlight);
  const isFlashlightOn = useGameStore((s) => s.isFlashlightOn);
  const toggleFlashlight = useGameStore((s) => s.toggleFlashlight);
  const interactPrompt = useGameStore((s) => s.interactPrompt);
  const isKitchenJumpscareActive = useGameStore((s) => s.isKitchenJumpscareActive);
  const endKitchenJumpscare = useGameStore((s) => s.endKitchenJumpscare);
  const isStairDanceActive = useGameStore((s) => s.isStairDanceActive);
  const endStairDance = useGameStore((s) => s.endStairDance);

  const isTouchDevice = useTouchControls((s) => s.isTouchDevice);

  const hasPlayedAudioRef = useRef(false);
  const jumpscareAudioRef = useRef<HTMLAudioElement | null>(null);
  const danceAudioRef = useRef<HTMLAudioElement | null>(null);
  const prevFlashlightRef = useRef(false);
  const [showPickupToast, setShowPickupToast] = useState(false);
  const fpsRef = useRef<HTMLDivElement>(null);

  // High performance 60+ FPS counter (direct DOM update)
  useEffect(() => {
    if (gameState !== 'playing') return;
    let frames = 0;
    let lastTime = performance.now();
    let animId: number;

    const calculateFps = (now: number) => {
      frames++;
      if (now >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (now - lastTime));
        if (fpsRef.current) {
          fpsRef.current.innerText = `${fps} FPS`;
          fpsRef.current.style.color = fps >= 55 ? '#4ade80' : fps >= 30 ? '#facc15' : '#f87171';
        }
        frames = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(calculateFps);
    };

    animId = requestAnimationFrame(calculateFps);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  // Flashlight pickup toast notification
  useEffect(() => {
    if (hasFlashlight && !prevFlashlightRef.current) {
      setShowPickupToast(true);
      const timer = setTimeout(() => setShowPickupToast(false), 5000);
      return () => clearTimeout(timer);
    }
    prevFlashlightRef.current = hasFlashlight;
  }, [hasFlashlight]);

  // Restart, Pause, and Stair Dance skip shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (useGameStore.getState().isStairDanceActive) {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
          useGameStore.getState().endStairDance();
          if (danceAudioRef.current) {
            danceAudioRef.current.pause();
          }
          return;
        }
      }

      if (e.key === 'r' || e.key === 'R') {
        if (gameState === 'gameover' || gameState === 'win') {
          window.location.reload(); 
        }
      }
      if (e.code === 'Escape') {
        const current = useGameStore.getState().gameState;
        if (current === 'playing') {
          setGameState('paused');
        } else if (current === 'paused') {
          setGameState('playing');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, setGameState]);

  // Stair Dance audio lifecycle handler (synced to "Main Teri Queen" song completion)
  useEffect(() => {
    if (isStairDanceActive) {
      const audio = new Audio('/ravi-dance-teri-queen.mp3');
      audio.volume = 1.0;
      danceAudioRef.current = audio;

      const handleAudioEnd = () => {
        endStairDance();
      };

      audio.addEventListener('ended', handleAudioEnd);
      audio.addEventListener('error', handleAudioEnd);

      audio.play().catch(() => {});

      return () => {
        audio.removeEventListener('ended', handleAudioEnd);
        audio.removeEventListener('error', handleAudioEnd);
        audio.pause();
      };
    } else {
      if (danceAudioRef.current) {
        danceAudioRef.current.pause();
      }
    }
  }, [isStairDanceActive, endStairDance]);

  // Jumpscare audio lifecycle handler (synced directly to audio completion)
  useEffect(() => {
    if (isKitchenJumpscareActive) {
      const audio = new Audio('/peshaan-ravi-kishan.mp3');
      audio.volume = 1.0;
      jumpscareAudioRef.current = audio;

      const handleAudioEnd = () => {
        endKitchenJumpscare();
      };

      audio.addEventListener('ended', handleAudioEnd);
      audio.addEventListener('error', handleAudioEnd);

      audio.play().catch(() => {});

      // Safety fallback timer (~3.35s) in case of browser audio policy blocks or silent finish
      const fallbackTimer = setTimeout(() => {
        endKitchenJumpscare();
      }, 3400);

      return () => {
        audio.removeEventListener('ended', handleAudioEnd);
        audio.removeEventListener('error', handleAudioEnd);
        clearTimeout(fallbackTimer);
      };
    }
  }, [isKitchenJumpscareActive, endKitchenJumpscare]);

  const handleStartGame = () => {
    setGameState('playing');
    if (isTouchDevice) {
      enterFullscreenLandscape().catch(() => {});
    }
    if (!hasPlayedAudioRef.current) {
      hasPlayedAudioRef.current = true;
      try {
        playCreepyAudio('/koteshwaraye-ravi-kishan.mp3');
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center font-sans">
      {/* ═══ LANDSCAPE ORIENTATION PROMPT OVERLAY ═══ */}
      <LandscapePrompt />

      {/* ═══ ON-SCREEN MOBILE JOYSTICK & ACTION BUTTONS ═══ */}
      <MobileControls />

      {/* ═══ MAIN MENU ════════════════════════════════════════════════════ */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-black/95 pointer-events-auto flex flex-col items-center justify-center text-red-600 font-mono px-4 py-6 overflow-y-auto">
          <div className="text-center mb-4 md:mb-6">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-widest text-red-600 drop-shadow-[0_0_25px_rgba(255,0,0,0.8)]">
              RAVI KISHAN
            </h1>
            <p className="text-lg sm:text-2xl md:text-3xl text-red-800 tracking-[0.3em] uppercase mt-1 md:mt-2">
              The Haunted Mansion
            </p>
          </div>

          <p className="text-gray-400 mb-6 md:mb-8 max-w-lg text-center text-xs sm:text-sm md:text-base leading-relaxed px-2">
            Search the eerie corridors and the decayed kitchen. Find the flashlight in the fridge and uncover the hidden key to unlock the grand gates.
          </p>

          <button 
            onClick={handleStartGame}
            className="px-8 md:px-12 py-3 md:py-4 mb-6 md:mb-8 text-lg sm:text-xl md:text-2xl font-bold tracking-wider border-2 border-red-700 text-red-500 bg-red-950/30 hover:bg-red-900/60 hover:text-white hover:border-red-500 active:scale-95 transition-all duration-300 shadow-[0_0_25px_rgba(255,0,0,0.4)] rounded-sm cursor-pointer"
          >
            ENTER THE MANSION
          </button>

          {/* Dual Controls Info (Desktop & Mobile Friendly) */}
          <div className="text-gray-400 text-xs md:text-sm bg-black/80 p-4 md:p-6 border border-red-950/80 rounded-md backdrop-blur-sm max-w-lg w-full">
            <div className="text-center text-red-500 font-bold mb-3 tracking-widest uppercase text-xs md:text-sm">
              {isTouchDevice ? 'TOUCH & MOBILE CONTROLS' : 'GAMEPLAY CONTROLS'}
            </div>

            {isTouchDevice ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-left">
                <div className="text-right text-gray-500 font-mono">Left Stick</div>
                <div className="text-left font-semibold text-gray-200">Move & Strafe</div>
                <div className="text-right text-gray-500 font-mono">Right Screen Drag</div>
                <div className="text-left font-semibold text-gray-200">Look Around</div>
                <div className="text-right text-gray-500 font-mono">✋ Button</div>
                <div className="text-left font-semibold text-gray-200">Interact (Door / Fridge / Key)</div>
                <div className="text-right text-gray-500 font-mono">🏃 / 🧎</div>
                <div className="text-left font-semibold text-gray-200">Sprint / Sneak Toggle</div>
                <div className="text-right text-gray-500 font-mono">🔦 / 🗺️</div>
                <div className="text-left font-semibold text-amber-300">Flashlight / Mansion Map</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div className="text-right text-gray-500 font-mono">W, A, S, D</div><div className="text-left font-semibold text-gray-200">Move</div>
                <div className="text-right text-gray-500 font-mono">Shift (Hold)</div><div className="text-left font-semibold text-gray-200">Sprint</div>
                <div className="text-right text-gray-500 font-mono">C / Left Ctrl</div><div className="text-left font-semibold text-gray-200">Crouch / Sneak</div>
                <div className="text-right text-gray-500 font-mono">E</div><div className="text-left font-semibold text-gray-200">Interact (Door / Fridge / Key)</div>
                <div className="text-right text-gray-500 font-mono">F</div><div className="text-left font-semibold text-amber-300">Toggle Flashlight</div>
                <div className="text-right text-gray-500 font-mono">M</div><div className="text-left font-semibold text-gray-200">View Mansion Map</div>
                <div className="text-right text-gray-500 font-mono">ESC</div><div className="text-left font-semibold text-gray-200">Pause</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ IN-GAME HUD ═══════════════════════════════════════════════════ */}
      {gameState === 'playing' && (
        <>
          {/* Top-Left Objective Bar */}
          <div className="absolute top-4 md:top-6 left-4 md:left-6 flex flex-col gap-1 pointer-events-none select-none max-w-[65%] md:max-w-none safe-left safe-top">
            <div className="text-[10px] md:text-[11px] font-mono uppercase tracking-widest text-red-500 font-bold flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-ping" />
              CURRENT OBJECTIVE
            </div>
            <div className="text-xs sm:text-sm md:text-lg font-mono text-gray-200 bg-black/70 px-2.5 md:px-3.5 py-1 md:py-1.5 rounded border border-gray-800 backdrop-blur-sm shadow-md truncate">
              {!hasFlashlight 
                ? '🔦 Search Kitchen Fridge for Flashlight' 
                : !hasKey 
                  ? '🗝️ Search 2nd Floor Balcony for Key' 
                  : '🔓 Unlock Grand Main Entrance Gate'}
            </div>
          </div>

          {/* Top-Right Performance FPS Counter (Hidden on narrow touch screen if quick bar is present) */}
          {!isTouchDevice && (
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border border-gray-800 backdrop-blur-sm select-none pointer-events-none safe-right safe-top">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span ref={fpsRef} className="font-mono text-xs font-bold text-green-400">
                60 FPS
              </span>
            </div>
          )}

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
            <div className="absolute top-[58%] px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-black/85 border border-yellow-500/80 text-yellow-300 font-mono text-sm md:text-lg tracking-wider text-center drop-shadow-[0_0_15px_rgba(0,0,0,0.9)] backdrop-blur-md animate-bounce pointer-events-none">
              {interactPrompt}
            </div>
          )}

          {/* Flashlight Acquired Toast Banner */}
          {showPickupToast && (
            <div className="absolute top-16 md:top-20 px-4 md:px-6 py-2 md:py-3 rounded-md bg-amber-950/90 border-2 border-amber-400 text-amber-200 font-mono text-xs md:text-sm tracking-wider text-center drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] backdrop-blur-md animate-pulse z-30">
              🔦 <strong className="text-white">FLASHLIGHT ACQUIRED</strong> — Toggle with <span className="bg-amber-800 px-1.5 py-0.5 rounded text-amber-100 font-bold">{isTouchDevice ? '🔦 Button' : '[F]'}</span>!
            </div>
          )}

          {/* Bottom-Center Stamina Bar (Direct DOM update for zero React re-render lag) */}
          <div 
            id="stamina-container" 
            className="absolute bottom-16 left-1/2 -translate-x-1/2 w-36 md:w-48 h-1.5 bg-black/60 rounded-full overflow-hidden border border-gray-800 transition-opacity duration-300 opacity-0 pointer-events-none"
          >
            <div 
              id="stamina-progress-bar"
              className="h-full bg-amber-400 w-full transition-[width] duration-75"
            />
          </div>

          {/* Bottom-Left Controls Reminder (Desktop Only) */}
          {!isTouchDevice && (
            <div className="absolute bottom-6 left-6 text-gray-500 font-mono text-xs hidden md:flex items-center gap-4 bg-black/40 px-3 py-1.5 rounded border border-gray-900 backdrop-blur-sm safe-left safe-bottom">
              <span><strong className="text-gray-300">[SHIFT]</strong> Sprint</span>
              <span><strong className="text-gray-300">[C]</strong> Crouch</span>
              <span><strong className="text-gray-300">[E]</strong> Interact</span>
              <span><strong className={hasFlashlight ? 'text-amber-400' : 'text-gray-500'}>[F]</strong> Flashlight</span>
              <span><strong className="text-gray-300">[M]</strong> Map</span>
            </div>
          )}

          {/* Bottom-Right Inventory & Status Indicators (Desktop Only - Mobile has dedicated on-screen touch cluster) */}
          {!isTouchDevice && (
            <div className="absolute bottom-6 right-6 flex items-center gap-3 safe-right safe-bottom">
              {/* Interactive Flashlight Button Widget */}
              <button
                onClick={() => {
                  if (hasFlashlight) {
                    toggleFlashlight();
                    playFlashlightClickSound(!isFlashlightOn);
                  }
                }}
                className={`flex items-center gap-3 bg-black/60 px-3.5 py-2 rounded border transition-all duration-200 pointer-events-auto select-none ${
                  !hasFlashlight 
                    ? 'border-gray-800/80 opacity-60 cursor-not-allowed' 
                    : isFlashlightOn 
                      ? 'border-amber-400 bg-amber-950/40 shadow-[0_0_15px_rgba(251,191,36,0.3)] cursor-pointer hover:scale-105' 
                      : 'border-gray-700 bg-black/60 cursor-pointer hover:border-gray-500'
                }`}
                title={hasFlashlight ? 'Click or Press [F] to Toggle Light' : 'Flashlight is inside Kitchen Fridge'}
              >
                <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-base transition-all ${
                  !hasFlashlight 
                    ? 'border-gray-700 bg-black/40 grayscale' 
                    : isFlashlightOn 
                      ? 'border-amber-400 bg-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.8)]' 
                      : 'border-gray-600 bg-black/50 text-gray-400'
                }`}>
                  🔦
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">FLASHLIGHT</span>
                  <span className={`font-mono text-xs md:text-sm font-bold uppercase ${
                    !hasFlashlight ? 'text-gray-500' : isFlashlightOn ? 'text-amber-400' : 'text-gray-400'
                  }`}>
                    {!hasFlashlight ? 'MISSING' : isFlashlightOn ? 'ON [F]' : 'OFF [F]'}
                  </span>
                </div>
              </button>

              {/* Key Status Indicator */}
              <div className="flex items-center gap-3 bg-black/60 px-3.5 py-2 rounded border border-gray-800 backdrop-blur-sm shadow-md">
                <div className={`w-9 h-9 rounded-full border-2 ${hasKey ? 'border-yellow-400 bg-yellow-400/20 shadow-[0_0_12px_rgba(255,215,0,0.6)]' : 'border-gray-700 bg-black/40'} flex items-center justify-center text-base`}>
                  {hasKey ? '🗝️' : '🔒'}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">GATE KEY</span>
                  <span className={`font-mono text-xs md:text-sm font-bold uppercase ${hasKey ? 'text-yellow-400' : 'text-gray-500'}`}>
                    {hasKey ? 'ACQUIRED' : 'MISSING'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ PAUSE MENU ═══════════════════════════════════════════════════ */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-black/90 pointer-events-auto flex flex-col items-center justify-center text-white font-mono z-40 backdrop-blur-sm p-4 overflow-y-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 tracking-widest text-red-600 drop-shadow-[0_0_15px_rgba(255,0,0,0.7)]">
            GAME PAUSED
          </h2>
          
          <div className="text-gray-400 text-xs md:text-sm grid grid-cols-2 gap-x-6 gap-y-2 mb-6 bg-black/70 p-4 md:p-6 border border-gray-800 rounded-md max-w-md w-full">
            {isTouchDevice ? (
              <>
                <div className="text-right text-gray-500 font-mono">Left Stick</div><div className="text-left text-gray-200">Move / Strafe</div>
                <div className="text-right text-gray-500 font-mono">Right Screen Drag</div><div className="text-left text-gray-200">Look Around</div>
                <div className="text-right text-gray-500 font-mono">✋ Button</div><div className="text-left text-gray-200">Interact</div>
                <div className="text-right text-gray-500 font-mono">🏃 / 🧎</div><div className="text-left text-gray-200">Sprint / Crouch</div>
                <div className="text-right text-gray-500 font-mono">🔦 / 🗺️</div><div className="text-left text-amber-300">Flashlight / Map</div>
              </>
            ) : (
              <>
                <div className="text-right text-gray-500 font-mono">W, A, S, D</div><div className="text-left text-gray-200">Move</div>
                <div className="text-right text-gray-500 font-mono">Shift (Hold)</div><div className="text-left text-gray-200">Sprint</div>
                <div className="text-right text-gray-500 font-mono">Left Ctrl / C</div><div className="text-left text-gray-200">Crouch</div>
                <div className="text-right text-gray-500 font-mono">E</div><div className="text-left text-gray-200">Interact</div>
                <div className="text-right text-gray-500 font-mono">F</div><div className="text-left text-amber-300">Toggle Flashlight</div>
                <div className="text-right text-gray-500 font-mono">M</div><div className="text-left text-gray-200">Map</div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 w-56 md:w-64">
            <button 
              onClick={() => setGameState('playing')}
              className="py-3 text-base md:text-lg font-bold border border-gray-600 bg-gray-900/50 hover:bg-gray-800 active:scale-95 hover:text-white transition-all duration-300 rounded cursor-pointer"
            >
              RESUME
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="py-3 text-base md:text-lg font-bold border border-red-900 text-red-500 hover:bg-red-950/60 active:scale-95 hover:text-red-300 transition-all duration-300 rounded cursor-pointer"
            >
              RESTART
            </button>
          </div>
        </div>
      )}

      {/* ═══ GAME OVER SCREEN ═════════════════════════════════════════════ */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-red-950/95 pointer-events-auto flex flex-col items-center justify-center text-red-500 font-mono z-50 px-4 py-6 overflow-y-auto">
          <h2 className="text-5xl sm:text-7xl md:text-8xl font-black mb-3 md:mb-4 tracking-widest text-red-600 drop-shadow-[0_0_30px_rgba(255,0,0,1)]">
            YOU DIED
          </h2>
          <p className="text-lg sm:text-2xl md:text-3xl mb-8 md:mb-10 text-red-800 font-serif italic text-center">
            You became part of the mansion...
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 md:px-10 py-3 md:py-4 text-xl md:text-2xl font-bold border-2 border-red-700 bg-red-900/40 hover:bg-red-800 active:scale-95 hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,0,0,0.6)] rounded cursor-pointer"
          >
            TRY AGAIN {isTouchDevice ? '' : '(R)'}
          </button>
        </div>
      )}

      {/* ═══ ESCAPE / WIN SCREEN ═══════════════════════════════════════════ */}
      {gameState === 'win' && (
        <div className="absolute inset-0 bg-black/95 pointer-events-auto flex flex-col items-center justify-center text-white font-mono z-50 px-4 py-6 overflow-y-auto">
          <h2 className="text-5xl sm:text-7xl md:text-8xl font-black mb-3 md:mb-4 tracking-widest text-white drop-shadow-[0_0_30px_rgba(255,255,255,1)]">
            YOU ESCAPED
          </h2>
          <p className="text-lg sm:text-2xl md:text-3xl mb-8 md:mb-10 text-gray-400 font-serif italic text-center">
            You survived the nightmare.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 md:px-10 py-3 md:py-4 text-xl md:text-2xl font-bold border-2 border-white bg-white/10 hover:bg-white active:scale-95 hover:text-black transition-all duration-300 rounded cursor-pointer"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* ═══ KITCHEN JUMPSCARE SCREEN HORROR OVERLAY ════════════════════ */}
      {isKitchenJumpscareActive && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden horror-shake-effect">
          {/* Intense blood-red horror vignette & rapid pulse */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(60,0,0,0.7)_65%,rgba(140,0,0,0.92)_100%)] horror-red-flash" />
          
          {/* Crimson flash border and high trauma vignette */}
          <div className="absolute inset-0 border-[12px] border-red-600/80 shadow-[inset_0_0_80px_rgba(255,0,0,0.85)] opacity-80" />
          
          {/* Subtle analog scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-60" />
        </div>
      )}

      {/* ═══ 3D RAVI KISHAN 'MAIN TERI QUEEN' STAIR DANCE OVERLAY ══════════ */}
      {isStairDanceActive && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between overflow-hidden animate-fadeIn">
          {/* Cinematic Top Letterbox Bar */}
          <div className="w-full bg-gradient-to-b from-black via-black/90 to-transparent pt-4 pb-8 px-4 flex flex-col items-center justify-center text-center shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-3xl animate-bounce">👑</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)] uppercase">
                LORD RAVI KISHAN
              </h2>
              <span className="text-xl sm:text-3xl animate-bounce">👑</span>
            </div>
            <p className="text-sm sm:text-xl font-bold tracking-[0.25em] text-pink-400 drop-shadow-[0_0_12px_rgba(255,0,128,0.8)] mt-1 animate-pulse uppercase">
              ✨ Main Teri Queen Aa Ve... ✨
            </p>
          </div>

          {/* Atmospheric Disco Horror Stage Vignette */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_35%,rgba(255,0,128,0.18)_70%,rgba(0,0,0,0.85)_100%)] mix-blend-screen" />

          {/* Cinematic Bottom Letterbox Bar & Interactive Skip Button */}
          <div className="w-full bg-gradient-to-t from-black via-black/90 to-transparent pb-6 pt-10 px-4 flex flex-col items-center justify-center pointer-events-auto">
            <button
              onClick={() => {
                endStairDance();
                if (danceAudioRef.current) danceAudioRef.current.pause();
              }}
              className="px-6 py-2.5 sm:px-8 sm:py-3 text-sm sm:text-base md:text-lg font-bold tracking-wider text-yellow-300 bg-black/70 hover:bg-yellow-950/80 border-2 border-yellow-500/80 hover:border-yellow-400 rounded-full active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.4)] cursor-pointer backdrop-blur-sm"
            >
              {isTouchDevice ? 'TAP TO CONTINUE' : 'PRESS [SPACE] OR CLICK TO CONTINUE'}
            </button>
          </div>
        </div>
      )}

      {/* Map UI Overlay */}
      <MapUI />
    </div>
  );
}

