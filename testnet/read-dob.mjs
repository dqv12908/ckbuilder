// Reads a Spore DOB back from testnet by its id and saves the content to a file.
// Usage: node read-dob.mjs <sporeId> <outFile>
import { writeFileSync } from "node:fs";
import { ccc, client } from "./lib.mjs";

const [id, out] = process.argv.slice(2);
const { cell } = await ccc.spore.assertSpore(client, id);
const b = ccc.bytesFrom(cell.outputData);
const u32 = (o) => Number(ccc.numLeFromBytes(b.slice(o, o + 4)));
const field = (i) => b.slice(u32(4 + 4 * i) + 4, u32(8 + 4 * i));
console.log(`capacity: ${ccc.fixedPointToString(cell.cellOutput.capacity)} CKB, content-type: ${ccc.bytesTo(field(0), "utf8")}`);
writeFileSync(out, field(1));
console.log(`saved content to ${out}`);
process.exit(0);
