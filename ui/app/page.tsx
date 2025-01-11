"use client";

import "./reactCOIServiceWorker";
import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Import the useRouter hook
import { useWalletStore } from "../store/walletStore";

export default function Home() {
  const router = useRouter(); // Initialize the router
  const { walletInfo, connect } = useWalletStore();

  // Redirect to GameRoom when wallet is connected
  useEffect(() => {
    if (walletInfo.isConnected) {
      router.push("/startGame"); // Replace with the correct path to GameRoom
    }
  }, [walletInfo.isConnected, router]);

  return (
    <>
      <Head>
        <title>Mina zkApp UI</title>
        <meta name="description" content="built with o1js" />
        <link rel="icon" href="/assets/favicon.ico" />
      </Head>

      <div style={{ padding: "20px" }}>
        {/* Message for Wallet Connection */}
        {!walletInfo.isConnected && (
          <>
            <p>Please connect your wallet to continue.</p>
            <button
              onClick={connect}
              style={{ padding: "10px 20px", fontSize: "16px" }}
            >
              Connect Wallet
            </button>
          </>
        )}
      </div>
    </>
  );
}
