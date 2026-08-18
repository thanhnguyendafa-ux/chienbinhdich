import { g5U1WritingFolders, g5U1WritingRegistry as baseRegistry } from './g5-u1-writing-typing-catalog.js';
import { getG5U1WritingTypingContent } from './g5-u1-writing-typing-content.js';

export { g5U1WritingFolders };

export const g5U1WritingRegistry = Object.freeze(baseRegistry.map(descriptor => {
  const key = descriptor.id.replace('g5-u1-writing-typing-', '');
  const itemCount = getG5U1WritingTypingContent(key).items.length;
  return Object.freeze({
    ...descriptor,
    itemCount,
    description: `${itemCount} lượt Typing theo NHÌN & CHÉP → RECALL → CHUNK → BUILD → FINAL; bài có thể mở độc lập kể cả khi học sinh quên từ. Dự kiến ${descriptor.expectedTimeMinutes} phút.`
  });
}));
