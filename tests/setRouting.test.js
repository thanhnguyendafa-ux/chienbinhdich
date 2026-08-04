import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSetShareUrl, resolveSetIdFromLocation } from '../src/core/setRouting.js';

test('set route resolves stable /s/:setId deep links', () => {
  assert.equal(resolveSetIdFromLocation({ href: 'https://chien-binh-dich.vercel.app/s/g7-u1-s1' }), 'g7-u1-s1');
});

test('set route also supports query fallback', () => {
  assert.equal(resolveSetIdFromLocation({ href: 'https://example.com/?set=g7-u1-s1' }), 'g7-u1-s1');
});

test('share URL is stable and does not depend on display title', () => {
  assert.equal(buildSetShareUrl({ href: 'https://chien-binh-dich.vercel.app/' }, 'g7-u1-s1'), 'https://chien-binh-dich.vercel.app/s/g7-u1-s1');
});
