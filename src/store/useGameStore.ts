import { create } from 'zustand';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'win';

interface GameStore {
  gameState: GameState;
  hasKey: boolean;
  interactPrompt: string | null;
  showMap: boolean;
  playerPos: { x: number; y: number; z: number };
  isKitchenJumpscareTriggered: boolean;
  isSprinting: boolean;
  stamina: number;
  setGameState: (state: GameState) => void;
  setHasKey: (hasKey: boolean) => void;
  setInteractPrompt: (prompt: string | null) => void;
  setShowMap: (show: boolean) => void;
  triggerKitchenJumpscare: () => void;
  setIsSprinting: (sprinting: boolean) => void;
  setStamina: (stamina: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'menu',
  hasKey: false,
  interactPrompt: null,
  showMap: false,
  playerPos: { x: 0, y: 0, z: 0 },
  isKitchenJumpscareTriggered: false,
  isSprinting: false,
  stamina: 100,
  setGameState: (state) => set({ gameState: state }),
  setHasKey: (hasKey) => set({ hasKey }),
  setInteractPrompt: (prompt) => set({ interactPrompt: prompt }),
  setShowMap: (show) => set({ showMap: show }),
  triggerKitchenJumpscare: () => set({ isKitchenJumpscareTriggered: true }),
  setIsSprinting: (sprinting) => set({ isSprinting: sprinting }),
  setStamina: (stamina) => set({ stamina }),
}));
