import { g6U1WritingFolders, g6U1WritingRegistry as baseRegistry } from './g6-u1-writing-typing-catalog.js';
import { getG6U1WritingTypingContent } from './g6-u1-writing-typing-content.js';

export { g6U1WritingFolders };

export const g6U1WritingRegistry = Object.freeze(baseRegistry.map(descriptor => {
  const key = descriptor.id.replace('g6-u1-writing-', '');
  const itemCount = getG6U1WritingTypingContent(key).items.length;
  return Object.freeze({
    ...descriptor,
    itemCount,
    description: `${itemCount} lượt Typing theo WORD → PHRASE → SENTENCE; WORD stage giữ nguyên surface form xuất hiện ở PHRASE/SENTENCE để không bắt học sinh tự biến đổi từ. Expected time: ${descriptor.expectedTimeMinutes} phút.`
  });
}));
