// Tutorial 3: issue an xUDT token from one wallet, then transfer some to another.
// Usage: node xudt.mjs <issuer#> <amount> <receiver#> <sendAmount>
import { ccc, client, signerOf, explorer, waitCommitted } from "./lib.mjs";

const [issuerN, amount, toN, sendAmount] = process.argv.slice(2);
const issuer = signerOf(issuerN);
const { script: issuerLock } = await issuer.getRecommendedAddressObj();
const { script: toLock } = await signerOf(toN).getRecommendedAddressObj();

// Token ID = issuer lock hash + 4-byte flags (0 = no extension).
const xudtType = await ccc.Script.fromKnownScript(client, ccc.KnownScript.XUdt, issuerLock.hash() + "00000000");
console.log(`token xUDT args: ${xudtType.args}`);

// Issue: the issuer's own lock is an input, so the owner check passes.
const issueTx = ccc.Transaction.from({
  outputs: [{ lock: issuerLock, type: xudtType }],
  outputsData: [ccc.numLeToBytes(amount, 16)],
});
await issueTx.addCellDepsOfKnownScripts(client, ccc.KnownScript.XUdt);
await issueTx.completeInputsAtLeastOne(issuer);
await issueTx.completeInputsByCapacity(issuer);
await issueTx.completeFeeBy(issuer, 1000);
const issueHash = await issuer.sendTransaction(issueTx);
console.log(`issued ${amount}: ${explorer(issueHash)}`);
await waitCommitted(issueHash);

// Transfer: token inputs collected by UDT amount, leftover returned as change.
const udt = new ccc.udt.Udt((await client.getKnownScript(ccc.KnownScript.XUdt)).cellDeps[0].cellDep.outPoint, xudtType);
const { res: sendTx } = await udt.transfer(issuer, [{ to: toLock, amount: sendAmount }]);
const completed = await udt.completeBy(sendTx, issuer);
await completed.completeInputsByCapacity(issuer);
await completed.completeFeeBy(issuer, 1000);
const sendHash = await issuer.sendTransaction(completed);
console.log(`sent ${sendAmount} to WALLET_${toN}: ${explorer(sendHash)}`);
await waitCommitted(sendHash);
process.exit(0);
