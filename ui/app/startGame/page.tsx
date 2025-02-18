"use client";
import React, { useState, useEffect } from "react";
import { useGameStore } from "../../store/gameStore";
import { deployGameContract } from "../../lib/contract/deployGameContract";
import { PublicKey } from "o1js";
import { generateTiles } from "../../lib/tile/generateTiles";
import { useTileStore } from "../../store/tileStore";
import { useRouter } from "next/navigation";
import { useZkProgramStore } from "../../store/zkProgramStore";
import { hashUrl } from "../../lib/helpers";

const StartPage: React.FC = () => {
  const router = useRouter(); // Initialize the router
  const userWallet = useGameStore((state) => state.userWallet);
  const [contractResult, setContractResult] = useState<{
    zkAppAddress: string;
    hash: string;
  } | null>(null);
  const { verificationKey, zkAppWorkerClient, setProof } = useZkProgramStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State to store error message
  const [isLoading, setIsLoading] = useState<boolean>(false); // State to manage loading state
  const { setTiles } = useTileStore();
  const deployContract = async (playerPublicKey: string) => {
    try {
      setIsLoading(true);
      setContractResult(null);
      setErrorMessage(null);

      const playerPublicKeyString = PublicKey.fromBase58(playerPublicKey);

      const response = await deployGameContract(playerPublicKeyString);
      const tiles = generateTiles();
      setTiles(tiles);
      const tileFields = tiles.map((tile) => hashUrl(tile.url));
      console.log("zkAppWorkerClient", zkAppWorkerClient);
      const initGameProof = await zkAppWorkerClient!.initializeGame(
        verificationKey,
        playerPublicKeyString,
        tileFields.map((f) => f.toBigInt())
      );
      console.log("initGameProof", initGameProof);
      setProof(initGameProof);
      setContractResult(response);
    } catch (error) {
      console.error("Failed to deploy contract:", error);
      // Set error message in state
      setErrorMessage("Failed to deploy contract. Please try again.");
    } finally {
      setIsLoading(false);
      router.push("/playGame");
    }
  };

  const handleDeployClick = async () => {
    if (userWallet) {
      await deployContract(userWallet);
      console.log("Deployed contract");
    } else {
      setErrorMessage("User wallet is not available.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Start Page</h1>

      {userWallet ? (
        <p>
          <strong>User Wallet:</strong> {userWallet}
        </p>
      ) : (
        <p>Loading user wallet...</p>
      )}

      <h2>Contract Deployment</h2>

      <button
        onClick={handleDeployClick}
        disabled={isLoading || !userWallet}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: isLoading || !userWallet ? "#ccc" : "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: isLoading || !userWallet ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Deploying..." : "Deploy Contract"}
      </button>

      {errorMessage && (
        <div style={{ color: "red", marginTop: "10px" }}>
          <strong>Error:</strong> {errorMessage}
        </div>
      )}
    </div>
  );
};

export default StartPage;
