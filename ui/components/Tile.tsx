import { useRef, useState, useEffect } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TileProps {
  id: string;
  url: string;
  position: [number, number, number];
  isPreview?: boolean;
  isFlippedExternally?: boolean;
  canFlip?: boolean;
  isMatched?: boolean;
  onTileFlip?: (id: string, url: string) => void;
  onTileDisappear?: (id: string) => void;
}

export function Tile({
  id,
  url,
  position,
  isPreview,
  isFlippedExternally,
  canFlip,
  isMatched,
  onTileFlip,
  onTileDisappear,
}: TileProps) {
  const gltf = useLoader(GLTFLoader, url);
  const meshRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [scale, setScale] = useState(15);

  useEffect(() => {
    if (!isFlippedExternally) {
      setIsFlipped(false);
    }
  }, [isFlippedExternally]);

  useEffect(() => {
    if (gltf && meshRef.current) {
      const clonedScene = gltf.scene.clone();
      if (!meshRef.current.children.length) {
        meshRef.current.add(clonedScene);
      }

      const box = new THREE.Box3().setFromObject(clonedScene);
      const center = box.getCenter(new THREE.Vector3());
      clonedScene.position.set(-center.x, -center.y, -center.z);

      // Apply different rotations based on whether it's a preview or game mode
      if (isPreview) {
        clonedScene.rotation.x = Math.PI / 2;
        clonedScene.rotation.y = -Math.PI / 2;
      } else {
        // Existing conditional rotations for gameplay
        clonedScene.rotation.x = -Math.PI / 2;
        clonedScene.rotation.y = Math.PI / 2;
      }
      meshRef.current.position.set(0, 0, -0.5);
    }
  }, [gltf, isPreview]);

  useEffect(() => {
    if (isMatched) {
      let frame: number;
      const animateScaleDown = () => {
        setScale((prev) => Math.max(prev - 0.02, 0));
        if (scale > 0) {
          frame = requestAnimationFrame(animateScaleDown);
        } else {
          onTileDisappear?.(id);
        }
      };
      animateScaleDown();
      return () => cancelAnimationFrame(frame);
    } else {
      setScale(15);
    }
  }, [isMatched, scale, id, onTileDisappear]);

  useFrame(() => {
    if (pivotRef.current) {
      const targetRotationY = isFlipped ? Math.PI : 0;
      pivotRef.current.rotation.y = THREE.MathUtils.lerp(
        pivotRef.current.rotation.y,
        targetRotationY,
        0.1
      );
      if (meshRef.current) {
        meshRef.current.scale.set(scale, scale, scale);
      }
    }
  });

  const handleFlip = (event) => {
    event.stopPropagation();
    if (canFlip && !isFlipped) {
      setIsFlipped(true);
      onTileFlip?.(id, url);
    }
  };

  return (
    <group ref={pivotRef} position={position} onPointerDown={handleFlip}>
      <group ref={meshRef} />
    </group>
  );
}
