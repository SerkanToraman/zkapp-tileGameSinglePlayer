import { create } from "zustand";

interface GameState {
  userWallet: string | null;
  setUserWallet: (wallet: string | null) => void;
  clearState: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  userWallet: null,
  setUserWallet: (wallet: string | null) =>
    set({
      userWallet: wallet,
    }),
  clearState: () =>
    set({
      userWallet: null,
    }),
}));
