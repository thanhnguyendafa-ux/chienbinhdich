import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { validateSet } from '../src/data/contentValidator.js';
import { g7U1Translation02Content } from '../src/data/g7-u1-translation-02.js';
import { createSession, getSessionMetrics, submitAnswer } from '../src/core/sessionMachine.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';

const SET_ID = 'g7-u1-translation-02';
const CORPUS_SHA256 = '88e8933ed1524def87d633140eeffafab5d6a4aad505e0bd24278ffbd67eebd4';
const items = g7U1Translation02Content.items;
const answerOf = item => item.choices.find(choice => choice.id === item.correctChoiceId)?.text ?? '';
const numbered = number => items[number - 1];

test('Translation 2 publishes exactly 23 locked Vietnamese-English targets', () => {
  const corpus = items.map(item => [item.vi, answerOf(item)]);
  const fingerprint = createHash('sha256').update(JSON.stringify(corpus), 'utf8').digest('hex');

  assert.equal(items.length, 23);
  assert.equal(fingerprint, CORPUS_SHA256);
  assert.equal(items[0].vi, 'Bạn có sở thích nào không?');
  assert.equal(answerOf(items[0]), 'Do you have any hobbies?');
  assert.equal(items.at(-1).vi, 'Bạn nên có sở thích vì sở thích mang lại nhiều lợi ích.');
  assert.equal(answerOf(items.at(-1)), 'You should have hobbies because hobbies are beneficial.');
});

test('every question is a four-choice semantic MCQ with one canonical target', () => {
  items.forEach((item, index) => {
    assert.equal(item.id, `g7-u1-translation-02-q${String(index + 1).padStart(2, '0')}`);
    assert.equal(item.type, 'mcq');
    assert.equal(item.skill, 'translation-discrimination');
    assert.equal(item.correctChoiceId, 'target-translation');
    assert.equal(item.choices.length, 4);
    assert.equal(new Set(item.choices.map(({ id }) => id)).size, 4);
    assert.equal(new Set(item.choices.map(({ text }) => text)).size, 4);
    assert.equal(item.choices.filter(({ id }) => id === 'target-translation').length, 1);
    assert.ok(item.choices.every(({ id }) => !/^[abcd]$/i.test(id)));
  });
});

test('all 23 questions include learner-facing chunk explanation and trap memory', () => {
  for (const item of items) {
    const feedback = item.teachingFeedback;
    assert.equal(feedback.correctLabel, answerOf(item));
    assert.match(feedback.reason, /^Tách nghĩa:/);
    assert.match(feedback.example, /^Cụm cần nhớ:/);
    assert.ok(feedback.theory.includes('từng cụm nghĩa'));
    assert.match(item.prompt, /^Cho câu:/);
  }
});

test('representative near-miss traps remain pedagogically locked', () => {
  const choiceTexts = number => numbered(number).choices.map(({ text }) => text);

  assert.deepEqual(
    choiceTexts(6).filter(text => /during pandemics|after pandemics/.test(text)),
    ['A hobby gives you something fun to do during pandemics.', 'A hobby gives you something useful to do during pandemics.', 'A hobby gives you something fun to do after pandemics.', 'A hobby gives your family something fun to do during pandemics.']
  );
  assert.ok(choiceTexts(14).some(text => text.includes('travel plans')));
  assert.ok(choiceTexts(18).some(text => text.includes('a little time')));
  assert.ok(choiceTexts(18).some(text => text.includes('improve your health')));
  assert.ok(choiceTexts(21).some(text => text.includes('buy beautiful doll clothes')));
});

test('content remains deeply frozen and repository metadata validates', async () => {
  const first = items[0];
  assert.ok([g7U1Translation02Content, items, first, first.choices, first.choices[0], first.teachingFeedback].every(Object.isFrozen));
  assert.throws(() => { first.prompt = 'mutated'; }, TypeError);

  const set = await loadLessonSet(SET_ID);
  assert.deepEqual({
    folderId: set.folderId,
    course: set.course,
    unit: set.unit,
    title: set.title,
    threshold: set.passThreshold,
    count: set.items.length
  }, {
    folderId: 'global7-unit1',
    course: 'Global Success 7',
    unit: 'Unit 1 · Hobbies',
    title: 'Bài tập dịch 2',
    threshold: 80,
    count: 23
  });
  assert.deepEqual(set.activityTypes, ['mcq']);
  assert.deepEqual(validateSet(set), []);
});

test('23-item mastery crosses the 80 percent threshold only on clean gain 19', async () => {
  const set = await loadLessonSet(SET_ID);
  let session = createSession({ studentName: 'Học sinh dịch 2', set, now: 1000 });

  for (let gain = 1; gain <= 18; gain += 1) {
    const current = set.items.find(item => item.id === session.currentItemId);
    session = submitAnswer({ session, set, response: current.correctChoiceId, now: 2000 + gain }).session;
  }

  let metrics = getSessionMetrics(session, set, 3000);
  assert.equal(session.status, 'active');
  assert.equal(metrics.masteryExact, 78.26);
  assert.equal(metrics.completedMainItems, 18);
  assert.equal(session.currentItemId, 'g7-u1-translation-02-q19');

  const nineteenth = set.items.find(item => item.id === session.currentItemId);
  session = submitAnswer({ session, set, response: nineteenth.correctChoiceId, now: 4000 }).session;
  metrics = getSessionMetrics(session, set, 5000);

  assert.equal(session.status, 'passed');
  assert.equal(metrics.masteryExact, 82.61);
  assert.equal(metrics.completedMainItems, 19);
  assert.equal(metrics.total, 23);
  assert.equal(session.currentItemId, 'g7-u1-translation-02-q19');
  assert.equal(session.mainCursor, 19);
});
