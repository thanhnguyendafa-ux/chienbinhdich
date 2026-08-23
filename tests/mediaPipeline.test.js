import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEDIA_BASE, MEDIA_PROVIDER } from '../src/config/mediaConfig.js';
import { mediaAssetUrl, normalizeMediaPath } from '../src/core/mediaAsset.js';
import { mediaManifest } from '../media/manifest.js';
import { validateMediaManifest } from '../scripts/mediaManifest.mjs';

test('ImageKit has one public endpoint owner and lesson media paths stay relative',()=>{
  assert.equal(MEDIA_PROVIDER,'imagekit');
  assert.equal(MEDIA_BASE,'https://ik.imagekit.io/47dprrwyd');
  assert.equal(mediaAssetUrl('global-success/g2/u01/img/pizza.webp'),'https://ik.imagekit.io/47dprrwyd/global-success/g2/u01/img/pizza.webp');
  assert.throws(()=>normalizeMediaPath('https://example.com/a.webp'),/relative to MEDIA_BASE/);
  assert.throws(()=>normalizeMediaPath('../secret'),/Invalid media path/);
});

test('media manifest is immutable, local, hashed, and valid for image plus audio',async()=>{
  const summary=await validateMediaManifest();
  assert.equal(summary.assets,2);
  assert.ok(summary.totalBytes>0);
  assert.deepEqual(mediaManifest.assets.map(asset=>asset.kind).sort(),['audio','image']);
  assert.ok(mediaManifest.assets.every(asset=>!asset.remotePath.includes('://')));
});

test('ImageKit workflow uses GitHub secret, isolates feature branches, and publishes an auditable main status',()=>{
  const workflow=readFileSync(new URL('../.github/workflows/imagekit-media-sync.yml',import.meta.url),'utf8');
  const sync=readFileSync(new URL('../scripts/syncImageKitMedia.mjs',import.meta.url),'utf8');
  const smoke=readFileSync(new URL('../media-smoke.html',import.meta.url),'utf8');
  assert.match(workflow,/secrets\.IMAGEKIT_PRIVATE_KEY/);
  assert.match(workflow,/refs\/heads\/main/);
  assert.match(workflow,/statuses:\s*write/);
  assert.match(workflow,/ImageKit media/);
  assert.match(workflow,/Canonical ImageKit image\/audio sync verified/);
  assert.match(workflow,/statuses\/\$GITHUB_SHA/);
  assert.match(sync,/mode === 'production'/);
  assert.match(sync,/__pipeline-smoke/);
  assert.doesNotMatch(sync,/private_[A-Za-z0-9]/);
  assert.match(smoke,/mediaManifest/);
  assert.match(smoke,/mediaAssetUrl/);
});

test('production CSP permits only the ImageKit origin required by image and audio media',()=>{
  const vercel=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
  const csp=vercel.headers.flatMap(entry=>entry.headers).find(header=>header.key==='Content-Security-Policy')?.value??'';
  assert.match(csp,/img-src 'self' data: https:\/\/ik\.imagekit\.io;/);
  assert.match(csp,/media-src 'self' https:\/\/ik\.imagekit\.io;/);
  assert.doesNotMatch(csp,/img-src[^;]*\*/);
  assert.doesNotMatch(csp,/media-src[^;]*\*/);
});
