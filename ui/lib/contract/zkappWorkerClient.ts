import * as Comlink from "comlink";
import { Tile } from "../types";
import { PublicKey, Field } from "o1js";

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
    //convert tiles to fields
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
}
