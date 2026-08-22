import { applyG6U3VerifiedAdaptations } from './g6-u3-workbook-verified-adaptations.js';
import { applyG6U3WorkbookInteractionAdaptations } from './g6-u3-workbook-interaction-adaptations.js';
import { applyG6WorkbookTranslationPreload, getG6WorkbookPreloadCount } from './g6-workbook-translation-preload.js';

const lessonSpecs = Object.freeze([
  Object.freeze({ key:'a2', order:1, title:'A2 · Luyện đọc âm /p/ và /b/', expectedTimeMinutes:7, itemCount:3, activityTypes:['typing'] }),
  Object.freeze({ key:'b1', order:2, title:'B1 · Phân loại từ với has và is', expectedTimeMinutes:12, itemCount:3, activityTypes:['classification'] }),
  Object.freeze({ key:'b2', order:3, title:'B2 · Đọc định nghĩa và viết tính từ', expectedTimeMinutes:9, itemCount:6, activityTypes:['typing'] }),
  Object.freeze({ key:'b3', order:4, title:'B3 · Chọn tính từ từ word box', expectedTimeMinutes:8, itemCount:5, activityTypes:['mcq'] }),
  Object.freeze({ key:'b4', order:5, title:'B4 · Chia động từ ở hiện tại tiếp diễn', expectedTimeMinutes:12, itemCount:10, activityTypes:['typing'] }),
  Object.freeze({ key:'b5', order:6, title:'B5 · Hiện tại đơn hay hiện tại tiếp diễn', expectedTimeMinutes:10, itemCount:7, activityTypes:['mcq'] }),
  Object.freeze({ key:'b6', order:7, title:'B6 · Tạo câu ở hiện tại tiếp diễn', expectedTimeMinutes:10, itemCount:6, activityTypes:['sentence_order'] }),
  Object.freeze({ key:'c1', order:8, title:'C1 · Tạo hội thoại từ từ/cụm từ cho sẵn', expectedTimeMinutes:11, itemCount:6, activityTypes:['sentence_order','typing'] }),
  Object.freeze({ key:'c3', order:9, title:'C3 · Miêu tả một người đặc biệt', expectedTimeMinutes:10, itemCount:1, activityTypes:['typing'] }),
  Object.freeze({ key:'d1', order:10, title:'D1 · Chọn từ trong word box cho bài đọc', expectedTimeMinutes:9, itemCount:6, activityTypes:['mcq'] }),
  Object.freeze({ key:'d2', order:11, title:'D2 · Một người bạn tốt là...', expectedTimeMinutes:9, itemCount:1, activityTypes:['typing'] }),
  Object.freeze({ key:'d3', order:12, title:'D3 · Phân loại những điều một người bạn tốt làm', expectedTimeMinutes:9, itemCount:1, activityTypes:['classification'] }),
  Object.freeze({ key:'e1', order:13, title:'E1 · Xác định mở bài, thân bài, kết bài', expectedTimeMinutes:9, itemCount:1, activityTypes:['classification'] }),
  Object.freeze({ key:'e2', order:14, title:'E2 · Ghép câu hỏi với từng phần bài viết', expectedTimeMinutes:10, itemCount:1, activityTypes:['classification'] }),
  Object.freeze({ key:'e3', order:15, title:'E3 · Viết về người bạn thân nhất', expectedTimeMinutes:15, itemCount:1, activityTypes:['typing'] })
]);

export const g6U3WorkbookFolders = Object.freeze([
  Object.freeze({ id:'global6-unit3', name:'Unit 3 · My Friends', description:'Global Success 6 · Unit 3 · My Friends', parentId:'global6', order:3 }),
  Object.freeze({ id:'global6-unit3-workbook', name:'Sách bài tập · Unit 3', description:'Bài SBT Global Success 6 Unit 3 · My Friends. Mỗi bài text-based có Nhắc nhanh → Từ vựng → Cụm từ Anh–Việt → bài SBT.', parentId:'global6-unit3', order:1 })
]);

function descriptor(spec) {
  const preloadCount = getG6WorkbookPreloadCount('u3', spec.key);
  const activityTypes = Object.freeze([...new Set(['mcq', ...spec.activityTypes])]);
  return Object.freeze({
    id:`g6-u3-wb-${spec.key}`, folderId:'global6-unit3-workbook', order:spec.order, version:3,
    course:'Global Success 6', unit:'Unit 3 · My Friends · Sách bài tập', title:spec.title,
    subtitle:'Nhắc nhanh · Từ vựng → Cụm từ Anh–Việt · Bài SBT · Giải thích sau Submit',
    expectedTimeMinutes:spec.expectedTimeMinutes + 4, lessonSlug:`g6-u3-wb-${spec.key}`, passThreshold:80,
    completionPolicy:'explain-and-accept', typingTolerance:true, teacher:'Thầy Thành MRT',
    description:`${preloadCount} lượt nạp nghĩa Anh→Việt + ${spec.itemCount} lượt bài SBT. Bài recall từ chỉ preload từ khóa, không dạy trước target answer.`,
    sourceActivityTypes:Object.freeze(spec.activityTypes), activityTypes,
    sourceItemCount:spec.itemCount, preloadItemCount:preloadCount, itemCount:spec.itemCount + preloadCount,
    loadContent:() => import('./g6-u3-workbook-content.js').then(module => {
      const verified = applyG6U3VerifiedAdaptations(spec.key, module.getG6U3WorkbookContent(spec.key));
      const adapted = applyG6U3WorkbookInteractionAdaptations(spec.key, verified);
      return applyG6WorkbookTranslationPreload('u3', spec.key, adapted);
    })
  });
}

export const g6U3WorkbookRegistry = Object.freeze(lessonSpecs.map(descriptor));