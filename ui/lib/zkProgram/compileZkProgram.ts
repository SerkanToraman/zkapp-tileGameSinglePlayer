// import { TileGameProgram } from "../../../contracts/build/src/TileGameProgram";
// import { verify, Field, SelfProof, PublicKey, Signature } from "o1js";
// import { Tile } from "../types";
// import { hashUrl } from "./helpers";

// export async function compileTileGameProgram() {
//   try {
//     console.log("Compiling TileGameProgram...");
//     await TileGameProgram.compile();
//     console.log("TileGameProgram compiled successfully.");
//   } catch (error) {
//     console.error("Failed to compile TileGameProgram:", error);
//     throw error;
//   }
// }

// export async function initializeGame(
//   verificationKey: string,
//   player: PublicKey,
//   playerBoard: Tile[]
// ) {
//   const playerBoardFields = playerBoard.map((tile) => hashUrl(tile.url));
//   const { proof: initGameProof } = await TileGameProgram.initGamePlayer(
//     player,
//     playerBoardFields
//   );
//   const isValid = await verify(initGameProof.toJSON(), verificationKey);
//   console.log("isValid", isValid);
//   if (!isValid) {
//     throw new Error("Invalid proof");
//   }
//   return initGameProof;
// }
