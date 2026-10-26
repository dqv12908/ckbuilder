// Generates N testnet wallets and writes them to .env (never overwrites existing keys).
import { ccc } from "@ckb-ccc/core";
import { randomBytes } from "node:crypto";
import { existsSync, appendFileSync, readFileSync } from "node:fs";

const N = Number(process.argv[2] ?? 3);
if (existsSync(".env") && /WALLET_1_PRIVKEY/.test(readFileSync(".env", "utf8"))) {
  console.error(".env already has wallets; refusing to overwrite.");
  process.exit(1);
}
const client = new ccc.ClientPublicTestnet();
let env = "# CKB TESTNET ONLY - never send mainnet funds to these keys\nCKB_RPC=https://testnet.ckb.dev/rpc\n";
for (let i = 1; i <= N; i++) {
  const pk = "0x" + randomBytes(32).toString("hex");
  const signer = new ccc.SignerCkbPrivateKey(client, pk);
  const addr = await signer.getRecommendedAddress();
  env += `WALLET_${i}_PRIVKEY=${pk}\nWALLET_${i}_ADDRESS=${addr}\n`;
  console.log(`WALLET_${i}: ${addr}`);
}
appendFileSync(".env", env);
