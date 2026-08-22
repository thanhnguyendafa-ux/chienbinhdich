import { g7U3WorkbookItemCounts } from './g7-u3-workbook-content.js';

const lessonSpecs = Object.freeze([
  {key:'a1',order:1,title:'A1 · Phân biệt -ed /t/ /d/ /ɪd/',expectedTimeMinutes:11,activityTypes:['mcq']},
  {key:'a2',order:2,title:'A2 · Phân loại -ed trong hội thoại',expectedTimeMinutes:14,activityTypes:['mcq','classification']},
  {key:'b2',order:3,title:'B2 · Ghép động từ với cụm từ',expectedTimeMinutes:13,activityTypes:['mcq','classification']},
  {key:'b3',order:4,title:'B3 · Điền community-service phrases',expectedTimeMinutes:15,activityTypes:['mcq','typing']},
  {key:'b4',order:5,title:'B4 · Chia động từ theo mốc thời gian',expectedTimeMinutes:15,activityTypes:['mcq','typing']},
  {key:'b5',order:6,title:'B5 · Chia động từ trong passage',expectedTimeMinutes:18,activityTypes:['mcq','typing']},
  {key:'b6',order:7,title:'B6 · Hoàn thành hội thoại A–F',expectedTimeMinutes:14,activityTypes:['mcq','classification']},
  {key:'c1',order:8,title:'C1 · Khen hoạt động tình nguyện',expectedTimeMinutes:12,activityTypes:['mcq','typing']},
  {key:'c2',order:9,title:'C2 · Ghép người với hoạt động phù hợp',expectedTimeMinutes:14,activityTypes:['mcq','classification']},
  {key:'c3',order:10,title:'C3 · Ghép hoạt động với lợi ích',expectedTimeMinutes:15,activityTypes:['mcq','classification','typing']},
  {key:'d1',order:11,title:'D1 · Cloze volunteer activities',expectedTimeMinutes:18,activityTypes:['mcq']},
  {key:'d2a',order:12,title:'D2a · Ghép từ với nghĩa',expectedTimeMinutes:14,activityTypes:['mcq','classification']},
  {key:'d2b',order:13,title:'D2b · True / False',expectedTimeMinutes:15,activityTypes:['mcq']},
  {key:'d3',order:14,title:'D3 · Benefits of volunteering',expectedTimeMinutes:18,activityTypes:['mcq']},
  {key:'e1',order:15,title:'E1 · Tạo câu từ cues',expectedTimeMinutes:19,activityTypes:['mcq','typing']},
  {key:'e2',order:16,title:'E2 · Viết lại câu cùng nghĩa',expectedTimeMinutes:19,activityTypes:['mcq','typing']},
  {key:'e3',order:17,title:'E3 · Viết thư về volunteer activities',expectedTimeMinutes:20,activityTypes:['mcq','typing']}
].map(Object.freeze));

export const g7U3WorkbookFolders = Object.freeze([
  Object.freeze({id:'global7-unit3',name:'Unit 3 · Community Service',description:'Kho bài Global Success 7 Unit 3 · Community Service.',parentId:'global7',order:3}),
  Object.freeze({id:'global7-unit3-workbook',name:'Sách bài tập · Unit 3',description:'SBT Global Success 7 Unit 3 · Community Service. Mỗi link: Nhắc nhanh → từ vựng MCQ → cụm từ MCQ → bài SBT → giải thích tiếng Việt. B1 không production vì đáp án phụ thuộc trực tiếp vào hình.',parentId:'global7-unit3',order:1})
]);

function descriptor(spec){return Object.freeze({
  id:`g7-u3-wb-${spec.key}`,folderId:'global7-unit3-workbook',order:spec.order,version:1,course:'Global Success 7',unit:'Unit 3 · Community Service · Sách bài tập',title:spec.title,
  subtitle:'Nhắc nhanh → Từ vựng MCQ → Cụm từ MCQ → Bài SBT → Giải thích',expectedTimeMinutes:spec.expectedTimeMinutes,lessonSlug:`g7-u3-wb-${spec.key}`,passThreshold:80,completionPolicy:'explain-and-accept',typingTolerance:true,teacher:'Thầy Thành MRT',
  description:`${g7U3WorkbookItemCounts[spec.key]} lượt. Preload Anh → Việt giảm tải từ vựng trước bài; matching/typing/reading giữ đúng mục tiêu nguồn.`,activityTypes:Object.freeze(spec.activityTypes),itemCount:g7U3WorkbookItemCounts[spec.key],
  loadContent:()=>import('./g7-u3-workbook-content.js').then(module=>module.getG7U3WorkbookContent(spec.key))
});}
export const g7U3WorkbookRegistry=Object.freeze(lessonSpecs.map(descriptor));
