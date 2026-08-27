import { g6U1VocabTypingGroups } from './g6-u1-vocab-typing-content.js';

export const g6U1VocabTypingFolders = Object.freeze([
  Object.freeze({
    id: 'global6-unit1-vocab-typing',
    name: 'Vocab & Phrase Typing',
    description: '8 bài Typing Việt → Anh bám 193 từ/cụm từ Global 6 Unit 1; mỗi prompt hiển thị nghĩa tiếng Việt và ví dụ tiếng Việt dễ hiểu, học sinh tự gõ phần tiếng Anh.',
    parentId: 'global6-unit1',
    order: 5
  })
]);

const LESSONS = Object.freeze([
  Object.freeze({ group: 1, title: '01 · People & School Places', expectedTimeMinutes: 19 }),
  Object.freeze({ group: 2, title: '02 · Subjects & Learning', expectedTimeMinutes: 24 }),
  Object.freeze({ group: 3, title: '03 · School Things & Objects', expectedTimeMinutes: 13 }),
  Object.freeze({ group: 4, title: '04 · School Routines & Rules', expectedTimeMinutes: 16 }),
  Object.freeze({ group: 5, title: '05 · Time & Frequency', expectedTimeMinutes: 13 }),
  Object.freeze({ group: 6, title: '06 · Activities & Hobbies', expectedTimeMinutes: 15 }),
  Object.freeze({ group: 7, title: '07 · People, Feelings & Communication', expectedTimeMinutes: 13 }),
  Object.freeze({ group: 8, title: '08 · High-Value Collocations & Patterns', expectedTimeMinutes: 17 })
]);

function descriptor(spec) {
  const data = g6U1VocabTypingGroups[spec.group];
  return Object.freeze({
    id: `g6-u1-vocab-typing-${String(spec.group).padStart(2, '0')}`,
    folderId: 'global6-unit1-vocab-typing',
    order: spec.group,
    version: 1,
    course: 'Global Success 6',
    unit: 'Unit 1 · My New School',
    title: spec.title,
    subtitle: 'Vocab & Phrase Typing · Nghĩa Việt + ví dụ Việt → gõ tiếng Anh',
    expectedTimeMinutes: spec.expectedTimeMinutes,
    lessonSlug: `g6-u1-vocab-typing-${String(spec.group).padStart(2, '0')}`,
    passThreshold: 80,
    completionPolicy: 'all-items',
    typingTolerance: false,
    teacher: 'Thầy Thành MRT',
    description: `${data.items.length} mục · ${data.tier2Count} Tier 2 + ${data.tier3Count} Tier 3 · English ẩn trước Submit; prompt chỉ hiện nghĩa và ví dụ tiếng Việt dễ hiểu.`,
    activityTypes: Object.freeze(['typing']),
    itemCount: data.items.length,
    loadContent: () => Promise.resolve(Object.freeze({ items: data.items }))
  });
}

export const g6U1VocabTypingRegistry = Object.freeze(LESSONS.map(descriptor));
