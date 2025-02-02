import * as Comlink from "comlink";

export const api = {
  async compileTileGameProgram() {
    const TileGameProgram = (
      await import("../../../contracts/build/src/TileGameProgram.js")
    )["TileGameProgram"];
    await TileGameProgram.compile();
  },
};

// Expose the API to be used by the main thread
Comlink.expose(api);
