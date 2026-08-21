import { g6U2TrapLesson as lesson01 } from './g6-u2-trap-vocab-odd-01.js';
import { g6U2TrapLesson as lesson02 } from './g6-u2-trap-vocab-context-01.js';
import { g6U2TrapLesson as lesson03 } from './g6-u2-trap-vocab-category-01.js';
import { g6U2TrapLesson as lesson04 } from './g6-u2-trap-grammar-there-01.js';
import { g6U2TrapLesson as lesson05 } from './g6-u2-trap-grammar-have-there-01.js';
import { g6U2TrapLesson as lesson06 } from './g6-u2-trap-grammar-preposition-01.js';
import { g6U2TrapLesson as lesson07 } from './g6-u2-trap-grammar-suggestion-01.js';
import { g6U2TrapLesson as lesson08 } from './g6-u2-trap-grammar-description-01.js';
import { g6U2TrapLesson as lesson09 } from './g6-u2-trap-reading-tf-01.js';
import { g6U2TrapLesson as lesson10 } from './g6-u2-trap-reading-detail-01.js';
import { g6U2TrapLesson as lesson11 } from './g6-u2-trap-reading-wh-01.js';
import { g6U2TrapLesson as lesson12 } from './g6-u2-trap-reading-reference-01.js';
import { g6U2TrapLesson as lesson13 } from './g6-u2-trap-writing-reorder-01.js';
import { g6U2TrapLesson as lesson14 } from './g6-u2-trap-writing-error-01.js';
import { g6U2TrapLesson as lesson15 } from './g6-u2-trap-writing-rewrite-01.js';
import { g6U2TrapLesson as lesson16 } from './g6-u2-trap-writing-translation-01.js';
import { g6U2TrapLesson as lesson17 } from './g6-u2-trap-mixed-easy-01.js';
import { g6U2TrapLesson as lesson18 } from './g6-u2-trap-mixed-medium-01.js';
import { g6U2TrapLesson as lesson19 } from './g6-u2-trap-mixed-hard-01.js';
import { g6U2TrapPronunciationSource } from './g6-u2-trap-pronunciation.js';
import { g6U2TrapCommunicationSource } from './g6-u2-trap-communication.js';

export const g6U2TrapSource = Object.freeze([
  lesson01,
  lesson02,
  lesson03,
  lesson04,
  lesson05,
  lesson06,
  lesson07,
  lesson08,
  lesson09,
  lesson10,
  lesson11,
  lesson12,
  lesson13,
  lesson14,
  lesson15,
  lesson16,
  ...g6U2TrapPronunciationSource,
  ...g6U2TrapCommunicationSource,
  lesson17,
  lesson18,
  lesson19,
]);

export const g6U2TrapSourceByKey = Object.freeze(Object.fromEntries(
  g6U2TrapSource.map(lesson => [lesson.key, lesson])
));
