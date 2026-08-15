const ids = (start, end) => Object.freeze(Array.from({ length: end - start + 1 }, (_, index) => `g6u1-mlh-rg-q${String(start + index).padStart(2, '0')}`));
const tfIds = (start, end) => Object.freeze(Array.from({ length: end - start + 1 }, (_, index) => `g6u1-mlh-tf-q${String(start + index).padStart(2, '0')}`));
const afterSubmitTheory = Object.freeze({ access: 'after_submit' });

function hideTypingTheoryUntilSubmit(content) {
  return Object.freeze({
    ...content,
    items: Object.freeze((content.items ?? []).map(item => item?.type === 'typing'
      ? Object.freeze({ ...item, theorySupport: afterSubmitTheory })
      : item))
  });
}

export const g6U1MlhReadingGapFolders = Object.freeze([
  Object.freeze({
    id: 'global6-unit1-mlh-reading',
    name: 'Reading · Mai Lan Hương',
    description: 'Bài Reading Mai Lan Hương Unit 1 theo flow dựng từ → dựng cụm → tự đọc evidence → xử lý gap và True/False.',
    parentId: 'global6-unit1',
    order: 3
  })
]);

export const g6U1MlhReadingGapRegistry = Object.freeze([
  Object.freeze({
    id: 'g6-u1-mlh-reading-gap-01',
    folderId: 'global6-unit1-mlh-reading',
    order: 1,
    version: 1,
    course: 'Global Success 6',
    unit: 'Unit 1 · My New School',
    title: 'Reading Gap 1 · Mai Lan Hương',
    subtitle: '36 câu · WORD → CHUNK → READING GAP · Thầy–con',
    lessonSlug: 'g6u1-mlh-reading-gap-01',
    passThreshold: 80,
    completionPolicy: 'all-items',
    teacher: 'Thầy Thành MRT',
    description: 'Một flow 36 câu liên tục: 14 từ đơn Typing Việt + từ loại → Anh, 14 chunk Typing Việt + số từ → Anh, rồi 8 gap của bài Reading gốc. Theory của phần Typing chỉ mở sau khi con đã submit để không lộ đáp án; ở mỗi gap, toàn passage vẫn giữ đủ 8 chỗ trống và word box luôn đủ 8 từ để học sinh phải tự đọc, tự dịch và suy luận thay vì loại trừ.',
    printGroups: Object.freeze([
      Object.freeze({
        id: 'word-foundation',
        title: 'A. WORD FOUNDATION / DỰNG NỀN TỪ ĐƠN',
        itemIds: ids(1, 14)
      }),
      Object.freeze({
        id: 'chunk-foundation',
        title: 'B. CHUNK FOUNDATION / DỰNG NỀN CỤM TỪ',
        itemIds: ids(15, 28)
      }),
      Object.freeze({
        id: 'reading-gap-application',
        title: 'C. READING GAP / TỰ DỊCH VÀ XỬ LÝ CHỖ TRỐNG',
        itemIds: ids(29, 36)
      })
    ]),
    activityTypes: Object.freeze(['typing', 'mcq']),
    itemCount: 36,
    loadContent: () => import('./g6-u1-mlh-reading-gap-01.js')
      .then(module => hideTypingTheoryUntilSubmit(module.global6Unit1MlhReadingGap01Content))
  }),
  Object.freeze({
    id: 'g6-u1-mlh-reading-tf-evidence-01',
    folderId: 'global6-unit1-mlh-reading',
    order: 2,
    version: 1,
    course: 'Global Success 6',
    unit: 'Unit 1 · My New School',
    title: 'True/False Evidence 1 · Mai Lan Hương',
    subtitle: '31 câu · WORD → CHUNK → T/F + EVIDENCE · Thầy–con',
    lessonSlug: 'g6u1-mlh-reading-tf-evidence-01',
    passThreshold: 80,
    completionPolicy: 'all-items',
    teacher: 'Thầy Thành MRT',
    description: 'Một flow 31 câu liên tục: 16 từ trọng tâm/Tier 2 Typing Việt + từ loại → Anh, 10 chunk Typing Việt + số từ → Anh, rồi 5 statement True/False dạng MCQ kết hợp verdict + reason. Mỗi câu cuối buộc học sinh tìm evidence trong chart, kiểm exact/paraphrase/synonym/contradiction và tránh keyword, negation, invented-information traps.',
    printGroups: Object.freeze([
      Object.freeze({
        id: 'word-foundation',
        title: 'A. WORD FOUNDATION / TỪ TRỌNG TÂM + TIER 2',
        itemIds: tfIds(1, 16)
      }),
      Object.freeze({
        id: 'chunk-foundation',
        title: 'B. CHUNK FOUNDATION / DỰNG MẢNH NGHĨA',
        itemIds: tfIds(17, 26)
      }),
      Object.freeze({
        id: 'tf-evidence-application',
        title: 'C. TRUE/FALSE + EVIDENCE / KẾT LUẬN + LÝ DO',
        itemIds: tfIds(27, 31)
      })
    ]),
    activityTypes: Object.freeze(['typing', 'mcq']),
    itemCount: 31,
    loadContent: () => import('./g6-u1-mlh-reading-tf-evidence-01.js')
      .then(module => module.global6Unit1MlhReadingTfEvidence01Content)
  })
]);
