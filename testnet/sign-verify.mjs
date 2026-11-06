// Week 3: sign a message off-chain and verify it, then show a tampered message fails.
// Usage: node sign-verify.mjs <wallet#> "<message>"
import { ccc, signerOf } from "./lib.mjs";

const [n, message] = process.argv.slice(2);
const signature = await signerOf(n).signMessage(message);
console.log(`signature: ${signature.signature}`);
console.log(`verify original: ${await ccc.Signer.verifyMessage(message, signature)}`);
console.log(`verify tampered: ${await ccc.Signer.verifyMessage(message + "!", signature)}`);
process.exit(0);
