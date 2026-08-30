import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { containsAssessAnswerKey, sanitizeAssessLesson } from '../src/core/assessPayload.js';

test('sanitized Assess payload strips recoverable answer-key fields across supported question shapes', () => {
  const lesson = {
    id: 'x',
    version: 1,
    title: 'Secure',
    items: [
      { id: 't', type: 'typing', vi: 'Mèo', en: 'Cat', acceptedAnswers: ['A cat'] },
      { id: 'm', type: 'mcq', prompt: 'Pick', choices: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctChoiceId: 'b' },
      { id: 'tf', type: 'true_false', statement: 'X', answer: true },
      { id: 'o', type: 'sentence_order', prompt: 'Order', correctOrder: ['I', 'am', 'fine'], acceptedOrders: [['I', 'am', 'fine']] },
      {
        id: 'cl',
        type: 'classification',
        prompt: 'Classify',
        groups: [{ id: 'g1', label: 'A' }, { id: 'g2', label: 'B' }],
        tokens: [{ id: 'x', text: 'x', correctGroupId: 'g2' }]
      }
    ]
  };
  const payload = sanitizeAssessLesson(lesson);
  assert.equal(containsAssessAnswerKey(payload), false);
  const serialized = JSON.stringify(payload);
  assert.doesNotMatch(serialized, /"correctChoiceId"|"correctGroupId"|"correctOrder"|"acceptedAnswers"/);
  assert.doesNotMatch(serialized, /"en":"Cat"/);
});

test('trusted grade endpoint returns neutral acknowledgement rather than correctness or expected answer', () => {
  const backend = readFileSync(new URL('../server/assessBackend.js', import.meta.url), 'utf8');
  const api = readFileSync(new URL('../api/assess/grade.js', import.meta.url), 'utf8');
  assert.match(backend, /evaluateQuestion\(item/);
  assert.match(backend, /verifyFirebaseIdToken\(token\)/);
  assert.match(backend, /getPrivilegedGoogleAccessToken\(\)/);
  assert.match(backend, /session\.ownerUid[\s\S]*user\.uid/);
  assert.match(backend, /ok:\s*true[\s\S]*attemptId[\s\S]*recordedAt/);
  assert.doesNotMatch(api, /expectedAnswer|revealAnswer|correct:/);
});

test('Assess issuing is authorized and snapshotted on the trusted server boundary', () => {
  const repository = readFileSync(new URL('../src/repositories/assessDeliveryRepository.js', import.meta.url), 'utf8');
  const backend = readFileSync(new URL('../server/assessAdminBackend.js', import.meta.url), 'utf8');
  const api = readFileSync(new URL('../api/assess/issue.js', import.meta.url), 'utf8');
  assert.match(repository, /\/api\/assess\/issue/);
  assert.match(repository, /getIdToken\(\)/);
  assert.doesNotMatch(repository, /setDoc|getDoc|collection\(|doc\(/);
  assert.match(backend, /verifyFirebaseIdToken\(token\)/);
  assert.match(backend, /getPrivilegedGoogleAccessToken\(\)/);
  assert.match(backend, /admins\//);
  assert.match(backend, /validateAssessDelivery\(lesson\)/);
  assert.match(backend, /deliveryMode:\s*DELIVERY_MODE_ASSESS/);
  assert.match(backend, /contentRevisionAtIssue/);
  assert.match(api, /issueAssessDelivery/);
});

test('production privileged identity is short-lived workload federation, never a committed service-account key', () => {
  const googleAuth = readFileSync(new URL('../server/googleAccessToken.js', import.meta.url), 'utf8');
  const wifSetup = readFileSync(new URL('../scripts/setupVercelGcpWif.sh', import.meta.url), 'utf8');
  assert.match(googleAuth, /VERCEL_OIDC_TOKEN/);
  assert.match(googleAuth, /sts\.googleapis\.com\/v1\/token/);
  assert.match(wifSetup, /workload-identity-pools/);
  assert.match(wifSetup, /roles\/datastore\.user/);
  assert.doesNotMatch(googleAuth, /BEGIN PRIVATE KEY/);
});
