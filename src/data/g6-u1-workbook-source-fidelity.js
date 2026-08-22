import { freeze,preTheory,sentenceOrder } from './workbook-content-helpers.js';

const ADAPTATION = freeze({
  sourceResponseType:'written_question_and_answer_from_cues',
  adaptedResponseType:'sentence_order',
  reason:'Cues đã cho đủ nội dung; app giữ bài xây Q&A nhưng dùng khối câu để chấm thứ tự và do/does chính xác mà không cần hình.'
});

const theory = preTheory({
  title:'Nhắc nhanh · Từ cues dựng câu hỏi rồi trả lời',
  intro:'Hình chỉ minh hoạ. Cues đã cho đủ người, hoạt động và thời gian. Con nhìn chủ ngữ trước để chọn do hay does.',
  sourceSections:['SBT trang 6 · C. Speaking · Bài 2'],
  sections:[
    { heading:'Câu hỏi',bullets:['he / she / một tên → does + V nguyên mẫu.','you / we / they / chủ ngữ số nhiều → do + V nguyên mẫu.'] },
    { heading:'Câu trả lời',bullets:['He / She + động từ thường thêm -s/-es.','They + động từ nguyên mẫu.','in the morning · every Thursday · at 6 a.m. là phần thời gian.'] },
    { heading:'Bẫy',bullets:['does David listen ✓ · does David listens ✗','grandfather reads ✓ · grandfather read ✗ trong câu khẳng định thói quen.'] }
  ],
  summary:'Ai? → do/does → V nguyên mẫu trong câu hỏi; trả lời rồi mới chia động từ theo chủ ngữ.'
});

const q = (id,prompt,correctOrder,tokens,reason,example) => sentenceOrder({
  id,prompt,correctOrder,tokens,reason,
  theory:'Câu hỏi hiện tại đơn: từ hỏi + do/does + chủ ngữ + V nguyên mẫu.',example,adaptation:ADAPTATION
});
const a = (id,prompt,correctOrder,tokens,reason,example) => sentenceOrder({
  id,prompt,correctOrder,tokens,reason,
  theory:'Câu trả lời thói quen dùng Present Simple và đặt cụm thời gian ở vị trí tự nhiên.',example,adaptation:ADAPTATION
});

const items = freeze([
  q('g6-u1-wb-c2-01q','1A. Dựng câu hỏi từ cue: your grandfather / usually / read newspapers / morning (When)',
    ['When','does','your grandfather','usually','read','newspapers?'],
    ['When','does','do','your grandfather','usually','read','reads','newspapers?'],
    'your grandfather = he nên dùng does; sau does phải là read, không phải reads.','When does your grandfather usually read newspapers?'),
  a('g6-u1-wb-c2-01a','1B. Dựng câu trả lời cho câu 1.',
    ['He','usually','reads newspapers','in the morning.'],
    ['He','They','usually','read newspapers','reads newspapers','in the morning.','at the morning.'],
    'He là ngôi thứ ba số ít nên read → reads. Cụm đúng là in the morning.','He usually reads newspapers in the morning.'),

  q('g6-u1-wb-c2-02q','2A. Dựng câu hỏi từ cue: teacher and students / do experiments / every Thursday (How often)',
    ['How often','do','the teacher and students','do experiments?'],
    ['How often','does','do','the teacher and students','does experiments?','do experiments?'],
    'the teacher and students là nhiều người nên dùng do. Sau do, động từ chính vẫn là do experiments.','How often do the teacher and students do experiments?'),
  a('g6-u1-wb-c2-02a','2B. Dựng câu trả lời cho câu 2.',
    ['They','do experiments','every Thursday.'],
    ['They','He','do experiments','does experiments','every Thursday.','at every Thursday.'],
    'Chủ ngữ được thay bằng They nên dùng do experiments; every Thursday diễn tả tần suất.','They do experiments every Thursday.'),

  q('g6-u1-wb-c2-03q','3A. Dựng câu hỏi từ cue: boys / often / do / after school / play football (What)',
    ['What','do','the boys','often','do','after school?'],
    ['What','does','do','the boys','often','do','does','after school?'],
    'the boys là số nhiều nên dùng do. What ... do? hỏi các bạn nam thường làm gì.','What do the boys often do after school?'),
  a('g6-u1-wb-c2-03a','3B. Dựng câu trả lời cho câu 3.',
    ['They','often','play football','after school.'],
    ['They','He','often','plays football','play football','after school.'],
    'They là số nhiều nên dùng play, không plays.','They often play football after school.'),

  q('g6-u1-wb-c2-04q','4A. Dựng câu hỏi từ cue: these old people / usually / have a walk / 6 a.m. (What time)',
    ['What time','do','these old people','usually','have a walk?'],
    ['What time','does','do','these old people','usually','has a walk?','have a walk?'],
    'these old people là số nhiều nên câu hỏi dùng do + have.','What time do these old people usually have a walk?'),
  a('g6-u1-wb-c2-04a','4B. Dựng câu trả lời cho câu 4.',
    ['They','usually','have a walk','at 6 a.m.'],
    ['They','He','usually','have a walk','has a walk','at 6 a.m.','in 6 a.m.'],
    'They dùng have; trước giờ cụ thể dùng at.','They usually have a walk at 6 a.m.'),

  q('g6-u1-wb-c2-05q','5A. Dựng câu hỏi từ cue: David / often / listen to music / 9 p.m. (What time)',
    ['What time','does','David','often','listen to music?'],
    ['What time','does','do','David','often','listen to music?','listens to music?'],
    'David = he nên dùng does; sau does dùng listen nguyên mẫu.','What time does David often listen to music?'),
  a('g6-u1-wb-c2-05a','5B. Dựng câu trả lời cho câu 5.',
    ['He','often','listens to music','at 9 p.m.'],
    ['He','They','often','listen to music','listens to music','at 9 p.m.','in 9 p.m.'],
    'He là số ít nên listen → listens; trước giờ dùng at.','He often listens to music at 9 p.m.')
]);

export function getG6U1WorkbookSourceFidelityContent(key) {
  if (String(key).toLowerCase() !== 'c2') throw new Error(`Unknown G6 U1 recovered lesson: ${key}`);
  return freeze({ preLessonTheory:theory,items });
}
