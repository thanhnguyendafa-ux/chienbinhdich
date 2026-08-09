import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLessonPrintModel } from '../src/features/admin/print/lessonPrintModel.js';
import { renderPaper } from '../src/features/admin/print/renderLessonPrint.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';

function countOccurrences(text, needle) {
  return text.split(needle).length - 1;
}

test('Reading print groups each passage once and keeps continuous question numbering', async () => {
  const lesson = await loadLessonSet('g5-u1-reading-01');
  const model = buildLessonPrintModel(lesson, { version: 'student' });
  assert.equal(model.questionCount, 15);
  assert.equal(model.sections.length, 3);
  assert.deepEqual(model.sections.map(section => section.passage?.title), ['Meet Lucy', 'All about Nam', 'This is Sophie']);

  const numbers = model.sections.flatMap(section => section.blocks.flatMap(block => block.questions.map(question => question.number)));
  assert.deepEqual(numbers, Array.from({ length: 15 }, (_, index) => index + 1));

  const html = renderPaper(model);
  for (const passage of lesson.passages) {
    assert.equal(countOccurrences(html, passage.text), 1, `${passage.title} should print once`);
  }
});

test('Reading Student markup contains choice text but strips diagnostic answer metadata', async () => {
  const lesson = await loadLessonSet('g5-u1-reading-01');
  const html = renderPaper(buildLessonPrintModel(lesson, { version: 'student' }));
  assert.match(html, /True — because/);
  assert.doesNotMatch(html, /verdictCorrect|reasonCorrect|errorCode|correctChoiceId|lesson-print-teacher-answer/);
});
