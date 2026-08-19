import { g5U3WritingSource } from './g5-u3-writing-source.js';
import { getG5U3WritingTypingContent } from './g5-u3-writing-typing-content.js';

export const g5U3WritingFolders = Object.freeze([
  Object.freeze({ id: 'global5-unit3', name: 'Unit 3 · My Foreign Friends', description: 'Bài luyện Global Success 5 Unit 3 theo transcript: bạn bè quốc tế, quốc tịch, tính cách và hành động minh họa tính cách.', parentId: 'global5', order: 3 }),
  Object.freeze({ id: 'global5-unit3-writing-typing', name: 'Writing · Sentence Builder', description: '1 Quick Bank + 18 mini lessons Typing Việt → Anh; transcript-first, không lộ nguyên đáp án trước FINAL.', parentId: 'global5-unit3', order: 1 }),
  Object.freeze({ id: 'global5-unit3-writing-qb', name: '0 · Quick Bank · Country & Nationality', description: 'Làm quen country → nationality trong transcript; không có FINAL sentence.', parentId: 'global5-unit3-writing-typing', order: 1 }),
  Object.freeze({ id: 'global5-unit3-writing-origin', name: '1 · Friend & Origin', description: 'Giới thiệu foreign friend và hỏi/đáp nơi đến từ.', parentId: 'global5-unit3-writing-typing', order: 2 }),
  Object.freeze({ id: 'global5-unit3-writing-nationality', name: '2 · Nationality', description: 'Country ≠ nationality; hỏi và trả lời quốc tịch.', parentId: 'global5-unit3-writing-typing', order: 3 }),
  Object.freeze({ id: 'global5-unit3-writing-personality', name: '3 · Personality', description: 'What ... like? và adjective friendly/helpful/clever/active.', parentId: 'global5-unit3-writing-typing', order: 4 }),
  Object.freeze({ id: 'global5-unit3-writing-evidence', name: '4 · Action shows personality', description: 'Hành động trong transcript làm bằng chứng cho helpful/active/clever.', parentId: 'global5-unit3-writing-typing', order: 5 }),
  Object.freeze({ id: 'global5-unit3-writing-be', name: '5 · BE Question & Short Answer', description: 'Is she active? và short answer với BE.', parentId: 'global5-unit3-writing-typing', order: 6 })
]);

const folderByOrder = Object.freeze({
  1: 'global5-unit3-writing-origin', 2: 'global5-unit3-writing-origin', 3: 'global5-unit3-writing-origin',
  4: 'global5-unit3-writing-nationality', 5: 'global5-unit3-writing-nationality', 6: 'global5-unit3-writing-nationality', 7: 'global5-unit3-writing-nationality',
  8: 'global5-unit3-writing-personality', 9: 'global5-unit3-writing-personality', 10: 'global5-unit3-writing-personality', 11: 'global5-unit3-writing-personality', 12: 'global5-unit3-writing-personality', 13: 'global5-unit3-writing-personality',
  14: 'global5-unit3-writing-evidence', 15: 'global5-unit3-writing-evidence', 16: 'global5-unit3-writing-evidence',
  17: 'global5-unit3-writing-be', 18: 'global5-unit3-writing-be'
});

const safeTitleByOrder = Object.freeze({
  1: 'Người bạn nước ngoài',
  2: 'Đến từ đâu?',
  3: 'Đến từ Úc',
  4: 'Quốc tịch bạn nam',
  5: 'Người Úc',
  6: 'Quốc tịch bạn nữ',
  7: 'Người Nhật',
  8: 'Hỏi tính cách bạn nữ',
  9: 'Thân thiện',
  10: 'Hay giúp đỡ',
  11: 'Hỏi tính cách bạn nam',
  12: 'Thông minh',
  13: 'Năng động',
  14: 'Giúp đỡ bạn bè',
  15: 'Đang chơi cầu lông',
  16: 'Học nhanh',
  17: 'Có năng động không?',
  18: 'Trả lời Có với BE'
});

const quickBank = Object.freeze({
  id: 'g5-u3-writing-quick-bank',
  folderId: 'global5-unit3-writing-qb',
  order: 0,
  version: 1,
  course: 'Global Success 5',
  unit: 'Unit 3 · My Foreign Friends',
  title: '00 · Quick Bank · Country & Nationality',
  subtitle: 'Typing · Country → Nationality · Transcript Warm-up',
  expectedTimeMinutes: 4,
  difficulty: 'easy',
  lessonSlug: 'g5u3-writing-qb',
  passThreshold: 80,
  completionPolicy: 'all-items',
  typingTolerance: false,
  teacher: 'Thầy Thành MRT',
  description: '14 lượt SEE/RECALL làm quen country và nationality trong Unit 3; không có FINAL sentence.',
  activityTypes: Object.freeze(['typing']),
  itemCount: getG5U3WritingTypingContent('qb').items.length,
  loadContent: () => import('./g5-u3-writing-typing-content.js').then(module => module.getG5U3WritingTypingContent('qb'))
});

const mainRegistry = g5U3WritingSource.map(source => {
  const key = String(source.order).padStart(2, '0');
  const itemCount = getG5U3WritingTypingContent(key).items.length;
  return Object.freeze({
    id: `g5-u3-writing-typing-${key}`,
    folderId: folderByOrder[source.order],
    order: source.order,
    version: 1,
    course: 'Global Success 5',
    unit: 'Unit 3 · My Foreign Friends',
    title: `${key} · ${safeTitleByOrder[source.order]}`,
    subtitle: 'Typing · Việt → Anh · Transcript-first · Không lộ FINAL',
    expectedTimeMinutes: source.expectedTimeMinutes,
    difficulty: source.difficulty,
    lessonSlug: `g5u3-writing-${key}`,
    passThreshold: 80,
    completionPolicy: 'all-items',
    typingTolerance: false,
    teacher: 'Thầy Thành MRT',
    description: `${itemCount} lượt Typing; học từ/chunk và bridge cần thiết rồi tự dựng một FINAL Unit 3. Dự kiến ${source.expectedTimeMinutes} phút.`,
    activityTypes: Object.freeze(['typing']),
    itemCount,
    targetSentenceId: source.id,
    loadContent: () => import('./g5-u3-writing-typing-content.js').then(module => module.getG5U3WritingTypingContent(key))
  });
});

export const g5U3WritingRegistry = Object.freeze([quickBank, ...mainRegistry]);
