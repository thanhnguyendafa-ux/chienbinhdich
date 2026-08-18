import { buildG6U2LessonMap } from './g6-u2-writing-typing-builder.js';
import { g6U2WritingSource } from './g6-u2-writing-source.js';

const SPECS = Object.freeze({
  '01': Object.freeze({
    targetSentenceId: 'g6u2-wr-t01',
    steps: Object.freeze([
      Object.freeze({ role: 'chunk', vi: 'phòng của Elena', en: "Elena's room" }),
      Object.freeze({ role: 'chunk', vi: 'nó là', en: 'it is' }),
      Object.freeze({ role: 'sentence_part', vi: 'nó là phòng của Elena', en: "it is Elena's room" }),
      Object.freeze({ role: 'final', vi: 'Đó là phòng của Elena.', en: "It is Elena's room." })
    ])
  })
});

export const g6U2WritingPart1 = buildG6U2LessonMap(g6U2WritingSource, SPECS);
