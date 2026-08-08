import { create } from 'zustand';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'win';

interface GameStore {
  gameState: GameState;
  hasKey: boolean;
  interactPrompt: string | null;
  setGameState: (state: GameState) => void;
  setHasKey: (hasKey: boolean) => void;
  setInteractPrompt: (prompt: string | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'menu',
  hasKey: false,
  interactPrompt: null,
  setGameState: (state) => set({ gameState: state }),
  setHasKey: (hasKey) => set({ hasKey }),
  setInteractPrompt: (prompt) => set({ interactPrompt: prompt }),
}));
