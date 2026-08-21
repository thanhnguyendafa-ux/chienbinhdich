import { g6U2TrapSource } from './g6-u2-trap-source.js';
import { getG6U2TrapContent } from './g6-u2-trap-content.js';

export const g6U2TrapFolders = Object.freeze([
  Object.freeze({
    id: 'global6-unit2-exam-traps',
    name: 'Bẫy đề thi · Vì sao sai?',
    description: 'Chẩn đoán một bài làm sai: xác định lỗi → cách sửa → lý do. Không Listening.',
    parentId: 'global6-unit2',
    order: 2
  }),
  Object.freeze({ id:'global6-unit2-trap-vocab', name:'01 · Vocabulary', description:'Odd one out, context word và quan hệ từ vựng trong Unit 2.', parentId:'global6-unit2-exam-traps', order:1 }),
  Object.freeze({ id:'global6-unit2-trap-grammar', name:'02 · Grammar', description:'There is/are, have/has, giới từ, lời đề nghị và mô tả.', parentId:'global6-unit2-exam-traps', order:2 }),
  Object.freeze({ id:'global6-unit2-trap-reading', name:'03 · Reading', description:'True/False, detail & number, WH, paraphrase & reference.', parentId:'global6-unit2-exam-traps', order:3 }),
  Object.freeze({ id:'global6-unit2-trap-writing', name:'04 · Writing', description:'Reorder, tìm lỗi, rewrite và Việt → Anh.', parentId:'global6-unit2-exam-traps', order:4 }),
  Object.freeze({ id:'global6-unit2-trap-pronunciation', name:'05 · Pronunciation', description:'Final -s /s/ và /z/ bằng đúng bộ từ Unit 2.', parentId:'global6-unit2-exam-traps', order:5 }),
  Object.freeze({ id:'global6-unit2-trap-communication', name:'06 · Communication', description:'Suggestion & response theo đúng dialogue Unit 2.', parentId:'global6-unit2-exam-traps', order:6 }),
  Object.freeze({ id:'global6-unit2-trap-mixed', name:'07 · Mixed Challenge', description:'Easy → Medium → Hard; đúng fact nhưng sai quan hệ/evidence.', parentId:'global6-unit2-exam-traps', order:7 })
]);

export const g6U2TrapRegistry = Object.freeze(g6U2TrapSource.map(source => {
  const itemCount = getG6U2TrapContent(source.key).items.length;
  return Object.freeze({
    id: `g6-u2-trap-${source.key}`,
    folderId: source.folderId,
    order: source.order,
    version: 1,
    course: 'Global Success 6',
    unit: 'Unit 2 · My House',
    title: source.title,
    subtitle: 'MCQ · Bẫy đề thi · Vì sao sai?',
    expectedTimeMinutes: source.expectedTimeMinutes,
    difficulty: source.difficulty,
    lessonSlug: `g6u2-trap-${source.key}`,
    passThreshold: 80,
    completionPolicy: 'all-items',
    teacher: 'Thầy Thành MRT',
    description: `${itemCount} tình huống: xem một bài làm sai rồi chọn đúng gói “Sai ở → Sửa → Vì”. Sáu lựa chọn được tráo vị trí theo từng lượt.`,
    activityTypes: Object.freeze(['mcq']),
    itemCount,
    loadContent: () => import('./g6-u2-trap-content.js').then(module => module.getG6U2TrapContent(source.key))
  });
}));
