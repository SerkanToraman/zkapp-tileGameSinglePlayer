import { NextRequest, NextResponse } from "next/server";
import { deployGameContract } from "../../../lib/contract/deployGameContract";
import { PrivateKey, PublicKey } from "o1js";

// Your API route to deploy the game contract
export async function POST(request: NextRequest) {
  try {
    console.log("Deploying game contract...");

    // Parse the request body for required parameters
    const { playerPublicKey } = await request.json();
    console.log("Player keys received:", playerPublicKey);

    console.log("playerKey Test", playerPublicKey);
    // Convert playerKeys from Base58 strings to PublicKey instances
    // const players = playerKeys.map((key: string) => PublicKey.fromBase58(key));

    // Convert the playerKey from Base58 string to PublicKey instance
    const playerPublicKeyString = PublicKey.fromBase58(playerPublicKey);

    // Call your deployGameContract function with the deployer key and player keys
    const result = await deployGameContract(playerPublicKeyString);

    console.log("Game contract deployed successfully:", result);

    // Respond with the deployment result
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deploying game contract:", error);
    return NextResponse.json(
      { error: "Failed to deploy game contract" },
      { status: 500 }
    );
  }
}
