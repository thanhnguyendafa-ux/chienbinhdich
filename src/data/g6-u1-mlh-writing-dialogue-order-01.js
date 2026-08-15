const freeze = value => Object.freeze(value);
const afterSubmit = freeze({ access: 'after_submit' });

const wordTypingUi = freeze({
  promptLabel: 'Thầy hỏi · WORD Việt → Anh',
  contextLabel: 'Tiếng Việt + vai trò trong hội thoại',
  instruction: 'Con gõ đúng từ tiếng Anh. Lý thuyết chỉ mở sau khi con submit.',
  inputLabel: 'Từ tiếng Anh của con',
  placeholder: 'Type the English word...'
});

const chunkTypingUi = freeze({
  promptLabel: 'Thầy hỏi · CHUNK Việt → Anh',
  contextLabel: 'Tiếng Việt + cụm dùng trong hội thoại',
  instruction: 'Con gõ đúng cả cụm tiếng Anh. Lý thuyết chỉ mở sau khi con submit.',
  inputLabel: 'Cụm tiếng Anh của con',
  placeholder: 'Type the English chunk...'
});

const qid = number => `g6u1-mlh-do-q${String(number).padStart(2, '0')}`;
const teaching = (correctLabel, reason, theory, example) => freeze({ correctLabel, reason, theory, example });

function typing({ number, stage, vi, en, reason, theory, example }) {
  return freeze({
    id: qid(number),
    type: 'typing',
    stage,
    vi,
    en,
    typingUi: stage === 'word' ? wordTypingUi : chunkTypingUi,
    theorySupport: afterSubmit,
    teachingFeedback: teaching(en, reason, theory, example)
  });
}

function mcq({ number, prompt, choices, correctChoiceId, reason, theory, example }) {
  const frozenChoices = freeze(choices.map(choice => freeze({ ...choice })));
  return freeze({
    id: qid(number),
    type: 'mcq',
    stage: 'sentence',
    prompt,
    choices: frozenChoices,
    correctChoiceId,
    theorySupport: afterSubmit,
    teachingFeedback: teaching(
      frozenChoices.find(choice => choice.id === correctChoiceId)?.text ?? correctChoiceId,
      reason,
      theory,
      example
    )
  });
}

const WORDS = [
  ['giáo viên — danh từ', 'teacher', 'teacher = giáo viên.', 'Đây là từ lõi trong cụm form teacher = giáo viên chủ nhiệm.', 'my form teacher'],
  ['dạy — dạng đi với “cô ấy” trong câu nguồn', 'teaches', 'teaches = dạy, dạng Present Simple đi với she.', 'Mr Thanh Brain v1.2 · She = ONE → Present Simple affirmative dùng TEACH + ES.', 'She teaches me physics.'],
  ['Vật lý — môn học', 'physics', 'physics = môn Vật lý.', 'Tên môn học này đi sau teaches me trong câu nguồn.', 'She teaches me physics.'],
  ['nghiêm khắc — tính từ', 'strict', 'strict = nghiêm khắc.', 'strict là AURA word; trong câu hỏi nguồn: Is she strict?', 'Is she strict?'],
  ['tuyệt / rất tốt — tính từ', 'great', 'great = tuyệt / rất tốt.', 'Trong hội thoại, She’s great là phản hồi tích cực về cô giáo.', 'No. She’s great.'],
  ['đầu tiên — từ chỉ thứ tự', 'first', 'first = đầu tiên.', 'first đứng trước day trong first day at school.', 'your first day at school'],
  ['ngày — danh từ', 'day', 'day = ngày.', 'first day = ngày đầu tiên.', 'first day at school'],
  ['tuyệt vời — tính từ/cảm thán', 'wonderful', 'wonderful = tuyệt vời.', 'Oh, wonderful! trả lời câu hỏi về ngày đầu tiên ở trường.', 'Oh, wonderful!'],
  ['đã gặp — quá khứ của meet', 'met', 'met = đã gặp.', 'met là Past Simple irregular form của meet.', 'I met many new people.'],
  ['mọi người / người — danh từ số nhiều', 'people', 'people = mọi người / nhiều người.', 'people là plural meaning dù không có -s.', 'many new people'],
  ['hy vọng — động từ', 'hope', 'hope = hy vọng.', 'Trong câu nguồn: Hope I could make them my friends soon.', 'Hope I could...'],
  ['bạn bè — danh từ số nhiều', 'friends', 'friends = những người bạn.', 'make friends = kết bạn.', 'make friends soon'],
  ['sớm — trạng từ', 'soon', 'soon = sớm.', 'soon xuất hiện ở cả make friends soon và see you soon.', 'See you soon.'],
  ['rời đi — động từ', 'leave', 'leave = rời đi.', 'Cụm nguồn: it’s time for me to leave.', 'time for me to leave'],
  ['tạm biệt — lời chào kết thúc', 'bye', 'bye = tạm biệt.', 'BYE là dấu hiệu rất mạnh cho phần kết của hội thoại.', 'Bye. / See you soon.']
].map(([vi, en, reason, theory, example]) => ({ vi, en, reason, theory, example }));

const CHUNKS = [
  ['giáo viên chủ nhiệm của mình — cụm 3 từ', 'my form teacher', 'my form teacher = giáo viên chủ nhiệm của mình.', 'Đây là câu trả lời trực tiếp sau lời dẫn “Hãy kể cho mình về giáo viên chủ nhiệm của bạn.”', 'My form teacher is Mrs Hien.'],
  ['dạy mình môn Vật lý — cụm 3 từ', 'teaches me physics', 'teaches me physics = dạy mình môn Vật lý.', 'Cụm này bổ sung thông tin về Mrs Hien.', 'She teaches me physics.'],
  ['ngày đầu tiên ở trường của bạn — cụm 5 từ', 'your first day at school', 'your first day at school = ngày đầu tiên ở trường của bạn.', 'Đây là topic hook trong câu hỏi How was your first day at school?', 'How was your first day at school?'],
  ['đã gặp nhiều người mới — cụm 4 từ', 'met many new people', 'met many new people = đã gặp nhiều người mới.', 'Đây là response content cho câu hỏi về ngày đầu tiên.', 'I met many new people.'],
  ['kết bạn với họ — cụm theo câu nguồn 4 từ', 'make them my friends', 'make them my friends = biến họ thành bạn / kết bạn với họ.', 'Đây là ý hy vọng nối sang câu người kia động viên về việc kết bạn.', 'Hope I could make them my friends soon.'],
  ['sớm kết bạn — cụm 3 từ', 'make friends soon', 'make friends soon = sớm kết bạn.', 'Cụm này tạo lexical bridge giữa hai lượt lời liên tiếp.', 'You’ll make friends soon.'],
  ['kể cho mình về giáo viên chủ nhiệm của bạn — cụm 6 từ', 'tell me about your form teacher', 'Đúng cụm mở chủ đề giáo viên chủ nhiệm.', 'Conversation hook: topic opener → response cùng topic.', 'Tell me about your form teacher.'],
  ['cô ấy có nghiêm khắc không — cụm 3 từ', 'is she strict', 'is she strict = cô ấy có nghiêm khắc không.', 'Đây là Yes/No question; response bắt đầu bằng No.', 'Is she strict? – No. She’s great.'],
  ['cô ấy rất tuyệt — cụm 3 từ', 'she is great', 'she is great = cô ấy rất tuyệt.', 'Trong nguồn dùng contraction She’s great; meaning vẫn là She is great.', 'No. She’s great.'],
  ['đến lúc mình phải rời đi — cụm 6 từ', 'time for me to leave', 'time for me to leave = đến lúc mình phải rời đi.', 'Đây là closing signal: báo rời đi rồi nói Bye.', 'It’s time for me to leave. Bye.'],
  ['hẹn sớm gặp lại — cụm 4 từ', 'see you soon', 'see you soon = hẹn sớm gặp lại.', 'Đây là closing response sau Bye.', 'Bye, Huan. See you soon.'],
  ['mình khỏe, cảm ơn — cụm 3 từ', 'fine thanks', 'fine, thanks = mình khỏe, cảm ơn.', 'Đây là response trực tiếp cho How are you?', 'Fine, thanks! And you?']
].map(([vi, en, reason, theory, example]) => ({ vi, en, reason, theory, example }));

const LOGIC = [
  {
    prompt: 'Thầy: CÂU TRẢ LỜI là “Chào Huan. Mình khỏe, cảm ơn! Còn bạn?”. Vậy câu nào đứng trước phù hợp nhất?',
    correctChoiceId: 'a',
    choices: [
      { id: 'a', text: 'Chào Mai. Bạn khỏe không?', feedback: 'Thầy: Đúng. “Mình khỏe” trả lời trực tiếp cho câu hỏi về tình trạng: “Bạn khỏe không?”.' },
      { id: 'b', text: 'Bạn sống ở đâu?', feedback: 'Thầy: Chưa đúng. Câu trả lời không cho biết nơi sống.' },
      { id: 'c', text: 'Cô giáo của bạn có nghiêm khắc không?', feedback: 'Thầy: Chưa đúng. Câu trả lời chưa nói gì về cô giáo.' },
      { id: 'd', text: 'Ngày đầu tiên ở trường của bạn thế nào?', feedback: 'Thầy: Chưa đúng. Câu trả lời đang nói “mình khỏe”, chưa kể về ngày đầu tiên.' }
    ],
    reason: '“Mình khỏe, cảm ơn” là ANSWER cho “Bạn khỏe không?”. Phần “Còn bạn?” đồng thời tạo một HOOK mới cho lượt lời tiếp theo.',
    theory: 'CONVERSATION BRAIN · Đừng xếp theo cảm giác. Đọc RESPONSE trước → hỏi RESPONSE này đang trả lời ý gì → tìm HOOK phù hợp.',
    example: 'Bạn khỏe không? → Mình khỏe, cảm ơn! Còn bạn?'
  },
  {
    prompt: 'Thầy: CÂU TRẢ LỜI là “Rất khỏe, cảm ơn. Ngày đầu tiên ở trường của bạn thế nào, Mai?”. Vậy câu nào đứng trước phù hợp nhất?',
    correctChoiceId: 'b',
    choices: [
      { id: 'a', text: 'Cô ấy có nghiêm khắc không?', feedback: 'Thầy: Chưa đúng. “Rất khỏe” không trả lời câu hỏi về cô giáo.' },
      { id: 'b', text: 'Chào Huan. Mình khỏe, cảm ơn! Còn bạn?', feedback: 'Thầy: Đúng. “Rất khỏe, cảm ơn” trả lời đúng móc “Còn bạn?”.' },
      { id: 'c', text: 'Hãy kể cho mình về giáo viên chủ nhiệm của bạn.', feedback: 'Thầy: Chưa đúng. Lượt trả lời này chưa cung cấp thông tin về giáo viên.' },
      { id: 'd', text: 'Đến lúc mình phải đi rồi. Tạm biệt.', feedback: 'Thầy: Chưa đúng. Đây là closing, không thể dẫn tới câu hỏi về ngày đầu tiên theo logic hiện tại.' }
    ],
    reason: 'Lượt lời này có hai nhiệm vụ: ANSWER “Còn bạn?” bằng “Rất khỏe, cảm ơn”, rồi tạo NEW HOOK về ngày đầu tiên ở trường.',
    theory: 'Một lượt lời có thể vừa ĐÓNG móc cũ vừa MỞ móc mới: ANSWER → NEW HOOK.',
    example: 'Còn bạn? → Rất khỏe, cảm ơn. → Ngày đầu tiên của bạn thế nào?'
  },
  {
    prompt: 'Thầy: CÂU TRẢ LỜI là “Ôi, tuyệt lắm! Mình đã gặp nhiều người mới. Mình hy vọng sớm kết bạn được với họ.” Vậy câu nào đứng trước phù hợp nhất?',
    correctChoiceId: 'c',
    choices: [
      { id: 'a', text: 'Bạn khỏe không?', feedback: 'Thầy: Chưa đúng. Câu trả lời đang kể trải nghiệm ở trường chứ không chỉ trả lời sức khỏe.' },
      { id: 'b', text: 'Cô ấy có nghiêm khắc không?', feedback: 'Thầy: Chưa đúng. Không có thông tin nào về cô giáo trong response.' },
      { id: 'c', text: 'Ngày đầu tiên ở trường của bạn thế nào, Mai?', feedback: 'Thầy: Đúng. “Tuyệt lắm + gặp nhiều người mới” là thông tin về trải nghiệm ngày đầu tiên.' },
      { id: 'd', text: 'Đến lúc mình phải đi rồi phải không?', feedback: 'Thầy: Chưa đúng. Đây chưa phải phần kết hội thoại.' }
    ],
    reason: 'Response chứa đánh giá “tuyệt lắm” và sự kiện “gặp nhiều người mới”, nên hook trước đó phải hỏi về ngày đầu tiên ở trường.',
    theory: 'TOPIC MATCH · Câu trước mở topic nào thì câu sau phải trả lời hoặc phát triển đúng topic đó.',
    example: 'Ngày đầu tiên thế nào? → Tuyệt lắm! Mình gặp nhiều người mới.'
  },
  {
    prompt: 'Thầy: CÂU TRẢ LỜI là “Mình chắc rằng bạn sẽ sớm kết bạn được thôi. Hãy kể cho mình về giáo viên chủ nhiệm của bạn.” Vậy câu nào đứng trước phù hợp nhất?',
    correctChoiceId: 'd',
    choices: [
      { id: 'a', text: 'Không. Cô ấy rất tuyệt.', feedback: 'Thầy: Chưa đúng. Câu này thuộc topic giáo viên và xảy ra muộn hơn.' },
      { id: 'b', text: 'Tạm biệt. Hẹn sớm gặp lại.', feedback: 'Thầy: Chưa đúng. Sau lời tạm biệt không hợp lý để mở lại topic giáo viên.' },
      { id: 'c', text: 'Giáo viên chủ nhiệm của mình là cô Hiền.', feedback: 'Thầy: Chưa đúng. Câu trả lời đang động viên “kết bạn”, nên câu trước phải có ý về kết bạn.' },
      { id: 'd', text: 'Mình đã gặp nhiều người mới và hy vọng sớm kết bạn được với họ.', feedback: 'Thầy: Đúng. “Bạn sẽ sớm kết bạn được” phản hồi trực tiếp ý hy vọng kết bạn.' }
    ],
    reason: 'Hai lượt lời nối bằng lexical/meaning bridge “kết bạn”. Sau khi phản hồi xong, người nói mới mở topic mới: giáo viên chủ nhiệm.',
    theory: 'BRIDGE → NEW TOPIC · Tìm từ/ý lặp lại giữa hai lượt lời, rồi chú ý câu sau có thể mở chủ đề mới.',
    example: 'Hy vọng kết bạn → Bạn sẽ sớm kết bạn được → Hãy kể về giáo viên chủ nhiệm.'
  },
  {
    prompt: 'Thầy: CÂU TRẢ LỜI là “Giáo viên chủ nhiệm của mình là cô Hiền. Cô ấy dạy mình môn Vật lý.” Vậy câu nào đứng trước phù hợp nhất?',
    correctChoiceId: 'a',
    choices: [
      { id: 'a', text: 'Hãy kể cho mình về giáo viên chủ nhiệm của bạn.', feedback: 'Thầy: Đúng. Câu sau cung cấp đúng thông tin mà lời dẫn yêu cầu.' },
      { id: 'b', text: 'Bạn khỏe không?', feedback: 'Thầy: Chưa đúng. Response không trả lời tình trạng sức khỏe.' },
      { id: 'c', text: 'Ngày đầu tiên ở trường thế nào?', feedback: 'Thầy: Chưa đúng. Response đã chuyển sang topic giáo viên chủ nhiệm.' },
      { id: 'd', text: 'Đến lúc mình phải đi rồi.', feedback: 'Thầy: Chưa đúng. Lời báo rời đi phải dẫn tới closing, không dẫn tới giới thiệu giáo viên.' }
    ],
    reason: 'Topic opener “giáo viên chủ nhiệm” phải đi ngay trước response cung cấp tên và môn cô ấy dạy.',
    theory: 'TOPIC OPENER → TOPIC RESPONSE. Đừng chỉ nhìn một từ; hãy hỏi cả lượt lời đang cung cấp loại thông tin gì.',
    example: 'Kể cho mình về giáo viên chủ nhiệm → Giáo viên chủ nhiệm của mình là cô Hiền...'
  },
  {
    prompt: 'Thầy: CÂU TRẢ LỜI là “Cô ấy có nghiêm khắc không?”. Vậy câu nào đứng trước phù hợp nhất?',
    correctChoiceId: 'b',
    choices: [
      { id: 'a', text: 'Mình khỏe, cảm ơn! Còn bạn?', feedback: 'Thầy: Chưa đúng. Chưa có người nữ nào vừa được giới thiệu để “cô ấy” tham chiếu tới.' },
      { id: 'b', text: 'Giáo viên chủ nhiệm của mình là cô Hiền. Cô ấy dạy mình môn Vật lý.', feedback: 'Thầy: Đúng. “Cô ấy” nối trực tiếp trở lại cô Hiền vừa được giới thiệu.' },
      { id: 'c', text: 'Mình đã gặp nhiều người mới.', feedback: 'Thầy: Chưa đúng. “Cô ấy” không có referent phù hợp trong câu này.' },
      { id: 'd', text: 'Tạm biệt. Hẹn sớm gặp lại.', feedback: 'Thầy: Chưa đúng. Đây là closing.' }
    ],
    reason: 'Pronoun clue “cô ấy” cần một người nữ vừa được giới thiệu. Cô Hiền là referent gần và hợp nghĩa.',
    theory: 'REFERENCE CLUE · he/she/they/this/that thường phải nối về một người/vật đã xuất hiện ngay trước hoặc rất gần.',
    example: 'Cô Hiền... → Cô ấy có nghiêm khắc không?'
  },
  {
    prompt: 'Thầy: CÂU TRẢ LỜI là “Không. Cô ấy rất tuyệt.” Vậy câu nào đứng trước phù hợp nhất?',
    correctChoiceId: 'c',
    choices: [
      { id: 'a', text: 'Cô ấy dạy môn gì?', feedback: 'Thầy: Chưa đúng. “Không” không phải câu trả lời tự nhiên cho câu hỏi hỏi môn học.' },
      { id: 'b', text: 'Cô ấy tên gì?', feedback: 'Thầy: Chưa đúng. Câu hỏi WH không được trả lời bằng “Không”.' },
      { id: 'c', text: 'Cô ấy có nghiêm khắc không?', feedback: 'Thầy: Đúng. Response bắt đầu bằng “Không”, nên trước đó rất hợp lý là Yes/No question về tính cách.' },
      { id: 'd', text: 'Bạn gặp ai ở trường?', feedback: 'Thầy: Chưa đúng. Response đang nói về cô giáo, không phải những người mới gặp.' }
    ],
    reason: '“Không” là tín hiệu mạnh của Yes/No response; “cô ấy rất tuyệt” tiếp tục cùng topic tính cách cô giáo.',
    theory: 'YES/NO CLUE · Response bắt đầu Yes/No → tìm câu hỏi Có/Không phù hợp về cùng chủ đề.',
    example: 'Cô ấy có nghiêm khắc không? → Không. Cô ấy rất tuyệt.'
  },
  {
    prompt: 'Thầy: CÂU TRẢ LỜI là “Tạm biệt Huan. Hẹn sớm gặp lại.” Vậy câu nào đứng trước phù hợp nhất?',
    correctChoiceId: 'd',
    choices: [
      { id: 'a', text: 'Ngày đầu tiên ở trường của bạn thế nào?', feedback: 'Thầy: Chưa đúng. Câu này mở topic mới chứ không phải closing.' },
      { id: 'b', text: 'Hãy kể cho mình về giáo viên chủ nhiệm của bạn.', feedback: 'Thầy: Chưa đúng. Đây là topic opener, không phải lời kết.' },
      { id: 'c', text: 'Cô ấy có nghiêm khắc không?', feedback: 'Thầy: Chưa đúng. Câu hỏi này cần một câu trả lời về cô giáo.' },
      { id: 'd', text: 'Ồ, tốt. Đến lúc mình phải đi rồi. Tạm biệt.', feedback: 'Thầy: Đúng. Bye → Bye/See you soon là cặp closing tự nhiên.' }
    ],
    reason: '“Tạm biệt... Hẹn gặp lại” là closing response, nên trước đó phải là một lượt báo rời đi và nói Bye.',
    theory: 'CLOSING CLUE · leave / bye → bye / see you soon. Các tín hiệu kết thúc thường nằm ở cuối chuỗi.',
    example: 'Đến lúc mình phải đi rồi. Tạm biệt. → Tạm biệt. Hẹn sớm gặp lại.'
  }
];

const SOURCE_LINES = freeze([
  freeze({ id: 'line-teacher', text: 'My form teacher is Mrs Hien. She teaches me physics.' }),
  freeze({ id: 'line-no-great', text: 'No. She’s great.' }),
  freeze({ id: 'line-very-well', text: 'Very well, thank you. How was your first day at school, Mai?' }),
  freeze({ id: 'line-leave', text: 'Oh, good. Well, it’s time for me to leave. Bye.' }),
  freeze({ id: 'line-hello', text: 'Hello, Huan. Fine, thanks! And you?' }),
  freeze({ id: 'line-friends-teacher', text: 'I am sure that you’ll make friends soon. Tell me about your form teacher.' }),
  freeze({ id: 'line-hi', text: 'Hi, Mai. How are you?', lockedPosition: 1 }),
  freeze({ id: 'line-bye', text: 'Bye, Huan. See you soon.' }),
  freeze({ id: 'line-strict', text: 'Is she strict?' }),
  freeze({ id: 'line-wonderful', text: 'Oh, wonderful! I met many new people. Hope I could make them my friends soon.' })
]);

const CORRECT_ORDER = freeze([
  'line-hi',
  'line-hello',
  'line-very-well',
  'line-wonderful',
  'line-friends-teacher',
  'line-teacher',
  'line-strict',
  'line-no-great',
  'line-leave',
  'line-bye'
]);

const items = [];

WORDS.forEach((spec, index) => items.push(typing({
  number: index + 1,
  stage: 'word',
  ...spec
})));

CHUNKS.forEach((spec, index) => items.push(typing({
  number: 16 + index,
  stage: 'phrase',
  ...spec
})));

LOGIC.forEach((spec, index) => items.push(mcq({
  number: 28 + index,
  ...spec
})));

items.push(freeze({
  id: qid(36),
  type: 'sequence_number',
  stage: 'sentence',
  prompt: 'Thầy: Bây giờ con làm đúng bài gốc. Các câu đứng yên như trong đề; con chọn hoặc kéo số 2–10 vào ô bên trái để tạo hội thoại đúng. Số 1 đã cho sẵn.',
  lines: SOURCE_LINES,
  correctOrder: CORRECT_ORDER,
  theorySupport: afterSubmit,
  teachingFeedback: teaching(
    'Hội thoại hoàn chỉnh theo logic OPEN → RESPONSE → NEW HOOK → TOPIC → YES/NO → CLOSING.',
    'Thầy: Con hãy kiểm từng mối nối, không đoán cả 10 câu cùng lúc. How are you? → Fine, thanks; And you? → Very well; first day → wonderful/new people; friends → make friends soon; form teacher → Mrs Hien; she → Is she strict?; No → Yes/No question; leave/Bye → Bye/See you soon.',
    'CONVERSATION BRAIN · Mỗi lần chỉ tìm một móc: (1) OPENING, (2) câu nào trả lời trực tiếp, (3) câu đó có mở NEW HOOK không, (4) pronoun/topic có nối được không, (5) closing signal nằm cuối. Câu đứng yên; số thứ tự mới là thứ con cần sắp.',
    '1 Hi, Mai... → 2 Hello, Huan... → 3 Very well... → 4 Oh, wonderful... → 5 I am sure... → 6 My form teacher... → 7 Is she strict? → 8 No... → 9 Oh, good... Bye. → 10 Bye, Huan. See you soon.'
  )
}));

export const global6Unit1MlhWritingDialogueOrder01Content = freeze({
  id: 'g6-u1-mlh-writing-dialogue-order-01',
  version: 1,
  items: freeze(items)
});
