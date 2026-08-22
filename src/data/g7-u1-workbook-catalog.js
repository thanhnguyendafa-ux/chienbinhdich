import { g7U1WorkbookItemCounts } from './g7-u1-workbook-content.js';

const lessonSpecs = Object.freeze([
  Object.freeze({ key:'a2', order:1, title:'A2 · Tìm từ có cách phát âm khác', expectedTimeMinutes:10, activityTypes:['mcq'] }),
  Object.freeze({ key:'b4', order:2, title:'B4 · Chọn dạng động từ đúng', expectedTimeMinutes:12, activityTypes:['mcq'] }),
  Object.freeze({ key:'b5', order:3, title:'B5 · Hiện tại đơn hay hiện tại tiếp diễn', expectedTimeMinutes:15, activityTypes:['mcq','typing'] }),
  Object.freeze({ key:'c1', order:4, title:'C1 · Chọn câu trả lời phù hợp', expectedTimeMinutes:12, activityTypes:['mcq'] }),
  Object.freeze({ key:'c2', order:5, title:'C2 · Hoàn thành hội thoại Mi – Elena', expectedTimeMinutes:13, activityTypes:['mcq','classification'] }),
  Object.freeze({ key:'c3', order:6, title:'C3 · Tạo hội thoại về drawing', expectedTimeMinutes:15, activityTypes:['mcq','typing'] }),
  Object.freeze({ key:'d1', order:7, title:'D1 · Điền từ vào email', expectedTimeMinutes:14, activityTypes:['mcq','typing'] }),
  Object.freeze({ key:'d2', order:8, title:'D2 · Điền từ vào bài đọc về Mark', expectedTimeMinutes:14, activityTypes:['mcq'] }),
  Object.freeze({ key:'d3a', order:9, title:'D3a · Ghép từ với nghĩa', expectedTimeMinutes:12, activityTypes:['mcq','classification'] }),
  Object.freeze({ key:'d3b', order:10, title:'D3b · True / False / No Information', expectedTimeMinutes:15, activityTypes:['mcq'] }),
  Object.freeze({ key:'e1', order:11, title:'E1 · Viết câu từ từ/cụm từ cho sẵn', expectedTimeMinutes:18, activityTypes:['mcq','typing'] }),
  Object.freeze({ key:'e3', order:12, title:'E3 · Hobby của bố / mẹ', expectedTimeMinutes:22, activityTypes:['mcq','typing'] })
]);

export const g7U1WorkbookFolders = Object.freeze([
  Object.freeze({
    id:'global7-unit1-workbook',
    name:'Sách bài tập · Unit 1',
    description:'SBT Global Success 7 Unit 1 · Hobbies. Mỗi link: Nhắc nhanh → dịch từ vựng MCQ → dịch cụm từ MCQ → bài SBT → giải thích tiếng Việt. A1, B1, B2, B3 và E2 không production vì phụ thuộc trực tiếp vào hình ảnh hoặc bộ dữ liệu hình.',
    parentId:'global7-unit1',
    order:1
  })
]);

function descriptor(spec) {
  return Object.freeze({
    id:`g7-u1-wb-${spec.key}`,
    folderId:'global7-unit1-workbook',
    order:spec.order,
    version:1,
    course:'Global Success 7',
    unit:'Unit 1 · Hobbies · Sách bài tập',
    title:spec.title,
    subtitle:'Nhắc nhanh → Từ vựng MCQ → Cụm từ MCQ → Bài SBT → Giải thích',
    expectedTimeMinutes:spec.expectedTimeMinutes,
    lessonSlug:`g7-u1-wb-${spec.key}`,
    passThreshold:80,
    completionPolicy:'explain-and-accept',
    typingTolerance:true,
    teacher:'Thầy Thành MRT',
    description:`${g7U1WorkbookItemCounts[spec.key]} lượt. Từ/cụm được nạp lại bằng Anh → Việt MCQ trước khi học sinh vào bài SBT; bài mở vẫn giữ production.`,
    activityTypes:Object.freeze(spec.activityTypes),
    itemCount:g7U1WorkbookItemCounts[spec.key],
    loadContent:() => import('./g7-u1-workbook-content.js').then(module => module.getG7U1WorkbookContent(spec.key))
  });
}

export const g7U1WorkbookRegistry = Object.freeze(lessonSpecs.map(descriptor));
