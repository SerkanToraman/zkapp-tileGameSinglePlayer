import { verify, Field, SelfProof, PublicKey, Signature } from 'o1js';
import { TileGameProgram } from '../TileGameProgram';
import { GameInput, GameOutput, Tile } from './types';

export class TileGameLogic {
  // Method for User 1 to initialize the game
  static async initializeGameForUser(
    verificationKey: string,
    player: PublicKey,
    playerBoard: Tile[]
  ) {
    // Generate proof and output using the ZkProgram
    const { proof: initGameProof } = await TileGameProgram.initGamePlayer(
      player,
      playerBoard
    );

    // Verify the proof
    const isValid = await verify(initGameProof.toJSON(), verificationKey);

    if (!isValid) {
      throw new Error('Tile game initialization for User 1 failed!');
    }

    return initGameProof;
  }

  // Method for User to playTurn
  static async play(
    earlierProof: SelfProof<undefined, GameOutput>,
    verificationKey: string,
    playerSignature: Signature,
    selectedTiles: Field[],
    step: Field
  ) {
    // Generate proof and output using the ZkProgram
    const { proof: playTurn } = await TileGameProgram.play(
      earlierProof,
      selectedTiles,
      playerSignature,
      step
    );

    // Verify the proof
    const isValid = await verify(playTurn.toJSON(), verificationKey);

    if (!isValid) {
      throw new Error('Tile game initialization for User 2 failed!');
    }
    return playTurn;
  }

  // Method for House to check player move
  static async check(
    earlierProof: SelfProof<undefined, GameOutput>,
    verificationKey: string,
    playerBoard: Tile[]
  ) {
    // Generate proof and output using the ZkProgram
    const { proof: playTurn } = await TileGameProgram.check(
      earlierProof,
      playerBoard
    );

    // Verify the proof
    const isValid = await verify(playTurn.toJSON(), verificationKey);

    if (!isValid) {
      throw new Error('Tile game initialization for User 2 failed!');
    }
    return playTurn;
  }
}
