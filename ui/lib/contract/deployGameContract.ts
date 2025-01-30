import { PrivateKey, PublicKey, Mina, AccountUpdate } from "o1js";
import { GameContract } from "../../../contracts/src/GameContract";

// Define types for handling transaction responses and errors

type SendTransactionHash = {
  hash: string;
};

/**
 * Helper function to deploy the GameContract smart contract
 * @param {PrivateKey} deployerKey - The private key for the deployer account
 * @param {PublicKey[]} players - Array of public keys for players (2 players)
 * @returns {Promise<{ zkAppAddress: string; hash: string }>} - Returns the zkApp address and transaction hash
 */
async function deployGameContract(
  player: PublicKey
): Promise<{ zkAppAddress: string; hash: string }> {
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

  // Create the deployment transaction
  const deployTransaction = await Mina.transaction(
    {
      sender: player,
      fee: 1e8, // 100,000,000 in base units
    },
    async () => {
      await zkAppInstance.deploy();
      await zkAppInstance.initGame(player);
    }
  );

  await deployTransaction.prove();

  // Sign the transaction with necessary private keys
  deployTransaction.sign([zkAppPrivateKey]);

  const serializedTransaction = deployTransaction.toJSON();

  console.log("Transaction is signed. Ready to send...");

  if (typeof window !== "undefined" && window.mina) {
    try {
      const { hash }: SendTransactionHash = await window.mina.sendTransaction({
        transaction: serializedTransaction,
        feePayer: {
          fee: 0.1,
          memo: "",
        },
      });

      console.log("Transaction sent! Transaction ID:", hash);

      return { zkAppAddress: zkAppAddress.toBase58(), hash };
    } catch (error: any) {
      console.error("Error sending transaction:", error);
      throw new Error(`Failed to send transaction: ${error.message}`);
    }
  } else {
    throw new Error(
      "Auro Wallet is not available in this environment. Please run this in a browser with Auro Wallet."
    );
  }
}

export { deployGameContract };
