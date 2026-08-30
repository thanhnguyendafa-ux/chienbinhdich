import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const sessionRepo = readFileSync(new URL('../src/repositories/assessSessionRepository.js', import.meta.url), 'utf8');
const backend = readFileSync(new URL('../server/assessBackend.js', import.meta.url), 'utf8');

test('Assess session persists immutable delivery snapshot fields', () => {
  for (const field of ['deliveryModeAtStart', 'deliveryContractVersionAtStart', 'contentRevisionAtStart']) {
    assert.match(sessionRepo, new RegExp(field));
  }
});

test('Firestore rules accept runtime V8 and protect Assess delivery snapshot on update', () => {
  assert.match(rules, /schemaVersion\s+in\s+\[7,\s*8\]/);
  assert.match(rules, /deliveryModeAtStart/);
  assert.match(rules, /deliveryContractVersionAtStart/);
});

test('trusted backend persists neutral attempts without correctness fields', () => {
  const attemptBody = backend.slice(backend.indexOf('const attempt = {'), backend.indexOf('try {', backend.indexOf('const attempt = {')));
  assert.match(attemptBody, /submittedResponse/);
  assert.doesNotMatch(attemptBody, /\bcorrect\s*:|expectedAnswer|revealAnswer|masteryDelta/);
});
