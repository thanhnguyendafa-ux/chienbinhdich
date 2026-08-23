import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { extname } from 'node:path';
import { mediaManifest } from '../media/manifest.js';
import { prepareMediaBundles } from './prepareMediaBundles.mjs';

const LIMITS = Object.freeze({ image: 200 * 1024, audio: 1024 * 1024 });
const EXTENSIONS = Object.freeze({ image: new Set(['.svg', '.webp', '.png', '.jpg', '.jpeg', '.avif']), audio: new Set(['.wav', '.m4a', '.mp3', '.opus', '.ogg']) });

export async function validateMediaManifest() {
  await prepareMediaBundles();
  if (mediaManifest.version !== 1 || !Array.isArray(mediaManifest.assets)) throw new Error('Unsupported media manifest.');
  const ids = new Set();
  const sources = new Set();
  const remotes = new Set();
  let totalBytes = 0;

  for (const asset of mediaManifest.assets) {
    if (!asset?.id || ids.has(asset.id)) throw new Error(`Duplicate or missing media id: ${asset?.id ?? ''}`);
    ids.add(asset.id);
    if (!LIMITS[asset.kind]) throw new Error(`${asset.id}: unsupported kind ${asset.kind}`);
    if (!asset.sourcePath?.startsWith('media-staging/') || /^(?:https?:)?\/\//i.test(asset.sourcePath)) throw new Error(`${asset.id}: sourcePath must stay inside media-staging/.`);
    if (!asset.remotePath?.startsWith('global-success/') || /^(?:https?:)?\/\//i.test(asset.remotePath)) throw new Error(`${asset.id}: remotePath must be relative and start with global-success/.`);
    if (sources.has(asset.sourcePath) || remotes.has(asset.remotePath)) throw new Error(`${asset.id}: duplicate source or remote path.`);
    sources.add(asset.sourcePath); remotes.add(asset.remotePath);
    const extension = extname(asset.sourcePath).toLowerCase();
    if (!EXTENSIONS[asset.kind].has(extension)) throw new Error(`${asset.id}: invalid ${asset.kind} extension ${extension}`);
    if (asset.kind === 'image' && !String(asset.alt ?? '').trim()) throw new Error(`${asset.id}: image alt is required.`);
    if (asset.kind === 'audio' && !String(asset.description ?? '').trim()) throw new Error(`${asset.id}: audio description is required.`);
    const info = await stat(asset.sourcePath);
    if (!info.isFile() || info.size > LIMITS[asset.kind]) throw new Error(`${asset.id}: file size ${info.size} exceeds ${LIMITS[asset.kind]}.`);
    const bytes = await readFile(asset.sourcePath);
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (digest !== asset.sha256) throw new Error(`${asset.id}: sha256 mismatch.`);
    const marker = `-${digest.slice(0, 8)}${extension}`;
    if (!asset.remotePath.endsWith(marker) || !asset.sourcePath.endsWith(marker)) throw new Error(`${asset.id}: immutable filename must contain the sha256 prefix.`);
    totalBytes += info.size;
  }
  return Object.freeze({ assets: mediaManifest.assets.length, totalBytes });
}
