import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveReadingDiagnostics, readingFeedbackHint, selectedReadingChoice } from '../src/core/readingDiagnostics.js';
import { global5Unit1Reading01Content } from '../src/data/g5-u1-reading-01.js';

const set = { id: 'g5-u1-reading-01', items: global5Unit1Reading01Content.items, passages: global5Unit1Reading01Content.passages };

function attempt(itemId, choiceId, extra = {}) {
  return {
    itemId,
    promptKind: 'main',
    attemptNumber: 1,
    submittedResponse: choiceId,
    ...extra
  };
}

test('reading diagnostics classify only first main attempts and ignore retry/correction inflation', () => {
  const session = {
    attempts: [
      attempt('g5u1-reading-q01', 'b'),
      attempt('g5u1-reading-q02', 'b'),
      attempt('g5u1-reading-q03', 'd'),
      attempt('g5u1-reading-q04', 'a'),
      { itemId: 'g5u1-reading-q02', promptKind: 'main', attemptNumber: 2, submittedResponse: 'd' },
      { itemId: 'g5u1-reading-q03', promptKind: 'retry', attemptNumber: 1, submittedResponse: 'a' }
    ]
  };

  const result = deriveReadingDiagnostics(session, set);
  assert.equal(result.total, 4);
  assert.equal(result.correctVerdictCorrectReason, 1);
  assert.equal(result.rightVerdictWrongReason, 1);
  assert.equal(result.wrongVerdictRightEvidence, 1);
  assert.equal(result.wrongVerdictWrongReason, 1);
});

test('selected choice resolves by stored choice id so shuffled screen letters do not matter', () => {
  const item = set.items[0];
  const choice = selectedReadingChoice(item, item.correctChoiceId);
  assert.equal(choice.id, 'b');
  assert.equal(choice.diagnostic.verdictCorrect, true);
  assert.equal(choice.diagnostic.reasonCorrect, true);
});

test('wrong reading choices give diagnosis-specific hints without revealing the answer', () => {
  const item = set.items[1];
  const rightVerdictWrongReason = item.choices.find(choice => choice.diagnostic.verdictCorrect && !choice.diagnostic.reasonCorrect);
  const wrongVerdictRightEvidence = item.choices.find(choice => !choice.diagnostic.verdictCorrect && choice.diagnostic.reasonCorrect);
  const wrongBoth = item.choices.find(choice => !choice.diagnostic.verdictCorrect && !choice.diagnostic.reasonCorrect);

  assert.match(readingFeedbackHint(item, rightVerdictWrongReason.text), /True\/False đúng/);
  assert.match(readingFeedbackHint(item, wrongVerdictRightEvidence.text), /dữ kiện liên quan/);
  assert.match(readingFeedbackHint(item, wrongBoth.text), /Cả kết luận và lý do/);
  assert.equal(readingFeedbackHint(item, item.choices.find(choice => choice.id === item.correctChoiceId).text), null);
});
