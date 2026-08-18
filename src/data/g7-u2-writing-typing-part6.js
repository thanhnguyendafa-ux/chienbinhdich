import { buildG7U2LessonMap } from './g7-u2-writing-typing-builder.js';
import { g7U2WritingSource } from './g7-u2-writing-source.js';

const SPECS = Object.freeze({
  '15': Object.freeze({
    targetSentenceId: 'g7u2-wr-t15',
    steps: Object.freeze([
      Object.freeze({ role: "chunk", vi: "phòng của bạn", en: "your room" }),
      Object.freeze({ role: "word", vi: "gọn gàng", en: "tidy" }),
      Object.freeze({ role: "word", vi: "sạch sẽ", en: "clean" }),
      Object.freeze({ role: "chunk", vi: "gọn gàng và sạch sẽ", en: "tidy and clean" }),
      Object.freeze({ role: "sentence_part", vi: "giữ phòng của bạn gọn gàng", en: "keep your room tidy" }),
      Object.freeze({ role: "final", vi: "Hãy giữ phòng của bạn gọn gàng và sạch sẽ.", en: "Keep your room tidy and clean." })
    ])
  }),
  '16': Object.freeze({
    targetSentenceId: 'g7u2-wr-t16',
    steps: Object.freeze([
      Object.freeze({ role: "word", vi: "các cửa sổ", en: "windows" }),
      Object.freeze({ role: "chunk", vi: "không khí trong lành", en: "fresh air" }),
      Object.freeze({ role: "word", vi: "ánh nắng", en: "sunshine" }),
      Object.freeze({ role: "chunk", vi: "không khí trong lành và ánh nắng", en: "fresh air and sunshine" }),
      Object.freeze({ role: "chunk", vi: "cho không khí trong lành và ánh nắng vào", en: "let in fresh air and sunshine" }),
      Object.freeze({ role: "chunk", vi: "để cho không khí trong lành và ánh nắng vào", en: "to let in fresh air and sunshine" }),
      Object.freeze({ role: "chunk", vi: "vào những ngày đẹp trời", en: "on fine days" }),
      Object.freeze({ role: "sentence_part", vi: "mở cửa sổ để cho không khí trong lành và ánh nắng vào", en: "open windows to let in fresh air and sunshine" }),
      Object.freeze({ role: "final", vi: "Hãy mở cửa sổ để cho không khí trong lành và ánh nắng vào những ngày đẹp trời.", en: "Open windows to let in fresh air and sunshine on fine days." })
    ])
  })
});

export const g7U2WritingPart6 = buildG7U2LessonMap(g7U2WritingSource, SPECS);
