const ids = (start, end) => Object.freeze(Array.from({ length: end - start + 1 }, (_, index) => `g6u1-mlh-wr-q${String(start + index).padStart(2, '0')}`));
const rewriteIds = (start, end) => Object.freeze(Array.from({ length: end - start + 1 }, (_, index) => `g6u1-mlh-rw-q${String(start + index).padStart(2, '0')}`));
const whIds = (start, end) => Object.freeze(Array.from({ length: end - start + 1 }, (_, index) => `g6u1-mlh-wh-q${String(start + index).padStart(2, '0')}`));

export const g6U1MlhWritingFolders = Object.freeze([
  Object.freeze({
    id: 'global6-unit1-mlh-writing',
    name: 'Writing · Mai Lan Hương',
    description: 'Bài Writing Mai Lan Hương Unit 1 theo flow nhớ từ → dựng cụm → tư duy cấu trúc → tự tạo câu.',
    parentId: 'global6-unit1',
    order: 4
  })
]);

export const g6U1MlhWritingRegistry = Object.freeze([
  Object.freeze({
    id: 'g6-u1-mlh-writing-reorder-01',
    folderId: 'global6-unit1-mlh-writing',
    order: 1,
    version: 1,
    course: 'Global Success 6',
    unit: 'Unit 1 · My New School',
    title: 'Sentence Building 1 · Mai Lan Hương',
    subtitle: '64 câu · WORD → CHUNK → MAKE SENSE → SKELETON → REORDER · Thầy–con',
    lessonSlug: 'g6u1-mlh-writing-reorder-01',
    passThreshold: 80,
    completionPolicy: 'all-items',
    teacher: 'Thầy Thành MRT',
    description: 'Một flow 64 câu liên tục: 20 WORD Typing Việt + từ loại → Anh, 16 CHUNK Typing Việt + số từ → Anh, 10 câu kiểm MAKE SENSE/THIẾU MẢNH/NOT MAKE SENSE, 12 câu nhận diện WH–auxiliary–subject–verb–place/time skeleton, rồi mới 6 câu Sentence Order từ bài Writing gốc. Theory của toàn lesson chỉ mở sau submit để không lộ đáp án.',
    printGroups: Object.freeze([
      Object.freeze({ id: 'word-foundation', title: 'A. WORD FOUNDATION / NHỚ TỪ TRƯỚC KHI DỰNG CÂU', itemIds: ids(1, 20) }),
      Object.freeze({ id: 'chunk-foundation', title: 'B. CHUNK FOUNDATION / DỰNG CỤM CÓ NGHĨA', itemIds: ids(21, 36) }),
      Object.freeze({ id: 'make-sense', title: 'C. MAKE SENSE? / CỤM ĐỦ NGHĨA, THIẾU MẢNH HAY GHÉP SAI?', itemIds: ids(37, 46) }),
      Object.freeze({ id: 'sentence-skeleton', title: 'D. SENTENCE SKELETON / WH · AUXILIARY · SUBJECT · VERB', itemIds: ids(47, 58) }),
      Object.freeze({ id: 'final-reorder', title: 'E. FINAL REORDER / SẮP XẾP 6 CÂU NGUỒN', itemIds: ids(59, 64) })
    ]),
    activityTypes: Object.freeze(['typing', 'mcq', 'sentence_order']),
    itemCount: 64,
    loadContent: () => import('./g6-u1-mlh-writing-reorder-01.js')
      .then(module => module.global6Unit1MlhWritingReorder01Content)
  }),
  Object.freeze({
    id: 'g6-u1-mlh-writing-rewrite-01',
    folderId: 'global6-unit1-mlh-writing',
    order: 2,
    version: 1,
    course: 'Global Success 6',
    unit: 'Unit 1 · My New School',
    title: 'Sentence Transformation 1 · Mai Lan Hương',
    subtitle: '51 câu · WORD → CHUNK → MEANING → TRANSFORMATION → SKELETON → FINAL REWRITE',
    lessonSlug: 'g6u1-mlh-writing-rewrite-01',
    passThreshold: 80,
    completionPolicy: 'all-items',
    teacher: 'Thầy Thành MRT',
    description: 'Một flow 51 câu liên tục: 15 WORD Typing Việt + từ loại + local context → Anh, 12 CHUNK Typing Việt + số từ → Anh, 18 MCQ tự đứng độc lập với Câu gốc + Rewrite starter + Nhiệm vụ hiện tại để luyện meaning core, transformation và skeleton/morphology, rồi 6 câu full-sentence Typing tự viết lại câu. Theory của toàn lesson chỉ mở sau submit.',
    printGroups: Object.freeze([
      Object.freeze({ id: 'word-foundation', title: 'A. WORD FOUNDATION / NHỚ TỪ TRONG ĐÚNG NGỮ CẢNH', itemIds: rewriteIds(1, 15) }),
      Object.freeze({ id: 'chunk-foundation', title: 'B. CHUNK FOUNDATION / DỰNG CỤM PHỤC VỤ VIẾT LẠI', itemIds: rewriteIds(16, 27) }),
      Object.freeze({ id: 'rewrite-thinking', title: 'C. REWRITE THINKING / MEANING → TRANSFORMATION → SKELETON', itemIds: rewriteIds(28, 45) }),
      Object.freeze({ id: 'final-rewrite', title: 'D. FINAL REWRITE / TỰ VIẾT TOÀN BỘ CÂU MỚI', itemIds: rewriteIds(46, 51) })
    ]),
    activityTypes: Object.freeze(['typing', 'mcq']),
    itemCount: 51,
    loadContent: () => import('./g6-u1-mlh-writing-rewrite-01.js')
      .then(module => module.global6Unit1MlhWritingRewrite01Content)
  }),
  Object.freeze({
    id: 'g6-u1-mlh-writing-question-words-01',
    folderId: 'global6-unit1-mlh-writing',
    order: 3,
    version: 1,
    course: 'Global Success 6',
    unit: 'Unit 1 · My New School',
    title: 'Question Words 1 · Mai Lan Hương',
    subtitle: '66 câu · WH THEORY → VIỆT → WH → WORD → CHUNK → INFORMATION BRAIN → SOURCE',
    lessonSlug: 'g6u1-mlh-writing-question-words-01',
    passThreshold: 80,
    completionPolicy: 'all-items',
    teacher: 'Thầy Thành MRT',
    description: 'Flow 66 câu cho học sinh yếu: 8 câu học đủ WHAT/WHEN/WHERE/HOW/WHO/HOW OFTEN/HOW MANY/HOW MUCH với Theory mở sẵn; 8 câu ý định hỏi tiếng Việt → WH; 18 WORD Typing Việt → Anh; 14 CHUNK Typing Việt → Anh; 8 câu đọc answer → information type; rồi 10 câu Mai Lan Hương gốc với đủ 8 WH trong bank. Từ Q9 trở đi Theory chỉ mở sau submit.',
    printGroups: Object.freeze([
      Object.freeze({ id: 'wh-theory-foundation', title: 'A. WH THEORY FOUNDATION / 8 TỪ ĐỂ HỎI', itemIds: whIds(1, 8) }),
      Object.freeze({ id: 'vietnamese-to-wh', title: 'B. VIETNAMESE → WH / Ý ĐỊNH HỎI → TỪ ĐỂ HỎI', itemIds: whIds(9, 16) }),
      Object.freeze({ id: 'word-foundation', title: 'C. WORD FOUNDATION / VIỆT → ANH', itemIds: whIds(17, 34) }),
      Object.freeze({ id: 'chunk-foundation', title: 'D. CHUNK FOUNDATION / VIỆT → ANH', itemIds: whIds(35, 48) }),
      Object.freeze({ id: 'information-brain', title: 'E. ANSWER → INFORMATION TYPE / ĐỌC Ý NGHĨA TRƯỚC', itemIds: whIds(49, 56) }),
      Object.freeze({ id: 'source-application', title: 'F. MAI LAN HƯƠNG SOURCE / CHỌN ĐÚNG QUESTION WORD', itemIds: whIds(57, 66) })
    ]),
    activityTypes: Object.freeze(['mcq', 'typing']),
    itemCount: 66,
    loadContent: () => import('./g6-u1-mlh-writing-question-words-01.js')
      .then(module => module.global6Unit1MlhWritingQuestionWords01Content)
  })
]);
