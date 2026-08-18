import { buildG6U2LessonMap } from './g6-u2-writing-typing-builder.js';
import { g6U2WritingSource } from './g6-u2-writing-source.js';

const SPECS = Object.freeze({
  '04': Object.freeze({ targetSentenceId: 'g6u2-wr-t04', steps: Object.freeze([
    Object.freeze({ role: 'chunk', vi: 'nhiều phòng', en: 'many rooms' }),
    Object.freeze({ role: 'chunk', vi: 'căn hộ mới của bạn', en: 'your new flat' }),
    Object.freeze({ role: 'chunk', vi: 'trong căn hộ mới của bạn', en: 'in your new flat' }),
    Object.freeze({ role: 'chunk', vi: 'nhiều phòng trong căn hộ mới của bạn', en: 'many rooms in your new flat' }),
    Object.freeze({ role: 'final', vi: 'Có nhiều phòng trong căn hộ mới của bạn không?', en: 'Are there many rooms in your new flat?' })
  ]) }),
  '05': Object.freeze({ targetSentenceId: 'g6u2-wr-t05', steps: Object.freeze([
    Object.freeze({ role: 'chunk', vi: 'một phòng khách', en: 'a living room' }),
    Object.freeze({ role: 'chunk', vi: 'ba phòng ngủ', en: 'three bedrooms' }),
    Object.freeze({ role: 'chunk', vi: 'một nhà bếp', en: 'a kitchen' }),
    Object.freeze({ role: 'chunk', vi: 'hai phòng tắm', en: 'two bathrooms' }),
    Object.freeze({ role: 'chunk', vi: 'một phòng khách, ba phòng ngủ', en: 'a living room, three bedrooms' }),
    Object.freeze({ role: 'chunk', vi: 'một nhà bếp và hai phòng tắm', en: 'a kitchen and two bathrooms' }),
    Object.freeze({ role: 'sentence_part', vi: 'Có một phòng khách, ba phòng ngủ...', en: 'There is a living room, three bedrooms' }),
    Object.freeze({ role: 'final', vi: 'Có một phòng khách, ba phòng ngủ, một nhà bếp và hai phòng tắm.', en: 'There is a living room, three bedrooms, a kitchen and two bathrooms.' })
  ]) }),
  '06': Object.freeze({ targetSentenceId: 'g6u2-wr-t06', steps: Object.freeze([
    Object.freeze({ role: 'chunk', vi: 'sáu phòng', en: 'six rooms' }),
    Object.freeze({ role: 'chunk', vi: 'nhà của chúng tôi', en: 'our house' }),
    Object.freeze({ role: 'chunk', vi: 'trong nhà của chúng tôi', en: 'in our house' }),
    Object.freeze({ role: 'sentence_part', vi: 'có sáu phòng', en: 'there are six rooms' }),
    Object.freeze({ role: 'final', vi: 'Có sáu phòng trong nhà của chúng tôi.', en: 'There are six rooms in our house.' })
  ]) }),
  '07': Object.freeze({ targetSentenceId: 'g6u2-wr-t07', steps: Object.freeze([
    Object.freeze({ role: 'chunk', vi: 'một cái giường', en: 'a bed' }),
    Object.freeze({ role: 'chunk', vi: 'một cái bàn học', en: 'a desk' }),
    Object.freeze({ role: 'chunk', vi: 'một cái ghế', en: 'a chair' }),
    Object.freeze({ role: 'chunk', vi: 'một giá sách', en: 'a bookshelf' }),
    Object.freeze({ role: 'chunk', vi: 'một cái giường, một cái bàn học', en: 'a bed, a desk' }),
    Object.freeze({ role: 'chunk', vi: 'một cái ghế và một giá sách', en: 'a chair and a bookshelf' }),
    Object.freeze({ role: 'sentence_part', vi: 'Có một cái giường, một cái bàn học...', en: 'There is a bed, a desk' }),
    Object.freeze({ role: 'final', vi: 'Có một cái giường, một cái bàn học, một cái ghế và một giá sách.', en: 'There is a bed, a desk, a chair and a bookshelf.' })
  ]) })
});

export const g6U2WritingPart3 = buildG6U2LessonMap(g6U2WritingSource, SPECS);
