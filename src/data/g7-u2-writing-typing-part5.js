import { buildG7U2LessonMap } from './g7-u2-writing-typing-builder.js';
import { g7U2WritingSource } from './g7-u2-writing-source.js';

const SPECS = Object.freeze({
  '14': Object.freeze({
    targetSentenceId: 'g7u2-wr-t14',
    steps: Object.freeze([
      Object.freeze({ role: "chunk", vi: "đi ngủ sớm", en: "go to bed early" }),
      Object.freeze({ role: "chunk", vi: "khoảng tám tiếng ngủ", en: "about eight hours of sleep" }),
      Object.freeze({ role: "word", vi: "hằng ngày", en: "daily" }),
      Object.freeze({ role: "chunk", vi: "ngủ khoảng tám tiếng hằng ngày", en: "get about eight hours of sleep daily" }),
      Object.freeze({ role: "chunk", vi: "không cảm thấy mệt", en: "not feel tired" }),
      Object.freeze({ role: "chunk", vi: "bạn sẽ không cảm thấy mệt", en: "you will not feel tired" }),
      Object.freeze({ role: "chunk", vi: "vì vậy bạn sẽ không cảm thấy mệt", en: "so you will not feel tired" }),
      Object.freeze({ role: "sentence_part", vi: "đi ngủ sớm và ngủ khoảng tám tiếng hằng ngày", en: "go to bed early and get about eight hours of sleep daily" }),
      Object.freeze({ role: "final", vi: "Hãy đi ngủ sớm và ngủ khoảng tám tiếng hằng ngày, vì vậy bạn sẽ không cảm thấy mệt.", en: "Go to bed early and get about eight hours of sleep daily, so you will not feel tired." })
    ])
  })
});

export const g7U2WritingPart5 = buildG7U2LessonMap(g7U2WritingSource, SPECS);
