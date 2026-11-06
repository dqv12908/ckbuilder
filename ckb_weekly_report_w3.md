## Builder Track Weekly Report — Week 3

**Name:** @Calvith (Telegram)  
**Week Ending:** 11-06-2026


### Courses Completed

- Worked through the rest of the handbook's Beginner tooling: [CCC code examples](https://docs.ckbccc.com/docs/code-examples), [ckb-cli](https://docs.nervos.org/docs/sdk-and-devtool/ckb-cli), [ckb-debugger](https://github.com/nervosnetwork/ckb-standalone-debugger)
- Read the [Fiber docs](https://www.fiber.world/docs) and did the [Basic Transfer](https://www.fiber.world/docs/quick-start/basic-transfer) quick start
- Read an overview of [Perun on CKB](https://github.com/perun-network/perun-ckb-contract) and the [Rust SDK](https://docs.nervos.org/docs/sdk-and-devtool/rust) docs

### Key Learnings

- **Fiber**: funds lock on L1 once, then payments are off-chain balance updates. L1 is only touched to open and close
- A 500 CKB channel gave 401 CKB spendable, because part of the funding is reserved for the channel cell
- **Nervos DAO**: a deposit is a cell with the DAO type script and 8 zero bytes of data
- **Known-preimage locks are anyone-can-spend**: the same code and preimage give the same address, so spend the exact cell you mean to, never "all cells at this address"

### Practical Progress

- **Opened a Fiber channel** between two local testnet nodes ([funding tx](https://testnet.explorer.nervos.org/transaction/0xcf7a5d60925ec929e9fad14ab7f5a2f75b917030ed9e42523e4841cf032817a0)), **paid 100 CKB and 5 CKB back** off-chain in about 0.2 s each, then closed it cooperatively ([closing tx](https://testnet.explorer.nervos.org/transaction/0x0fb5c312d6c0df867839c3f3045d5001d74021db98023f340830cd69419e2dcb))
- **Deposited 500 CKB into the Nervos DAO** ([tx](https://testnet.explorer.nervos.org/transaction/0xd83b2f19452299331077a691f6bc764df9eef42c7aa04e98b366ae66ba00b17a)); withdrawal not done
- **Spore cluster**: created one ([tx](https://testnet.explorer.nervos.org/transaction/0x5095b5f1daa76928b4b2b4600634035e07e7e2a4165d8165668aa3de1a0903e1)), minted into it ([tx](https://testnet.explorer.nervos.org/transaction/0x62e4256e604d230ca11901ff353566e2ebb438d3ffe5f4d0ff6eba228c95b03a)), transferred the DOB ([tx](https://testnet.explorer.nervos.org/transaction/0x7eacd5f09f14efc15649e3631f12e15e9de797823bfb292ba4ef290d0d243f3a)), and melted a second DOB to reclaim its CKB ([tx](https://testnet.explorer.nervos.org/transaction/0xff77918df199bf69ddd63c4c32c40914bf34667eb27d19e68cb28b8c5d3535db))
- Signed and verified a message; a tampered copy failed verification
- Queried testnet with **ckb-cli** and ran the hash-lock's 2 mock tests with **ckb-debugger** (both pass)
- **Week 2 correction:** my hash-lock unlock script collected every cell at the shared "Hello World" address, so it also took 19,801.99 test CKB that other people had deposited ([tx](https://testnet.explorer.nervos.org/transaction/0x5fed1e64c834da139a53ffa9456d60ee70272afc259f78ea940b05a14a98913a)). Fixed the script to spend only its own cell

### Environment

- Fiber FNN v0.9.1 and ckb-cli v2.0.0 on Windows
- **Blocked:** `ckb-sdk` (Rust) doesn't build here yet, because its `ckb-vm` dependency needs `gcc`
