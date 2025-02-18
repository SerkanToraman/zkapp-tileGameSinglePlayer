import { Struct, PublicKey, Field, Provable } from "o1js";

export type Tile = {
  url: string;
};

export class PublicOutput extends Struct({
  Player: PublicKey,
  turn: Field,
  step: Field,
  move: Provable.Array(Field, 2),
  PlayerPreviousMoves: Provable.Array(Field, 16),
  boardHash: Field,
  playerMatchCount: Field,
}) {}
