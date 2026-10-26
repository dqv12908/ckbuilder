// Tutorial 5: lock CKB behind a hash lock (ckb-js-vm script), then unlock it by revealing the preimage.
// Usage: node simple-lock.mjs <funder#> <receiver#> "<preimage>"
import { readFileSync } from "node:fs";
import { ccc, client, signerOf, explorer, waitCommitted } from "./lib.mjs";

const DEPLOY = "../tutorials/docs.nervos.org/examples/dApp/simple-lock/deployment";
const contract = JSON.parse(readFileSync(`${DEPLOY}/scripts.json`, "utf8")).testnet["hash-lock.bc"];
const jsVm = JSON.parse(readFileSync(`${DEPLOY}/system-scripts.json`, "utf8")).testnet.ckb_js_vm.script;
const [funderN, toN, preimage] = process.argv.slice(2);
const bytes = (s) => ccc.hexFrom(ccc.bytesFrom(s, "utf8"));

// Lock = ckb-js-vm, args = 0x0000 + contract code_hash + hash_type byte + blake2b(preimage).
const hashLock = ccc.Script.from({
  codeHash: jsVm.codeHash,
  hashType: jsVm.hashType,
  args: "0x0000" + contract.codeHash.slice(2) + ccc.hexFrom(ccc.hashTypeToBytes(contract.hashType)).slice(2) + ccc.hashCkb(bytes(preimage)).slice(2),
});
console.log(`hash-lock address: ${ccc.Address.fromScript(hashLock, client)}`);

// 1. Fund the hash-lock address.
const funder = signerOf(funderN);
const fundTx = ccc.Transaction.from({ outputs: [{ lock: hashLock, capacity: ccc.fixedPointFrom(300) }], outputsData: ["0x"] });
await fundTx.completeInputsByCapacity(funder);
await fundTx.completeFeeBy(funder, 1000);
const fundHash = await funder.sendTransaction(fundTx);
console.log(`funded 300 CKB: ${explorer(fundHash)}`);
await waitCommitted(fundHash);

// 2. Spend it: no signature, just the preimage in the witness.
const { script: toLock } = await signerOf(toN).getRecommendedAddressObj();
async function unlockWith(secret) {
  const reader = new ccc.SignerCkbScriptReadonly(client, hashLock);
  const tx = ccc.Transaction.from({ outputs: [{ lock: toLock }], outputsData: ["0x"] });
  await tx.addCellDeps(ccc.CellDep.from(contract.cellDeps[0].cellDep), ccc.CellDep.from(jsVm.cellDeps[0].cellDep));
  await tx.completeInputsAll(reader);
  tx.setWitnessArgsAt(0, ccc.WitnessArgs.from({ lock: bytes(secret) }));
  await tx.completeFeeChangeToOutput(reader, 0, 1000);
  return client.sendTransaction(tx);
}

try {
  await unlockWith("wrong guess");
  console.log("wrong preimage unexpectedly accepted!");
} catch (e) {
  console.log(`wrong preimage rejected: ${String(e.message ?? e).match(/error code (\d+)/)?.[0] ?? e.message}`);
}
const unlockHash = await unlockWith(preimage);
console.log(`unlocked with correct preimage -> WALLET_${toN}: ${explorer(unlockHash)}`);
await waitCommitted(unlockHash);
process.exit(0);
