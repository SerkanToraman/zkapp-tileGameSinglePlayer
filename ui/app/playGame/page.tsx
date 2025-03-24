"use client";
import { useTileStore } from "../../store/tileStore";
import { Canvas } from "@react-three/fiber";
import { useState, useCallback, useRef } from "react";
import { Tile } from "../../components/Tile";
import { useZkProgramStore } from "../../store/zkProgramStore";
import { useWalletStore } from "../../store/walletStore";
import { hashFieldsWithPoseidon, hashUrl } from "../../lib/helpers";
import { Field, Poseidon, Signature } from "o1js";
import { SignedData } from "@aurowallet/mina-provider";
import { ProviderError } from "@aurowallet/mina-provider";
import JSONbig from "json-bigint";

const GamePage: React.FC = () => {
  const { tiles } = useTileStore();
  const flippedTilesRef = useRef<{ id: string; url: string }[]>([]);
  const [flippedBackIds, setFlippedBackIds] = useState<string[]>([]);
  const [matchedTiles, setMatchedTiles] = useState<string[]>([]);
  const [disappearingTiles, setDisappearingTiles] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const { verificationKey, zkAppWorkerClient, proof } = useZkProgramStore();
  const { walletInfo } = useWalletStore();

  const canFlipMore = flippedBackIds.length < 2;

  const handleTileFlip = useCallback(
    async (tileId: string, tileUrl: string) => {
      if (flippedTilesRef.current.some((tile) => tile.id === tileId)) return;
      flippedTilesRef.current.push({ id: tileId, url: tileUrl });
      if (flippedTilesRef.current.length === 2) {
        setIsChecking(true);
        if (flippedTilesRef.current[0].url === flippedTilesRef.current[1].url) {
          const matchedTileIds = [
            flippedTilesRef.current[0].id,
            flippedTilesRef.current[1].id,
          ];
          setTimeout(() => {
            setMatchedTiles((prev) => [...prev, ...matchedTileIds]);
            flippedTilesRef.current = [];
            setScore((prev) => prev + 1);
            setIsChecking(false);
          }, 1000);
        } else {
          console.log("not matched");
          const unmatchedTileIds = flippedTilesRef.current.map(
            (tile) => tile.id
          );
          setTimeout(() => {
            setFlippedBackIds(unmatchedTileIds);
            flippedTilesRef.current = [];
            setTimeout(() => {
              setFlippedBackIds([]);
              setIsChecking(false);
            }, 100);
          }, 1000);
        }
        try {
          if (!zkAppWorkerClient || !proof || !verificationKey) {
            console.error("ZK components not initialized:", {
              hasClient: !!zkAppWorkerClient,
              hasProof: !!proof,
              hasVerificationKey: !!verificationKey,
            });
            return;
          }

          const step = Field(1);
          console.log("selectedTiles", flippedTilesRef.current);
          const selectedTiles = flippedTilesRef.current.map((tile) =>
            hashUrl(tile.id)
          );
          console.log("selectedTiles", selectedTiles);

          const valueTobeHashed = [step, ...selectedTiles];
          const selectedTilesArray = selectedTiles.map((f) => f.toBigInt());

          const hashValue = Poseidon.hash(valueTobeHashed);
          const hashValueArray = hashValue.toBigInt().toString();

          // Before signing
          try {
            const signatureResponse =
              await // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (window as any)?.mina
                ?.signMessage({
                  message: hashValueArray,
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch((err: any) => err);

            // Convert signature to json

            const signatureData = {
              signature: {
                field: signatureResponse.signature.field,
                scalar: signatureResponse.signature.scalar,
              },
            };
            const signatureJson = JSON.stringify(signatureData);

            const steps = BigInt(1);
            const proofJson = JSONbig.stringify(proof);

            //get the type of the proof
            const proofType = typeof proof;
            console.log("proofType", proofType);

            const playTurn = await zkAppWorkerClient.play(
              proofJson,
              verificationKey,
              selectedTilesArray,
              signatureJson
            );
            console.log("playTurn", playTurn);
          } catch (error) {
            console.error("Detailed signing error:", error);
          }
        } catch (error) {
          console.error("Error in ZK game interaction:", error);
        }
      }
    },
    []
  );

  const handleTileDisappear = useCallback((tileId: string) => {
    setDisappearingTiles((prev) => [...prev, tileId]);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: "5rem",
          width: "100%",
        }}
      >
        <div>Score: {score}</div>
      </div>

      <Canvas
        style={{ width: "100%", height: "60rem" }}
        camera={{ position: [0, 0, 20], fov: 75 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        {tiles.map(
          (tile, index) =>
            !disappearingTiles.includes(index.toString()) && (
              <Tile
                id={index.toString()}
                key={index}
                url={tile.url}
                position={[
                  (index % 4) * 4.5 - 6,
                  Math.floor(index / 4) * 4.5 - 5,
                  0.1 * index,
                ]}
                canFlip={canFlipMore}
                isFlippedExternally={flippedBackIds.includes(index.toString())}
                onTileFlip={(tileId, tileUrl) => {
                  handleTileFlip(tileId, tileUrl);
                }}
                isMatched={matchedTiles.includes(index.toString())}
                onTileDisappear={() => handleTileDisappear(index.toString())}
              />
            )
        )}
      </Canvas>
    </div>
  );
};

export default GamePage;
