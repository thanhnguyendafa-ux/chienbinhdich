import { g6U1WritingPart1 } from './g6-u1-writing-typing-part1.js';
import { g6U1WritingPart2 } from './g6-u1-writing-typing-part2.js';
import { g6U1WritingPart3 } from './g6-u1-writing-typing-part3.js';
import { g6U1WritingPart4 } from './g6-u1-writing-typing-part4.js';
import { g6U1WritingPart5 } from './g6-u1-writing-typing-part5.js';
import { g6U1WritingPart6 } from './g6-u1-writing-typing-part6.js';
import { g6U1WritingPart7 } from './g6-u1-writing-typing-part7.js';
import { g6U1WritingPart8 } from './g6-u1-writing-typing-part8.js';
import { g6U1WritingPart9 } from './g6-u1-writing-typing-part9.js';
import { g6U1WritingPart10 } from './g6-u1-writing-typing-part10.js';
export { g6U1SourceSentences } from './g6-u1-writing-source.js';

export const g6U1WritingTypingContents = Object.freeze({
  ...g6U1WritingPart1,
  ...g6U1WritingPart2,
  ...g6U1WritingPart3,
  ...g6U1WritingPart4,
  ...g6U1WritingPart5,
  ...g6U1WritingPart6,
  ...g6U1WritingPart7,
  ...g6U1WritingPart8,
  ...g6U1WritingPart9,
  ...g6U1WritingPart10,
});

export function getG6U1WritingTypingContent(key) {
  const content = g6U1WritingTypingContents[String(key)];
  if (!content) throw new Error(`Không tìm thấy Global 6 Unit 1 Writing Typing content: ${key}`);
  return content;
}
