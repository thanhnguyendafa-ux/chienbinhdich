import { buildG6U2LessonMap } from './g6-u2-writing-typing-builder.js';
import { g6U2WritingSource } from './g6-u2-writing-source.js';

const SPECS = Object.freeze({
  '02': Object.freeze({ targetSentenceId: 'g6u2-wr-t02', steps: Object.freeze([
    Object.freeze({ role: 'word', vi: 'phía sau', en: 'behind' }),
    Object.freeze({ role: 'chunk', vi: 'phía sau bạn', en: 'behind you' }),
    Object.freeze({ role: 'chunk', vi: 'một chiếc TV', en: 'a TV' }),
    Object.freeze({ role: 'chunk', vi: 'một chiếc TV phía sau bạn', en: 'a TV behind you' }),
    Object.freeze({ role: 'final', vi: 'Có một chiếc TV phía sau bạn không?', en: 'Is there a TV behind you?' })
  ]) }),
  '03': Object.freeze({ targetSentenceId: 'g6u2-wr-t03', steps: Object.freeze([
    Object.freeze({ role: 'word', vi: 'bên cạnh', en: 'next to' }),
    Object.freeze({ role: 'chunk', vi: 'phòng khách (đã xác định)', en: 'the living room' }),
    Object.freeze({ role: 'chunk', vi: 'nhà bếp (đã xác định)', en: 'the kitchen' }),
    Object.freeze({ role: 'chunk', vi: 'bên cạnh nhà bếp (đã xác định)', en: 'next to the kitchen' }),
    Object.freeze({ role: 'sentence_part', vi: 'phòng khách (đã xác định) ở bên cạnh...', en: 'the living room is next to' }),
    Object.freeze({ role: 'final', vi: 'Phòng khách ở bên cạnh nhà bếp.', en: 'The living room is next to the kitchen.' })
  ]) })
});

export const g6U2WritingPart2 = buildG6U2LessonMap(g6U2WritingSource, SPECS);
