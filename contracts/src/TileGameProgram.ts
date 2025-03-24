import {
  Field,
  ZkProgram,
  SelfProof,
  Provable,
  PublicKey,
  Signature,
} from 'o1js';
import { PublicOutput } from './utils/types';
import { hashFieldsWithPoseidon } from './utils/helpers';

//TODO:
//Dİnamik signiture (move ve turn olacak)
//Turn de 1,2 yerine artan sayi olacak ve kullaniclar turn sayisi mod kullanarak tek mi cift mi di ye kontol edilecek
// Bitcoine bak, etherium - proof of stake and proof of work

const boardArraySize = 16;
const selectedTilesSize = 2;
const emptyTiles = new Array(2).fill(Field(-1));
const emptyPreviousMoves = new Array(boardArraySize).fill(Field(-1));

// Define the TileGameProgram
export const TileGameProgram = ZkProgram({
  name: 'tile-game',
  publicInput: undefined,
  publicOutput: PublicOutput,

  methods: {
    // Initialize the game state for Player 1
    initGamePlayer: {
      privateInputs: [PublicKey, Provable.Array(Field, boardArraySize)],
      async method(player: PublicKey, playerBoard: Field[]) {
        // Verify player is not empty
        player.isEmpty().assertFalse('Player public key cannot be empty');

        // Verify playerBoard is complete
        for (let i = 0; i < boardArraySize; i++) {
          playerBoard[i].equals(Field(-1)).assertFalse('Invalid tile ID');
        }

        // Compute the board hash including the salt.
        const boardHash = hashFieldsWithPoseidon(playerBoard);

        return {
          publicOutput: new PublicOutput({
            Player: player,
            turn: Field(1),
            step: Field(1),
            move: emptyTiles,
            PlayerPreviousMoves: emptyPreviousMoves,
            boardHash: boardHash,
            playerMatchCount: Field(0),
          }),
        };
      },
    },

    // Method to play a turn in the game
    play: {
      privateInputs: [
        SelfProof<undefined, PublicOutput>,
        Provable.Array(Field, 2),
        Signature,
        Field,
      ],
      async method(
        earlierProof: SelfProof<undefined, PublicOutput>,
        selectedTiles: Field[],
        playerSignature: Signature,
        step: Field
      ) {
        const selectedTilesHashForVerification =
          hashFieldsWithPoseidon(selectedTiles);

        const isVerified = playerSignature.verify(
          earlierProof.publicOutput.Player,
          [step, selectedTilesHashForVerification]
        );
        earlierProof.verify();
        // Enforce the signature verification result
        isVerified.assertTrue('Signature verification failed!');

        earlierProof.publicOutput.step.equals(step).assertTrue('Invalid step!');

        // Assert that Player is not empty
        earlierProof.publicOutput.Player.equals(PublicKey.empty())
          .not()
          .assertTrue('Player is empty!');

        // Assert that the turn is Field(2)
        earlierProof.publicOutput.turn
          .equals(Field(1))
          .assertTrue("It is not Player 2's turn!");

        return {
          publicOutput: new PublicOutput({
            Player: earlierProof.publicOutput.Player,
            turn: Field(2),
            step: step.add(Field(1)),
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
        SelfProof<undefined, PublicOutput>,
        Provable.Array(Field, boardArraySize),
      ],
      async method(
        earlierProof: SelfProof<undefined, PublicOutput>,
        playerBoard: Field[]
      ) {
        earlierProof.verify();
        // Assert that the turn is Field(2)
        const boardHash = hashFieldsWithPoseidon(playerBoard);
        earlierProof.publicOutput.boardHash
          .equals(boardHash)
          .assertTrue('Invalid board hash!');

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
            playerBoard[i],
            tile1
          );
          tile2 = Provable.if(
            earlierProof.publicOutput.move[1].equals(Field(i)),
            playerBoard[i],
            tile2
          );
        }
        // Check if the selected tiles match
        const isTilesMatch = tile1.equals(tile2).and(isMoveEmpty).not();

        // Verify that PlayerPreviousMoves is a valid array
        // const previousMoves = earlierProof.publicOutput.PlayerPreviousMoves;
        // Field(previousMoves.length).assertEquals(
        //   Field(boardArraySize),
        //   'Invalid previous moves array length'
        // );

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
          publicOutput: new PublicOutput({
            Player: earlierProof.publicOutput.Player,
            turn: Field(1),
            step: earlierProof.publicOutput.step.add(Field(1)),
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
