import { g7U2WorkbookItemCounts } from './g7-u2-workbook-content.js';
import { applyG7U2WorkbookSourceFidelity,getG7U2WorkbookFidelityItemCount } from './g7-u2-workbook-source-fidelity.js';

const lessonSpecs = Object.freeze([
  {key:'a1',order:1,title:'A1 · Tìm từ có cách phát âm khác',expectedTimeMinutes:10,activityTypes:['mcq']},
  {key:'a2',order:2,title:'A2 · Luyện đọc /f/ và /v/',expectedTimeMinutes:12,activityTypes:['mcq','typing']},
  {key:'b2',order:3,title:'B2 · Mở rộng nhóm từ Healthy Living',expectedTimeMinutes:15,activityTypes:['mcq','typing']},
  {key:'b3',order:4,title:'B3 · Điền từ vào câu',expectedTimeMinutes:14,activityTypes:['mcq','typing']},
  {key:'b4',order:5,title:'B4 · Nhận diện nhóm từ',expectedTimeMinutes:13,activityTypes:['mcq','typing']},
  {key:'b5',order:6,title:'B5 · Sắp xếp từ thành câu',expectedTimeMinutes:15,activityTypes:['mcq','sentence_order']},
  {key:'b6',order:7,title:'B6 · Phân loại S / V / O / ADV',expectedTimeMinutes:15,activityTypes:['mcq','classification']},
  {key:'c1',order:8,title:'C1 · Mẹo nào tốt cho sức khỏe?',expectedTimeMinutes:12,activityTypes:['mcq','typing']},
  {key:'c2',order:9,title:'C2 · Đồng ý / không đồng ý và giải thích',expectedTimeMinutes:12,activityTypes:['mcq','typing']},
  {key:'c3',order:10,title:'C3 · Ba việc giữ nhà sạch',expectedTimeMinutes:12,activityTypes:['mcq','typing']},
  {key:'d1',order:11,title:'D1 · Đọc health tips rồi điền từ',expectedTimeMinutes:18,activityTypes:['mcq','typing']},
  {key:'d2',order:12,title:'D2 · Cloze về vườn của ông bà',expectedTimeMinutes:18,activityTypes:['mcq']},
  {key:'d3',order:13,title:'D3 · Đọc về Spain và Mediterranean diet',expectedTimeMinutes:16,activityTypes:['mcq']},
  {key:'e1',order:14,title:'E1 · Viết câu từ prompts',expectedTimeMinutes:18,activityTypes:['mcq','typing']},
  {key:'e2',order:15,title:'E2 · Viết lý do cho health tips',expectedTimeMinutes:18,activityTypes:['mcq','typing']},
  {key:'e3',order:16,title:'E3 · Chọn healthy habits rồi ghép đoạn khoảng 70 từ',expectedTimeMinutes:20,activityTypes:['mcq','sentence_order']}
].map(Object.freeze));

export const g7U2WorkbookFolders = Object.freeze([
  Object.freeze({id:'global7-unit2-workbook',name:'Sách bài tập · Unit 2',description:'SBT Global Success 7 Unit 2 · Healthy Living. Mỗi link: Nhắc nhanh → từ vựng MCQ → cụm từ MCQ → bài SBT → giải thích tiếng Việt. B1 không production vì đáp án phụ thuộc trực tiếp vào hình.',parentId:'global7-unit2',order:2})
]);

function descriptor(spec){
  const itemCount = getG7U2WorkbookFidelityItemCount(spec.key,g7U2WorkbookItemCounts[spec.key]);
  return Object.freeze({
    id:`g7-u2-wb-${spec.key}`,folderId:'global7-unit2-workbook',order:spec.order,version:2,course:'Global Success 7',unit:'Unit 2 · Healthy Living · Sách bài tập',title:spec.title,
    subtitle:'Nhắc nhanh → Từ vựng MCQ → Cụm từ MCQ → Bài SBT → Giải thích',expectedTimeMinutes:spec.expectedTimeMinutes,lessonSlug:`g7-u2-wb-${spec.key}`,passThreshold:80,completionPolicy:'explain-and-accept',typingTolerance:true,teacher:'Thầy Thành MRT',
    description:`${itemCount} lượt. Preload Anh → Việt giảm tải từ vựng trước bài; interaction giữ theo mục tiêu nguồn.`,activityTypes:Object.freeze(spec.activityTypes),itemCount,
    loadContent:()=>import('./g7-u2-workbook-content.js').then(module=>applyG7U2WorkbookSourceFidelity(spec.key,module.getG7U2WorkbookContent(spec.key)))
  });
}
export const g7U2WorkbookRegistry=Object.freeze(lessonSpecs.map(descriptor));
