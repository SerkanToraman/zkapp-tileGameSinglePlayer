import { Mina, PublicKey, fetchAccount } from "o1js";
import * as Comlink from "comlink";
import { GameContract } from "../../../contracts/build/src/GameContract";
import { TileGameProgram } from "../../../contracts/build/src/TileGameProgram";

export const api = {
  async compileTileGameProgram() {
    await TileGameProgram.compile();
  },
};

// Expose the API to be used by the main thread
Comlink.expose(api);
