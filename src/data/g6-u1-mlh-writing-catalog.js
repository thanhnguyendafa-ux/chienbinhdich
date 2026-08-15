const ids = (start, end) => Object.freeze(Array.from({ length: end - start + 1 }, (_, index) => `g6u1-mlh-wr-q${String(start + index).padStart(2, '0')}`));
const rewriteIds = (start, end) => Object.freeze(Array.from({ length: end - start + 1 }, (_, index) => `g6u1-mlh-rw-q${String(start + index).padStart(2, '0')}`));

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
      Object.freeze({
        id: 'word-foundation',
        title: 'A. WORD FOUNDATION / NHỚ TỪ TRƯỚC KHI DỰNG CÂU',
        itemIds: ids(1, 20)
      }),
      Object.freeze({
        id: 'chunk-foundation',
        title: 'B. CHUNK FOUNDATION / DỰNG CỤM CÓ NGHĨA',
        itemIds: ids(21, 36)
      }),
      Object.freeze({
        id: 'make-sense',
        title: 'C. MAKE SENSE? / CỤM ĐỦ NGHĨA, THIẾU MẢNH HAY GHÉP SAI?',
        itemIds: ids(37, 46)
      }),
      Object.freeze({
        id: 'sentence-skeleton',
        title: 'D. SENTENCE SKELETON / WH · AUXILIARY · SUBJECT · VERB',
        itemIds: ids(47, 58)
      }),
      Object.freeze({
        id: 'final-reorder',
        title: 'E. FINAL REORDER / SẮP XẾP 6 CÂU NGUỒN',
        itemIds: ids(59, 64)
      })
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
      Object.freeze({
        id: 'word-foundation',
        title: 'A. WORD FOUNDATION / NHỚ TỪ TRONG ĐÚNG NGỮ CẢNH',
        itemIds: rewriteIds(1, 15)
      }),
      Object.freeze({
        id: 'chunk-foundation',
        title: 'B. CHUNK FOUNDATION / DỰNG CỤM PHỤC VỤ VIẾT LẠI',
        itemIds: rewriteIds(16, 27)
      }),
      Object.freeze({
        id: 'rewrite-thinking',
        title: 'C. REWRITE THINKING / MEANING → TRANSFORMATION → SKELETON',
        itemIds: rewriteIds(28, 45)
      }),
      Object.freeze({
        id: 'final-rewrite',
        title: 'D. FINAL REWRITE / TỰ VIẾT TOÀN BỘ CÂU MỚI',
        itemIds: rewriteIds(46, 51)
      })
    ]),
    activityTypes: Object.freeze(['typing', 'mcq']),
    itemCount: 51,
    loadContent: () => import('./g6-u1-mlh-writing-rewrite-01.js')
      .then(module => module.global6Unit1MlhWritingRewrite01Content)
  })
]);
