import { adaptG6U2WorkbookLongAnswers } from './g6-u2-workbook-mcq-adaptations.js';
import { applyG6U2WorkbookInteractionAdaptations } from './g6-u2-workbook-interaction-adaptations.js';

const lessonSpecs = Object.freeze([
  Object.freeze({ key:'a1', order:1, title:'A1 · Phân biệt âm cuối -s /s/ và /z/', expectedTimeMinutes:6, itemCount:1, activityTypes:['classification'] }),
  Object.freeze({ key:'a2', order:2, title:'A2 · Viết từ theo âm cuối /s/ và /z/', expectedTimeMinutes:7, itemCount:2, activityTypes:['typing'] }),
  Object.freeze({ key:'b3', order:3, title:'B3 · Tìm từ không cùng nhóm', expectedTimeMinutes:7, itemCount:5, activityTypes:['mcq'] }),
  Object.freeze({ key:'b4', order:4, title:"B4 · Dạng sở hữu 's", expectedTimeMinutes:9, itemCount:6, activityTypes:['typing'] }),
  Object.freeze({ key:'c1', order:5, title:'C1 · Sắp xếp hội thoại', expectedTimeMinutes:7, itemCount:1, activityTypes:['sequence_number'] }),
  Object.freeze({ key:'c2', order:6, title:'C2 · Hoàn thành hội thoại', expectedTimeMinutes:9, itemCount:5, activityTypes:['mcq'] }),
  Object.freeze({ key:'c3', order:7, title:'C3 · Tạo hội thoại từ từ/cụm từ cho sẵn', expectedTimeMinutes:12, itemCount:7, activityTypes:['sentence_order','typing'] }),
  Object.freeze({ key:'d1', order:8, title:'D1 · Chọn từ trong word box cho đoạn văn', expectedTimeMinutes:11, itemCount:8, activityTypes:['mcq'] }),
  Object.freeze({ key:'d2', order:9, title:'D2 · Chọn từ hoàn thành hội thoại', expectedTimeMinutes:10, itemCount:6, activityTypes:['mcq'] }),
  Object.freeze({ key:'d3b', order:10, title:'D3b · Đọc email Vy và Tom rồi trả lời', expectedTimeMinutes:12, itemCount:5, activityTypes:['mcq'] }),
  Object.freeze({ key:'e1', order:11, title:'E1 · Viết lại câu cùng nghĩa bằng cách sắp khối', expectedTimeMinutes:10, itemCount:5, activityTypes:['sentence_order'] }),
  Object.freeze({ key:'e2', order:12, title:'E2 · Trả lời về căn phòng yêu thích', expectedTimeMinutes:8, itemCount:3, activityTypes:['typing'] })
]);

export const g6U2WorkbookFolders = Object.freeze([
  Object.freeze({
    id:'global6-unit2-workbook',
    name:'Sách bài tập · Unit 2',
    description:'Bài SBT Global Success 6 Unit 2 · My House. B1, B2, B5, D3a và E3 được bỏ vì phụ thuộc hình ảnh; các bài còn lại dùng classification, MCQ, sequence, sentence order hoặc open typing theo mục tiêu nguồn.',
    parentId:'global6-unit2',
    order:3
  })
]);

function sourceFaithfulContent(key, content) {
  if (!['c3', 'd3b'].includes(key)) return content;
  return Object.freeze({
    ...content,
    items:Object.freeze(content.items.map(item => {
      if (item.id === 'g6-u2-wb-c3-06') {
        return Object.freeze({ ...item, acceptedAnswers:Object.freeze([]) });
      }
      if (item.id === 'g6-u2-wb-d3b-02') {
        const acceptedAnswers = (item.acceptedAnswers ?? []).filter(answer => !/\btable\b/i.test(answer));
        return Object.freeze({ ...item, acceptedAnswers:Object.freeze(acceptedAnswers) });
      }
      return item;
    }))
  });
}

function descriptor(spec) {
  return Object.freeze({
    id:`g6-u2-wb-${spec.key}`,
    folderId:'global6-unit2-workbook',
    order:spec.order,
    version:3,
    course:'Global Success 6',
    unit:'Unit 2 · My House · Sách bài tập',
    title:spec.title,
    subtitle:'Nhắc nhanh · Interaction theo mục tiêu bài · Giải thích sau Submit',
    expectedTimeMinutes:spec.expectedTimeMinutes,
    lessonSlug:`g6-u2-wb-${spec.key}`,
    passThreshold:80,
    completionPolicy:'explain-and-accept',
    typingTolerance:true,
    teacher:'Thầy Thành MRT',
    description:`${spec.itemCount} lượt theo bài SBT. Typing chỉ giữ cho recall ngắn hoặc câu mở; bài cues dùng sentence order và word box dùng lựa chọn trực tiếp.`,
    activityTypes:Object.freeze(spec.activityTypes),
    itemCount:spec.itemCount,
    loadContent:() => import('./g6-u2-workbook-content.js').then(module => {
      const sourceContent = sourceFaithfulContent(spec.key, module.getG6U2WorkbookContent(spec.key));
      const stableContent = adaptG6U2WorkbookLongAnswers(spec.key, sourceContent);
      return applyG6U2WorkbookInteractionAdaptations(spec.key, stableContent);
    })
  });
}

export const g6U2WorkbookRegistry = Object.freeze(lessonSpecs.map(descriptor));