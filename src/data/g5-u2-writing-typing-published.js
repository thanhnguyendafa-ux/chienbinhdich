import { g5U2WritingFolders, g5U2WritingRegistry as baseRegistry } from './g5-u2-writing-typing-catalog.js';
import { getG5U2WritingTypingContent } from './g5-u2-writing-typing-content.js';

export { g5U2WritingFolders };

export const g5U2WritingRegistry = Object.freeze(baseRegistry.map(descriptor => {
  const key = descriptor.id.replace('g5-u2-writing-typing-', '');
  const itemCount = getG5U2WritingTypingContent(key).items.length;
  return Object.freeze({
    ...descriptor,
    itemCount,
    description: `${itemCount} lượt Typing theo NHÌN & CHÉP → RECALL → CHUNK → BUILD/BRIDGE → FINAL; bài mở độc lập kể cả khi học sinh quên từ. Dự kiến ${descriptor.expectedTimeMinutes} phút.`
  });
}));
