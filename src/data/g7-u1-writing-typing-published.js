import { g7U1WritingFolders, g7U1WritingRegistry as baseRegistry } from './g7-u1-writing-typing-catalog.js';
import { getG7U1WritingTypingContent } from './g7-u1-writing-typing-content.js';

export { g7U1WritingFolders };

export const g7U1WritingRegistry = Object.freeze(baseRegistry.map(descriptor => {
  const key = descriptor.id.replace('g7-u1-writing-', '');
  const itemCount = getG7U1WritingTypingContent(key).items.length;
  return Object.freeze({
    ...descriptor,
    itemCount,
    description: `${itemCount} lượt Typing theo WORD → PHRASE → SENTENCE; WORD stage giữ nguyên surface form xuất hiện ở PHRASE/SENTENCE để không bắt học sinh tự biến đổi từ. Expected time: ${descriptor.expectedTimeMinutes} phút.`
  });
}));
