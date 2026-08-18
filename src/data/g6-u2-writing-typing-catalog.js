import { g6U2WritingSource } from './g6-u2-writing-source.js';
import { getG6U2WritingTypingContent } from './g6-u2-writing-typing-content.js';

export const g6U2WritingFolders = Object.freeze([
  Object.freeze({ id: 'global6-unit2', name: 'Unit 2 · My House', description: 'Kho bài Global Success 6 Unit 2 · My House.', parentId: 'global6', order: 2 }),
  Object.freeze({ id: 'global6-unit2-writing-sentence-builder', name: 'Writing · Sentence Builder', description: '16 mini writing lessons: cue rõ surface form → chunk → sentence part → full target.', parentId: 'global6-unit2', order: 1 }),
  Object.freeze({ id: 'global6-unit2-writing-s1', name: 'Cấu trúc 1 · Possessive', description: 'Sở hữu trong chính target sentence, không dạy công thức trừu tượng.', parentId: 'global6-unit2-writing-sentence-builder', order: 1 }),
  Object.freeze({ id: 'global6-unit2-writing-s2', name: 'Cấu trúc 2 · Prepositions of Place', description: 'behind / next to với cue xác định article rõ ràng.', parentId: 'global6-unit2-writing-sentence-builder', order: 2 }),
  Object.freeze({ id: 'global6-unit2-writing-s3', name: 'Cấu trúc 3 · There is / There are', description: 'Dựng cảnh và contents của house / bedroom.', parentId: 'global6-unit2-writing-sentence-builder', order: 3 }),
  Object.freeze({ id: 'global6-unit2-writing-s4', name: 'Cấu trúc 4 · Have / Has', description: 'Chủ thể có gì, phân biệt meaning core với There is / There are.', parentId: 'global6-unit2-writing-sentence-builder', order: 4 }),
  Object.freeze({ id: 'global6-unit2-writing-s5', name: 'Cấu trúc 5 · Live & Routine', description: 'Where / Who questions, place, people and routine.', parentId: 'global6-unit2-writing-sentence-builder', order: 5 }),
  Object.freeze({ id: 'global6-unit2-writing-s6', name: 'Cấu trúc 6 · Description & Because', description: 'Mô tả phòng và nêu lý do yêu thích.', parentId: 'global6-unit2-writing-sentence-builder', order: 6 })
]);

const folderByOrder = Object.freeze({
  1: 'global6-unit2-writing-s1',
  2: 'global6-unit2-writing-s2', 3: 'global6-unit2-writing-s2',
  4: 'global6-unit2-writing-s3', 5: 'global6-unit2-writing-s3', 6: 'global6-unit2-writing-s3', 7: 'global6-unit2-writing-s3',
  8: 'global6-unit2-writing-s4', 9: 'global6-unit2-writing-s4',
  10: 'global6-unit2-writing-s5', 11: 'global6-unit2-writing-s5', 12: 'global6-unit2-writing-s5', 13: 'global6-unit2-writing-s5', 14: 'global6-unit2-writing-s5',
  15: 'global6-unit2-writing-s6', 16: 'global6-unit2-writing-s6'
});

export const g6U2WritingRegistry = Object.freeze(g6U2WritingSource.map(source => {
  const key = String(source.order).padStart(2, '0');
  const itemCount = getG6U2WritingTypingContent(key).items.length;
  return Object.freeze({
    id: `g6-u2-writing-${key}`,
    folderId: folderByOrder[source.order],
    order: source.order,
    version: 1,
    course: 'Global Success 6',
    unit: 'Unit 2 · My House',
    title: `${key} · ${source.targetSentence}`,
    subtitle: 'Typing · Việt → Anh · CHUNK → SENTENCE',
    expectedTimeMinutes: source.expectedTimeMinutes,
    difficulty: source.difficulty,
    lessonSlug: `g6u2-writing-${key}`,
    passThreshold: 80,
    completionPolicy: 'all-items',
    typingTolerance: false,
    teacher: 'Thầy Thành MRT',
    description: `${itemCount} lượt Typing dựng đúng một target sentence; cue Việt khóa article/determiner/surface form để học sinh không phải đoán.`,
    activityTypes: Object.freeze(['typing']),
    itemCount,
    targetSentenceId: source.id,
    loadContent: () => import('./g6-u2-writing-typing-content.js').then(module => module.getG6U2WritingTypingContent(key))
  });
}));
