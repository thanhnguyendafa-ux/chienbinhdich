export const lessonFolders = Object.freeze([
  Object.freeze({ id: 'samples', name: 'Bài tập mẫu', description: 'Các Set mẫu dùng để thử luồng Mastery, nhiều dạng câu và link giao bài.', parentId: null, order: 1 }),
  Object.freeze({ id: 'global5', name: 'Global Success 5', description: 'Kho bài luyện Global Success 5 được tổ chức theo từng Unit.', parentId: null, order: 2 }),
  Object.freeze({ id: 'global5-unit1', name: 'Unit 1 · All about me!', description: 'Bài luyện Global Success 5 Unit 1 · All about me!, tập trung từ vựng, mẫu câu, đọc hiểu và viết.', parentId: 'global5', order: 1 }),
  Object.freeze({ id: 'global5-unit2', name: 'Unit 2 · Our homes', description: 'Bài luyện Global Success 5 Unit 2 · Our homes, tập trung trọng âm, từ vựng và ngôn ngữ về nhà ở, địa chỉ và khoảng cách.', parentId: 'global5', order: 2 }),
  Object.freeze({ id: 'global5-review', name: 'Global Success 5 Review', description: 'Kho ôn tập tổng hợp Global Success 5 theo kỹ năng, tái sử dụng ngôn ngữ từ nhiều Unit.', parentId: 'global5', order: 99 }),
  Object.freeze({ id: 'global7', name: 'Global Success 7', description: 'Kho bài luyện Global Success 7 được tổ chức theo từng Unit.', parentId: null, order: 3 }),
  Object.freeze({ id: 'global7-unit1', name: 'Unit 1 · Hobbies', description: 'Kho bài luyện Global Success 7 Unit 1 · Hobbies, tập trung dịch và sử dụng ngôn ngữ theo từng bước.', parentId: 'global7', order: 1 }),
  Object.freeze({ id: 'mrt-lessons', name: 'Bài học Thầy Thành MRT', description: 'Các bài luyện theo hệ tư duy ngữ pháp Mister Thành MRT.', parentId: null, order: 4 })
]);

export const lessonRegistry = Object.freeze([
  Object.freeze({
    id: 'g7-u1-mixed-demo', folderId: 'samples', order: 1, version: 1,
    course: 'Global Success 7', unit: 'Unit 1 · Hobbies', title: 'Mixed Mastery Demo · Hobbies',
    subtitle: 'MCQ · True/False · Sentence Order', lessonSlug: 'g7u1-hobbies-mix', passThreshold: 80,
    teacher: 'Thầy Thành MRT',
    description: 'Sample A kiểm chứng một Set trộn ba dạng câu nhưng vẫn dùng chung Mastery, retry sau 2 câu và mốc PASS 80%.',
    activityTypes: Object.freeze(['mcq', 'true_false', 'sentence_order']), itemCount: 10,
    loadContent: () => import('./global7-unit1-mixed-demo.js').then(module => module.global7Unit1MixedDemoContent)
  }),
  Object.freeze({
    id: 'g7-u1-s1', folderId: 'samples', order: 2, version: 3,
    course: 'Global Success 7', unit: 'Unit 1 · Hobbies', title: 'My Hobby · Like & Benefit',
    subtitle: 'Typing · Việt → Anh', lessonSlug: 'g7u1-hobby-typing', passThreshold: 80,
    teacher: 'Thầy Thành MRT',
    description: 'Xây câu tiếng Anh từ các đơn vị nhỏ. Câu sai sẽ quay lại trong chuỗi để luyện đến khi Mastery đạt yêu cầu.',
    activityTypes: Object.freeze(['typing']), itemCount: 16,
    loadContent: () => import('./global7-unit1-set1.js').then(module => module.global7Unit1Set1Content)
  }),
  Object.freeze({
    id: 'g5-u1-vocab-01', folderId: 'global5-unit1', order: 1, version: 1,
    course: 'Global Success 5', unit: 'Unit 1 · All about me!', title: 'Bài tập từ vựng 1',
    subtitle: 'MCQ · True/False · Giải thích tiếng Việt', lessonSlug: 'g5u1-tu-vung-1', passThreshold: 80,
    completionPolicy: 'all-items', teacher: 'Thầy Thành MRT',
    description: '17 câu từ vựng Unit 1 gồm 12 MCQ và 5 True/False. Học sinh đi qua đủ 17 câu chính trước khi được xét PASS 80% Mastery; mỗi câu có giải thích tiếng Việt để củng cố nghĩa từ.',
    activityTypes: Object.freeze(['mcq', 'true_false']), itemCount: 17,
    loadContent: () => import('./g5-u1-vocab-01.js').then(module => module.global5Unit1Vocab01Content)
  }),
  Object.freeze({
    id: 'g5-u1-pattern-01', folderId: 'global5-unit1', order: 2, version: 1,
    course: 'Global Success 5', unit: 'Unit 1 · All about me!', title: 'Bài tập mẫu câu 1',
    subtitle: 'MCQ · True/False · Giải thích tiếng Việt', lessonSlug: 'g5u1-mau-cau-1', passThreshold: 80,
    completionPolicy: 'all-items', teacher: 'Thầy Thành MRT',
    description: '17 câu Sentence Patterns Unit 1 gồm 12 MCQ và 5 True/False. Bài kiểm tra nhận diện pattern, đối chiếu câu hỏi–câu trả lời và sử dụng mẫu câu trong ngữ cảnh, với giải thích tiếng Việt cho từng câu.',
    activityTypes: Object.freeze(['mcq', 'true_false']), itemCount: 17,
    loadContent: () => import('./g5-u1-pattern-01.js').then(module => module.global5Unit1Pattern01Content)
  }),
  Object.freeze({
    id: 'g5-u1-reading-01', folderId: 'global5-unit1', order: 3, version: 1,
    course: 'Global Success 5', unit: 'Unit 1 · All about me!', title: 'Bài tập Reading 1',
    subtitle: '3 bài đọc · 15 câu · True/False + Evidence', lessonSlug: 'g5u1-reading-1', passThreshold: 80,
    completionPolicy: 'all-items', teacher: 'Thầy Thành MRT',
    description: '3 bài đọc ngắn Unit 1 với 15 câu MCQ. Mỗi câu buộc học sinh xác định True/False đồng thời chọn đúng bằng chứng, giúp giảm đoán mò và chẩn đoán lỗi đọc hiểu.',
    activityTypes: Object.freeze(['mcq']), itemCount: 15,
    loadContent: () => import('./g5-u1-reading-01.js').then(module => module.global5Unit1Reading01Content)
  }),
  Object.freeze({
    id: 'g5-u1-writing-01', folderId: 'global5-unit1', order: 4, version: 1,
    course: 'Global Success 5', unit: 'Unit 1 · All about me!', title: 'Bài tập Writing 1',
    subtitle: '14 câu · Select + Order · Từ nhiễu có chủ đích', lessonSlug: 'g5u1-writing-1', passThreshold: 80,
    completionPolicy: 'all-items', teacher: 'Thầy Thành MRT',
    description: '14 câu Writing Unit 1 theo dạng Select + Order. Học sinh phải chọn đúng khối từ trong token pool có nhiễu rồi sắp xếp đúng; các dạng tương đương như What’s/What is và I’m/I am đều được chấp nhận.',
    activityTypes: Object.freeze(['sentence_order']), itemCount: 14,
    loadContent: () => import('./g5-u1-writing-01.js').then(module => module.global5Unit1Writing01Content)
  }),
  Object.freeze({
    id: 'g5-u2-stress-vocab-01', folderId: 'global5-unit2', order: 1, version: 1,
    course: 'Global Success 5', unit: 'Unit 2 · Our homes', title: 'Trọng âm & Từ vựng 1',
    subtitle: '12 câu · MCQ · True/False · Classification', lessonSlug: 'g5u2-trong-am-tu-vung-1', passThreshold: 80,
    completionPolicy: 'all-items', teacher: 'Thầy Thành MRT',
    description: '12 câu Unit 2 luyện trọng âm -teen/-ty và từ vựng về nhà ở, địa chỉ, khoảng cách. Hai câu Classification buộc học sinh phân loại nhiều từ theo nhóm thay vì chỉ đoán một đáp án.',
    printGroups: Object.freeze([
      Object.freeze({ id: 'word-stress', title: 'A. WORD STRESS', itemIds: Object.freeze(['g5u2-sv-q01', 'g5u2-sv-q02', 'g5u2-sv-q03', 'g5u2-sv-q04']) }),
      Object.freeze({ id: 'vocabulary', title: 'B. VOCABULARY', itemIds: Object.freeze(['g5u2-sv-q05', 'g5u2-sv-q06', 'g5u2-sv-q07', 'g5u2-sv-q08', 'g5u2-sv-q09', 'g5u2-sv-q10', 'g5u2-sv-q11', 'g5u2-sv-q12']) })
    ]),
    activityTypes: Object.freeze(['mcq', 'true_false', 'classification']), itemCount: 12,
    loadContent: () => import('./g5-u2-stress-vocab-01.js').then(module => module.global5Unit2StressVocab01Content)
  }),
  Object.freeze({
    id: 'g5-review-main-idea-01', folderId: 'global5-review', order: 1, version: 1,
    course: 'Global Success 5', unit: 'Review · Units 1–10', title: 'Main Idea 1 · Units 1–10',
    subtitle: '15 passages · MCQ · Main Idea', lessonSlug: 'g5-review-main-idea-1', passThreshold: 80,
    completionPolicy: 'all-items', teacher: 'Thầy Thành MRT',
    description: '15 bài đọc ngắn tái sử dụng chủ đề và từ vựng Global Success 5 Units 1–10 để luyện xác định Main Idea: từ nhận diện ý bao quát, chống bẫy detail đến suy luận ý chính không xuất hiện nguyên văn.',
    printGroups: Object.freeze([
      Object.freeze({ id: 'foundation', title: 'A. FOUNDATION · FIND THE BIG IDEA', itemIds: Object.freeze(['g5-review-mi-q01', 'g5-review-mi-q02', 'g5-review-mi-q03', 'g5-review-mi-q04', 'g5-review-mi-q05']) }),
      Object.freeze({ id: 'detail-traps', title: 'B. DETAIL TRAPS · TRUE BUT TOO NARROW', itemIds: Object.freeze(['g5-review-mi-q06', 'g5-review-mi-q07', 'g5-review-mi-q08', 'g5-review-mi-q09', 'g5-review-mi-q10']) }),
      Object.freeze({ id: 'inference', title: 'C. INFERENCE · BUILD THE MAIN IDEA', itemIds: Object.freeze(['g5-review-mi-q11', 'g5-review-mi-q12', 'g5-review-mi-q13', 'g5-review-mi-q14', 'g5-review-mi-q15']) })
    ]),
    activityTypes: Object.freeze(['mcq']), itemCount: 15,
    loadContent: () => import('./g5-review-main-idea-01.js').then(module => module.global5ReviewMainIdea01Content)
  }),
  Object.freeze({
    id: 'g7-u1-translation-01', folderId: 'global7-unit1', order: 1, version: 1,
    course: 'Global Success 7', unit: 'Unit 1 · Hobbies', title: 'Bài tập dịch 1',
    subtitle: 'MCQ · Việt → Anh · Bẫy nghĩa gần đúng', lessonSlug: 'g7u1-dich1-mcq', passThreshold: 80,
    teacher: 'Thầy Thành MRT',
    description: '15 câu dịch Việt → Anh. Mỗi câu có bốn bản dịch tiếng Anh tự nhiên; học sinh phải đối chiếu từng cụm nghĩa để loại ba đáp án gần đúng nhưng sai chi tiết.',
    activityTypes: Object.freeze(['mcq']), itemCount: 15,
    loadContent: () => import('./g7-u1-translation-01.js').then(module => module.g7U1Translation01Content)
  }),
  Object.freeze({
    id: 'g7-u1-translation-02', folderId: 'global7-unit1', order: 2, version: 1,
    course: 'Global Success 7', unit: 'Unit 1 · Hobbies', title: 'Bài tập dịch 2',
    subtitle: '23 clause độc lập từ bài Reading Unit 1. Mỗi câu có một bản dịch chính xác, ba bẫy nghĩa gần đúng và giải thích theo từng chunk cho học sinh.', lessonSlug: 'g7u1-dich2-mcq', passThreshold: 80,
    teacher: 'Thầy Thành MRT',
    description: '23 clause độc lập từ bài Reading Unit 1. Mỗi câu có một bản dịch chính xác, ba bẫy nghĩa gần đúng và giải thích theo từng chunk cho học sinh.',
    activityTypes: Object.freeze(['mcq']), itemCount: 23,
    loadContent: () => import('./g7-u1-translation-02.js').then(module => module.g7U1Translation02Content)
  }),
  Object.freeze({
    id: 'mrt-g6-gan-aura-action-01', folderId: 'mrt-lessons', order: 1, version: 1,
    course: 'Global Success 6', unit: 'Units 1–3 · My New School · My House · My Friends', title: 'Bài tập Phân loại gán - aura - hành động',
    subtitle: 'MCQ · True/False · Mister Thành', lessonSlug: 'g6u1-3-gan-aura-mix', passThreshold: 80,
    teacher: 'Thầy Thành MRT',
    description: 'Phân loại câu tiếng Việt theo ba hệ Mister Thành: Gán TO BE, Aura TO BE và Hành động VERB. Mỗi câu có giải thích và lý thuyết sau khi được giải quyết.',
    activityTypes: Object.freeze(['mcq', 'true_false']), itemCount: 20,
    loadContent: () => import('./mrt-g6-gan-aura-action-01.js').then(module => module.mrtG6GanAuraAction01Content)
  }),
  Object.freeze({
    id: 'mrt-left-cut-right-01', folderId: 'mrt-lessons', order: 2, version: 1,
    course: 'Mister Thành MRT', unit: 'Reading Tool · LEFT | CUT | RIGHT', title: 'Trái | Cắt | Phải — Chặt câu để hiểu nghĩa',
    subtitle: 'MCQ · True/False · Typing LEFT', lessonSlug: 'mrt-left-cut-right-mix', passThreshold: 80,
    teacher: 'Thầy Thành MRT',
    description: 'Luyện tìm LEFT / SUBJECT, đặt CUT trước Predicate và xác định toàn bộ RIGHT / PREDICATE. Sáu câu Typing buộc học sinh tự gõ phần TRÁI thay vì đoán từ lựa chọn.',
    activityTypes: Object.freeze(['mcq', 'true_false', 'typing']), itemCount: 20,
    loadContent: () => import('./mrt-left-cut-right-01.js').then(module => module.mrtLeftCutRight01Content)
  })
]);
