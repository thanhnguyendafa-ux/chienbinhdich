export const lessonFolders = Object.freeze([
  Object.freeze({
    id: 'samples',
    name: 'Bài tập mẫu',
    description: 'Các Set mẫu dùng để thử luồng Mastery, nhiều dạng câu và link giao bài.',
    parentId: null,
    order: 1
  }),
  Object.freeze({
    id: 'global5',
    name: 'Global Success 5',
    description: 'Kho bài luyện Global Success 5 được tổ chức theo từng Unit.',
    parentId: null,
    order: 2
  }),
  Object.freeze({
    id: 'global5-unit1',
    name: 'Unit 1 · All about me!',
    description: 'Bài luyện Global Success 5 Unit 1 · All about me!, tập trung từ vựng và mẫu câu nền tảng.',
    parentId: 'global5',
    order: 1
  }),
  Object.freeze({
    id: 'global7',
    name: 'Global Success 7',
    description: 'Kho bài luyện Global Success 7 được tổ chức theo từng Unit.',
    parentId: null,
    order: 3
  }),
  Object.freeze({
    id: 'global7-unit1',
    name: 'Unit 1 · Hobbies',
    description: 'Bài luyện Global Success 7 Unit 1 · Hobbies, tập trung dịch và sử dụng ngôn ngữ theo từng bước.',
    parentId: 'global7',
    order: 1
  }),
  Object.freeze({
    id: 'mrt-lessons',
    name: 'Bài học Thầy Thành MRT',
    description: 'Các bài luyện theo hệ tư duy ngữ pháp Mister Thành MRT.',
    parentId: null,
    order: 4
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
    lessonSlug: 'g7u1-hobbies-mix',
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
    lessonSlug: 'g7u1-hobby-typing',
    passThreshold: 80,
    teacher: 'Thầy Thành MRT',
    description: 'Xây câu tiếng Anh từ các đơn vị nhỏ. Câu sai sẽ quay lại trong chuỗi để luyện đến khi Mastery đạt yêu cầu.',
    activityTypes: Object.freeze(['typing']),
    itemCount: 16,
    loadContent: () => import('./global7-unit1-set1.js').then(module => module.global7Unit1Set1Content)
  }),
  Object.freeze({
    id: 'g5-u1-vocab-01',
    folderId: 'global5-unit1',
    order: 1,
    version: 1,
    course: 'Global Success 5',
    unit: 'Unit 1 · All about me!',
    title: 'Bài tập từ vựng 1',
    subtitle: 'MCQ · True/False · Giải thích tiếng Việt',
    lessonSlug: 'g5u1-tu-vung-1',
    passThreshold: 80,
    completionPolicy: 'all-items',
    teacher: 'Thầy Thành MRT',
    description: '17 câu từ vựng Unit 1 gồm 12 MCQ và 5 True/False. Học sinh đi qua đủ 17 câu chính trước khi được xét PASS 80% Mastery; mỗi câu có giải thích tiếng Việt để củng cố nghĩa từ.',
    activityTypes: Object.freeze(['mcq', 'true_false']),
    itemCount: 17,
    loadContent: () => import('./g5-u1-vocab-01.js').then(module => module.global5Unit1Vocab01Content)
  }),
  Object.freeze({
    id: 'g7-u1-translation-01',
    folderId: 'global7-unit1',
    order: 1,
    version: 1,
    course: 'Global Success 7',
    unit: 'Unit 1 · Hobbies',
    title: 'Bài tập dịch 1',
    subtitle: 'MCQ · Việt → Anh · Bẫy nghĩa gần đúng',
    lessonSlug: 'g7u1-dich1-mcq',
    passThreshold: 80,
    teacher: 'Thầy Thành MRT',
    description: '15 câu dịch Việt → Anh. Mỗi câu có bốn bản dịch tiếng Anh tự nhiên; học sinh phải đối chiếu từng cụm nghĩa để loại ba đáp án gần đúng nhưng sai chi tiết.',
    activityTypes: Object.freeze(['mcq']),
    itemCount: 15,
    loadContent: () => import('./g7-u1-translation-01.js').then(module => module.g7U1Translation01Content)
  }),
  Object.freeze({
    id: 'g7-u1-translation-02',
    folderId: 'global7-unit1',
    order: 2,
    version: 1,
    course: 'Global Success 7',
    unit: 'Unit 1 · Hobbies',
    title: 'Bài tập dịch 2',
    subtitle: 'MCQ · Việt → Anh · Reading clauses',
    lessonSlug: 'g7u1-dich2-mcq',
    passThreshold: 80,
    teacher: 'Thầy Thành MRT',
    description: '23 clause độc lập từ bài Reading Unit 1. Mỗi câu có một bản dịch chính xác, ba bẫy nghĩa gần đúng và giải thích theo từng chunk cho học sinh.',
    activityTypes: Object.freeze(['mcq']),
    itemCount: 23,
    loadContent: () => import('./g7-u1-translation-02.js').then(module => module.g7U1Translation02Content)
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
    lessonSlug: 'g6u1-3-gan-aura-mix',
    passThreshold: 80,
    teacher: 'Thầy Thành MRT',
    description: 'Phân loại câu tiếng Việt theo ba hệ Mister Thành: Gán TO BE, Aura TO BE và Hành động VERB. Mỗi câu có giải thích và lý thuyết sau khi được giải quyết.',
    activityTypes: Object.freeze(['mcq', 'true_false']),
    itemCount: 20,
    loadContent: () => import('./mrt-g6-gan-aura-action-01.js').then(module => module.mrtG6GanAuraAction01Content)
  }),
  Object.freeze({
    id: 'mrt-left-cut-right-01',
    folderId: 'mrt-lessons',
    order: 2,
    version: 1,
    course: 'Mister Thành MRT',
    unit: 'Reading Tool · LEFT | CUT | RIGHT',
    title: 'Trái | Cắt | Phải — Chặt câu để hiểu nghĩa',
    subtitle: 'MCQ · True/False · Typing LEFT',
    lessonSlug: 'mrt-left-cut-right-mix',
    passThreshold: 80,
    teacher: 'Thầy Thành MRT',
    description: 'Luyện tìm LEFT / SUBJECT, đặt CUT trước Predicate và xác định toàn bộ RIGHT / PREDICATE. Sáu câu Typing buộc học sinh tự gõ phần TRÁI thay vì đoán từ lựa chọn.',
    activityTypes: Object.freeze(['mcq', 'true_false', 'typing']),
    itemCount: 20,
    loadContent: () => import('./mrt-left-cut-right-01.js').then(module => module.mrtLeftCutRight01Content)
  })
]);
