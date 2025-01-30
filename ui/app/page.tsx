"use client";

import "./reactCOIServiceWorker";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import the useRouter hook
import { useWalletStore } from "../store/walletStore";
import "./reactCOIServiceWorker";
import ZkappWorkerClient from "../lib/contract/zkappWorkerClient";

export default function Home() {
  const router = useRouter(); // Initialize the router
  const { walletInfo, connect } = useWalletStore();
  const [zkappWorkerClient, setZkappWorkerClient] =
    useState<null | ZkappWorkerClient>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Redirect to GameRoom when wallet is connected
  useEffect(() => {
    const init = async () => {
      if (walletInfo.isConnected) {
        try {
          setLoading(true);
          setStatus("Initializing web worker...");

          const zkappWorkerClient = new ZkappWorkerClient();
          setZkappWorkerClient(zkappWorkerClient);

          await new Promise((resolve) => setTimeout(resolve, 5000));
          setStatus("Loading web worker complete");

          setStatus("Compiling TileGame program...");
          await zkappWorkerClient.compileTileGameProgram();
          setStatus("Compilation complete");

          router.push("/startGame");
        } catch (error) {
          console.error("Initialization error:", error);
          setStatus("Error occurred during initialization");
        } finally {
          setLoading(false);
        }
      }
    };
    init();
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

        {/* Loading Status */}
        {loading && (
          <div>
            <p>Loading: {status}</p>
          </div>
        )}
      </div>
    </>
  );
}
