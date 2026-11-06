// Week 3: Fiber Basic Transfer between two local testnet nodes.
// open channel -> pay 100 CKB off-chain via invoice -> pay 5 CKB back -> cooperative close.
const NODE1 = "http://127.0.0.1:8227", NODE2 = "http://127.0.0.1:8237";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ckb = (hex) => Number(BigInt(hex)) / 1e8;
const hexOf = (n) => "0x" + BigInt(n).toString(16);

async function rpc(url, method, params = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: 1, jsonrpc: "2.0", method, params: [params] }),
  });
  const body = await res.json();
  if (body.error) throw new Error(`${method}: ${JSON.stringify(body.error)}`);
  return body.result;
}
const info = (url) => fetch(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ id: 1, jsonrpc: "2.0", method: "node_info", params: [] }),
}).then((r) => r.json()).then((b) => b.result);

async function waitChannel(url, pubkey, states, timeoutMs = 600000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const { channels } = await rpc(url, "list_channels", { pubkey, include_closed: true });
    const ch = channels.at(-1);
    if (ch && states.includes(ch.state.state_name)) return ch;
    await sleep(5000);
  }
  throw new Error(`channel did not reach ${states}`);
}

async function pay(fromUrl, toUrl, shannons, description) {
  const { invoice_address } = await rpc(toUrl, "new_invoice", {
    amount: hexOf(shannons), currency: "Fibt", description, expiry: "0xe10",
  });
  const started = Date.now();
  const { payment_hash } = await rpc(fromUrl, "send_payment", { invoice: invoice_address });
  for (;;) {
    const p = await rpc(fromUrl, "get_payment", { payment_hash });
    if (p.status === "Success") return { payment_hash, ms: Date.now() - started, fee: p.fee };
    if (p.status === "Failed") throw new Error(`payment failed: ${p.failed_error}`);
    await sleep(200);
  }
}

const balances = (ch) => `local ${ckb(ch.local_balance)} CKB, remote ${ckb(ch.remote_balance)} CKB`;

const n1 = await info(NODE1), n2 = await info(NODE2);
await rpc(NODE1, "connect_peer", { pubkey: n2.pubkey, address: "/ip4/127.0.0.1/tcp/8238", save: false });
await sleep(3000);

const { temporary_channel_id } = await rpc(NODE1, "open_channel", {
  pubkey: n2.pubkey, funding_amount: hexOf(500n * 10n ** 8n), public: true,
});
console.log(`open_channel requested: ${temporary_channel_id}`);

let ch = await waitChannel(NODE1, n2.pubkey, ["ChannelReady"]);
console.log(`channel ready: ${ch.channel_id}`);
console.log(`funding outpoint: ${ch.channel_outpoint}`);
console.log(`opening balances (node1): ${balances(ch)}`);

const a = await pay(NODE1, NODE2, 100n * 10n ** 8n, "CKBuilder week 3: node1 pays node2");
console.log(`paid 100 CKB node1->node2 in ${a.ms} ms, fee ${a.fee}, hash ${a.payment_hash}`);
const b = await pay(NODE2, NODE1, 5n * 10n ** 8n, "CKBuilder week 3: node2 pays node1");
console.log(`paid 5 CKB node2->node1 in ${b.ms} ms, fee ${b.fee}, hash ${b.payment_hash}`);

ch = await waitChannel(NODE1, n2.pubkey, ["ChannelReady"]);
console.log(`balances after payments (node1): ${balances(ch)}`);

await rpc(NODE1, "shutdown_channel", {
  channel_id: ch.channel_id,
  close_script: n1.default_funding_lock_script,
  fee_rate: "0x3FC",
  force: false,
});
const closed = await waitChannel(NODE1, n2.pubkey, ["Closed"]);
console.log(`channel closed: ${JSON.stringify(closed.state)}`);
console.log(`closing tx: ${closed.shutdown_transaction_hash ?? closed.closed_transaction_hash ?? "see list_channels"}`);
process.exit(0);
