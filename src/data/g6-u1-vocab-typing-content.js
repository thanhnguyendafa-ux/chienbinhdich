const RAW = `1|3|new school|trường mới|Em bắt đầu học ở một trường mới.
1|3|school|trường học|Em đến trường lúc 7 giờ.
1|3|secondary school|trường trung học cơ sở|Anh của em đang học ở trường THCS.
1|3|international school|trường quốc tế|Thành phố có nhiều trường quốc tế.
1|3|the name of your school|tên trường của bạn|Tên trường của em là THCS Hoa Sen.
1|3|the location of your school|vị trí của trường|Trường em nằm ở trung tâm thị trấn.
1|3|teacher|giáo viên|Cô Lan là giáo viên tiếng Anh.
1|3|English teacher|giáo viên tiếng Anh|Cô Lan là giáo viên tiếng Anh của lớp em.
1|3|favourite teacher|giáo viên yêu thích|Cô Hoa là giáo viên em yêu thích nhất.
1|3|student|học sinh|Trường có khoảng 600 học sinh.
1|3|schoolchildren|học sinh|Các học sinh đến trường vào buổi sáng.
1|3|classmate|bạn cùng lớp|Minh là bạn cùng lớp của em.
1|3|class|lớp học|Trường em có 20 lớp học.
1|3|classroom|phòng học|Lớp 6A học trong phòng học này.
1|3|library|thư viện|Em đọc sách trong thư viện.
1|3|canteen|căng-tin|Học sinh ăn trưa ở căng-tin.
1|3|laboratory|phòng thí nghiệm|Học sinh làm thí nghiệm trong phòng thí nghiệm.
1|3|workshop|phòng/xưởng thực hành|Học sinh thực hành trong phòng thực hành.
1|3|cloakroom|phòng để áo khoác, mũ...|Học sinh để áo khoác trong phòng giữ áo.
1|3|school's farm|nông trại của trường|Học sinh trồng rau ở nông trại của trường.
1|3|school bus|xe buýt trường học|Em đến trường bằng xe buýt trường.
1|3|pen pal|bạn qua thư|Mai có một người bạn qua thư ở Anh.
1|2|best friend|bạn thân nhất|Minh là bạn thân nhất của em.
1|2|someone|một người nào đó|Có ai đó đang đứng ngoài cửa.
2|3|school subject|môn học|Toán là một môn học ở trường.
2|3|subject|môn học/chủ đề|Toán là một môn học ở trường.
2|3|favourite subject|môn học yêu thích|Tiếng Anh là môn học yêu thích của em.
2|3|Maths|môn Toán|Em thích học môn Toán.
2|3|English|môn Tiếng Anh|Tiếng Anh là môn em yêu thích.
2|3|geography|môn Địa lí|Chúng em học về bản đồ trong môn Địa lí.
2|3|IT|môn Tin học/Công nghệ thông tin|Em học máy tính trong giờ Tin học.
2|3|Science|môn Khoa học|Em thích học môn Khoa học.
2|3|History|môn Lịch sử|Em học về quá khứ trong môn Lịch sử.
2|3|physics|môn Vật lí|Chúng em học về lực trong môn Vật lí.
2|3|chemistry|môn Hóa học|Học sinh làm thí nghiệm trong giờ Hóa học.
2|3|art|môn Mỹ thuật|Lan thích vẽ tranh trong giờ Mỹ thuật.
2|3|grammar|ngữ pháp|Hôm nay chúng em học ngữ pháp tiếng Anh.
2|3|computer studies|môn Tin học|Em học sử dụng máy tính trong môn Tin học.
2|3|English lesson|tiết học tiếng Anh|Em có tiết tiếng Anh vào thứ Hai.
2|3|English class|lớp/tiết tiếng Anh|Chúng em nói tiếng Anh trong giờ tiếng Anh.
2|3|first lesson|tiết học đầu tiên|Toán là tiết học đầu tiên hôm nay.
2|3|have English lessons|có/học các tiết tiếng Anh|Chúng em học tiếng Anh ba buổi một tuần.
2|3|English practice|luyện tập tiếng Anh|Nói chuyện với bạn là một cách luyện tiếng Anh.
2|2|learn + subject|học một môn|Chúng em học Vật lí ở trường.
2|3|learn a subject|học một môn|Em học môn Tiếng Anh vào thứ Hai.
2|2|study|học, học tập|Em học tiếng Anh mỗi ngày.
2|2|new words|từ mới|Em học năm từ mới mỗi ngày.
2|2|look up a word|tra một từ|Em dùng từ điển để tra một từ mới.
2|2|write notes|ghi chép|Em ghi chép bài học vào vở.
2|2|do an experiment|làm thí nghiệm|Học sinh làm một thí nghiệm trong lớp.
2|3|do experiments|làm thí nghiệm|Học sinh làm thí nghiệm trong giờ Khoa học.
2|3|physics experiment|thí nghiệm Vật lí|Học sinh làm thí nghiệm Vật lí trong phòng thí nghiệm.
2|3|test|bài kiểm tra|Ngày mai em có bài kiểm tra tiếng Anh.
2|3|have a test|có bài kiểm tra|Lớp em có bài kiểm tra vào thứ Hai.
2|3|homework|bài tập về nhà|Em làm bài tập về nhà sau bữa tối.
2|2|do homework|làm bài tập về nhà|Em làm bài tập về nhà sau bữa tối.
2|2|do all the homework|làm tất cả bài tập về nhà|Nam luôn làm đầy đủ bài tập về nhà.
2|2|remember homework|nhớ bài tập về nhà|Em luôn nhớ mang bài tập về nhà.
2|2|speak English|nói tiếng Anh|Trong giờ học, em cố gắng nói tiếng Anh.
3|3|school things|đồ dùng học tập|Sách, bút và thước là đồ dùng học tập.
3|3|bench|ghế dài|Ba học sinh ngồi trên một chiếc ghế dài.
3|3|blackboard|bảng đen/bảng lớp|Giáo viên viết bài lên bảng.
3|3|coloured pencils|bút chì màu|Em dùng bút chì màu để tô tranh.
3|3|dictionary|từ điển|Em dùng từ điển để tra từ mới.
3|3|notebook|vở ghi chép/sổ tay|Em viết bài vào vở ghi chép.
3|3|calculator|máy tính cầm tay|Em dùng máy tính cầm tay trong giờ Toán.
3|3|poster|áp phích/tranh khổ lớn|Lớp em có một áp phích trên tường.
3|3|sharpener|gọt bút chì|Em dùng gọt bút chì để làm nhọn bút.
3|3|compass|compa|Em dùng compa để vẽ hình tròn.
3|3|rubber|cục tẩy|Em dùng cục tẩy để xóa chữ chì.
3|3|cardboard|bìa các-tông|Em dùng bìa các-tông để làm mô hình.
3|3|bicycle|xe đạp|Em đi xe đạp đến trường.
3|2|different colours|những màu khác nhau|Hộp bút có nhiều màu khác nhau.
3|2|put something on a wall|treo/đặt thứ gì lên tường|Em treo bức tranh lên tường.
3|2|as decoration|để trang trí|Gia đình treo tranh để trang trí phòng khách.
3|2|be used for + V-ing|được dùng để làm gì|Bút chì được dùng để viết.
3|2|remember books|nhớ mang sách|Em phải nhớ mang sách đến lớp.
4|2|come to school|đến trường|Lan đến trường lúc 7 giờ.
4|2|go to + place|đi đến một nơi|Nam đi đến thư viện sau giờ học.
4|2|be on duty|trực, làm nhiệm vụ|Hôm nay tổ của Lan trực lớp.
4|3|student on duty|học sinh trực nhật|Học sinh trực nhật đến lớp sớm.
4|2|come into the room|đi vào phòng|Giáo viên đi vào phòng lúc 7 giờ 30.
4|2|open the windows|mở cửa sổ|Bạn trực nhật mở cửa sổ trước giờ học.
4|2|water the flowers|tưới hoa|Lan tưới hoa vào buổi sáng.
4|3|clean the blackboard|lau bảng|Bạn trực nhật lau bảng trước giờ học.
4|2|the lesson begins|tiết học bắt đầu|Chuông reo và tiết học bắt đầu.
4|3|school finishes|trường tan học|Trường tan học lúc 4 giờ 30.
4|3|have lunch in the canteen|ăn trưa ở căng-tin|Chúng em ăn trưa ở căng-tin của trường.
4|3|activities at school|các hoạt động ở trường|Chơi thể thao là một hoạt động ở trường.
4|3|team games|trò chơi đồng đội|Học sinh chơi trò chơi đồng đội ngoài sân.
4|2|during the break|trong giờ giải lao|Em chơi với bạn trong giờ giải lao.
4|2|class rules|nội quy lớp học|Lớp em có năm nội quy lớp học.
4|2|keep the class rules|tuân thủ nội quy lớp học|Học sinh cần tuân thủ nội quy lớp học.
4|2|arrive at school on time|đến trường đúng giờ|Nam luôn đến trường đúng giờ.
4|2|listen carefully in class|chăm chú nghe trong lớp|Em luôn chăm chú nghe giảng trong lớp.
4|2|work in pairs|làm việc theo cặp|Hai học sinh làm việc theo cặp.
4|2|work in groups|làm việc theo nhóm|Cả lớp làm việc theo nhóm.
4|2|be prepared to do something|sẵn sàng để làm gì|Học sinh phải sẵn sàng làm việc nhóm.
4|2|everything is ready|mọi thứ đã sẵn sàng|Sách và bút đã có đủ, mọi thứ đã sẵn sàng.
4|2|be ready for|sẵn sàng cho|Cả lớp đã sẵn sàng cho tiết học.
4|2|ride something to school|đi phương tiện gì đến trường|Nam đi xe đạp đến trường.
5|2|at first|lúc đầu, ban đầu|Lúc đầu em thấy trường mới hơi lạ.
5|2|come early|đến sớm|Nam thường đến trường sớm.
5|2|very early|rất sớm|Bà em thức dậy rất sớm.
5|2|usually|thường|Em thường đọc sách trước khi ngủ.
5|2|often|thường xuyên|Nam thường chơi bóng đá sau giờ học.
5|2|in the morning|vào buổi sáng|Bố em đọc báo vào buổi sáng.
5|2|in the afternoon|vào buổi chiều|Em học đàn vào buổi chiều.
5|2|in the evening|vào buổi tối|Em đọc sách vào buổi tối.
5|2|every Thursday|mỗi thứ Năm|Lớp em học thể dục mỗi thứ Năm.
5|2|every day|mỗi ngày|Em tập thể dục mỗi ngày.
5|2|after school|sau giờ học|Em chơi với bạn sau giờ học.
5|2|for a week|trong một tuần|Chúng em ở Đà Nẵng trong một tuần.
5|2|at weekends|vào cuối tuần|Gia đình em đi chơi vào cuối tuần.
5|2|hardly ever|hầu như không bao giờ|Nam hầu như không bao giờ đi học muộn.
5|2|arrive at + time|đến vào lúc...|Xe buýt đến lúc 7 giờ.
5|2|arrive on time|đến đúng giờ|Học sinh nên đến đúng giờ.
5|3|first week at school|tuần đầu tiên ở trường|Tuần đầu tiên ở trường của Tom khá vui.
5|3|school year|năm học|Em có nhiều môn mới trong năm học này.
5|2|dinner time|giờ ăn tối|7 giờ là giờ ăn tối của gia đình em.
6|2|join a club|tham gia câu lạc bộ|Lan muốn tham gia câu lạc bộ tiếng Anh.
6|3|club|câu lạc bộ|Trường em có nhiều câu lạc bộ.
6|3|judo|môn võ judo|Nam học judo sau giờ học.
6|3|judo club|câu lạc bộ judo|Tom muốn tham gia câu lạc bộ judo.
6|2|read newspapers|đọc báo|Ông em đọc báo mỗi sáng.
6|2|listen to music|nghe nhạc|Lan nghe nhạc khi rảnh.
6|2|have a walk|đi dạo, đi bộ|Ông bà em đi dạo mỗi sáng.
6|2|play football|chơi bóng đá|Các bạn nam chơi bóng đá sau giờ học.
6|2|go swimming|đi bơi|Cuối tuần chúng em đi bơi.
6|2|go camping|đi cắm trại|Gia đình em đi cắm trại vào cuối tuần.
6|2|spend a holiday|dành/trải qua kỳ nghỉ|Gia đình em dành kỳ nghỉ ở biển.
6|2|celebrate a birthday|tổ chức/mừng sinh nhật|Em tổ chức sinh nhật cùng gia đình.
6|2|get up|thức dậy|Em thức dậy lúc 6 giờ.
6|2|stay home|ở nhà|Trời mưa nên em ở nhà.
6|2|play the piano|chơi đàn piano|Chị em biết chơi đàn piano.
6|2|play + musical instrument|chơi một nhạc cụ|Lan chơi đàn sau giờ học.
6|2|kind of music|thể loại nhạc|Pop là một thể loại nhạc phổ biến.
6|2|favourite kind of music|thể loại nhạc yêu thích|Hip hop là thể loại nhạc yêu thích của Khang.
6|2|go out with friends|đi chơi với bạn bè|Cuối tuần em đi chơi với bạn bè.
6|2|go out with family|đi chơi với gia đình|Chủ nhật Lan đi chơi với gia đình.
6|2|have music lessons|học nhạc/có tiết học nhạc|Chiều nay em có tiết học nhạc.
6|2|lunch|bữa trưa|Em ăn bữa trưa lúc 11 giờ 30.
6|2|wear + clothes|mặc quần áo|Em mặc áo khoác khi trời lạnh.
7|2|be nervous|lo lắng, hồi hộp|Trước ngày kiểm tra, Lan cảm thấy lo lắng.
7|2|be new to somebody|còn mới/lạ đối với ai|Môi trường mới vẫn còn lạ đối với Nam.
7|2|be friendly to somebody|thân thiện với ai|Các bạn trong lớp rất thân thiện với học sinh mới.
7|2|be nice to somebody|tốt, tử tế với ai|Cô giáo luôn đối xử tốt với học sinh.
7|2|favourite|yêu thích nhất|Màu xanh là màu em yêu thích nhất.
7|2|go well|diễn ra tốt đẹp|Buổi học đầu tiên diễn ra rất tốt.
7|2|have a good day|có một ngày tốt đẹp|Em đã có một ngày rất vui ở trường.
7|2|if you like|nếu bạn muốn|Bạn có thể ngồi đây nếu bạn muốn.
7|2|talk about|nói về|Hôm nay em nói về trường của mình.
7|2|write to somebody|viết thư/nhắn cho ai|Em viết thư cho một người bạn ở Úc.
7|2|share something with somebody|chia sẻ cái gì với ai|Em chia sẻ đồ dùng với bạn.
7|2|help somebody do something|giúp ai làm gì|Em giúp mẹ rửa bát.
7|2|smart|thông minh|Lan là một học sinh thông minh.
7|2|wonderful|tuyệt vời|Chuyến đi hôm qua thật tuyệt vời.
7|2|write|viết|Em viết tên vào vở.
7|2|introduce somebody to somebody|giới thiệu ai với ai|Em giới thiệu Lan với mẹ em.
7|2|listen carefully|lắng nghe chăm chú|Học sinh lắng nghe chăm chú khi cô giáo nói.
7|2|work with somebody|làm việc với ai|Em làm việc với các bạn trong nhóm.
7|2|quietly|một cách yên lặng|Các bạn ngồi yên lặng khi cô giáo nói.
8|2|most of|hầu hết|Hầu hết học sinh trong lớp thích thể thao.
8|2|want to + V|muốn làm gì|Em muốn tham gia câu lạc bộ bóng đá.
8|2|forget to + V|quên làm gì|Nam quên mang sách đến lớp.
8|2|take off|cởi, tháo ra|Em cởi áo khoác khi vào lớp.
8|2|some of + noun|một số trong số...|Một số học sinh thích môn Khoa học.
8|2|have to + V|phải làm gì|Em phải hoàn thành bài tập trước khi chơi.
8|2|What about + V-ing?|... thì sao?/hay là...?|Đi bơi thì sao?
8|2|the number of|số lượng|Số lượng học sinh trong lớp là 40.
8|2|like to do something|thích làm gì|Nam thích chơi bóng đá.
8|2|prefer something|thích cái gì hơn|Em thích trà hơn cà phê.
8|2|prefer A to B|thích A hơn B|Minh thích Toán hơn Văn.
8|2|be ready to + V|sẵn sàng làm gì|Lan sẵn sàng giúp bạn.
8|2|have time to + V|có thời gian để làm gì|Tối nay em có thời gian để đọc sách.
8|2|have much time|có nhiều thời gian|Hôm nay em không có nhiều thời gian.
8|2|a lot of|rất nhiều|Thư viện có rất nhiều sách.
8|2|two or more|hai hoặc nhiều hơn|Chiếc ghế này dành cho hai người hoặc nhiều hơn.
8|2|borrow something|mượn thứ gì|Em mượn một cuốn sách ở thư viện.
8|2|different from|khác với|Chiếc bút này khác với chiếc kia.
8|2|try to do something|cố gắng làm gì|Em cố gắng làm bài tập mỗi ngày.
8|2|at home|ở nhà|Bố em đang ở nhà.
3|3|ruler|thước kẻ|Em dùng thước kẻ để vẽ đường thẳng.
2|3|grade 6|lớp 6|Em đang học lớp 6.
1|3|dream school|ngôi trường mơ ước|Em muốn thiết kế ngôi trường mơ ước.
1|3|swimming pool|hồ bơi|Trường em có một hồ bơi lớn.
1|3|video game room|phòng trò chơi điện tử|Trường mơ ước có phòng trò chơi điện tử.
1|3|greenhouse|nhà kính|Học sinh trồng cây trong nhà kính.
8|2|lend somebody something|cho ai mượn thứ gì|Em cho bạn mượn cây bút.
8|2|get good marks|đạt điểm tốt|Lan thường đạt điểm tốt trong bài kiểm tra.
8|2|design your dream school|thiết kế ngôi trường mơ ước|Nhóm em thiết kế ngôi trường mơ ước.
8|2|present something to the class|trình bày thứ gì trước lớp|Em trình bày sản phẩm trước lớp.
8|2|in the centre of|ở trung tâm của|Nhà em ở trung tâm của thị trấn.`;

const GROUP_NAMES = Object.freeze({1: 'People & School Places', 2: 'Subjects & Learning', 3: 'School Things & Objects', 4: 'School Routines & Rules', 5: 'Time & Frequency', 6: 'Activities & Hobbies', 7: 'People, Feelings & Communication', 8: 'High-Value Collocations & Patterns'});

function parseRows() {
  return RAW.trim().split('\n').map((line, index) => {
    const [group, tier, en, vi, exampleVi] = line.split('|');
    if (!group || !tier || !en || !vi || !exampleVi) throw new Error(`Invalid G6 U1 vocab row ${index + 1}`);
    return Object.freeze({ group: Number(group), tier: Number(tier), en, vi, exampleVi });
  });
}

const ROWS = Object.freeze(parseRows());

function buildItems(group) {
  return Object.freeze(ROWS.filter(row => row.group === group).map((row, index) => Object.freeze({
    id: `g6u1-vocab-g${group}-${String(index + 1).padStart(3, '0')}`,
    type: 'typing',
    en: row.en,
    vi: row.vi,
    exampleVi: row.exampleVi,
    tier: row.tier,
    sourceWordBankLabel: 'Ví dụ tiếng Việt dễ hiểu',
    sourceWordBank: Object.freeze([row.exampleVi]),
    typingUi: Object.freeze({
      promptLabel: 'Gõ phần tiếng Anh',
      inputLabel: 'Từ hoặc cụm từ tiếng Anh',
      placeholder: 'Type the English word or phrase...'
    })
  })));
}

export const g6U1VocabTypingGroups = Object.freeze(
  Object.fromEntries(Object.entries(GROUP_NAMES).map(([key, name]) => {
    const group = Number(key);
    const items = buildItems(group);
    return [group, Object.freeze({
      group,
      name,
      items,
      tier2Count: items.filter(item => item.tier === 2).length,
      tier3Count: items.filter(item => item.tier === 3).length
    })];
  }))
);

export function getG6U1VocabTypingContent(group) {
  const normalized = Number(group);
  const data = g6U1VocabTypingGroups[normalized];
  if (!data) throw new Error(`Unknown G6 U1 vocab typing group: ${group}`);
  return Object.freeze({ items: data.items });
}
