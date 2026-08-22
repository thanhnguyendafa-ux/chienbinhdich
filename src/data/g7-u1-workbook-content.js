const freeze = value => Object.freeze(value);
const theorySupport = freeze({ access: 'after_submit' });
const LETTERS = freeze(['A','B','C','D']);
const ANSWER_POSITIONS = freeze([1,3,0,2,2,0,3,1]);

const typingUi = freeze({
  promptLabel: 'Bài trong SBT',
  contextLabel: 'Đề bài',
  instruction: 'Gõ câu trả lời theo yêu cầu của SBT.',
  inputLabel: 'Câu trả lời của em',
  placeholder: 'Gõ câu trả lời...'
});
const openTypingUi = freeze({
  promptLabel: 'Bài mở trong SBT',
  contextLabel: 'Đề bài',
  instruction: 'Tự viết câu trả lời của em. Bài này có thể có nhiều cách viết đúng.',
  inputLabel: 'Câu trả lời của em',
  placeholder: 'Gõ câu trả lời của em...'
});

const choice = (id, text) => freeze({ id, text, preserveOrder: true });
const teaching = ({ correctLabel, reason, theory, example }) => freeze({ correctLabel, reason, theory, example });
const preTheory = ({ title, intro, sourceSections, sections, summary }) => freeze({
  required: true,
  title,
  intro,
  sourceSections: freeze(sourceSections),
  sections: freeze(sections.map(section => freeze({ heading: section.heading, bullets: freeze(section.bullets) }))),
  summary
});

function mcq({ id, prompt, options, correct, reason, theory, example, stimulus = null, phase = 'source', adaptation = null }) {
  return freeze({
    id, type:'mcq', prompt, learningPhase:phase,
    ...(stimulus ? { stimulus: freeze(stimulus) } : {}),
    choices: freeze(options.map(([choiceId, text]) => choice(choiceId, text))),
    correctChoiceId:correct,
    ...(adaptation ? { digitalAdaptation: freeze(adaptation) } : {}),
    theorySupport,
    teachingFeedback: teaching({ correctLabel: options.find(([choiceId]) => choiceId === correct)?.[1] ?? correct, reason, theory, example })
  });
}

function typing({ id, prompt, answer, acceptedAnswers = [], reason, theory, example, open = false, sourceWordBank = null, phase = 'source' }) {
  return freeze({
    id, type:'typing', vi:prompt, en:answer, learningPhase:phase,
    ...(acceptedAnswers.length ? { acceptedAnswers: freeze(acceptedAnswers) } : {}),
    ...(open ? { responseMode:'open' } : {}),
    ...(sourceWordBank ? { sourceWordBank: freeze(sourceWordBank), sourceWordBankLabel:'Từ / cụm từ cho sẵn' } : {}),
    typingUi: open ? openTypingUi : typingUi,
    theorySupport,
    teachingFeedback: teaching({ correctLabel: open ? 'Bài tham khảo' : answer, reason, theory, example })
  });
}

function classification({ id, prompt, groups, tokens, correctLabel, reason, theory, example, phase = 'source', adaptation = null }) {
  return freeze({
    id, type:'classification', prompt, classificationKind:'generic', learningPhase:phase,
    groups: freeze(groups.map(group => freeze(group))),
    tokens: freeze(tokens.map(token => freeze({ ...token, preserveOrder:true }))),
    ...(adaptation ? { digitalAdaptation: freeze(adaptation) } : {}),
    theorySupport,
    teachingFeedback: teaching({ correctLabel, reason, theory, example })
  });
}

function translationItem(prefix, phase, entry, index) {
  const correctIndex = ANSWER_POSITIONS[index % ANSWER_POSITIONS.length];
  const wrongs = [...entry[2]];
  const texts = [];
  let wrongIndex = 0;
  for (let i = 0; i < 4; i += 1) texts.push(i === correctIndex ? entry[1] : wrongs[wrongIndex++]);
  const options = texts.map((text, i) => [LETTERS[i], text]);
  return mcq({
    id:`${prefix}-${phase}-${String(index + 1).padStart(2,'0')}`,
    prompt:`${phase === 'vocab' ? 'TỪ VỰNG' : 'CỤM TỪ'} · “${entry[0]}” có nghĩa là gì?`,
    options,
    correct:LETTERS[correctIndex],
    reason:entry[3] ?? `“${entry[0]}” = “${entry[1]}”. Con nhớ nghĩa này để đọc bài SBT dễ hơn.`,
    theory:phase === 'vocab' ? 'Nhìn từ tiếng Anh → gọi nghĩa tiếng Việt.' : 'Đọc cả cụm như một khối nghĩa, đừng dịch từng chữ rời.',
    example:entry[4] ?? `${entry[0]} → ${entry[1]}`,
    phase
  });
}

function preload(prefix, vocab, phrases) {
  return freeze([
    ...vocab.map((entry,index) => translationItem(prefix,'vocab',entry,index)),
    ...phrases.map((entry,index) => translationItem(prefix,'phrase',entry,index))
  ]);
}

const THEORIES = freeze({
  a2: preTheory({
    title:'Nhắc nhanh · Tìm phần phát âm khác',
    intro:'Bài này kiểm tra âm của phần được gạch chân. Con không cần dịch cả từ để làm phần phát âm.',
    sourceSections:['SBT trang 3 · A. Pronunciation · Bài 2'],
    sections:[
      { heading:'Cách làm 4 bước', bullets:['Nhìn đúng phần được gạch chân.','Đọc ba từ.','Tìm hai từ có âm giống nhau.','Từ còn lại là đáp án.'] },
      { heading:'Ví dụ khác bài', bullets:['bird – girl – teacher: bird/girl có phần âm gần nhau, teacher khác.'] },
      { heading:'Bẫy', bullets:['Đừng chọn vì nghĩa của từ khác. Bài hỏi ÂM, không hỏi nghĩa.'] }
    ],
    summary:'Hai âm giống nhau + một âm khác → chọn từ có âm khác.'
  }),
  b4: preTheory({
    title:'Nhắc nhanh · Present Simple và Do / Does',
    intro:'Con nhìn chủ ngữ trước rồi mới chọn dạng động từ.',
    sourceSections:['SBT trang 5 · B. Vocabulary & Grammar · Bài 4'],
    sections:[
      { heading:'Chuyện thường xuyên / sự thật', bullets:['I / you / we / they → V','he / she / it → V-s/es'] },
      { heading:'Câu hỏi', bullets:['Does + he/she/it + V nguyên mẫu.','Does she like...? ✓ · Does she likes...? ✗'] },
      { heading:'Ví dụ khác bài', bullets:['Ben plays football every Sunday.','Does Ben play football?'] }
    ],
    summary:'He/she/it thường thêm -s; nhưng sau DOES, động từ trở về nguyên mẫu.'
  }),
  b5: preTheory({
    title:'Nhắc nhanh · Chuyện thường xuyên hay đang xảy ra?',
    intro:'Đừng hỏi “thì gì?” trước. Hãy hiểu câu đang nói chuyện bình thường hay việc đang xảy ra ngay bây giờ.',
    sourceSections:['SBT trang 5 · B. Vocabulary & Grammar · Bài 5'],
    sections:[
      { heading:'Present Simple', bullets:['sở thích','thói quen','chuyện thường xuyên'] },
      { heading:'Present Continuous', bullets:['việc đang xảy ra ngay lúc nói','am / is / are + V-ing'] },
      { heading:'Dấu hiệu trong bài', bullets:['usually, sometimes, at the weekend → thường là chuyện lặp lại.','love/enjoy cooking → sở thích.'] }
    ],
    summary:'Hiểu ý trước → nhìn chủ ngữ → chia động từ.'
  }),
  c1: preTheory({
    title:'Nhắc nhanh · Câu trả lời phải trả đúng câu hỏi',
    intro:'Một câu có thể đúng grammar nhưng vẫn sai vì trả lời không đúng điều người kia hỏi.',
    sourceSections:['SBT trang 5 · C. Speaking · Bài 1'],
    sections:[
      { heading:'Nhìn từ hỏi', bullets:['Do you enjoy...? → hỏi có thích không.','What do you like doing...? → hỏi hoạt động.','What does your brother like doing? → phải trả lời hobby của brother.'] },
      { heading:'Ví dụ khác bài', bullets:['What do you like doing? → I like reading.','Không trả lời: I have lunch at twelve.'] }
    ],
    summary:'Hỏi gì → trả đúng loại thông tin đó.'
  }),
  c2: preTheory({
    title:'Nhắc nhanh · Matching Question → Answer',
    intro:'Đọc câu trước mỗi blank và xác định nó đang hỏi hobby, tần suất, lớp học, độ khó hay người làm cùng.',
    sourceSections:['SBT trang 6 · C. Speaking · Bài 2'],
    sections:[
      { heading:'5 loại thông tin', bullets:['What’s your hobby? → hobby','How often...? → frequency','Do you go to classes? → class','Is it difficult? → easy/difficult','with anyone? → person'] },
      { heading:'Bẫy', bullets:['Đừng ghép chỉ vì có từ giống nhau. Câu trả lời phải đúng Ý của câu hỏi.'] }
    ],
    summary:'Xác định loại câu hỏi rồi mới nối đáp án.'
  }),
  c3: preTheory({
    title:'Nhắc nhanh · Tạo hội thoại từng bước',
    intro:'Không cần viết cả hội thoại một lần. Con dùng năm dữ kiện của sách và trả lời năm câu nhỏ.',
    sourceSections:['SBT trang 6 · C. Speaking · Bài 3'],
    sections:[
      { heading:'Thứ tự', bullets:['hobby','frequency','drawing class','easy/difficult','person you do it with'] },
      { heading:'Khung câu', bullets:['I love + V-ing.','I ... every day.','I have ... once a week.','I think it is easy.','I ... with my ...'] }
    ],
    summary:'Một dữ kiện → một câu. Ghép năm câu nhỏ thành hội thoại.'
  }),
  d1: preTheory({
    title:'Nhắc nhanh · Điền word box bằng cụm quanh blank',
    intro:'Mỗi từ phải đúng cả nghĩa, vị trí và cụm từ trong email.',
    sourceSections:['SBT trang 6 · D. Reading · Bài 1'],
    sections:[
      { heading:'Ba câu hỏi', bullets:['Blank cần danh từ, động từ hay từ chỉ sở hữu?','Từ ngay trước/sau blank gợi ý cụm gì?','Cả câu có hợp nghĩa không?'] },
      { heading:'Ví dụ khác bài', bullets:['a ___ of my family → sau “a” cần danh từ số ít.','I am ___ you... → am + V-ing.'] }
    ],
    summary:'Nhìn cụm quanh blank trước, đừng thử ngẫu nhiên cả word box.'
  }),
  d2: preTheory({
    title:'Nhắc nhanh · Cloze = nghĩa + cụm từ + grammar',
    intro:'Bài Mark không chỉ kiểm chia động từ. Con còn phải biết những cụm như get up, ride a horse và on Saturday mornings.',
    sourceSections:['SBT trang 7 · D. Reading · Bài 2'],
    sections:[
      { heading:'Cách làm', bullets:['Đọc cả câu.','Tìm cụm từ quen thuộc.','Sau đó kiểm tra grammar.'] },
      { heading:'Ví dụ khác bài', bullets:['get up = thức dậy; stay up = thức khuya.','twice a week → thói quen → Present Simple.'] }
    ],
    summary:'Đúng nghĩa trước, đúng cụm từ, rồi đúng grammar.'
  }),
  d3a: preTheory({
    title:'Nhắc nhanh · Ghép từ với nghĩa',
    intro:'Định nghĩa dài thì con chỉ cần tìm vài từ khóa quan trọng.',
    sourceSections:['SBT trang 8 · D. Reading · Bài 3a'],
    sections:[
      { heading:'Cách làm', bullets:['Đọc từ cần ghép.','Đọc định nghĩa và tìm ý chính.','Loại những nghĩa không cùng chủ đề.'] },
      { heading:'Ví dụ khác bài', bullets:['become better → trở nên tốt hơn → improve.'] }
    ],
    summary:'Từ khóa trong định nghĩa → nghĩa ngắn → ghép từ.'
  }),
  d3b: preTheory({
    title:'Nhắc nhanh · TRUE / FALSE / NO INFORMATION',
    intro:'NI không giống False. Con phải dựa vào bằng chứng trong passage.',
    sourceSections:['SBT trang 7–8 · D. Reading · Bài 3b'],
    sections:[
      { heading:'TRUE', bullets:['Passage nói cùng ý.'] },
      { heading:'FALSE', bullets:['Passage nói điều ngược lại hoặc chi tiết bị đổi.'] },
      { heading:'NO INFORMATION', bullets:['Passage không nói. Không được tự đoán.'] }
    ],
    summary:'Cùng ý → T · trái ý → F · không có thông tin → NI.'
  }),
  e1: preTheory({
    title:'Nhắc nhanh · Hoạt động làm chủ ngữ → V-ing',
    intro:'Bài cho các mảnh từ và cho phép đổi/thêm từ cần thiết. Con cần tạo câu tự nhiên, không chỉ nối các mảnh lại.',
    sourceSections:['SBT trang 8 · E. Writing · Bài 1'],
    sections:[
      { heading:'Hoạt động đứng đầu câu', bullets:['make models → Making models...','collect stamps → Collecting stamps...','jog → Jogging...'] },
      { heading:'Cả hoạt động là một ý', bullets:['Making models develops...','Collecting stamps helps...','Jogging makes... and reduces...'] },
      { heading:'Ví dụ khác bài', bullets:['Reading books helps me relax.'] }
    ],
    summary:'V-ing làm chủ ngữ; cả hoạt động thường đi với động từ số ít.'
  }),
  e3: preTheory({
    title:'Nhắc nhanh · Viết 70 từ bằng 5 ý nhỏ',
    intro:'Con chưa cần nghĩ cả đoạn văn. Điền word web trước rồi mới nối ý.',
    sourceSections:['SBT trang 9 · E. Writing · Bài 3'],
    sections:[
      { heading:'5 ý của word web', bullets:['Hobby là gì?','Bắt đầu cách đây bao lâu?','Làm cùng ai?','Cần gì?','Có lợi gì?'] },
      { heading:'Sau đó mới viết', bullets:['Mỗi ô → một câu.','Nối các câu bằng and, because, also... nếu cần.','Cuối cùng kiểm tra khoảng 70 từ.'] }
    ],
    summary:'5 ô nhỏ → 5–7 câu → một paragraph.'
  })
});

const PRELOAD = freeze({
  a2: freeze({
    vocab: freeze([
      ['away','xa / rời đi',['xung quanh','bạn cùng lớp','sự ngạc nhiên']],
      ['around','xung quanh',['xa / rời đi','bên dưới','bị đau']],
      ['classmate','bạn cùng lớp',['bác sĩ','giáo viên','người thân']],
      ['surprise','sự ngạc nhiên',['sự tập trung','sự tổn thương','bộ sưu tập']]
    ]),
    phrases: freeze([
      ['underlined part','phần được gạch chân',['phần được khoanh tròn','câu trả lời đúng','từ ở cuối câu']],
      ['pronounced differently','được phát âm khác',['được viết giống nhau','có cùng nghĩa','được đọc thật nhanh']]
    ])
  }),
  b4: freeze({
    vocab: freeze([
      ['boil','sôi',['đông lại','chia sẻ','bắt đầu']],
      ['liquid','chất lỏng',['chất khí','bông hoa','sở thích']],
      ['gas','chất khí',['chất lỏng','khu vườn','bài học']],
      ['jogging','chạy bộ',['nấu ăn','làm vườn','sưu tầm']]
    ]),
    phrases: freeze([
      ['take care of','chăm sóc',['tìm kiếm','nghĩ về','tránh xa']],
      ['cooking lesson','buổi học nấu ăn',['bữa ăn tối','cuộc thi nấu ăn','sách nấu ăn']],
      ['every Saturday','mỗi thứ Bảy',['thứ Bảy tới','hai thứ Bảy','vào cuối tháng']],
      ['three times a week','ba lần một tuần',['ba tuần một lần','mỗi ngày ba lần','một lần trong ba tuần']]
    ])
  }),
  b5: freeze({
    vocab: freeze([
      ['cooking','việc nấu ăn',['việc chạy bộ','việc vẽ tranh','việc cưỡi ngựa']],
      ['recipe','công thức nấu ăn',['bức ảnh','mô hình','lớp học']],
      ['Internet','Internet / mạng Internet',['khu vườn','cuối tuần','gia đình']],
      ['weekend','cuối tuần',['đầu tuần','mỗi ngày','buổi sáng']]
    ]),
    phrases: freeze([
      ['love cooking','thích nấu ăn',['ghét nấu ăn','học nấu ăn','dạy nấu ăn']],
      ['cooking class','lớp học nấu ăn',['câu lạc bộ chạy bộ','bữa ăn gia đình','công thức nấu ăn']],
      ['learn to cook','học nấu ăn',['học bơi','dạy nấu ăn','mua đồ ăn']],
      ['share this hobby with','cùng chia sẻ sở thích này với',['bắt đầu sở thích này với','dừng sở thích này cùng','học sở thích này từ']],
      ['at the weekend','vào cuối tuần',['vào mỗi buổi sáng','trong giờ học','ba lần một ngày']]
    ])
  }),
  c1: freeze({
    vocab: freeze([
      ['collect','sưu tầm',['nấu ăn','chia sẻ','chạy bộ']],
      ['teddy bear','gấu bông',['nhà búp bê','con ngựa','mô hình']],
      ['model','mô hình',['bữa trưa','bài hát','lớp học']],
      ['yoga','yoga',['khiêu vũ','nấu ăn','cưỡi ngựa']]
    ]),
    phrases: freeze([
      ['collecting teddy bears','sưu tầm gấu bông',['làm nhà búp bê','làm mô hình','nuôi gấu']],
      ['in your free time','trong thời gian rảnh',['trong giờ ăn trưa','trước giờ học','vào mỗi thứ Hai']],
      ['building dollhouses','làm nhà búp bê',['sưu tầm búp bê','vẽ ngôi nhà','xây nhà thật']],
      ['making models','làm mô hình',['sưu tầm mô hình','mua đồ chơi','làm bài tập']],
      ['cook together','nấu ăn cùng nhau',['học cùng nhau','hát cùng nhau','ăn trưa một mình']]
    ])
  }),
  c2: freeze({
    vocab: freeze([
      ['dancing','nhảy / khiêu vũ',['vẽ tranh','bơi lội','nấu ăn']],
      ['difficult','khó',['dễ','thường xuyên','thú vị']],
      ['sister','chị / em gái',['bố','anh / em trai','bạn cùng lớp']],
      ['music','âm nhạc',['mô hình','cơ thể','bức ảnh']]
    ]),
    phrases: freeze([
      ['dancing classes','các lớp học nhảy',['các cuộc thi nhảy','câu lạc bộ âm nhạc','giờ học thể dục']],
      ['every day','mỗi ngày',['mỗi tuần','hai lần một ngày','vào Chủ nhật']],
      ['twice a week','hai lần một tuần',['hai tuần một lần','mỗi ngày hai lần','mỗi tuần một lần']],
      ['listen to music','nghe nhạc',['chơi nhạc cụ','học hát','xem phim']],
      ['with my sister','cùng chị / em gái tôi',['cho chị / em gái tôi','về chị / em gái tôi','không có chị / em gái tôi']]
    ])
  }),
  c3: freeze({
    vocab: freeze([
      ['drawing','việc vẽ / vẽ tranh',['khiêu vũ','nấu ăn','chạy bộ']],
      ['frequency','tần suất',['độ khó','lợi ích','bộ sưu tập']],
      ['easy','dễ',['khó','hiếm khi','mạnh']],
      ['father','bố',['mẹ','chị gái','bạn cùng lớp']]
    ]),
    phrases: freeze([
      ['drawing class','lớp học vẽ',['câu lạc bộ nhảy','bài kiểm tra vẽ','tranh trong lớp']],
      ['once a week','một lần một tuần',['một tuần một lần nữa','mỗi ngày một lần','hai lần một tuần']],
      ['on Sunday mornings','vào các sáng Chủ nhật',['vào tối thứ Bảy','mỗi sáng trong tuần','vào chiều Chủ nhật']],
      ['draw every day','vẽ mỗi ngày',['vẽ hai lần một tuần','học vẽ vào tối nay','không thích vẽ']],
      ['draw with my father','vẽ cùng bố tôi',['vẽ bố tôi','đưa tranh cho bố','học từ anh trai']]
    ])
  }),
  d1: freeze({
    vocab: freeze([
      ['photo','bức ảnh',['bức thư','công thức','mô hình']],
      ['usually','thường',['không bao giờ','ngay bây giờ','một lần']],
      ['your','của bạn',['của tôi','của cô ấy','của chúng tôi']]
    ]),
    phrases: freeze([
      ['have a pen pal','có một người bạn qua thư',['có một người bạn cùng lớp','gửi một lá thư','đọc một email']],
      ['send someone a photo','gửi cho ai một bức ảnh',['xin ai một bức ảnh','vẽ ảnh cho ai','giữ ảnh của ai']],
      ['like doing something','thích làm việc gì',['bắt buộc làm việc gì','dừng làm việc gì','quên làm việc gì']],
      ["can't wait to",'rất mong / nóng lòng muốn',['không cần phải','không được phép','thường xuyên quên']]
    ])
  }),
  d2: freeze({
    vocab: freeze([
      ['horse','con ngựa',['con gấu','con chó','con bò']],
      ['outside','bên ngoài',['bên trong','phía sau','ở giữa']],
      ['choir','đội hợp xướng',['đội bóng','lớp nấu ăn','nhóm du lịch']],
      ['garden','khu vườn',['phòng khách','trường học','câu lạc bộ']]
    ]),
    phrases: freeze([
      ['get up','thức dậy',['đi ngủ','ngồi xuống','thức khuya']],
      ['ride a horse','cưỡi ngựa',['cho ngựa ăn','vẽ con ngựa','lái xe']],
      ['choir practice','buổi luyện hợp xướng',['buổi học cưỡi ngựa','buổi tập bóng đá','buổi học nấu ăn']],
      ['on Saturday mornings','vào các sáng thứ Bảy',['vào tối thứ Bảy','mỗi sáng Chủ nhật','trong tuần']],
      ['twice a week','hai lần một tuần',['hai tuần một lần','mỗi tuần một lần','hai lần một ngày']]
    ])
  }),
  d3a: freeze({
    vocab: freeze([
      ['beneficial','có lợi / hữu ích',['nguy hiểm','khó khăn','thường xuyên']],
      ['pandemics','các đại dịch',['các sở thích','các trải nghiệm','các kỹ năng']],
      ['lockdown','sự phong tỏa',['sự cải thiện','thời gian rảnh','chuyến du lịch']],
      ['experiences','những trải nghiệm',['những bệnh dịch','những đồ chơi','những bài học']],
      ['improve','cải thiện / trở nên tốt hơn',['giữ nguyên','trở nên tệ hơn','chia sẻ']]
    ]),
    phrases: freeze([
      ['helpful or useful','có ích hoặc hữu ích',['khẩn cấp và nguy hiểm','mới và thú vị','khác nhau và khó']],
      ['become better','trở nên tốt hơn',['ở nhà','xảy ra với bạn','đi khắp thế giới']]
    ])
  }),
  d3b: freeze({
    vocab: freeze([
      ['beneficial','có lợi',['có hại','buồn chán','đắt tiền']],
      ['pandemic','đại dịch',['sở thích','trải nghiệm','kỹ năng']],
      ['lockdown','phong tỏa',['du lịch','luyện tập','kết bạn']],
      ['experience','trải nghiệm',['bài kiểm tra','mô hình','bữa ăn']],
      ['improve','cải thiện',['giảm xuống','quên đi','bắt đầu']]
    ]),
    phrases: freeze([
      ['leisure time','thời gian rảnh',['giờ học','giờ ngủ','thời gian khẩn cấp']],
      ['stay at home','ở nhà',['đi du lịch','ở trường','ra ngoài chơi']],
      ['share experiences with','chia sẻ trải nghiệm với',['giữ bí mật với','học kỹ năng từ','xem phim cùng']],
      ['develop new skills','phát triển kỹ năng mới',['mất kỹ năng cũ','mua dụng cụ mới','tham gia câu lạc bộ']]
    ])
  }),
  e1: freeze({
    vocab: freeze([
      ['creativity','sự sáng tạo',['sự kiên nhẫn','sự căng thẳng','sức mạnh']],
      ['patient','kiên nhẫn',['sáng tạo','lo lắng','mệt mỏi']],
      ['stress','căng thẳng',['sở thích','lợi ích','sức khỏe']],
      ['plant','cây',['con ngựa','con tem','mô hình']],
      ['flower','hoa',['cỏ','bức ảnh','câu lạc bộ']]
    ]),
    phrases: freeze([
      ['be afraid of','sợ',['thích','chăm sóc','tự hào về']],
      ['make models','làm mô hình',['sưu tầm mô hình','vẽ mô hình','mua mô hình']],
      ['collect stamps','sưu tầm tem',['gửi tem','vẽ tem','bán hoa']],
      ['reduce stress','giảm căng thẳng',['tăng căng thẳng','tạo mô hình','phát triển cây']],
      ['be more patient','kiên nhẫn hơn',['sáng tạo hơn','mạnh hơn','lo lắng hơn']]
    ])
  }),
  e3: freeze({
    vocab: freeze([
      ['hobby','sở thích',['bài học','lợi ích','dụng cụ']],
      ['benefit','lợi ích',['khó khăn','tần suất','đại dịch']],
      ['need','cần',['ghét','bắt đầu','chia sẻ']],
      ['share','chia sẻ / cùng làm',['giảm','cải thiện','sợ']]
    ]),
    phrases: freeze([
      ['started the hobby ... ago','bắt đầu sở thích ... cách đây',['sẽ bắt đầu sở thích sau ...','dừng sở thích trong ...','làm sở thích mỗi ngày']],
      ['share the hobby with','cùng làm / chia sẻ sở thích với',['học sở thích từ','mua dụng cụ cho','không thích cùng']],
      ['to do this hobby','để làm sở thích này',['để dừng sở thích','sau khi học xong','trước giờ đi học']],
      ['helps him / her relax','giúp bố / mẹ thư giãn',['làm bố / mẹ căng thẳng','giúp bố / mẹ thức dậy','bắt bố / mẹ đi học']],
      ['stay active','duy trì năng động',['ở trong nhà','ngủ nhiều hơn','ngừng vận động']],
      ['about 70 words','khoảng 70 từ',['đúng 7 câu','ít hơn 10 từ','70 câu hỏi']]
    ])
  })
});

const D1_EMAIL = `Dear Jane,\nI’m so happy to read your email. I like (1) ______ a pen pal in Australia because I love your country!\nThank you for sending me a (2) ______ of your family. Can you tell me more about your family members? What do you (3) ______ doing together? I like watching films with my family. We (4) ______ watch many different kinds of films. Once, we watched a film about Australia, and I found it very interesting.\nI’m (5) ______ you a photo of my family.\nI can’t wait to read (6) ______ next email!\nBest wishes,\nMi`;
const D1_BANK = freeze(['like','having','your','sending','usually','photo']);

const D2_PASSAGE = `Mark has a lot of hobbies and interests. He usually (1) ______ up early, so he can jog before school. After school, Mark often (2) ______ a horse at the riding club near his home. Sometimes he goes riding on Sunday afternoons. He also (3) ______ music. He goes to choir practice on Wednesday and Saturday evenings. (4) ______ Saturday mornings, he usually waters the plants and trees in the garden with his mum. He seldom watches TV because he likes doing things (5) ______. He has a lot of friends and he (6) ______ football with them twice a week. He’s a happy boy!`;

const D3_PASSAGE = `Do you have any hobbies? If you don’t, please start one because having a hobby is very beneficial. Firstly, a hobby gives you something fun to do during your leisure time, especially during pandemics. During the Covid-19 lockdown, my family reads books and watches films together. This makes us feel better when we have to stay at home. Secondly, a hobby makes you a more interesting person. If you have a lot of experience and skills, you can share them with others. I love travelling, and I usually share my experiences with my classmates. This way, I have more friends. Now we have a travel group in our class. Last but not least, a hobby can help you develop new skills. If you spend a lot of time on your hobby, your skills will improve. My sister loves sewing. After sewing for two years, she can now sew beautiful doll clothes. Those are the reasons why you should have hobbies.`;

function sourceA2() {
  const rows = [
    ['1. Choose the word in which the underlined part is pronounced differently.','away','around','classmate','C','classmate có phần gạch chân phát âm khác; away và around có âm đầu /ə/ giống nhau.'],
    ['2. Choose the word in which the underlined part is pronounced differently.','umbrella','focus','under','B','umbrella và under có âm /ʌ/ ở phần gạch chân; focus có âm khác.'],
    ['3. Choose the word in which the underlined part is pronounced differently.','clever','term','germ','A','term và germ có /ɜː/; clever có âm /ə/ ở phần cuối.'],
    ['4. Choose the word in which the underlined part is pronounced differently.','pronounce','doctor','collection','B','pronounce và collection có âm nhẹ /ə/ ở phần gạch chân; doctor có âm /ɒ/.'],
    ['5. Choose the word in which the underlined part is pronounced differently.','surprise','Thursday','hurt','A','Thursday và hurt có /ɜː/; surprise có âm khác ở phần gạch chân.']
  ];
  return freeze(rows.map((row,index) => mcq({
    id:`g7-u1-wb-a2-src-${index + 1}`, prompt:row[0], options:[['A',row[1]],['B',row[2]],['C',row[3]]], correct:row[4],
    reason:row[5], theory:'So sánh âm của phần được gạch chân, không so sánh nghĩa.', example:'Tìm hai từ cùng âm trước.', phase:'source'
  })));
}

function sourceB4() {
  return freeze([
    mcq({ id:'g7-u1-wb-b4-src-1', prompt:'1. When water ______, it ______ from a liquid to a gas.', options:[['A','boil; changes'],['B','boils; change'],['C','boils; changes']], correct:'C', reason:'water = it nên “boils”; chủ ngữ “it” ở vế sau nên “changes”. Cả hai nói một sự thật chung.', theory:'he/she/it → V-s/es trong Present Simple.', example:'Water boils. It changes.', phase:'source' }),
    mcq({ id:'g7-u1-wb-b4-src-2', prompt:'2. My father ______ his hobby with me. He teaches me how to grow and take care of the flowers in our garden on Sundays.', options:[['A','share'],['B','shares'],['C','sharing']], correct:'B', reason:'My father = he. Đây là việc thường làm → he shares.', theory:'he/she/it + V-s/es.', example:'He shares his books.', phase:'source' }),
    mcq({ id:'g7-u1-wb-b4-src-3', prompt:'3. ______ your mother ______ doing yoga?', options:[['A','Do; enjoy'],['B','Does; enjoys'],['C','Does; enjoy']], correct:'C', reason:'your mother = she → dùng Does. Sau Does, động từ trở về nguyên mẫu → enjoy, không phải enjoys.', theory:'Does + he/she/it + V nguyên mẫu.', example:'Does she like reading?', phase:'source' }),
    mcq({ id:'g7-u1-wb-b4-src-4', prompt:'4. My cooking lesson ______ at 9 a.m. every Saturday.', options:[['A','starts'],['B','start'],['C','is starting']], correct:'A', reason:'every Saturday = lặp lại. My cooking lesson = it → starts.', theory:'Thói quen/lịch lặp lại → Present Simple.', example:'The class starts at eight every Monday.', phase:'source' }),
    mcq({ id:'g7-u1-wb-b4-src-5', prompt:'5. My parents ______ jogging every day. They only do it three times a week.', options:[['A','go'],['B',"don’t go"],['C',"doesn’t go"]], correct:'B', reason:'Câu sau nói chỉ ba lần một tuần, nên “every day” là không đúng → cần phủ định. My parents = they → don’t go.', theory:'they → do/don’t, không dùng does/doesn’t.', example:'They don’t go every day.', phase:'source' })
  ]);
}

function sourceB5() {
  const rows = [
    ['1','My cousin, Mi, (love) ______ cooking.','loves','Mi = she; love cooking là sở thích → Present Simple: loves.','she + V-s/es'],
    ['2','She (not go) ______ to any cooking class.',"doesn’t go",'Đây là chuyện bình thường. She → doesn’t; sau doesn’t dùng go nguyên mẫu.','doesn’t + V'],
    ['3','She (learn) ______ to cook from her mum.','learns','She = ngôi thứ ba số ít → learns.','she + V-s/es'],
    ['4','Sometimes she (get) ______ recipes from the Internet.','gets','Sometimes = đôi khi, một thói quen → she gets.','sometimes → Present Simple'],
    ['5','She (share) ______ this hobby with her sister.','shares','She → shares.','she + V-s/es'],
    ['6','I (enjoy) ______ cooking too.','enjoy','I không thêm -s → I enjoy.','I + V'],
    ['7','Mi and I usually (make) ______ pizza together...','make','Mi and I = we; usually = thường xuyên → we make.','we + V'],
    ['8','... when we (meet) ______ at the weekend.','meet','Chủ ngữ we → meet.','we + V']
  ];
  return freeze(rows.map(row => typing({ id:`g7-u1-wb-b5-src-${row[0]}`, prompt:row[1], answer:row[2], acceptedAnswers:row[2].includes('’') ? [row[2].replace('’',"'")] : [], reason:row[3], theory:row[4], example:`Đáp án: ${row[2]}`, phase:'source' })));
}

function sourceC1() {
  return freeze([
    mcq({ id:'g7-u1-wb-c1-src-1', prompt:'1. Do you enjoy collecting teddy bears?', options:[['A','Yes, I do it every day.'],['B','Yes, very much.']], correct:'B', reason:'Câu hỏi hỏi có thích hay không. “Yes, very much.” trả lời trực tiếp mức độ thích.', theory:'Trả lời đúng ý câu hỏi.', example:'Do you enjoy it? → Yes, very much.', phase:'source' }),
    mcq({ id:'g7-u1-wb-c1-src-2', prompt:'2. What do you like doing in your free time?', options:[['A','I usually have lunch at 12.'],['B','I like building dollhouses.']], correct:'B', reason:'Hỏi hoạt động lúc rảnh → building dollhouses là hobby; ăn trưa lúc 12 là lịch sinh hoạt.', theory:'What do you like doing? → trả lời một activity.', example:'I like reading.', phase:'source' }),
    mcq({ id:'g7-u1-wb-c1-src-3', prompt:'3. Do you like making models?', options:[['A',"No, I don’t. But my brother loves it."],['B','No, I make paper flowers every day.']], correct:'A', reason:'Do you like...? cần câu trả lời Yes/No phù hợp. “No, I don’t.” trả lời trực tiếp.', theory:'Yes/No question → trả lời Yes/No đúng đối tượng.', example:'Do you like it? → No, I don’t.', phase:'source' }),
    mcq({ id:'g7-u1-wb-c1-src-4', prompt:'4. What does your brother like doing?', options:[['A','He enjoys doing yoga a lot.'],['B','He goes to school at 7 a.m.']], correct:'A', reason:'Hỏi hobby của brother → doing yoga là hoạt động thích làm; giờ đi học không phải hobby.', theory:'like doing → hobby/activity.', example:'He enjoys swimming.', phase:'source' }),
    mcq({ id:'g7-u1-wb-c1-src-5', prompt:'5. Does your sister cook with you?', options:[['A','Yes, she loves singing.'],['B','Yes, she and I cook together in the evening.']], correct:'B', reason:'Hỏi cook with you → đáp án phải nói việc hai người cook together.', theory:'Từ khóa của câu hỏi phải được trả đúng ý.', example:'Does she study with you? → Yes, we study together.', phase:'source' })
  ]);
}

function sourceC2() {
  const dialogue = `Mi: Elena, what’s your hobby?\nElena: (1) ______\nMi: How often do you dance?\nElena: (2) ______\nMi: Do you go to dancing classes?\nElena: (3) ______\nMi: Is it difficult to dance?\nElena: (4) ______\nMi: Do you do this hobby with anyone?\nElena: (5) ______\nMi: No, I don’t, but I love singing.`;
  return freeze([classification({
    id:'g7-u1-wb-c2-src-1',
    prompt:`Match a–e with blanks (1)–(5).\n\n${dialogue}`,
    groups:[{id:'1',label:'Blank (1)'},{id:'2',label:'Blank (2)'},{id:'3',label:'Blank (3)'},{id:'4',label:'Blank (4)'},{id:'5',label:'Blank (5)'}],
    tokens:[
      {id:'a',text:"a. I don’t think it’s difficult. Just listen to music and move your body.",correctGroupId:'4'},
      {id:'b',text:'b. I love dancing.',correctGroupId:'1'},
      {id:'c',text:'c. Yes, my sister loves it, too. Do you like dancing, Mi?',correctGroupId:'5'},
      {id:'d',text:'d. Yes, I have dancing lessons twice a week.',correctGroupId:'3'},
      {id:'e',text:'e. I dance every day.',correctGroupId:'2'}
    ],
    correctLabel:'1 → b · 2 → e · 3 → d · 4 → a · 5 → c',
    reason:'Hobby → b; How often → e; dancing classes → d; difficult → a; with anyone → c. Mỗi câu trả lời đúng loại thông tin được hỏi.',
    theory:'Xác định câu hỏi đang hỏi gì rồi mới nối.',
    example:'How often...? → câu có every day / twice a week.',
    adaptation:{ sourceResponseType:'match_a_to_e', adaptedResponseType:'classification_matching' }
  })]);
}

function sourceC3() {
  const rows = [
    ['1','Hobby: drawing. Trả lời câu “What’s your hobby?”','I love drawing.','Hobby được cho là drawing. Dùng love + V-ing.'],
    ['2','Frequency: every day. Trả lời “How often do you draw?”','I draw every day.','Frequency được cho là every day.'],
    ['3','Drawing class: once a week, on Sunday mornings. Trả lời “Do you go to drawing classes?”','Yes, I do. I have drawing classes once a week, on Sunday mornings.','Dùng đủ hai dữ kiện: once a week + Sunday mornings.'],
    ['4','Easy or difficult: easy. Trả lời “Is drawing difficult?”',"No, it isn’t. I think it’s easy.",'Dữ kiện nói easy nên không thể trả lời “Yes, it is difficult.”'],
    ['5','Person you do the hobby with: father. Trả lời “Do you do this hobby with anyone?”','Yes. I draw with my father.','Người làm cùng được cho là father.']
  ];
  return freeze(rows.map(row => typing({ id:`g7-u1-wb-c3-src-${row[0]}`, prompt:row[1], answer:row[2], open:true, reason:row[3] + ' Đây là bài nói mở nên cách viết tương đương vẫn được chấp nhận.', theory:'Dùng đúng dữ kiện của sách để tạo câu.', example:row[2], phase:'source' })));
}

function sourceD1() {
  const answers = [
    ['1','having','like + V-ing → like having a pen pal.'],
    ['2','photo','Sau “a” cần danh từ số ít: a photo of your family.'],
    ['3','like','Cấu trúc: What do you like doing together?'],
    ['4','usually','Usually đứng trước động từ thường: usually watch.'],
    ['5','sending',"I’m + V-ing → I’m sending you a photo."],
    ['6','your','Email của bạn → your next email.']
  ];
  return freeze(answers.map(row => typing({
    id:`g7-u1-wb-d1-src-${row[0]}`,
    prompt:`${D1_EMAIL}\n\nĐiền blank (${row[0]}).`, answer:row[1], reason:row[2], theory:'Chọn từ vừa đúng nghĩa vừa đúng cụm quanh blank.', example:`Blank (${row[0]}) → ${row[1]}`, sourceWordBank:D1_BANK, phase:'source'
  })));
}

function sourceD2() {
  const rows = [
    ['1',[['A','gets'],['B','stays'],['C','does']],'A','get up = thức dậy; câu nói Mark thức dậy sớm để chạy bộ.'],
    ['2',[['A','cycles'],['B','drives'],['C','rides']],'C','Cụm đúng là ride a horse = cưỡi ngựa.'],
    ['3',[['A','makes'],['B','loves'],['C','does']],'B','Câu sau nói Mark đi choir practice, nên “loves music” hợp nghĩa.'],
    ['4',[['A','On'],['B','In'],['C','At']],'A','Dùng on với ngày/buổi gắn với ngày: on Saturday mornings.'],
    ['5',[['A','inside'],['B','behind'],['C','outside']],'C','Mark tưới cây trong garden và thích doing things outside = làm việc ngoài trời.'],
    ['6',[['A','is playing'],['B','plays'],['C','play']],'B','twice a week = thói quen; he → plays.']
  ];
  return freeze(rows.map(row => mcq({ id:`g7-u1-wb-d2-src-${row[0]}`, prompt:`Blank (${row[0]})`, stimulus:{title:'Mark’s hobbies',text:D2_PASSAGE}, options:row[1], correct:row[2], reason:row[3], theory:'Đọc cả nghĩa + cụm từ + grammar.', example:`Đáp án (${row[0]}): ${row[1].find(x=>x[0]===row[2])[1]}`, phase:'source' })));
}

function sourceD3A() {
  return freeze([classification({
    id:'g7-u1-wb-d3a-src-1',
    prompt:`Match each word in A with its meaning in B.\n\nPassage context:\n${D3_PASSAGE}`,
    groups:[
      {id:'beneficial',label:'1. beneficial'},
      {id:'pandemics',label:'2. pandemics'},
      {id:'lockdown',label:'3. lockdown'},
      {id:'experiences',label:'4. experiences'},
      {id:'improve',label:'5. improve'}
    ],
    tokens:[
      {id:'a',text:'a. an emergency situation when people have to stay at home',correctGroupId:'lockdown'},
      {id:'b',text:'b. helpful or useful',correctGroupId:'beneficial'},
      {id:'c',text:'c. become better',correctGroupId:'improve'},
      {id:'d',text:'d. diseases throughout the whole country or the whole world',correctGroupId:'pandemics'},
      {id:'e',text:'e. things that happen to you and affect your life',correctGroupId:'experiences'}
    ],
    correctLabel:'1 → b · 2 → d · 3 → a · 4 → e · 5 → c',
    reason:'beneficial = helpful/useful; pandemics = dịch bệnh lan rất rộng; lockdown = phải ở nhà trong tình huống khẩn cấp; experiences = điều mình trải qua; improve = become better.',
    theory:'Tìm ý chính trong định nghĩa rồi ghép.',
    example:'improve → become better',
    adaptation:{ sourceResponseType:'matching_words_meanings', adaptedResponseType:'classification_matching' }
  })]);
}

function sourceD3B() {
  const options = [['A','True'],['B','False'],['C','No Information']];
  const rows = [
    ['1','During the lockdown, the author’s family reads books and watches the news together.','B','Passage nói “reads books and watches films together”, nhưng statement đổi films thành news → False.'],
    ['2','Travelling helps the author have more friends.','A','Tác giả chia sẻ travel experiences với classmates rồi nói “This way, I have more friends.” → True.'],
    ['3','There is a dancing club in the author’s school.','C','Passage không nói có dancing club ở trường. Không được đoán → No Information.'],
    ['4','Hobbies can help a person develop new skills.','A','Passage nói trực tiếp “a hobby can help you develop new skills” → True.'],
    ['5','The author’s sister sews clothes for her family members.','B','Passage nói chị/em gái may “doll clothes”, không phải quần áo cho family members → False.']
  ];
  return freeze(rows.map(row => mcq({ id:`g7-u1-wb-d3b-src-${row[0]}`, prompt:`${row[0]}. ${row[1]}`, stimulus:{title:'Benefits of hobbies',text:D3_PASSAGE}, options, correct:row[2], reason:row[3], theory:'Cùng ý = True; trái ý = False; không có thông tin = NI.', example:'Đừng biến “không thấy” thành False.', phase:'source' })));
}

function sourceE1() {
  return freeze([
    typing({ id:'g7-u1-wb-e1-src-1', prompt:'1. I / like / garden / because / I / love / plants / flowers.', answer:'I like gardening because I love plants and flowers.', acceptedAnswers:['I like gardening because I love plants and I love flowers.'], reason:'Sau like, hoạt động dùng gardening. Plants và flowers nối bằng and.', theory:'like + V-ing.', example:'I like gardening because I love plants and flowers.', phase:'source' }),
    typing({ id:'g7-u1-wb-e1-src-2', prompt:'2. My sister / not like / horse riding / because / she / afraid of / horses.', answer:"My sister doesn’t like horse riding because she is afraid of horses.", acceptedAnswers:["My sister doesn't like horse riding because she is afraid of horses.",'My sister does not like horse riding because she is afraid of horses.'], reason:'My sister = she → doesn’t like. Cụm đúng là be afraid of → she is afraid of horses.', theory:'doesn’t + V; be afraid of.', example:'She is afraid of horses.', phase:'source' }),
    typing({ id:'g7-u1-wb-e1-src-3', prompt:'3. Make / models / develop / your / creativity.', answer:'Making models develops your creativity.', acceptedAnswers:['Making models can develop your creativity.','Making models helps develop your creativity.'], reason:'Hoạt động “make models” đứng đầu câu → Making models. Cả hoạt động là một ý số ít → develops.', theory:'V-ing làm chủ ngữ; chủ ngữ hoạt động thường đi với V-s.', example:'Reading books helps me relax.', phase:'source' }),
    typing({ id:'g7-u1-wb-e1-src-4', prompt:'4. Collect / stamps / help / you / be / more / patient.', answer:'Collecting stamps helps you be more patient.', acceptedAnswers:['Collecting stamps helps you become more patient.','Collecting stamps can help you be more patient.'], reason:'Collect → Collecting; cả hoạt động là một ý → helps. “be more patient” = kiên nhẫn hơn.', theory:'V-ing làm chủ ngữ + động từ số ít.', example:'Swimming helps you stay healthy.', phase:'source' }),
    typing({ id:'g7-u1-wb-e1-src-5', prompt:'5. Jog / make / you / strong / and / reduce / stress.', answer:'Jogging makes you strong and reduces stress.', acceptedAnswers:['Jogging can make you strong and reduce stress.','Jogging makes you stronger and reduces stress.'], reason:'Jog → Jogging. Chủ ngữ hoạt động là số ít → makes và reduces.', theory:'Một chủ ngữ “Jogging” điều khiển cả makes và reduces.', example:'Reading improves vocabulary and reduces stress.', phase:'source' })
  ]);
}

function sourceE3() {
  const rows = [
    ['1','Word web 1 · His / Her hobby is: ______','gardening','Ví dụ: gardening. Con dùng hobby thật của bố/mẹ.'],
    ['2','Word web 2 · He / She started the hobby: ______ ago','five years','Ví dụ: five years ago. Con điền thời gian thật/phù hợp.'],
    ['3','Word web 3 · He / She shares the hobby with: ______','my dad','Ví dụ: my dad. Có thể là family members, friends...'],
    ['4','Word web 4 · To do this hobby, he / she needs: ______','seeds, water and gardening tools','Liệt kê những thứ cần cho hobby đã chọn.'],
    ['5','Word web 5 · Benefits: ______','helps her relax and stay active','Nêu lợi ích thật/phù hợp của hobby.']
  ];
  const shortItems = rows.map(row => typing({ id:`g7-u1-wb-e3-src-${row[0]}`, prompt:row[1], answer:row[2], open:true, reason:row[3] + ' Đây là ô mở nên không có một đáp án duy nhất.', theory:'Điền một ý ngắn cho word web trước khi viết đoạn.', example:row[2], phase:'source' }));
  const paragraph = typing({
    id:'g7-u1-wb-e3-src-6',
    prompt:'Now write a short paragraph of about 70 words about your dad’s / mum’s hobby. Use the five ideas from the word web.',
    answer:'My mum’s hobby is gardening. She started this hobby five years ago. She usually gardens at the weekend and shares the hobby with my dad. To do it, she needs seeds, water and some gardening tools. Gardening helps her relax and stay active. She loves seeing new flowers grow. I sometimes help her water the plants, so we have a good time together.',
    open:true,
    reason:'Bài mở: không cần giống bài mẫu. Con nên có đủ hobby, started ... ago, người làm cùng, dụng cụ/điều cần và benefits; sau đó nối thành khoảng 70 từ.',
    theory:'5 ý nhỏ → 5–7 câu → một paragraph.',
    example:'Checklist: hobby ✓ started ✓ with whom ✓ needs ✓ benefits ✓ about 70 words ✓',
    phase:'source'
  });
  return freeze([...shortItems, paragraph]);
}

const SOURCE_FACTORIES = freeze({ a2:sourceA2, b4:sourceB4, b5:sourceB5, c1:sourceC1, c2:sourceC2, c3:sourceC3, d1:sourceD1, d2:sourceD2, d3a:sourceD3A, d3b:sourceD3B, e1:sourceE1, e3:sourceE3 });

export const g7U1WorkbookItemCounts = freeze({ a2:11, b4:13, b5:17, c1:14, c2:10, c3:14, d1:13, d2:15, d3a:8, d3b:14, e1:15, e3:16 });

export function getG7U1WorkbookContent(key) {
  const theory = THEORIES[key];
  const preloadSpec = PRELOAD[key];
  const sourceFactory = SOURCE_FACTORIES[key];
  if (!theory || !preloadSpec || !sourceFactory) throw new Error(`Unknown G7 U1 workbook lesson: ${key}`);
  const items = freeze([...preload(`g7-u1-wb-${key}`, preloadSpec.vocab, preloadSpec.phrases), ...sourceFactory()]);
  return freeze({ preLessonTheory:theory, items });
}

export const g7U1WorkbookContentKeys = freeze(Object.keys(SOURCE_FACTORIES));
