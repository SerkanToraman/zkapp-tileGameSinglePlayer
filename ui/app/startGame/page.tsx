"use client";
import React, { useState } from "react";
import { useGameStore } from "../../store/gameStore";

const StartPage: React.FC = () => {
  const userWallet = useGameStore((state) => state.userWallet);
  const [contractResult, setContractResult] = useState<string | null>(null); // State to store contract deployment result
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State to store error message
  const [isLoading, setIsLoading] = useState<boolean>(false); // State to manage loading state

  const deployContract = async (playerPublicKey: string) => {
    try {
      setIsLoading(true);
      setContractResult(null); // Clear previous results
      setErrorMessage(null); // Clear previous errors

      const response = await fetch("/api/deployGameContract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerPublicKey }),
      });

      if (!response.ok) {
        throw new Error("Failed to deploy contract");
      }

      const result = await response.json();
      console.log("Contract deployed:", result);

      // Set the result in state to display it in the UI
      setContractResult(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Failed to deploy contract:", error);

      // Set error message in state
      setErrorMessage("Failed to deploy contract. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeployClick = () => {
    if (userWallet) {
      deployContract(userWallet);
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

      {contractResult && (
        <div>
          <h3>Deployment Result:</h3>
          <pre
            style={{
              background: "#f4f4f4",
              padding: "10px",
              borderRadius: "5px",
              overflowX: "auto",
            }}
          >
            {contractResult}
          </pre>
        </div>
      )}

      {errorMessage && (
        <div style={{ color: "red", marginTop: "10px" }}>
          <strong>Error:</strong> {errorMessage}
        </div>
      )}
    </div>
  );
};

export default StartPage;
