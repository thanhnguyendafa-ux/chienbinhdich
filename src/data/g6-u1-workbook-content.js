const freeze = value => Object.freeze(value);
const theorySupport = freeze({ access: 'after_submit' });

const typingUi = freeze({
  promptLabel: 'Bài trong SBT',
  contextLabel: 'Đề bài',
  instruction: 'Làm đúng yêu cầu của câu trong SBT.',
  inputLabel: 'Câu trả lời của em',
  placeholder: 'Gõ câu trả lời...'
});

const openTypingUi = freeze({
  promptLabel: 'Bài mở trong SBT',
  contextLabel: 'Đề bài',
  instruction: 'Tự tạo câu trả lời của em. Sau khi Submit, hệ thống chỉ đưa bài tham khảo; câu trả lời hợp lý có thể khác.',
  inputLabel: 'Câu trả lời của em',
  placeholder: 'Gõ câu trả lời của em...'
});

const choice = (id, text) => freeze({ id, text, preserveOrder: true });

const teaching = ({ correctLabel, reason, theory, example }) => freeze({
  correctLabel,
  reason,
  theory,
  example
});

const typing = ({ id, prompt, answer, acceptedAnswers = [], reason, theory, example, open = false }) => freeze({
  id,
  type: 'typing',
  vi: prompt,
  en: answer,
  ...(acceptedAnswers.length ? { acceptedAnswers: freeze(acceptedAnswers) } : {}),
  ...(open ? { responseMode: 'open' } : {}),
  typingUi: open ? openTypingUi : typingUi,
  theorySupport,
  teachingFeedback: teaching({ correctLabel: open ? 'Bài tham khảo' : answer, reason, theory, example })
});

const mcq = ({ id, prompt, options, correct, reason, theory, example, stimulus }) => freeze({
  id,
  type: 'mcq',
  prompt,
  ...(stimulus ? { stimulus: freeze(stimulus) } : {}),
  choices: freeze(options.map(([choiceId, text]) => choice(choiceId, text))),
  correctChoiceId: correct,
  theorySupport,
  teachingFeedback: teaching({
    correctLabel: options.find(([choiceId]) => choiceId === correct)?.[1] ?? correct,
    reason,
    theory,
    example
  })
});

const WORD_BOX_B5 = freeze([
  ['ball-games', 'ball games'],
  ['have', 'have'],
  ['english-lessons', 'English lessons'],
  ['international', 'international'],
  ['housework', 'housework'],
  ['subjects', 'subjects'],
  ['share', 'share'],
  ['study', 'study']
]);

const WORD_BOX_D1 = freeze([
  ['their', 'their'],
  ['begins', 'begins'],
  ['on', 'on'],
  ['go', 'go'],
  ['off', 'off'],
  ['school', 'school'],
  ['all', 'all'],
  ['learn', 'learn']
]);

const D1_TEXT = `In England, when the schoolchildren come to school, they first (1) ______ to the cloakroom. They take (2) ______ their coats and raincoats, their caps and hats, and then go to (3) ______ classroom. Some of the students go to the laboratories and workshops where they (4) ______ physics, chemistry and art. When a student is (5) ______ duty, he comes to (6) ______ very early. He has to open (7) ______ the windows, water the flowers and clean the blackboard, so everything is ready for the first lesson. At seven thirty the teacher comes into the room and the lesson (8) ______.`;

const D2_TEXT = `Mr Green: Hey, Tom. How's your first week at the new school?
Tom: Well, it's great. But I was a bit nervous at first.
Mr Green: Why were you nervous?
Tom: The teachers are all new to me. Most of my classmates are new, too.
Mr Green: Are they friendly to you?
Tom: Ah, yeah. They're all nice to me.
Mr Green: What subjects did you have today?
Tom: Well, we had maths, geography and IT, my favourite subject.
Mr Green: Oh, good. So everything is going well at school?
Tom: Right. I had a good first day. And ... Dad, can I join the judo club at school? I like to do judo.
Mr Green: Yeah, OK, if you like. But don't forget to do your homework.
Tom: I won't. Thanks, Dad.`;

const D3_TEXT = `What do you do if you want to (1) ______ a book in a library? If you know the author's (2) ______, go to the author catalogue. Find the title of the book (3) ______ check the shelf mark. Make a note of this before you look (4) ______ the appropriate shelf. If you do not know the author's name, go to the (5) ______ catalogue. If there (6) ______ no title catalogue in the library, go to the subject catalogue. Check all the titles which are under the (7) ______ you want. Then check the appropriate card, as with the author catalogue. Next look for the book on the shelf. Let the librarian stamp it (8) ______ you take it out of the library. If the book isn't on the shelf, ask the librarian to get it for you.`;

const contents = freeze({
  a1: freeze({
    items: freeze([
      mcq({
        id: 'g6-u1-wb-a1-01',
        prompt: '1. Find the word which has a different sound in the part underlined: study / lunch / subject / computer.',
        options: [['A', 'study'], ['B', 'lunch'], ['C', 'subject'], ['D', 'computer']],
        correct: 'D',
        reason: 'Đáp án D. Phần gạch chân trong computer được phát âm /juː/, còn study, lunch và subject có âm /ʌ/.',
        theory: 'Cùng chữ “u” không có nghĩa là luôn cùng âm. Ở câu này cần nghe/nhận diện âm của đúng phần được gạch chân.',
        example: 'study /ˈstʌdi/ · lunch /lʌntʃ/ · subject /ˈsʌbdʒekt/ · computer /kəmˈpjuːtə(r)/.'
      }),
      mcq({
        id: 'g6-u1-wb-a1-02',
        prompt: '2. Find the word which has a different sound in the part underlined: calculator / classmate / fast / father.',
        options: [['A', 'calculator'], ['B', 'classmate'], ['C', 'fast'], ['D', 'father']],
        correct: 'A',
        reason: 'Đáp án A. Phần gạch chân trong calculator có âm /æ/; classmate, fast và father dùng âm /ɑː/ theo phát âm Anh-Anh của bài.',
        theory: 'Bài đang so sánh âm của chữ “a”. Cần dựa vào phát âm của từ, không chỉ nhìn cách viết.',
        example: 'calculator /ˈkælkjuleɪtə(r)/ · classmate /ˈklɑːsmeɪt/ · fast /fɑːst/ · father /ˈfɑːðə(r)/.'
      }),
      mcq({
        id: 'g6-u1-wb-a1-03',
        prompt: '3. Find the word which has a different sound in the part underlined: school / teaching / chess / chalk.',
        options: [['A', 'school'], ['B', 'teaching'], ['C', 'chess'], ['D', 'chalk']],
        correct: 'A',
        reason: 'Đáp án A. “ch” trong school được phát âm /k/; trong teaching, chess và chalk là /tʃ/.',
        theory: 'Nhóm chữ “ch” có thể có nhiều cách phát âm. Câu này kiểm tra /k/ so với /tʃ/.',
        example: 'school /skuːl/ · teaching /ˈtiːtʃɪŋ/ · chess /tʃes/ · chalk /tʃɔːk/.'
      }),
      mcq({
        id: 'g6-u1-wb-a1-04',
        prompt: '4. Find the word which has a different sound in the part underlined: smart / sharpener / grammar / star.',
        options: [['A', 'smart'], ['B', 'sharpener'], ['C', 'grammar'], ['D', 'star']],
        correct: 'C',
        reason: 'Đáp án C. Phần “ar” được gạch chân trong grammar có âm /ə(r)/, còn smart, sharpener và star có âm /ɑː/.',
        theory: 'Cần nhận diện âm của phần được gạch chân trong từng từ; cùng cách viết không bắt buộc phát âm giống nhau.',
        example: 'smart /smɑːt/ · sharpener /ˈʃɑːpnə(r)/ · grammar /ˈɡræmə(r)/ · star /stɑː(r)/.'
      }),
      mcq({
        id: 'g6-u1-wb-a1-05',
        prompt: '5. Find the word which has a different sound in the part underlined: compass / homework / someone / wonderful.',
        options: [['A', 'compass'], ['B', 'homework'], ['C', 'someone'], ['D', 'wonderful']],
        correct: 'B',
        reason: 'Đáp án B. Phần gạch chân trong homework có âm /əʊ/; compass, someone và wonderful có âm /ʌ/.',
        theory: 'Câu này kiểm tra hai cách phát âm khác nhau của chữ “o”: /əʊ/ và /ʌ/.',
        example: 'compass /ˈkʌmpəs/ · homework /ˈhəʊmwɜːk/ · someone /ˈsʌmwʌn/ · wonderful /ˈwʌndəfl/.'
      })
    ])
  }),

  b2: freeze({
    items: freeze([
      mcq({
        id: 'g6-u1-wb-b2-01',
        prompt: '1. The students at my school can (do / have / study) quietly in the library in the afternoon.',
        options: [['do', 'do'], ['have', 'have'], ['study', 'study']],
        correct: 'study',
        reason: 'Đáp án study. Câu nói học sinh có thể học yên lặng trong thư viện vào buổi chiều.',
        theory: 'study = học. Trong ngữ cảnh thư viện, “study quietly” phù hợp về nghĩa.',
        example: 'The students at my school can study quietly in the library in the afternoon.'
      }),
      mcq({
        id: 'g6-u1-wb-b2-02',
        prompt: '2. My grandma (plays / does / studies) morning exercise every day.',
        options: [['plays', 'plays'], ['does', 'does'], ['studies', 'studies']],
        correct: 'does',
        reason: 'Đáp án does. Cụm dùng trong bài là “do morning exercise”; chủ ngữ My grandma là ngôi thứ ba số ít nên do → does.',
        theory: 'Hiện tại đơn: he/she/it hoặc chủ ngữ số ít thường làm động từ thêm -s/-es.',
        example: 'My grandma does morning exercise every day.'
      }),
      mcq({
        id: 'g6-u1-wb-b2-03',
        prompt: "3. We don't usually (play / have / study) homework on Saturday.",
        options: [['play', 'play'], ['have', 'have'], ['study', 'study']],
        correct: 'have',
        reason: 'Đáp án have. Ở đây câu có nghĩa “chúng tôi thường không có bài tập về nhà vào thứ Bảy”, nên dùng have homework.',
        theory: 'Cần đọc đúng nghĩa của cả câu. “have homework” = có bài tập về nhà; khác với “do homework” = làm bài tập về nhà.',
        example: "We don't usually have homework on Saturday."
      }),
      mcq({
        id: 'g6-u1-wb-b2-04',
        prompt: '4. Do you often (play / do / have) team games during the break?',
        options: [['play', 'play'], ['do', 'do'], ['have', 'have']],
        correct: 'play',
        reason: 'Đáp án play. Cụm tự nhiên trong câu là “play team games” = chơi các trò chơi theo đội.',
        theory: 'Với games trong ngữ cảnh chơi trò chơi, động từ dùng là play.',
        example: 'Do you often play team games during the break?'
      }),
      mcq({
        id: 'g6-u1-wb-b2-05',
        prompt: "5. I have two tests tomorrow, but I don't have much time to (do / have / study).",
        options: [['do', 'do'], ['have', 'have'], ['study', 'study']],
        correct: 'study',
        reason: 'Đáp án study. Vì ngày mai có hai bài kiểm tra nhưng không có nhiều thời gian, ý câu là “không có nhiều thời gian để học”.',
        theory: 'Sau “time to” dùng động từ nguyên mẫu: time to study.',
        example: "I have two tests tomorrow, but I don't have much time to study."
      }),
      mcq({
        id: 'g6-u1-wb-b2-06',
        prompt: "6. On our school's farm, there are a lot of things for us to (play / do / have) at weekends.",
        options: [['play', 'play'], ['do', 'do'], ['have', 'have']],
        correct: 'do',
        reason: 'Đáp án do. “things for us to do” nghĩa là “những việc để chúng tôi làm”.',
        theory: 'Cụm “things to do” dùng do với nghĩa thực hiện/làm các việc.',
        example: "On our school's farm, there are a lot of things for us to do at weekends."
      })
    ])
  }),

  b3: freeze({
    items: freeze([
      typing({ id: 'g6-u1-wb-b3-01', prompt: '1. It is a long seat for two or more students to sit on in the classroom. b________', answer: 'bench', reason: 'Đáp án bench = ghế dài. Mô tả nêu đây là một chỗ ngồi dài cho hai hoặc nhiều học sinh.', theory: 'Đọc hai dấu hiệu chính: “long seat” và “two or more students”.', example: 'bench = ghế dài.' }),
      typing({ id: 'g6-u1-wb-b3-02', prompt: '2. They are of different colours. You draw and colour with them. c________', answer: 'coloured pencils', reason: 'Đáp án coloured pencils = bút chì màu. Chúng có nhiều màu và được dùng để vẽ, tô màu.', theory: 'Danh từ ở số nhiều vì câu dùng “They” và “them”.', example: 'coloured pencils = bút chì màu.' }),
      typing({ id: 'g6-u1-wb-b3-03', prompt: '3. It has two wheels. Many students ride it to school. b________', answer: 'bike', acceptedAnswers: ['bicycle'], reason: 'Đáp án bike hoặc bicycle = xe đạp. Dấu hiệu quyết định là “two wheels” và học sinh “ride it to school”.', theory: 'bike và bicycle đều là cách gọi xe đạp; lời giải SBT trực tuyến chấp nhận cả hai.', example: 'bike / bicycle = xe đạp.' }),
      typing({ id: 'g6-u1-wb-b3-04', prompt: '4. It has many letters and words. You use it to look up new words. d________', answer: 'dictionary', reason: 'Đáp án dictionary = từ điển. Dấu hiệu là dùng để “look up new words” = tra từ mới.', theory: 'look up a word = tra một từ trong từ điển.', example: 'dictionary = từ điển.' }),
      typing({ id: 'g6-u1-wb-b3-05', prompt: '5. It is a small book of blank paper for writing notes in. n________', answer: 'notebook', reason: 'Đáp án notebook = vở/sổ ghi chép. Mô tả nói một quyển nhỏ có giấy trống dùng để viết ghi chú.', theory: 'notebook là danh từ chỉ sổ/vở dùng để ghi chép.', example: 'notebook = vở ghi chép.' }),
      typing({ id: 'g6-u1-wb-b3-06', prompt: '6. It is a small electronic device for calculating with numbers. c________', answer: 'calculator', reason: 'Đáp án calculator = máy tính cầm tay. Dấu hiệu là “electronic device” dùng để “calculating with numbers”.', theory: 'calculate = tính toán; calculator = thiết bị dùng để tính toán.', example: 'calculator = máy tính cầm tay.' }),
      typing({ id: 'g6-u1-wb-b3-07', prompt: '7. It is a room at your school where there are books, newspapers, etc. for you to read, study, or borrow. You can read books or study there. l________', answer: 'library', reason: 'Đáp án library = thư viện. Đây là phòng có sách, báo để đọc, học hoặc mượn.', theory: 'Các dấu hiệu “books, newspapers, read, study, borrow” cùng chỉ tới library.', example: 'library = thư viện.' }),
      typing({ id: 'g6-u1-wb-b3-08', prompt: '8. It is a large picture printed on paper and you put it on a wall as decoration. p________', answer: 'poster', reason: 'Đáp án poster = áp phích. Mô tả là một bức hình lớn in trên giấy và treo lên tường để trang trí.', theory: 'poster là danh từ chỉ tấm áp phích/tranh in lớn treo trên tường.', example: 'poster = áp phích.' })
    ])
  }),

  b4: freeze({
    items: freeze([
      typing({ id: 'g6-u1-wb-b4-01', prompt: '1. School (finish) ______ at 4.30 p.m. every day.', answer: 'finishes', reason: 'Đáp án finishes. “every day” cho biết hoạt động lặp lại ở hiện tại; chủ ngữ School là số ít nên finish → finishes.', theory: 'Hiện tại đơn với chủ ngữ số ít ngôi thứ ba: động từ thường thêm -s/-es.', example: 'School finishes at 4.30 p.m. every day.' }),
      typing({ id: 'g6-u1-wb-b4-02a', prompt: '2. ______ you usually (write) ______ to your pen pal? — Điền chỗ trống thứ nhất.', answer: 'Do', reason: 'Đáp án Do. Đây là câu hỏi hiện tại đơn với chủ ngữ you nên dùng trợ động từ Do ở đầu câu.', theory: 'Câu hỏi hiện tại đơn: Do + I/you/we/they + V nguyên mẫu ...?', example: 'Do you usually write to your pen pal?' }),
      typing({ id: 'g6-u1-wb-b4-02b', prompt: '2. ______ you usually (write) ______ to your pen pal? — Chia động từ write ở chỗ trống thứ hai.', answer: 'write', reason: 'Đáp án write. Khi câu hỏi đã có Do, động từ chính giữ dạng nguyên mẫu.', theory: 'Sau Do/Does trong câu hỏi hiện tại đơn, dùng V nguyên mẫu.', example: 'Do you usually write to your pen pal?' }),
      typing({ id: 'g6-u1-wb-b4-03a', prompt: '3. - ______ your brother (like) ______ to have lunch in the canteen? - No. He (say) ______ that he prefers lunch at home. — Điền chỗ trống thứ nhất.', answer: 'Does', reason: 'Đáp án Does. “your brother” là chủ ngữ số ít ngôi thứ ba nên câu hỏi hiện tại đơn dùng Does.', theory: 'Câu hỏi hiện tại đơn với he/she/it hoặc chủ ngữ số ít: Does + S + V nguyên mẫu ...?', example: 'Does your brother like to have lunch in the canteen?' }),
      typing({ id: 'g6-u1-wb-b4-03b', prompt: '3. - ______ your brother (like) ______ to have lunch in the canteen? - No. He (say) ______ that he prefers lunch at home. — Chia like ở chỗ trống thứ hai.', answer: 'like', reason: 'Đáp án like. Sau trợ động từ Does, động từ chính không thêm -s.', theory: 'Does đã mang dấu hiệu ngôi thứ ba số ít, nên động từ chính trở về dạng nguyên mẫu.', example: 'Does your brother like to have lunch in the canteen?' }),
      typing({ id: 'g6-u1-wb-b4-03c', prompt: '3. - ______ your brother (like) ______ to have lunch in the canteen? - No. He (say) ______ that he prefers lunch at home. — Chia say ở chỗ trống thứ ba.', answer: 'says', reason: 'Đáp án says. Chủ ngữ He là ngôi thứ ba số ít trong câu khẳng định hiện tại đơn nên say → says.', theory: 'Hiện tại đơn, câu khẳng định với he/she/it: V-s/-es.', example: 'He says that he prefers lunch at home.' }),
      typing({ id: 'g6-u1-wb-b4-04a', prompt: "4. It's warm today. I (not want) ______ (stay) ______ home. What about going swimming in the river? — Chia not want.", answer: "don't want", acceptedAnswers: ['do not want'], reason: "Đáp án don't want. Chủ ngữ I ở câu phủ định hiện tại đơn dùng do not / don't + động từ nguyên mẫu want.", theory: "Phủ định hiện tại đơn với I/you/we/they: don't + V nguyên mẫu.", example: "I don't want to stay home." }),
      typing({ id: 'g6-u1-wb-b4-04b', prompt: "4. It's warm today. I (not want) ______ (stay) ______ home. What about going swimming in the river? — Chia stay.", answer: 'to stay', reason: 'Đáp án to stay. Sau want dùng to + động từ nguyên mẫu.', theory: 'want + to-infinitive: want to stay, want to go, want to learn.', example: "I don't want to stay home." }),
      typing({ id: 'g6-u1-wb-b4-05a', prompt: '5. My classmates and I often (wear) ______ shorts and T-shirts when we (go) ______ camping. — Chia wear.', answer: 'wear', reason: 'Đáp án wear. Chủ ngữ “My classmates and I” là số nhiều; câu nói thói quen với often nên dùng hiện tại đơn dạng nguyên mẫu.', theory: 'I/you/we/they và chủ ngữ số nhiều dùng V nguyên mẫu ở câu khẳng định hiện tại đơn.', example: 'My classmates and I often wear shorts and T-shirts.' }),
      typing({ id: 'g6-u1-wb-b4-05b', prompt: '5. My classmates and I often (wear) ______ shorts and T-shirts when we (go) ______ camping. — Chia go.', answer: 'go', reason: 'Đáp án go. “we” là chủ ngữ số nhiều; đây là thói quen nên dùng hiện tại đơn.', theory: 'we + go; cụm go camping = đi cắm trại.', example: '... when we go camping.' }),
      typing({ id: 'g6-u1-wb-b4-06a', prompt: '6. My family like (spend) ______ our summer holidays at the seaside, but last July we (go) ______ to Cambodia for a week. — Chia spend.', answer: 'to spend', acceptedAnswers: ['spending'], reason: 'Đáp án to spend hoặc spending. Sau like, trong câu này cả to-infinitive và V-ing đều được lời giải SBT chấp nhận.', theory: 'like có thể theo sau bởi to + V hoặc V-ing trong cấu trúc của bài này.', example: 'My family like to spend / spending our summer holidays at the seaside.' }),
      typing({ id: 'g6-u1-wb-b4-06b', prompt: '6. My family like (spend) ______ our summer holidays at the seaside, but last July we (go) ______ to Cambodia for a week. — Chia go.', answer: 'went', reason: 'Đáp án went. “last July” là mốc thời gian quá khứ đã kết thúc nên go phải đổi thành dạng quá khứ bất quy tắc went.', theory: 'Past simple: go → went. Dấu hiệu ở chính câu là last July.', example: 'Last July we went to Cambodia for a week.' })
    ])
  }),

  b5: freeze({
    items: freeze([
      mcq({ id: 'g6-u1-wb-b5-01', prompt: 'Word box: ball games · have · English lessons · international · housework · subjects · share · study\n\n1. Do you have ______ on Monday? - No, on Tuesday.', options: WORD_BOX_B5, correct: 'english-lessons', reason: 'Đáp án English lessons. Câu trả lời “No, on Tuesday” cho thấy hai bạn đang nói về lịch có tiết tiếng Anh.', theory: 'have English lessons = có/học các tiết tiếng Anh theo thời khóa biểu.', example: 'Do you have English lessons on Monday?' }),
      mcq({ id: 'g6-u1-wb-b5-02', prompt: 'Word box: ball games · have · English lessons · international · housework · subjects · share · study\n\n2. My brother wants to ______ film and photography.', options: WORD_BOX_B5, correct: 'study', reason: 'Đáp án study. Film and photography là nội dung/môn mà người anh muốn học.', theory: 'study + subject/field = học một môn hoặc lĩnh vực.', example: 'My brother wants to study film and photography.' }),
      mcq({ id: 'g6-u1-wb-b5-03', prompt: 'Word box: ball games · have · English lessons · international · housework · subjects · share · study\n\n3. Children like to play ______ in the school yard.', options: WORD_BOX_B5, correct: 'ball-games', reason: 'Đáp án ball games. Cụm play ball games phù hợp với hoạt động trẻ em chơi ở sân trường.', theory: 'play + games; ball games = các trò chơi với bóng.', example: 'Children like to play ball games in the school yard.' }),
      mcq({ id: 'g6-u1-wb-b5-04', prompt: 'Word box: ball games · have · English lessons · international · housework · subjects · share · study\n\n4. I usually help my mother with the ______ after school.', options: WORD_BOX_B5, correct: 'housework', reason: 'Đáp án housework. “help my mother with the housework” nghĩa là giúp mẹ làm việc nhà.', theory: 'housework là danh từ chỉ công việc nhà.', example: 'I usually help my mother with the housework after school.' }),
      mcq({ id: 'g6-u1-wb-b5-05', prompt: 'Word box: ball games · have · English lessons · international · housework · subjects · share · study\n\n5. We often ______ bread and eggs for breakfast.', options: WORD_BOX_B5, correct: 'have', reason: 'Đáp án have. “have bread and eggs for breakfast” nghĩa là ăn/dùng bánh mì và trứng cho bữa sáng.', theory: 'have + food + for breakfast/lunch/dinner là cách diễn đạt thông dụng.', example: 'We often have bread and eggs for breakfast.' }),
      mcq({ id: 'g6-u1-wb-b5-06', prompt: 'Word box: ball games · have · English lessons · international · housework · subjects · share · study\n\n6. My classmates and I ______ our things with each other.', options: WORD_BOX_B5, correct: 'share', reason: 'Đáp án share. “share our things with each other” = chia sẻ đồ dùng với nhau.', theory: 'share something with somebody = chia sẻ thứ gì với ai.', example: 'My classmates and I share our things with each other.' }),
      mcq({ id: 'g6-u1-wb-b5-07', prompt: 'Word box: ball games · have · English lessons · international · housework · subjects · share · study\n\n7. There are many ______ schools in Ha Noi.', options: WORD_BOX_B5, correct: 'international', reason: 'Đáp án international. “international schools” = các trường quốc tế.', theory: 'international là tính từ đứng trước danh từ schools.', example: 'There are many international schools in Ha Noi.' }),
      mcq({ id: 'g6-u1-wb-b5-08', prompt: 'Word box: ball games · have · English lessons · international · housework · subjects · share · study\n\n8. Physics and maths are my favourite ______.', options: WORD_BOX_B5, correct: 'subjects', reason: 'Đáp án subjects. Physics và maths đều là các môn học nên dùng danh từ số nhiều subjects.', theory: 'subject = môn học; hai môn trở lên → subjects.', example: 'Physics and maths are my favourite subjects.' })
    ])
  }),

  b6: freeze({
    items: freeze([
      typing({ id: 'g6-u1-wb-b6-01', prompt: '1. My grandmother / at home / always / is / in the evening / .', answer: 'My grandmother is always at home in the evening.', reason: 'Đáp án: My grandmother is always at home in the evening. Trạng từ always đứng sau động từ be “is”.', theory: 'Với động từ be: be + adverb of frequency.', example: 'She is always at home in the evening.' }),
      typing({ id: 'g6-u1-wb-b6-02', prompt: '2. celebrate / my birthday / I / usually / with my friends / .', answer: 'I usually celebrate my birthday with my friends.', reason: 'Đáp án: I usually celebrate my birthday with my friends. Usually đứng trước động từ thường celebrate.', theory: 'Với động từ thường: adverb of frequency thường đứng trước động từ.', example: 'I usually celebrate my birthday with my friends.' }),
      typing({ id: 'g6-u1-wb-b6-03', prompt: '3. you / Sunday / What time / usually / do / on / get up / ?', answer: 'What time do you usually get up on Sunday?', reason: 'Đáp án: What time do you usually get up on Sunday? Đây là câu hỏi hiện tại đơn: What time + do + you + usually + get up + on Sunday?', theory: 'Wh-question hiện tại đơn: Wh-word + do/does + subject + V nguyên mẫu?', example: 'What time do you usually get up on Sunday?' }),
      typing({ id: 'g6-u1-wb-b6-04', prompt: '4. speak / We / our / in / Vietnamese / English class / hardly ever / .', answer: 'We hardly ever speak Vietnamese in our English class.', reason: 'Đáp án: We hardly ever speak Vietnamese in our English class. Hardly ever đứng trước động từ thường speak.', theory: 'hardly ever = hầu như không bao giờ; thường đứng trước động từ thường.', example: 'We hardly ever speak Vietnamese in our English class.' }),
      typing({ id: 'g6-u1-wb-b6-05', prompt: '5. always / The / six forty-five / arrives / school bus / at / .', answer: 'The school bus always arrives at six forty-five.', reason: 'Đáp án: The school bus always arrives at six forty-five. Always đứng trước động từ thường arrives.', theory: 'Trạng từ tần suất đứng trước động từ thường; “at” dùng trước giờ.', example: 'The school bus always arrives at six forty-five.' })
    ])
  }),

  c1: freeze({
    items: freeze([
      typing({
        id: 'g6-u1-wb-c1-01',
        prompt: `Work in groups. Practise introducing a friend to someone else.\n\nExample in the SBT:\nNam: Huy, this is Huong, my new friend.\nHuy: Hi, Huong. Nice to meet you.\nHuong: Hi, Huy. Nice to meet you, too.\n\nHãy gõ phần thực hành giới thiệu một người bạn của em.`,
        answer: 'Lan, this is Minh, my new friend. Hi, Minh. Nice to meet you. Hi, Lan. Nice to meet you, too.',
        open: true,
        reason: 'Đây là bài nói mở. Học sinh thay tên/người bạn và thực hành theo chức năng giao tiếp của mẫu; không có một đáp án duy nhất.',
        theory: 'This is + tên dùng để giới thiệu người; Nice to meet you dùng khi gặp người mới; Nice to meet you, too là lời đáp.',
        example: 'Bài tham khảo chỉ minh họa cách thay tên; học sinh có thể dùng tên khác.'
      })
    ])
  }),

  c3: freeze({
    items: freeze([
      typing({
        id: 'g6-u1-wb-c3-01',
        prompt: `Talk about your school. Use these ideas in your talk:\n- the name of your school\n- the location of your school\n- the number of classes / teachers / students\n- the subjects at school\n- the activities at school\n- the things you like about your school\n\nHãy gõ phần nói của em.`,
        answer: 'My school is Nguyen Du Secondary School. It is in my town. There are many classes, teachers and students. We study English, maths and other subjects. We have sports and club activities. I like my teachers and friends at school.',
        open: true,
        reason: 'Đây là bài nói về trường của chính học sinh nên có nhiều câu trả lời đúng. Bài tham khảo chỉ cho thấy cách bao quát các ý mà SBT yêu cầu.',
        theory: 'Dùng hiện tại đơn để nói thông tin/sinh hoạt thường xuyên của trường; có thể dùng There is/There are để nói số lượng.',
        example: 'Đảm bảo phần nói của em có các ý phù hợp từ danh sách trong SBT.'
      })
    ])
  }),

  d1: freeze({
    items: freeze([
      mcq({ id: 'g6-u1-wb-d1-01', prompt: 'Word box: their · begins · on · go · off · school · all · learn\n\nChọn từ cho chỗ (1).', stimulus: { title: 'D1 · Schoolchildren in England', promptLabel: 'Đọc đoạn văn và chọn từ trong word box của SBT', text: D1_TEXT }, options: WORD_BOX_D1, correct: 'go', reason: 'Đáp án go. “they first go to the cloakroom” = đầu tiên các em đi đến phòng treo áo.', theory: 'go to + place = đi đến một nơi.', example: 'They first go to the cloakroom.' }),
      mcq({ id: 'g6-u1-wb-d1-02', prompt: 'Word box: their · begins · on · go · off · school · all · learn\n\nChọn từ cho chỗ (2).', stimulus: { title: 'D1 · Schoolchildren in England', promptLabel: 'Đọc đoạn văn và chọn từ trong word box của SBT', text: D1_TEXT }, options: WORD_BOX_D1, correct: 'off', reason: 'Đáp án off. Cụm “take off” nghĩa là cởi ra; ở đây là cởi áo khoác, áo mưa, mũ.', theory: 'take off + clothes = cởi quần áo/phụ kiện.', example: 'They take off their coats and raincoats.' }),
      mcq({ id: 'g6-u1-wb-d1-03', prompt: 'Word box: their · begins · on · go · off · school · all · learn\n\nChọn từ cho chỗ (3).', stimulus: { title: 'D1 · Schoolchildren in England', promptLabel: 'Đọc đoạn văn và chọn từ trong word box của SBT', text: D1_TEXT }, options: WORD_BOX_D1, correct: 'their', reason: 'Đáp án their. Sau go to cần cụm “their classroom” = lớp học của các em.', theory: 'their là tính từ sở hữu của they và đứng trước danh từ.', example: '... and then go to their classroom.' }),
      mcq({ id: 'g6-u1-wb-d1-04', prompt: 'Word box: their · begins · on · go · off · school · all · learn\n\nChọn từ cho chỗ (4).', stimulus: { title: 'D1 · Schoolchildren in England', promptLabel: 'Đọc đoạn văn và chọn từ trong word box của SBT', text: D1_TEXT }, options: WORD_BOX_D1, correct: 'learn', reason: 'Đáp án learn. Trong laboratories and workshops, học sinh học physics, chemistry and art.', theory: 'learn + subject/content = học một môn/nội dung.', example: '... where they learn physics, chemistry and art.' }),
      mcq({ id: 'g6-u1-wb-d1-05', prompt: 'Word box: their · begins · on · go · off · school · all · learn\n\nChọn từ cho chỗ (5).', stimulus: { title: 'D1 · Schoolchildren in England', promptLabel: 'Đọc đoạn văn và chọn từ trong word box của SBT', text: D1_TEXT }, options: WORD_BOX_D1, correct: 'on', reason: 'Đáp án on. Cụm cố định “on duty” nghĩa là trực/làm nhiệm vụ.', theory: 'on duty = đang trực, đang làm nhiệm vụ.', example: 'When a student is on duty, ...' }),
      mcq({ id: 'g6-u1-wb-d1-06', prompt: 'Word box: their · begins · on · go · off · school · all · learn\n\nChọn từ cho chỗ (6).', stimulus: { title: 'D1 · Schoolchildren in England', promptLabel: 'Đọc đoạn văn và chọn từ trong word box của SBT', text: D1_TEXT }, options: WORD_BOX_D1, correct: 'school', reason: 'Đáp án school. Câu hoàn chỉnh là “he comes to school very early”.', theory: 'come/go to school = đến/đi học; school trong cụm này thường không cần the.', example: 'He comes to school very early.' }),
      mcq({ id: 'g6-u1-wb-d1-07', prompt: 'Word box: their · begins · on · go · off · school · all · learn\n\nChọn từ cho chỗ (7).', stimulus: { title: 'D1 · Schoolchildren in England', promptLabel: 'Đọc đoạn văn và chọn từ trong word box của SBT', text: D1_TEXT }, options: WORD_BOX_D1, correct: 'all', reason: 'Đáp án all. “open all the windows” = mở tất cả các cửa sổ.', theory: 'all + plural noun = tất cả các ...', example: 'He has to open all the windows.' }),
      mcq({ id: 'g6-u1-wb-d1-08', prompt: 'Word box: their · begins · on · go · off · school · all · learn\n\nChọn từ cho chỗ (8).', stimulus: { title: 'D1 · Schoolchildren in England', promptLabel: 'Đọc đoạn văn và chọn từ trong word box của SBT', text: D1_TEXT }, options: WORD_BOX_D1, correct: 'begins', reason: 'Đáp án begins. Chủ ngữ “the lesson” là số ít và đoạn mô tả lịch thường ngày, nên begin → begins.', theory: 'Hiện tại đơn với chủ ngữ số ít: begin → begins.', example: 'At seven thirty the teacher comes into the room and the lesson begins.' })
    ])
  }),

  d2: freeze({
    items: freeze([
      typing({ id: 'g6-u1-wb-d2-01', prompt: `${D2_TEXT}\n\n1. Why was Tom nervous at first?`, answer: 'Because the teachers and most of his classmates were new to him.', acceptedAnswers: ['The teachers and most of his classmates were new to him.', 'Because the teachers were all new to him and most of his classmates were new too.'], reason: 'Tom nói: “The teachers are all new to me. Most of my classmates are new, too.” Vì vậy Tom lo lắng vì giáo viên và hầu hết bạn cùng lớp đều mới đối với Tom.', theory: 'Câu hỏi Why cần trả lời nguyên nhân; dùng evidence trực tiếp trong hội thoại.', example: 'Because the teachers and most of his classmates were new to him.' }),
      typing({ id: 'g6-u1-wb-d2-02', prompt: `${D2_TEXT}\n\n2. What are Tom's teachers and classmates like?`, answer: 'They are all nice to him.', acceptedAnswers: ["They're all nice to him.", 'They are friendly and nice to him.', "They're friendly to him."], reason: 'Khi bố hỏi “Are they friendly to you?”, Tom trả lời “They’re all nice to me.” Vì vậy giáo viên và bạn học đều thân thiện/tốt với Tom.', theory: 'What are ... like? hỏi đặc điểm/tính chất của người hoặc vật.', example: 'They are all nice to him.' }),
      typing({ id: 'g6-u1-wb-d2-03', prompt: `${D2_TEXT}\n\n3. What's his favourite subject?`, answer: 'IT.', acceptedAnswers: ['IT', 'His favourite subject is IT.', 'It is IT.'], reason: 'Tom liệt kê maths, geography và IT rồi nói “IT, my favourite subject”, nên đáp án là IT.', theory: 'Đọc đúng chi tiết xác định “my favourite subject”, không cần liệt kê tất cả môn học.', example: 'His favourite subject is IT.' }),
      typing({ id: 'g6-u1-wb-d2-04', prompt: `${D2_TEXT}\n\n4. What club does he want to join?`, answer: 'The judo club.', acceptedAnswers: ['judo club', 'He wants to join the judo club.', 'He wants to join judo club.'], reason: 'Tom hỏi bố: “can I join the judo club at school?”, vì vậy câu lạc bộ Tom muốn tham gia là judo club.', theory: 'Câu hỏi What club ...? cần trả lời tên câu lạc bộ.', example: 'He wants to join the judo club.' }),
      typing({ id: 'g6-u1-wb-d2-05', prompt: `${D2_TEXT}\n\n5. Did Tom have a nice first day at his new school?`, answer: 'Yes, he did.', acceptedAnswers: ['Yes.', 'Yes, he did. He had a good first day.'], reason: 'Tom nói trực tiếp “I had a good first day.” Vì vậy câu hỏi Yes/No này có đáp án Yes, he did.', theory: 'Câu hỏi Did ...? thường trả lời ngắn Yes, S + did / No, S + did not.', example: 'Yes, he did.' })
    ])
  }),

  d3: freeze({
    items: freeze([
      mcq({ id: 'g6-u1-wb-d3-01', prompt: '1. Choose the correct word for gap (1).', stimulus: { title: 'D3 · Tìm sách trong thư viện', promptLabel: 'Đọc toàn đoạn và chọn đúng A/B/C của SBT', text: D3_TEXT }, options: [['A', 'find'], ['B', 'look'], ['C', 'take']], correct: 'A', reason: 'Đáp án A: find. Câu hỏi là “bạn làm gì nếu muốn tìm một cuốn sách trong thư viện?”, nên find phù hợp.', theory: 'find a book = tìm một cuốn sách; look thường cần giới từ trong các nghĩa liên quan.', example: 'What do you do if you want to find a book in a library?' }),
      mcq({ id: 'g6-u1-wb-d3-02', prompt: '2. Choose the correct word for gap (2).', stimulus: { title: 'D3 · Tìm sách trong thư viện', promptLabel: 'Đọc toàn đoạn và chọn đúng A/B/C của SBT', text: D3_TEXT }, options: [['A', 'address'], ['B', 'title'], ['C', 'name']], correct: 'C', reason: "Đáp án C: name. Cụm “the author's name” nghĩa là tên của tác giả; câu sau cũng nhắc lại “If you do not know the author's name”.", theory: "author's name = tên của tác giả.", example: "If you know the author's name, go to the author catalogue." }),
      mcq({ id: 'g6-u1-wb-d3-03', prompt: '3. Choose the correct word for gap (3).', stimulus: { title: 'D3 · Tìm sách trong thư viện', promptLabel: 'Đọc toàn đoạn và chọn đúng A/B/C của SBT', text: D3_TEXT }, options: [['A', 'and'], ['B', 'or'], ['C', 'but']], correct: 'A', reason: 'Đáp án A: and. Hai hành động “find the title” và “check the shelf mark” được thực hiện nối tiếp/cùng hướng, nên dùng and.', theory: 'and nối hai ý bổ sung; or là lựa chọn; but biểu thị tương phản.', example: 'Find the title of the book and check the shelf mark.' }),
      mcq({ id: 'g6-u1-wb-d3-04', prompt: '4. Choose the correct word for gap (4).', stimulus: { title: 'D3 · Tìm sách trong thư viện', promptLabel: 'Đọc toàn đoạn và chọn đúng A/B/C của SBT', text: D3_TEXT }, options: [['A', 'at'], ['B', 'for'], ['C', 'after']], correct: 'B', reason: 'Đáp án B: for. Cụm “look for” nghĩa là tìm kiếm.', theory: 'Phải đọc theo cụm động từ: look for = tìm; look at = nhìn vào; look after = chăm sóc.', example: '... before you look for the appropriate shelf.' }),
      mcq({ id: 'g6-u1-wb-d3-05', prompt: '5. Choose the correct word for gap (5).', stimulus: { title: 'D3 · Tìm sách trong thư viện', promptLabel: 'Đọc toàn đoạn và chọn đúng A/B/C của SBT', text: D3_TEXT }, options: [['A', 'title'], ['B', 'author'], ['C', 'subject']], correct: 'A', reason: 'Đáp án A: title. Khi không biết tên tác giả, đoạn văn hướng dẫn đi tới title catalogue.', theory: 'title catalogue = danh mục theo tiêu đề sách.', example: '... go to the title catalogue.' }),
      mcq({ id: 'g6-u1-wb-d3-06', prompt: '6. Choose the correct word for gap (6).', stimulus: { title: 'D3 · Tìm sách trong thư viện', promptLabel: 'Đọc toàn đoạn và chọn đúng A/B/C của SBT', text: D3_TEXT }, options: [['A', 'be'], ['B', 'are'], ['C', 'is']], correct: 'C', reason: 'Đáp án C: is. Sau there là “no title catalogue” ở số ít, nên dùng there is.', theory: 'there is + danh từ số ít; there are + danh từ số nhiều.', example: 'If there is no title catalogue in the library, ...' }),
      mcq({ id: 'g6-u1-wb-d3-07', prompt: '7. Choose the correct word for gap (7).', stimulus: { title: 'D3 · Tìm sách trong thư viện', promptLabel: 'Đọc toàn đoạn và chọn đúng A/B/C của SBT', text: D3_TEXT }, options: [['A', 'subject'], ['B', 'book'], ['C', 'index']], correct: 'A', reason: 'Đáp án A: subject. Câu đang nói tới subject catalogue và các tiêu đề nằm dưới chủ đề mà người đọc muốn tìm.', theory: 'subject = chủ đề/môn; trong ngữ cảnh thư viện, subject catalogue phân loại theo chủ đề.', example: 'Check all the titles which are under the subject you want.' }),
      mcq({ id: 'g6-u1-wb-d3-08', prompt: '8. Choose the correct word for gap (8).', stimulus: { title: 'D3 · Tìm sách trong thư viện', promptLabel: 'Đọc toàn đoạn và chọn đúng A/B/C của SBT', text: D3_TEXT }, options: [['A', 'after'], ['B', 'before'], ['C', 'when']], correct: 'B', reason: 'Đáp án B: before. Thủ thư phải đóng dấu cuốn sách trước khi người đọc mang sách ra khỏi thư viện.', theory: 'before = trước khi; after = sau khi; when = khi.', example: 'Let the librarian stamp it before you take it out of the library.' })
    ])
  }),

  e1: freeze({
    items: freeze([
      typing({ id: 'g6-u1-wb-e1-01', prompt: '1. Georgie: ______ favourite subjects at school, Frankie?  Frankie: English and geography.', answer: 'What are your', reason: 'Đáp án What are your. Câu trả lời nêu hai môn học yêu thích, nên câu hỏi hoàn chỉnh là “What are your favourite subjects at school, Frankie?”.', theory: 'What are your + plural noun ...? dùng để hỏi những ... của bạn là gì.', example: 'What are your favourite subjects at school, Frankie?' }),
      typing({ id: 'g6-u1-wb-e1-02', prompt: "2. Duy: ______ you like?  Khang: Hip hop. It's my favourite kind of music.", answer: 'What kind of music do', reason: 'Đáp án What kind of music do. Câu trả lời “Hip hop” là một thể loại nhạc, nên cần hỏi “What kind of music do you like?”.', theory: 'Hiện tại đơn với chủ ngữ you: What kind of music + do + you + like?', example: 'What kind of music do you like?' }),
      typing({ id: 'g6-u1-wb-e1-03', prompt: '3. Huong: Which ______?  Mai: An Chau Secondary School.', answer: 'school do you attend', acceptedAnswers: ['secondary school do you attend', 'school do you go to', 'secondary school do you go to'], reason: 'Câu trả lời là tên một trường, nên câu hỏi phải hỏi Mai học trường nào. Các lời giải tham khảo chấp nhận “Which (secondary) school do you attend?” hoặc “Which school do you go to?”.', theory: 'Which + noun dùng khi hỏi lựa chọn/xác định một đối tượng cụ thể.', example: 'Which school do you attend?' }),
      typing({ id: 'g6-u1-wb-e1-04', prompt: '4. Tam: ______ Sunday?  Hue: I usually go out with my friends or family in the morning and have music lessons in the afternoon.', answer: 'What do you usually do on', reason: 'Câu trả lời mô tả các hoạt động vào Chủ nhật, nên câu hỏi là “What do you usually do on Sunday?”.', theory: 'Câu hỏi hiện tại đơn với you: What + do + you + usually + V ...?', example: 'What do you usually do on Sunday?' }),
      typing({ id: 'g6-u1-wb-e1-05', prompt: "5. Fiona: ______ favourite teacher?  Tom: Mrs Mc Keith. She's wonderful.", answer: 'Who is your', reason: 'Câu trả lời là tên một người, nên dùng Who để hỏi giáo viên yêu thích là ai.', theory: 'Who dùng để hỏi về người.', example: 'Who is your favourite teacher?' })
    ])
  }),

  e2: freeze({
    items: freeze([
      typing({ id: 'g6-u1-wb-e2-01', prompt: "1. IT / Trong's favourite subject.", answer: "IT is Trong's favourite subject.", reason: 'Đáp án dùng be để nối chủ ngữ IT với phần mô tả “Trong’s favourite subject”.', theory: 'Câu gán/miêu tả: S + be + noun phrase.', example: "IT is Trong's favourite subject." }),
      typing({ id: 'g6-u1-wb-e2-02', prompt: '2. Mrs Hoa / our teacher / English.', answer: 'Mrs Hoa is our teacher of English.', acceptedAnswers: ['Mrs Hoa is our English teacher.'], reason: 'Lời giải tham khảo chuẩn chấp nhận “Mrs Hoa is our teacher of English” hoặc “Mrs Hoa is our English teacher”.', theory: 'Có thể nói “teacher of English” hoặc “English teacher” để chỉ giáo viên tiếng Anh.', example: 'Mrs Hoa is our teacher of English.' }),
      typing({ id: 'g6-u1-wb-e2-03', prompt: "3. There / six coloured pencils / my friend's box.", answer: "There are six coloured pencils in my friend's box.", reason: 'Có six coloured pencils là danh từ số nhiều nên dùng There are; vị trí là in my friend’s box.', theory: 'There are + plural noun; in + container/place.', example: "There are six coloured pencils in my friend's box." }),
      typing({ id: 'g6-u1-wb-e2-04', prompt: '4. Where / Ms Lan / live?', answer: 'Where does Ms Lan live?', reason: 'Câu hỏi hiện tại đơn với Ms Lan (ngôi thứ ba số ít) dùng does; sau does, live giữ dạng nguyên mẫu.', theory: 'Wh-word + does + S + V nguyên mẫu?', example: 'Where does Ms Lan live?' }),
      typing({ id: 'g6-u1-wb-e2-05', prompt: '5. Shall / introduce you / my best friend, An Son?', answer: 'Shall I introduce you to my best friend, An Son?', reason: 'Sau Shall cần chủ ngữ I và động từ nguyên mẫu introduce; cấu trúc “introduce somebody to somebody”.', theory: 'Shall I + V ...? dùng để đưa ra lời đề nghị; introduce A to B = giới thiệu A với B.', example: 'Shall I introduce you to my best friend, An Son?' })
    ])
  }),

  e3: freeze({
    items: freeze([
      typing({
        id: 'g6-u1-wb-e3-01',
        prompt: `Here is a list of some ideas for Linda's class rules:\n1. arrive on time\n2. remember books, school things, homework, etc.\n3. listen carefully in class\n4. be prepared to work in pairs or in groups\n5. do all the homework the teacher gives\n6. try to speak English in the English lesson\n\nNow write a short paragraph of 40-50 words about how you keep your class rules. Use Linda's class rules and you can add your own.\n\nOpening in the SBT: “We also have some class rules, and we try to keep all of them. We always try to arrive at school on time.”\n\nHãy viết đoạn của em.`,
        answer: 'We always arrive on time and remember our books and homework. We listen carefully in class and are ready to work in pairs or groups. We do all the homework our teacher gives us, and we also try to speak English during every English lesson.',
        open: true,
        reason: 'Đây là bài viết mở 40-50 từ. Câu trả lời có thể khác bài tham khảo nếu vẫn bám chủ đề nội quy lớp và dùng các ý SBT cho.',
        theory: 'Kiểm tra ba điểm của chính đề: đúng chủ đề class rules, có các câu hoàn chỉnh và giữ độ dài khoảng 40-50 từ.',
        example: 'Bài tham khảo trên là một mẫu ngắn dùng các ý arrive on time, homework, listen carefully, pair/group work và speak English.'
      })
    ])
  })
});

export function getG6U1WorkbookContent(key) {
  const content = contents[key];
  if (!content) throw new Error(`Unknown G6 U1 workbook lesson: ${key}`);
  return content;
}
