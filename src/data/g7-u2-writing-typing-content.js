import { g7U2WritingPart1 } from './g7-u2-writing-typing-part1.js';
import { g7U2WritingPart2 } from './g7-u2-writing-typing-part2.js';
import { g7U2WritingPart3 } from './g7-u2-writing-typing-part3.js';
import { g7U2WritingPart4 } from './g7-u2-writing-typing-part4.js';
import { g7U2WritingPart5 } from './g7-u2-writing-typing-part5.js';
import { g7U2WritingPart6 } from './g7-u2-writing-typing-part6.js';
export { g7U2WritingSource, g7U2WritingSourceById } from './g7-u2-writing-source.js';

export const g7U2WritingTypingContents = Object.freeze({
  ...g7U2WritingPart1,
  ...g7U2WritingPart2,
  ...g7U2WritingPart3,
  ...g7U2WritingPart4,
  ...g7U2WritingPart5,
  ...g7U2WritingPart6
});

export function getG7U2WritingTypingContent(key) {
  const content = g7U2WritingTypingContents[String(key).padStart(2, '0')];
  if (!content) throw new Error(`Không tìm thấy Global 7 Unit 2 Writing Typing content: ${key}`);
  return content;
}
