// Appends wallets 4 and 5 (Fiber node keys) and a node password to .env.
import { ccc } from "@ckb-ccc/shell";
import { randomBytes } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";

if (/WALLET_4_PRIVKEY/.test(readFileSync(".env", "utf8"))) { console.error("already added"); process.exit(1); }
const client = new ccc.ClientPublicTestnet();
let env = `\n# Fiber testnet nodes\nFIBER_SECRET_KEY_PASSWORD=${randomBytes(16).toString("hex")}\n`;
for (const i of [4, 5]) {
  const pk = "0x" + randomBytes(32).toString("hex");
  const addr = await new ccc.SignerCkbPrivateKey(client, pk).getRecommendedAddress();
  env += `WALLET_${i}_PRIVKEY=${pk}\nWALLET_${i}_ADDRESS=${addr}\n`;
  console.log(`WALLET_${i}: ${addr}`);
}
appendFileSync(".env", env);
process.exit(0);
