const freeze = value => Object.freeze(value);

const pack = (title, remember, examples, traps, summary) => freeze({
  required: true,
  title,
  intro: 'Đọc hết phần này trước khi làm bài. Kéo xuống tận cuối rồi xác nhận con đã đọc xong.',
  sections: freeze([
    freeze({ heading: '1. Con cần nhớ', bullets: freeze(remember) }),
    freeze({ heading: '2. Ví dụ', bullets: freeze(examples) }),
    freeze({ heading: '3. Bẫy hay gặp', bullets: freeze(traps) }),
    freeze({ heading: '4. Chốt nhớ', bullets: freeze([summary]) })
  ]),
  summary
});

const RECORDS = freeze([
  ['V-CAT','Từ nào khác nhóm?',['flat, townhouse = loại nhà.','bedroom, kitchen, bathroom, living room = phòng.','bed, desk, chair, lamp, clock = đồ vật.','Hỏi: từ này là nhà, phòng hay đồ vật?'],['bedroom – kitchen – bathroom – lamp → lamp khác nhóm vì lamp là đồ vật.'],['Một từ có trong Unit 2 chưa chắc cùng nhóm với các từ còn lại.'],'Nhìn nhóm nghĩa, không chỉ nhìn từ quen.'],
  ['V-CTX','Chọn từ đúng trong câu',['Đừng chọn từ chỉ vì con đã học từ đó.','Hãy đọc cả câu rồi mới chọn.','Nhớ các cụm quen: on the wall, in Hanoi, with my parents, in my bedroom.'],['There is a clock ___ the wall. → on.'],['in, on, near, next to đều quen nhưng không dùng giống nhau.'],'Đọc cả câu rồi mới chọn từ.'],
  ['V-REL','Hai từ đi với nhau thế nào?',['Hai từ đúng riêng lẻ vẫn có thể ghép sai.','Nhớ các cặp: read books, clock on the wall, living room next to the kitchen.'],['read + books ✓','read + bookshelf ✗'],['bookshelf có trong Unit 2 nhưng không phải thứ ta read.'],'Đúng từ chưa đủ. Hai từ phải đi với nhau đúng nghĩa.'],
  ['G-THERE','There is / There are',['There is = có một.','There are = có nhiều.','Nhìn cụm danh từ sau there.','Khi hỏi: Is there ...? / Are there ...?'],['There is a bed.','There are two bathrooms.'],['Không nhìn từ cuối câu. Hãy nhìn thứ được đếm.'],'Một → is. Nhiều → are.'],
  ['G-HAVE-THERE','have / has và there is / are',['have / has nói ai hoặc vật nào có gì.','There is / There are nói có vật gì ở đâu.','I / you / we / they → have.','he / she / it / my bedroom → has.'],['I have a bedroom.','My bedroom has a window.','There are six rooms in the house.'],['Thấy nghĩa “có” chưa đủ. Phải xem câu đang nói ai có gì hay có vật gì ở đâu.'],'Có của ai → have/has. Có vật ở đâu → there is/are.'],
  ['G-PREP','Giới từ chỉ vị trí',['in Hanoi = ở Hà Nội.','in my bedroom = trong phòng ngủ.','on the wall = trên tường.','with my parents = với bố mẹ.','next to = ngay bên cạnh; near = gần; behind = phía sau.'],['The living room is next to the kitchen.','There is a clock on the wall.'],['near và next to không giống hẳn nhau.'],'Đọc quan hệ vị trí, không đổi giới từ cho nhau.'],
  ['G-SUGGEST','How about ...? / Let’s ...',['Hai mẫu đều dùng để đề nghị.','How about + V-ing?','Let’s + động từ nguyên mẫu.'],['How about putting a picture on the wall?','Let’s go to the department store.'],['How about put ✗','Let’s going ✗'],'How about → V-ing. Let’s → động từ nguyên mẫu.'],
  ['G-DESC','Miêu tả · because · but · often',['is / are + tính từ để miêu tả.','but = nhưng, nối hai ý khác nhau.','because = bởi vì, nói lý do.','often thường đứng trước động từ thường.'],['My bedroom is small but beautiful.','I love the living room because it is bright.','I often read books.'],['because và but không đổi cho nhau.','Đừng đặt often tùy chỗ.'],'but = nhưng · because = bởi vì · often = thường.'],
  ['R-TF','Đọc: Đúng hay Sai',['Một câu True phải đúng hết các chi tiết.','Kiểm đúng người, đúng phòng và đúng chi tiết.'],['Bài nói living room = bright, bedroom = small but beautiful.','The bedroom is bright. → False.'],['Từ trong câu có thể đều có trong bài nhưng bị gắn nhầm chỗ.'],'Đúng từ chưa đủ. Phải đúng người, đúng phòng, đúng chi tiết.'],
  ['R-NUM-REL','Đọc: Số và chi tiết',['Mỗi con số đi với một thông tin riêng.','six rooms, two bedrooms, two bathrooms là ba thông tin khác nhau.'],['How many bedrooms are there? → two, không phải six.'],['Một con số có thật trong bài vẫn có thể là đáp án sai.'],'Con số phải đi với đúng từ của nó.'],
  ['R-WH','Đọc: Đề đang hỏi gì?',['Who...? → hỏi người.','Where...? → hỏi nơi.','Why...? → hỏi lý do.','How many...? → hỏi số lượng.','Which room...? → hỏi phòng nào.'],['Who does Mai live with? → her parents.','Where does Mai live? → in Hanoi / in a townhouse.'],['Hanoi là thông tin thật nhưng không trả lời câu hỏi Who.'],'Trước tiên hỏi: đề muốn người, nơi, lý do hay số?'],
  ['R-REF','Đọc: it / them / one',['it thay cho một vật hoặc một nơi.','them thay cho nhiều vật.','one thay cho một vật đã được nhắc tới.','Đọc câu trước và câu sau để biết từ đó thay cho gì.'],['We need a picture. Let’s buy one. → one = a picture.'],['Đừng chọn chỉ vì một danh từ đứng gần nhất.'],'Tìm xem câu đang nói tiếp về vật nào.'],
  ['W-ORDER','Viết: Xếp câu',['Tiếng Anh có thứ tự riêng.','Tìm phần mở đầu, động từ, người/vật rồi nơi chốn.'],['There are six rooms in our house.'],['Đủ từ chưa chắc đúng nếu xếp sai thứ tự.'],'Đủ từ chưa đủ. Phải đúng thứ tự.'],
  ['W-ERROR','Viết: Tìm lỗi sai',['Cả câu sai không có nghĩa là mọi từ đều sai.','Đọc cả câu, tìm đúng chỗ sai rồi chỉ sửa chỗ đó.'],['There is three bedrooms. → three bedrooms đúng; is phải đổi thành are.'],['Đừng sửa một từ đang đúng chỉ vì cả câu đang sai.'],'Tìm đúng lỗi rồi mới sửa.'],
  ['W-REWRITE','Viết: Viết lại câu',['Câu mới phải giữ ý chính.','Câu mới phải dùng đúng mẫu được yêu cầu.'],['There is a window in my bedroom. ↔ My bedroom has a window.'],['Đổi mẫu câu nhưng không được làm đổi nghĩa.'],'Đổi cách viết, không đổi ý.'],
  ['W-VI-EN','Viết: Việt → Anh',['Không dịch từng từ rồi giữ nguyên thứ tự tiếng Việt.','Tìm người, hành động, phần còn lại rồi dùng mẫu tiếng Anh đã học.'],['Tôi sống với bố mẹ. → I live with my parents.'],['Dịch đúng từng từ nhưng sai thứ tự vẫn là câu sai.'],'Dịch theo mẫu tiếng Anh, không ghép từng từ.'],
  ['P-FINAL-S','Phát âm: -s cuối từ',['Trong Unit 2 có hai nhóm chính: /s/ và /z/.','/s/: lamps, sinks, flats, toilets.','/z/: cupboards, sofas, kitchens, rooms.'],['lamps /s/ · rooms /z/'],['Có cùng chữ -s chưa chắc đọc giống nhau.'],'So âm cuối, không chỉ nhìn chữ -s.'],
  ['C-FUNCTION','Giao tiếp: Đề nghị và đáp lại',['Khi một bạn đưa ra lời đề nghị, câu sau phải đáp phù hợp.','How about ...? và Let’s ... đều có thể dùng để đề nghị.'],['How about putting a picture on the wall? → Great idea.'],['Một câu cùng chủ đề chưa chắc là câu trả lời phù hợp.'],'Nghe xem người trước đang đề nghị, hỏi hay kể.'],
  ['M-EASY','Bẫy tổng hợp · Dễ',['Mỗi câu thường có một lỗi rõ nhất.','Kiểm từ, is/are, số lượng và giới từ.'],['Bước 1: tìm lỗi. Bước 2: sửa. Bước 3: nói lý do.'],['Đừng chọn chỉ vì thấy một từ quen.'],'Tìm một lỗi rõ trước.'],
  ['M-MED','Bẫy tổng hợp · Vừa',['Bẫy thường dùng thông tin thật nhưng gắn sai chỗ.','Kiểm đúng người, phòng, số và câu hỏi.'],['six rooms là đúng, nhưng nếu hỏi bedrooms thì đáp án là two.'],['Thông tin có trong bài chưa chắc trả lời đúng câu đang hỏi.'],'Thông tin thật vẫn có thể là đáp án sai.'],
  ['M-HARD','Bẫy tổng hợp · Khó',['Một câu có thể đúng ngữ pháp nhưng vẫn sai với bài.','Hỏi: bài có thật sự nói điều này không?','Hỏi: câu này có trả lời đúng điều đề đang hỏi không?'],['Bedroom có big window không có nghĩa bài đã nói bedroom bright.'],['Đừng đoán thêm điều bài không nói.'],'Đúng tiếng Anh chưa đủ. Phải đúng dữ kiện và đúng câu hỏi.']
]);

const THEORY_BY_TRAP = freeze(Object.fromEntries(RECORDS.map(([code, ...args]) => [code, pack(...args)])));

export function requiredTheoryForTrap(trapCode) {
  const theory = THEORY_BY_TRAP[trapCode];
  if (!theory) throw new Error(`Missing required theory pack for ${trapCode}.`);
  return theory;
}

export const g6U2TrapTheoryCodes = freeze(Object.keys(THEORY_BY_TRAP));
