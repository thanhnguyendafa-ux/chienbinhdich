import { readFile } from 'node:fs/promises';
import { basename, dirname, extname } from 'node:path';
import { mediaManifest } from '../media/manifest.js';
import { mediaAssetUrl, normalizeMediaPath } from '../src/core/mediaAsset.js';
import { validateMediaManifest } from './mediaManifest.mjs';

const UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const MIME = Object.freeze({ '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.avif':'image/avif', '.wav':'audio/wav', '.m4a':'audio/mp4', '.mp3':'audio/mpeg', '.opus':'audio/ogg', '.ogg':'audio/ogg' });

function arg(name, fallback = '') {
  const index = process.argv.indexOf(name);
  return index >= 0 ? String(process.argv[index + 1] ?? fallback) : fallback;
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const mode = arg('--mode', 'smoke');
const ref = arg('--ref', 'local').replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 40);
if (!['smoke', 'production'].includes(mode)) throw new Error(`Unsupported sync mode: ${mode}`);
const privateKey = String(process.env.IMAGEKIT_PRIVATE_KEY ?? '').trim();
if (!privateKey) throw new Error('IMAGEKIT_PRIVATE_KEY is missing.');
await validateMediaManifest();

function destinationPath(remotePath) {
  const canonical = normalizeMediaPath(remotePath);
  return mode === 'production' ? canonical : `__pipeline-smoke/${ref}/${canonical}`;
}

async function head(url) {
  try { return await fetch(url, { method: 'HEAD', redirect: 'follow', cache: 'no-store' }); }
  catch { return null; }
}

async function verifyPublicUrl(assetId, url) {
  let lastStatus = 0;
  let lastError = '';
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const response = await head(`${url}${url.includes('?') ? '&' : '?'}cb=${Date.now()}`);
    if (response?.ok) {
      console.log(`MEDIA_OK ${assetId} ${url}`);
      return;
    }
    lastStatus = response?.status ?? 0;
    lastError = response?.headers?.get('ik-error') ?? '';
    if (attempt < 10) await sleep(1500);
  }
  throw new Error(`${assetId}: public URL verification failed with ${lastStatus}${lastError ? ` (${lastError})` : ''}: ${url}`);
}

for (const asset of mediaManifest.assets) {
  const destination = destinationPath(asset.remotePath);
  const canonicalUrl = mediaAssetUrl(destination);
  const existing = await head(canonicalUrl);
  if (existing?.ok) {
    console.log(`MEDIA_SKIP ${asset.id} ${canonicalUrl}`);
    continue;
  }

  const bytes = await readFile(asset.sourcePath);
  const filename = basename(destination);
  const folder = `/${dirname(destination).replaceAll('\\', '/')}`;
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: MIME[extname(filename).toLowerCase()] ?? 'application/octet-stream' }), filename);
  form.append('fileName', filename);
  form.append('folder', folder);
  form.append('useUniqueFileName', 'false');
  form.append('overwriteFile', 'true');
  form.append('isPublished', 'true');
  form.append('tags', 'chienbinhdich,media-pipeline-v1');

  const auth = Buffer.from(`${privateKey}:`).toString('base64');
  const response = await fetch(UPLOAD_URL, { method: 'POST', headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' }, body: form });
  const bodyText = await response.text();
  if (!response.ok) throw new Error(`${asset.id}: ImageKit upload ${response.status}: ${bodyText.slice(0, 500)}`);
  const body = JSON.parse(bodyText);
  const uploadedUrl = String(body.url ?? canonicalUrl);
  console.log(`MEDIA_UPLOADED ${asset.id} fileId=${body.fileId ?? 'unknown'} filePath=${body.filePath ?? destination} url=${uploadedUrl}`);
  await verifyPublicUrl(asset.id, uploadedUrl);
}

console.log(`ImageKit media sync complete in ${mode} mode.`);
