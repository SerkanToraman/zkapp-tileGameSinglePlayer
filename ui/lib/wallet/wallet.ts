import { PublicKey } from "o1js";
import {
  ChainInfoArgs,
  ProviderError,
  SignedData,
  SignMessageArgs,
  SwitchChainArgs,
} from "@aurowallet/mina-provider";

export interface WalletInfo {
  account: string | null; // Use string instead of PublicKey for UI friendliness
  network: ChainInfoArgs | null;
  isConnected: boolean;
}

export class Wallet {
  private account: string | null = null;
  private network: ChainInfoArgs | null = null;
  private isConnected = false;

  // Method to connect the wallet
  public async connect(): Promise<WalletInfo> {
    if (typeof window === "undefined" || !window.mina) {
      throw new Error("Auro Wallet not installed");
    }

    const accounts = await window.mina.requestAccounts();
    console.log("accounts", accounts[0]);
    if (accounts.length > 0 && accounts[0]) {
      this.account = PublicKey.fromBase58(accounts[0]).toBase58();
      this.isConnected = true;
      this.network = await window.mina.requestNetwork();
    } else {
      this.isConnected = false;
      this.account = null;
    }

    return this.getWalletInfo();
  }

  // Method to disconnect the wallet
  public disconnect(): WalletInfo {
    this.account = null;
    this.network = null;
    this.isConnected = false;
    return this.getWalletInfo();
  }

  // Method to switch network
  public async switchNetwork(args: SwitchChainArgs): Promise<WalletInfo> {
    if (!window.mina) throw new Error("Auro Wallet not installed");

    const response: unknown = await window.mina.switchChain(args);
    if (
      response &&
      typeof response === "object" &&
      "networkID" in response &&
      typeof response.networkID === "string"
    ) {
      this.network = response as ChainInfoArgs;
    }

    return this.getWalletInfo();
  }

  // Get current wallet info
  public getWalletInfo(): WalletInfo {
    return {
      account: this.account, // Already a string in Base58 format
      network: this.network,
      isConnected: this.isConnected,
    };
  }
}

// const signResult: SignedData | ProviderError = await (window as any)?.mina
// ?.signMessage({
//   message: message,
// })
// .catch((err: any) => err);
// console.log("signResult", signResult);
