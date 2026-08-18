import { buildG7U2LessonMap } from './g7-u2-writing-typing-builder.js';
import { g7U2WritingSource } from './g7-u2-writing-source.js';

const SPECS = Object.freeze({
  '07': Object.freeze({
    targetSentenceId: 'g7u2-wr-t07',
    steps: Object.freeze([
      Object.freeze({ role: "word", vi: "các loại trái cây", en: "fruits" }),
      Object.freeze({ role: "word", vi: "rau củ", en: "vegetables" }),
      Object.freeze({ role: "chunk", vi: "nhiều trái cây và rau củ hơn", en: "more fruits and vegetables" }),
      Object.freeze({ role: "chunk", vi: "hãy ăn nhiều hơn", en: "eat more" }),
      Object.freeze({ role: "final", vi: "Hãy ăn nhiều trái cây và rau củ hơn.", en: "Eat more fruits and vegetables." })
    ])
  }),
  '08': Object.freeze({
    targetSentenceId: 'g7u2-wr-t08',
    steps: Object.freeze([
      Object.freeze({ role: "chunk", vi: "trái cây và rau củ", en: "fruits and vegetables" }),
      Object.freeze({ role: "chunk", vi: "nhiều vitamin", en: "a lot of vitamins" }),
      Object.freeze({ role: "chunk", vi: "cung cấp nhiều vitamin", en: "provide a lot of vitamins" }),
      Object.freeze({ role: "sentence_part", vi: "trái cây và rau củ cung cấp", en: "fruits and vegetables provide" }),
      Object.freeze({ role: "final", vi: "Trái cây và rau củ cung cấp nhiều vitamin.", en: "Fruits and vegetables provide a lot of vitamins." })
    ])
  }),
  '09': Object.freeze({
    targetSentenceId: 'g7u2-wr-t09',
    steps: Object.freeze([
      Object.freeze({ role: "word", vi: "thịt", en: "meat" }),
      Object.freeze({ role: "word", vi: "trứng", en: "eggs" }),
      Object.freeze({ role: "word", vi: "phô mai", en: "cheese" }),
      Object.freeze({ role: "chunk", vi: "thịt, trứng và phô mai", en: "meat, eggs and cheese" }),
      Object.freeze({ role: "chunk", vi: "không quá nhiều", en: "not too much" }),
      Object.freeze({ role: "chunk", vi: "nhưng không quá nhiều", en: "but not too much" }),
      Object.freeze({ role: "sentence_part", vi: "hãy ăn thịt, trứng và phô mai", en: "eat meat, eggs and cheese" }),
      Object.freeze({ role: "final", vi: "Hãy ăn thịt, trứng và phô mai, nhưng không quá nhiều.", en: "Eat meat, eggs and cheese, but not too much." })
    ])
  }),
  '10': Object.freeze({
    targetSentenceId: 'g7u2-wr-t10',
    steps: Object.freeze([
      Object.freeze({ role: "chunk", vi: "tăng cân", en: "put on weight" }),
      Object.freeze({ role: "chunk", vi: "có khả năng tăng cân", en: "may put on weight" }),
      Object.freeze({ role: "final", vi: "Bạn có khả năng tăng cân.", en: "You may put on weight." })
    ])
  }),
  '11': Object.freeze({
    targetSentenceId: 'g7u2-wr-t11',
    steps: Object.freeze([
      Object.freeze({ role: "chunk", vi: "đủ nước", en: "enough water" }),
      Object.freeze({ role: "chunk", vi: "nước ngọt", en: "soft drinks" }),
      Object.freeze({ role: "chunk", vi: "uống đủ nước", en: "drink enough water" }),
      Object.freeze({ role: "chunk", vi: "phần đối lập: còn nước ngọt thì không", en: "but not soft drinks" }),
      Object.freeze({ role: "final", vi: "Hãy uống đủ nước; còn nước ngọt thì không.", en: "Drink enough water, but not soft drinks." })
    ])
  })
});

export const g7U2WritingPart3 = buildG7U2LessonMap(g7U2WritingSource, SPECS);
