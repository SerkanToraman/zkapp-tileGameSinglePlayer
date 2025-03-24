import * as Comlink from "comlink";
import { Tile } from "../types";
import { PublicKey, Field, SelfProof, Signature } from "o1js";
import { PublicOutput } from "../types";

export default class ZkappWorkerClient {
  // ---------------------------------------------------------------------------------------
  worker: Worker;
  // Proxy to interact with the worker's methods as if they were local
  remoteApi: Comlink.Remote<typeof import("./zkAppWorker").api>;

  constructor() {
    // Initialize the worker from the zkappWorker module
    const worker = new Worker(new URL("./zkappWorker.ts", import.meta.url), {
      type: "module",
    });
    // Wrap the worker with Comlink to enable direct method invocation
    this.remoteApi = Comlink.wrap(worker);
  }

  async compileTileGameProgram() {
    return this.remoteApi.compileTileGameProgram();
  }

  async initializeGame(
    verificationKey: string,
    playerPublicKey: PublicKey,
    tiles: bigint[]
  ) {
    //pass verificationKey, player, playerBoard to the worker
    console.log("initializeGameClient");
    return await this.remoteApi.initializeGame(
      verificationKey,
      playerPublicKey.toBase58(),
      tiles
    );
  }

  async play(
    earlierProof: string,
    verificationKey: string,
    selectedTiles: bigint[],
    signature: string
  ) {
    return await this.remoteApi.play(
      earlierProof,
      verificationKey,
      signature,
      selectedTiles
    );
  }
}
