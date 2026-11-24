## Builder Track Weekly Report — Week 5

**Name:** @Calvith (Telegram)  
**Week Ending:** 11-22-2026

### Courses Completed

- Worked through the handbook's **Intermediate** section:
  - [Rust script quick start](https://docs.nervos.org/docs/script/rust/rust-quick-start) and the [sUDT example](https://docs.nervos.org/docs/script/rust/rust-example-sudt-script)
  - [Type ID](https://docs.nervos.org/docs/script/rust/rust-api-type-id)
  - [Molecule](https://docs.nervos.org/docs/serialization/serialization-molecule-in-ckb) and [CCC Molecule](https://docs.nervos.org/docs/serialization/ccc-molecule)
  - [Nervos DAO](https://docs.nervos.org/docs/ecosystem-scripts/nervos-dao)
  - Ecosystem scripts: Omnilock, Anyone-Can-Pay, single-use and time locks

### Key Learnings

- **sUDT**: the owner's lock hash is the token ID. The owner can mint, and everyone else can't increase the total
- **Type ID** makes a singleton cell, which is how contracts stay upgradable (`hash_type: type`)
- **Molecule** is canonical, so every language produces the same bytes. A transaction's hash is `ckbhash` of its molecule-encoded RawTransaction, and witnesses aren't included
- **Nervos DAO** withdrawal has 2 steps. Step 2 only unlocks at the end of the 180-epoch (about 30-day) cycle

### Practical Progress

- **Nervos DAO withdraw step 1** on my 500 CKB deposit from Week 3 ([tx](https://testnet.explorer.nervos.org/transaction/0x7bcbf6db7aa05c492979e50914f07935fffa5af36cde909f8e3927fddd2098e7)). It has earned 0.378 CKB of compensation so far, and step 2 can be done after epoch 14,316 (around Dec 5)
- **Built the docs' Rust script examples** (19 contracts, e.g. sUDT 45 KB, Type ID 52 KB) and ran the sUDT and Type ID tests in `ckb-testtool`: **4/4 pass**, including over-issuance being rejected
- **Decoded a real testnet transaction with Molecule** (my Week 2 xUDT transfer):
  - Re-encoding gives the same tx hash
  - Read the table offsets, the 65-byte signature in WitnessArgs, and the token amounts (250,000 / 750,000)
  - Round-tripped a custom table

### Environment

- Rust contracts built in WSL with `ckb-script-templates`. The fix: point the build at `clang-18` so it finds `llvm-ar-18` and `llvm-objcopy-18`
- CCC scripts against the public testnet
