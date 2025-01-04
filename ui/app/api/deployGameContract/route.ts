import { NextRequest, NextResponse } from "next/server";
import { deployGameContract } from "../../../lib/contract/deployGameContract";
import { PrivateKey, PublicKey } from "o1js";

// Your API route to deploy the game contract
export async function POST(request: NextRequest) {
  try {
    console.log("Deploying game contract...");

    // Parse the request body for required parameters
    const { playerKeys } = await request.json();
    console.log("Player keys received:", playerKeys);

    // Generate a random deployer key (for testing or development)
    const deployerPrivateKey = PrivateKey.random();
    console.log(
      "Generated deployer key (Base58):",
      deployerPrivateKey.toBase58()
    );

    // Convert playerKeys from Base58 strings to PublicKey instances
    const players = playerKeys.map((key: string) => PublicKey.fromBase58(key));

    // Call your deployGameContract function with the deployer key and player keys
    const result = await deployGameContract(deployerPrivateKey, players);

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
