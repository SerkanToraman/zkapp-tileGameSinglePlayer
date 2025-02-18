import {
  PrivateKey,
  Mina,
  PublicKey,
  UInt64,
  Field,
  SelfProof,
  Signature,
} from 'o1js';
import { GameContract } from '../GameContract';
import { TileGameLogic } from '../utils/TileGameSteps';
import { TileGameProgram } from '../TileGameProgram';
import {
  hashUrl,
  checkGameOverAndDistributeReward,
  deployZkApp,
  hashFieldsWithPoseidon,
} from '../utils/helpers';
import { PlayerTiles, Tile, PublicOutput } from '../utils/types';

let proofsEnabled = true;
let verificationKey: string;
let earlierProof: SelfProof<undefined, PublicOutput>;
let boardForPlayer: PlayerTiles;
let playerSignature: Signature;

describe('GameContract', () => {
  let PlayerAccount: Mina.TestPublicKey,
    PlayerKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: GameContract;

  beforeAll(async () => {
    if (proofsEnabled) await GameContract.compile();

    const { verificationKey: zkProgramVerificationKey } =
      await TileGameProgram.compile();
    verificationKey = zkProgramVerificationKey.data;
    console.log('ZkProgram compiled successfully.');

    // Set up local blockchain
    const localChain = await Mina.LocalBlockchain({
      proofsEnabled,
    });
    Mina.setActiveInstance(localChain);

    [PlayerAccount] = localChain.testAccounts;
    PlayerKey = PlayerAccount.key;
    const Player1AccountBalance = await Mina.getBalance(PlayerAccount);
    console.log(
      `Player 1 initial balance: ${Player1AccountBalance.toString()}`
    );

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new GameContract(zkAppAddress);

    // Initialize tiles for Player 1 and Player 2
    boardForPlayer = new PlayerTiles({
      tiles: [
        new Tile({ id: hashUrl('/models/tile1.glb') }),
        new Tile({ id: hashUrl('/models/tile2.glb') }),
        new Tile({ id: hashUrl('/models/tile1.glb') }),
        new Tile({ id: hashUrl('/models/tile2.glb') }),
        new Tile({ id: hashUrl('/models/tile3.glb') }),
        new Tile({ id: hashUrl('/models/tile4.glb') }),
        new Tile({ id: hashUrl('/models/tile5.glb') }),
        new Tile({ id: hashUrl('/models/tile6.glb') }),
        new Tile({ id: hashUrl('/models/tile7.glb') }),
        new Tile({ id: hashUrl('/models/tile8.glb') }),
        new Tile({ id: hashUrl('/models/tile3.glb') }),
        new Tile({ id: hashUrl('/models/tile4.glb') }),
        new Tile({ id: hashUrl('/models/tile5.glb') }),
        new Tile({ id: hashUrl('/models/tile6.glb') }),
        new Tile({ id: hashUrl('/models/tile7.glb') }),
        new Tile({ id: hashUrl('/models/tile8.glb') }),
      ],
    });
  });

  it('should deploy the contract', async () => {
    await deployZkApp(zkApp, zkAppPrivateKey, PlayerAccount, PlayerKey);

    // Check that the zkApp was deployed to the correct address
    expect(zkApp.address).toEqual(zkAppAddress);

    // Check the initial state of player1 and player2
    const player1 = zkApp.player1.get();

    expect(player1.toBase58()).toEqual(PlayerAccount.toBase58());

    // Verify the total amount in the zkApp account
    const balance = await Mina.getBalance(zkAppAddress);
    const player1Balance = await Mina.getBalance(PlayerAccount);
    console.log(`Initial zkApp Balance: ${balance.toString()}`);
    console.log(`Initial Player 1 Balance: ${player1Balance.toString()}`);
    expect(balance).toEqual(UInt64.from(2_000_000_000));
  });

  it('should initialise the game', async () => {
    const proof = await TileGameLogic.initializeGameForUser(
      verificationKey,
      PlayerAccount,
      boardForPlayer.tiles.map((tile) => tile.id)
    );
    earlierProof = proof;

    expect(earlierProof).toBeDefined();
  });

  it('should play turn 1', async () => {
    const selectedTiles = [Field(0), Field(2)];
    const selectedTilesHash = hashFieldsWithPoseidon(
      selectedTiles.map((tile) => tile)
    );
    const step = earlierProof.publicOutput.step;
    playerSignature = Signature.create(PlayerKey, [step, selectedTilesHash]);

    const proof = await TileGameLogic.play(
      earlierProof,
      verificationKey,
      playerSignature,
      selectedTiles,
      step
    );

    earlierProof = proof;

    expect(earlierProof).toBeDefined();
  });

  it('should check player move 1', async () => {
    const proof = await TileGameLogic.check(
      earlierProof,
      verificationKey,
      boardForPlayer.tiles.map((tile) => tile.id)
    );
    checkGameOverAndDistributeReward(
      proof.publicOutput.playerMatchCount,
      PlayerAccount,
      zkApp,
      zkAppPrivateKey,
      zkAppAddress,
      PlayerKey
    );

    earlierProof = proof;

    expect(earlierProof).toBeDefined();
  });

  it('should play turn 2', async () => {
    const selectedTiles = [Field(1), Field(3)];
    const selectedTilesHash = hashFieldsWithPoseidon(
      selectedTiles.map((tile) => tile)
    );
    const step = earlierProof.publicOutput.step;
    playerSignature = Signature.create(PlayerKey, [step, selectedTilesHash]);

    const proof = await TileGameLogic.play(
      earlierProof,
      verificationKey,
      playerSignature,
      selectedTiles,
      step
    );

    earlierProof = proof;

    expect(earlierProof).toBeDefined();
  });

  it('should check player move 2', async () => {
    const proof = await TileGameLogic.check(
      earlierProof,
      verificationKey,
      boardForPlayer.tiles.map((tile) => tile.id)
    );
    checkGameOverAndDistributeReward(
      proof.publicOutput.playerMatchCount,
      PlayerAccount,
      zkApp,
      zkAppPrivateKey,
      zkAppAddress,
      PlayerKey
    );

    earlierProof = proof;

    expect(earlierProof).toBeDefined();
  });
});
