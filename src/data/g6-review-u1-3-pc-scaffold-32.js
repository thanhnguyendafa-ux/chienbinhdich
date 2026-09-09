const TYPE_UI = Object.freeze({
  wordForm: Object.freeze({
    promptLabel: 'WORD FORM',
    contextLabel: 'Yêu cầu',
    instruction: 'Gõ dạng V-ing đúng.',
    inputLabel: 'Đáp án',
    placeholder: 'Type the -ing form...'
  }),
  sentence: Object.freeze({
    promptLabel: 'BUILD THE SENTENCE',
    contextLabel: 'Yêu cầu',
    instruction: 'Gõ cả câu tiếng Anh hoàn chỉnh.',
    inputLabel: 'Câu trả lời',
    placeholder: 'Type the full sentence...'
  }),
  negative: Object.freeze({
    promptLabel: 'NEGATIVE',
    contextLabel: 'Yêu cầu',
    instruction: 'Viết lại câu ở dạng phủ định.',
    inputLabel: 'Câu phủ định',
    placeholder: 'Type the negative sentence...'
  }),
  question: Object.freeze({
    promptLabel: 'QUESTION',
    contextLabel: 'Yêu cầu',
    instruction: 'Tạo câu hỏi hoàn chỉnh.',
    inputLabel: 'Câu hỏi',
    placeholder: 'Type the question...'
  }),
  shortAnswer: Object.freeze({
    promptLabel: 'SHORT ANSWER',
    contextLabel: 'Yêu cầu',
    instruction: 'Gõ câu trả lời ngắn.',
    inputLabel: 'Câu trả lời',
    placeholder: 'Type the short answer...'
  }),
  cloze: Object.freeze({
    promptLabel: 'GRAMMAR CLOZE',
    contextLabel: 'Câu',
    instruction: 'Gõ dạng đúng để hoàn thành câu.',
    inputLabel: 'Đáp án',
    placeholder: 'Type the correct form...'
  }),
  mixed: Object.freeze({
    promptLabel: 'MIXED VERB FORM',
    contextLabel: 'Câu',
    instruction: 'Gõ hai đáp án theo đúng thứ tự, ngăn cách bằng dấu “/”.',
    inputLabel: 'Hai đáp án',
    placeholder: 'cycles / is walking'
  })
});

function feedback(correctLabel, reason, theory, example = correctLabel) {
  return Object.freeze({ correctLabel, reason, theory, example });
}

function mcq(id, prompt, choices, correctIndex, reason, theory, example) {
  return Object.freeze({
    id,
    type: 'mcq',
    prompt,
    choices: Object.freeze(choices.map((text, index) => Object.freeze({ id: `c${index + 1}`, text }))),
    correctChoiceId: `c${correctIndex + 1}`,
    teachingFeedback: feedback(choices[correctIndex], reason, theory, example)
  });
}

function typing(id, prompt, answer, ui, reason, theory, example = answer, acceptedAnswers = [], extra = {}) {
  return Object.freeze({
    id,
    type: 'typing',
    vi: prompt,
    en: answer,
    ...(acceptedAnswers.length ? { acceptedAnswers: Object.freeze(acceptedAnswers) } : {}),
    typingUi: ui,
    teachingFeedback: feedback(answer, reason, theory, example),
    ...extra
  });
}

function order(id, prompt, tokens, correctOrder, reason, theory, example) {
  return Object.freeze({
    id,
    type: 'sentence_order',
    prompt,
    tokens: Object.freeze(tokens),
    displayOrder: Object.freeze(tokens),
    correctOrder: Object.freeze(correctOrder),
    acceptedOrders: Object.freeze([Object.freeze(correctOrder)]),
    teachingFeedback: feedback(correctOrder.join(' '), reason, theory, example)
  });
}

export const g6ReviewU13PcScaffold32Content = Object.freeze({
  items: Object.freeze([
    mcq('g6-pc-scaffold32-q01','Lý thuyết: Present Continuous (thì hiện tại tiếp diễn) dùng để nói hành động đang xảy ra tại thời điểm nói. Câu nào phù hợp?',['He plays football every Sunday.','He is playing football now.'],1,'“now” cho biết hành động đang xảy ra ở thời điểm nói nên dùng Present Continuous (thì hiện tại tiếp diễn).','Nhìn meaning trước: hành động đang xảy ra ngay lúc nói → S + am/is/are + V-ing.','He is playing football now.'),
    mcq('g6-pc-scaffold32-q02','Lý thuyết: Các dấu hiệu thường gặp gồm now, right now, at the moment, Look!, Listen!. Trong câu “She is taking photos now.”, từ nào là dấu hiệu?',['now','is','taking','photos'],0,'“now” nghĩa là “bây giờ”, báo hiệu hành động đang diễn ra.','Signal như now / right now / at the moment / Look! / Listen! là evidence để nghĩ tới Present Continuous (thì hiện tại tiếp diễn).','She is taking photos now.'),
    mcq('g6-pc-scaffold32-q03','Lý thuyết: Công thức câu khẳng định là S + am/is/are + V-ing. Trong câu “She is reading.”, đâu là chủ ngữ?',['She','is','reading','is reading'],0,'“She” là người thực hiện hành động đọc nên đây là chủ ngữ.','Tách câu thành ba khối: Subject | BE | V-ing.','She | is | reading.'),
    mcq('g6-pc-scaffold32-q04','Vẫn với công thức S + am/is/are + V-ing. Trong “She is reading.”, đâu là động từ be?',['She','is','reading','She is'],1,'Chủ ngữ “She” đi với “is”.','Trong Present Continuous (thì hiện tại tiếp diễn), BE là host đứng giữa Subject và V-ing.','She is reading.'),
    mcq('g6-pc-scaffold32-q05','Trong “She is reading.”, đâu là động từ chính ở dạng V-ing?',['She','is','reading','is reading'],2,'Động từ gốc là “read”, thêm “-ing” thành “reading”.','Present Continuous (thì hiện tại tiếp diễn) cần lexical verb ở dạng V-ing.','read → reading'),
    mcq('g6-pc-scaffold32-q06','Lý thuyết: I → am; He/She/It → is; We/You/They → are. Điền: He ___ playing football.',['am','is','are','be'],1,'Chủ ngữ “He” phải đi với “is”.','Chọn BE theo Subject trước khi xử lý V-ing.','He is playing football.'),
    mcq('g6-pc-scaffold32-q07','Dựa vào bảng trên, điền: They ___ taking photos.',['am','is','are','be'],2,'“They” là chủ ngữ số nhiều nên đi với “are”.','We/You/They → are.','They are taking photos.'),
    mcq('g6-pc-scaffold32-q08','Dựa vào bảng trên, điền: I ___ writing a letter.',['am','is','are','be'],0,'Riêng chủ ngữ “I” đi với “am”.','I → am.','I am writing a letter.'),
    typing('g6-pc-scaffold32-q09','Lý thuyết: Phần lớn động từ chỉ cần thêm -ing. Đổi: play → ?','playing',TYPE_UI.wordForm,'“play” không cần đổi chữ cái nào, chỉ thêm “-ing”.','Quy tắc thường: base verb + ing.','play → playing'),
    typing('g6-pc-scaffold32-q10','Lý thuyết: Động từ tận cùng bằng e thường bỏ e rồi thêm -ing. Đổi: take → ?','taking',TYPE_UI.wordForm,'“take” bỏ “e”, sau đó thêm “-ing”.','Final -e → bỏ e + ing.','take → taking'),
    typing('g6-pc-scaffold32-q11','Áp dụng cùng quy tắc: write → ?','writing',TYPE_UI.wordForm,'“write” tận cùng bằng “e”, bỏ “e” rồi thêm “-ing”.','Final -e → bỏ e + ing.','write → writing'),
    typing('g6-pc-scaffold32-q12','Lý thuyết: Một số động từ ngắn phải gấp đôi phụ âm cuối rồi thêm -ing. Đổi: run → ?','running',TYPE_UI.wordForm,'“run” phải gấp đôi “n” rồi thêm “-ing”.','Với một số động từ ngắn CVC, gấp đôi phụ âm cuối rồi thêm -ing.','run → running'),
    typing('g6-pc-scaffold32-q13','Áp dụng tương tự: swim → ?','swimming',TYPE_UI.wordForm,'“swim” phải gấp đôi “m” rồi thêm “-ing”.','Với một số động từ ngắn CVC, gấp đôi phụ âm cuối rồi thêm -ing.','swim → swimming'),
    mcq('g6-pc-scaffold32-q14','Có cụm “She + take photos”. Trước hết, “She” cần am, is hay are?',['am','is','are','be'],1,'“She” thuộc nhóm He/She/It → is.','Scaffold: xử lý Subject → BE trước, rồi mới đổi lexical verb sang V-ing.','She is taking photos.'),
    typing('g6-pc-scaffold32-q15','Vẫn với “She + take photos”. “take” phải đổi thành dạng nào?','taking',TYPE_UI.wordForm,'“take” tận cùng bằng “e”, nên bỏ “e” rồi thêm “-ing”.','Sau khi chọn BE, xử lý lexical verb sang V-ing.','take → taking'),
    typing('g6-pc-scaffold32-q16','Bây giờ ghép cả cụm “She + take photos” thành câu Present Continuous (thì hiện tại tiếp diễn).','She is taking photos.',TYPE_UI.sentence,'She → is và take → taking, nên cấu trúc là She + is + taking photos.','Ghép đủ ba khối: Subject + BE + V-ing.','She is taking photos.'),
    typing('g6-pc-scaffold32-q17','Tạo câu từ “They + play badminton”.','They are playing badminton.',TYPE_UI.sentence,'They → are và play → playing.','Subject → BE; lexical verb → V-ing; sau đó ghép cả câu.','They are playing badminton.'),
    typing('g6-pc-scaffold32-q18','Tạo câu từ “He + write a letter”.','He is writing a letter.',TYPE_UI.sentence,'He → is và write → writing do bỏ “e” rồi thêm “-ing”.','Vừa kiểm BE agreement vừa kiểm spelling V-ing.','He is writing a letter.'),
    typing('g6-pc-scaffold32-q19','Lý thuyết: Câu phủ định đặt not sau am/is/are. Đổi sang phủ định: He is reading a book.',"He isn't reading a book.",TYPE_UI.negative,'Câu phủ định của Present Continuous đặt “not” sau “is”.','Negative: S + am/is/are + not + V-ing.',"He isn't reading a book.",['He is not reading a book.']),
    typing('g6-pc-scaffold32-q20','Không nhắc lại công thức. Đổi sang phủ định: They are playing football.',"They aren't playing football.",TYPE_UI.negative,'Phải đặt “not” sau “are”.','Khi scaffold giảm, tự nhớ negative architecture: S + BE + not + V-ing.',"They aren't playing football.",['They are not playing football.']),
    typing('g6-pc-scaffold32-q21','Lý thuyết: Muốn tạo câu hỏi Yes/No, đưa am/is/are lên trước chủ ngữ. Đổi: She is making a cake.','Is she making a cake?',TYPE_UI.question,'Câu hỏi Present Continuous đưa “is” lên trước “she”.','Yes/No question: BE + Subject + V-ing?','Is she making a cake?'),
    typing('g6-pc-scaffold32-q22','Trả lời ngắn câu “Is she making a cake?” nếu câu trả lời là “có”.','Yes, she is.',TYPE_UI.shortAnswer,'Câu hỏi dùng “Is she...?”, câu trả lời ngắn phải lặp lại “she is”.','Short answer lặp Subject + BE, không lặp cả lexical verb.','Yes, she is.'),
    typing('g6-pc-scaffold32-q23','Tạo câu hỏi từ “they + listen to music”.','Are they listening to music?',TYPE_UI.question,'They → are; khi hỏi đưa “are” lên trước “they”; listen → listening.','Question architecture: BE + Subject + V-ing?','Are they listening to music?'),
    typing('g6-pc-scaffold32-q24','Tạo câu hoàn chỉnh: “Nam and Phong + draw a picture + now”.','Nam and Phong are drawing a picture now.',TYPE_UI.sentence,'“Nam and Phong = they”, nên dùng “are”; draw → drawing; “now” cho biết hành động đang diễn ra.','Không còn công thức trước mắt: signal → tense → Subject → BE → V-ing → full sentence.','Nam and Phong are drawing a picture now.'),
    mcq('g6-pc-scaffold32-q25','Câu này sai ở đâu? “She are taking photos.” Chọn cách sửa và giải thích đúng.',['are → is, vì She đi với is.','are → am, vì She đi với am.','taking → take, vì sau BE dùng động từ nguyên mẫu.','Câu không sai.'],0,'Sai ở “are”. Phải là “She is taking photos.” vì She đi với is, không đi với are.','Error diagnosis: kiểm Subject–BE agreement trước.','She is taking photos.'),
    mcq('g6-pc-scaffold32-q26','Câu này sai ở đâu? “He is write a letter.” Chọn cách sửa và giải thích đúng.',['write → writing, vì sau is trong Present Continuous phải dùng V-ing.','is → does, vì He đi với does.','write → writes, vì He là ngôi 3 số ít.','Câu không sai.'],0,'Sai ở “write”. Phải là “He is writing a letter.” vì sau “is” trong Present Continuous phải dùng V-ing.','Error diagnosis: đã có BE host của Present Continuous thì lexical verb phải mang -ing.','He is writing a letter.'),
    mcq('g6-pc-scaffold32-q27','Nhìn dấu hiệu rồi chọn: He ___ football every Sunday.',['play','plays','is playing'],1,'“every Sunday” diễn tả thói quen nên dùng Present Simple; chủ ngữ “He” nên động từ thêm “-s”.','Đọc meaning marker trước: habit marker → Present Simple.','He plays football every Sunday.'),
    mcq('g6-pc-scaffold32-q28','Nhìn dấu hiệu rồi chọn: Look! He ___ football now.',['plays','is playing','play'],1,'“Look!” và “now” báo hiệu hành động đang xảy ra; He → is, play → playing.','Meaning marker NOW/LOOK → Present Continuous (thì hiện tại tiếp diễn).','Look! He is playing football now.'),
    mcq('g6-pc-scaffold32-q29','Chọn đáp án đúng: Look! The girls ___ photos.',['take','takes','is taking','are taking'],3,'“Look!” báo hiệu Present Continuous; “the girls = they” → are; take → taking.','Exam chain: signal → tense → Subject → BE → V-ing.','Look! The girls are taking photos.'),
    typing('g6-pc-scaffold32-q30','Chia động từ trong ngoặc: My friend ___ (read) a book at the moment.','is reading',TYPE_UI.cloze,'“at the moment” báo hiệu Present Continuous; “my friend” là số ít nên dùng “is”; read → reading.','Exam chain: marker → Present Continuous → singular Subject → is + V-ing.','My friend is reading a book at the moment.'),
    order('g6-pc-scaffold32-q31','Sắp xếp thành câu đúng.',['are','badminton','They','playing','now','.'],['They','are','playing','badminton','now','.'],'Trật tự đúng là Subject + be + V-ing + object + time expression.','Sentence order của Present Continuous: S | BE | V-ing | object | time.','They are playing badminton now.'),
    typing('g6-pc-scaffold32-q32','Chia đúng hai động từ: Mai usually ___ (cycle) to school, but today she ___ (walk).','cycles / is walking',TYPE_UI.mixed,'“usually” nói về thói quen nên dùng Present Simple: Mai cycles. Phần “today” nói về tình huống đang diễn ra hiện tại nên dùng Present Continuous: she is walking.','Final exam transfer: đọc từng meaning marker riêng rồi chọn architecture cho từng mệnh đề.','Mai usually cycles to school, but today she is walking.',['cycles; is walking','cycles, is walking'],{ typingSeparatorTolerance: true })
  ])
});
