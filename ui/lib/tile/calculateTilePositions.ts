interface GridLayout {
  x: number;
  y: number;
}

export function calculateTilePosition(
  index: number,
  totalTiles: number
): GridLayout {
  // Determine the number of columns and rows based on the total number of tiles
  let columns = 4; // Default to 4 columns (for 16 tiles)
  let rows = 4; // Default to 4 rows (for 16 tiles)

  if (totalTiles === 32) {
    columns = 8; // 8x4 grid for 32 tiles
    rows = 4;
  } else if (totalTiles === 48) {
    columns = 8; // 8x6 grid for 48 tiles
    rows = 6;
  }

  // Set constant spacing between tiles
  const xSpacing = 4; // Horizontal spacing
  const ySpacing = 4; // Vertical spacing

  // Calculate the total width and height of the grid
  const totalGridWidth = (columns - 1) * xSpacing; // Total width of the grid
  const totalGridHeight = (rows - 1) * ySpacing; // Total height of the grid

  // Calculate the x and y positions for each tile
  const x = (index % columns) * xSpacing - totalGridWidth / 2; // Center horizontally
  const y = Math.floor(index / columns) * ySpacing - totalGridHeight / 2; // Center vertically

  return { x, y };
}
