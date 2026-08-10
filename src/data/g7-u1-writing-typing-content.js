import { g7U1WritingPart1 } from './g7-u1-writing-typing-part1.js';
import { g7U1WritingPart2 } from './g7-u1-writing-typing-part2.js';
import { g7U1WritingPart3 } from './g7-u1-writing-typing-part3.js';
import { g7U1WritingPart4 } from './g7-u1-writing-typing-part4.js';
import { g7U1WritingPart5 } from './g7-u1-writing-typing-part5.js';
import { g7U1WritingPart6 } from './g7-u1-writing-typing-part6.js';
import { g7U1WritingPart7 } from './g7-u1-writing-typing-part7.js';
import { g7U1WritingPart8 } from './g7-u1-writing-typing-part8.js';
import { g7U1WritingPart9 } from './g7-u1-writing-typing-part9.js';
import { g7U1WritingPart10 } from './g7-u1-writing-typing-part10.js';
import { g7U1WritingPart11 } from './g7-u1-writing-typing-part11.js';
export { g7U1SourceSentences } from './g7-u1-writing-source.js';

export const g7U1WritingTypingContents = Object.freeze({
  ...g7U1WritingPart1,
  ...g7U1WritingPart2,
  ...g7U1WritingPart3,
  ...g7U1WritingPart4,
  ...g7U1WritingPart5,
  ...g7U1WritingPart6,
  ...g7U1WritingPart7,
  ...g7U1WritingPart8,
  ...g7U1WritingPart9,
  ...g7U1WritingPart10,
  ...g7U1WritingPart11,
});

export function getG7U1WritingTypingContent(key) {
  const content = g7U1WritingTypingContents[String(key)];
  if (!content) throw new Error(`Không tìm thấy Global 7 Unit 1 Writing Typing content: ${key}`);
  return content;
}
