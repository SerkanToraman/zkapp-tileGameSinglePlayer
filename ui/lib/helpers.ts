// Helper function for hashing the each tile in the board
import { createHash } from "crypto";
import { Field, Poseidon } from "o1js";

export function hashUrl(url: string): Field {
  const hash = createHash("sha256").update(url).digest("hex"); // Compute SHA-256 hash
  const hashNumber = BigInt(`0x${hash.slice(0, 16)}`); // Use the first 16 characters for simplicity
  return Field(hashNumber);
}

export function hashFieldsWithPoseidon(fields: Field[]): Field {
  return Poseidon.hash(fields);
}
