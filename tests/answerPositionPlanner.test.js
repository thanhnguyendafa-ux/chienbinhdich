import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAnswerPositionPlan } from '../src/features/admin/print/answerPositionPlanner.js';
import { buildLessonPrintModel } from '../src/features/admin/print/lessonPrintModel.js';
import { listSetDescriptors, loadLessonSet } from '../src/repositories/lessonRepository.js';

function mcq(id, choiceCount = 4, correctIndex = 0) {
  return {
    id,
    type: 'mcq',
    prompt: `Question ${id}`,
    choices: Array.from({ length: choiceCount }, (_, index) => ({ id: `c${index}`, text: `${id}-${index}` })),
    correctChoiceId: `c${correctIndex}`
  };
}

function questions(model) {
  return model.sections.flatMap(section => section.blocks.flatMap(block => block.questions));
}

function distribution(plan, items, choiceCount) {
  const counts = Array(choiceCount).fill(0);
  for (const item of items.filter(candidate => candidate.type === 'mcq' && candidate.choices.length === choiceCount)) {
    counts[plan.get(item.id)] += 1;
  }
  return counts;
}

function assertBalanced(counts) {
  assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, `unbalanced distribution: ${counts.join(',')}`);
}

function assertNoTriple(plan, items) {
  const positions = items.filter(item => item.type === 'mcq').map(item => plan.get(item.id));
  for (let index = 2; index < positions.length; index += 1) {
    assert.notEqual(
      positions[index] === positions[index - 1] && positions[index] === positions[index - 2],
      true,
      `three consecutive MCQs use position ${positions[index]}`
    );
  }
}

test('planner balances representative 2, 3 and 4 choice pools', () => {
  const fixtures = [
    { count: 5, choiceCount: 2 },
    { count: 12, choiceCount: 3 },
    { count: 7, choiceCount: 4 },
    { count: 12, choiceCount: 4 }
  ];

  for (const fixture of fixtures) {
    const items = Array.from({ length: fixture.count }, (_, index) => mcq(`q${fixture.choiceCount}-${index + 1}`, fixture.choiceCount, index % fixture.choiceCount));
    const plan = buildAnswerPositionPlan(items, { lessonId: `fixture-${fixture.choiceCount}-${fixture.count}`, lessonVersion: 1 });
    assert.equal(plan.size, items.length);
    assertBalanced(distribution(plan, items, fixture.choiceCount));
    assertNoTriple(plan, items);
  }
});

test('planner handles mixed choice counts without invalid positions or obvious round robin', () => {
  const items = [
    mcq('q1', 4), mcq('q2', 3), mcq('q3', 4), mcq('q4', 2),
    mcq('q5', 3), mcq('q6', 4), mcq('q7', 3), mcq('q8', 4),
    mcq('q9', 2), mcq('q10', 4), mcq('q11', 3), mcq('q12', 4)
  ];
  const plan = buildAnswerPositionPlan(items, { lessonId: 'mixed-counts', lessonVersion: 1 });
  for (const item of items) {
    const position = plan.get(item.id);
    assert.ok(Number.isInteger(position));
    assert.ok(position >= 0 && position < item.choices.length);
  }
  for (const choiceCount of [2, 3, 4]) assertBalanced(distribution(plan, items, choiceCount));
  assertNoTriple(plan, items);

  const fourChoicePositions = items.filter(item => item.choices.length === 4).map(item => plan.get(item.id));
  const roundRobin = fourChoicePositions.every((position, index) => position === index % 4);
  assert.equal(roundRobin, false);
});

test('planner is deterministic for lesson id and version', () => {
  const items = Array.from({ length: 15 }, (_, index) => mcq(`q${index + 1}`, 4, index % 4));
  const first = buildAnswerPositionPlan(items, { lessonId: 'deterministic', lessonVersion: 3 });
  const second = buildAnswerPositionPlan(items, { lessonId: 'deterministic', lessonVersion: 3 });
  assert.deepEqual([...first.entries()], [...second.entries()]);
});

test('print model balances real 3-choice and 4-choice lessons while Teacher follows Student labels', async () => {
  const [vocab, reading, unit2] = await Promise.all([
    loadLessonSet('g5-u1-vocab-01'),
    loadLessonSet('g5-u1-reading-01'),
    loadLessonSet('g5-u2-stress-vocab-01')
  ]);

  for (const lesson of [vocab, reading, unit2]) {
    const student = buildLessonPrintModel(lesson, { version: 'student' });
    const teacher = buildLessonPrintModel(lesson, { version: 'teacher', teacherDetail: 'compact' });
    const studentQuestions = questions(student);
    const teacherById = new Map(questions(teacher).map(question => [question.id, question]));
    const sourceById = new Map(lesson.items.map(item => [String(item.id), item]));
    const positionsByCount = new Map();
    const correctPositions = [];

    for (const question of studentQuestions.filter(candidate => candidate.type === 'mcq')) {
      const teacherQuestion = teacherById.get(question.id);
      const source = sourceById.get(question.id);
      assert.deepEqual(question.choices, teacherQuestion.choices);
      const correctText = source.choices.find(choice => choice.id === source.correctChoiceId).text;
      const printedCorrect = question.choices.find(choice => choice.text === correctText);
      assert.ok(printedCorrect);
      assert.equal(teacherQuestion.teacher.answer, `${printedCorrect.label}. ${printedCorrect.text}`);
      const position = printedCorrect.label.charCodeAt(0) - 65;
      correctPositions.push(position);
      const counts = positionsByCount.get(source.choices.length) ?? Array(source.choices.length).fill(0);
      counts[position] += 1;
      positionsByCount.set(source.choices.length, counts);
    }

    for (const counts of positionsByCount.values()) assertBalanced(counts);
    for (let index = 2; index < correctPositions.length; index += 1) {
      assert.equal(correctPositions[index] === correctPositions[index - 1] && correctPositions[index] === correctPositions[index - 2], false);
    }
  }
});

test('every catalog lesson builds Student and Teacher print models safely', async () => {
  const descriptors = listSetDescriptors();
  assert.ok(descriptors.length > 0);

  for (const descriptor of descriptors) {
    const lesson = await loadLessonSet(descriptor.id);
    const student = buildLessonPrintModel(lesson, { version: 'student' });
    const teacher = buildLessonPrintModel(lesson, { version: 'teacher', teacherDetail: 'compact' });
    assert.equal(student.questionCount, lesson.items.length, descriptor.id);
    assert.equal(teacher.questionCount, lesson.items.length, descriptor.id);

    const studentQuestions = questions(student);
    const teacherById = new Map(questions(teacher).map(question => [question.id, question]));
    const sourceById = new Map(lesson.items.map(item => [String(item.id), item]));
    const serializedStudent = JSON.stringify(student);
    for (const forbidden of ['correctChoiceId', 'targetCorrectIndex', 'diagnostic', '"teacher"']) {
      assert.equal(serializedStudent.includes(forbidden), false, `${descriptor.id} leaked ${forbidden}`);
    }

    for (const question of studentQuestions.filter(candidate => candidate.type === 'mcq')) {
      const source = sourceById.get(question.id);
      const teacherQuestion = teacherById.get(question.id);
      assert.equal(question.choices.length, source.choices.length, `${descriptor.id}/${question.id}`);
      assert.deepEqual(question.choices, teacherQuestion.choices, `${descriptor.id}/${question.id}`);
      const correctText = source.choices.find(choice => choice.id === source.correctChoiceId).text;
      const printedCorrect = question.choices.find(choice => choice.text === correctText);
      assert.ok(printedCorrect, `${descriptor.id}/${question.id} lost correct choice`);
      assert.equal(teacherQuestion.teacher.answer, `${printedCorrect.label}. ${printedCorrect.text}`);
    }
  }
});
