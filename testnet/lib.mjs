// Shared testnet helpers for the tutorial scripts.
import "dotenv/config";
import { ccc } from "@ckb-ccc/shell";

export { ccc };
export const client = new ccc.ClientPublicTestnet();
export const signerOf = (n) => new ccc.SignerCkbPrivateKey(client, process.env[`WALLET_${n}_PRIVKEY`]);
export const explorer = (hash) => `https://testnet.explorer.nervos.org/transaction/${hash}`;

export async function waitCommitted(hash) {
  for (;;) {
    const res = await client.getTransaction(hash);
    if (res?.status === "committed") return;
    if (res?.status === "rejected") throw new Error(`tx ${hash} rejected`);
    await new Promise((r) => setTimeout(r, 3000));
  }
}
