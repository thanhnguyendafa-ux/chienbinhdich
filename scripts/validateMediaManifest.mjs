import { validateMediaManifest } from './mediaManifest.mjs';

const result = await validateMediaManifest();
console.log(`Media manifest valid: ${result.assets} asset(s), ${result.totalBytes} byte(s).`);
