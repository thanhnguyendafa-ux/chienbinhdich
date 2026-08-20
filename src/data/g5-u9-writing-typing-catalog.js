import { g5U9WritingLessonMeta, getG5U9WritingTypingContent } from './g5-u9-writing-typing-content.js';
export const g5U9WritingFolders = Object.freeze([
  Object.freeze({ id: 'global5-unit9', name: 'Unit 9 · Our Outdoor Activities', description: 'Global Success 5 Unit 9 typing/writing.', parentId: 'global5', order: 9 }),
  Object.freeze({ id: 'global5-unit9-writing-typing', name: 'Writing · Việt → Anh · No Hint', description: 'Word → Phrase → Sentence; Submit → giải thích → Chấp nhận.', parentId: 'global5-unit9', order: 1 })
]);
export const g5U9WritingRegistry = Object.freeze(g5U9WritingLessonMeta.map(meta => Object.freeze({
  id: `g5-u9-writing-typing-${meta.key}`,
  folderId: 'global5-unit9-writing-typing',
  order: meta.order, version: 1,
  course: 'Global Success 5',
  unit: 'Unit 9 · Our Outdoor Activities',
  title: `${meta.key} · ${meta.title}`,
  subtitle: 'Typing · Việt → Anh · Không gợi ý · Đọc giải thích → Chấp nhận',
  expectedTimeMinutes: Math.min(20, Math.max(2, Math.ceil(meta.itemCount * 0.75))),
  difficulty: meta.itemCount <= 5 ? 'easy' : meta.itemCount <= 9 ? 'medium' : 'hard',
  lessonSlug: `g5u9-writing-${meta.key}`,
  passThreshold: 80,
  completionPolicy: 'explain-and-accept',
  typingTolerance: true,
  teacher: 'Thầy Thành MRT',
  description: `${meta.itemCount} lượt Typing độc lập. Trước Submit chỉ hiện tiếng Việt; sau Submit hiện đáp án + giải thích và học sinh bấm Chấp nhận.`,
  activityTypes: Object.freeze(['typing']),
  itemCount: meta.itemCount,
  loadContent: () => import('./g5-u9-writing-typing-content.js').then(m => m.getG5U9WritingTypingContent(meta.key))
})));
