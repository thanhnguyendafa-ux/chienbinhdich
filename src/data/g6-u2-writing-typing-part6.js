import { buildG6U2LessonMap } from './g6-u2-writing-typing-builder.js';
import { g6U2WritingSource } from './g6-u2-writing-source.js';

const SPECS = Object.freeze({
  '15': Object.freeze({ targetSentenceId: 'g6u2-wr-t15', steps: Object.freeze([
    Object.freeze({ role: 'word', vi: 'nhỏ', en: 'small' }),
    Object.freeze({ role: 'word', vi: 'đẹp', en: 'beautiful' }),
    Object.freeze({ role: 'chunk', vi: 'nhỏ nhưng đẹp', en: 'small but beautiful' }),
    Object.freeze({ role: 'chunk', vi: 'phòng ngủ của tôi', en: 'my bedroom' }),
    Object.freeze({ role: 'sentence_part', vi: 'phòng ngủ của tôi thì nhỏ', en: 'my bedroom is small' }),
    Object.freeze({ role: 'final', vi: 'Phòng ngủ của tôi nhỏ nhưng đẹp.', en: 'My bedroom is small but beautiful.' })
  ]) }),
  '16': Object.freeze({ targetSentenceId: 'g6u2-wr-t16', steps: Object.freeze([
    Object.freeze({ role: 'word', vi: 'bởi vì', en: 'because' }),
    Object.freeze({ role: 'word', vi: 'sáng', en: 'bright' }),
    Object.freeze({ role: 'chunk', vi: 'phòng khách của chúng tôi', en: 'our living room' }),
    Object.freeze({ role: 'chunk', vi: 'nó sáng', en: 'it is bright' }),
    Object.freeze({ role: 'chunk', vi: 'vì nó sáng', en: 'because it is bright' }),
    Object.freeze({ role: 'chunk', vi: 'thích phòng khách của chúng tôi nhất', en: 'love our living room the best' }),
    Object.freeze({ role: 'sentence_part', vi: 'tôi thích phòng khách của chúng tôi nhất', en: 'I love our living room the best' }),
    Object.freeze({ role: 'final', vi: 'Tôi thích phòng khách của chúng tôi nhất vì nó sáng.', en: 'I love our living room the best because it is bright.' })
  ]) })
});

export const g6U2WritingPart6 = buildG6U2LessonMap(g6U2WritingSource, SPECS);
