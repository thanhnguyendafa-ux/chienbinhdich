import { getG6U1MixedTestContent } from './g6-u1-mixed-tests-content.js';

const specs = Object.freeze([
  Object.freeze({ id: "g6-u01-mixed-test-01", order: 1, title: "Test 01 · Nền tảng & nhận diện", activityTypes: Object.freeze(["mcq", "typing", "true_false", "sentence_order"]) }),
  Object.freeze({ id: "g6-u01-mixed-test-02", order: 2, title: "Test 02 · Vận dụng dạng đề", activityTypes: Object.freeze(["mcq", "typing", "matching", "sequence_number", "true_false", "sentence_order"]) }),
  Object.freeze({ id: "g6-u01-mixed-test-03", order: 3, title: "Test 03 · Ngữ cảnh & đọc hiểu", activityTypes: Object.freeze(["mcq", "matching", "typing", "true_false", "sentence_order"]) }),
  Object.freeze({ id: "g6-u01-mixed-test-04", order: 4, title: "Test 04 · Tổng hợp cuối Unit 1", activityTypes: Object.freeze(["mcq", "typing", "matching", "sequence_number", "true_false", "sentence_order"]) }),
]);

export const g6U1MixedTestFolders = Object.freeze([
  Object.freeze({
    id: 'global6-unit1-mixed-tests',
    name: 'Unit Tests · 25 câu · Mixed exam formats',
    description: '4 bài test Unit 1, mỗi bài 25 câu, giữ dạng đề: MCQ, fill/typing, True-False, matching, dialogue order, sentence order, error correction và writing có kiểm soát. Sau Submit, lời giải theo khung Hiểu câu / Meaning → Vì sao / Why → Quy tắc / Rule → Đáp án / Correct answer để học sinh yếu theo kịp.',
    parentId: 'global6-unit1',
    order: 95
  })
]);

export const g6U1MixedTestRegistry = Object.freeze(specs.map(spec => Object.freeze({
  id: spec.id,
  folderId: 'global6-unit1-mixed-tests',
  order: spec.order,
  version: 2,
  course: 'Global Success 6',
  unit: 'Unit 1 · My New School',
  title: spec.title,
  subtitle: '25 câu · Dạng đề thật · Giải thích Việt–Anh theo ý nghĩa câu sau Submit',
  expectedTimeMinutes: 30,
  lessonSlug: spec.id,
  passThreshold: 90,
  completionPolicy: 'all-items',
  typingTolerance: true,
  teacher: 'Thầy Thành MRT',
  description: 'Mixed Unit 1 test grounded in TAP 1 exercise formats and the GS6 Unit 1 corpus. Student view stays exam-like. Post-submit feedback now explains question meaning/context, why the answer fits, the relevant rule, and the correct answer with selected bilingual Vietnamese-English support.',
  activityTypes: spec.activityTypes,
  itemCount: 25,
  loadContent: () => Promise.resolve(getG6U1MixedTestContent(spec.id))
})));
