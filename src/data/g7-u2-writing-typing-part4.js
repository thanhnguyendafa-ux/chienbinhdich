import { buildG7U2LessonMap } from './g7-u2-writing-typing-builder.js';
import { g7U2WritingSource } from './g7-u2-writing-source.js';

const SPECS = Object.freeze({
  '12': Object.freeze({
    targetSentenceId: 'g7u2-wr-t12',
    steps: Object.freeze([
      Object.freeze({ role: "word", vi: "năng động", en: "active" }),
      Object.freeze({ role: "chunk", vi: "hãy năng động", en: "be active" }),
      Object.freeze({ role: "chunk", vi: "mỗi ngày", en: "every day" }),
      Object.freeze({ role: "chunk", vi: "tập thể dục mỗi ngày", en: "exercise every day" }),
      Object.freeze({ role: "chunk", vi: "hãy năng động và tập thể dục", en: "be active and exercise" }),
      Object.freeze({ role: "final", vi: "Hãy năng động và tập thể dục mỗi ngày.", en: "Be active and exercise every day." })
    ])
  }),
  '13': Object.freeze({
    targetSentenceId: 'g7u2-wr-t13',
    steps: Object.freeze([
      Object.freeze({ role: "chunk", vi: "các hoạt động ngoài trời", en: "outdoor activities" }),
      Object.freeze({ role: "word", vi: "đạp xe", en: "cycling" }),
      Object.freeze({ role: "word", vi: "bơi", en: "swimming" }),
      Object.freeze({ role: "chunk", vi: "chơi thể thao", en: "playing sports" }),
      Object.freeze({ role: "chunk", vi: "đạp xe, bơi hoặc chơi thể thao", en: "cycling, swimming or playing sports" }),
      Object.freeze({ role: "chunk", vi: "như đạp xe, bơi hoặc chơi thể thao", en: "like cycling, swimming or playing sports" }),
      Object.freeze({ role: "chunk", vi: "thực hiện các hoạt động ngoài trời", en: "do outdoor activities" }),
      Object.freeze({ role: "final", vi: "Hãy thực hiện các hoạt động ngoài trời như đạp xe, bơi hoặc chơi thể thao.", en: "Do outdoor activities like cycling, swimming or playing sports." })
    ])
  })
});

export const g7U2WritingPart4 = buildG7U2LessonMap(g7U2WritingSource, SPECS);
