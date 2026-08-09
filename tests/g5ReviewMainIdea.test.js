import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { renderQuestionInteraction } from '../src/features/drill/questionTypeRegistry.js';
import { getQuestionContext } from '../src/features/drill/questionContext.js';
import { renderLessonContent } from '../src/features/admin/shared/renderLessonContent.js';
import { buildLessonPrintModel } from '../src/features/admin/print/lessonPrintModel.js';
import { renderPrintMcq } from '../src/features/admin/print/questions/renderPrintMcq.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';

function printQuestions(model) {
  return model.sections.flatMap(section => section.blocks.flatMap(block => block.questions));
}

function fixtureMcq(overrides = {}) {
  return {
    id: 'stimulus-q1',
    type: 'mcq',
    stimulus: { title: 'A short passage', text: 'One detail. Another detail.' },
    prompt: 'What is the main idea?',
    choices: [
      { id: 'a', text: 'Choice A' },
      { id: 'b', text: 'Choice B' }
    ],
    correctChoiceId: 'a',
    ...overrides
  };
}

test('optional MCQ stimulus validates independently from Reading diagnostic passages', () => {
  const valid = { id: 'stimulus-set', items: [fixtureMcq()] };
  assert.deepEqual(validateSet(valid), []);

  const malformed = { id: 'bad-stimulus-set', items: [fixtureMcq({ stimulus: { title: '', text: '' } })] };
  const malformedErrors = validateSet(malformed);
  assert.ok(malformedErrors.some(error => error.includes('thiếu title')));
  assert.ok(malformedErrors.some(error => error.includes('thiếu text')));

  const ambiguous = {
    id: 'ambiguous-stimulus-set',
    passages: [{ id: 'p1', title: 'Reading', text: 'Text' }],
    items: [fixtureMcq({ passageId: 'p1' })]
  };
  assert.ok(validateSet(ambiguous).some(error => error.includes('không được dùng đồng thời stimulus và passageId')));
});

test('online MCQ renderer shows stimulus separately without changing ordinary or diagnostic MCQ labels', async () => {
  const stimulusItem = fixtureMcq();
  const stimulusHtml = renderQuestionInteraction(stimulusItem, { exposureKey: 'stimulus-test' });
  assert.match(stimulusHtml, /READING/);
  assert.match(stimulusHtml, /A short passage/);
  assert.match(stimulusHtml, /One detail\. Another detail\./);
  assert.match(stimulusHtml, /Đọc bài và chọn Main Idea phù hợp nhất/);

  const ordinaryHtml = renderQuestionInteraction({ ...stimulusItem, stimulus: undefined }, { exposureKey: 'ordinary-test' });
  assert.doesNotMatch(ordinaryHtml, /READING/);
  assert.match(ordinaryHtml, /Chọn một đáp án/);

  const reading = await loadLessonSet('g5-u1-reading-01');
  const readingHtml = renderQuestionInteraction(reading.items[0], {
    exposureKey: 'diagnostic-reading-test',
    passages: reading.passages
  });
  assert.match(readingHtml, /Chọn phương án có cả True\/False và lý do đúng/);
});

test('feedback context and Admin preview keep the stimulus visible', () => {
  const item = fixtureMcq();
  const context = getQuestionContext(item);
  assert.deepEqual(context.rows.map(row => row.label), ['Passage · A short passage', 'Câu hỏi']);
  assert.equal(context.rows[0].value, item.stimulus.text);
  assert.equal(context.rows[1].value, item.prompt);

  const adminHtml = renderLessonContent({ items: [item] });
  assert.match(adminHtml, /admin-question-stimulus/);
  assert.match(adminHtml, /A short passage/);
  assert.match(adminHtml, /One detail\. Another detail\./);
});

test('Global 5 Main Idea lesson has 15 balanced-looking MCQs and the planned three-level progression', async () => {
  const lesson = await loadLessonSet('g5-review-main-idea-01');
  assert.equal(lesson.folderId, 'global5-review');
  assert.equal(lesson.unit, 'Review · Units 1–10');
  assert.equal(lesson.items.length, 15);
  assert.equal(lesson.completionPolicy, 'all-items');
  assert.deepEqual(lesson.activityTypes, ['mcq']);
  assert.equal('passages' in lesson, false);

  assert.deepEqual(lesson.printGroups.map(group => ({ title: group.title, count: group.itemIds.length })), [
    { title: 'A. FOUNDATION · FIND THE BIG IDEA', count: 5 },
    { title: 'B. DETAIL TRAPS · TRUE BUT TOO NARROW', count: 5 },
    { title: 'C. INFERENCE · BUILD THE MAIN IDEA', count: 5 }
  ]);

  const sourceAnswerCounts = { a: 0, b: 0, c: 0, d: 0 };
  const ids = new Set();
  for (const item of lesson.items) {
    assert.equal(item.type, 'mcq');
    assert.equal(item.prompt, 'What is the main idea of the passage?');
    assert.ok(item.stimulus?.title);
    assert.ok(item.stimulus?.text);
    assert.equal(item.passageId, undefined);
    assert.equal(item.choices.length, 4);
    assert.equal(new Set(item.choices.map(choice => choice.id)).size, 4);
    assert.equal(ids.has(item.id), false);
    ids.add(item.id);

    const correct = item.choices.find(choice => choice.id === item.correctChoiceId);
    assert.ok(correct, item.id);
    assert.equal(item.teachingFeedback.correctLabel, correct.text, item.id);
    assert.ok(item.teachingFeedback.reason.length > 40, item.id);
    assert.ok(item.teachingFeedback.theory.length > 20, item.id);
    assert.ok(item.teachingFeedback.example.length > 20, item.id);
    sourceAnswerCounts[item.correctChoiceId] += 1;

    const lengths = item.choices.map(choice => choice.text.length);
    assert.ok(Math.max(...lengths) / Math.min(...lengths) <= 1.2, `${item.id} choices look length-biased: ${lengths.join(',')}`);
    assert.equal(item.choices.some(choice => choice.diagnostic), false, item.id);
  }
  assert.deepEqual(sourceAnswerCounts, { a: 4, b: 4, c: 4, d: 3 });
  assert.deepEqual(validateSet(lesson), []);
});

test('Main Idea Student and Teacher print models share stimulus/choices while Student stays answer-sanitized', async () => {
  const lesson = await loadLessonSet('g5-review-main-idea-01');
  const student = buildLessonPrintModel(lesson, { version: 'student' });
  const teacher = buildLessonPrintModel(lesson, { version: 'teacher', teacherDetail: 'full' });
  const studentQuestions = printQuestions(student);
  const teacherById = new Map(printQuestions(teacher).map(question => [question.id, question]));
  const sourceById = new Map(lesson.items.map(item => [String(item.id), item]));

  assert.equal(student.questionCount, 15);
  assert.deepEqual(student.sections.map(section => section.title), [
    'A. FOUNDATION · FIND THE BIG IDEA',
    'B. DETAIL TRAPS · TRUE BUT TOO NARROW',
    'C. INFERENCE · BUILD THE MAIN IDEA'
  ]);

  for (const question of studentQuestions) {
    const teacherQuestion = teacherById.get(question.id);
    const source = sourceById.get(question.id);
    assert.deepEqual(question.stimulus, {
      title: source.stimulus.title,
      text: source.stimulus.text
    });
    assert.deepEqual(question.stimulus, teacherQuestion.stimulus);
    assert.deepEqual(question.choices, teacherQuestion.choices);
    const correctText = source.choices.find(choice => choice.id === source.correctChoiceId).text;
    const printedCorrect = question.choices.find(choice => choice.text === correctText);
    assert.ok(printedCorrect, question.id);
    assert.equal(teacherQuestion.teacher.answer, `${printedCorrect.label}. ${printedCorrect.text}`);
    assert.equal(teacherQuestion.teacher.reason, source.teachingFeedback.reason);
    assert.equal(teacherQuestion.teacher.theory, source.teachingFeedback.theory);
    assert.equal(teacherQuestion.teacher.example, source.teachingFeedback.example);
  }

  const serializedStudent = JSON.stringify(student);
  for (const forbidden of ['correctChoiceId', 'targetCorrectIndex', 'diagnostic', '"teacher"']) {
    assert.equal(serializedStudent.includes(forbidden), false, `Student print leaked ${forbidden}`);
  }
  assert.ok(serializedStudent.includes('Lan is eleven years old'));

  const firstHtml = renderPrintMcq(studentQuestions[0]);
  assert.match(firstHtml, /lesson-print-stimulus/);
  assert.match(firstHtml, /About Lan/);
  assert.match(firstHtml, /Lan is eleven years old/);
});
