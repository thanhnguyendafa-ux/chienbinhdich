import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { buildLessonPrintModel } from '../src/features/admin/print/lessonPrintModel.js';
import { getSetDescriptorBySlug, loadLessonSet } from '../src/repositories/lessonRepository.js';

const WORD_TARGETS = Object.freeze([
  'favourite', 'subject', 'students', 'class', 'school', 'near', 'house', 'far', 'play', 'piano', 'good', 'well', 'physics', 'interested', 'library'
]);

const CHUNK_TARGETS = Object.freeze([
  'your favourite subject', 'like best', 'my class', 'near her school', 'far from', 'play the piano',
  'very well', 'good at', 'playing the piano', 'interested in', 'computer room', 'a library'
]);

const TRANSFORMATION_IDS = Object.freeze([
  'favourite-like-best', 'there-are-has', 'near-not-far-from',
  'well-good-at-ving', 'like-interested-in', 'has-there-is'
]);

const SOURCE_SENTENCES = Object.freeze([
  'What is your favourite subject?',
  'There are 35 students in my class.',
  'Mai lives near her school.',
  'Mary plays the piano very well.',
  'Do you like physics?',
  'The school has a computer room and a library.'
]);

const REWRITE_STARTERS = Object.freeze([
  'What subject ____________?',
  'My class ____________.',
  "Mai's house isn't ____________.",
  'Mary is good ____________.',
  'Are you interested ____________?',
  'There ____________.'
]);

const FINAL_SENTENCES = Object.freeze([
  'What subject do you like best?',
  'My class has 35 students.',
  "Mai's house isn't far from her school.",
  'Mary is good at playing the piano.',
  'Are you interested in physics?',
  'There is a computer room and a library in the school.'
]);

function printQuestions(model) {
  return model.sections.flatMap(section => section.blocks.flatMap(block => block.questions));
}

test('G6 U1 Mai Lan Huong Sentence Transformation is one 51-question published flow', async () => {
  const descriptor = getSetDescriptorBySlug('g6u1-mlh-writing-rewrite-01');
  assert.ok(descriptor);
  assert.equal(descriptor.id, 'g6-u1-mlh-writing-rewrite-01');
  assert.equal(descriptor.folderId, 'global6-unit1-mlh-writing');
  assert.equal(descriptor.course, 'Global Success 6');
  assert.equal(descriptor.unit, 'Unit 1 · My New School');
  assert.equal(descriptor.itemCount, 51);
  assert.deepEqual(descriptor.activityTypes, ['typing', 'mcq']);
  assert.equal(descriptor.printGroups.length, 4);

  const lesson = await loadLessonSet(descriptor.id);
  assert.equal(lesson.items.length, 51);
  assert.deepEqual(validateSet(lesson), []);
  assert.deepEqual(
    lesson.items.map(item => item.id),
    Array.from({ length: 51 }, (_, index) => `g6u1-mlh-rw-q${String(index + 1).padStart(2, '0')}`)
  );
});

test('Q1-Q15 use contextual WORD Typing cues with POS or morphology', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-rewrite-01');
  const words = lesson.items.slice(0, 15);
  assert.deepEqual(words.map(item => item.en), WORD_TARGETS);
  for (const item of words) {
    assert.equal(item.type, 'typing');
    assert.equal(item.stage, 'word');
    assert.equal(item.theorySupport?.access, 'after_submit');
    assert.equal(item.typingUi?.contextLabel, 'Tiếng Việt + từ loại + ngữ cảnh');
    assert.match(item.vi, /Thầy:/);
    assert.match(item.vi, /(danh từ|tính từ|động từ|trạng từ|số nhiều|plural noun|môn học|vị trí|khoảng cách)/i);
    assert.ok(item.vi.length > 55, `${item.id} must carry local semantic context`);
  }
  assert.match(words[5].vi, /Mai|gần trường/i);
  assert.match(words[7].vi, /not ___ from|khoảng cách/i);
  assert.match(words[10].vi, /giỏi một hoạt động/i);
  assert.match(words[11].vi, /bổ nghĩa cách Mary chơi piano/i);
});

test('Q16-Q27 use exact useful chunks with explicit word counts and no POS labels', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-rewrite-01');
  const chunks = lesson.items.slice(15, 27);
  assert.deepEqual(chunks.map(item => item.en), CHUNK_TARGETS);
  for (const item of chunks) {
    assert.equal(item.type, 'typing');
    assert.equal(item.stage, 'phrase');
    assert.equal(item.theorySupport?.access, 'after_submit');
    assert.equal(item.typingUi?.contextLabel, 'Tiếng Việt + số từ');
    assert.doesNotMatch(item.vi, /(adj\.|noun|verb|adverb|plural noun|proper noun)/i);
    const match = item.vi.match(/cụm (\d+) từ/i);
    assert.ok(match, `${item.id} must state chunk length`);
    assert.equal(item.en.trim().split(/\s+/).length, Number(match[1]), `${item.id} chunk length must match target`);
  }
});

test('Q28-Q45 are 18 self-contained reasoning MCQs with source + starter + current task', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-rewrite-01');
  const reasoning = lesson.items.slice(27, 45);
  assert.equal(reasoning.length, 18);
  assert.ok(reasoning.every(item => item.type === 'mcq'));
  assert.ok(reasoning.every(item => item.choices.length === 4));
  assert.ok(reasoning.every(item => item.theorySupport?.access === 'after_submit'));

  for (const item of reasoning) {
    assert.ok(item.sourceSentence, `${item.id} sourceSentence`);
    assert.ok(item.rewriteStarter, `${item.id} rewriteStarter`);
    assert.ok(item.currentTask, `${item.id} currentTask`);
    assert.ok(item.transformationId, `${item.id} transformationId`);
    assert.match(item.prompt, /CÂU GỐC:/);
    assert.match(item.prompt, /CÂU VIẾT LẠI:/);
    assert.match(item.prompt, /NHIỆM VỤ:/);
    assert.ok(item.prompt.includes(item.sourceSentence), `${item.id} prompt must repeat source`);
    assert.ok(item.prompt.includes(item.rewriteStarter), `${item.id} prompt must repeat rewrite starter`);
    assert.ok(item.prompt.includes(item.currentTask), `${item.id} prompt must repeat current task`);
    assert.ok(item.choices.every(choice => choice.feedback?.startsWith('Thầy:')), `${item.id} choices need Thầy feedback`);
  }

  for (let pair = 0; pair < 6; pair += 1) {
    const group = reasoning.slice(pair * 3, pair * 3 + 3);
    assert.ok(group.every(item => item.sourceSentence === SOURCE_SENTENCES[pair]));
    assert.ok(group.every(item => item.rewriteStarter === REWRITE_STARTERS[pair]));
    assert.ok(group.every(item => item.transformationId === TRANSFORMATION_IDS[pair]));
    assert.match(group[0].currentTask, /MEANING CORE/);
    assert.match(group[1].currentTask, /TRANSFORMATION/);
    assert.match(group[2].currentTask, /(SKELETON|MORPHOLOGY)/);
  }
});

test('the six transformation engines and their key correct reasoning are locked', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-rewrite-01');
  const reasoning = lesson.items.slice(27, 45);
  const correctText = item => item.choices.find(choice => choice.id === item.correctChoiceId)?.text ?? '';

  assert.match(correctText(reasoning[1]), /like best/i);
  assert.match(correctText(reasoning[2]), /do \+ you \+ like best/i);

  assert.equal(correctText(reasoning[4]), 'has');
  assert.equal(correctText(reasoning[5]), 'My class has 35 students.');

  assert.equal(correctText(reasoning[7]), 'far from');
  assert.equal(correctText(reasoning[8]), "Mai's house isn't far from her school.");

  assert.match(correctText(reasoning[10]), /good at \+ V-ing/i);
  assert.equal(correctText(reasoning[11]), 'playing the piano');

  assert.equal(correctText(reasoning[13]), 'interested in');
  assert.equal(correctText(reasoning[14]), 'in physics');

  assert.equal(correctText(reasoning[16]), 'is');
  assert.equal(correctText(reasoning[17]), 'There is a computer room and a library in the school.');
});

test('Q46-Q51 require full-sentence Typing with source and rewrite starter still visible', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-rewrite-01');
  const finals = lesson.items.slice(45);
  assert.equal(finals.length, 6);
  assert.deepEqual(finals.map(item => item.en), FINAL_SENTENCES);

  for (const [index, item] of finals.entries()) {
    assert.equal(item.type, 'typing');
    assert.equal(item.stage, 'sentence');
    assert.equal(item.theorySupport?.access, 'after_submit');
    assert.equal(item.typingUi?.promptLabel, 'FINAL REWRITE · TỰ VIẾT CẢ CÂU');
    assert.equal(item.sourceSentence, SOURCE_SENTENCES[index]);
    assert.equal(item.rewriteStarter, REWRITE_STARTERS[index]);
    assert.equal(item.transformationId, TRANSFORMATION_IDS[index]);
    assert.ok(item.vi.includes(item.sourceSentence));
    assert.ok(item.vi.includes(item.rewriteStarter));
    assert.match(item.vi, /FINAL REWRITE/);
  }
});

test('all 51 questions keep theory after submit; Student print stays answer-free while Teacher Full retains explanations', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-rewrite-01');
  assert.ok(lesson.items.every(item => item.theorySupport?.access === 'after_submit'));

  const student = printQuestions(buildLessonPrintModel(lesson, { version: 'student' }));
  const recall = printQuestions(buildLessonPrintModel(lesson, { version: 'student', showStudentTheory: false }));
  const teacher = printQuestions(buildLessonPrintModel(lesson, { version: 'teacher', teacherDetail: 'full' }));
  assert.equal(student.length, 51);
  assert.equal(recall.length, 51);
  assert.equal(teacher.length, 51);
  for (const question of student) assert.equal('studentTheory' in question, false, `${question.id} must not reveal after_submit theory`);
  for (const question of recall) assert.equal('studentTheory' in question, false, `${question.id} recall must stay theory-free`);
  for (const question of teacher) assert.ok(question.teacher?.theory, `${question.id} should retain Teacher theory`);

  const studentReasoning = student.slice(27, 45);
  for (const question of studentReasoning) {
    assert.match(question.prompt, /CÂU GỐC:/);
    assert.match(question.prompt, /CÂU VIẾT LẠI:/);
    assert.match(question.prompt, /NHIỆM VỤ:/);
  }
  const studentFinals = student.slice(45);
  for (const question of studentFinals) {
    assert.match(question.prompt, /CÂU GỐC:/);
    assert.match(question.prompt, /CÂU VIẾT LẠI:/);
    assert.match(question.prompt, /FINAL REWRITE/);
  }
});

test('Brain v1.2 maps source to target without changing the six transformation answers', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-rewrite-01');
  const q = number => lesson.items[number - 1];
  const finals = lesson.items.slice(45);

  assert.ok(finals.every(item => /BRAIN v1\.2/i.test(item.teachingFeedback.theory)), 'all six final rewrites need a Brain v1.2 summary');

  const q30Brain = `${q(30).teachingFeedback.reason} ${q(30).teachingFeedback.theory}`;
  assert.match(q30Brain, /YOU = SPECIAL/i);
  assert.match(q30Brain, /DO/i);
  assert.match(q30Brain, /ONE JOB/i);
  assert.match(q30Brain, /LIKE/i);

  assert.match(q(32).teachingFeedback.theory, /Whole Subject.*My class.*core.*class.*ONE.*HAS.*35 students/i);
  assert.match(q(32).choices.find(choice => choice.id === 'b')?.feedback ?? '', /NEAR-NOUN TRAP.*35 students.*My class/i);
  assert.match(q(33).choices.find(choice => choice.id === 'b')?.feedback ?? '', /AGREEMENT ERROR.*My class.*ONE.*HAS/i);

  assert.match(q(34).teachingFeedback.theory, /SOURCE BRAIN.*Mai.*ONE.*HÀNH ĐỘNG.*TARGET BRAIN.*Mai.*house.*ONE.*AURA/i);
  assert.match(q(36).choices.find(choice => choice.id === 'c')?.feedback ?? '', /HOST ERROR.*AURA.*BE.*DOESN/i);

  assert.match(q(39).teachingFeedback.theory, /playing.*gerund|gerund.*playing/i);
  assert.match(q(39).teachingFeedback.theory, /KHÔNG phải Continuous marker/i);

  assert.match(q(40).teachingFeedback.theory, /SOURCE.*DO.*YOU.*LIKE.*TARGET.*ARE.*YOU.*INTERESTED/i);
  assert.match(q(41).teachingFeedback.theory, /HÀNH ĐỘNG.*YOU = SPECIAL.*DO.*TARGET AURA.*YOU = SPECIAL.*ARE/i);

  assert.match(q(43).teachingFeedback.theory, /STANDARD GRAMMAR|standard grammar/i);
  assert.match(q(43).teachingFeedback.theory, /không tạo thêm.*mindset THERE|Không tạo thêm.*mindset THERE/i);
  assert.match(q(45).teachingFeedback.theory, /STANDARD GRAMMAR BOUNDARY/i);

  assert.match(q(47).teachingFeedback.theory, /Whole Subject.*My class.*ONE.*HAS.*35 students/i);
  assert.match(q(49).teachingFeedback.theory, /HÀNH ĐỘNG.*AURA.*playing.*KHÔNG phải Continuous marker/i);
  assert.match(q(51).teachingFeedback.theory, /STANDARD GRAMMAR BOUNDARY.*mindset THERE/i);

  assert.deepEqual(finals.map(item => item.en), FINAL_SENTENCES);
});
