// Store the verification key of the zkProgram

import { create } from "zustand";
import ZkappWorkerClient from "../lib/contract/zkappWorkerClient";
import { TileGameProof } from "../../contracts/src/TileGameProgram";

interface ZkProgramState {
  verificationKey: string;
  setVerificationKey: (key: string) => void;
  zkAppWorkerClient: ZkappWorkerClient | null;
  setZkAppWorkerClient: (client: ZkappWorkerClient) => void;
  proof: TileGameProof | null;
  setProof: (proof: TileGameProof) => void;
}

export const useZkProgramStore = create<ZkProgramState>((set) => ({
  verificationKey: "",
  setVerificationKey: (key: string) => set({ verificationKey: key }),
  zkAppWorkerClient: null,
  setZkAppWorkerClient: (client: ZkappWorkerClient) =>
    set({ zkAppWorkerClient: client }),
  proof: null,
  setProof: (proof: TileGameProof) => set({ proof: proof }),
}));
