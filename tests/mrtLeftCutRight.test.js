import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateSet } from '../src/data/contentValidator.js';
import { mrtLeftCutRight01Content } from '../src/data/mrt-left-cut-right-01.js';
import { evaluateQuestion } from '../src/core/questionTypes.js';
import { createSession, getSessionMetrics, submitAnswer } from '../src/core/sessionMachine.js';
import { getQuestionContext } from '../src/features/drill/questionContext.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';

const SET_ID = 'mrt-left-cut-right-01';
const registrySource = readFileSync(new URL('../src/features/drill/questionTypeRegistry.js', import.meta.url), 'utf8');
const renderSource = readFileSync(new URL('../src/features/drill/renderDrill.js', import.meta.url), 'utf8');

function countBy(values) {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function correctResponse(item) {
  if (item.type === 'typing') return item.en;
  if (item.type === 'mcq') return item.correctChoiceId;
  if (item.type === 'true_false') return item.answer;
  throw new Error(`Unexpected question type: ${item.type}`);
}

async function advanceClean(session, set, count, startTime = 2000) {
  let current = session;
  for (let index = 0; index < count; index += 1) {
    const item = set.items.find(candidate => candidate.id === current.currentItemId);
    current = submitAnswer({
      session: current,
      set,
      response: correctResponse(item),
      now: startTime + index
    }).session;
  }
  return current;
}

test('LEFT CUT RIGHT content has the locked 20-question blueprint', () => {
  const items = mrtLeftCutRight01Content.items;
  assert.equal(items.length, 20);
  assert.deepEqual(countBy(items.map(item => item.type)), { mcq: 8, true_false: 6, typing: 6 });
  assert.deepEqual(countBy(items.map(item => item.skill)), { left: 9, cut: 6, right: 5 });

  const typingItems = items.filter(item => item.type === 'typing');
  assert.equal(typingItems.length, 6);
  assert.ok(typingItems.every(item => item.skill === 'left'));
  assert.ok(typingItems.every(item => item.stage === undefined));

  const trueFalseItems = items.filter(item => item.type === 'true_false');
  assert.equal(trueFalseItems.filter(item => item.answer === true).length, 3);
  assert.equal(trueFalseItems.filter(item => item.answer === false).length, 3);
});

test('all LEFT CUT RIGHT items have semantic answers and complete worked teaching feedback', () => {
  for (const item of mrtLeftCutRight01Content.items) {
    assert.ok(Number.isInteger(item.sourceItem));
    assert.ok(item.sourceItem >= 1 && item.sourceItem <= 18);
    assert.ok(item.teachingFeedback);
    for (const field of ['correctLabel', 'reason', 'theory', 'example']) {
      assert.equal(typeof item.teachingFeedback[field], 'string');
      assert.ok(item.teachingFeedback[field].trim().length > 0, `${item.id} missing ${field}`);
    }
    assert.deepEqual(Object.keys(item.teachingFeedback.workedExample).sort(), ['label', 'text']);
    assert.equal(item.teachingFeedback.workedExample.label, 'Cách chặt đúng');
    assert.match(item.teachingFeedback.workedExample.text, / \| /);
  }

  for (const item of mrtLeftCutRight01Content.items.filter(candidate => candidate.type === 'mcq')) {
    assert.ok(item.choices.some(choice => choice.id === item.correctChoiceId));
    assert.ok(item.choices.every(choice => !['a', 'b', 'c', 'd'].includes(choice.id.toLowerCase())));
  }
});

test('LEFT Typing uses custom question context while legacy Typing defaults remain unchanged', () => {
  const typingItem = mrtLeftCutRight01Content.items.find(item => item.type === 'typing');
  assert.deepEqual(getQuestionContext(typingItem), {
    heading: 'Thông tin câu hỏi',
    rows: [
      { label: 'Câu', value: typingItem.vi },
      { label: 'Yêu cầu', value: 'Gõ phần TRÁI / SUBJECT.' }
    ]
  });

  assert.deepEqual(getQuestionContext({ id: 'legacy', type: 'typing', vi: 'Lan thân thiện.', en: 'Lan is friendly.' }), {
    heading: 'Thông tin câu hỏi',
    rows: [
      { label: 'Tiếng Việt', value: 'Lan thân thiện.' },
      { label: 'Yêu cầu', value: 'Dịch sang tiếng Anh.' }
    ]
  });

  assert.match(registrySource, /typingUiForItem\(item\)/);
  assert.match(registrySource, /typingUi\.promptLabel/);
  assert.match(registrySource, /typingUi\.placeholder/);
  assert.match(renderSource, /learnerResponseLabel\(item\)/);
  assert.match(renderSource, /Con gõ/);
  assert.match(renderSource, /workedExample/);
});

test('LEFT Typing checks the complete subject boundary and normalizes repeated spaces only', () => {
  const item = mrtLeftCutRight01Content.items.find(candidate => candidate.id === 'mrt-lcr-q04');
  assert.equal(evaluateQuestion(item, 'The library user').correct, true);
  assert.equal(evaluateQuestion(item, '  The   library   user  ').correct, true);
  assert.equal(evaluateQuestion(item, 'The library').correct, false);
  assert.equal(evaluateQuestion(item, 'The library user uses').correct, false);
});

test('LEFT CUT RIGHT content graph is deeply immutable before and after repository caching', async () => {
  const sourceItem = mrtLeftCutRight01Content.items[0];
  const typingItem = mrtLeftCutRight01Content.items.find(item => item.type === 'typing');
  const originalPrompt = sourceItem.prompt;
  const originalChoice = sourceItem.choices[0].text;

  assert.equal(Object.isFrozen(mrtLeftCutRight01Content), true);
  assert.equal(Object.isFrozen(mrtLeftCutRight01Content.items), true);
  assert.equal(Object.isFrozen(sourceItem), true);
  assert.equal(Object.isFrozen(sourceItem.choices), true);
  assert.equal(Object.isFrozen(sourceItem.choices[0]), true);
  assert.equal(Object.isFrozen(sourceItem.teachingFeedback.workedExample), true);
  assert.equal(Object.isFrozen(typingItem.typingUi), true);
  assert.throws(() => { sourceItem.prompt = 'mutated'; }, TypeError);
  assert.throws(() => { sourceItem.choices[0].text = 'mutated'; }, TypeError);

  const cachedSet = await loadLessonSet(SET_ID);
  assert.equal(cachedSet.items[0].prompt, originalPrompt);
  assert.equal(cachedSet.items[0].choices[0].text, originalChoice);
  assert.equal(Object.isFrozen(cachedSet.items[0]), true);
  assert.equal(Object.isFrozen(cachedSet.items[0].choices[0]), true);
});

test('published LEFT CUT RIGHT Set resolves under MRT folder and validates', async () => {
  const set = await loadLessonSet(SET_ID);
  assert.equal(set.folderId, 'mrt-lessons');
  assert.equal(set.course, 'Mister Thành MRT');
  assert.equal(set.unit, 'Reading Tool · LEFT | CUT | RIGHT');
  assert.equal(set.title, 'Trái | Cắt | Phải — Chặt câu để hiểu nghĩa');
  assert.equal(set.passThreshold, 80);
  assert.deepEqual(set.activityTypes, ['mcq', 'true_false', 'typing']);
  assert.equal(set.items.length, 20);
  assert.deepEqual(validateSet(set), []);
});

test('20-item LEFT CUT RIGHT Set qualifies immediately at exact 80 percent after 16 clean gains', async () => {
  const set = await loadLessonSet(SET_ID);
  let session = createSession({ studentName: 'Học sinh LEFT CUT RIGHT', set, now: 1000 });

  session = await advanceClean(session, set, 16);

  const metrics = getSessionMetrics(session, set, 3000);
  assert.equal(session.status, 'passed');
  assert.equal(metrics.mastery, 80);
  assert.equal(metrics.completedMainItems, 16);
  assert.equal(metrics.total, 20);
  assert.equal(session.currentItemId, 'mrt-lcr-q16');
  assert.equal(session.mainCursor, 16);
});

test('LEFT Typing first wrong hides the answer, second wrong reveals, and correction is neutral', async () => {
  const set = await loadLessonSet(SET_ID);
  let session = createSession({ studentName: 'Typing LEFT', set, now: 1000 });
  session = await advanceClean(session, set, 3);
  assert.equal(session.currentItemId, 'mrt-lcr-q04');

  const firstWrong = submitAnswer({ session, set, response: 'The library', now: 2100 });
  assert.equal(firstWrong.event.type, 'incorrect_retry');
  assert.equal(firstWrong.event.revealAnswer, null);
  assert.equal(firstWrong.event.mastery, 10);

  const secondWrong = submitAnswer({ session: firstWrong.session, set, response: 'library user', now: 2200 });
  assert.equal(secondWrong.event.type, 'incorrect_reveal');
  assert.equal(secondWrong.event.revealAnswer, 'The library user');
  assert.equal(secondWrong.event.mastery, 10);

  const correction = submitAnswer({ session: secondWrong.session, set, response: 'The library user', now: 2300 });
  assert.equal(correction.event.type, 'correction');
  assert.equal(correction.event.masteryDeltaUnits, 0);
  assert.equal(correction.event.masteryDeltaPercent, 0);
  assert.equal(correction.event.mastery, 10);
});
