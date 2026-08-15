const ids = (start, end) => Object.freeze(Array.from({ length: end - start + 1 }, (_, index) => `g6u1-mlh-rg-q${String(start + index).padStart(2, '0')}`));
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
    description: 'Bài Reading Mai Lan Hương Unit 1 theo flow dựng từ → dựng cụm → tự dịch passage → xử lý gap.',
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
  })
]);
