import { Scalar, Field, Signature } from "o1js";

function parseSignature(jsonSignature: {
  signature: { field: string; scalar: string };
}) {
  const r = Field(jsonSignature.signature.field);
  const s = Scalar.fromJSON(jsonSignature.signature.scalar); // Use Scalar conversion

  return new Signature({ r, s });
}

export { parseSignature };
