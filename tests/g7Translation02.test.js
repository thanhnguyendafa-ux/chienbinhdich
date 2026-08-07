import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { g7U1Translation02Content } from '../src/data/g7-u1-translation-02.js';
import { createSession, getSessionMetrics, submitAnswer } from '../src/core/sessionMachine.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';

const SET_ID = 'g7-u1-translation-02';

const VIETNAMESE = [
  'Bạn có sở thích nào không?',
  'Những người chưa có sở thích nên bắt đầu một sở thích.',
  'Có một sở thích rất có lợi.',
  'Một sở thích cho bạn một việc thú vị để làm.',
  'Bạn có thể tận hưởng một sở thích trong thời gian rảnh.',
  'Một sở thích cho bạn một việc thú vị để làm trong thời gian có dịch bệnh.',
  'Gia đình tôi đọc sách cùng nhau trong thời gian phong tỏa do Covid-19.',
  'Gia đình tôi xem phim cùng nhau trong thời gian phong tỏa do Covid-19.',
  'Việc đọc sách và xem phim cùng nhau khiến gia đình tôi cảm thấy tốt hơn.',
  'Gia đình tôi phải ở nhà trong thời gian phong tỏa.',
  'Một sở thích khiến bạn trở thành một người thú vị hơn.',
  'Những người có nhiều kinh nghiệm và kỹ năng có thể chia sẻ kinh nghiệm và kỹ năng của mình với người khác.',
  'Tôi rất thích đi du lịch.',
  'Tôi thường chia sẻ những trải nghiệm du lịch của mình với các bạn cùng lớp.',
  'Việc chia sẻ những trải nghiệm du lịch giúp tôi có thêm nhiều bạn bè.',
  'Bây giờ chúng tôi có một nhóm du lịch trong lớp.',
  'Một sở thích có thể giúp bạn phát triển những kỹ năng mới.',
  'Việc dành nhiều thời gian cho sở thích có thể giúp các kỹ năng của bạn tiến bộ.',
  'Chị/em gái của tôi rất thích may vá.',
  'Chị/em gái của tôi đã may vá được hai năm.',
  'Bây giờ chị/em gái của tôi có thể may những bộ quần áo búp bê đẹp.',
  'Những hoạt động thú vị, nhiều bạn bè hơn và những kỹ năng mới là những lợi ích của việc có sở thích.',
  'Bạn nên có sở thích vì sở thích mang lại nhiều lợi ích.'
];

const CANONICAL = [
  'Do you have any hobbies?',
  'People without a hobby should start a hobby.',
  'Having a hobby is very beneficial.',
  'A hobby gives you something fun to do.',
  'You can enjoy a hobby during your leisure time.',
  'A hobby gives you something fun to do during pandemics.',
  'My family reads books together during the Covid-19 lockdown.',
  'My family watches films together during the Covid-19 lockdown.',
  'Reading books and watching films together makes my family feel better.',
  'My family has to stay at home during the lockdown.',
  'A hobby makes you a more interesting person.',
  'People with a lot of experience and skills can share their experience and skills with others.',
  'I love travelling.',
  'I usually share my travel experiences with my classmates.',
  'Sharing my travel experiences helps me have more friends.',
  'Now we have a travel group in our class.',
  'A hobby can help you develop new skills.',
  'Spending a lot of time on your hobby can improve your skills.',
  'My sister loves sewing.',
  'My sister has been sewing for two years.',
  'My sister can now sew beautiful doll clothes.',
  'Fun activities, more friends, and new skills are benefits of having hobbies.',
  'You should have hobbies because hobbies are beneficial.'
];

function targetText(item) {
  return item.choices.find(choice => choice.id === item.correctChoiceId)?.text ?? '';
}

function itemByNumber(number) {
  return g7U1Translation02Content.items.find(item => item.id.endsWith(`q${String(number).padStart(2, '0')}`));
}

test('Translation 2 locks the 23 independent reading clauses and canonical English targets', () => {
  const items = g7U1Translation02Content.items;
  assert.equal(items.length, 23);
  assert.deepEqual(items.map(item => item.vi), VIETNAMESE);
  assert.deepEqual(items.map(targetText), CANONICAL);
  assert.ok(items.every(item => item.type === 'mcq'));
  assert.ok(items.every(item => item.skill === 'translation-discrimination'));
  assert.ok(items.every(item => item.choices.length === 4));
  assert.ok(items.every(item => item.correctChoiceId === 'target-translation'));
});

test('Translation 2 choices are unique semantic near-misses with exactly one target', () => {
  for (const item of g7U1Translation02Content.items) {
    assert.equal(new Set(item.choices.map(choice => choice.id)).size, 4);
    assert.equal(new Set(item.choices.map(choice => choice.text)).size, 4);
    assert.equal(item.choices.filter(choice => choice.id === item.correctChoiceId).length, 1);
    assert.equal(item.choices.filter(choice => choice.text === targetText(item)).length, 1);
    assert.ok(item.choices.every(choice => !['a', 'b', 'c', 'd'].includes(choice.id.toLowerCase())));
  }
});

test('all 23 items contain explicit learner explanation: chunks, traps and phrases to remember', () => {
  for (const item of g7U1Translation02Content.items) {
    assert.match(item.prompt, /^Cho câu:/);
    assert.ok(item.teachingFeedback);
    assert.equal(item.teachingFeedback.correctLabel, targetText(item));
    assert.match(item.teachingFeedback.reason, /Tách nghĩa:/);
    assert.match(item.teachingFeedback.example, /Cụm cần nhớ:/);
    for (const field of ['correctLabel', 'reason', 'theory', 'example']) {
      assert.equal(typeof item.teachingFeedback[field], 'string');
      assert.ok(item.teachingFeedback[field].trim().length > 0, `${item.id} missing ${field}`);
    }
  }
});

test('high-value plausible meaning traps stay locked', () => {
  const q6 = itemByNumber(6);
  assert.ok(q6.choices.some(choice => choice.text.includes('during pandemics')));
  assert.ok(q6.choices.some(choice => choice.text.includes('after pandemics')));

  const q14 = itemByNumber(14);
  assert.ok(q14.choices.some(choice => choice.text.includes('travel experiences')));
  assert.ok(q14.choices.some(choice => choice.text.includes('travel plans')));

  const q18 = itemByNumber(18);
  assert.ok(q18.choices.some(choice => choice.text.includes('a lot of time')));
  assert.ok(q18.choices.some(choice => choice.text.includes('a little time')));
  assert.ok(q18.choices.some(choice => choice.text.includes('improve your health')));

  const q21 = itemByNumber(21);
  assert.ok(q21.choices.some(choice => choice.text.includes('sew beautiful doll clothes')));
  assert.ok(q21.choices.some(choice => choice.text.includes('buy beautiful doll clothes')));
});

test('Translation 2 content graph is deeply immutable', () => {
  const first = g7U1Translation02Content.items[0];
  assert.equal(Object.isFrozen(g7U1Translation02Content), true);
  assert.equal(Object.isFrozen(g7U1Translation02Content.items), true);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.choices), true);
  assert.equal(Object.isFrozen(first.choices[0]), true);
  assert.equal(Object.isFrozen(first.teachingFeedback), true);
  assert.throws(() => { first.prompt = 'mutated'; }, TypeError);
  assert.throws(() => { first.choices[0].text = 'mutated'; }, TypeError);
});

test('published Translation 2 resolves after Translation 1 in Global 7 Unit 1 and validates', async () => {
  const set = await loadLessonSet(SET_ID);
  assert.equal(set.folderId, 'global7-unit1');
  assert.equal(set.course, 'Global Success 7');
  assert.equal(set.unit, 'Unit 1 · Hobbies');
  assert.equal(set.title, 'Bài tập dịch 2');
  assert.equal(set.passThreshold, 80);
  assert.deepEqual(set.activityTypes, ['mcq']);
  assert.equal(set.items.length, 23);
  assert.deepEqual(validateSet(set), []);
});

test('23-item Set stays below threshold at 18 clean gains and qualifies on the 19th', async () => {
  const set = await loadLessonSet(SET_ID);
  let session = createSession({ studentName: 'Học sinh dịch 2', set, now: 1000 });

  for (let index = 0; index < 18; index += 1) {
    const item = set.items.find(candidate => candidate.id === session.currentItemId);
    session = submitAnswer({ session, set, response: item.correctChoiceId, now: 2000 + index }).session;
  }

  let metrics = getSessionMetrics(session, set, 3000);
  assert.equal(session.status, 'active');
  assert.equal(metrics.masteryExact, 78.26);
  assert.equal(metrics.completedMainItems, 18);
  assert.equal(session.currentItemId, 'g7-u1-translation-02-q19');

  const item19 = set.items.find(candidate => candidate.id === session.currentItemId);
  session = submitAnswer({ session, set, response: item19.correctChoiceId, now: 4000 }).session;
  metrics = getSessionMetrics(session, set, 5000);

  assert.equal(session.status, 'passed');
  assert.equal(metrics.masteryExact, 82.61);
  assert.equal(metrics.completedMainItems, 19);
  assert.equal(metrics.total, 23);
  assert.equal(session.currentItemId, 'g7-u1-translation-02-q19');
  assert.equal(session.mainCursor, 19);
});
