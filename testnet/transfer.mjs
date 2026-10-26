// Usage: node transfer.mjs <fromWallet#> <toWallet#> <amountCKB>
import "dotenv/config";
import { ccc } from "@ckb-ccc/core";

const [from, to, amount] = process.argv.slice(2);
const client = new ccc.ClientPublicTestnet();
const signer = new ccc.SignerCkbPrivateKey(client, process.env[`WALLET_${from}_PRIVKEY`]);
const { script: toLock } = await ccc.Address.fromString(process.env[`WALLET_${to}_ADDRESS`], client);

const tx = ccc.Transaction.from({ outputs: [{ lock: toLock }], outputsData: ["0x"] });
tx.outputs[0].capacity = ccc.fixedPointFrom(amount);
await tx.completeInputsByCapacity(signer);
await tx.completeFeeBy(signer, 1000); // fee rate: shannons per 1000 bytes
const hash = await signer.sendTransaction(tx);
console.log(`WALLET_${from} -> WALLET_${to}: ${amount} CKB`);
console.log(`tx: https://testnet.explorer.nervos.org/transaction/${hash}`);
process.exit(0); // the public client keeps a socket open
