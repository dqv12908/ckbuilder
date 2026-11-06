// Week 3: create a Spore cluster, mint a DOB into it, transfer the DOB, and melt a second one.
// Usage: node spore-cluster.mjs <wallet#> <toWallet#> <file> <content-type>
import { readFileSync } from "node:fs";
import { ccc, signerOf, explorer, waitCommitted } from "./lib.mjs";

const [n, toN, file, contentType] = process.argv.slice(2);
const signer = signerOf(n);
const content = readFileSync(file);
const { script: toLock } = await signerOf(toN).getRecommendedAddressObj();

async function send(label, tx) {
  await tx.completeFeeBy(signer, 1000);
  const hash = await signer.sendTransaction(tx);
  console.log(`${label}: ${explorer(hash)}`);
  await waitCommitted(hash);
  return hash;
}

const cluster = await ccc.spore.createSporeCluster({
  signer,
  data: { name: "Calvith CKBuilder", description: "Week 3 test cluster" },
});
await send(`cluster ${cluster.id}`, cluster.tx);

const minted = await ccc.spore.createSpore({
  signer,
  data: { contentType, content, clusterId: cluster.id },
  clusterMode: "clusterCell",
});
await send(`minted into cluster, spore ${minted.id}`, minted.tx);

const moved = await ccc.spore.transferSpore({ signer, id: minted.id, to: toLock });
await send(`transferred to WALLET_${toN}`, moved.tx);

const second = await ccc.spore.createSpore({ signer, data: { contentType, content } });
await send(`minted second spore ${second.id}`, second.tx);
const melted = await ccc.spore.meltSpore({ signer, id: second.id });
await send(`melted second spore`, melted.tx);
process.exit(0);
