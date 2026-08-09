import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SUPPORTED_QUESTION_TYPES,
  classificationAnswerMap,
  evaluateQuestion,
  expectedResponseDisplay
} from '../src/core/questionTypes.js';
import {
  classificationFeedbackHint,
  deriveClassificationDiagnostics,
  diagnoseClassification
} from '../src/core/classificationDiagnostics.js';
import { validateSet } from '../src/data/contentValidator.js';
import { attemptDocumentFor } from '../src/repositories/firebaseSessionRepository.js';

const registrySource = readFileSync(new URL('../src/features/drill/questionTypeRegistry.js', import.meta.url), 'utf8');

const stressItem = {
  id: 'stress-classification',
  type: 'classification',
  prompt: 'Put the words in the correct stress group.',
  groups: [
    { id: 'stress-1', label: 'STRESS 1', helper: 'First syllable' },
    { id: 'stress-2', label: 'STRESS 2', helper: 'Second syllable' }
  ],
  tokens: [
    { id: 'fifty', text: 'fifty', correctGroupId: 'stress-1' },
    { id: 'fifteen', text: 'fifteen', correctGroupId: 'stress-2' },
    { id: 'sixty', text: 'sixty', correctGroupId: 'stress-1' },
    { id: 'sixteen', text: 'sixteen', correctGroupId: 'stress-2' }
  ],
  classificationKind: 'stress',
  classificationHint: 'Compare -ty and -teen.'
};

test('classification is a supported question type and evaluates token-to-group mappings independent of click order', () => {
  assert.ok(SUPPORTED_QUESTION_TYPES.includes('classification'));
  const correct = { sixteen: 'stress-2', fifty: 'stress-1', fifteen: 'stress-2', sixty: 'stress-1' };
  assert.equal(evaluateQuestion(stressItem, correct).correct, true);
  assert.equal(evaluateQuestion(stressItem, { ...correct, fifty: 'stress-2' }).correct, false);
  assert.deepEqual(classificationAnswerMap(stressItem), {
    fifty: 'stress-1', fifteen: 'stress-2', sixty: 'stress-1', sixteen: 'stress-2'
  });
  assert.equal(expectedResponseDisplay(stressItem), 'STRESS 1: fifty, sixty | STRESS 2: fifteen, sixteen');
});

test('classification validator enforces valid groups, unique tokens and complete group coverage', () => {
  assert.deepEqual(validateSet({ id: 'classification-valid', passThreshold: 80, items: [stressItem] }), []);

  const badGroup = structuredClone(stressItem);
  badGroup.id = 'bad-group';
  badGroup.tokens[0].correctGroupId = 'missing';
  assert.ok(validateSet({ id: 'bad-group-set', passThreshold: 80, items: [badGroup] })
    .some(error => error.includes('trỏ group không tồn tại')));

  const duplicate = structuredClone(stressItem);
  duplicate.id = 'duplicate-token';
  duplicate.tokens[1].id = duplicate.tokens[0].id;
  assert.ok(validateSet({ id: 'duplicate-set', passThreshold: 80, items: [duplicate] })
    .some(error => error.includes('token không hợp lệ')));
});

test('classification diagnostics identify stress direction and count only first main attempts', () => {
  const response = { fifty: 'stress-2', fifteen: 'stress-1', sixty: 'stress-1', sixteen: 'stress-2' };
  const diagnostic = diagnoseClassification(stressItem, response);
  assert.equal(diagnostic.wrongCount, 2);
  assert.equal(diagnostic.byCode.stress_1_to_2, 1);
  assert.equal(diagnostic.byCode.stress_2_to_1, 1);
  assert.match(classificationFeedbackHint(stressItem, response), /-ty and -teen/i);

  const session = {
    attempts: [
      { itemId: stressItem.id, promptKind: 'main', attemptNumber: 1, submittedResponse: response },
      { itemId: stressItem.id, promptKind: 'main', attemptNumber: 2, submittedResponse: classificationAnswerMap(stressItem) },
      { itemId: stressItem.id, promptKind: 'retry', attemptNumber: 1, submittedResponse: classificationAnswerMap(stressItem) }
    ]
  };
  const summary = deriveClassificationDiagnostics(session, { items: [stressItem] });
  assert.equal(summary.total, 1);
  assert.equal(summary.correct, 0);
  assert.equal(summary.tokenMistakes, 2);
  assert.equal(summary.byCode.stress_1_to_2, 1);
  assert.equal(summary.byCode.stress_2_to_1, 1);
});

test('classification UI requires every token to be assigned and keeps click-to-classify as the primary interaction', () => {
  assert.match(registrySource, /classification:\s*\{\s*render:\s*renderClassification,\s*bind:\s*bindClassification\s*\}/);
  assert.match(registrySource, /assignments\.size !== total/);
  assert.match(registrySource, /data-classification-group/);
  assert.match(registrySource, /data-classification-token-id/);
  assert.match(registrySource, /inputMethod:\s*'tap'|meta\(attemptStartedAt, 'tap'/);
});

test('Firebase attempt documents preserve structured classification responses without a Session schema change', () => {
  const attempt = {
    id: 'S-p0-a1',
    itemId: stressItem.id,
    questionType: 'classification',
    submittedResponse: classificationAnswerMap(stressItem),
    submittedAnswer: expectedResponseDisplay(stressItem),
    correct: true
  };
  const document = attemptDocumentFor(attempt, 'S', 'uid-1');
  assert.deepEqual(document.submittedResponse, attempt.submittedResponse);
  assert.equal(document.questionType, 'classification');
});
