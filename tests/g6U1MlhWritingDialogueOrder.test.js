import test from 'node:test';
import assert from 'node:assert/strict';
import { loadLessonSet, listSetDescriptors } from '../src/repositories/lessonRepository.js';
import { validateSet } from '../src/data/contentValidator.js';
import { buildLessonPrintModel } from '../src/features/admin/print/lessonPrintModel.js';
import { renderPrintQuestion } from '../src/features/admin/print/printQuestionRegistry.js';

const LESSON_ID = 'g6-u1-mlh-writing-dialogue-order-01';

const DISPLAY_LINES = [
  'My form teacher is Mrs Hien. She teaches me physics.',
  'No. She’s great.',
  'Very well, thank you. How was your first day at school, Mai?',
  'Oh, good. Well, it’s time for me to leave. Bye.',
  'Hello, Huan. Fine, thanks! And you?',
  'I am sure that you’ll make friends soon. Tell me about your form teacher.',
  'Hi, Mai. How are you?',
  'Bye, Huan. See you soon.',
  'Is she strict?',
  'Oh, wonderful! I met many new people. Hope I could make them my friends soon.'
];

const CORRECT_ORDER = [
  'line-hi',
  'line-hello',
  'line-very-well',
  'line-wonderful',
  'line-friends-teacher',
  'line-teacher',
  'line-strict',
  'line-no-great',
  'line-leave',
  'line-bye'
];

test('Dialogue Order descriptor is published as Writing Mai Lan Huong lesson 4', () => {
  const descriptor = listSetDescriptors().find(item => item.id === LESSON_ID);
  assert.ok(descriptor);
  assert.equal(descriptor.folderId, 'global6-unit1-mlh-writing');
  assert.equal(descriptor.order, 4);
  assert.equal(descriptor.lessonSlug, 'g6u1-mlh-writing-dialogue-order-01');
  assert.equal(descriptor.itemCount, 36);
  assert.deepEqual(descriptor.activityTypes, ['typing', 'mcq', 'sequence_number']);
  assert.deepEqual(descriptor.printGroups.map(group => group.itemIds.length), [15, 12, 8, 1]);
});

test('Dialogue Order content validates and keeps the 15 WORD → 12 CHUNK → 8 Vietnamese logic → 1 final sequence flow', async () => {
  const lesson = await loadLessonSet(LESSON_ID);
  assert.deepEqual(validateSet(lesson), []);
  assert.equal(lesson.items.length, 36);
  assert.equal(lesson.items.slice(0, 15).every(item => item.type === 'typing' && item.stage === 'word'), true);
  assert.equal(lesson.items.slice(15, 27).every(item => item.type === 'typing' && item.stage === 'phrase'), true);
  assert.equal(lesson.items.slice(27, 35).every(item => item.type === 'mcq' && item.stage === 'sentence'), true);
  assert.equal(lesson.items[35].type, 'sequence_number');
  assert.equal(lesson.items[35].stage, 'sentence');
  assert.equal(lesson.items.every(item => item.theorySupport?.access === 'after_submit'), true);
});

test('WORD and CHUNK foundations cover the exact vocabulary needed to understand the source dialogue', async () => {
  const lesson = await loadLessonSet(LESSON_ID);
  assert.deepEqual(lesson.items.slice(0, 15).map(item => item.en), [
    'teacher', 'teaches', 'physics', 'strict', 'great', 'first', 'day', 'wonderful', 'met', 'people', 'hope', 'friends', 'soon', 'leave', 'bye'
  ]);
  assert.deepEqual(lesson.items.slice(15, 27).map(item => item.en), [
    'my form teacher',
    'teaches me physics',
    'your first day at school',
    'met many new people',
    'make them my friends',
    'make friends soon',
    'tell me about your form teacher',
    'is she strict',
    'she is great',
    'time for me to leave',
    'see you soon',
    'fine thanks'
  ]);
});

test('all eight conversation-logic MCQs keep the reasoning layer fully Vietnamese before the English source task', async () => {
  const lesson = await loadLessonSet(LESSON_ID);
  const logic = lesson.items.slice(27, 35);
  const sourceEnglish = /\b(?:How are you|How was your first day|Is she strict|My form teacher|See you soon|Very well|Hello, Huan|Hi, Mai|Tell me about your form teacher)\b/i;
  for (const item of logic) {
    assert.equal(item.choices.length, 4);
    assert.doesNotMatch(item.prompt, sourceEnglish, item.id);
    for (const choice of item.choices) assert.doesNotMatch(choice.text, sourceEnglish, `${item.id}/${choice.id}`);
    assert.ok(item.prompt.startsWith('Thầy: CÂU TRẢ LỜI'));
    assert.equal(item.choices.every(choice => choice.feedback?.startsWith('Thầy:')), true);
  }
});

test('final source item preserves book display order, canonical dialogue order, and only gives line Hi position 1', async () => {
  const lesson = await loadLessonSet(LESSON_ID);
  const item = lesson.items[35];
  assert.equal(item.type, 'sequence_number');
  assert.deepEqual(item.lines.map(line => line.text), DISPLAY_LINES);
  assert.deepEqual(item.correctOrder, CORRECT_ORDER);
  assert.equal(item.lines.length, 10);
  const locked = item.lines.filter(line => line.lockedPosition !== undefined);
  assert.equal(locked.length, 1);
  assert.equal(locked[0].id, 'line-hi');
  assert.equal(locked[0].text, 'Hi, Mai. How are you?');
  assert.equal(locked[0].lockedPosition, 1);
  assert.match(item.prompt, /số 2–10/i);
  assert.match(item.teachingFeedback.theory, /OPENING/);
  assert.match(item.teachingFeedback.theory, /closing/i);
});

test('Student Print preserves shuffled fixed lines and hides positions 2–10 while Teacher Full gets all canonical numbers', async () => {
  const lesson = await loadLessonSet(LESSON_ID);
  const studentModel = buildLessonPrintModel(lesson, { version: 'student' });
  const studentQuestion = studentModel.sections.at(-1).blocks.at(-1).questions.at(-1);
  assert.equal(studentQuestion.type, 'sequence_number');
  assert.equal('teacher' in studentQuestion, false);
  const studentHtml = renderPrintQuestion(studentQuestion);
  assert.match(studentHtml, />1<\/strong><span>Hi, Mai\. How are you\?/);
  assert.match(studentHtml, /____<\/strong><span>My form teacher is Mrs Hien/);
  assert.doesNotMatch(studentHtml, />6<\/strong><span>My form teacher is Mrs Hien/);

  const teacherModel = buildLessonPrintModel(lesson, { version: 'teacher', teacherDetail: 'full' });
  const teacherQuestion = teacherModel.sections.at(-1).blocks.at(-1).questions.at(-1);
  const positionMap = Object.fromEntries(teacherQuestion.teacher.sequencePositions.map(entry => [entry.id, entry.position]));
  assert.equal(positionMap['line-hi'], 1);
  assert.equal(positionMap['line-teacher'], 6);
  assert.equal(positionMap['line-no-great'], 8);
  assert.equal(positionMap['line-bye'], 10);
  const teacherHtml = renderPrintQuestion(teacherQuestion);
  assert.match(teacherHtml, />6<\/strong><span>My form teacher is Mrs Hien/);
});
