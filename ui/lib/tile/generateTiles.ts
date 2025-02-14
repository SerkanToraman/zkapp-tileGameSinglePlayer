// Define the type for a tile
interface Tile {
  url: string;
}

export function generateTiles(): Tile[] {
  // Create an array of all unique tiles (1 to 3)
  const allUniqueTiles: Tile[] = Array.from(
    { length: 3 },
    (_, i): Tile => ({
      url: `/models/tile${i + 1}.glb`,
    })
  );

  // Shuffle the array and select the first 2 tiles
  for (let i = allUniqueTiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allUniqueTiles[i], allUniqueTiles[j]] = [
      allUniqueTiles[j],
      allUniqueTiles[i],
    ];
  }

  const selectedTiles = allUniqueTiles.slice(0, 2);

  // Duplicate each selected tile
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

  return allTiles;
}
