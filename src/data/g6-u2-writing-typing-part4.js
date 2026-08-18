import { buildG6U2LessonMap } from './g6-u2-writing-typing-builder.js';
import { g6U2WritingSource } from './g6-u2-writing-source.js';

const SPECS = Object.freeze({
  '08': Object.freeze({ targetSentenceId: 'g6u2-wr-t08', steps: Object.freeze([
    Object.freeze({ role: 'word', vi: 'có', en: 'have' }),
    Object.freeze({ role: 'chunk', vi: 'phòng ngủ riêng của tôi', en: 'my own bedroom' }),
    Object.freeze({ role: 'chunk', vi: 'có phòng ngủ riêng của tôi', en: 'have my own bedroom' }),
    Object.freeze({ role: 'final', vi: 'Tôi có phòng ngủ riêng.', en: 'I have my own bedroom.' })
  ]) }),
  '09': Object.freeze({ targetSentenceId: 'g6u2-wr-t09', steps: Object.freeze([
    Object.freeze({ role: 'chunk', vi: 'một cửa sổ lớn', en: 'a big window' }),
    Object.freeze({ role: 'chunk', vi: 'một cái đồng hồ', en: 'a clock' }),
    Object.freeze({ role: 'chunk', vi: 'trên tường', en: 'on the wall' }),
    Object.freeze({ role: 'chunk', vi: 'một cái đồng hồ trên tường', en: 'a clock on the wall' }),
    Object.freeze({ role: 'chunk', vi: 'phòng ngủ của tôi', en: 'my bedroom' }),
    Object.freeze({ role: 'sentence_part', vi: 'phòng ngủ của tôi cũng có', en: 'my bedroom also has' }),
    Object.freeze({ role: 'chunk', vi: 'một cửa sổ lớn và một cái đồng hồ trên tường', en: 'a big window and a clock on the wall' }),
    Object.freeze({ role: 'sentence_part', vi: 'Phòng ngủ của tôi cũng có một cửa sổ lớn...', en: 'My bedroom also has a big window' }),
    Object.freeze({ role: 'final', vi: 'Phòng ngủ của tôi cũng có một cửa sổ lớn và một cái đồng hồ trên tường.', en: 'My bedroom also has a big window and a clock on the wall.' })
  ]) })
});

export const g6U2WritingPart4 = buildG6U2LessonMap(g6U2WritingSource, SPECS);
