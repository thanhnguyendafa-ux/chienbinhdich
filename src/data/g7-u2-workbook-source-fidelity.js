import { freeze,preTheory,mcq,sentenceOrder } from './workbook-content-helpers.js';

const theory = preTheory({
  title:'Nhắc nhanh · Chọn thói quen rồi ghép đoạn Healthy Living',
  intro:'Sách yêu cầu chọn thói quen trước rồi viết khoảng 70 từ. App giữ hai bước nhưng biến phần viết mở thành guided sentence order để chấm online.',
  sourceSections:['SBT trang 15 · E. Writing · Bài 3'],
  sections:[
    { heading:'Bước 1 · Chọn ý',bullets:['Các thói quen tốt phải giúp cơ thể hoặc tinh thần khỏe hơn.','“eat a lot of meat and snacks” không phải lựa chọn tốt cho một healthy-life paragraph.'] },
    { heading:'Bước 2 · Xây đoạn',bullets:['Mỗi câu nói một thói quen hoặc lợi ích.','Dùng because / so / to để nói lý do hoặc mục đích.','Sáu câu guided dưới đây ghép thành khoảng 70 từ.'] }
  ],
  summary:'Chọn ý khỏe mạnh → dựng từng câu → đọc cả đoạn khoảng 70 từ.'
});

const WRITING_ADAPTATION = freeze({
  sourceResponseType:'habit_selection_then_open_writing_about_70_words',
  adaptedResponseType:'habit_check_then_guided_sentence_order',
  reason:'Bước chọn ý được giữ bằng một health-decision check; đoạn viết mở được chuyển thành 6 câu guided để chấm online mà vẫn tạo một đoạn khoảng 70 từ.'
});

const sourceItems = freeze([
  mcq({
    id:'g7-u2-wb-e3-01',
    prompt:'Trước khi viết, lựa chọn nào rõ ràng KHÔNG phù hợp với một healthy-life paragraph?',
    options:[['A','do exercise'],['B','sleep 7–8 hours a day'],['C','eat a lot of meat and snacks'],['D','eat breakfast']],
    correct:'C',
    reason:'“eat a lot of meat and snacks” nói ăn rất nhiều thịt và đồ ăn vặt. Đây là lựa chọn rõ ràng không phù hợp với mục tiêu sống khỏe.',
    theory:'Đề gốc cho phép con tự chọn 5 việc. App chỉ chấm điều chắc chắn: nhận ra lựa chọn không lành mạnh rõ nhất.',
    example:'do exercise → healthy habit; eat a lot of snacks → không phải healthy habit.',
    adaptation:WRITING_ADAPTATION
  }),
  sentenceOrder({
    id:'g7-u2-wb-e3-02',prompt:'Câu 1/6 · Mở đoạn bằng thói quen ăn sáng.',
    correctOrder:['Every day,','I','eat breakfast','before','I start','my activities.'],
    tokens:['Every day,','I','eat breakfast','skip breakfast','before','after','I start','my activities.'],
    reason:'eat breakfast là một healthy habit trong danh sách nguồn; before nối việc ăn sáng với lúc bắt đầu hoạt động.',
    theory:'Mỗi câu nên nói rõ một thói quen và thời điểm/lợi ích.',example:'Every day, I eat breakfast before I start my activities.',adaptation:WRITING_ADAPTATION
  }),
  sentenceOrder({
    id:'g7-u2-wb-e3-03',prompt:'Câu 2/6 · Nói về vận động.',
    correctOrder:['I','do exercise','every day','to keep','my body','strong and active.'],
    tokens:['I','do exercise','every day','to keep','my body','strong and active.','weak and tired.'],
    reason:'to keep ... strong and active nói mục đích của việc tập thể dục.',
    theory:'to + V có thể nói mục đích: do exercise to keep ...',example:'I do exercise every day to keep my body strong and active.',adaptation:WRITING_ADAPTATION
  }),
  sentenceOrder({
    id:'g7-u2-wb-e3-04',prompt:'Câu 3/6 · Nói về giấc ngủ.',
    correctOrder:['I','sleep','seven to eight hours','each night','so','my body','can rest.'],
    tokens:['I','sleep','seven to eight hours','each night','so','but','my body','can rest.','cannot rest.'],
    reason:'so nối thói quen ngủ đủ với kết quả cơ thể được nghỉ ngơi.',
    theory:'so = vì vậy / để kết quả xảy ra.',example:'I sleep seven to eight hours each night so my body can rest.',adaptation:WRITING_ADAPTATION
  }),
  sentenceOrder({
    id:'g7-u2-wb-e3-05',prompt:'Câu 4/6 · Nói về việc giữ nhà sạch.',
    correctOrder:['I','clean my house','regularly','to keep','my living space','clean.'],
    tokens:['I','clean my house','regularly','to keep','my living space','clean.','dirty.'],
    reason:'clean my house là một lựa chọn trong nguồn; to keep ... clean nêu mục đích.',
    theory:'Một câu healthy habit có thể theo khung: I + action + to + benefit.',example:'I clean my house regularly to keep my living space clean.',adaptation:WRITING_ADAPTATION
  }),
  sentenceOrder({
    id:'g7-u2-wb-e3-06',prompt:'Câu 5/6 · Nói về bạn bè và tinh thần.',
    correctOrder:['I','chat with my friends','because','it helps me','feel relaxed','and happy.'],
    tokens:['I','chat with my friends','because','but','it helps me','feel relaxed','feel stressed','and happy.'],
    reason:'because nối thói quen chat with friends với lý do nó giúp em thư giãn và vui hơn.',
    theory:'because + reason giúp đoạn văn không chỉ liệt kê hành động.',example:'I chat with my friends because it helps me feel relaxed and happy.',adaptation:WRITING_ADAPTATION
  }),
  sentenceOrder({
    id:'g7-u2-wb-e3-07',prompt:'Câu 6/6 · Kết đoạn.',
    correctOrder:['These simple habits','help me','stay healthy,','active','and happy','every day.'],
    tokens:['These simple habits','help me','make me','stay healthy,','unhealthy,','active','and happy','every day.'],
    reason:'Câu cuối gom lại lợi ích chung của các thói quen vừa nêu.',
    theory:'Kết đoạn bằng một câu tổng kết giúp bài viết trọn ý.',example:'These simple habits help me stay healthy, active and happy every day.',adaptation:WRITING_ADAPTATION
  })
]);

export function applyG7U2WorkbookSourceFidelity(key,content) {
  if (String(key).toLowerCase() !== 'e3') return content;
  const preloadItems = (content.items ?? []).filter(item => item.learningPhase !== 'source');
  return freeze({ ...content,preLessonTheory:theory,items:freeze([...preloadItems,...sourceItems]) });
}

export function getG7U2WorkbookFidelityItemCount(key,baseCount) {
  return String(key).toLowerCase() === 'e3' ? baseCount - 1 + sourceItems.length : baseCount;
}

export const G7_U2_E3_SOURCE_ITEM_COUNT = sourceItems.length;
