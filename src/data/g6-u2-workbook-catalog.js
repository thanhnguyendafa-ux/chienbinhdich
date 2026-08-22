import { adaptG6U2WorkbookLongAnswers } from './g6-u2-workbook-mcq-adaptations.js';
import { applyG6U2WorkbookInteractionAdaptations } from './g6-u2-workbook-interaction-adaptations.js';
import { applyG6WorkbookTranslationPreload, getG6WorkbookPreloadCount } from './g6-workbook-preload-registry.js';

const lessonSpecs = Object.freeze([
  Object.freeze({ key:'a1', order:1, title:'A1 · Phân biệt âm cuối -s /s/ và /z/', expectedTimeMinutes:6, itemCount:1, activityTypes:['classification'] }),
  Object.freeze({ key:'a2', order:2, title:'A2 · Viết từ theo âm cuối /s/ và /z/', expectedTimeMinutes:7, itemCount:2, activityTypes:['typing'] }),
  Object.freeze({ key:'b2', order:3, title:'B2 · Dò 8 từ trong word search', expectedTimeMinutes:9, itemCount:1, activityTypes:['classification'] }),
  Object.freeze({ key:'b3', order:4, title:'B3 · Tìm từ không cùng nhóm', expectedTimeMinutes:7, itemCount:5, activityTypes:['mcq'] }),
  Object.freeze({ key:'b4', order:5, title:"B4 · Dạng sở hữu 's", expectedTimeMinutes:9, itemCount:6, activityTypes:['typing'] }),
  Object.freeze({ key:'c1', order:6, title:'C1 · Sắp xếp hội thoại', expectedTimeMinutes:7, itemCount:1, activityTypes:['sequence_number'] }),
  Object.freeze({ key:'c2', order:7, title:'C2 · Hoàn thành hội thoại', expectedTimeMinutes:9, itemCount:5, activityTypes:['mcq'] }),
  Object.freeze({ key:'c3', order:8, title:'C3 · Tạo hội thoại từ từ/cụm từ cho sẵn', expectedTimeMinutes:12, itemCount:7, activityTypes:['sentence_order','typing'] }),
  Object.freeze({ key:'d1', order:9, title:'D1 · Chọn từ trong word box cho đoạn văn', expectedTimeMinutes:11, itemCount:8, activityTypes:['mcq'] }),
  Object.freeze({ key:'d2', order:10, title:'D2 · Chọn từ hoàn thành hội thoại', expectedTimeMinutes:10, itemCount:6, activityTypes:['mcq'] }),
  Object.freeze({ key:'d3b', order:11, title:'D3b · Đọc email Vy và Tom rồi trả lời', expectedTimeMinutes:12, itemCount:5, activityTypes:['mcq'] }),
  Object.freeze({ key:'e1', order:12, title:'E1 · Viết lại câu cùng nghĩa', expectedTimeMinutes:10, itemCount:5, activityTypes:['typing'] }),
  Object.freeze({ key:'e2', order:13, title:'E2 · Trả lời về căn phòng yêu thích', expectedTimeMinutes:8, itemCount:3, activityTypes:['typing'] }),
  Object.freeze({ key:'e3', order:14, title:'E3 · Ghép đoạn mô tả căn phòng yêu thích', expectedTimeMinutes:12, itemCount:5, activityTypes:['sentence_order'] })
]);

export const g6U2WorkbookFolders = Object.freeze([
  Object.freeze({ id:'global6-unit2-workbook', name:'Sách bài tập · Unit 2', description:'Bài SBT Global Success 6 Unit 2 · My House. B2 word-search được dựng lại bằng grid chữ; E3 bỏ phần vẽ nhưng giữ phần viết guided. B1, B5 và D3a còn loại vì đáp án thật sự cần hình.', parentId:'global6-unit2', order:3 })
]);

function sourceFaithfulContent(key, content) {
  if (!['c3','d3b'].includes(key)) return content;
  return Object.freeze({ ...content, items:Object.freeze(content.items.map(item => {
    if (item.id === 'g6-u2-wb-c3-06') return Object.freeze({ ...item, acceptedAnswers:Object.freeze([]) });
    if (item.id === 'g6-u2-wb-d3b-02') return Object.freeze({ ...item, acceptedAnswers:Object.freeze((item.acceptedAnswers ?? []).filter(answer => !/\btable\b/i.test(answer))) });
    return item;
  })) });
}

function loadSourceContent(key) {
  if (['b2','e3'].includes(key)) return import('./g6-u2-workbook-source-fidelity.js').then(module => module.getG6U2WorkbookSourceFidelityContent(key));
  return import('./g6-u2-workbook-content.js').then(module => sourceFaithfulContent(key,module.getG6U2WorkbookContent(key)));
}

function descriptor(spec) {
  const preloadCount = getG6WorkbookPreloadCount('u2', spec.key);
  const activityTypes = Object.freeze([...new Set(['mcq', ...spec.activityTypes])]);
  return Object.freeze({
    id:`g6-u2-wb-${spec.key}`, folderId:'global6-unit2-workbook', order:spec.order, version:5,
    course:'Global Success 6', unit:'Unit 2 · My House · Sách bài tập', title:spec.title,
    subtitle:'Nhắc nhanh · Từ vựng → Cụm từ Anh–Việt · Bài SBT · Giải thích sau Submit',
    expectedTimeMinutes:spec.expectedTimeMinutes + 4, lessonSlug:`g6-u2-wb-${spec.key}`, passThreshold:80,
    completionPolicy:'explain-and-accept', typingTolerance:true, teacher:'Thầy Thành MRT',
    description:`${preloadCount} lượt nạp nghĩa Anh→Việt + ${spec.itemCount} lượt bài SBT. Preload không chỉ vị trí đáp án nguồn.`,
    sourceActivityTypes:Object.freeze(spec.activityTypes), activityTypes,
    sourceItemCount:spec.itemCount, preloadItemCount:preloadCount, itemCount:spec.itemCount + preloadCount,
    loadContent:() => loadSourceContent(spec.key).then(sourceContent => {
      const stableContent = adaptG6U2WorkbookLongAnswers(spec.key, sourceContent);
      const adapted = applyG6U2WorkbookInteractionAdaptations(spec.key, stableContent);
      return applyG6WorkbookTranslationPreload('u2', spec.key, adapted);
    })
  });
}

export const g6U2WorkbookRegistry = Object.freeze(lessonSpecs.map(descriptor));
