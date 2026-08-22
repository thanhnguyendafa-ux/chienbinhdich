import { applyG6U1WorkbookInteractionAdaptations } from './g6-u1-workbook-interaction-adaptations.js';
import { applyG6WorkbookTranslationPreload, getG6WorkbookPreloadCount } from './g6-workbook-translation-preload.js';

const lessonSpecs = Object.freeze([
  Object.freeze({ key: 'a1', order: 1, title: 'A1 · Tìm từ có âm khác', expectedTimeMinutes: 6, itemCount: 5, activityTypes: ['mcq'] }),
  Object.freeze({ key: 'b2', order: 2, title: 'B2 · Chọn từ đúng', expectedTimeMinutes: 8, itemCount: 6, activityTypes: ['mcq'] }),
  Object.freeze({ key: 'b3', order: 3, title: 'B3 · Đọc mô tả và viết từ', expectedTimeMinutes: 10, itemCount: 8, activityTypes: ['typing'] }),
  Object.freeze({ key: 'b4', order: 4, title: 'B4 · Chia dạng đúng của động từ', expectedTimeMinutes: 14, itemCount: 12, activityTypes: ['typing'] }),
  Object.freeze({ key: 'b5', order: 5, title: 'B5 · Chọn từ trong word box', expectedTimeMinutes: 9, itemCount: 8, activityTypes: ['mcq'] }),
  Object.freeze({ key: 'b6', order: 6, title: 'B6 · Sắp xếp thành câu', expectedTimeMinutes: 10, itemCount: 5, activityTypes: ['sentence_order'] }),
  Object.freeze({ key: 'c1', order: 7, title: 'C1 · Giới thiệu một người bạn', expectedTimeMinutes: 6, itemCount: 1, activityTypes: ['typing'] }),
  Object.freeze({ key: 'c3', order: 8, title: 'C3 · Nói về trường của em', expectedTimeMinutes: 10, itemCount: 1, activityTypes: ['typing'] }),
  Object.freeze({ key: 'd1', order: 9, title: 'D1 · Chọn từ trong word box cho bài đọc', expectedTimeMinutes: 10, itemCount: 8, activityTypes: ['mcq'] }),
  Object.freeze({ key: 'd2', order: 10, title: 'D2 · Tom ở trường mới', expectedTimeMinutes: 12, itemCount: 5, activityTypes: ['mcq','typing'] }),
  Object.freeze({ key: 'd3', order: 11, title: 'D3 · Tìm sách trong thư viện', expectedTimeMinutes: 12, itemCount: 8, activityTypes: ['mcq'] }),
  Object.freeze({ key: 'e1', order: 12, title: 'E1 · Hoàn thành hội thoại bằng cách sắp khối', expectedTimeMinutes: 8, itemCount: 5, activityTypes: ['sentence_order'] }),
  Object.freeze({ key: 'e2', order: 13, title: 'E2 · Tạo câu hoàn chỉnh từ cues', expectedTimeMinutes: 10, itemCount: 5, activityTypes: ['sentence_order'] }),
  Object.freeze({ key: 'e3', order: 14, title: 'E3 · Viết về nội quy lớp', expectedTimeMinutes: 15, itemCount: 1, activityTypes: ['typing'] })
]);

export const g6U1WorkbookFolders = Object.freeze([
  Object.freeze({ id:'global6-unit1-workbook', name:'Sách bài tập · Unit 1', description:'Bài SBT Global Success 6 Unit 1 giữ mục tiêu nguồn và thêm preload Anh→Việt theo từng bài: Nhắc nhanh → Từ vựng → Cụm từ → bài SBT.', parentId:'global6-unit1', order:1 })
]);

function descriptor(spec) {
  const preloadCount = getG6WorkbookPreloadCount('u1', spec.key);
  const activityTypes = Object.freeze([...new Set(['mcq', ...spec.activityTypes])]);
  return Object.freeze({
    id:`g6-u1-wb-${spec.key}`, folderId:'global6-unit1-workbook', order:spec.order, version:3,
    course:'Global Success 6', unit:'Unit 1 · My New School · Sách bài tập', title:spec.title,
    subtitle:'Nhắc nhanh · Từ vựng → Cụm từ Anh–Việt · Bài SBT · Giải thích sau Submit',
    expectedTimeMinutes:spec.expectedTimeMinutes + 4, lessonSlug:`g6-u1-wb-${spec.key}`, passThreshold:80,
    completionPolicy:'explain-and-accept', typingTolerance:true, teacher:'Thầy Thành MRT',
    description:`${preloadCount} lượt nạp nghĩa Anh→Việt + ${spec.itemCount} lượt bài SBT. Preload chỉ dạy semantic core, không gắn từ với vị trí đáp án nguồn.`,
    sourceActivityTypes:Object.freeze(spec.activityTypes), activityTypes,
    sourceItemCount:spec.itemCount, preloadItemCount:preloadCount, itemCount:spec.itemCount + preloadCount,
    loadContent:() => import('./g6-u1-workbook-content.js').then(module => {
      const adapted = applyG6U1WorkbookInteractionAdaptations(spec.key, module.getG6U1WorkbookContent(spec.key));
      return applyG6WorkbookTranslationPreload('u1', spec.key, adapted);
    })
  });
}

export const g6U1WorkbookRegistry = Object.freeze(lessonSpecs.map(descriptor));