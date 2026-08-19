import { create } from 'zustand';

interface TouchControlsStore {
  isTouchDevice: boolean;
  isPortrait: boolean;
  isFullscreen: boolean;
  
  // Real-time touch state
  joystick: { x: number; y: number }; // x: -1 (left) to 1 (right), y: -1 (back) to 1 (fwd)
  lookDelta: { dx: number; dy: number }; // delta accumulated since last frame
  sprint: boolean;
  crouch: boolean;

  // Actions
  setIsTouchDevice: (val: boolean) => void;
  setIsPortrait: (val: boolean) => void;
  setIsFullscreen: (val: boolean) => void;
  setJoystick: (x: number, y: number) => void;
  addLookDelta: (dx: number, dy: number) => void;
  consumeLookDelta: () => { dx: number; dy: number };
  setSprint: (val: boolean) => void;
  setCrouch: (val: boolean) => void;
  toggleSprint: () => void;
  toggleCrouch: () => void;
  triggerInteract: () => void;
}

// Separate internal mutable object for zero-GC ultra-fast frame consumption
export const touchStateRef = {
  joystick: { x: 0, y: 0 },
  lookDelta: { dx: 0, dy: 0 },
  sprint: false,
  crouch: false,
  isTouchActive: false,
};

export const useTouchControls = create<TouchControlsStore>((set, get) => ({
  isTouchDevice: false,
  isPortrait: false,
  isFullscreen: false,

  joystick: { x: 0, y: 0 },
  lookDelta: { dx: 0, dy: 0 },
  sprint: false,
  crouch: false,

  setIsTouchDevice: (val) => set({ isTouchDevice: val }),
  setIsPortrait: (val) => set({ isPortrait: val }),
  setIsFullscreen: (val) => set({ isFullscreen: val }),

  setJoystick: (x, y) => {
    touchStateRef.joystick.x = x;
    touchStateRef.joystick.y = y;
    touchStateRef.isTouchActive = true;
  },

  addLookDelta: (dx, dy) => {
    touchStateRef.lookDelta.dx += dx;
    touchStateRef.lookDelta.dy += dy;
    touchStateRef.isTouchActive = true;
  },

  consumeLookDelta: () => {
    const dx = touchStateRef.lookDelta.dx;
    const dy = touchStateRef.lookDelta.dy;
    touchStateRef.lookDelta.dx = 0;
    touchStateRef.lookDelta.dy = 0;
    return { dx, dy };
  },

  setSprint: (val) => {
    touchStateRef.sprint = val;
    set({ sprint: val });
  },

  setCrouch: (val) => {
    touchStateRef.crouch = val;
    set({ crouch: val });
  },

  toggleSprint: () => {
    const next = !get().sprint;
    touchStateRef.sprint = next;
    set({ sprint: next });
  },

  toggleCrouch: () => {
    const next = !get().crouch;
    touchStateRef.crouch = next;
    set({ crouch: next });
  },

  triggerInteract: () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', key: 'e', bubbles: true }));
      setTimeout(() => {
        window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyE', key: 'e', bubbles: true }));
      }, 50);
    }
  },
}));

/**
 * Robust detection for touch devices, mobile user-agents, and responsive mobile viewports
 */
export function checkIsTouchOrMobile(): boolean {
  if (typeof window === 'undefined') return false;
  const hasTouchEvents = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
  // Phone landscape height is always <= 520px, or width <= 1024px with mobile aspect ratio
  const isPhoneLandscape = window.innerHeight <= 520 && window.innerWidth <= 1024;
  const isPortraitMobile = window.innerWidth <= 1024 && window.innerHeight > window.innerWidth;
  return hasTouchEvents || isCoarsePointer || isMobileUA || isPhoneLandscape || isPortraitMobile;
}


/**
 * Utility to request Fullscreen and lock landscape orientation
 */
export async function enterFullscreenLandscape(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const docEl = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
      mozRequestFullScreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };

    if (docEl.requestFullscreen) {
      await docEl.requestFullscreen();
    } else if (docEl.webkitRequestFullscreen) {
      await docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) {
      await docEl.msRequestFullscreen();
    }

    // Try locking orientation to landscape
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: string) => Promise<void>;
    };
    if (orientation && orientation.lock) {
      await orientation.lock('landscape').catch(() => {
        // Some browsers may require full-screen user gesture or might not support lock
      });
    }
    return true;
  } catch (err) {
    console.warn('Fullscreen/orientation lock failed or was cancelled:', err);
    return false;
  }
}
