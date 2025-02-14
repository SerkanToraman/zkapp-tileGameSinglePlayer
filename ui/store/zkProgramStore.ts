// Store the verification key of the zkProgram

import { create } from "zustand";
import ZkappWorkerClient from "../lib/contract/zkappWorkerClient";
interface ZkProgramState {
  verificationKey: string;
  setVerificationKey: (key: string) => void;
  zkAppWorkerClient: ZkappWorkerClient | null;
  setZkAppWorkerClient: (client: ZkappWorkerClient) => void;
}

export const useZkProgramStore = create<ZkProgramState>((set) => ({
  verificationKey: "",
  setVerificationKey: (key: string) => set({ verificationKey: key }),
  zkAppWorkerClient: null,
  setZkAppWorkerClient: (client: ZkappWorkerClient) =>
    set({ zkAppWorkerClient: client }),
}));
