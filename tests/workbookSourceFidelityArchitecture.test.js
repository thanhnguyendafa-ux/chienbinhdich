import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(path,import.meta.url),'utf8');
const meaningfulLines = source => source.split('\n').filter(line => line.trim()).length;

test('workbook question builders have one shared implementation with a G7 compatibility facade',async()=>{
  const shared = await read('../src/data/workbook-content-helpers.js');
  const compat = await read('../src/data/g7-workbook-preload-helpers.js');
  assert.equal(compat.trim(),"export * from './workbook-content-helpers.js';");
  for(const symbol of ['preTheory','mcq','typing','classification','sentenceOrder','preload','lesson']) assert.match(shared,new RegExp(`export function ${symbol}`));
  assert.ok(meaningfulLines(shared)<=120,'shared workbook helper is becoming a god module');
});

test('all G6 workbook catalogs use the preload SSOT facade',async()=>{
  for(const file of ['g6-u1-workbook-catalog.js','g6-u2-workbook-catalog.js','g6-u3-workbook-catalog.js']){
    const source=await read(`../src/data/${file}`);
    assert.match(source,/g6-workbook-preload-registry\.js/);
    assert.doesNotMatch(source,/from '.\/g6-workbook-translation-preload\.js'/);
  }
  const facade=await read('../src/data/g6-workbook-preload-registry.js');
  assert.match(facade,/RECOVERED_SPECS/);
  assert.match(facade,/applyLegacyPreload/);
  assert.match(facade,/getG6WorkbookPreloadSpec/);
});

test('PDF recovery content stays split by unit instead of growing catalog or god content files',async()=>{
  for(const file of ['g6-u1-workbook-source-fidelity.js','g6-u2-workbook-source-fidelity.js','g7-u2-workbook-source-fidelity.js']){
    const source=await read(`../src/data/${file}`);
    assert.doesNotMatch(source,/workbook-catalog/,'source module must not depend on catalog');
    assert.ok(meaningfulLines(source)<=150,`${file} is becoming a god content module`);
  }
});
