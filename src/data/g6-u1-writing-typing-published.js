import { g6U1WritingFolders as baseFolders, g6U1WritingRegistry as baseRegistry } from './g6-u1-writing-typing-catalog.js';
import { getG6U1WritingTypingContent } from './g6-u1-writing-typing-content.js';

const unit1Folder = Object.freeze({
  id: 'global6-unit1',
  name: 'Unit 1 · My New School',
  description: 'Kho bài Global Success 6 Unit 1 · My New School, gồm bài theo nguồn và chương trình Writing Typing.',
  parentId: 'global6',
  order: 1
});

export const g6U1WritingFolders = Object.freeze(baseFolders.flatMap(folder => {
  if (folder.id === 'global6') return [folder, unit1Folder];
  if (folder.id === 'global6-unit1-writing-typing') {
    return [Object.freeze({ ...folder, parentId: 'global6-unit1', order: 2 })];
  }
  return [folder];
}));

export const g6U1WritingRegistry = Object.freeze(baseRegistry.map(descriptor => {
  const key = descriptor.id.replace('g6-u1-writing-', '');
  const itemCount = getG6U1WritingTypingContent(key).items.length;
  return Object.freeze({
    ...descriptor,
    itemCount,
    description: `${itemCount} lượt Typing theo WORD → PHRASE → SENTENCE; WORD stage giữ nguyên surface form xuất hiện ở PHRASE/SENTENCE để không bắt học sinh tự biến đổi từ. Expected time: ${descriptor.expectedTimeMinutes} phút.`
  });
}));
