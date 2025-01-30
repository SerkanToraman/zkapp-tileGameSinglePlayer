import { TileGameProgram } from "../../../contracts/build/src/TileGameProgram";

export async function compileTileGameProgram() {
  try {
    console.log("Compiling TileGameProgram...");
    await TileGameProgram.compile();
    console.log("TileGameProgram compiled successfully.");
  } catch (error) {
    console.error("Failed to compile TileGameProgram:", error);
    throw error;
  }
}
