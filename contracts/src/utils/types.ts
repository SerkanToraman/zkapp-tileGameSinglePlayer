import { Field, Mina, PublicKey, Provable, Struct, Signature } from 'o1js';

export interface GameContract {
  deploy: () => Promise<void>;
  initGame: (player1: Mina.TestPublicKey) => Promise<void>;
  distributeReward: (player: PublicKey) => Promise<void>;
}

// Define a Tile as a struct
export class Tile extends Struct({
  id: Field,
}) {}
// Define the PublicInput structure
export class GameInput extends Struct({
  signiture: Signature,
}) {}

// Define the Output structure
// export class GameOutput extends Struct({
//   Player1: PublicKey,
//   Player2: PublicKey,
//   Board1Hash: Field,
//   Board2Hash: Field,
//   turn: Field,
//   move: Provable.Array(Field, 2),
//   Player1MatchCount: Field,
//   Player2MatchCount: Field,
//   Player1PreviousMoves: Provable.Array(Field, 4),
//   Player2PreviousMoves: Provable.Array(Field, 4),
// }) {}

export class GameOutput extends Struct({
  Player: PublicKey,
  turn: Field,
  move: Provable.Array(Field, 2),
  PlayerPreviousMoves: Provable.Array(Field, 4),
  boardHash: Field,
  playerMatchCount: Field,
}) {}

// Define PlayerTiles as a struct
export class PlayerTiles extends Struct({
  tiles: [Tile],
}) {}
