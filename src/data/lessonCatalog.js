export const lessonFolders = Object.freeze([
  Object.freeze({
    id: 'samples',
    name: 'Bài tập mẫu',
    description: 'Các Set mẫu dùng để thử luồng Mastery, nhiều dạng câu và link giao bài.',
    order: 1
  }),
  Object.freeze({
    id: 'mrt-lessons',
    name: 'Bài học Thầy Thành MRT',
    description: 'Các bài luyện theo hệ tư duy ngữ pháp Mister Thành MRT.',
    order: 2
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
  }),
  Object.freeze({
    id: 'mrt-g6-gan-aura-action-01',
    folderId: 'mrt-lessons',
    order: 1,
    version: 1,
    course: 'Global Success 6',
    unit: 'Units 1–3 · My New School · My House · My Friends',
    title: 'Bài tập Phân loại gán - aura - hành động',
    subtitle: 'MCQ · True/False · Mister Thành',
    passThreshold: 80,
    teacher: 'Thầy Thành MRT',
    description: 'Phân loại câu tiếng Việt theo ba hệ Mister Thành: Gán TO BE, Aura TO BE và Hành động VERB. Mỗi câu có giải thích và lý thuyết sau khi được giải quyết.',
    activityTypes: Object.freeze(['mcq', 'true_false']),
    itemCount: 20,
    loadContent: () => import('./mrt-g6-gan-aura-action-01.js').then(module => module.mrtG6GanAuraAction01Content)
  })
]);
