'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useTouchControls, touchStateRef, enterFullscreenLandscape, checkIsTouchOrMobile } from '@/store/useTouchControls';
import { playFlashlightClickSound } from '@/utils/creepyAudio';

export default function MobileControls() {
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);
  const hasFlashlight = useGameStore((s) => s.hasFlashlight);
  const isFlashlightOn = useGameStore((s) => s.isFlashlightOn);
  const toggleFlashlight = useGameStore((s) => s.toggleFlashlight);
  const interactPrompt = useGameStore((s) => s.interactPrompt);
  const showMap = useGameStore((s) => s.showMap);
  const setShowMap = useGameStore((s) => s.setShowMap);

  const { isTouchDevice, setIsTouchDevice, setIsPortrait, triggerInteract } = useTouchControls();
  const [isSprintActive, setIsSprintActive] = useState(false);
  const [isCrouchActive, setIsCrouchActive] = useState(false);

  // References for zero-GC pointer tracking
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const joystickKnobRef = useRef<HTMLDivElement>(null);
  const joystickPointerIdRef = useRef<number | null>(null);
  const joystickCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const lookPointerIdRef = useRef<number | null>(null);
  const lookLastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Detect touch device & orientation on mount and resize
  useEffect(() => {
    const checkDeviceAndOrientation = () => {
      const touchOrMobile = checkIsTouchOrMobile();
      setIsTouchDevice(touchOrMobile);

      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
    };

    checkDeviceAndOrientation();
    window.addEventListener('resize', checkDeviceAndOrientation);
    window.addEventListener('orientationchange', checkDeviceAndOrientation);

    return () => {
      window.removeEventListener('resize', checkDeviceAndOrientation);
      window.removeEventListener('orientationchange', checkDeviceAndOrientation);
    };
  }, [setIsTouchDevice, setIsPortrait]);

  // Keep sprint/crouch in sync with touchStateRef
  const handleToggleSprint = useCallback(() => {
    setIsSprintActive((prev) => {
      const next = !prev;
      touchStateRef.sprint = next;
      return next;
    });
  }, []);

  const handleToggleCrouch = useCallback(() => {
    setIsCrouchActive((prev) => {
      const next = !prev;
      touchStateRef.crouch = next;
      return next;
    });
  }, []);

  // ─── LEFT JOYSTICK POINTER HANDLERS ──────────────────────────────────────────
  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (joystickPointerIdRef.current !== null) return;

    joystickPointerIdRef.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    if (joystickBaseRef.current) {
      const rect = joystickBaseRef.current.getBoundingClientRect();
      joystickCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
  };

  const handleJoystickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joystickPointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();

    const maxRadius = 45; // Max knob displacement in pixels
    const deltaX = e.clientX - joystickCenterRef.current.x;
    const deltaY = e.clientY - joystickCenterRef.current.y;
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    let clampedX = deltaX;
    let clampedY = deltaY;

    if (dist > maxRadius) {
      clampedX = (deltaX / dist) * maxRadius;
      clampedY = (deltaY / dist) * maxRadius;
    }

    // Direct DOM update for 60+ FPS zero GC
    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
    }

    // Normalize -1 to 1 (Y is inverted: up is forward / positive)
    const normX = clampedX / maxRadius;
    const normY = -clampedY / maxRadius;

    touchStateRef.joystick.x = normX;
    touchStateRef.joystick.y = normY;
    touchStateRef.isTouchActive = true;
  };

  const handleJoystickPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joystickPointerIdRef.current === e.pointerId) {
      joystickPointerIdRef.current = null;
      if (joystickKnobRef.current) {
        joystickKnobRef.current.style.transform = 'translate(0px, 0px)';
      }
      touchStateRef.joystick.x = 0;
      touchStateRef.joystick.y = 0;
    }
  };

  // ─── RIGHT LOOK TOUCH SURFACE HANDLERS ─────────────────────────────────────
  const handleLookPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (lookPointerIdRef.current !== null) return;
    lookPointerIdRef.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    lookLastPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleLookPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (lookPointerIdRef.current !== e.pointerId) return;

    const dx = e.clientX - lookLastPosRef.current.x;
    const dy = e.clientY - lookLastPosRef.current.y;
    lookLastPosRef.current = { x: e.clientX, y: e.clientY };

    // Sensitivity factor for look
    const SENSITIVITY = 0.0035;
    touchStateRef.lookDelta.dx += dx * SENSITIVITY;
    touchStateRef.lookDelta.dy += dy * SENSITIVITY;
    touchStateRef.isTouchActive = true;
  };

  const handleLookPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (lookPointerIdRef.current === e.pointerId) {
      lookPointerIdRef.current = null;
    }
  };

  // Render when touch/mobile is detected during playing state
  if (!isTouchDevice || gameState !== 'playing') {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20 select-none touch-none">
      {/* ─── FULL RIGHT HALF TOUCH LOOK ZONE ─── */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-auto touch-none"
        onPointerDown={handleLookPointerDown}
        onPointerMove={handleLookPointerMove}
        onPointerUp={handleLookPointerUp}
        onPointerCancel={handleLookPointerUp}
      />

      {/* ─── TOP RIGHT QUICK BAR (Fullscreen, Map, Pause) ─── */}
      <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto z-30 safe-right safe-top">
        {/* Fullscreen Button */}
        <button
          onClick={() => enterFullscreenLandscape()}
          aria-label="Toggle Fullscreen"
          className="w-10 h-10 rounded-full bg-black/70 border border-red-900/80 text-gray-300 flex items-center justify-center text-sm shadow-md active:scale-90 transition-transform cursor-pointer"
        >
          ⛶
        </button>

        {/* Map Toggle Button */}
        <button
          onClick={() => setShowMap(!showMap)}
          aria-label="Toggle Map"
          className={`w-10 h-10 rounded-full border text-sm flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer ${
            showMap
              ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
              : 'bg-black/70 border-gray-800 text-gray-300'
          }`}
        >
          🗺️
        </button>

        {/* Pause Button */}
        <button
          onClick={() => setGameState('paused')}
          aria-label="Pause Game"
          className="w-10 h-10 rounded-full bg-black/70 border border-red-900/80 text-red-400 flex items-center justify-center text-sm font-bold shadow-md active:scale-90 transition-transform cursor-pointer"
        >
          ⏸
        </button>
      </div>

      {/* ─── BOTTOM LEFT VIRTUAL JOYSTICK ─── */}
      <div className="absolute bottom-6 left-6 pointer-events-auto safe-left safe-bottom z-30">
        <div
          ref={joystickBaseRef}
          onPointerDown={handleJoystickPointerDown}
          onPointerMove={handleJoystickPointerMove}
          onPointerUp={handleJoystickPointerUp}
          onPointerCancel={handleJoystickPointerUp}
          className="relative w-32 h-32 rounded-full bg-black/50 border-2 border-red-950/70 backdrop-blur-sm flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.8)] touch-none cursor-grab active:cursor-grabbing"
        >
          {/* Inner ring marker */}
          <div className="absolute w-16 h-16 rounded-full border border-red-900/40 pointer-events-none" />
          {/* Direction ticks */}
          <div className="absolute top-1 text-[10px] text-red-800/60 font-mono pointer-events-none">▲</div>
          <div className="absolute bottom-1 text-[10px] text-red-800/60 font-mono pointer-events-none">▼</div>
          <div className="absolute left-1 text-[10px] text-red-800/60 font-mono pointer-events-none">◀</div>
          <div className="absolute right-1 text-[10px] text-red-800/60 font-mono pointer-events-none">▶</div>

          {/* Draggable Stick Knob */}
          <div
            ref={joystickKnobRef}
            className="w-14 h-14 rounded-full bg-gradient-to-b from-red-900/80 to-red-950/90 border-2 border-red-500/70 shadow-[0_0_12px_rgba(239,68,68,0.5)] pointer-events-none will-change-transform flex items-center justify-center"
          >
            <div className="w-4 h-4 rounded-full bg-red-400/60 shadow-[0_0_6px_rgba(255,100,100,0.8)]" />
          </div>
        </div>
      </div>

      {/* ─── BOTTOM RIGHT ACTION BUTTONS CLUSTER ─── */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 pointer-events-auto safe-right safe-bottom z-30">
        {/* Upper Row: Sprint & Crouch */}
        <div className="flex items-center gap-3">
          {/* Crouch Toggle Button */}
          <button
            onClick={handleToggleCrouch}
            className={`w-13 h-13 rounded-full border flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all select-none ${
              isCrouchActive
                ? 'bg-amber-950/90 border-amber-400 text-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.6)]'
                : 'bg-black/70 border-gray-800 text-gray-400 hover:border-gray-600'
            }`}
          >
            <span className="text-lg leading-none">🧎</span>
            <span className="text-[9px] font-mono font-bold uppercase mt-0.5 tracking-tighter">
              {isCrouchActive ? 'SNEAK' : 'CROUCH'}
            </span>
          </button>

          {/* Sprint Toggle Button */}
          <button
            onClick={handleToggleSprint}
            className={`w-13 h-13 rounded-full border flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all select-none ${
              isSprintActive
                ? 'bg-red-950/90 border-red-500 text-red-200 shadow-[0_0_16px_rgba(239,68,68,0.7)]'
                : 'bg-black/70 border-gray-800 text-gray-400 hover:border-gray-600'
            }`}
          >
            <span className="text-lg leading-none">🏃</span>
            <span className="text-[9px] font-mono font-bold uppercase mt-0.5 tracking-tighter">
              {isSprintActive ? 'SPRINT' : 'WALK'}
            </span>
          </button>
        </div>

        {/* Lower Row: Flashlight & Primary Interact */}
        <div className="flex items-center gap-3">
          {/* Flashlight Button */}
          <button
            onClick={() => {
              if (hasFlashlight) {
                toggleFlashlight();
                playFlashlightClickSound(!isFlashlightOn);
              }
            }}
            disabled={!hasFlashlight}
            className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all select-none ${
              !hasFlashlight
                ? 'bg-black/40 border-gray-800 text-gray-600 opacity-50 cursor-not-allowed'
                : isFlashlightOn
                ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.8)]'
                : 'bg-black/75 border-gray-700 text-gray-300 hover:border-amber-500/50'
            }`}
          >
            <span className="text-xl leading-none">🔦</span>
            <span className={`text-[9px] font-mono font-bold uppercase mt-0.5 tracking-tighter ${
              !hasFlashlight ? 'text-gray-600' : isFlashlightOn ? 'text-amber-300' : 'text-gray-400'
            }`}>
              {!hasFlashlight ? 'NONE' : isFlashlightOn ? 'LIGHT ON' : 'LIGHT OFF'}
            </span>
          </button>

          {/* Primary Action / Interact Button (E) */}
          <button
            onClick={triggerInteract}
            className={`w-18 h-18 rounded-full border-2 flex flex-col items-center justify-center shadow-2xl active:scale-90 transition-all select-none ${
              interactPrompt
                ? 'bg-yellow-500/30 border-yellow-400 text-yellow-300 animate-pulse shadow-[0_0_25px_rgba(255,215,0,0.9)] scale-105'
                : 'bg-red-950/60 border-red-700 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.4)] hover:border-red-500'
            }`}
          >
            <span className="text-2xl leading-none">✋</span>
            <span className="text-[10px] font-mono font-black uppercase mt-1 tracking-wider">
              {interactPrompt ? 'ACTION' : 'INTERACT'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
