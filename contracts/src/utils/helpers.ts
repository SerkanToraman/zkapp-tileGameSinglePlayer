import {
  Field,
  Mina,
  PublicKey,
  Provable,
  AccountUpdate,
  PrivateKey,
  Poseidon,
  Bool,
} from 'o1js';
import { createHash } from 'crypto';
import { GameContract } from './types';

export function hashUrl(url: string): Field {
  const hash = createHash('sha256').update(url).digest('hex'); // Compute SHA-256 hash
  const hashNumber = BigInt(`0x${hash.slice(0, 16)}`); // Use the first 16 characters for simplicity
  return Field(hashNumber);
}

export function hashFieldsWithPoseidon(fields: Field[]): Field {
  return Poseidon.hash(fields); // Efficient zk-friendly hashing
}

export function checkGameOverAndDistributeReward(
  playerMatchCount: Field,
  currentPlayerAccount: PublicKey,
  zkApp: GameContract,
  zkAppPrivateKey: PrivateKey,
  zkAppAddress: PublicKey,
  PlayerKey: PrivateKey
) {
  Provable.asProver(() => {
    // Check if the number of non-zero matched tiles is 2

    console.log('playerMatchCount', playerMatchCount);
    console.log('currentPlayerAccount', Field(2));

    const isGameOver = Bool(playerMatchCount.equals(Field(2)));
    console.log('isGameOver', isGameOver);

    if (isGameOver.toBoolean()) {
      console.log(`Distributing reward to Player...`);

      // Call distributeReward directly
      distributeReward(
        zkApp,
        zkAppPrivateKey,
        zkAppAddress,
        currentPlayerAccount,
        PlayerKey
      );
    } else {
      console.log('Game is not over yet.');
    }
  });
}

export async function deployZkApp(
  zkApp: GameContract,
  zkAppPrivateKey: PrivateKey,
  Player1Account: Mina.TestPublicKey,
  Player1Key: PrivateKey
) {
  const txn = await Mina.transaction(Player1Account, async () => {
    AccountUpdate.fundNewAccount(Player1Account);
    await zkApp.deploy();
    await zkApp.initGame(Player1Account);
  });

  // Sign the transaction with all required keys
  await txn.prove();
  await txn.sign([zkAppPrivateKey, Player1Key]).send();
}

export async function distributeReward(
  zkApp: GameContract,
  zkAppPrivateKey: PrivateKey,
  zkAppAddress: PublicKey,
  winnerAccount: PublicKey,
  PlayerKey: PrivateKey
) {
  const txn = await Mina.transaction(winnerAccount, async () => {
    await zkApp.distributeReward(winnerAccount);
  });

  await txn.prove();
  await txn.sign([zkAppPrivateKey, PlayerKey]).send();

  const winnerBalanceAfter = await Mina.getBalance(winnerAccount);
  const zkAppBalanceAfter = await Mina.getBalance(zkAppAddress);

  console.log(
    `Winner Balance After game Completed: ${winnerBalanceAfter.toString()}`
  );
  console.log(
    `zkApp Balance After game Completed: ${zkAppBalanceAfter.toString()}`
  );
}
