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
  instruction: 'Tự viết câu trả lời của em. Bài này có thể có nhiều đáp án đúng.',
  inputLabel: 'Câu trả lời của em',
  placeholder: 'Gõ câu trả lời của em...'
});

const practiceTypingUi = freeze({
  promptLabel: 'Luyện đọc trong SBT',
  contextLabel: 'Câu luyện đọc',
  instruction: 'Đọc to câu trong đề. Hệ thống không chấm phát âm bằng micro.',
  inputLabel: 'Xác nhận sau khi luyện',
  placeholder: 'Gõ XONG sau khi con đã luyện đọc...'
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

const typing = ({ id, prompt, answer, acceptedAnswers = [], reason, theory, example, open = false, sourceWordBank = null, practice = false }) => freeze({
  id,
  type: 'typing',
  vi: prompt,
  en: answer,
  ...(acceptedAnswers.length ? { acceptedAnswers: freeze(acceptedAnswers) } : {}),
  ...(open ? { responseMode: 'open' } : {}),
  ...(sourceWordBank ? { sourceWordBank: freeze(sourceWordBank), sourceWordBankLabel: 'Từ / cụm từ cho sẵn' } : {}),
  typingUi: practice ? practiceTypingUi : (open ? openTypingUi : typingUi),
  theorySupport,
  teachingFeedback: teaching({ correctLabel: open ? 'Bài tham khảo' : answer, reason, theory, example })
});

const mcq = ({ id, prompt, options, correct, reason, theory, example, stimulus = null, adaptation = null }) => freeze({
  id,
  type: 'mcq',
  prompt,
  ...(stimulus ? { stimulus: freeze(stimulus) } : {}),
  choices: freeze(options.map(([choiceId, text]) => choice(choiceId, text))),
  correctChoiceId: correct,
  ...(adaptation ? { digitalAdaptation: freeze(adaptation) } : {}),
  theorySupport,
  teachingFeedback: teaching({
    correctLabel: options.find(([choiceId]) => choiceId === correct)?.[1] ?? correct,
    reason,
    theory,
    example
  })
});

const classification = ({ id, prompt, groups, tokens, correctLabel, reason, theory, example, adaptation = null }) => freeze({
  id,
  type: 'classification',
  prompt,
  classificationKind: 'generic',
  groups: freeze(groups.map(group => freeze(group))),
  tokens: freeze(tokens.map(token => freeze({ ...token, preserveOrder: true }))),
  ...(adaptation ? { digitalAdaptation: freeze(adaptation) } : {}),
  theorySupport,
  teachingFeedback: teaching({ correctLabel, reason, theory, example })
});

const WORDS_B1 = freeze(['arms','big','legs','long','shoulders','small','hands','eyes','fast','short','cute','strong','weak','smart','feet','ears','tall','hair','head','slim','sporty']);
const WORD_BOX_B3 = freeze(['careful','creative','kind','loving','hard-working','shy']);
const WORD_BOX_D1 = freeze(['funny','is','kind','time','cook','hair']);

const D2_INTERVIEW = `Reporter: So, Miss Hong, what do you think are the qualities of a good friend?\nMiss Hong: I think good friends are reliable. They never lie to you. They always listen to you. And they help you. They're always there when you need them, in good or bad times.\nReporter: But do we have to be similar?\nMiss Hong: Not necessarily. It's best if friends have similar interests, you know, like listening to pop music or playing basketball, but we also respect the differences in others.\nReporter: Definitely. By the way, what do you often do with your friends?\nMiss Hong: Oh ... we do lots of things, like go cycling, go swimming, ... and of course go shopping!`;

const E_SAMPLE = `(a) This writing is about my best friend, Mai. We go to the same school, and we've been together for three years.\n\n(b) Mai is very pretty. She has short black hair and big brown eyes. She is clever and hard-working, and she is also very funny. She makes jokes and we all laugh. She loves reading and writing short poems.\n\n(c) I like being with her. We often do our homework together, and she helps me a lot. I also like her because she knows a lot about astronomy, and we can chat about it for hours. At the moment we're making a space minibook. We're doing a lot of searching on the internet.\n\n(d) I hope that in the future we'll still be best friends.`;

const theories = freeze({
  a2: preTheory({
    title: 'Nhắc nhanh · Phân biệt /p/ và /b/',
    intro: 'Con chỉ cần chú ý môi, hơi và độ rung khi đọc. Bài này là luyện phát âm, không phải bài gõ chính tả.',
    sourceSections: ['SBT trang 16 · A. Pronunciation · Bài 2'],
    sections: [
      { heading: 'Hai âm dùng hai môi', bullets: ['/p/: bật hơi rõ hơn.', '/b/: cổ rung rõ hơn.'] },
      { heading: 'Ví dụ khác bài', bullets: ['pin / bin', 'Đặt tay trước miệng: /p/ thường cho luồng hơi mạnh hơn.'] },
      { heading: 'Cách luyện', bullets: ['Đọc chậm trước, rõ p/b.', 'Sau đó mới tăng tốc. Không cần đọc thật nhanh nếu âm bị lẫn.'] }
    ],
    summary: 'Mục tiêu: giữ /p/ và /b/ khác nhau khi đọc cả câu.'
  }),
  b1: preTheory({
    title: 'Nhắc nhanh · HAS hay IS khi tả người?',
    intro: 'Bảng của sách có từ dùng được ở hơn một cột. App chia bảng thành ba lượt để con vẫn thấy được những từ có thể dùng ở nhiều chỗ.',
    sourceSections: ['SBT trang 16 · B. Vocabulary & Grammar · Bài 1'],
    sections: [
      { heading: 'HAS = có', bullets: ['She has long hair. = Cô ấy có tóc dài.', 'arms, eyes, hair... là các bộ phận cơ thể.'] },
      { heading: 'IS = người đó như thế nào', bullets: ['She is tall. = Cô ấy cao.', 'smart, slim, sporty... có thể mô tả cả người.'] },
      { heading: 'Một từ có thể dùng ở hai nơi', bullets: ['big eyes → HAS + mô tả bộ phận.', 'He is big. → IS + mô tả người.', 'Đừng ép mỗi từ chỉ có một cách dùng.'] }
    ],
    summary: '“Có gì?” → HAS. “Người đó thế nào?” → IS. Một số từ dùng được ở cả hai cách.'
  }),
  b2: preTheory({
    title: 'Nhắc nhanh · Đọc định nghĩa để tìm tính từ',
    intro: 'Đừng dịch từng chữ. Hãy tìm ý quan trọng nhất trong định nghĩa rồi dùng chữ cái đầu để kiểm tra.',
    sourceSections: ['SBT trang 17 · B. Vocabulary & Grammar · Bài 2'],
    sections: [
      { heading: 'Cách nghĩ 3 bước', bullets: ['Tìm hành vi/đặc điểm chính.', 'Nói nghĩa đó bằng tiếng Việt thật ngắn.', 'Dùng chữ cái đầu trong đề để khóa từ.'] },
      { heading: 'Ví dụ khác bài', bullets: ['“often makes people laugh” → vui tính → funny.', 'Nếu đề cho f____, funny càng phù hợp.'] }
    ],
    summary: 'Ý chính → nghĩa ngắn → chữ cái đầu → từ cần điền.'
  }),
  b3: preTheory({
    title: 'Nhắc nhanh · Dùng tính từ theo bằng chứng trong câu',
    intro: 'Bài này dùng lại các tính từ ở Bài 2. Câu sau thường cho bằng chứng để con chọn từ.',
    sourceSections: ['SBT trang 17 · B. Vocabulary & Grammar · Bài 3'],
    sections: [
      { heading: 'Bộ từ của bài', bullets: ['careful · creative · kind · loving · hard-working · shy'] },
      { heading: 'Cách làm', bullets: ['Đọc cả câu, đặc biệt phần giải thích phía sau.', 'Ví dụ khác bài: “He always helps his friends.” → nghĩ đến tính cách tốt bụng.'] },
      { heading: 'Bẫy', bullets: ['Đừng chọn vì một từ “nghe hay”. Phải có bằng chứng trong câu.'] }
    ],
    summary: 'Tìm câu bằng chứng rồi mới chọn adjective.'
  }),
  b4: preTheory({
    title: 'Nhắc nhanh · Hành động đang diễn ra',
    intro: 'Bài này yêu cầu Present Continuous. Con chỉ cần ghép đúng BE và V-ing.',
    sourceSections: ['SBT trang 17 · B. Vocabulary & Grammar · Bài 4'],
    sections: [
      { heading: 'Khung câu', bullets: ['I → am', 'he / she / it → is', 'you / we / they → are', 'am / is / are + V-ing'] },
      { heading: 'Ví dụ khác bài', bullets: ['Ben is reading now.', 'They are playing now.'] },
      { heading: 'Lỗi dễ mắc', bullets: ['She reading. ✗ thiếu is.', 'She is read. ✗ thiếu -ing.', 'She is reading. ✓'] }
    ],
    summary: 'Ai? → am/is/are → động từ thêm -ing.'
  }),
  b5: preTheory({
    title: 'Nhắc nhanh · Chuyện bình thường hay đang xảy ra?',
    intro: 'Đừng chọn thì chỉ vì Unit đang học Present Continuous. Hãy hiểu ý của câu trước.',
    sourceSections: ['SBT trang 17 · B. Vocabulary & Grammar · Bài 5'],
    sections: [
      { heading: 'Bước 1 · Hiểu ý', bullets: ['Chuyện bình thường, sở thích, sự thật → thường dùng Present Simple.', 'Việc đang xảy ra ngay lúc nói → Present Continuous.'] },
      { heading: 'Dấu hiệu mạnh', bullets: ['now · Look! · at the moment → thường báo việc đang diễn ra.', 'like thường nói sở thích.'] },
      { heading: 'Ví dụ khác bài', bullets: ['I like milk. = sở thích.', 'Look! Ben is running now. = đang diễn ra.'] }
    ],
    summary: 'Hỏi “đang xảy ra hay chuyện bình thường?” rồi mới chọn dạng động từ.'
  }),
  b6: preTheory({
    title: 'Nhắc nhanh · Xây câu Present Continuous',
    intro: 'Đề cho các mảnh từ. Con ghép theo khung, rồi chọn câu hoàn chỉnh đúng.',
    sourceSections: ['SBT trang 18 · B. Vocabulary & Grammar · Bài 6'],
    sections: [
      { heading: 'Bốn khối', bullets: ['Ai + am/is/are + V-ing + phần còn lại.', 'Phủ định: am/is/are + not + V-ing.', 'Câu hỏi: đưa am/is/are lên trước chủ ngữ.'] },
      { heading: 'Ví dụ khác bài', bullets: ['Tom / play / football / now → Tom is playing football now.'] },
      { heading: 'Bẫy', bullets: ['Không bỏ BE.', 'Sau BE phải dùng V-ing, không dùng động từ nguyên mẫu.'] }
    ],
    summary: 'Chủ ngữ → BE → V-ing → phần còn lại.'
  }),
  c1: preTheory({
    title: 'Nhắc nhanh · LOOK LIKE khác BE LIKE',
    intro: 'Hai câu hỏi trông giống nhau nhưng hỏi hai thứ khác nhau.',
    sourceSections: ['SBT trang 18 · C. Speaking · Bài 1'],
    sections: [
      { heading: 'LOOK LIKE = ngoại hình', bullets: ['What does she look like? → hỏi tóc, mắt, cao/thấp...'] },
      { heading: 'BE LIKE = tính cách', bullets: ['What is she like? → hỏi friendly, kind, hard-working...'] },
      { heading: 'Mẹo nhớ', bullets: ['LOOK → thứ con nhìn thấy bằng mắt.', 'BE LIKE → con người bên trong / tính cách.'] }
    ],
    summary: 'look like → ngoại hình; be like → tính cách.'
  }),
  c3: preTheory({
    title: 'Nhắc nhanh · Miêu tả một người đặc biệt',
    intro: 'Không cần nghĩ cả đoạn cùng lúc. Trả lời bốn câu hỏi nhỏ rồi nối lại.',
    sourceSections: ['SBT trang 19 · C. Speaking · Bài 3'],
    sections: [
      { heading: 'Bốn ý cần có', bullets: ['Người đó là ai?', 'Người đó trông như thế nào?', 'Tính cách ra sao?', 'Vì sao người đó đặc biệt với con?'] },
      { heading: 'Khung hỗ trợ', bullets: ['This is my ...', 'He/She is ...', 'He/She has ...', 'I like/love him/her because ...'] }
    ],
    summary: 'Ai → ngoại hình → tính cách → vì sao đặc biệt.'
  }),
  d1: preTheory({
    title: 'Nhắc nhanh · Điền từ bằng nghĩa và từ bên cạnh',
    intro: 'Mỗi chỗ trống phải đúng cả nghĩa và cụm từ xung quanh.',
    sourceSections: ['SBT trang 19 · D. Reading · Bài 1'],
    sections: [
      { heading: 'Ba câu hỏi', bullets: ['Nghĩa có hợp không?', 'Từ bên trái/bên phải gợi ý gì?', 'Cả câu có tự nhiên không?'] },
      { heading: 'Ví dụ khác bài', bullets: ['long, black ___ → cần một danh từ có thể được “long, black” mô tả.', 'cook + meal/dinner là một cụm quen thuộc.'] }
    ],
    summary: 'Đừng thử ngẫu nhiên cả word box; nhìn cụm quanh blank trước.'
  }),
  d2: preTheory({
    title: 'Nhắc nhanh · Tóm tắt ý “một người bạn tốt”',
    intro: 'Bài này không cần copy cả interview. Con chọn những phẩm chất quan trọng rồi viết một câu ngắn.',
    sourceSections: ['SBT trang 19 · D. Reading · Bài 2'],
    sections: [
      { heading: 'Cách đọc', bullets: ['Tìm Miss Hong nói bạn tốt LÀM gì.', 'Tìm Miss Hong nói bạn tốt KHÔNG làm gì.', 'Tìm ý được nhắc trực tiếp, không tự thêm ý ngoài bài.'] },
      { heading: 'Cách trả lời', bullets: ['Có nhiều câu đúng nếu đều dựa vào interview.', 'Không cần dùng y hệt bài tham khảo.'] }
    ],
    summary: 'Tìm 2–3 phẩm chất có evidence rồi viết một câu tóm tắt.'
  }),
  d3: preTheory({
    title: 'Nhắc nhanh · Đúng hay không đúng theo Miss Hong?',
    intro: 'Sách yêu cầu khoanh tất cả ý đúng. Trên app, mỗi ý được hỏi riêng để máy chấm chắc chắn.',
    sourceSections: ['SBT trang 20 · D. Reading · Bài 3'],
    sections: [
      { heading: 'Cách làm', bullets: ['Đọc từng statement.', 'Tìm câu trong interview chứng minh hoặc bác bỏ.', 'Chọn theo evidence, không chọn vì câu “nghe tốt”.'] },
      { heading: 'Ví dụ cách suy', bullets: ['Nếu bài đọc nói “never ...” mà statement nói “sometimes ...”, hai ý trái nhau.'] }
    ],
    summary: 'Statement → tìm evidence → đúng/không đúng.'
  }),
  e1: preTheory({
    title: 'Nhắc nhanh · Bài viết có 3 phần',
    intro: 'Con không cần hiểu hết từng từ. Hãy xem mỗi đoạn đang làm nhiệm vụ gì.',
    sourceSections: ['SBT trang 20–21 · E. Writing · Bài 1'],
    sections: [
      { heading: 'Beginning', bullets: ['Giới thiệu người mình viết về.'] },
      { heading: 'Middle', bullets: ['Ngoại hình, tính cách, sở thích, hoạt động cùng nhau, lý do yêu quý.'] },
      { heading: 'End', bullets: ['Kết bài hoặc nói mong muốn trong tương lai.'] }
    ],
    summary: 'Giới thiệu → kể chi tiết → kết lại.'
  }),
  e2: preTheory({
    title: 'Nhắc nhanh · Câu hỏi đang tìm loại thông tin nào?',
    intro: 'Đừng đọc lại toàn bài một cách ngẫu nhiên. Tìm keyword của câu hỏi trước.',
    sourceSections: ['SBT trang 21 · E. Writing · Bài 2'],
    sections: [
      { heading: 'Keyword', bullets: ['Who? → người được giới thiệu.', 'look like? → ngoại hình.', 'be like? → tính cách.', 'like? → sở thích.', 'do together? → hoạt động chung.', 'future? → mong muốn tương lai.'] },
      { heading: 'Ví dụ khác bài', bullets: ['What does he look like? → tìm hair / eyes / tall / short...'] }
    ],
    summary: 'Đọc keyword câu hỏi rồi tìm đúng phần a/b/c/d.'
  }),
  e3: preTheory({
    title: 'Nhắc nhanh · Viết về người bạn thân theo 3 phần',
    intro: 'Đừng nghĩ “70 từ” ngay. Viết từng phần nhỏ rồi nối lại.',
    sourceSections: ['SBT trang 21 · E. Writing · Bài 3'],
    sections: [
      { heading: 'Beginning', bullets: ['My best friend is ...'] },
      { heading: 'Middle', bullets: ['He/She is ...', 'He/She has ...', 'He/She likes ...', 'We often ... together.', 'I like him/her because ...'] },
      { heading: 'End', bullets: ['I hope ...'] },
      { heading: 'Tự kiểm tra', bullets: ['Có giới thiệu?', 'Có ngoại hình/tính cách?', 'Có hoạt động hoặc sở thích?', 'Có lý do?', 'Có câu kết?'] }
    ],
    summary: 'Viết từng khối nhỏ: Beginning → Middle → End.'
  })
});

const b1Membership = freeze({
  bodyDescription: freeze(['big','long','small','short','strong','weak']),
  bodyParts: freeze(['arms','legs','shoulders','hands','eyes','feet','ears','hair','head']),
  personDescription: freeze(['big','small','fast','short','cute','strong','weak','smart','tall','slim','sporty'])
});

function membershipTokens(prefix, members) {
  const set = new Set(members);
  return WORDS_B1.map((word, index) => ({ id: `${prefix}-${index + 1}`, text: word, correctGroupId: set.has(word) ? 'yes' : 'no' }));
}

const lessons = freeze({
  a2: freeze({
    preLessonTheory: theories.a2,
    items: freeze([
      typing({ id:'g6-u3-wb-a2-01', prompt:'Đọc to: Plain bun, plum bun, bun without plum.\n\nSau khi con đã luyện đọc câu này, gõ XONG để tiếp tục.', answer:'XONG', open:true, practice:true, reason:'Đây là bài luyện phát âm. Hệ thống chỉ ghi nhận con đã hoàn thành lượt luyện; không tự nhận là phát âm đúng nếu không có đánh giá âm thanh.', theory:'Giữ /p/ và /b/ khác nhau: /p/ bật hơi rõ hơn, /b/ rung hơn.', example:'pin / bin' }),
      typing({ id:'g6-u3-wb-a2-02', prompt:'Đọc to: The big bug bit the big bear. The big bear bit the big bug back!\n\nSau khi con đã luyện đọc câu này, gõ XONG để tiếp tục.', answer:'XONG', open:true, practice:true, reason:'Mục tiêu là đọc rõ chuỗi âm /b/ trong cả câu, không phải đọc thật nhanh.', theory:'Đọc chậm trước, giữ môi và độ rung ổn định rồi mới tăng tốc.', example:'big / pig' }),
      typing({ id:'g6-u3-wb-a2-03', prompt:'Đọc to: Picky people pick plain peanut butter. Plain peanut butter is the peanut butter picky people pick.\n\nSau khi con đã luyện đọc câu này, gõ XONG để tiếp tục.', answer:'XONG', open:true, practice:true, reason:'Câu này lặp nhiều /p/. Con hoàn thành khi đã đọc chậm, rõ rồi thử nhanh hơn.', theory:'Âm /p/ cần bật hơi rõ; đừng đổi thành /b/.', example:'pick / big' })
    ])
  }),
  b1: freeze({
    preLessonTheory: theories.b1,
    items: freeze([
      classification({
        id:'g6-u3-wb-b1-01',
        prompt:'Lượt 1/3 · Cột HAS – Describing parts of the body. Với từng từ, chọn “Dùng được ở cột này” nếu từ có thể mô tả một bộ phận cơ thể (ví dụ: ___ eyes / ___ hair / ___ arms).',
        groups:[{ id:'yes', label:'Dùng được ở cột này' },{ id:'no', label:'Không dùng ở cột này' }],
        tokens:membershipTokens('desc-body', b1Membership.bodyDescription),
        correctLabel:'Dùng được: big, long, small, short, strong, weak',
        reason:'Các từ này có thể đứng trước một bộ phận cơ thể: big eyes, long hair, small hands, short hair, strong arms, weak legs.',
        theory:'Cột này chứa từ MÔ TẢ bộ phận, không phải tên bộ phận.',
        example:'long hair',
        adaptation:{ sourceResponseType:'three_column_table_with_overlap', adaptedResponseType:'three_binary_classifications', note:'Tách ba cột thành ba lượt để một từ vẫn có thể thuộc hơn một cột.' }
      }),
      classification({
        id:'g6-u3-wb-b1-02',
        prompt:'Lượt 2/3 · Cột HAS – Parts of the body. Với từng từ, chọn “Dùng được ở cột này” nếu đó là TÊN một bộ phận cơ thể.',
        groups:[{ id:'yes', label:'Dùng được ở cột này' },{ id:'no', label:'Không dùng ở cột này' }],
        tokens:membershipTokens('body-part', b1Membership.bodyParts),
        correctLabel:'Dùng được: arms, legs, shoulders, hands, eyes, feet, ears, hair, head',
        reason:'Đây là tên các bộ phận cơ thể. Ta có thể nói she has long hair, he has strong arms...',
        theory:'Tên bộ phận trả lời câu hỏi “người đó có gì?”.',
        example:'eyes = đôi mắt',
        adaptation:{ sourceResponseType:'three_column_table_with_overlap', adaptedResponseType:'three_binary_classifications', note:'Tách ba cột thành ba lượt để một từ vẫn có thể thuộc hơn một cột.' }
      }),
      classification({
        id:'g6-u3-wb-b1-03',
        prompt:'Lượt 3/3 · Cột IS – Describing the person. Với từng từ, chọn “Dùng được ở cột này” nếu từ có thể mô tả cả người.',
        groups:[{ id:'yes', label:'Dùng được ở cột này' },{ id:'no', label:'Không dùng ở cột này' }],
        tokens:membershipTokens('desc-person', b1Membership.personDescription),
        correctLabel:'Dùng được: big, small, fast, short, cute, strong, weak, smart, tall, slim, sporty',
        reason:'Các từ này có thể đi sau BE để tả người: He is tall. She is smart. He is sporty.',
        theory:'IS + adjective dùng để nói người đó như thế nào.',
        example:'She is tall.',
        adaptation:{ sourceResponseType:'three_column_table_with_overlap', adaptedResponseType:'three_binary_classifications', note:'Tách ba cột thành ba lượt để một từ vẫn có thể thuộc hơn một cột.' }
      })
    ])
  }),
  b2: freeze({
    preLessonTheory: theories.b2,
    items: freeze([
      typing({ id:'g6-u3-wb-b2-01', prompt:'This person gives a lot of attention to what he / she is doing so that he / she does not have an accident, make a mistake, or damage something.\n\nc________', answer:'careful', reason:'Người này chú ý để tránh tai nạn và lỗi. “Cẩn thận” = careful; chữ đầu c cũng khớp.', theory:'Tìm ý chính trong định nghĩa trước.', example:'Be careful with the glass.' }),
      typing({ id:'g6-u3-wb-b2-02', prompt:'This person has original and unusual ideas.\n\nc________', answer:'creative', reason:'“original and unusual ideas” = có ý tưởng mới, khác thường → creative.', theory:'creative = sáng tạo.', example:'a creative student' }),
      typing({ id:'g6-u3-wb-b2-03', prompt:'This person is generous, helpful and thinking about other people’s feelings.\n\nk________', answer:'kind', reason:'Hay giúp đỡ và nghĩ đến cảm xúc người khác → kind = tốt bụng.', theory:'kind mô tả tính cách tốt bụng.', example:'a kind friend' }),
      typing({ id:'g6-u3-wb-b2-04', prompt:'This person shows a lot of love towards other people.\n\nl________', answer:'loving', reason:'Thể hiện nhiều tình yêu với người khác → loving = yêu thương.', theory:'loving nói về người thể hiện tình yêu và sự quan tâm.', example:'a loving family' }),
      typing({ id:'g6-u3-wb-b2-05', prompt:'This person always does a lot of work.\n\nh________', answer:'hard-working', acceptedAnswers:['hard working'], reason:'“does a lot of work” → chăm chỉ → hard-working.', theory:'hard-working = chăm chỉ.', example:'a hard-working pupil' }),
      typing({ id:'g6-u3-wb-b2-06', prompt:'This person is nervous and uncomfortable with other people.\n\ns________', answer:'shy', reason:'Lo/ngại và không thoải mái khi ở với người khác → shy = nhút nhát.', theory:'shy mô tả người ngại giao tiếp.', example:'a shy child' })
    ])
  }),
  b3: freeze({
    preLessonTheory: theories.b3,
    items: freeze([
      typing({ id:'g6-u3-wb-b3-02', prompt:"That's a ______ designer. She has a lot of new ideas.", answer:'creative', reason:'Câu sau nói cô ấy có nhiều ý tưởng mới. Đó chính là bằng chứng cho creative.', theory:'new ideas → creative.', example:'a creative artist', sourceWordBank:WORD_BOX_B3 }),
      typing({ id:'g6-u3-wb-b3-03', prompt:'Peter is so ______. He often checks his writing twice before giving it to the teacher.', answer:'careful', reason:'Peter kiểm tra bài hai lần trước khi nộp → rất cẩn thận → careful.', theory:'checks twice để tránh lỗi → careful.', example:'a careful driver', sourceWordBank:WORD_BOX_B3 }),
      typing({ id:'g6-u3-wb-b3-04', prompt:"Children are usually ______ with people they don't know.", answer:'shy', reason:'“people they don’t know” là tình huống dễ làm trẻ ngại/ngượng → shy.', theory:'shy = nhút nhát, ngại với người lạ.', example:'shy with strangers', sourceWordBank:WORD_BOX_B3 }),
      typing({ id:'g6-u3-wb-b3-05', prompt:'Our teacher is very ______. She is always ready to help us.', answer:'kind', reason:'“always ready to help us” = luôn sẵn sàng giúp → kind.', theory:'helpful behaviour là bằng chứng cho kind.', example:'a kind teacher', sourceWordBank:WORD_BOX_B3 }),
      typing({ id:'g6-u3-wb-b3-06', prompt:'He loves his family a lot. He’s a ______ child.', answer:'loving', reason:'Câu trước nói cậu bé rất yêu gia đình → loving.', theory:'loving = biết yêu thương.', example:'a loving son', sourceWordBank:WORD_BOX_B3 })
    ])
  }),
  b4: freeze({
    preLessonTheory: theories.b4,
    items: freeze([
      typing({ id:'g6-u3-wb-b4-01', prompt:'Could you call back? She (take) ______ her dog out for a walk.', answer:'is taking', reason:'Chủ ngữ She → is; hành động đang diễn ra → take + ing = taking.', theory:'she → is + V-ing.', example:'She is reading.' }),
      typing({ id:'g6-u3-wb-b4-02', prompt:"Where’s Lisa? – She (help) ______ Mum in the kitchen.", answer:'is helping', reason:'Lisa/She là một người → is; help → helping.', theory:'she → is + V-ing.', example:'She is cooking.' }),
      typing({ id:'g6-u3-wb-b4-03', prompt:'Listen! Someone (knock) ______ at the door.', answer:'is knocking', reason:'Listen! báo hiệu việc đang xảy ra ngay lúc nói. Someone là số ít → is knocking.', theory:'Listen! + hành động hiện tại → is + V-ing.', example:'Listen! The baby is crying.' }),
      typing({ id:'g6-u3-wb-b4-04a', prompt:'______ you (do) ______ your homework?\n\nĐiền từ BE đứng trước “you”.', answer:'Are', acceptedAnswers:['are'], reason:'Câu hỏi Present Continuous với you đưa are lên trước: Are you ...?', theory:'you → are.', example:'Are you reading?' }),
      typing({ id:'g6-u3-wb-b4-04b', prompt:'Are you (do) ______ your homework?', answer:'doing', reason:'Sau Are you phải dùng động từ V-ing → do → doing.', theory:'BE + V-ing.', example:'Are you working?' }),
      typing({ id:'g6-u3-wb-b4-04c', prompt:"No, I’m not. I (write) ______ a letter to my parents.", answer:'am writing', reason:'Chủ ngữ I → am; write → writing.', theory:'I → am + V-ing.', example:'I am reading.' }),
      typing({ id:'g6-u3-wb-b4-05a', prompt:'Who ______ he (talk) ______ about?\n\nĐiền từ BE.', answer:'is', reason:'Chủ ngữ he → is. Trong câu hỏi, is đứng trước he.', theory:'he → is.', example:'Who is he waiting for?' }),
      typing({ id:'g6-u3-wb-b4-05b', prompt:'Who is he (talk) ______ about?', answer:'talking', reason:'Sau is he dùng V-ing → talking.', theory:'is + V-ing.', example:'He is talking.' }),
      typing({ id:'g6-u3-wb-b4-06a', prompt:'______ they (read) ______ books in the library? – Yes, they are.\n\nĐiền từ BE.', answer:'Are', acceptedAnswers:['are'], reason:'Chủ ngữ they → are; câu hỏi đưa Are lên đầu.', theory:'they → are.', example:'Are they playing?' }),
      typing({ id:'g6-u3-wb-b4-06b', prompt:'Are they (read) ______ books in the library? – Yes, they are.', answer:'reading', reason:'Sau Are they dùng V-ing → reading.', theory:'BE + V-ing.', example:'They are reading.' })
    ])
  }),
  b5: freeze({
    preLessonTheory: theories.b5,
    items: freeze([
      typing({ id:'g6-u3-wb-b5-01', prompt:'This (be) ______ my best friend, Nam.', answer:'is', reason:'Đây là GÁN/giới thiệu Nam là ai, không phải hành động đang diễn ra. “This is ...” là cấu trúc phù hợp.', theory:'BE để giới thiệu/miêu tả dùng Present Simple.', example:'This is my teacher.' }),
      typing({ id:'g6-u3-wb-b5-02', prompt:'He (wear) ______ a T-shirt and shorts today.', answer:'is wearing', reason:'Câu đang mô tả bộ quần áo Nam mặc hôm nay trong tình huống hiện tại → is wearing.', theory:'Hành động/trạng thái tạm thời đang được mô tả → Present Continuous.', example:'She is wearing a blue dress today.' }),
      typing({ id:'g6-u3-wb-b5-03', prompt:'Look! He (play) ______ football now.', answer:'is playing', reason:'Look! + now là hai dấu hiệu rất mạnh: hành động đang diễn ra → is playing.', theory:'now/Look! → BE + V-ing.', example:'Look! Ben is running now.' }),
      typing({ id:'g6-u3-wb-b5-04', prompt:'He (like) ______ eating apples.', answer:'likes', reason:'like nói sở thích của Nam, tức chuyện bình thường. He ở Present Simple → likes.', theory:'Sở thích → Present Simple; he/she/it + V-s/es.', example:'She likes milk.' }),
      typing({ id:'g6-u3-wb-b5-05', prompt:'Apples (be) ______ good for our health.', answer:'are', reason:'Đây là nhận xét/sự thật chung. Apples là số nhiều → are.', theory:'Sự thật chung → Present Simple.', example:'Vegetables are good for us.' }),
      typing({ id:'g6-u3-wb-b5-06a', prompt:'Now he (look) ______ at me and (smile) ______ at me.\n\nĐiền động từ look.', answer:'is looking', reason:'Có Now → hành động đang xảy ra. He → is looking.', theory:'now + he → is + V-ing.', example:'He is looking at the board now.' }),
      typing({ id:'g6-u3-wb-b5-06b', prompt:'Now he is looking at me and (smile) ______ at me.', answer:'smiling', acceptedAnswers:['is smiling'], reason:'Động từ thứ hai nối với “is looking” bằng and; đáp án của sách có thể dùng chung is: is looking ... and smiling ... . “is smiling” cũng diễn đạt đúng cấu trúc.', theory:'Hai hành động cùng đang xảy ra có thể chia sẻ BE trong cấu trúc song song.', example:'She is sitting and reading.' })
    ])
  }),
  b6: freeze({
    preLessonTheory: theories.b6,
    items: freeze([
      mcq({ id:'g6-u3-wb-b6-01', prompt:'Our grandparents / watch / TV / in / living room.', options:[['A','Our grandparents is watching TV in the living room.'],['B','Our grandparents watch TV in the living room now.'],['C','Our grandparents are watching TV in the living room.'],['D','Our grandparents are watch TV in the living room.']], correct:'C', reason:'Our grandparents = nhiều người → are; watch → watching. C có đủ BE + V-ing.', theory:'they/people plural → are + V-ing.', example:'My parents are cooking.', adaptation:{ sourceResponseType:'written_sentence', adaptedResponseType:'mcq', note:'Đáp án dài cố định được chuyển thành MCQ để chấm máy ổn định.' } }),
      mcq({ id:'g6-u3-wb-b6-02', prompt:'My sister / swim / in / pool / now.', options:[['A','My sister are swimming in the pool now.'],['B','My sister is swimming in the pool now.'],['C','My sister is swim in the pool now.'],['D','My sister swimming in the pool now.']], correct:'B', reason:'My sister = một người → is. swim → swimming. now cho biết đang xảy ra.', theory:'she → is + V-ing.', example:'My brother is running now.', adaptation:{ sourceResponseType:'written_sentence', adaptedResponseType:'mcq' } }),
      mcq({ id:'g6-u3-wb-b6-03', prompt:'My best friend / not learn / English / moment.', options:[['A','My best friend does not learning English at the moment.'],['B','My best friend not is learning English at the moment.'],['C','My best friend is not learn English at the moment.'],['D','My best friend is not learning English at the moment.']], correct:'D', reason:'Present Continuous phủ định: is not + V-ing. “at the moment” = lúc này.', theory:'he/she → is not + V-ing.', example:'She is not sleeping now.', adaptation:{ sourceResponseType:'written_sentence', adaptedResponseType:'mcq' } }),
      mcq({ id:'g6-u3-wb-b6-04', prompt:'I / not read / ; I / listen / music.', options:[['A','I am not reading; I am listening to music.'],['B','I do not reading; I listening to music.'],['C','I am not read; I am listen to music.'],['D','I not am reading; I am listening music.']], correct:'A', reason:'Với I: am not reading; hành động thứ hai: am listening. Cả hai đều là Present Continuous.', theory:'I → am / am not + V-ing.', example:'I am not writing; I am drawing.', adaptation:{ sourceResponseType:'written_sentence', adaptedResponseType:'mcq' } }),
      mcq({ id:'g6-u3-wb-b6-05', prompt:'We / cook / dinner / in / kitchen / present.', options:[['A','We is cooking dinner in the kitchen at present.'],['B','We cook dinner in the kitchen at present.'],['C','We are cooking dinner in the kitchen at present.'],['D','We are cook dinner in the kitchen at present.']], correct:'C', reason:'We → are. “at present” báo việc đang diễn ra → are cooking.', theory:'we → are + V-ing.', example:'We are studying at present.', adaptation:{ sourceResponseType:'written_sentence', adaptedResponseType:'mcq' } }),
      mcq({ id:'g6-u3-wb-b6-06', prompt:'What / you / do? I / write / poem.', options:[['A','What do you doing? I am writing a poem.'],['B','What are you doing? I am writing a poem.'],['C','What are you do? I writing a poem.'],['D','What you are doing? I am write a poem.']], correct:'B', reason:'Câu hỏi Present Continuous: What are you doing? Câu trả lời với I: I am writing a poem.', theory:'Câu hỏi đưa are trước you; câu trả lời I → am + V-ing.', example:'What are they doing? They are reading.', adaptation:{ sourceResponseType:'written_sentence', adaptedResponseType:'mcq' } })
    ])
  }),
  c1: freeze({
    preLessonTheory: theories.c1,
    items: freeze([
      mcq({ id:'g6-u3-wb-c1-01', prompt:'Mi: What / your sister / look like?', options:[['A','What is your sister look like?'],['B','What does your sister look like?'],['C','What does your sister like?'],['D','What is your sister likes?']], correct:'B', reason:'Câu hỏi hỏi ngoại hình → What does ... look like? “does” đi với động từ nguyên mẫu look.', theory:'look like = ngoại hình.', example:'What does Ben look like?', adaptation:{ sourceResponseType:'written_conversation_from_cues', adaptedResponseType:'mcq' } }),
      mcq({ id:'g6-u3-wb-c1-02', prompt:'Maya: She / tall / thin / with / long / black hair.', options:[['A','She has tall and thin with long black hair.'],['B','She is tall and thin with a long black hair.'],['C','She tall and thin, with long black hair.'],['D','She is tall and thin, with long black hair.']], correct:'D', reason:'Tall/thin mô tả người → She is ...; hair là danh từ không đếm được trong cụm này → long black hair.', theory:'BE + adjective; with + noun phrase.', example:'He is short, with brown hair.', adaptation:{ sourceResponseType:'written_conversation_from_cues', adaptedResponseType:'mcq' } }),
      mcq({ id:'g6-u3-wb-c1-03', prompt:'Mi: What / she / like?', options:[['A','What is she like?'],['B','What does she look like?'],['C','What does she likes?'],['D','What she is like?']], correct:'A', reason:'Câu này hỏi tính cách → What is she like? Không phải hỏi ngoại hình.', theory:'be like = tính cách.', example:'What is your teacher like?', adaptation:{ sourceResponseType:'written_conversation_from_cues', adaptedResponseType:'mcq' } }),
      mcq({ id:'g6-u3-wb-c1-04', prompt:'Maya: She / friendly / hard-working. What / about / brother?', options:[['A','She has friendly and hard-working. What your brother about?'],['B','She is friendly and hard-working. What is about your brother?'],['C','She is friendly and hard-working. What about your brother?'],['D','She friendly and hard-working. What about brother you?']], correct:'C', reason:'friendly/hard-working là tính từ → She is ...; cụm hỏi chuyển chủ đề là What about your brother?', theory:'BE + adjective; What about ...? = còn ... thì sao?', example:'He is kind. What about your sister?', adaptation:{ sourceResponseType:'written_conversation_from_cues', adaptedResponseType:'mcq' } }),
      mcq({ id:'g6-u3-wb-c1-05', prompt:'Mi: He / caring / patient. He / love / me / a lot.', options:[['A','He has caring and patient. He love me a lot.'],['B','He is caring and patient. He loves me a lot.'],['C','He is care and patience. He loves me a lot.'],['D','He caring and patient. He is love me a lot.']], correct:'B', reason:'caring/patient là tính từ → He is ...; Present Simple với he: love → loves.', theory:'he + BE + adjective; he + verb-s trong Present Simple.', example:'He is kind. He helps me.', adaptation:{ sourceResponseType:'written_conversation_from_cues', adaptedResponseType:'mcq' } }),
      typing({ id:'g6-u3-wb-c1-06', prompt:'Now make a similar conversation with your friend.\n\nHãy tự tạo một hội thoại tương tự về ngoại hình và tính cách.', answer:'What does your friend look like? My friend is tall. What is your friend like? My friend is kind.', open:true, reason:'Đây là phần nói mở của SBT nên không có một đáp án duy nhất. Nếu hội thoại của con hỏi/đáp hợp nghĩa về ngoại hình và tính cách thì có thể chấp nhận.', theory:'look like hỏi ngoại hình; be like hỏi tính cách.', example:'What does Ben look like? He is tall. What is he like? He is friendly.' })
    ])
  }),
  c3: freeze({
    preLessonTheory: theories.c3,
    items: freeze([
      typing({ id:'g6-u3-wb-c3-01', prompt:'Describe one of your friends or your family members. Say why he / she is special to you.', answer:'This is my sister. She is kind and funny. She has long black hair. She always helps me. She is special to me because she takes care of me.', open:true, reason:'Bài này là production mở. Con có thể chọn bất kỳ người bạn/người thân nào và dùng thông tin thật của con.', theory:'Một bài đủ ý có thể đi theo: người đó là ai → ngoại hình → tính cách → lý do đặc biệt.', example:'This is my cousin. He is friendly. He has short hair. He is special to me because he always helps me.' })
    ])
  }),
  d1: freeze({
    preLessonTheory: theories.d1,
    items: freeze([
      typing({ id:'g6-u3-wb-d1-01', prompt:'My grandma is my best friend. She is my father’s mother. This year, she (1) ______ 70 years old.', answer:'is', reason:'Nói tuổi dùng BE: She is 70 years old.', theory:'be + age.', example:'He is nine years old.', sourceWordBank:WORD_BOX_D1 }),
      typing({ id:'g6-u3-wb-d1-02', prompt:'She has a round face with long, white (2) ______.', answer:'hair', reason:'long, white đang mô tả tóc → long, white hair.', theory:'adjectives long/white đứng trước danh từ hair.', example:'short black hair', sourceWordBank:WORD_BOX_D1 }),
      typing({ id:'g6-u3-wb-d1-03', prompt:'She teaches me to wash the dishes and (3) ______ dinner.', answer:'cook', reason:'Cụm tự nhiên là cook dinner = nấu bữa tối.', theory:'cook + dinner là collocation.', example:'cook lunch', sourceWordBank:WORD_BOX_D1 }),
      typing({ id:'g6-u3-wb-d1-04', prompt:'She is (4) ______ to other people. She helps them when she can.', answer:'kind', reason:'Câu sau nói bà giúp người khác khi có thể → bằng chứng cho kind = tốt bụng.', theory:'helping others → kind.', example:'a kind woman', sourceWordBank:WORD_BOX_D1 }),
      typing({ id:'g6-u3-wb-d1-05', prompt:'She is (5) ______, too. She makes me laugh all the (6) ______.\n\nĐiền blank (5).', answer:'funny', reason:'“She makes me laugh” = bà làm con cười → funny.', theory:'makes people laugh → funny.', example:'a funny story', sourceWordBank:WORD_BOX_D1 }),
      typing({ id:'g6-u3-wb-d1-06', prompt:'She is funny, too. She makes me laugh all the (6) ______. I love her so much.', answer:'time', reason:'Cụm cố định all the time = suốt / mọi lúc.', theory:'all the time là một cụm hoàn chỉnh.', example:'He smiles all the time.', sourceWordBank:WORD_BOX_D1 })
    ])
  }),
  d2: freeze({
    preLessonTheory: theories.d2,
    items: freeze([
      typing({ id:'g6-u3-wb-d2-01', prompt:`Read the interview, then complete the sentence.\n\n${D2_INTERVIEW}\n\nA good friend is ____________________.`, answer:'A good friend is reliable, listens to you and helps you.', acceptedAnswers:['reliable, listens to you and helps you','reliable and respects you','reliable, helpful and a good listener'], open:true, reason:'Miss Hong nêu nhiều phẩm chất: reliable, never lies, listens, helps, ở bên bạn trong lúc tốt/xấu và tôn trọng sự khác biệt. Vì vậy có nhiều cách tóm tắt đúng nếu bám evidence.', theory:'Bài summary không cần copy nguyên interview; chọn vài ý chính được nói trực tiếp.', example:'A good friend is reliable and helpful.' })
    ])
  }),
  d3: freeze({
    preLessonTheory: theories.d3,
    items: freeze([
      mcq({ id:'g6-u3-wb-d3-01', prompt:'1. A good friend listens to you.', stimulus:{ title:'Interview với Miss Hong', text:D2_INTERVIEW }, options:[['A','Đúng theo Miss Hong'],['B','Không đúng theo Miss Hong']], correct:'A', reason:'Miss Hong nói trực tiếp: “They always listen to you.” → statement 1 đúng.', theory:'Tìm câu evidence có cùng ý.', example:'listen to you ↔ always listen to you', adaptation:{ sourceResponseType:'circle_all_correct_statements', adaptedResponseType:'binary_mcq_per_statement', note:'Giữ nguyên 5 statements; hỏi từng statement riêng để máy chấm chắc chắn.' } }),
      mcq({ id:'g6-u3-wb-d3-02', prompt:'2. A good friend sometimes lies to you.', stimulus:{ title:'Interview với Miss Hong', text:D2_INTERVIEW }, options:[['A','Đúng theo Miss Hong'],['B','Không đúng theo Miss Hong']], correct:'B', reason:'Miss Hong nói “They never lie to you.” Never trái với “sometimes lies” → statement 2 sai.', theory:'Chú ý từ phủ định mạnh never.', example:'never ≠ sometimes', adaptation:{ sourceResponseType:'circle_all_correct_statements', adaptedResponseType:'binary_mcq_per_statement' } }),
      mcq({ id:'g6-u3-wb-d3-03', prompt:'3. A good friend helps you.', stimulus:{ title:'Interview với Miss Hong', text:D2_INTERVIEW }, options:[['A','Đúng theo Miss Hong'],['B','Không đúng theo Miss Hong']], correct:'A', reason:'Miss Hong nói trực tiếp “And they help you.” → statement 3 đúng.', theory:'Evidence trực tiếp khớp gần như nguyên ý.', example:'help you ↔ they help you', adaptation:{ sourceResponseType:'circle_all_correct_statements', adaptedResponseType:'binary_mcq_per_statement' } }),
      mcq({ id:'g6-u3-wb-d3-04', prompt:'4. A good friend always likes the same things as you.', stimulus:{ title:'Interview với Miss Hong', text:D2_INTERVIEW }, options:[['A','Đúng theo Miss Hong'],['B','Không đúng theo Miss Hong']], correct:'B', reason:'Miss Hong nói “Not necessarily” và bạn bè cũng cần respect the differences. Vậy không bắt buộc luôn thích giống nhau.', theory:'Not necessarily = không nhất thiết.', example:'similar interests are good, but differences are respected', adaptation:{ sourceResponseType:'circle_all_correct_statements', adaptedResponseType:'binary_mcq_per_statement' } }),
      mcq({ id:'g6-u3-wb-d3-05', prompt:'5. A good friend shares happy and sad times with you.', stimulus:{ title:'Interview với Miss Hong', text:D2_INTERVIEW }, options:[['A','Đúng theo Miss Hong'],['B','Không đúng theo Miss Hong']], correct:'A', reason:'Miss Hong nói bạn tốt luôn ở đó khi ta cần, “in good or bad times.” Ý này khớp với chia sẻ lúc vui và buồn.', theory:'good or bad times ≈ happy and sad times.', example:'paraphrase có thể khác chữ nhưng cùng nghĩa', adaptation:{ sourceResponseType:'circle_all_correct_statements', adaptedResponseType:'binary_mcq_per_statement' } })
    ])
  }),
  e1: freeze({
    preLessonTheory: theories.e1,
    items: freeze([
      classification({
        id:'g6-u3-wb-e1-01',
        prompt:`Read Phuc's entry, then put parts (a), (b), (c), (d) next to Beginning, Middle, End.\n\n${E_SAMPLE}`,
        groups:[{ id:'beginning', label:'Beginning' },{ id:'middle', label:'Middle' },{ id:'end', label:'End' }],
        tokens:[{ id:'a', text:'(a)', correctGroupId:'beginning' },{ id:'b', text:'(b)', correctGroupId:'middle' },{ id:'c', text:'(c)', correctGroupId:'middle' },{ id:'d', text:'(d)', correctGroupId:'end' }],
        correctLabel:'Beginning: a · Middle: b, c · End: d',
        reason:'(a) giới thiệu Mai → Beginning. (b) và (c) kể chi tiết về Mai và hoạt động chung → Middle. (d) nói hy vọng tương lai → End.',
        theory:'Bài viết có thể nhìn như 3 nhiệm vụ: giới thiệu → phát triển chi tiết → kết lại.',
        example:'Beginning introduces; End closes the writing.'
      })
    ])
  }),
  e2: freeze({
    preLessonTheory: theories.e2,
    items: freeze([
      mcq({ id:'g6-u3-wb-e2-01', prompt:'1. Who is your best friend?', stimulus:{ title:"Phuc's writing", text:E_SAMPLE }, options:[['A','a'],['B','b'],['C','c'],['D','d']], correct:'A', reason:'Phần (a) giới thiệu ngay best friend là Mai.', theory:'Who? → tìm phần giới thiệu người.', example:'My best friend is ...' }),
      mcq({ id:'g6-u3-wb-e2-02', prompt:'2. Why do you like him / her?', stimulus:{ title:"Phuc's writing", text:E_SAMPLE }, options:[['A','a'],['B','b'],['C','c'],['D','d']], correct:'C', reason:'Phần (c) nói “I also like her because ...” và Mai giúp Phuc nhiều → lý do Phuc thích Mai.', theory:'Why do you like...? → tìm because/lý do.', example:'I like her because ...' }),
      mcq({ id:'g6-u3-wb-e2-03', prompt:'3. What is he / she like?', stimulus:{ title:"Phuc's writing", text:E_SAMPLE }, options:[['A','a'],['B','b'],['C','c'],['D','d']], correct:'B', reason:'Phần (b) có clever, hard-working, funny → tính cách.', theory:'be like → personality.', example:'kind, funny, hard-working' }),
      mcq({ id:'g6-u3-wb-e2-04', prompt:'4. What does he / she look like?', stimulus:{ title:"Phuc's writing", text:E_SAMPLE }, options:[['A','a'],['B','b'],['C','c'],['D','d']], correct:'B', reason:'Phần (b) có pretty, short black hair, big brown eyes → ngoại hình.', theory:'look like → appearance.', example:'hair / eyes / tall / short' }),
      mcq({ id:'g6-u3-wb-e2-05', prompt:'5. What does he / she like?', stimulus:{ title:"Phuc's writing", text:E_SAMPLE }, options:[['A','a'],['B','b'],['C','c'],['D','d']], correct:'B', reason:'Phần (b) nói Mai loves reading and writing short poems và thích jokes.', theory:'like → tìm sở thích.', example:'likes reading' }),
      mcq({ id:'g6-u3-wb-e2-06', prompt:'6. What do you often do together with him / her?', stimulus:{ title:"Phuc's writing", text:E_SAMPLE }, options:[['A','a'],['B','b'],['C','c'],['D','d']], correct:'C', reason:'Phần (c) kể do homework together, chat about astronomy, make a space minibook.', theory:'do together → hoạt động chung.', example:'We often study together.' }),
      mcq({ id:'g6-u3-wb-e2-07', prompt:'7. What is your hope for the future?', stimulus:{ title:"Phuc's writing", text:E_SAMPLE }, options:[['A','a'],['B','b'],['C','c'],['D','d']], correct:'D', reason:'Phần (d) bắt đầu bằng “I hope that in the future ...” → đúng câu hỏi về tương lai.', theory:'future/hope → tìm phần kết nói mong muốn.', example:'I hope we will ...' })
    ])
  }),
  e3: freeze({
    preLessonTheory: theories.e3,
    items: freeze([
      typing({ id:'g6-u3-wb-e3-01', prompt:'Now write your own entry for the “Your best friend” competition. Use these questions to guide you:\n1. Who is your best friend?\n2. Why do you like him / her?\n3. What is he / she like?\n4. What does he / she look like?\n5. What does he / she like?\n6. What do you often do together?\n7. What is your hope for the future?\n\nThe model on the previous page asks for about 70 words.', answer:'My best friend is Lan. She is kind and funny. She has long black hair and brown eyes. She likes reading. We often do our homework and play together. I like her because she always helps me. I hope we will still be best friends in the future.', open:true, reason:'Đây là bài viết cá nhân nên không có một đáp án duy nhất. Bài tốt nên có Beginning, Middle và End, đồng thời trả lời được phần lớn câu hỏi gợi ý của sách.', theory:'Viết từng khối nhỏ trước rồi nối lại; không cần cố viết 70 từ ngay từ câu đầu.', example:'Checklist: giới thiệu ✓ ngoại hình/tính cách ✓ sở thích/hoạt động ✓ lý do ✓ tương lai ✓' })
    ])
  })
});

export function getG6U3WorkbookContent(key) {
  const lesson = lessons[key];
  if (!lesson) throw new Error(`Unknown G6 U3 workbook lesson: ${key}`);
  return lesson;
}

export const g6U3WorkbookContentKeys = freeze(Object.keys(lessons));
