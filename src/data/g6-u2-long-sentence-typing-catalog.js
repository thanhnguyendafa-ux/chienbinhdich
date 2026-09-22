export const g6U2LongSentenceTypingRegistry = Object.freeze([
  Object.freeze({
    id: 'g6-u2-long-sentence-typing-01',
    folderId: 'global6-unit2-writing-s4',
    order: 90,
    version: 1,
    course: 'Global Success 6',
    unit: 'Unit 2 · My House',
    title: 'Câu dài 01 · HAS + vị trí',
    subtitle: 'Typing · Nhìn câu đích → CHUNK NGẮN → GHÉP CHỒNG → FULL SENTENCE',
    expectedTimeMinutes: 12,
    difficulty: 'hard',
    lessonSlug: 'g6u2-long-sentence-typing-01',
    passThreshold: 100,
    completionPolicy: 'all-items',
    typingTolerance: false,
    effortPassEnabled: false,
    teacher: 'Thầy Thành MRT',
    description: '13 lượt Typing: xem trước câu đích rồi ẩn mẫu; gõ cụm ngắn, tăng dần bằng các đoạn chồng lấn và kết thúc bằng đúng toàn câu.',
    activityTypes: Object.freeze(['typing']),
    itemCount: 13,
    targetSentenceId: 'g6u2-wr-t09',
    loadContent: () => import('./g6-u2-long-sentence-typing-01.js').then(module => module.g6U2LongSentenceTyping01Content)
  })
]);
