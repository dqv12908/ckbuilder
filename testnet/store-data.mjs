// Tutorial 2: store a text message in a cell's data, then read it back.
// Usage: node store-data.mjs <wallet#> "<message>"
import { ccc, client, signerOf, explorer, waitCommitted } from "./lib.mjs";

const [n, message] = process.argv.slice(2);
const signer = signerOf(n);
const { script: lock } = await signer.getRecommendedAddressObj();

const tx = ccc.Transaction.from({ outputs: [{ lock }], outputsData: [ccc.bytesFrom(message, "utf8")] });
await tx.completeInputsByCapacity(signer);
await tx.completeFeeBy(signer, 1000);
const hash = await signer.sendTransaction(tx);
console.log(`stored: ${explorer(hash)}`);

await waitCommitted(hash);
const cell = await client.getCellLive({ txHash: hash, index: 0 }, true);
console.log(`capacity: ${ccc.fixedPointToString(cell.cellOutput.capacity)} CKB`);
console.log(`read back: "${ccc.bytesTo(cell.outputData, "utf8")}"`);
process.exit(0);
