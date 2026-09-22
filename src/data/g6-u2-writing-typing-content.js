import { g6U2WritingPart1 } from './g6-u2-writing-typing-part1.js';
import { g6U2WritingPart2 } from './g6-u2-writing-typing-part2.js';
import { g6U2WritingPart3 } from './g6-u2-writing-typing-part3.js';
import { g6U2WritingPart4 } from './g6-u2-writing-typing-part4.js';
import { g6U2WritingPart5 } from './g6-u2-writing-typing-part5.js';
import { g6U2WritingPart6 } from './g6-u2-writing-typing-part6.js';
export { g6U2WritingSource, g6U2WritingSourceById } from './g6-u2-writing-source.js';

export const g6U2WritingTypingContents = Object.freeze({
  ...g6U2WritingPart1,
  ...g6U2WritingPart2,
  ...g6U2WritingPart3,
  ...g6U2WritingPart4,
  ...g6U2WritingPart5,
  ...g6U2WritingPart6
});

export function getG6U2WritingTypingContent(key) {
  const content = g6U2WritingTypingContents[String(key).padStart(2, '0')];
  if (!content) throw new Error(`Không tìm thấy Global 6 Unit 2 Writing Typing content: ${key}`);
  return content;
}
