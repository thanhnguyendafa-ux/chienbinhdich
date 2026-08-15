export const g7U1MlhVocabContextFolders = Object.freeze([]);

export const g7U1MlhVocabContextRegistry = Object.freeze([
  Object.freeze({
    id: 'g7-u1-mlh-vocab-context-01',
    folderId: 'global7-unit1',
    order: 4,
    version: 1,
    course: 'Global Success 7',
    unit: 'Unit 1 · Hobbies',
    title: 'Từ vựng theo ngữ cảnh 1 · Mai Lan Hương',
    subtitle: '30 câu · WORD → CHUNK → CONTEXT · Thầy–con',
    lessonSlug: 'g7u1-mlh-vocab-context',
    passThreshold: 80,
    completionPolicy: 'all-items',
    teacher: 'Thầy Thành MRT',
    description: 'Một flow 30 câu liên tục từ đúng 8 từ của bài Mai Lan Hương: 8 câu Typing Việt + từ loại → Anh, 14 câu Typing Việt + số từ → chunk Anh, rồi 8 câu điền từ gốc với đủ 8 lựa chọn và feedback riêng cho từng lựa chọn. Theory mở ở phần foundation và chỉ mở sau submit ở phần application.',
    printGroups: Object.freeze([
      Object.freeze({
        id: 'word-foundation',
        title: 'A. WORD FOUNDATION / DỰNG NỀN TỪ ĐƠN',
        itemIds: Object.freeze(['g7u1-mlh-vc-q01', 'g7u1-mlh-vc-q02', 'g7u1-mlh-vc-q03', 'g7u1-mlh-vc-q04', 'g7u1-mlh-vc-q05', 'g7u1-mlh-vc-q06', 'g7u1-mlh-vc-q07', 'g7u1-mlh-vc-q08'])
      }),
      Object.freeze({
        id: 'chunk-foundation',
        title: 'B. CHUNK FOUNDATION / DỰNG NỀN CỤM TỪ',
        itemIds: Object.freeze(['g7u1-mlh-vc-q09', 'g7u1-mlh-vc-q10', 'g7u1-mlh-vc-q11', 'g7u1-mlh-vc-q12', 'g7u1-mlh-vc-q13', 'g7u1-mlh-vc-q14', 'g7u1-mlh-vc-q15', 'g7u1-mlh-vc-q16', 'g7u1-mlh-vc-q17', 'g7u1-mlh-vc-q18', 'g7u1-mlh-vc-q19', 'g7u1-mlh-vc-q20', 'g7u1-mlh-vc-q21', 'g7u1-mlh-vc-q22'])
      }),
      Object.freeze({
        id: 'context-application',
        title: 'C. CONTEXT APPLICATION / TỰ DỊCH VÀ CHỌN TỪ',
        itemIds: Object.freeze(['g7u1-mlh-vc-q23', 'g7u1-mlh-vc-q24', 'g7u1-mlh-vc-q25', 'g7u1-mlh-vc-q26', 'g7u1-mlh-vc-q27', 'g7u1-mlh-vc-q28', 'g7u1-mlh-vc-q29', 'g7u1-mlh-vc-q30'])
      })
    ]),
    activityTypes: Object.freeze(['typing', 'mcq']),
    itemCount: 30,
    loadContent: () => import('./g7-u1-mlh-vocab-context-01.js').then(module => module.global7Unit1MlhVocabContext01Content)
  })
]);
