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
  Object.freeze({ group: 2, title: '02 · Subjects & Learning', expectedTimeMinutes: 20 }),
  Object.freeze({ group: 3, title: '03 · School Things & Objects', expectedTimeMinutes: 13 }),
  Object.freeze({ group: 4, title: '04 · School Routines & Rules', expectedTimeMinutes: 16 }),
  Object.freeze({ group: 5, title: '05 · Time & Frequency', expectedTimeMinutes: 13 }),
  Object.freeze({ group: 6, title: '06 · Activities & Hobbies', expectedTimeMinutes: 15 }),
  Object.freeze({ group: 7, title: '07 · People, Feelings & Communication', expectedTimeMinutes: 13 }),
  Object.freeze({ group: 8, title: '08 · High-Value Collocations & Patterns', expectedTimeMinutes: 17 })
]);

const TYPING_UI = Object.freeze({
  promptLabel: 'Gõ phần tiếng Anh',
  contextLabel: 'Nghĩa tiếng Việt',
  instruction: 'Dựa vào nghĩa và ví dụ tiếng Việt, gõ đúng từ hoặc cụm từ tiếng Anh.',
  inputLabel: 'Từ hoặc cụm từ tiếng Anh',
  placeholder: 'Type the English word or phrase...'
});

const TYPING_SEPARATOR_TOLERANCE = true;
const TYPING_ERROR_MAP = true;

function productionItems(items) {
  return Object.freeze(items.map(item => Object.freeze({
    ...item,
    typingSeparatorTolerance: TYPING_SEPARATOR_TOLERANCE,
    typingErrorMap: TYPING_ERROR_MAP,
    typingUi: TYPING_UI
  })));
}

function descriptor(spec) {
  const data = g6U1VocabTypingGroups[spec.group];
  const items = productionItems(data.items);
  return Object.freeze({
    id: `g6-u1-vocab-typing-${String(spec.group).padStart(2, '0')}`,
    folderId: 'global6-unit1-vocab-typing',
    order: spec.group,
    version: 4,
    course: 'Global Success 6',
    unit: 'Unit 1 · My New School',
    title: spec.title,
    subtitle: 'Vocab & Phrase Typing · Nghĩa Việt + ví dụ Việt → gõ tiếng Anh',
    expectedTimeMinutes: spec.expectedTimeMinutes,
    lessonSlug: `g6-u1-vocab-typing-${String(spec.group).padStart(2, '0')}`,
    passThreshold: 80,
    completionPolicy: 'all-items',
    typingTolerance: false,
    typingSeparatorTolerance: TYPING_SEPARATOR_TOLERANCE,
    typingErrorMap: TYPING_ERROR_MAP,
    teacher: 'Thầy Thành MRT',
    description: `${items.length} mục · ${data.tier2Count} Tier 2 + ${data.tier3Count} Tier 3 · English ẩn trước Submit; nếu gõ sai, bản đồ lỗi xanh/đỏ hiện ngay để chỉ đúng vị trí cần sửa; bỏ thiếu khoảng trắng, dấu gạch nối hoặc dấu ? vẫn được chấm đúng nếu các chữ còn lại chính xác.`,
    activityTypes: Object.freeze(['typing']),
    itemCount: items.length,
    loadContent: () => Promise.resolve(Object.freeze({ items }))
  });
}

export const g6U1VocabTypingRegistry = Object.freeze(LESSONS.map(descriptor));
