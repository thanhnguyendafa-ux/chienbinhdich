import { g6U2TrapSource } from './g6-u2-trap-source.js';
import { getG6U2TrapContent } from './g6-u2-trap-content.js';

const GRADE3_TITLES = Object.freeze({
  'vocab-odd-01': 'Từ nào khác nhóm?',
  'vocab-context-01': 'Chọn từ đúng câu',
  'vocab-category-01': 'Ghép từ đúng nghĩa',
  'grammar-there-01': 'There is / There are',
  'grammar-have-there-01': 'Have / Has hay There is / are',
  'grammar-preposition-01': 'Từ chỉ vị trí',
  'grammar-suggestion-01': "How about / Let's",
  'grammar-description-01': 'Tả phòng: is / because / but / often',
  'reading-tf-01': 'Đọc: Đúng hay Sai',
  'reading-detail-01': 'Đọc: Số và chi tiết',
  'reading-wh-01': 'Đọc: Đề đang hỏi gì?',
  'reading-reference-01': 'Đọc: it / them / one',
  'writing-reorder-01': 'Viết: Xếp từ đúng',
  'writing-error-01': 'Viết: Tìm chỗ sai',
  'writing-rewrite-01': 'Viết: Viết lại câu',
  'writing-translation-01': 'Viết: Việt → Anh',
  'pronunciation-s-01': 'Âm cuối -s',
  'communication-01': 'Chọn câu đáp lại',
  'mixed-easy-01': 'Tổng hợp · Dễ',
  'mixed-medium-01': 'Tổng hợp · Vừa',
  'mixed-hard-01': 'Tổng hợp · Khó'
});

export const g6U2TrapFolders = Object.freeze([
  Object.freeze({
    id: 'global6-unit2-exam-traps',
    name: 'Bẫy đề thi · Vì sao sai?',
    description: 'Xem một bài làm sai rồi chọn: Sai – Sửa – Vì.',
    parentId: 'global6-unit2',
    order: 2
  }),
  Object.freeze({ id:'global6-unit2-trap-vocab', name:'01 · Từ vựng', description:'Nhóm từ, chọn từ đúng câu và ghép từ đúng nghĩa.', parentId:'global6-unit2-exam-traps', order:1 }),
  Object.freeze({ id:'global6-unit2-trap-grammar', name:'02 · Ngữ pháp', description:'There is/are, have/has, vị trí, lời đề nghị và câu tả.', parentId:'global6-unit2-exam-traps', order:2 }),
  Object.freeze({ id:'global6-unit2-trap-reading', name:'03 · Đọc hiểu', description:'Đúng/Sai, số và chi tiết, câu hỏi và it/them/one.', parentId:'global6-unit2-exam-traps', order:3 }),
  Object.freeze({ id:'global6-unit2-trap-writing', name:'04 · Viết', description:'Xếp từ, tìm lỗi, viết lại và Việt → Anh.', parentId:'global6-unit2-exam-traps', order:4 }),
  Object.freeze({ id:'global6-unit2-trap-pronunciation', name:'05 · Phát âm', description:'Âm cuối -s: /s/ và /z/.', parentId:'global6-unit2-exam-traps', order:5 }),
  Object.freeze({ id:'global6-unit2-trap-communication', name:'06 · Giao tiếp', description:'Chọn câu đáp lại phù hợp.', parentId:'global6-unit2-exam-traps', order:6 }),
  Object.freeze({ id:'global6-unit2-trap-mixed', name:'07 · Tổng hợp', description:'Dễ → Vừa → Khó.', parentId:'global6-unit2-exam-traps', order:7 })
]);

export const g6U2TrapRegistry = Object.freeze(g6U2TrapSource.map(source => {
  const itemCount = getG6U2TrapContent(source.key).items.length;
  return Object.freeze({
    id: `g6-u2-trap-${source.key}`,
    folderId: source.folderId,
    order: source.order,
    version: 2,
    course: 'Global Success 6',
    unit: 'Unit 2 · My House',
    title: GRADE3_TITLES[source.key] ?? source.title,
    subtitle: 'Chọn: Sai – Sửa – Vì',
    expectedTimeMinutes: source.expectedTimeMinutes,
    difficulty: source.difficulty,
    lessonSlug: `g6u2-trap-${source.key}`,
    passThreshold: 80,
    completionPolicy: 'all-items',
    teacher: 'Thầy Thành MRT',
    description: `${itemCount} câu. Mỗi câu có 6 cách giải thích ngắn. Vị trí A–F được tráo theo từng lượt.`,
    activityTypes: Object.freeze(['mcq']),
    itemCount,
    loadContent: () => import('./g6-u2-trap-content.js').then(module => module.getG6U2TrapContent(source.key))
  });
}));
