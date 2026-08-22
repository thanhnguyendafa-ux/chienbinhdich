import { freeze,preTheory,classification,sentenceOrder } from './workbook-content-helpers.js';

const WORD_SEARCH_GRID = `A A H H L A M P L T
H S K R N S O F A M
S A I U P I M O N D
B A T H R O O M E V
E R C L E S S M I W
D T H F E V B T O E
R E E O H A L L E R
O T N R E I L H I R
O N A T T N C Y Y T
M C C U P B O A R D`;

const b2Theory = preTheory({
  title:'Nhắc nhanh · Dò từ trong ô chữ',
  intro:'Đây là grid chữ, không cần tranh. Con tìm chữ đầu rồi dò ngang, dọc hoặc chéo.',
  sourceSections:['SBT trang 11 · B. Vocabulary & Grammar · Bài 2'],
  sections:[
    { heading:'Cách dò',bullets:['Tìm chữ cái đầu của từ.','Dò liên tiếp theo một hướng: ngang, dọc hoặc chéo.','Nếu chuỗi bị đứt, quay lại thử vị trí khác.'] },
    { heading:'Bẫy',bullets:['Tất cả lựa chọn đều thuộc chủ đề ngôi nhà, nên không thể đoán chỉ bằng nghĩa.','Chỉ xếp vào “Có trong ô chữ” khi con thật sự nhìn thấy cả chuỗi.'] }
  ],
  summary:'Chữ đầu → chọn hướng → đọc liên tiếp đến hết từ.'
});

const b2 = classification({
  id:'g6-u2-wb-b2-01',
  prompt:`Find eight words related to “My house”. Dò grid chữ rồi phân loại các từ bên dưới.\n\n${WORD_SEARCH_GRID}`,
  groups:[{id:'yes',label:'Có trong ô chữ'},{id:'no',label:'Không có trong ô chữ'}],
  tokens:[
    {id:'lamp',text:'lamp',correctGroupId:'yes'},{id:'chair',text:'chair',correctGroupId:'no'},
    {id:'sofa',text:'sofa',correctGroupId:'yes'},{id:'table',text:'table',correctGroupId:'no'},
    {id:'bathroom',text:'bathroom',correctGroupId:'yes'},{id:'toilet',text:'toilet',correctGroupId:'no'},
    {id:'bedroom',text:'bedroom',correctGroupId:'yes'},{id:'flat',text:'flat',correctGroupId:'no'},
    {id:'hall',text:'hall',correctGroupId:'yes'},{id:'villa',text:'villa',correctGroupId:'no'},
    {id:'cupboard',text:'cupboard',correctGroupId:'yes'},{id:'wardrobe',text:'wardrobe',correctGroupId:'no'},
    {id:'kitchen',text:'kitchen',correctGroupId:'yes'},{id:'desk',text:'desk',correctGroupId:'no'},
    {id:'poster',text:'poster',correctGroupId:'yes'},{id:'fan',text:'fan',correctGroupId:'no'}
  ],
  correctLabel:'Có: lamp · sofa · bathroom · bedroom · hall · cupboard · kitchen · poster',
  reason:'Tám từ này xuất hiện nguyên chuỗi trong grid: lamp, sofa, bathroom, bedroom, hall, cupboard, kitchen và poster. Các distractor cùng chủ đề nhưng không xuất hiện.',
  theory:'Dò theo một hướng cố định; không nhảy ô giữa chừng.',
  example:'LAMP nằm ngang ở hàng đầu; BEDROOM chạy dọc; POSTER chạy chéo.',
  adaptation:freeze({
    sourceResponseType:'word_search_grid',adaptedResponseType:'classification_with_text_grid',
    reason:'Grid được dựng lại bằng chữ để giữ thao tác dò từ mà không phụ thuộc ảnh.'
  })
});

const e3Theory = preTheory({
  title:'Nhắc nhanh · Ghép một đoạn tả căn phòng',
  intro:'Sách có bước vẽ rồi viết. App bỏ phần vẽ nhưng giữ phần mô tả bằng 5 câu có kiểm soát để chấm online.',
  sourceSections:['SBT trang 15 · E. Writing · Bài 3'],
  sections:[
    { heading:'Đoạn tả phòng',bullets:['Câu 1: phòng con thích là phòng nào.','Câu 2–4: trong phòng có gì và đồ vật ở đâu.','Câu 5: vì sao con thích phòng đó.'] },
    { heading:'Khung cần nhớ',bullets:['My favourite room is ...','There is / There are ...','... is next to ...','I like ... because ...'] }
  ],
  summary:'Phòng nào → có gì → ở đâu → vì sao thích.'
});

const ROOM_ADAPTATION = freeze({
  sourceResponseType:'open_room_description_after_drawing',adaptedResponseType:'guided_sentence_order',
  omittedSourceStep:'drawing',
  reason:'Phần vẽ không chấm online; phần viết được giữ thành 5 câu guided writing để học sinh vẫn xây một description hoàn chỉnh.'
});

const roomSentence = (id,prompt,correctOrder,tokens,reason) => sentenceOrder({
  id,prompt,correctOrder,tokens,reason,
  theory:'Sắp các khối thành một câu hoàn chỉnh rồi đọc lại xem nghĩa có tự nhiên không.',
  example:correctOrder.join(' '),adaptation:ROOM_ADAPTATION
});

const e3Items = freeze([
  roomSentence('g6-u2-wb-e3-01','1. Mở đoạn: nói căn phòng em thích nhất.',
    ['My favourite room','is','my bedroom.'],
    ['My favourite room','are','is','my bedroom.','my bedrooms.'],
    'My favourite room là một phòng nên dùng is.'),
  roomSentence('g6-u2-wb-e3-02','2. Kể những đồ vật chính trong phòng.',
    ['There is','a bed, a wardrobe, a desk, a chair and a lamp','in the room.'],
    ['There are','There is','a bed, a wardrobe, a desk, a chair and a lamp','on the room.','in the room.'],
    'Mẫu guided writing bắt đầu danh sách bằng a bed nên dùng There is; vị trí là in the room.'),
  roomSentence('g6-u2-wb-e3-03','3. Nói vị trí của bàn.',
    ['The desk','is','next to','my bed.'],
    ['The desk','are','is','next','next to','my bed.'],
    'The desk là số ít → is; cụm chỉ vị trí đúng là next to.'),
  roomSentence('g6-u2-wb-e3-04','4. Thêm một chi tiết về đồ vật trong phòng.',
    ['There are','some books','on the desk.'],
    ['There is','There are','some book','some books','in the desk.','on the desk.'],
    'some books là số nhiều nên dùng There are; sách ở trên mặt bàn → on the desk.'),
  roomSentence('g6-u2-wb-e3-05','5. Kết đoạn bằng lý do em thích căn phòng.',
    ['I like','my bedroom','because','it is','comfortable.'],
    ['I like','my bedroom','but','because','it are','it is','comfortable.'],
    'because nối sở thích với lý do; bedroom được thay bằng it nên dùng it is comfortable.')
]);

export function getG6U2WorkbookSourceFidelityContent(key) {
  const lessonKey = String(key ?? '').toLowerCase();
  if (lessonKey === 'b2') return freeze({ preLessonTheory:b2Theory,items:freeze([b2]) });
  if (lessonKey === 'e3') return freeze({ preLessonTheory:e3Theory,items:e3Items });
  throw new Error(`Unknown G6 U2 recovered lesson: ${key}`);
}
