import { buildG6U2LessonMap } from './g6-u2-writing-typing-builder.js';
import { g6U2WritingSource } from './g6-u2-writing-source.js';

const SPECS = Object.freeze({
  '10': Object.freeze({ targetSentenceId: 'g6u2-wr-t10', steps: Object.freeze([
    Object.freeze({ role: 'word', vi: 'sống', en: 'live' }),
    Object.freeze({ role: 'word', vi: 'ở đâu', en: 'where' }),
    Object.freeze({ role: 'chunk', vi: 'phần “bạn sống” sau từ hỏi WHERE', en: 'do you live' }),
    Object.freeze({ role: 'final', vi: 'Bạn sống ở đâu?', en: 'Where do you live?' })
  ]) }),
  '11': Object.freeze({ targetSentenceId: 'g6u2-wr-t11', steps: Object.freeze([
    Object.freeze({ role: 'word', vi: 'sống', en: 'live' }),
    Object.freeze({ role: 'chunk', vi: 'một căn nhà phố', en: 'a townhouse' }),
    Object.freeze({ role: 'chunk', vi: 'trong một căn nhà phố', en: 'in a townhouse' }),
    Object.freeze({ role: 'chunk', vi: 'ở Hà Nội', en: 'in Hanoi' }),
    Object.freeze({ role: 'chunk', vi: 'sống trong một căn nhà phố', en: 'live in a townhouse' }),
    Object.freeze({ role: 'sentence_part', vi: 'tôi sống trong một căn nhà phố', en: 'I live in a townhouse' }),
    Object.freeze({ role: 'final', vi: 'Tôi sống trong một căn nhà phố ở Hà Nội.', en: 'I live in a townhouse in Hanoi.' })
  ]) }),
  '12': Object.freeze({ targetSentenceId: 'g6u2-wr-t12', steps: Object.freeze([
    Object.freeze({ role: 'word', vi: 'ai', en: 'who' }),
    Object.freeze({ role: 'chunk', vi: 'sống cùng', en: 'live with' }),
    Object.freeze({ role: 'chunk', vi: 'phần “bạn sống cùng” sau từ hỏi WHO', en: 'do you live with' }),
    Object.freeze({ role: 'final', vi: 'Bạn sống cùng ai?', en: 'Who do you live with?' })
  ]) }),
  '13': Object.freeze({ targetSentenceId: 'g6u2-wr-t13', steps: Object.freeze([
    Object.freeze({ role: 'chunk', vi: 'bố mẹ của tôi', en: 'my parents' }),
    Object.freeze({ role: 'chunk', vi: 'cùng bố mẹ của tôi', en: 'with my parents' }),
    Object.freeze({ role: 'chunk', vi: 'sống cùng bố mẹ của tôi', en: 'live with my parents' }),
    Object.freeze({ role: 'final', vi: 'Tôi sống cùng bố mẹ.', en: 'I live with my parents.' })
  ]) }),
  '14': Object.freeze({ targetSentenceId: 'g6u2-wr-t14', steps: Object.freeze([
    Object.freeze({ role: 'word', vi: 'thường', en: 'often' }),
    Object.freeze({ role: 'chunk', vi: 'đọc sách', en: 'read books' }),
    Object.freeze({ role: 'chunk', vi: 'phòng ngủ của tôi', en: 'my bedroom' }),
    Object.freeze({ role: 'chunk', vi: 'trong phòng ngủ của tôi', en: 'in my bedroom' }),
    Object.freeze({ role: 'chunk', vi: 'thường đọc sách', en: 'often read books' }),
    Object.freeze({ role: 'sentence_part', vi: 'tôi thường đọc sách', en: 'I often read books' }),
    Object.freeze({ role: 'final', vi: 'Tôi thường đọc sách trong phòng ngủ của mình.', en: 'I often read books in my bedroom.' })
  ]) })
});

export const g6U2WritingPart5 = buildG6U2LessonMap(g6U2WritingSource, SPECS);
