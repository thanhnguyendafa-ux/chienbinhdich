const freeze = values => Object.freeze([...(values ?? [])]);

const FEEDBACK = (correctLabel, reason, theory, example = correctLabel) => Object.freeze({
  correctLabel: String(correctLabel),
  reason: String(reason),
  theory: String(theory),
  example: String(example)
});

const MCQ = (id, prompt, choices, correctIndex, skill, feedback) => Object.freeze({
  id,
  type: 'mcq',
  prompt,
  choices: Object.freeze(choices.map((text, index) => Object.freeze({ id: `c${index + 1}`, text }))),
  correctChoiceId: `c${correctIndex + 1}`,
  skill,
  teachingFeedback: feedback
});

const TF = (id, statement, answer, skill, feedback) => Object.freeze({
  id, type: 'true_false', statement, answer, skill, teachingFeedback: feedback
});

const TYPING_UI = Object.freeze({
  extractSubject: Object.freeze({
    promptLabel: 'FIND SUBJECT', contextLabel: 'Câu', instruction: 'Gõ đúng chủ ngữ (Subject) của câu.',
    inputLabel: 'Subject', placeholder: 'Type the subject...'
  }),
  extractVerb: Object.freeze({
    promptLabel: 'FIND MAIN VERB', contextLabel: 'Câu', instruction: 'Gõ động từ chính (Main Verb), không gõ trợ động từ.',
    inputLabel: 'Main Verb', placeholder: 'Type the main verb...'
  }),
  correction: Object.freeze({
    promptLabel: 'FIX THE SENTENCE', contextLabel: 'Câu có lỗi', instruction: 'Gõ lại toàn bộ câu sau khi sửa đúng.',
    inputLabel: 'Câu đúng', placeholder: 'Type the corrected sentence...'
  }),
  boss: Object.freeze({
    promptLabel: 'BOSS · FULL REORDER', contextLabel: 'Từ/cụm bị xáo', instruction: 'Tự phân tích rồi gõ toàn bộ câu đúng.',
    inputLabel: 'Câu hoàn chỉnh', placeholder: 'Type the full sentence...'
  })
});

const TYPING = (id, vi, en, typingUi, skill, feedback, acceptedAnswers = []) => Object.freeze({
  id, type: 'typing', vi, en, acceptedAnswers: freeze(acceptedAnswers), typingUi, skill, teachingFeedback: feedback
});

const CLASSIFY = (id, prompt, groups, tokens, skill, feedback) => Object.freeze({
  id, type: 'classification', prompt,
  groups: Object.freeze(groups.map(group => Object.freeze({ ...group }))),
  tokens: Object.freeze(tokens.map(token => Object.freeze({ ...token }))),
  classificationKind: 'generic', skill, teachingFeedback: feedback
});

const ORDER = (id, prompt, tokens, correctOrder, skill, feedback) => Object.freeze({
  id, type: 'sentence_order', prompt, tokens: freeze(tokens), correctOrder: freeze(correctOrder),
  acceptedOrders: Object.freeze([freeze(correctOrder)]), skill, teachingFeedback: feedback
});

const items = [
  MCQ('gs67-sot-q01', 'They swim in the pool.\nĐây là loại câu gì?', ['Khẳng định', 'Phủ định', 'Nghi vấn', 'Mệnh lệnh'], 0, 'sentence_type', FEEDBACK('Khẳng định', 'Câu đang kể một sự việc; không có từ phủ định và không hỏi.', 'BƯỚC 1 → Xác định loại câu trước khi xếp.', 'They swim in the pool.')),
  TF('gs67-sot-q02', '“They don’t swim in the pool.” là câu phủ định.', true, 'sentence_type', FEEDBACK('TRUE', 'don’t = do not là dấu hiệu phủ định.', 'Nhìn tín hiệu don’t/doesn’t trước.', 'They don’t swim in the pool.')),
  MCQ('gs67-sot-q03', 'Do they swim in the pool?\nĐây là loại câu gì?', ['Khẳng định', 'Phủ định', 'Nghi vấn', 'Cảm thán'], 2, 'sentence_type', FEEDBACK('Nghi vấn', 'Do đứng đầu và có dấu ? → đây là câu hỏi Yes/No.', 'Câu hỏi với động từ thường: Do/Does + Subject + Main Verb ...?', 'Do they swim in the pool?')),
  TF('gs67-sot-q04', '“Lan likes music.” là câu khẳng định.', true, 'sentence_type', FEEDBACK('TRUE', 'Câu kể Lan thích âm nhạc.', 'Không có not và không có cấu trúc hỏi → câu khẳng định.', 'Lan likes music.')),
  MCQ('gs67-sot-q05', 'Does Lan like music?\nĐây là loại câu gì?', ['Phủ định', 'Nghi vấn', 'Khẳng định', 'Mệnh lệnh'], 1, 'sentence_type', FEEDBACK('Nghi vấn', 'Does đứng trước Subject Lan.', 'Does là tín hiệu rất mạnh của câu hỏi hiện tại đơn.', 'Does Lan like music?')),

  MCQ('gs67-sot-q06', 'Do they swim in the pool?\nChủ ngữ (Subject) là phần nào?', ['Do', 'they', 'swim', 'in the pool'], 1, 'find_subject', FEEDBACK('they', 'Do là trợ động từ; they mới là người thực hiện hành động swim.', 'Sau Do/Does trong câu hỏi thường là Subject.', 'Do + they + swim ...?')),
  TYPING('gs67-sot-q07', 'Does your brother play football?\nGõ chủ ngữ (Subject) của câu.', 'your brother', TYPING_UI.extractSubject, 'find_subject', FEEDBACK('your brother', 'Subject có thể là một cụm nhiều từ, không chỉ một từ.', 'Hỏi: Ai/cái gì thực hiện hành động?', 'Does [your brother] play football?'), ['Your brother']),
  MCQ('gs67-sot-q08', 'My sister doesn’t eat meat.\nChủ ngữ (Subject) là phần nào?', ['doesn’t', 'eat', 'My sister', 'meat'], 2, 'find_subject', FEEDBACK('My sister', 'doesn’t là cụm trợ động từ phủ định; My sister là Subject.', 'Câu phủ định vẫn bắt đầu từ Subject.', 'My sister + doesn’t + eat ...')),
  MCQ('gs67-sot-q09', 'Can Peter swim?\nChủ ngữ (Subject) là phần nào?', ['Can', 'Peter', 'swim', 'Can Peter'], 1, 'find_subject', FEEDBACK('Peter', 'Can là modal/helper; Peter là Subject.', 'Modal đứng trước Subject trong câu hỏi.', 'Can + Peter + swim?')),
  CLASSIFY('gs67-sot-q10', 'Phân loại từng mảnh của câu: Where do your friends play football?', [
    { id: 'wh', label: 'WH-word' }, { id: 'helper', label: 'Trợ động từ' }, { id: 'subject', label: 'Subject' }, { id: 'verb', label: 'Main Verb' }, { id: 'rest', label: 'Phần còn lại' }
  ], [
    { id: 't1', text: 'Where', correctGroupId: 'wh' }, { id: 't2', text: 'do', correctGroupId: 'helper' }, { id: 't3', text: 'your friends', correctGroupId: 'subject' }, { id: 't4', text: 'play', correctGroupId: 'verb' }, { id: 't5', text: 'football', correctGroupId: 'rest' }
  ], 'parse_roles', FEEDBACK('Where | do | your friends | play | football', 'Mỗi mảnh có một vai trò riêng.', 'WH + helper + Subject + Main Verb + rest.', 'Where do your friends play football?')),

  MCQ('gs67-sot-q11', 'They swim in the pool.\nĐộng từ chính (Main Verb) là từ nào?', ['They', 'swim', 'in', 'pool'], 1, 'find_main_verb', FEEDBACK('swim', 'swim mang nghĩa hành động chính.', 'Tìm hành động chính, không nhầm với Subject hay giới từ.', 'They [swim] in the pool.')),
  TF('gs67-sot-q12', 'Trong câu “They don’t swim in the pool.”, “don’t” là động từ chính.', false, 'helper_vs_main_verb', FEEDBACK('FALSE', 'don’t là do not, trợ động từ phủ định; swim mới là Main Verb.', 'Helper điều khiển cấu trúc; Main Verb mang hành động chính.', 'They don’t [swim] in the pool.')),
  MCQ('gs67-sot-q13', 'Do they swim in the pool?\nĐộng từ chính (Main Verb) là từ nào?', ['Do', 'they', 'swim', 'pool'], 2, 'helper_vs_main_verb', FEEDBACK('swim', 'Do chỉ giúp tạo câu hỏi; swim là hành động.', 'Do/Does không phải Main Verb trong mẫu câu hỏi này.', 'Do they [swim] ...?')),
  TYPING('gs67-sot-q14', 'Does Lan like music?\nGõ động từ chính (Main Verb).', 'like', TYPING_UI.extractVerb, 'helper_vs_main_verb', FEEDBACK('like', 'Does là helper; like là Main Verb.', 'Sau Does, Main Verb ở dạng nguyên mẫu.', 'Does Lan [like] music?')),
  CLASSIFY('gs67-sot-q15', 'Phân loại: Students should exercise every day.', [
    { id: 'subject', label: 'Subject' }, { id: 'helper', label: 'Helper / Modal' }, { id: 'verb', label: 'Main Verb' }, { id: 'time', label: 'Time' }
  ], [
    { id: 't1', text: 'Students', correctGroupId: 'subject' }, { id: 't2', text: 'should', correctGroupId: 'helper' }, { id: 't3', text: 'exercise', correctGroupId: 'verb' }, { id: 't4', text: 'every day', correctGroupId: 'time' }
  ], 'parse_roles', FEEDBACK('Students | should | exercise | every day', 'should là modal; exercise mới là hành động.', 'Statement với modal: Subject + modal + Main Verb + rest.', 'Students should exercise every day.')),

  MCQ('gs67-sot-q16', 'They swim in the do pool?\nVì sao câu này sai?', ['swim phải đứng cuối câu.', 'they phải đứng cuối câu.', 'do là trợ động từ hỏi nên phải đứng trước Subject “they”.', 'pool phải đứng trước in.'], 2, 'diagnose_aux_position', FEEDBACK('do phải đứng trước Subject', 'do bị đặt nhầm vào cụm “in the pool”.', 'Câu hỏi Yes/No → Do + Subject + Main Verb + rest.', 'Do they swim in the pool?')),
  MCQ('gs67-sot-q17', 'Lan likes does music?\nVì sao câu này sai?', ['music phải đứng đầu.', 'does là trợ động từ hỏi, không đặt giữa Main Verb và Object; phải đưa lên trước Subject.', 'likes phải đứng sau music.', 'Lan phải đứng cuối.'], 1, 'diagnose_aux_position', FEEDBACK('does phải lên trước Subject', 'does không phải một mảnh có thể chen tùy ý trong câu.', 'Muốn hỏi → Does + Subject + base verb + rest.', 'Does Lan like music?')),
  MCQ('gs67-sot-q18', 'Does Lan likes music?\nVì sao câu này vẫn sai?', ['Does phải đứng cuối.', 'Lan không được đứng sau Does.', 'Sau does, Main Verb phải là “like”, không phải “likes”.', 'music phải đứng trước Lan.'], 2, 'diagnose_base_verb', FEEDBACK('Does Lan like music?', 'Does đã mang dấu hiệu ngôi thứ ba số ít; Main Verb trở về nguyên mẫu.', 'Does + Subject + BASE VERB.', 'Does Lan like music?')),
  MCQ('gs67-sot-q19', 'Do swim they in the pool?\nLỗi nằm ở đâu?', ['Do phải đứng cuối.', 'Sau Do phải là Subject “they”, rồi mới đến Main Verb “swim”.', 'swim phải bỏ.', 'pool phải đứng đầu.'], 1, 'diagnose_subject_position', FEEDBACK('Do + they + swim', 'Subject và Main Verb đang bị đảo vị trí.', 'Do/Does + Subject + Main Verb.', 'Do they swim in the pool?')),
  MCQ('gs67-sot-q20', 'Where you do play football?\nVì sao sai?', ['Where phải đứng cuối.', 'football phải đứng trước play.', 'Trong WH-question: Where + do + Subject + Main Verb.', 'Không được dùng do.'], 2, 'diagnose_wh_frame', FEEDBACK('Where do you play football?', 'do phải đứng sau WH-word và trước Subject.', 'WH + do/does + Subject + Main Verb + rest.', 'Where do you play football?')),

  MCQ('gs67-sot-q21', 'Chọn câu sửa đúng cho: “They swim in the do pool?”', ['They do swim in the pool?', 'Do they swim in the pool?', 'They swim do in the pool?', 'Do swim they in the pool?'], 1, 'repair_aux_position', FEEDBACK('Do they swim in the pool?', 'Đưa Do lên trước Subject they.', 'Question frame: Do + S + V + rest?', 'Do they swim in the pool?')),
  MCQ('gs67-sot-q22', 'Chọn câu sửa đúng cho: “Does Lan likes music?”', ['Does Lan like music?', 'Lan does likes music?', 'Does like Lan music?', 'Does Lan music like?'], 0, 'repair_base_verb', FEEDBACK('Does Lan like music?', 'Giữ Does trước Subject và đổi likes → like.', 'Does + S + base V.', 'Does Lan like music?')),
  TYPING('gs67-sot-q23', 'Where you do live?\nGõ lại toàn bộ câu đúng.', 'Where do you live?', TYPING_UI.correction, 'repair_wh_frame', FEEDBACK('Where do you live?', 'WH-word đứng trước, rồi do, Subject, Main Verb.', 'Where + do + you + live?', 'Where do you live?')),
  TYPING('gs67-sot-q24', 'She doesn’t likes milk.\nGõ lại toàn bộ câu đúng.', 'She doesn’t like milk.', TYPING_UI.correction, 'repair_negative_base_verb', FEEDBACK('She doesn’t like milk.', 'Sau doesn’t, Main Verb dùng nguyên mẫu like.', 'S + doesn’t + base V + rest.', 'She doesn’t like milk.'), ["She doesn't like milk."]),

  Object.freeze({
    id: 'gs67-sot-q25', type: 'sequence_number',
    prompt: 'Hãy sắp xếp các bước em nên làm trước khi xếp một câu tiếng Anh.',
    lines: Object.freeze([
      Object.freeze({ id: 'v', text: 'Tìm động từ chính.' }),
      Object.freeze({ id: 'type', text: 'Xác định loại câu: khẳng định, phủ định hay nghi vấn.' }),
      Object.freeze({ id: 'rest', text: 'Dựng khung rồi sắp xếp phần còn lại.' }),
      Object.freeze({ id: 'subject', text: 'Tìm chủ ngữ.' }),
      Object.freeze({ id: 'helper', text: 'Tìm trợ động từ / từ tín hiệu nếu có.' })
    ]),
    correctOrder: freeze(['type', 'helper', 'subject', 'v', 'rest']),
    skill: 'name_strategy',
    teachingFeedback: FEEDBACK('1 Loại câu → 2 Helper → 3 Subject → 4 Main Verb → 5 Phần còn lại', 'Đây là quy trình giúp tránh xếp mò theo cảm giác.', 'PHÂN TÍCH TRƯỚC → SẮP XẾP SAU.', 'Loại câu → Helper → Subject → Main Verb → Rest')
  }),

  ORDER('gs67-sot-q26', 'Sắp xếp các mảnh thành câu đúng.', ['they', 'swim', 'Do', 'in the pool', '?'], ['Do', 'they', 'swim', 'in the pool', '?'], 'apply_yes_no_question', FEEDBACK('Do they swim in the pool?', 'Nhận câu hỏi → đưa Do lên trước Subject.', 'Do + S + V + Place + ?', 'Do they swim in the pool?')),
  ORDER('gs67-sot-q27', 'Sắp xếp các mảnh thành câu đúng.', ["doesn’t", 'junk food', 'eat', 'My sister'], ['My sister', 'doesn’t', 'eat', 'junk food'], 'apply_negative', FEEDBACK('My sister doesn’t eat junk food.', 'Câu phủ định: Subject trước, rồi doesn’t + base verb.', 'S + doesn’t + V + O.', 'My sister doesn’t eat junk food.')),
  ORDER('gs67-sot-q28', 'Sắp xếp các mảnh thành câu hỏi đúng.', ['your father', 'Does', 'to work', 'drive', '?'], ['Does', 'your father', 'drive', 'to work', '?'], 'apply_yes_no_question', FEEDBACK('Does your father drive to work?', 'Does đứng trước Subject; drive ở nguyên mẫu.', 'Does + S + base V + rest?', 'Does your father drive to work?')),
  ORDER('gs67-sot-q29', 'Sắp xếp các mảnh thành câu đúng.', ['usually', 'football', 'after school', 'plays', 'Nam'], ['Nam', 'usually', 'plays', 'football', 'after school'], 'apply_statement_order', FEEDBACK('Nam usually plays football after school.', 'Subject trước; trạng từ tần suất đứng trước động từ thường; time thường về cuối.', 'S + frequency adverb + V + O + Time.', 'Nam usually plays football after school.')),
  TYPING('gs67-sot-q30', 'after school / What / does / your brother / usually / do / ?\nTự phân tích rồi gõ toàn bộ câu đúng.', 'What does your brother usually do after school?', TYPING_UI.boss, 'independent_transfer', FEEDBACK('What does your brother usually do after school?', 'Tự chạy đủ: Question → WH → helper → Subject → adverb → Main Verb → Time.', 'WH + does + S + frequency + base V + Time?', 'What does your brother usually do after school?'))
];

export const gs67SentenceOrderThinkingContent = Object.freeze({ items: Object.freeze(items) });
