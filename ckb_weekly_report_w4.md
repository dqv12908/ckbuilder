## Builder Track Weekly Report — Week 4

**Name:** @Calvith (Telegram)  
**Week Ending:** 11-17-2026

### Courses Completed

- Researched CKB → Solana bridging on Nervos Talk: Force Bridge's shutdown, Rosen Bridge's status, Antismart's design for verifying CKB state on other chains (t/10372), and Chiral (t/10360)
- Started the handbook's **"create your own app"** task: a CKB ↔ Solana zk light client, bridge and atomic swaps. Code: [dqv12908/spike-eaglesong-sp1](https://github.com/dqv12908/spike-eaglesong-sp1)

### Key Learnings

- **Proving CKB PoW in a zkVM (SP1) is cheap:** about 48.7k RISC-V cycles per header, and 256 headers prove in about 3 minutes on one CPU
- **Mainnet and testnet use different PoW functions:** mainnet is `eaglesong(msg)`, testnet is `ckbhash(eaglesong(msg))`. A verifier tested only on testnet would reject every mainnet block
- The reference Eaglesong sponge runs a wasted permutation. Dropping it cut zkVM cost by 34%
- A light client must enforce CKB's epoch and difficulty rules, or a prover can mine fake headers at an easy target

### Practical Progress

- **Light client on Solana devnet:** a Groth16 proof of 16 CKB headers verifies in about 97k compute units, and the light client's tip advanced to the real CKB block hash. The same proof also verifies on Sepolia for about 260k gas
- **Round trip, CKB testnet → Solana devnet → CKB testnet:**
  - Deposited 300 CKB into a custom Rust **custody lock** ([tx](https://testnet.explorer.nervos.org/transaction/0x73c08fe23f21d9c170d83ec455ef78c34b4cf061980a2b3c99bcf2606e2d661b))
  - Minted 300 ckbCKB on Solana against a deposit proof
  - Burned 120 and released 120 CKB back on CKB with 2-of-3 attester signatures ([tx](https://testnet.explorer.nervos.org/transaction/0x44e5ba4a604a5f5c9d3fbcaec1803dd853b084a2b30013960b232e33f39c6bde))
- **Atomic swaps over Fiber:**
  - CKB ⇄ native SOL in 4–6 s, both directions, with a web UI, and both refund paths tested
  - CKB ⇄ Sepolia ETH in about 25 s, using Boltz's EtherSwap contract unmodified
  - A Fiber → Lightning → SOL route, tested on local chains
- **Tests:** 17 verifier tests against real mainnet headers, and custody lock tests in ckb-testtool where 11 attack cases are each rejected

### Environment

- SP1 v6 zkVM (WSL2), Solana program in Rust, Fiber v0.9.1 on testnet, CCC, ckb-testtool
- **Open items:** MMR (RFC 44) membership and FlyClient sampling, and a less trusted Solana → CKB direction than the attester committee
