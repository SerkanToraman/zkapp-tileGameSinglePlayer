// walletStore.ts
import { create } from "zustand";
import { Wallet, WalletInfo } from "../lib/wallet/wallet";
import { useGameStore } from "../store/gameStore";

// Define the WalletState interface
interface WalletState {
  walletInfo: WalletInfo;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setAccount: (account: string | null) => void;
}

// Initialize wallet if running in a browser
const wallet = typeof window !== "undefined" ? new Wallet() : null;

// Define the default wallet info
const defaultWalletInfo: WalletInfo = {
  account: "B62qk8BM324DghXbXDPGZC4k3h5eSGgydRTeeVRg6Dbh3ThnMTKoJbK",
  network: { networkID: "mina:mainnet" },
  isConnected: false,
};

// Create the Zustand store
export const useWalletStore = create<WalletState>((set) => ({
  walletInfo: wallet ? wallet.getWalletInfo() : { ...defaultWalletInfo }, // Start with default wallet info if no wallet

  connect: async () => {
    if (wallet) {
      // Clear the wallet info before connecting
      set({
        walletInfo: { account: null, network: null, isConnected: false },
      });

      // Now establish a new connection
      const walletInfo = await wallet.connect();
      set({ walletInfo });
      const { setUserWallet } = useGameStore.getState();
      setUserWallet(walletInfo.account);
    }
  },

  disconnect: async () => {
    if (wallet) {
      wallet.disconnect();
      set({ walletInfo: { ...defaultWalletInfo, isConnected: false } }); // Revert to default wallet info
    }
  },

  setAccount: (account: string | null) => {
    set((state) => ({
      walletInfo: {
        ...state.walletInfo,
        account: account || state.walletInfo.account,
      },
    }));
  },
}));
