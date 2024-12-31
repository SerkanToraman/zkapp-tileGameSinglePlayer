import {
  Field,
  ZkProgram,
  SelfProof,
  Provable,
  PublicKey,
  Signature,
} from 'o1js';
import { GameInput, GameOutput, Tile } from './utils/types';

const emptyTiles = new Array(2).fill(Field(-1));
const emptyPreviousMoves = new Array(4).fill(Field(-1));
const boardArraySize = 4;

// Define the TileGameProgram
export const TileGameProgram = ZkProgram({
  name: 'tile-game',
  publicInput: undefined,
  publicOutput: GameOutput,

  methods: {
    // Initialize the game state for Player 1
    initGamePlayer: {
      privateInputs: [Field, PublicKey],
      async method(boardHash: Field, player: PublicKey) {
        return {
          publicOutput: new GameOutput({
            Player: player,
            turn: Field(1),
            move: emptyTiles,
            PlayerPreviousMoves: emptyPreviousMoves,
            boardHash,
            playerMatchCount: Field(0),
          }),
        };
      },
    },

    // Method to play a turn in the game
    play: {
      privateInputs: [
        SelfProof<undefined, GameOutput>,
        Provable.Array(Field, 2),
        Signature,
      ],
      async method(
        earlierProof: SelfProof<undefined, GameOutput>,
        selectedTiles: Field[],
        playerSignature: Signature
      ) {
        earlierProof.verify();

        const isVerified = playerSignature.verify(
          earlierProof.publicOutput.Player,
          [earlierProof.publicOutput.boardHash, Field(123)]
        );
        // Enforce the signature verification result
        isVerified.assertTrue('Signature verification failed!');

        // Assert that Player is not empty
        earlierProof.publicOutput.Player.equals(PublicKey.empty())
          .not()
          .assertTrue('Player is empty!');

        // Assert that the turn is Field(2)
        earlierProof.publicOutput.turn
          .equals(Field(1))
          .assertTrue("It is not Player 2's turn!");

        return {
          publicOutput: new GameOutput({
            Player: earlierProof.publicOutput.Player,
            turn: Field(2),
            move: selectedTiles,
            PlayerPreviousMoves: earlierProof.publicOutput.PlayerPreviousMoves,
            boardHash: earlierProof.publicOutput.boardHash,
            playerMatchCount: earlierProof.publicOutput.playerMatchCount,
          }),
        };
      },
    },

    check: {
      privateInputs: [
        SelfProof<undefined, GameOutput>,
        Provable.Array(Tile, 4),
      ],
      async method(
        earlierProof: SelfProof<undefined, GameOutput>,
        playerBoard: Tile[]
      ) {
        earlierProof.verify();
        // Assert that the turn is Field(2)
        earlierProof.publicOutput.turn
          .equals(Field(2))
          .assertTrue("It is not House's turn!");

        // Check if the previous move is made by the player
        const isMoveEmpty = earlierProof.publicOutput.move[0]
          .equals(Field(-1))
          .and(earlierProof.publicOutput.move[1].equals(Field(-1)));

        let tile1 = Field(0);
        let tile2 = Field(0);

        // Use a loop to find the Tiles corresponding to selected indices
        for (let i = 0; i < boardArraySize; i++) {
          tile1 = Provable.if(
            earlierProof.publicOutput.move[0].equals(Field(i)),
            playerBoard[i].id,
            tile1
          );
          tile2 = Provable.if(
            earlierProof.publicOutput.move[1].equals(Field(i)),
            playerBoard[i].id,
            tile2
          );
        }
        // Check if the selected tiles match
        const isTilesMatch = tile1.equals(tile2).and(isMoveEmpty).not();

        Provable.log(
          'earlierProof.publicOutput.move:',
          earlierProof.publicOutput.move
        );

        // Loop through matched tiles to validate selected tiles without using `if`
        for (let i = 0; i < boardArraySize; i++) {
          const isMove0Matched = earlierProof.publicOutput.PlayerPreviousMoves[
            i
          ].equals(earlierProof.publicOutput.move[0]);

          const isMove1Matched = earlierProof.publicOutput.PlayerPreviousMoves[
            i
          ].equals(earlierProof.publicOutput.move[1]);

          // If tiles are matched and any move has already been performed by the player, then throw an error
          isTilesMatch
            .and(isMove0Matched.or(isMove1Matched))
            .assertFalse('Selected Tiles are already matched!');
        }

        // Calculate Player1MatchCount
        const playerMatchCount = Provable.if(
          isMoveEmpty,
          earlierProof.publicOutput.playerMatchCount,
          Provable.if(
            isTilesMatch,
            earlierProof.publicOutput.playerMatchCount.add(1),
            earlierProof.publicOutput.playerMatchCount
          )
        );
        // Update the previous moves of the player
        const PlayerPreviousMoves = Provable.switch(
          [isMoveEmpty, isTilesMatch],
          Provable.Array(Field, boardArraySize),
          [
            earlierProof.publicOutput.PlayerPreviousMoves,
            (() => {
              const updatedTiles = [
                ...earlierProof.publicOutput.PlayerPreviousMoves,
              ];
              let replaced = Field(0);

              for (let i = 0; i < boardArraySize; i++) {
                const isEmptySlot = updatedTiles[i].equals(Field(-1));
                const canReplace = replaced.lessThan(Field(2));

                updatedTiles[i] = Provable.if(
                  isEmptySlot.and(canReplace),
                  Provable.if(
                    replaced.equals(Field(0)),
                    earlierProof.publicOutput.move[0],
                    earlierProof.publicOutput.move[1]
                  ),
                  updatedTiles[i]
                );

                replaced = Provable.if(
                  isEmptySlot.and(canReplace),
                  replaced.add(Field(1)),
                  replaced
                );
              }

              return updatedTiles;
            })(),
          ]
        );
        return {
          publicOutput: new GameOutput({
            Player: earlierProof.publicOutput.Player,
            turn: Field(1),
            move: emptyTiles,
            PlayerPreviousMoves,
            boardHash: earlierProof.publicOutput.boardHash,
            playerMatchCount,
          }),
        };
      },
    },
  },
});
