import { gs67SentenceOrderThinkingContent } from './gs67-sentence-order-thinking-content.js';

export const gs67SentenceOrderThinkingFolders = Object.freeze([]);

export const gs67SentenceOrderThinkingRegistry = Object.freeze([
  Object.freeze({
    id: 'gs67-sentence-order-thinking',
    folderId: 'global6-unit-review',
    order: 90,
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
