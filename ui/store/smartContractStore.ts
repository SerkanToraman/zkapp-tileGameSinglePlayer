// packages/zustand/store/smartContractStore.ts
import { create } from "zustand";
import ZkappWorkerClient from "../lib/contract/zkappWorkerClient";
import { Field } from "o1js";
import { useWalletStore } from "./walletStore"; // Import the wallet store

const ZKAPP_ADDRESS = "B62qmruhKaWVu7R7ZDwXvipERq4Qg3qxk1YccM6gGvG8oMEm4nePnGQ";

interface SmartContractState {
  zkappWorkerClient: ZkappWorkerClient | null;
  hasBeenSetup: boolean;
  accountExists: boolean;
  currentNum: Field | null;
  creatingTransaction: boolean;
  displayText: string;
  transactionLink: string;

  setupZkapp: () => Promise<void>;
  createTransaction: () => Promise<void>;
  refreshCurrentNum: () => Promise<void>;
}

export const useSmartContractStore = create<SmartContractState>((set, get) => ({
  zkappWorkerClient: null,
  hasBeenSetup: false,
  accountExists: false,
  currentNum: null,
  creatingTransaction: false,
  displayText: "",
  transactionLink: "",

  setupZkapp: async () => {
    try {
      const walletStore = useWalletStore.getState(); // Access wallet state
      const publicKeyBase58 = walletStore.walletInfo.account;

      console.log("Wallet store state:", walletStore);

      // Check if the wallet is connected
      if (!walletStore.walletInfo.isConnected) {
        set({ displayText: "Please connect your Auro Wallet first" });
        console.error("Error: Wallet is not connected.");
        return;
      }

      // Initialize zkApp Worker Client
      const zkappWorkerClient = new ZkappWorkerClient();
      set({ zkappWorkerClient });
      console.log("Initialized zkApp Worker Client");

      set({ displayText: "Setting up zkApp..." });

      // Set active instance to Devnet
      try {
        await zkappWorkerClient.setActiveInstanceToDevnet();
        console.log("Set active instance to Devnet");
        set({ hasBeenSetup: true });
      } catch (error) {
        console.error("Error setting active instance to Devnet:", error);
        set({ displayText: "Error: Failed to set Devnet instance" });
        return;
      }

      // Fetch zkApp account and check for verification key
      try {
        console.log("Fetching zkApp account for address:", ZKAPP_ADDRESS);
        const zkappAccountResult = await zkappWorkerClient.fetchAccount(
          ZKAPP_ADDRESS
        );

        if (zkappAccountResult.error || !zkappAccountResult) {
          console.error(
            "zkApp account does not exist on the ledger or lacks a verification key."
          );
          set({
            displayText:
              "zkApp is not deployed or lacks a verification key. Please deploy it.",
          });
          return;
        }

        set({ accountExists: true });
        console.log("zkApp account :", zkappAccountResult);
        console.log(
          "zkApp account exists with verification key:",
          zkappAccountResult.account.permissions
        );

        // Load, compile, and initialize the zkApp instance
        await zkappWorkerClient.loadContract();
        await zkappWorkerClient.compileContract();
        await zkappWorkerClient.initZkappInstance(ZKAPP_ADDRESS);

        // Fetch initial state of zkApp
        const currentNum = await zkappWorkerClient.getNum();
        set({ currentNum, displayText: "" });
        console.log("Current zkApp state:", currentNum);
      } catch (error) {
        console.error("Error initializing zkApp:", error);
        set({
          displayText:
            "Failed to initialize zkApp. Check deployment and verification key.",
        });
        return;
      }

      // Fetch user's account information to ensure the fee payer's account exists
      try {
        console.log("Fetching account information for user:", publicKeyBase58);
        if (publicKeyBase58) {
          const accountResult = await zkappWorkerClient.fetchAccount(
            publicKeyBase58
          );
          const accountExists = !accountResult.error;
          set({ accountExists });
          console.log("User account exists:", accountExists);
        }
      } catch (error) {
        console.error("Error fetching user account information:", error);
        set({ displayText: "Error: Failed to fetch user account information" });
        return;
      }

      // Fetch zkApp state again for verification
      try {
        const currentNum = await zkappWorkerClient.getNum();
        set({ currentNum, displayText: "" });
        console.log("Final zkApp state:", currentNum);
      } catch (error) {
        console.error("Error retrieving zkApp state:", error);
        set({ displayText: "Error: Failed to retrieve zkApp state" });
      }
    } catch (error) {
      console.error("Unexpected error in setupZkapp:", error);
      set({ displayText: "An unexpected error occurred during zkApp setup." });
    }
  },

  createTransaction: async () => {
    const walletStore = useWalletStore.getState();
    const publicKeyBase58 = walletStore.walletInfo.account; // Fetch the user's account (public key)

    const zkappWorkerClient = get().zkappWorkerClient;
    console.log("zkappWorkerClient", zkappWorkerClient);
    if (!zkappWorkerClient) {
      console.error("ZkappWorkerClient is not initialized.");
      return;
    }

    set({ creatingTransaction: true, displayText: "Creating transaction..." });

    try {
      console.log(
        "Fetching account information for fee payer:",
        publicKeyBase58
      );
      if (publicKeyBase58) {
        await zkappWorkerClient.fetchAccount(publicKeyBase58); // Ensure account is fetched
      } else {
        console.error("Error: Public key is null.");
        set({ creatingTransaction: false, displayText: "Public key is null." });
        return;
      }

      console.log("Creating update transaction...");
      await zkappWorkerClient.createUpdateTransaction();
      console.log("Proving update transaction...");
      await zkappWorkerClient.proveUpdateTransaction();

      console.log("Getting transaction JSON...");
      console.log("zkappWorkerClient", zkappWorkerClient);
      const transactionJSON = await zkappWorkerClient.getTransactionJSON();
      console.log("Transaction JSON:", transactionJSON);

      console.log("Sending transaction...");
      const { hash } = await (window as any).mina.sendTransaction({
        transaction: transactionJSON,
        feePayer: { fee: 0.1, memo: "" },
      });

      set({
        transactionLink: `https://minascan.io/devnet/tx/${hash}`,
        creatingTransaction: false,
        displayText: "",
      });
      console.log("Transaction completed with hash:", hash);
    } catch (error) {
      console.error("Error during transaction creation:", error);
      set({ creatingTransaction: false, displayText: "Transaction failed." });
    }
  },

  refreshCurrentNum: async () => {
    const zkappWorkerClient = get().zkappWorkerClient;
    if (!zkappWorkerClient) return;

    const currentNum = await zkappWorkerClient.getNum();
    set({ currentNum });
  },
}));
