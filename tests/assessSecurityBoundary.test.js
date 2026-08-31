import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { containsAssessAnswerKey, sanitizeAssessLesson } from '../src/core/assessPayload.js';
import { buildAssessDelivery, validateAssessAssignmentSnapshot } from '../src/core/assessDelivery.js';

test('sanitized Assess payload strips recoverable answer-key fields across supported question shapes', () => {
  const lesson = {
    id: 'x', version: 1, lessonSlug: 'x', title: 'Secure',
    assessmentPolicy: 'source-only',
    items: [
      { id: 't', type: 'typing', vi: 'Mèo', en: 'Cat', acceptedAnswers: ['A cat'] },
      { id: 'm', type: 'mcq', prompt: 'Pick', choices: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctChoiceId: 'b' },
      { id: 'tf', type: 'true_false', statement: 'X', answer: true },
      { id: 'o', type: 'sentence_order', prompt: 'Order', correctOrder: ['I', 'am', 'fine'], acceptedOrders: [['I', 'am', 'fine']] },
      { id: 'cl', type: 'classification', prompt: 'Classify', groups: [{ id: 'g1', label: 'A' }, { id: 'g2', label: 'B' }], tokens: [{ id: 'x', text: 'x', correctGroupId: 'g2' }] }
    ]
  };
  const payload = sanitizeAssessLesson(lesson);
  assert.equal(containsAssessAnswerKey(payload), false);
  const serialized = JSON.stringify(payload);
  assert.doesNotMatch(serialized, /"correctChoiceId"|"correctGroupId"|"correctOrder"|"acceptedAnswers"/);
  assert.doesNotMatch(serialized, /"en":"Cat"/);
});

test('issued Assess delivery embeds one immutable answer-key-free learner snapshot', () => {
  const lesson = {
    id: 'x', version: 1, lessonSlug: 'x', title: 'Secure', passThreshold: 80,
    items: [{ id: 'm', type: 'mcq', prompt: 'Pick', choices: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctChoiceId: 'b' }]
  };
  const delivery = buildAssessDelivery({ lesson, code: 'ABC234', createdBy: 'admin-1', now: 1 });
  assert.equal(delivery.deliveryMode, 'assess');
  assert.equal(containsAssessAnswerKey(delivery.sanitizedLesson), false);
  assert.equal(validateAssessAssignmentSnapshot(delivery), delivery.sanitizedLesson);
  assert.equal(delivery.sanitizedLesson.itemCount, 1);
  assert.ok(delivery.sanitizedLessonBytes > 0);
});

test('student path records raw responses only and never imports grading/result owners', () => {
  const app = readFileSync(new URL('../src/assess-app.js', import.meta.url), 'utf8');
  const attempts = readFileSync(new URL('../src/repositories/assessAttemptRepository.js', import.meta.url), 'utf8');
  assert.match(app, /validateAssessAssignmentSnapshot/);
  assert.match(app, /attemptRepository\.record/);
  assert.doesNotMatch(app, /assessApiRepository|deriveAssessSummary|evaluateQuestion|expectedResponseDisplay/);
  assert.match(attempts, /submittedResponse/);
  assert.doesNotMatch(attempts, /evaluateQuestion|expectedResponseDisplay|\bcorrect\s*:|masteryDelta|revealAnswer/);
});

test('Assess no longer requires privileged Vercel server identity or grading APIs', () => {
  for (const relative of [
    '../server/assessBackend.js', '../server/assessAdminBackend.js', '../server/googleAccessToken.js',
    '../server/firestoreRest.js', '../server/firebaseServerAuth.js', '../api/assess/issue.js',
    '../api/assess/lesson.js', '../api/assess/grade.js', '../scripts/setupVercelGcpWif.sh'
  ]) {
    assert.equal(existsSync(new URL(relative, import.meta.url)), false, `${relative} must not remain as dead privileged Assess code`);
  }
});
