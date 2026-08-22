const lessonSpecs = Object.freeze([
  Object.freeze({ key: 'a1', order: 1, title: 'A1 · Tìm từ có âm khác', expectedTimeMinutes: 6, itemCount: 5, activityTypes: ['mcq'] }),
  Object.freeze({ key: 'b2', order: 2, title: 'B2 · Chọn từ đúng', expectedTimeMinutes: 8, itemCount: 6, activityTypes: ['mcq'] }),
  Object.freeze({ key: 'b3', order: 3, title: 'B3 · Đọc mô tả và viết từ', expectedTimeMinutes: 10, itemCount: 8, activityTypes: ['typing'] }),
  Object.freeze({ key: 'b4', order: 4, title: 'B4 · Chia dạng đúng của động từ', expectedTimeMinutes: 14, itemCount: 12, activityTypes: ['typing'] }),
  Object.freeze({ key: 'b5', order: 5, title: 'B5 · Điền từ hoặc cụm từ', expectedTimeMinutes: 10, itemCount: 8, activityTypes: ['mcq'] }),
  Object.freeze({ key: 'b6', order: 6, title: 'B6 · Sắp xếp thành câu', expectedTimeMinutes: 10, itemCount: 5, activityTypes: ['typing'] }),
  Object.freeze({ key: 'c1', order: 7, title: 'C1 · Giới thiệu một người bạn', expectedTimeMinutes: 6, itemCount: 1, activityTypes: ['typing'] }),
  Object.freeze({ key: 'c3', order: 8, title: 'C3 · Nói về trường của em', expectedTimeMinutes: 10, itemCount: 1, activityTypes: ['typing'] }),
  Object.freeze({ key: 'd1', order: 9, title: 'D1 · Điền từ vào bài đọc', expectedTimeMinutes: 10, itemCount: 8, activityTypes: ['mcq'] }),
  Object.freeze({ key: 'd2', order: 10, title: 'D2 · Tom ở trường mới', expectedTimeMinutes: 12, itemCount: 5, activityTypes: ['typing'] }),
  Object.freeze({ key: 'd3', order: 11, title: 'D3 · Tìm sách trong thư viện', expectedTimeMinutes: 12, itemCount: 8, activityTypes: ['mcq'] }),
  Object.freeze({ key: 'e1', order: 12, title: 'E1 · Hoàn thành hội thoại', expectedTimeMinutes: 8, itemCount: 5, activityTypes: ['typing'] }),
  Object.freeze({ key: 'e2', order: 13, title: 'E2 · Tạo câu hoàn chỉnh', expectedTimeMinutes: 10, itemCount: 5, activityTypes: ['typing'] }),
  Object.freeze({ key: 'e3', order: 14, title: 'E3 · Viết về nội quy lớp', expectedTimeMinutes: 15, itemCount: 1, activityTypes: ['typing'] })
]);

export const g6U1WorkbookFolders = Object.freeze([
  Object.freeze({
    id: 'global6-unit1-workbook',
    name: 'Sách bài tập · Unit 1',
    description: 'Bài SBT Global Success 6 Unit 1 giữ nguyên nội dung chữ. A2, B1 và C2 được bỏ vì phụ thuộc hình ảnh; không tạo bài thay thế.',
    parentId: 'global6-unit1',
    order: 1
  })
]);

function descriptor(spec) {
  return Object.freeze({
    id: `g6-u1-wb-${spec.key}`,
    folderId: 'global6-unit1-workbook',
    order: spec.order,
    version: 1,
    course: 'Global Success 6',
    unit: 'Unit 1 · My New School · Sách bài tập',
    title: spec.title,
    subtitle: 'Bài trong SBT · Lời giải & lý thuyết tiếng Việt sau Submit',
    expectedTimeMinutes: spec.expectedTimeMinutes,
    lessonSlug: `g6-u1-wb-${spec.key}`,
    passThreshold: 80,
    completionPolicy: 'explain-and-accept',
    typingTolerance: true,
    teacher: 'Thầy Thành MRT',
    description: `${spec.itemCount} lượt theo đúng bài SBT. Không thêm câu ngoài sách; lời giải và lý thuyết chủ yếu bằng tiếng Việt và chỉ mở sau Submit.`,
    activityTypes: Object.freeze(spec.activityTypes),
    itemCount: spec.itemCount,
    loadContent: () => import('./g6-u1-workbook-content.js').then(module => module.getG6U1WorkbookContent(spec.key))
  });
}

export const g6U1WorkbookRegistry = Object.freeze(lessonSpecs.map(descriptor));
