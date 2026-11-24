// Week 5: Nervos DAO withdraw step 1 (prepare). Turns a deposit cell into a "withdrawing" cell.
// Step 2 (claim) only becomes possible at the end of the deposit's 180-epoch cycle.
// Usage: node dao-withdraw.mjs <wallet#>
import { ccc, client, signerOf, explorer, waitCommitted } from "./lib.mjs";

const signer = signerOf(process.argv[2]);
const daoType = await ccc.Script.fromKnownScript(client, ccc.KnownScript.NervosDao, "0x");

let deposit;
for await (const cell of signer.findCells({ script: daoType, scriptLenRange: [33, 34], outputDataLenRange: [8, 9] })) {
  if (await cell.isNervosDao(client, "deposited")) { deposit = cell; break; }
}
if (!deposit) throw new Error("no DAO deposit cell found");

// The withdrawing cell keeps lock, type and capacity; its data becomes the deposit block number,
// and the deposit block's header must be in header_deps.
const { blockHash } = await client.getTransaction(deposit.outPoint.txHash);
const header = await client.getHeaderByHash(blockHash);
console.log(`deposit: ${ccc.fixedPointToString(deposit.cellOutput.capacity)} CKB in block #${header.number}, epoch ${ccc.stringify(header.epoch)}`);

const tx = ccc.Transaction.from({
  inputs: [{ previousOutput: deposit.outPoint }],
  outputs: [deposit.cellOutput],
  outputsData: [ccc.numLeToBytes(header.number, 8)],
  headerDeps: [blockHash],
});
await tx.addCellDepsOfKnownScripts(client, ccc.KnownScript.NervosDao);
await tx.completeFeeBy(signer, 1000);
const hash = await signer.sendTransaction(tx);
console.log(`withdraw step 1: ${explorer(hash)}`);
await waitCommitted(hash);

for await (const cell of signer.findCells({ script: daoType, scriptLenRange: [33, 34], outputDataLenRange: [8, 9] })) {
  if (await cell.isNervosDao(client, "withdrew")) {
    console.log(`withdrawing cell: ${cell.outPoint.txHash}:${Number(cell.outPoint.index)}`);
    console.log(`compensation so far: ${ccc.fixedPointToString(await cell.getDaoProfit(client))} CKB`);
  }
}
const tip = await client.getTipHeader();
console.log(`current epoch: ${ccc.stringify(tip.epoch)}`);
process.exit(0);
