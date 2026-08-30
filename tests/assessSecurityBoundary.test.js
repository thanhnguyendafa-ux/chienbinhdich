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
  assert.match(backend, /ok:\s*true[\s\S]*attemptId[\s\S]*recordedAt/);
  assert.doesNotMatch(api, /expectedAnswer|revealAnswer|correct:/);
});
