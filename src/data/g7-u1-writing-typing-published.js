import { g7U1WritingFolders, g7U1WritingRegistry as baseRegistry } from './g7-u1-writing-typing-catalog.js';
import { g7U1WritingScaffoldItemCounts } from './g7-u1-writing-scaffold-meta.js';

export { g7U1WritingFolders };

export const g7U1WritingRegistry = Object.freeze(baseRegistry.map(descriptor => {
  const key = descriptor.id.replace('g7-u1-writing-', '');
  const itemCount = g7U1WritingScaffoldItemCounts[key];
  if (!Number.isInteger(itemCount)) throw new Error(`Thiếu itemCount scaffold cho ${descriptor.id}`);
  return Object.freeze({
    ...descriptor,
    itemCount,
    description: `${itemCount} lượt Typing theo WORD → PHRASE → SENTENCE; WORD stage tự bổ sung lexical material xuất hiện ở PHRASE/SENTENCE để tránh cold words. Expected time: ${descriptor.expectedTimeMinutes} phút.`
  });
}));
