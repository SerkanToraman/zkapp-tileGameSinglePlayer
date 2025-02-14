import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Tile } from "../lib/types";
interface TileStore {
  tiles: Tile[];
  setTiles: (tiles: Tile[]) => void;
}

export const useTileStore = create<TileStore>()(
  persist(
    (set) => ({
      tiles: [],
      setTiles: (tiles: Tile[]) => set({ tiles }),
    }),
    {
      name: "tile-storage",
    }
  )
);
