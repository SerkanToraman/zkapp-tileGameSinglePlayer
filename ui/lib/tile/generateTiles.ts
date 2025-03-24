// Define the type for a tile
interface Tile {
  url: string;
}

export function generateTiles(): Tile[] {
  // Create an array of all unique tiles (1 to 8)
  const allUniqueTiles: Tile[] = Array.from(
    { length: 8 },
    (_, i): Tile => ({
      url: `/models/tile${i + 1}.glb`,
    })
  );

  // Shuffle the array and select the first 8 tiles
  for (let i = allUniqueTiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allUniqueTiles[i], allUniqueTiles[j]] = [
      allUniqueTiles[j],
      allUniqueTiles[i],
    ];
  }

  const selectedTiles = allUniqueTiles.slice(0, 8);

  // Duplicate each selected tile to get 16 total tiles
  const allTiles: Tile[] = [...selectedTiles, ...selectedTiles].map(
    (tile): Tile => ({
      ...tile,
    })
  );

  // Shuffle the duplicated tiles
  for (let i = allTiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
  }
  console.log("allTiles", allTiles);

  return allTiles;
}
