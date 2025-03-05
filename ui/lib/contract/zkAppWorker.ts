import * as Comlink from "comlink";
import { TileGameProgram } from "../../../contracts/build/src/TileGameProgram.js";
import { PublicKey, Field, Signature, SelfProof } from "o1js";
import { PublicOutput } from "../types";
// This is the original way to import the TileGameProgram
// const TileGameProgram = (
//   await import("../../../contracts/build/src/TileGameProgram.js")
// )["TileGameProgram"];

export const api = {
  async compileTileGameProgram() {
    const { verificationKey: zkProgramVerificationKey } =
      await TileGameProgram.compile();
    return zkProgramVerificationKey.data;
  },
  async initializeGame(
    verificationKey: string,
    playerPublicKey: PublicKey | string,
    tileFields: bigint[]
  ) {
    //convert bigint to field
    const tiles = tileFields.map((f) => Field(f));
    // Ensure player is a PublicKey instance
    const player =
      typeof playerPublicKey === "string"
        ? PublicKey.fromBase58(playerPublicKey)
        : playerPublicKey;

    console.log("player", player.toBase58());
    console.log("tiles", tileFields);

    const { proof: initGameProof } = await TileGameProgram.initGamePlayer(
      player,
      tiles
    );
    return initGameProof;
  },
  async play(
    earlierProof: SelfProof<undefined, PublicOutput>,
    verificationKey: string,
    playerSignature: string,
    selectedTiles: bigint[],
    step: bigint
  ) {
    const tiles = selectedTiles.map((f) => Field(f));
    const stepField = Field(step);
    const signature = Signature.fromBase58(playerSignature);
    console.log("signature Worker", signature);
    const { proof: playTurn } = await TileGameProgram.play(
      earlierProof,
      tiles,
      signature,
      stepField
    );
    return playTurn;
  },
};

// Expose the API to be used by the main thread
Comlink.expose(api);
