import { g6U1WritingFolders, g6U1WritingRegistry as baseRegistry } from './g6-u1-writing-typing-catalog.js';
import { g6U1WritingScaffoldItemCounts } from './g6-u1-writing-scaffold-meta.js';

export { g6U1WritingFolders };

export const g6U1WritingRegistry = Object.freeze(baseRegistry.map(descriptor => {
  const key = descriptor.id.replace('g6-u1-writing-', '');
  const itemCount = g6U1WritingScaffoldItemCounts[key];
  if (!Number.isInteger(itemCount)) throw new Error(`Thiếu itemCount scaffold cho ${descriptor.id}`);
  return Object.freeze({
    ...descriptor,
    itemCount,
    description: `${itemCount} lượt Typing theo WORD → PHRASE → SENTENCE; WORD stage tự bổ sung lexical material xuất hiện ở PHRASE/SENTENCE để tránh cold words. Expected time: ${descriptor.expectedTimeMinutes} phút.`
  });
}));
