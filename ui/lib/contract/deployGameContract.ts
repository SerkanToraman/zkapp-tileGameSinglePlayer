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
  player: PublicKey
): Promise<{ zkAppAddress: string; txId: string }> {
  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();
  console.log("zkAppAddress", zkAppAddress.toBase58());
  const zkAppInstance = new GameContract(zkAppAddress);

  const Network = Mina.Network(
    "https://api.minascan.io/node/devnet/v1/graphql"
  );
  Mina.setActiveInstance(Network);

  const vk = (await GameContract.compile()).verificationKey.hash.toJSON();
  console.log("vk", vk);

  // const balance = await Mina.getBalance(player);
  // console.log("Player Balance:", balance.toString());

  const deployTransaction = await Mina.transaction(async () => {
    AccountUpdate.fundNewAccount(player);
    await zkAppInstance.deploy();
    await zkAppInstance.initGame(player);
  });

  await deployTransaction.prove();

  // Serialize the transaction (optional for debugging or signing via wallet)
  const serializedTransaction = deployTransaction.toJSON();
  console.log(
    "Serialized Transaction:",
    JSON.stringify(serializedTransaction, null, 2)
  );
  // Sign the transaction with necessary private keys
  deployTransaction.sign([deployerKey, zkAppPrivateKey]);

  // Send the transaction to the Mina network
  console.log("Sending the transaction...");
  const pendingTransaction = await deployTransaction.send();

  // Retrieve and return the transaction hash
  const txId = pendingTransaction.hash;
  console.log("Transaction ID:", txId);

  return { zkAppAddress: zkAppAddress.toBase58(), txId };
}

export { deployGameContract };
