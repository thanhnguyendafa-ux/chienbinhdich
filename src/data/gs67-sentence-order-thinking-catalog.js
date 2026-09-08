import { gs67SentenceOrderThinkingContent } from './gs67-sentence-order-thinking-content.js';

export const gs67SentenceOrderThinkingFolders = Object.freeze([
  Object.freeze({
    id: 'gs67-sentence-skills',
    name: 'Global 6–7 · Sentence Skills',
    description: 'Kỹ năng phân tích cấu trúc trước khi sắp xếp từ/cụm thành câu.',
    parentId: null,
    order: 80
  })
]);

export const gs67SentenceOrderThinkingRegistry = Object.freeze([
  Object.freeze({
    id: 'gs67-sentence-order-thinking',
    folderId: 'gs67-sentence-skills',
    order: 1,
    version: 1,
    course: 'Global Success 6–7',
    unit: 'Sentence Order Skill',
    title: 'Sentence Order · Tư duy trước, sắp xếp sau',
    subtitle: '30 câu spiral · Loại câu → Helper → Subject → Main Verb → Reorder',
    expectedTimeMinutes: 20,
    lessonSlug: 'gs67-sentence-order-thinking',
    passThreshold: 80,
    completionPolicy: 'all-items',
    typingTolerance: false,
    difficulty: 'medium',
    teacher: 'Chiến Binh Dịch',
    description: '30 nhiệm vụ spiral giúp học sinh tự hình thành quy trình phân tích câu trước khi sắp xếp; có bắt lỗi DO/DOES, sửa lỗi, phân loại vai trò và full reorder.',
    activityTypes: Object.freeze(['mcq', 'true_false', 'typing', 'classification', 'sequence_number', 'sentence_order']),
    itemCount: 30,
    loadContent: async () => gs67SentenceOrderThinkingContent
  })
]);
