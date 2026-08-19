'use client';

import React, { useEffect, useState } from 'react';
import { useTouchControls, enterFullscreenLandscape, checkIsTouchOrMobile } from '@/store/useTouchControls';

export default function LandscapePrompt() {
  const { isTouchDevice, isPortrait, setIsPortrait, setIsTouchDevice } = useTouchControls();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleCheck = () => {
      const isTouchOrMobile = checkIsTouchOrMobile();
      setIsTouchDevice(isTouchOrMobile);

      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);

      // If user rotated to landscape, reset dismissed state so it triggers if rotated back
      if (!portrait) {
        setDismissed(false);
      }
    };

    handleCheck();
    window.addEventListener('resize', handleCheck);
    window.addEventListener('orientationchange', handleCheck);

    return () => {
      window.removeEventListener('resize', handleCheck);
      window.removeEventListener('orientationchange', handleCheck);
    };
  }, [setIsPortrait, setIsTouchDevice]);

  // Show prompt if on touch screen/mobile viewport and in portrait mode
  if (!isTouchDevice || !isPortrait || dismissed) {
    return null;
  }

  const handleEnterLandscape = async () => {
    setDismissed(true);
    try {
      await enterFullscreenLandscape();
    } catch {
      // Ignored if browser restricts fullscreen
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none touch-none pointer-events-auto">
      {/* Horror ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(180,0,0,0.25)_0%,rgba(0,0,0,0.95)_75%)] pointer-events-none" />

      <div className="relative z-10 max-w-sm flex flex-col items-center">
        {/* Animated Rotating Phone Device Graphic */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          <div className="w-14 h-24 border-3 border-red-500 rounded-2xl flex flex-col items-center justify-between py-2 bg-red-950/40 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-rotate-phone">
            {/* Camera dot */}
            <div className="w-2 h-2 rounded-full bg-red-400/80" />
            {/* Screen indicator */}
            <div className="text-[10px] font-mono text-red-300 tracking-tighter">LANDSCAPE</div>
            {/* Home indicator bar */}
            <div className="w-6 h-1 rounded-full bg-red-400/60" />
          </div>
        </div>

        <h2 className="text-2xl font-black font-mono tracking-wider text-red-500 mb-2 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] uppercase">
          Rotate To Landscape
        </h2>

        <p className="text-gray-300 text-sm font-sans mb-8 leading-relaxed">
          For the full immersive widescreen horror experience and on-screen dual-stick controls, please hold your phone horizontally.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleEnterLandscape}
            className="w-full py-3.5 px-6 rounded bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white font-mono font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.6)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>⛶</span> PLAY IN FULLSCREEN
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="text-xs text-gray-500 font-mono underline hover:text-gray-400 py-1.5 transition-colors cursor-pointer"
          >
            Continue in portrait anyway
          </button>
        </div>
      </div>
    </div>
  );
}
