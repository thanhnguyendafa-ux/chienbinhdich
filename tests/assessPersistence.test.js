import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const sessionRepo = readFileSync(new URL('../src/repositories/assessSessionRepository.js', import.meta.url), 'utf8');
const attemptRepo = readFileSync(new URL('../src/repositories/assessAttemptRepository.js', import.meta.url), 'utf8');
const deliveryRepo = readFileSync(new URL('../src/repositories/assessDeliveryRepository.js', import.meta.url), 'utf8');

test('Assess session persists immutable delivery snapshot fields', () => {
  for (const field of ['deliveryModeAtStart', 'deliveryContractVersionAtStart', 'contentRevisionAtStart']) {
    assert.match(sessionRepo, new RegExp(field));
  }
});

test('Firestore rules accept runtime V8 and bind Assess session to immutable assignment contract', () => {
  assert.match(rules, /schemaVersion\s+in\s+\[7,\s*8\]/);
  assert.match(rules, /function validAssessSessionDelivery\(\)/);
  assert.match(rules, /assignment\.deliveryContractVersion\s*==\s*request\.resource\.data\.deliveryContractVersionAtStart/);
  assert.match(rules, /assignment\.setId\s*==\s*request\.resource\.data\.setId/);
});

test('Assess delivery persists an immutable sanitized learner snapshot through Admin-authorized Firestore', () => {
  assert.match(deliveryRepo, /requireAdmin\(adminClient\)/);
  assert.match(deliveryRepo, /buildAssessDelivery/);
  assert.match(deliveryRepo, /assignments/);
  assert.match(deliveryRepo, /transaction\.set\(ref, delivery\)/);
});

test('student persistence stores raw neutral attempts without correctness fields', () => {
  const attemptBody = attemptRepo.slice(attemptRepo.indexOf('const attempt = Object.freeze({'), attemptRepo.indexOf('await state.firestore.setDoc', attemptRepo.indexOf('const attempt = Object.freeze({')));
  assert.match(attemptBody, /submittedResponse/);
  assert.match(attemptBody, /submittedAnswer/);
  assert.doesNotMatch(attemptBody, /\bcorrect\s*:|expectedAnswer|revealAnswer|masteryDelta/);
  assert.match(rules, /assignment\.sanitizedLesson\.items\[promptIndex\]\.id/);
});
