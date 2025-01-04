import { PrivateKey, PublicKey, UInt64, Mina, AccountUpdate } from "o1js";
import { GameContract } from "../../../contracts/src/GameContract";

/**
 * Helper function to deploy the GameContract smart contract
 * @param {PrivateKey} deployerKey - The private key for the deployer account
 * @param {PublicKey[]} players - Array of public keys for players (2 players)
 * @returns {Promise<{ zkAppAddress: string; txId: string }>} - Returns the zkApp address and transaction ID
 */
async function deployGameContract(
  deployerKey: PrivateKey,
  players: PublicKey[]
): Promise<{ zkAppAddress: string; txId: string }> {
  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();
  const zkAppInstance = new GameContract(zkAppAddress);

  const Network = Mina.Network(
    "https://api.minascan.io/node/devnet/v1/graphql"
  );
  Mina.setActiveInstance(Network);

  const vk = (await GameContract.compile()).verificationKey.hash.toJSON();
  console.log("vk", vk);

  const deployTransaction = await Mina.transaction(
    {
      sender: deployerKey.toPublicKey(),
      fee: UInt64.from(100_000_000),
    },
    async () => {
      AccountUpdate.fundNewAccount(deployerKey.toPublicKey());
      await zkAppInstance.deploy();
      await zkAppInstance.initGame(players[0]);
    }
  );
  await deployTransaction.prove();

  deployTransaction.sign([deployerKey, zkAppPrivateKey]);
  const pendingTransaction = await deployTransaction.send();
  const txId = pendingTransaction.hash;

  return { zkAppAddress: zkAppAddress.toBase58(), txId };
}

export { deployGameContract };
