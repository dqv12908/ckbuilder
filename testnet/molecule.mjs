// Week 5: Molecule. Re-encode a real testnet transaction, check its hash, decode its witness and
// token amount, then round-trip a custom table.
// Usage: node molecule.mjs <txHash>
import { ccc, client } from "./lib.mjs";

const hash = process.argv[2];
const { transaction: tx } = await client.getTransaction(hash);

// tx hash = ckbhash(molecule(RawTransaction)); witnesses are not part of it.

const rawBytes = tx.rawToBytes();
console.log(`RawTransaction: ${rawBytes.length} bytes, ckbhash matches tx hash: ${ccc.hashCkb(rawBytes) === hash}`);
console.log(`full Transaction (with witnesses): ${tx.toBytes().length} bytes`);

// A table starts with its total size and one u32 offset per field.
const u32 = (b, o) => Number(ccc.numLeFromBytes(b.slice(o, o + 4)));
const fields = ["version", "cell_deps", "header_deps", "inputs", "outputs", "outputs_data"];
console.log("RawTransaction header:", fields.map((f, i) => `${f}@${u32(rawBytes, 4 + 4 * i)}`).join(" "));

const w = ccc.WitnessArgs.fromBytes(tx.witnesses[0]);
console.log(`witness 0 = WitnessArgs { lock: ${ccc.bytesFrom(w.lock ?? "0x").length} bytes (secp256k1 signature) }`);

tx.outputs.forEach((o, i) => {
  if (o.type && tx.outputsData[i].length >= 34) {
    console.log(`output ${i}: token amount (u128 LE) = ${ccc.numLeFromBytes(ccc.bytesFrom(tx.outputsData[i]).slice(0, 16))}`);
  }
});

// Custom schema: table Profile { name: Bytes, level: Uint32, items: BytesVec }
const Profile = ccc.mol.table({ name: ccc.mol.Bytes, level: ccc.mol.Uint32, items: ccc.mol.BytesVec });
const encoded = Profile.encode({ name: ccc.bytesFrom("Calvith", "utf8"), level: 5, items: ["0x01", "0x0203"] });
const decoded = Profile.decode(encoded);
console.log(`custom table: ${ccc.hexFrom(encoded)}`);
console.log(`decoded: name=${ccc.bytesTo(decoded.name, "utf8")} level=${decoded.level} items=${decoded.items.join(",")}`);
process.exit(0);
