// Tutorial 4: mint a Spore DOB whose content (an image) lives fully on-chain, then read it back.
// Usage: node dob.mjs <wallet#> <file> <content-type>
import { readFileSync } from "node:fs";
import { ccc, client, signerOf, explorer, waitCommitted } from "./lib.mjs";

const [n, file, contentType] = process.argv.slice(2);
const signer = signerOf(n);
const content = readFileSync(file);

const { tx, id } = await ccc.spore.createSpore({ signer, data: { contentType, content } });
await tx.completeFeeBy(signer, 1000);
const hash = await signer.sendTransaction(tx);
console.log(`spore id: ${id}`);
console.log(`minted (${content.length} bytes): ${explorer(hash)}`);
await waitCommitted(hash);

const { cell } = await ccc.spore.assertSpore(client, id);
const data = decodeSporeData(cell.outputData);
console.log(`capacity: ${ccc.fixedPointToString(cell.cellOutput.capacity)} CKB, content-type: ${data.contentType}`);
console.log(`content matches file: ${ccc.hexFrom(data.content) === ccc.hexFrom(content)}`);
process.exit(0);

// SporeData is a molecule table { content_type: Bytes, content: Bytes, cluster_id: BytesOpt }.
function decodeSporeData(hex) {
  const b = ccc.bytesFrom(hex);
  const u32 = (o) => Number(ccc.numLeFromBytes(b.slice(o, o + 4)));
  const field = (i) => b.slice(u32(4 + 4 * i) + 4, u32(8 + 4 * i)); // skip Bytes length prefix
  return { contentType: ccc.bytesTo(field(0), "utf8"), content: field(1) };
}
