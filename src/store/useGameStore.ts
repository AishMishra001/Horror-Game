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
  isStairDanceTriggered: boolean;
  isStairDanceActive: boolean;
  isRitualJumpscareTriggered: boolean;
  isRitualJumpscareActive: boolean;
  isRitualLunging: boolean;
  isRitualRaviDisappeared: boolean;
  isRitualDoorClosed: boolean;
  isRitualDoorLocked: boolean;
  playerFlingTrigger: number;
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
  triggerStairDance: () => void;
  endStairDance: () => void;
  triggerRitualJumpscare: () => void;
  endRitualJumpscare: () => void;
  setRitualLunging: (lunging: boolean) => void;
  setRitualRaviDisappeared: (disappeared: boolean) => void;
  setRitualDoorClosed: (closed: boolean) => void;
  setRitualDoorLocked: (locked: boolean) => void;
  triggerPlayerFling: () => void;
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
  isStairDanceTriggered: false,
  isStairDanceActive: false,
  isRitualJumpscareTriggered: false,
  isRitualJumpscareActive: false,
  isRitualLunging: false,
  isRitualRaviDisappeared: false,
  isRitualDoorClosed: false,
  isRitualDoorLocked: false,
  playerFlingTrigger: 0,
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
  triggerStairDance: () => set({ isStairDanceTriggered: true, isStairDanceActive: true }),
  endStairDance: () => set({ isStairDanceActive: false }),
  triggerRitualJumpscare: () => set({ isRitualJumpscareTriggered: true, isRitualJumpscareActive: true, isRitualLunging: false, isRitualRaviDisappeared: false }),
  endRitualJumpscare: () => set({ isRitualJumpscareActive: false, isRitualLunging: false }),
  setRitualLunging: (lunging) => set({ isRitualLunging: lunging }),
  setRitualRaviDisappeared: (disappeared) => set({ isRitualRaviDisappeared: disappeared }),
  setRitualDoorClosed: (closed) => set({ isRitualDoorClosed: closed }),
  setRitualDoorLocked: (locked) => set({ isRitualDoorLocked: locked }),
  triggerPlayerFling: () => set((state) => ({ playerFlingTrigger: state.playerFlingTrigger + 1 })),
  setIsSprinting: (sprinting) => set({ isSprinting: sprinting }),
  setStamina: (stamina) => set({ stamina }),
}));
