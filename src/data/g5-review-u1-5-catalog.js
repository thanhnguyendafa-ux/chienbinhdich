export const g5ReviewU15Folders = Object.freeze([
  Object.freeze({
    id: 'global5-review-u1-5',
    name: 'Review Unit 1–5',
    description: '10 bài Mixed Grammar Traps trộn Unit 1–5, vocabulary core, grammar traps và nhiều dạng câu hỏi trong mỗi bài.',
    parentId: 'global5',
    order: 50
  })
]);

function descriptor({ key, order, title, expectedTimeMinutes, difficulty }) {
  return Object.freeze({
    id: `g5-review-u1-5-${key}`,
    folderId: 'global5-review-u1-5',
    order,
    version: 1,
    course: 'Global Success 5',
    unit: 'Review Unit 1–5',
    title,
    subtitle: 'Mixed · Grammar traps · Vocab in context · Reorder có nhiễu',
    expectedTimeMinutes,
    lessonSlug: `g5-review-u1-5-mixed-${key}`,
    passThreshold: 80,
    completionPolicy: 'all-items',
    typingTolerance: false,
    difficulty,
    teacher: 'Thầy Thành MRT',
    description: `12 nhiệm vụ trộn U1–U5: MCQ, Typing, Grammar Cloze, Vocabulary Context Cloze, True/False, Classification, Error Correction, Transformation và Sentence Order có distractor. Expected time: ${expectedTimeMinutes} phút.`,
    activityTypes: Object.freeze(['typing', 'mcq', 'true_false', 'sentence_order', 'classification']),
    itemCount: 12,
    loadContent: () => import('./g5-review-u1-5-content.js').then(module => module.getG5ReviewU15MixedContent(key))
  });
}

export const g5ReviewU15Registry = Object.freeze([
  descriptor({ key: '01', order: 1, title: 'Mixed Grammar Traps 01 · Foundation Mix', expectedTimeMinutes: 16, difficulty: 'easy' }),
  descriptor({ key: '02', order: 2, title: 'Mixed Grammar Traps 02 · Core Contrast', expectedTimeMinutes: 16, difficulty: 'easy' }),
  descriptor({ key: '03', order: 3, title: 'Mixed Grammar Traps 03 · Marker & Meaning', expectedTimeMinutes: 17, difficulty: 'easy' }),
  descriptor({ key: '04', order: 4, title: 'Mixed Grammar Traps 04 · Cross-Unit Switch', expectedTimeMinutes: 17, difficulty: 'medium' }),
  descriptor({ key: '05', order: 5, title: 'Mixed Grammar Traps 05 · Double-Marking Lab', expectedTimeMinutes: 18, difficulty: 'medium' }),
  descriptor({ key: '06', order: 6, title: 'Mixed Grammar Traps 06 · Context & Architecture', expectedTimeMinutes: 18, difficulty: 'medium' }),
  descriptor({ key: '07', order: 7, title: 'Mixed Grammar Traps 07 · Hidden Rules', expectedTimeMinutes: 19, difficulty: 'medium' }),
  descriptor({ key: '08', order: 8, title: 'Mixed Grammar Traps 08 · No Labels', expectedTimeMinutes: 19, difficulty: 'hard' }),
  descriptor({ key: '09', order: 9, title: 'Mixed Grammar Traps 09 · Hard Switch', expectedTimeMinutes: 20, difficulty: 'hard' }),
  descriptor({ key: '10', order: 10, title: 'Mixed Grammar Traps 10 · Final U1–5 Challenge', expectedTimeMinutes: 20, difficulty: 'hard' })
]);
