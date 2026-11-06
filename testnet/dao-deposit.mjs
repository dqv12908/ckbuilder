// Week 3: deposit CKB into the Nervos DAO (phase 0 of deposit -> withdraw -> claim).
// Usage: node dao-deposit.mjs <wallet#> <amountCKB>
import { ccc, client, signerOf, explorer, waitCommitted } from "./lib.mjs";

const [n, amount] = process.argv.slice(2);
const signer = signerOf(n);
const { script: lock } = await signer.getRecommendedAddressObj();

// A DAO deposit cell is marked by the DAO type script and 8 zero bytes of data.
const tx = ccc.Transaction.from({
  outputs: [{ lock, capacity: ccc.fixedPointFrom(amount), type: await ccc.Script.fromKnownScript(client, ccc.KnownScript.NervosDao, "0x") }],
  outputsData: ["0x0000000000000000"],
});
await tx.addCellDepsOfKnownScripts(client, ccc.KnownScript.NervosDao);
await tx.completeInputsByCapacity(signer);
await tx.completeFeeBy(signer, 1000);
const hash = await signer.sendTransaction(tx);
console.log(`deposited ${amount} CKB: ${explorer(hash)}`);
await waitCommitted(hash);
process.exit(0);
