import { create } from 'zustand';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'win';

interface GameStore {
  gameState: GameState;
  hasKey: boolean;
  hasFlashlight: boolean;
  isFlashlightOn: boolean;
  interactPrompt: string | null;
  showMap: boolean;
  playerPos: { x: number; y: number; z: number };
  isKitchenJumpscareTriggered: boolean;
  isKitchenJumpscareActive: boolean;
  isSprinting: boolean;
  stamina: number;
  setGameState: (state: GameState) => void;
  setHasKey: (hasKey: boolean) => void;
  setHasFlashlight: (has: boolean) => void;
  setIsFlashlightOn: (on: boolean) => void;
  toggleFlashlight: () => void;
  setInteractPrompt: (prompt: string | null) => void;
  setShowMap: (show: boolean) => void;
  triggerKitchenJumpscare: () => void;
  endKitchenJumpscare: () => void;
  setIsSprinting: (sprinting: boolean) => void;
  setStamina: (stamina: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'menu',
  hasKey: false,
  hasFlashlight: false,
  isFlashlightOn: false,
  interactPrompt: null,
  showMap: false,
  playerPos: { x: 0, y: 0, z: 0 },
  isKitchenJumpscareTriggered: false,
  isKitchenJumpscareActive: false,
  isSprinting: false,
  stamina: 100,
  setGameState: (state) => set({ gameState: state }),
  setHasKey: (hasKey) => set({ hasKey }),
  setHasFlashlight: (hasFlashlight) => set({ hasFlashlight }),
  setIsFlashlightOn: (isFlashlightOn) => set({ isFlashlightOn }),
  toggleFlashlight: () => set((state) => ({ isFlashlightOn: !state.isFlashlightOn })),
  setInteractPrompt: (prompt) => set({ interactPrompt: prompt }),
  setShowMap: (show) => set({ showMap: show }),
  triggerKitchenJumpscare: () => set({ isKitchenJumpscareTriggered: true, isKitchenJumpscareActive: true }),
  endKitchenJumpscare: () => set({ isKitchenJumpscareActive: false }),
  setIsSprinting: (sprinting) => set({ isSprinting: sprinting }),
  setStamina: (stamina) => set({ stamina }),
}));
