import { buildG7U2LessonMap } from './g7-u2-writing-typing-builder.js';
import { g7U2WritingSource } from './g7-u2-writing-source.js';

const SPECS = Object.freeze({
  '05': Object.freeze({
    targetSentenceId: 'g7u2-wr-t05',
    steps: Object.freeze([
      Object.freeze({ role: "chunk", vi: "thuốc nhỏ mắt", en: "eye drops" }),
      Object.freeze({ role: "chunk", vi: "dùng thuốc nhỏ mắt", en: "use eye drops" }),
      Object.freeze({ role: "chunk", vi: "có thể dùng thuốc nhỏ mắt", en: "can use eye drops" }),
      Object.freeze({ role: "final", vi: "Bạn có thể dùng thuốc nhỏ mắt.", en: "You can use eye drops." })
    ])
  }),
  '06': Object.freeze({
    targetSentenceId: 'g7u2-wr-t06',
    steps: Object.freeze([
      Object.freeze({ role: "chunk", vi: "ánh sáng mờ", en: "dim light" }),
      Object.freeze({ role: "chunk", vi: "trong ánh sáng mờ", en: "in dim light" }),
      Object.freeze({ role: "chunk", vi: "đọc trong ánh sáng mờ", en: "read in dim light" }),
      Object.freeze({ role: "chunk", vi: "không nên đọc trong ánh sáng mờ", en: "should not read in dim light" }),
      Object.freeze({ role: "final", vi: "Bạn không nên đọc trong ánh sáng mờ.", en: "You should not read in dim light." })
    ])
  })
});

export const g7U2WritingPart2 = buildG7U2LessonMap(g7U2WritingSource, SPECS);
