// Prints the testnet CKB balance of every wallet in .env.
import "dotenv/config";
import { ccc } from "@ckb-ccc/core";

const client = new ccc.ClientPublicTestnet();
for (let i = 1; process.env[`WALLET_${i}_PRIVKEY`]; i++) {
  const signer = new ccc.SignerCkbPrivateKey(client, process.env[`WALLET_${i}_PRIVKEY`]);
  const bal = await signer.getBalance();
  console.log(`WALLET_${i} ${ccc.fixedPointToString(bal)} CKB  ${await signer.getRecommendedAddress()}`);
}
process.exit(0); // the public client keeps a socket open
