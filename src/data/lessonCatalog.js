export const lessonFolders = Object.freeze([
  Object.freeze({
    id: 'samples',
    name: 'Bài tập mẫu',
    description: 'Các Set mẫu dùng để thử luồng Mastery, nhiều dạng câu và link giao bài.',
    order: 1
  })
]);

export const lessonRegistry = Object.freeze([
  Object.freeze({
    id: 'g7-u1-mixed-demo',
    folderId: 'samples',
    order: 1,
    version: 1,
    course: 'Global Success 7',
    unit: 'Unit 1 · Hobbies',
    title: 'Mixed Mastery Demo · Hobbies',
    subtitle: 'MCQ · True/False · Sentence Order',
    passThreshold: 80,
    teacher: 'Thầy Thành MRT',
    description: 'Sample A kiểm chứng một Set trộn ba dạng câu nhưng vẫn dùng chung Mastery, retry sau 2 câu và mốc PASS 80%.',
    activityTypes: Object.freeze(['mcq', 'true_false', 'sentence_order']),
    itemCount: 10,
    loadContent: () => import('./global7-unit1-mixed-demo.js').then(module => module.global7Unit1MixedDemoContent)
  }),
  Object.freeze({
    id: 'g7-u1-s1',
    folderId: 'samples',
    order: 2,
    version: 3,
    course: 'Global Success 7',
    unit: 'Unit 1 · Hobbies',
    title: 'My Hobby · Like & Benefit',
    subtitle: 'Typing · Việt → Anh',
    passThreshold: 80,
    teacher: 'Thầy Thành MRT',
    description: 'Xây câu tiếng Anh từ các đơn vị nhỏ. Câu sai sẽ quay lại trong chuỗi để luyện đến khi Mastery đạt yêu cầu.',
    activityTypes: Object.freeze(['typing']),
    itemCount: 16,
    loadContent: () => import('./global7-unit1-set1.js').then(module => module.global7Unit1Set1Content)
  })
]);
