import { orderForExposure } from '../../../core/exposureOrder.js';
import {
  acceptedSentenceOrderDisplays,
  classificationResponseDisplay,
  expectedResponseDisplay,
  questionPromptDisplay,
  questionTypeForItem
} from '../../../core/questionTypes.js';
import { buildAnswerPositionPlan } from './answerPositionPlanner.js';
import { mcqPrintLayout } from './mcqPrintLayout.js';
import { normalizePrintConfig } from './printConfig.js';

const BLOCK_INSTRUCTIONS = Object.freeze({
  mcq: 'Choose the correct answer.',
  true_false: 'Write T (True) or F (False).',
  typing: 'Write your answer in English.',
  sentence_order: 'Put the words or blocks in the correct order.',
  classification: 'Put each word or phrase in the correct group.'
});

export function buildLessonPrintModel(lesson, options = {}) {
  if (!lesson?.id || !Array.isArray(lesson.items) || lesson.items.length === 0) {
    throw new Error('Lesson print requires a loaded lesson with items.');
  }

  const config = normalizePrintConfig(options);
  const itemById = new Map(lesson.items.map(item => [String(item.id), item]));
  const sectionSpecs = resolveSectionSpecs(lesson, itemById);
  const orderedItems = sectionSpecs.flatMap(spec => spec.items);
  const answerPositionPlan = buildAnswerPositionPlan(orderedItems, {
    lessonId: lesson.id,
    lessonVersion: lesson.version ?? 1
  });
  let questionNumber = 0;

  const sections = sectionSpecs.map(spec => {
    const questions = spec.items.map(item => {
      questionNumber += 1;
      return buildQuestionModel({
        lesson,
        item,
        number: questionNumber,
        config,
        targetCorrectIndex: answerPositionPlan.get(String(item.id))
      });
    });
    return Object.freeze({
      title: spec.title,
      passage: spec.passage ? Object.freeze({ title: String(spec.passage.title), text: String(spec.passage.text) }) : null,
      blocks: Object.freeze(groupQuestionBlocks(questions))
    });
  }).filter(section => section.blocks.length > 0);

  return Object.freeze({
    lessonId: String(lesson.id),
    course: String(lesson.course ?? ''),
    unit: String(lesson.unit ?? ''),
    title: String(lesson.title ?? ''),
    questionCount: questionNumber,
    config,
    sections: Object.freeze(sections)
  });
}

function resolveSectionSpecs(lesson, itemById) {
  const passages = Array.isArray(lesson.passages) ? lesson.passages : [];
  const printGroups = Array.isArray(lesson.printGroups) ? lesson.printGroups : [];
  if (passages.length && printGroups.length) {
    throw new Error('Reading lessons group by passage and cannot also define printGroups.');
  }

  if (passages.length) {
    const output = passages.map((passage, index) => ({
      title: `READING ${index + 1}`,
      passage,
      items: lesson.items.filter(item => String(item.passageId ?? '') === String(passage.id))
    })).filter(section => section.items.length);
    const readingIds = new Set(output.flatMap(section => section.items.map(item => String(item.id))));
    const otherItems = lesson.items.filter(item => !readingIds.has(String(item.id)));
    if (otherItems.length) output.push({ title: 'EXERCISES', passage: null, items: otherItems });
    return output;
  }

  if (printGroups.length) {
    return printGroups.map(group => ({
      title: String(group.title),
      passage: null,
      items: group.itemIds.map(id => itemById.get(String(id))).filter(Boolean)
    }));
  }

  return [{ title: 'EXERCISES', passage: null, items: lesson.items }];
}

function groupQuestionBlocks(questions) {
  const blocks = [];
  for (const question of questions) {
    const previous = blocks.at(-1);
    if (previous?.type === question.type) {
      previous.questions.push(question);
      continue;
    }
    blocks.push({
      type: question.type,
      instruction: BLOCK_INSTRUCTIONS[question.type] ?? '',
      questions: [question]
    });
  }
  return blocks.map(block => Object.freeze({
    ...block,
    questions: Object.freeze(block.questions)
  }));
}

function buildQuestionModel({ lesson, item, number, config, targetCorrectIndex }) {
  const type = questionTypeForItem(item);
  const base = {
    id: String(item.id),
    number,
    type,
    prompt: questionPromptDisplay(item)
  };
  const key = `print:${lesson.id}:${item.id}:v${lesson.version ?? 1}`;

  if (type === 'mcq') return buildMcq(item, base, key, config, targetCorrectIndex);
  if (type === 'true_false') return withTeacher(base, item, config, {
    answer: item.answer === true ? 'TRUE' : 'FALSE'
  });
  if (type === 'typing') return withTeacher({ ...base, lines: writingLineCount(item, config) }, item, config, {
    answer: String(item.en ?? '')
  });
  if (type === 'sentence_order') return buildSentenceOrder(item, base, key, config);
  if (type === 'classification') return buildClassification(item, base, key, config);
  throw new Error(`Unsupported print question type: ${type}`);
}

function buildMcq(item, base, key, config, targetCorrectIndex) {
  const sourceChoices = item.choices ?? [];
  const correctChoice = sourceChoices.find(choice => String(choice.id) === String(item.correctChoiceId));
  if (!correctChoice) throw new Error(`MCQ ${item.id} is missing its correct choice for print.`);
  if (!Number.isInteger(targetCorrectIndex) || targetCorrectIndex < 0 || targetCorrectIndex >= sourceChoices.length) {
    throw new Error(`MCQ ${item.id} is missing a valid planned correct position for print.`);
  }

  const distractors = sourceChoices.filter(choice => String(choice.id) !== String(item.correctChoiceId));
  const ordered = orderForExposure(distractors, `${key}:mcq:distractors`);
  ordered.splice(targetCorrectIndex, 0, correctChoice);
  const choices = ordered.map((choice, index) => Object.freeze({
    label: alphabetLabel(index),
    text: String(choice.text ?? '')
  }));
  const student = {
    ...base,
    choices: Object.freeze(choices),
    layout: mcqPrintLayout(choices)
  };
  if (config.version !== 'teacher') return Object.freeze(student);

  const correct = choices[targetCorrectIndex];
  return Object.freeze({
    ...student,
    teacher: teacherPayload(item, config, {
      answer: `${correct.label}. ${correct.text}`
    })
  });
}

function buildSentenceOrder(item, base, key, config) {
  const sourceTokens = item.tokens ?? item.correctOrder ?? [];
  const student = {
    ...base,
    tokens: Object.freeze(orderForExposure(sourceTokens, `${key}:order`).map(String)),
    lines: writingLineCount(item, config)
  };
  if (config.version !== 'teacher') return Object.freeze(student);

  const canonical = expectedResponseDisplay(item);
  const alternatives = acceptedSentenceOrderDisplays(item).filter(value => value !== canonical);
  return Object.freeze({
    ...student,
    teacher: teacherPayload(item, config, {
      answer: canonical,
      alternatives: Object.freeze(alternatives)
    })
  });
}

function buildClassification(item, base, key, config) {
  const student = {
    ...base,
    tokens: Object.freeze(orderForExposure(item.tokens ?? [], `${key}:classification`).map(token => String(token.text))),
    groups: Object.freeze((item.groups ?? []).map(group => Object.freeze({
      label: String(group.label ?? group.id),
      helper: group.helper ? String(group.helper) : ''
    })))
  };
  if (config.version !== 'teacher') return Object.freeze(student);

  const correctGroups = (item.groups ?? []).map(group => Object.freeze({
    label: String(group.label ?? group.id),
    values: Object.freeze((item.tokens ?? [])
      .filter(token => String(token.correctGroupId) === String(group.id))
      .map(token => String(token.text)))
  }));
  return Object.freeze({
    ...student,
    teacher: teacherPayload(item, config, {
      answer: classificationResponseDisplay(item, Object.fromEntries((item.tokens ?? []).map(token => [String(token.id), String(token.correctGroupId)]))),
      groups: Object.freeze(correctGroups)
    })
  });
}

function withTeacher(student, item, config, answerPayload) {
  if (config.version !== 'teacher') return Object.freeze(student);
  return Object.freeze({
    ...student,
    teacher: teacherPayload(item, config, answerPayload)
  });
}

function teacherPayload(item, config, answerPayload) {
  const feedback = item.teachingFeedback ?? null;
  const payload = {
    ...answerPayload,
    reason: feedback?.reason ? String(feedback.reason) : ''
  };
  if (config.teacherDetail === 'full') {
    payload.theory = feedback?.theory ? String(feedback.theory) : '';
    payload.example = feedback?.example ? String(feedback.example) : '';
    if (feedback?.workedExample) {
      payload.workedExample = Object.freeze({
        label: String(feedback.workedExample.label ?? ''),
        text: String(feedback.workedExample.text ?? '')
      });
    }
  }
  return Object.freeze(payload);
}

function writingLineCount(item, config) {
  if (config.density === 'wide') return 3;
  if (config.density === 'standard') return 2;
  const expectedLength = String(item.en ?? expectedResponseDisplay(item) ?? '').length;
  return expectedLength > 55 ? 2 : 1;
}

function alphabetLabel(index) {
  return String.fromCharCode(65 + index);
}
