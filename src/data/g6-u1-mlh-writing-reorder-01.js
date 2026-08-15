const freeze = value => Object.freeze(value);
const theorySupport = freeze({ access: 'after_submit' });

const wordTypingUi = freeze({
  promptLabel: 'Thầy hỏi · TỪ ĐƠN',
  contextLabel: 'Tiếng Việt + từ loại',
  instruction: 'Con gõ chính xác từ tiếng Anh. Lý thuyết chỉ mở sau khi con submit.',
  inputLabel: 'Từ tiếng Anh của con',
  placeholder: 'Type the English word...'
});

const chunkTypingUi = freeze({
  promptLabel: 'Thầy hỏi · CỤM TỪ',
  contextLabel: 'Tiếng Việt + số từ',
  instruction: 'Con gõ đúng cả cụm theo đúng số từ Thầy cho. Lý thuyết chỉ mở sau khi con submit.',
  inputLabel: 'Cụm tiếng Anh của con',
  placeholder: 'Type the English chunk...'
});

const teaching = (correctLabel, reason, theory, example) => freeze({ correctLabel, reason, theory, example });
const appendBrain = (base, extra) => extra ? `${base} ${extra}` : base;

function withBrain(spec, brain = null) {
  if (!brain) return spec;
  const next = {
    ...spec,
    reason: appendBrain(spec.reason, brain.reason),
    theory: appendBrain(spec.theory, brain.theory)
  };
  if (Array.isArray(spec.choices) && brain.choices) {
    next.choices = spec.choices.map(choice => {
      if (Array.isArray(choice)) {
        const [id, text, feedback] = choice;
        return [id, text, appendBrain(feedback, brain.choices[id])];
      }
      return { ...choice, feedback: appendBrain(choice.feedback, brain.choices[choice.id]) };
    });
  }
  return next;
}

function typingItem(spec, index, stage) {
  const id = `g6u1-mlh-wr-q${String(index + 1).padStart(2, '0')}`;
  return freeze({
    id,
    type: 'typing',
    stage,
    vi: spec.vi,
    en: spec.en,
    typingUi: stage === 'word' ? wordTypingUi : chunkTypingUi,
    theorySupport,
    teachingFeedback: teaching(spec.en, spec.reason, spec.theory, spec.example)
  });
}

function mcqItem(spec, index) {
  const id = `g6u1-mlh-wr-q${String(index + 1).padStart(2, '0')}`;
  const choices = spec.choices.map((entry, choiceIndex) => freeze({
    id: entry.id ?? `c${choiceIndex + 1}`,
    text: entry.text,
    feedback: entry.feedback
  }));
  return freeze({
    id,
    type: 'mcq',
    stage: 'sentence',
    prompt: spec.prompt,
    choices: freeze(choices),
    correctChoiceId: spec.correctChoiceId,
    theorySupport,
    teachingFeedback: teaching(
      choices.find(choice => choice.id === spec.correctChoiceId)?.text ?? spec.correctChoiceId,
      spec.reason,
      spec.theory,
      spec.example
    )
  });
}

function orderItem(spec, index) {
  const id = `g6u1-mlh-wr-q${String(index + 1).padStart(2, '0')}`;
  return freeze({
    id,
    type: 'sentence_order',
    stage: 'sentence',
    prompt: spec.prompt,
    tokens: freeze([...spec.tokens]),
    displayOrder: freeze([...spec.tokens]),
    correctOrder: freeze([...spec.correctOrder]),
    acceptedOrders: freeze([freeze([...spec.correctOrder])]),
    theorySupport,
    teachingFeedback: teaching(spec.sentence, spec.reason, spec.theory, spec.example)
  });
}

const WORD_SPECS = [
  ['Thầy: thuộc trung học — tính từ (adj.). Con gõ từ tiếng Anh.', 'secondary', 'Thầy: Đúng rồi con. secondary là adjective dùng trước school.', 'secondary + school tạo thành secondary school.', 'secondary school'],
  ['Thầy: đầu tiên — từ chỉ thứ tự (ordinal adjective). Con gõ từ tiếng Anh.', 'first', 'Thầy: Đúng. first cho biết thứ tự số 1.', 'first thường đứng trước noun: first week, first day.', 'first week'],
  ['Thầy: tuần — danh từ (noun). Con gõ từ tiếng Anh.', 'week', 'Thầy: Đúng. week là danh từ chỉ một tuần.', 'week có thể đi với first: first week.', 'your first week'],
  ['Thầy: trường học — danh từ (noun). Con gõ từ tiếng Anh.', 'school', 'Thầy: Đúng. school là noun chỉ trường học.', 'school xuất hiện trong secondary school, at school, day of school.', 'at school'],
  ['Thầy: các tiết học — danh từ số nhiều (plural noun). Con gõ đúng dạng tiếng Anh.', 'lessons', 'Thầy: Đúng. lessons có -s vì đang nói nhiều tiết học.', 'How many thường đi với plural noun: how many lessons.', 'how many lessons'],
  ['Thầy: có — động từ (verb). Con gõ từ tiếng Anh.', 'have', 'Thầy: Đúng. have là main verb trong câu hỏi do you have... và phủ định do not have...', 'Sau do/don’t, main verb giữ nguyên mẫu: have.', 'do you have'],
  ['Thầy: thứ Sáu — danh từ riêng (proper noun). Con gõ đúng tiếng Anh.', 'Friday', 'Thầy: Đúng. Friday là tên ngày nên viết hoa.', 'Dùng on trước ngày trong tuần: on Friday.', 'on Friday'],
  ['Thầy: sáng tạo — tính từ (adj.). Con gõ từ tiếng Anh.', 'creative', 'Thầy: Đúng. creative là adjective miêu tả students.', 'Adjective đứng trước noun: creative students.', 'creative students'],
  ['Thầy: các học sinh — danh từ số nhiều (plural noun). Con gõ đúng dạng tiếng Anh.', 'students', 'Thầy: Đúng. students là plural noun.', 'some creative students là một subject noun phrase hoàn chỉnh.', 'some creative students'],
  ['Thầy: các bức tranh — danh từ số nhiều (plural noun). Con gõ đúng dạng tiếng Anh.', 'paintings', 'Thầy: Đúng. paintings là plural noun.', 'Trong câu nguồn, do paintings là verb + object chunk.', 'do paintings'],
  ['Thầy: mỹ thuật — danh từ (noun). Con gõ từ tiếng Anh.', 'art', 'Thầy: Đúng. art là noun dùng trong art club.', 'art + club tạo thành art club.', 'the art club'],
  ['Thầy: câu lạc bộ — danh từ (noun). Con gõ từ tiếng Anh.', 'club', 'Thầy: Đúng. club là noun.', 'in the art club là place phrase.', 'in the art club'],
  ['Thầy: tiếng Anh — danh từ riêng (proper noun). Con gõ đúng tiếng Anh.', 'English', 'Thầy: Đúng. English viết hoa.', 'English có thể bổ nghĩa cho classes: English classes.', 'English classes'],
  ['Thầy: các tiết/lớp học — danh từ số nhiều (plural noun). Con gõ đúng dạng tiếng Anh.', 'classes', 'Thầy: Đúng. classes là plural noun.', 'English classes là noun chunk.', 'English classes'],
  ['Thầy: hôm nay — trạng từ thời gian (time adverb). Con gõ từ tiếng Anh.', 'today', 'Thầy: Đúng. today cho biết thời gian.', 'today thường đứng cuối câu sau thông tin chính.', 'at school today'],
  ['Thầy: thường xuyên — trạng từ tần suất (frequency adverb). Con gõ từ tiếng Anh.', 'often', 'Thầy: Đúng. often là frequency adverb.', 'Trong câu phủ định với does not, often có thể đứng sau doesn’t và trước verb phrase.', "doesn't often go shopping"],
  ['Thầy: buổi chiều — danh từ (noun). Con gõ từ tiếng Anh.', 'afternoon', 'Thầy: Đúng. afternoon là noun chỉ buổi chiều.', 'in the afternoon là time phrase.', 'in the afternoon'],
  ['Thầy: hầu hết — từ chỉ số lượng (quantifier). Con gõ từ tiếng Anh.', 'most', 'Thầy: Đúng. most đứng trước plural noun.', 'most children là một subject noun phrase.', 'most children'],
  ['Thầy: trẻ em — danh từ số nhiều (plural noun). Con gõ từ tiếng Anh.', 'children', 'Thầy: Đúng. children là dạng số nhiều bất quy tắc của child.', 'most children là subject hoàn chỉnh.', 'Most children are excited.'],
  ['Thầy: hào hứng — tính từ (adj.). Con gõ từ tiếng Anh.', 'excited', 'Thầy: Đúng. excited là adjective chỉ cảm xúc.', 'Với be, ta có be + adjective: are excited.', 'Most children are excited.']
].map(([vi, en, reason, theory, example]) => ({ vi, en, reason, theory, example }));

const CHUNK_SPECS = [
  ['Thầy: trường trung học — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.', 'secondary school', 'Thầy: Đúng. Đây là một noun chunk tự nhiên.', 'secondary bổ nghĩa cho school.', 'at secondary school'],
  ['Thầy: tuần đầu tiên — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.', 'first week', 'Thầy: Đúng. first + week tạo một noun chunk.', 'ordinal + noun: first week.', 'first week'],
  ['Thầy: tuần đầu tiên của bạn — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.', 'your first week', 'Thầy: Đúng. your + first + week tạo subject noun phrase.', 'Possessive + ordinal + noun: your first week.', 'your first week'],
  ["Thầy: khung hỏi '... như thế nào?' với be — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.", 'how is', 'Thầy: Đúng. how is là phần mở đầu cho câu hỏi với be.', 'Câu hỏi với be: WH + be + subject.', 'How is your first week...?'],
  ['Thầy: bao nhiêu tiết học — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.', 'how many lessons', 'Thầy: Đúng. Đây là WH phrase hoàn chỉnh.', 'How many + plural noun tạo thành một khối hỏi số lượng.', 'How many lessons...?'],
  ['Thầy: bạn có...? — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.', 'do you have', 'Thầy: Đúng. Đây là question frame do + subject + verb.', 'Present Simple question: do + subject + base verb.', 'do you have'],
  ['Thầy: vào thứ Sáu — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.', 'on Friday', 'Thầy: Đúng. Đây là time phrase.', 'Dùng on với ngày trong tuần.', 'on Friday'],
  ['Thầy: một số học sinh sáng tạo — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.', 'some creative students', 'Thầy: Đúng. Đây là subject noun phrase.', 'Determiner + adjective + plural noun có thể tạo subject.', 'Some creative students...'],
  ['Thầy: làm/vẽ các bức tranh — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.', 'do paintings', 'Thầy: Đúng. Đây là verb + object chunk theo câu nguồn.', 'Khi dựng câu, hãy giữ verb phrase này thành một khối.', 'do paintings'],
  ['Thầy: trong câu lạc bộ mỹ thuật — cụm 4 từ. Con tự gõ đủ 4 từ tiếng Anh.', 'in the art club', 'Thầy: Đúng. Đây là place phrase.', 'Preposition + noun phrase thường đi sau core sentence.', 'in the art club'],
  ['Thầy: các tiết tiếng Anh — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.', 'English classes', 'Thầy: Đúng. English bổ nghĩa cho classes.', 'Noun modifier + plural noun tạo noun chunk.', 'English classes'],
  ['Thầy: ở trường hôm nay — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.', 'at school today', 'Thầy: Đúng. Đây là place + time tail.', 'Place/time information thường đi sau core sentence.', 'at school today'],
  ['Thầy: đi mua sắm — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.', 'go shopping', 'Thầy: Đúng. Đây là verb phrase cố định.', 'Sau does not, main verb vẫn ở base form: go.', "doesn't go shopping"],
  ['Thầy: vào buổi chiều — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.', 'in the afternoon', 'Thầy: Đúng. Đây là time phrase.', 'Dùng in với parts of the day: in the afternoon.', 'in the afternoon'],
  ['Thầy: hầu hết trẻ em — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.', 'most children', 'Thầy: Đúng. Đây là subject noun phrase.', 'Subject không nhất thiết chỉ là một từ; most children là một khối.', 'Most children...'],
  ['Thầy: ngày đầu tiên đi học — cụm 4 từ. Con tự gõ đủ 4 từ tiếng Anh.', 'first day of school', 'Thầy: Đúng. Đây là noun phrase.', 'on + the first day of school tạo time phrase hoàn chỉnh.', 'on the first day of school']
].map(([vi, en, reason, theory, example]) => ({ vi, en, reason, theory, example }));

const SENSE_CHOICES = freeze([
  freeze({ id: 'sense', text: 'MAKE SENSE — cụm tự nhiên và có thể dùng như một khối nghĩa.' }),
  freeze({ id: 'missing', text: 'THIẾU MẢNH — hướng ghép có lý nhưng còn thiếu thành phần bắt buộc.' }),
  freeze({ id: 'nonsense', text: 'NOT MAKE SENSE — thứ tự/quan hệ từ không tạo cụm tự nhiên.' })
]);

const SENSE_SPECS = [
  ['your first week', 'sense', 'Thầy: Đúng. your + first + week là noun chunk hoàn chỉnh.', 'Một chunk không cần là câu đầy đủ; chỉ cần tự nhiên và có chức năng rõ.', 'your first week'],
  ['how your first week', 'missing', 'Thầy: Đúng. Con có How + subject chunk nhưng còn thiếu be để thành câu hỏi.', 'Với câu hỏi How dùng be: How + is + subject... Không có is thì bộ khung bị thiếu.', 'How is your first week...?'],
  ['at secondary school', 'sense', 'Thầy: Đúng. at + secondary school tạo place phrase tự nhiên.', 'Preposition + noun phrase có thể tạo một chunk hoàn chỉnh.', 'at secondary school'],
  ['how many lessons', 'sense', 'Thầy: Đúng. How many + plural noun là WH phrase tự nhiên.', 'WH phrase có thể là một khối đứng đầu câu hỏi.', 'How many lessons...?'],
  ['do you have', 'sense', 'Thầy: Đúng. Đây là question frame hợp lệ: auxiliary + subject + main verb.', 'Chunk này có cấu trúc tự nhiên dù câu hoàn chỉnh có thể cần object/time.', 'do you have'],
  ['on how many Friday', 'nonsense', 'Thầy: Đúng. Cách ghép này không tạo time phrase hay WH phrase tự nhiên.', 'Đừng chỉ nhìn từng từ đúng; phải đọc cả cụm và kiểm quan hệ giữa chúng.', 'on Friday / how many lessons'],
  ['some creative students', 'sense', 'Thầy: Đúng. Đây là noun phrase có thể làm subject.', 'some + adjective + plural noun là một cấu trúc noun phrase hợp lệ.', 'Some creative students...'],
  ['creative do students', 'nonsense', 'Thầy: Đúng. adjective, auxiliary/verb và noun đang đứng sai quan hệ.', 'Đọc cụm lên và hỏi: adjective đang bổ nghĩa cho noun nào? verb đang có subject chưa?', 'creative students / students do...'],
  ['at school today', 'sense', 'Thầy: Đúng. Đây là place + time tail tự nhiên.', 'Một chunk có thể chứa hai mảnh thông tin liên tiếp: place rồi time.', 'at school today'],
  ["doesn't often go shopping", 'sense', 'Thầy: Đúng. Đây là predicate chunk tự nhiên, dù chưa phải câu hoàn chỉnh vì chưa có subject.', 'MAKE SENSE ở đây nghĩa là chunk hợp lệ. Câu hoàn chỉnh vẫn cần subject.', "She doesn't often go shopping..."]
].map(([candidate, correctChoiceId, reason, theory, example]) => ({ candidate, correctChoiceId, reason, theory, example }));

function senseChoices(spec) {
  return SENSE_CHOICES.map(choice => ({
    ...choice,
    feedback: choice.id === spec.correctChoiceId
      ? spec.reason
      : choice.id === 'sense'
        ? `Thầy: Chưa đúng. Con đọc lại “${spec.candidate}” và kiểm xem nó đã là một chunk tự nhiên chưa, hay còn thiếu/sai quan hệ.`
        : choice.id === 'missing'
          ? `Thầy: Chưa đúng. “${spec.candidate}” không nhất thiết chỉ thiếu một từ; con cần phân biệt thiếu mảnh với ghép sai hoàn toàn.`
          : `Thầy: Chưa đúng. “${spec.candidate}” có thể vẫn là một chunk hợp lệ; con hãy đọc theo từng khối nghĩa thay vì đòi nó phải là câu hoàn chỉnh.`
  }));
}

const SKELETON_SPECS = [
  {
    prompt: 'Câu 1: Muốn hỏi “Tuần đầu tiên của bạn ở trường trung học như thế nào?”, khối nào phải đứng đầu?',
    correctChoiceId: 'how',
    choices: [
      ['how', 'How', 'Thầy: Đúng. WH word How mở đầu câu hỏi này.'],
      ['subject', 'your first week', 'Thầy: Đây là subject chunk, nhưng trong câu hỏi với How nó không đứng trước How.'],
      ['place', 'at secondary school', 'Thầy: Đây là place phrase, thường đứng sau core question.'],
      ['be', 'is', 'Thầy: is phải đứng sau How, không đứng đầu khi câu đã có WH word.']
    ],
    reason: 'Thầy: How là WH word nên đứng đầu.', theory: 'Question with be: WH + be + subject + complement/place.', example: 'How | is | your first week | at secondary school?'
  },
  {
    prompt: 'Câu 1: Bộ xương nào đúng?', correctChoiceId: 'b',
    choices: [
      ['a', 'How + your first week + is + at secondary school?', 'Thầy: Subject đang chen trước be. Câu hỏi với be cần đảo be lên trước subject.'],
      ['b', 'How + is + your first week + at secondary school?', 'Thầy: Đúng. WH → be → subject → place.'],
      ['c', 'Is + how + your first week + at secondary school?', 'Thầy: Khi đã có How, How phải đứng đầu.'],
      ['d', 'Your first week + how + is + at secondary school?', 'Thầy: Đây không phải trật tự câu hỏi tiếng Anh.']
    ],
    reason: 'Thầy: Đúng skeleton là How + is + subject + place.', theory: 'WH question with be: WH → be → subject → rest.', example: 'How is your first week at secondary school?'
  },
  {
    prompt: 'Câu 2: WH phrase hoàn chỉnh là khối nào?', correctChoiceId: 'wh',
    choices: [
      ['wh', 'How many lessons', 'Thầy: Đúng. How many + plural noun phải được giữ thành một khối.'],
      ['how', 'How many', 'Thầy: Khối hỏi số lượng trong câu này còn cần noun lessons.'],
      ['subj', 'you', 'Thầy: you là subject, không phải WH phrase.'],
      ['time', 'on Friday', 'Thầy: Đây là time phrase.']
    ],
    reason: 'Thầy: How many lessons là WH phrase đầy đủ.', theory: 'How many + plural noun → auxiliary → subject → main verb.', example: 'How many lessons do you have on Friday?'
  },
  {
    prompt: 'Câu 2: Bộ xương câu hỏi nào đúng?', correctChoiceId: 'b',
    choices: [
      ['a', 'How many lessons + you + do + have + on Friday?', 'Thầy: Auxiliary do phải đứng trước subject you.'],
      ['b', 'How many lessons + do + you + have + on Friday?', 'Thầy: Đúng. WH phrase → auxiliary → subject → verb → time.'],
      ['c', 'Do + how many lessons + you + have + on Friday?', 'Thầy: Khi có WH phrase, WH phrase đứng đầu.'],
      ['d', 'How many lessons + have + you + do + on Friday?', 'Thầy: Main verb và auxiliary đang đảo sai vai trò.']
    ],
    reason: 'Thầy: Đúng skeleton là WH → do → subject → have → time.', theory: 'Present Simple WH question: WH phrase + do/does + subject + base verb + rest.', example: 'How many lessons do you have on Friday?'
  },
  {
    prompt: 'Câu 3: Ai thực hiện hành động “do paintings”? Chọn SUBJECT hoàn chỉnh.', correctChoiceId: 'subject',
    choices: [
      ['subject', 'Some creative students', 'Thầy: Đúng. Đây là noun phrase làm subject.'],
      ['students', 'students', 'Thầy: students là head noun nhưng đề còn có some + creative cùng thuộc subject.'],
      ['paintings', 'paintings', 'Thầy: paintings là object của do.'],
      ['club', 'the art club', 'Thầy: the art club nằm trong place phrase, không phải subject.']
    ],
    reason: 'Thầy: Subject đầy đủ là Some creative students.', theory: 'Subject có thể là một noun phrase nhiều từ, không chỉ một pronoun.', example: 'Some creative students | do paintings | in the art club.'
  },
  {
    prompt: 'Câu 3: Core sentence nào đã có SUBJECT + VERB + OBJECT đúng?', correctChoiceId: 'core',
    choices: [
      ['core', 'Some creative students + do + paintings', 'Thầy: Đúng. Subject → verb → object.'],
      ['a', 'Paintings + do + some creative students', 'Thầy: Object đang bị đặt thành subject.'],
      ['b', 'Do + some creative students + paintings', 'Thầy: Đây không phải câu hỏi; do ở đây là main verb nên không đứng đầu.'],
      ['c', 'Creative + paintings + do students', 'Thầy: Các từ không tạo đúng subject và predicate.']
    ],
    reason: 'Thầy: Core là Some creative students do paintings.', theory: 'Statement core: subject + main verb + object, rồi mới thêm place.', example: 'Some creative students do paintings in the art club.'
  },
  {
    prompt: 'Câu 4: SUBJECT là khối nào?', correctChoiceId: 'we',
    choices: [
      ['we', 'we', 'Thầy: Đúng. we là subject.'],
      ['classes', 'English classes', 'Thầy: Đây là object của have.'],
      ['school', 'at school', 'Thầy: Đây là place phrase.'],
      ['today', 'today', 'Thầy: Đây là time word.']
    ],
    reason: 'Thầy: we là subject thực hiện/không thực hiện hành động have.', theory: 'Hãy tìm “ai/cái gì” đứng trước predicate của câu statement.', example: "We don't have English classes at school today."
  },
  {
    prompt: 'Câu 4: Sau SUBJECT “we”, cụm phủ định nào phải đi ngay sau để tạo core đúng?', correctChoiceId: 'neg',
    choices: [
      ['neg', "don't + have", "Thầy: Đúng. we → don't → base verb have."],
      ['a', "have + don't", 'Thầy: Auxiliary negative phải đứng trước main verb.'],
      ['b', "don't + has", 'Thầy: Sau don’t, main verb phải ở base form have.'],
      ['c', 'not + have', 'Thầy: Present Simple negative cần auxiliary do: do not / don’t.']
    ],
    reason: "Thầy: We don't have... là core phủ định đúng.", theory: 'Present Simple negative: subject + do/does not + base verb.', example: "We | don't | have | English classes | at school | today."
  },
  {
    prompt: 'Câu 5: SUBJECT là gì?', correctChoiceId: 'she',
    choices: [
      ['she', 'she', 'Thầy: Đúng. she là subject.'],
      ['shopping', 'go shopping', 'Thầy: Đây là verb phrase.'],
      ['afternoon', 'the afternoon', 'Thầy: Đây là noun trong time phrase.'],
      ['often', 'often', 'Thầy: Đây là frequency adverb.']
    ],
    reason: 'Thầy: she là subject.', theory: 'Tìm người thực hiện hành động trước khi xếp auxiliary/adverb/verb.', example: "She doesn't often go shopping in the afternoon."
  },
  {
    prompt: 'Câu 5: Sau “She”, chuỗi predicate + time nào hợp lý nhất?', correctChoiceId: 'right',
    choices: [
      ['right', "doesn't + often + go shopping + in the afternoon", 'Thầy: Đúng. negative auxiliary → frequency → verb phrase → time.'],
      ['a', "often + doesn't + go shopping + in the afternoon", 'Thầy: Với câu nguồn này, doesn’t đứng trước often.'],
      ['b', "doesn't + often + goes shopping + in the afternoon", 'Thầy: Sau doesn’t phải dùng base verb go, không dùng goes.'],
      ['c', "go shopping + doesn't + often + in the afternoon", 'Thầy: Main verb không đứng trước auxiliary negative.']
    ],
    reason: "Thầy: Chuỗi đúng là doesn't often go shopping in the afternoon.", theory: 'Subject + does not + frequency adverb + base verb phrase + time.', example: "She doesn't often go shopping in the afternoon."
  },
  {
    prompt: 'Câu 6: SUBJECT hoàn chỉnh là khối nào?', correctChoiceId: 'most',
    choices: [
      ['most', 'Most children', 'Thầy: Đúng. most + children là subject noun phrase.'],
      ['children', 'children', 'Thầy: children là head noun nhưng most cũng thuộc subject.'],
      ['first', 'the first day', 'Thầy: Đây thuộc time phrase.'],
      ['school', 'school', 'Thầy: school nằm trong day of school, không phải subject.']
    ],
    reason: 'Thầy: Subject đầy đủ là Most children.', theory: 'Subject có thể chứa quantifier + noun: most children.', example: 'Most children | are | excited | on the first day of school.'
  },
  {
    prompt: 'Câu 6: Bộ xương nào đúng?', correctChoiceId: 'b',
    choices: [
      ['a', 'Most children + excited + are + on the first day of school.', 'Thầy: Với be + adjective, are phải đứng trước excited.'],
      ['b', 'Most children + are + excited + on the first day of school.', 'Thầy: Đúng. subject → be → adjective → time phrase.'],
      ['c', 'Are + most children + excited + on the first day of school.', 'Thầy: Đây sẽ là cấu trúc câu hỏi, nhưng câu nguồn là statement.'],
      ['d', 'On the first day + most children + school + are excited.', 'Thầy: Time phrase đang bị tách và school đứng sai quan hệ.']
    ],
    reason: 'Thầy: Đúng skeleton là subject + be + adjective + time.', theory: 'Statement with be: subject + be + complement/adjective + place/time.', example: 'Most children are excited on the first day of school.'
  }
];

const ORDER_SPECS = [
  {
    prompt: 'Câu 1 · FINAL REORDER: secondary / first / your / at / school / is / how / week?',
    tokens: ['secondary', 'first', 'your', 'at', 'school', 'is', 'how', 'week?'],
    correctOrder: ['how', 'is', 'your', 'first', 'week?', 'at', 'secondary', 'school'],
    sentence: 'How is your first week at secondary school?',
    reason: 'Thầy: Con đã ráp đúng WH → be → subject noun phrase → place.',
    theory: 'Không kéo ngẫu nhiên: nhận How, tìm is, giữ your first week thành subject chunk, rồi đặt at secondary school ở cuối.',
    example: 'How | is | your first week | at secondary school?'
  },
  {
    prompt: 'Câu 2 · FINAL REORDER: lessons / have / on / how many / you / do / Friday?',
    tokens: ['lessons', 'have', 'on', 'how many', 'you', 'do', 'Friday?'],
    correctOrder: ['how many', 'lessons', 'do', 'you', 'have', 'on', 'Friday?'],
    sentence: 'How many lessons do you have on Friday?',
    reason: 'Thầy: Con đã ráp đúng WH phrase → auxiliary → subject → main verb → time.',
    theory: 'Giữ how many + lessons thành WH phrase trước khi xử lý do + you + have.',
    example: 'How many lessons | do | you | have | on Friday?'
  },
  {
    prompt: 'Câu 3 · FINAL REORDER: art / paintings / creative students / the / some / do / in / club',
    tokens: ['art', 'paintings', 'creative students', 'the', 'some', 'do', 'in', 'club'],
    correctOrder: ['some', 'creative students', 'do', 'paintings', 'in', 'the', 'art', 'club'],
    sentence: 'Some creative students do paintings in the art club.',
    reason: 'Thầy: Con đã ráp subject → verb → object → place.',
    theory: 'Nhận subject chunk some creative students trước, rồi do paintings, cuối cùng in the art club.',
    example: 'Some creative students | do paintings | in the art club.'
  },
  {
    prompt: "Câu 4 · FINAL REORDER: school / at / English / we / have / classes / don't / today",
    tokens: ['school', 'at', 'English', 'we', 'have', 'classes', "don't", 'today'],
    correctOrder: ['we', "don't", 'have', 'English', 'classes', 'at', 'school', 'today'],
    sentence: "We don't have English classes at school today.",
    reason: 'Thầy: Con đã ráp đúng subject → negative auxiliary → base verb → object → place → time.',
    theory: "Sau don't dùng have, không dùng has. Giữ English classes thành noun chunk.",
    example: "We | don't have | English classes | at school | today."
  },
  {
    prompt: "Câu 5 · FINAL REORDER: in / go shopping / she / often / the afternoon / doesn't",
    tokens: ['in', 'go shopping', 'she', 'often', 'the afternoon', "doesn't"],
    correctOrder: ['she', "doesn't", 'often', 'go shopping', 'in', 'the afternoon'],
    sentence: "She doesn't often go shopping in the afternoon.",
    reason: 'Thầy: Con đã ráp đúng subject → negative auxiliary → frequency → verb phrase → time.',
    theory: "Sau doesn't dùng base verb go. go shopping được giữ thành một chunk.",
    example: "She | doesn't | often | go shopping | in the afternoon."
  },
  {
    prompt: 'Câu 6 · FINAL REORDER: children / first / on / most / school / excited / are / day / of / the',
    tokens: ['children', 'first', 'on', 'most', 'school', 'excited', 'are', 'day', 'of', 'the'],
    correctOrder: ['most', 'children', 'are', 'excited', 'on', 'the', 'first', 'day', 'of', 'school'],
    sentence: 'Most children are excited on the first day of school.',
    reason: 'Thầy: Con đã ráp đúng subject noun phrase → be → adjective → time phrase.',
    theory: 'Giữ most children thành subject và on the first day of school thành time phrase.',
    example: 'Most children | are | excited | on the first day of school.'
  }
];

const WORD_BRAIN = freeze({
  4: freeze({ theory: 'BRAIN v1.2 · lessons mang nghĩa MANY; đếm meaning trước khi nhìn chữ -s.' }),
  5: freeze({ theory: 'BRAIN v1.2 · ONE JOB: khi DO/DOES đã làm marker cho câu hỏi/phủ định, HAVE giữ base form.' }),
  8: freeze({ theory: 'BRAIN v1.2 · students là subject core kiểu MANY khi nằm trong Whole Subject như [some creative students].' }),
  18: freeze({ theory: 'BRAIN v1.2 · children = MANY dù không có -s: count the meaning, not the letter S.' }),
  19: freeze({ theory: 'BRAIN v1.2 · excited là AURA word; khi predicate là be + adjective, Whole Subject sẽ match với BE.' })
});

const CHUNK_BRAIN = freeze({
  5: freeze({ theory: 'BRAIN v1.2 · YOU = SPECIAL; câu hỏi HÀNH ĐỘNG Present Simple dùng DO. DO nhận ONE JOB nên HAVE giữ lõi.' }),
  7: freeze({ theory: 'BRAIN v1.2 · [some creative students] là Whole Subject; subject core students = MANY.' }),
  12: freeze({ theory: 'BRAIN v1.2 · go shopping là HÀNH ĐỘNG chunk; sau DOESN’T, GO không nhận thêm -s.' }),
  14: freeze({ theory: 'BRAIN v1.2 · [most children] là Whole Subject; core children = MANY dù hình thức không có -s.' })
});

const SENSE_BRAIN = freeze({
  1: freeze({
    reason: 'BRAIN v1.2 · Whole Subject là [your first week], core week = ONE; AURA/BE question cần host IS sau How.',
    theory: 'MINDSET → AURA/BE; WHOLE SUBJECT → [your first week]; COUNT → ONE; MATCH → IS. Vì thiếu host nên đây là THIẾU MẢNH.'
  }),
  4: freeze({
    theory: 'BRAIN v1.2 · YOU = SPECIAL → DO; DO nhận ONE JOB nên main verb HAVE ở base form.'
  }),
  7: freeze({
    reason: 'BRAIN v1.2 · [creative students] chưa được giữ thành noun chunk; DO chen vào giữa adjective và noun làm vỡ Whole Subject.',
    theory: 'Đây là CHUNK/SUBJECT ERROR chứ không phải chỉ thiếu một từ: creative phải đi với students, còn do thuộc Predicate.'
  }),
  9: freeze({
    theory: 'BRAIN v1.2 · Predicate hợp lệ: DOESN’T nhận marker cho subject ONE; ONE JOB giữ GO ở base form, often nằm giữa marker và action chunk.'
  })
});

const SKELETON_BRAIN = freeze({
  0: freeze({
    theory: 'BRAIN v1.2 · MINDSET là AURA/BE question. Whole Subject [your first week], core week = ONE nên host Present BE là IS.'
  }),
  1: freeze({
    reason: 'BRAIN v1.2 · Sau How, host IS đi trước Whole Subject [your first week].',
    theory: 'MINDSET AURA/BE → Whole Subject [your first week] → core week = ONE → MATCH IS → place tail.'
  }),
  2: freeze({
    theory: 'BRAIN v1.2 · How many lessons là một WH chunk; lessons mang nghĩa MANY nhưng chủ ngữ điều khiển auxiliary trong câu này là YOU.'
  }),
  3: freeze({
    reason: 'BRAIN v1.2 · YOU = SPECIAL nên Present Simple HÀNH ĐỘNG dùng DO.',
    theory: 'MINDSET HÀNH ĐỘNG → subject YOU = SPECIAL → marker DO → ONE JOB → HAVE giữ base form.',
    choices: freeze({
      a: 'BRAIN: subject YOU phải đứng sau marker DO.',
      d: 'BRAIN: HAVE là main verb; DO mới là marker đứng trước subject.'
    })
  }),
  4: freeze({
    reason: 'BRAIN v1.2 · Whole Subject phải lấy trọn [Some creative students].',
    theory: 'WHOLE SUBJECT → [Some creative students]; subject core → students; COUNT → MANY. Đừng chỉ khoanh một head noun rồi bỏ mất determiner/adjective.'
  }),
  5: freeze({
    reason: 'BRAIN v1.2 · [Some creative students] = MANY nên HÀNH ĐỘNG statement dùng base verb DO.',
    theory: 'MINDSET HÀNH ĐỘNG → Whole Subject [Some creative students] → core students = MANY → DO paintings. paintings là object, không điều khiển verb.'
  }),
  6: freeze({
    reason: 'BRAIN v1.2 · WE là SPECIAL và chạy DO-family trong Present Simple.',
    theory: 'Whole Subject WE → SPECIAL → HÀNH ĐỘNG negative dùng DO NOT/DON’T.'
  }),
  7: freeze({
    reason: 'BRAIN v1.2 · DON’T nhận ONE JOB, vì vậy HAVE phải trở về lõi.',
    theory: 'MINDSET HÀNH ĐỘNG → WE = SPECIAL → DON’T → ONE JOB → HAVE. Không đánh dấu Present Simple lần hai vào HAS.',
    choices: freeze({
      b: 'BRAIN v1.2 · DOUBLE MARKING: DON’T đã nhận nhiệm vụ rồi; HAS đánh dấu thêm lần hai nên sai. Dùng DON’T + HAVE.'
    })
  }),
  8: freeze({
    reason: 'BRAIN v1.2 · SHE là Whole Subject kiểu ONE.',
    theory: 'Whole Subject SHE → COUNT ONE. Với HÀNH ĐỘNG Present Simple negative, ONE sẽ gọi DOESN’T.'
  }),
  9: freeze({
    reason: 'BRAIN v1.2 · SHE = ONE → DOESN’T; ONE JOB → GO.',
    theory: 'MINDSET HÀNH ĐỘNG → SHE = ONE → DOESN’T → often → GO shopping → time. DOES đã nhận marker nên GO không thêm -s.',
    choices: freeze({
      b: 'BRAIN v1.2 · DOUBLE MARKING: DOESN’T đã mang dấu ONE/Present; GOES đánh dấu lần hai. ONE JOB → DOESN’T + GO.'
    })
  }),
  10: freeze({
    reason: 'BRAIN v1.2 · Whole Subject là [Most children], core children = MANY.',
    theory: 'COUNT THE MEANING, NOT THE LETTER S: children là plural bất quy tắc, nên [Most children] = MANY.'
  }),
  11: freeze({
    reason: 'BRAIN v1.2 · [Most children] = MANY và predicate excited là AURA nên match ARE.',
    theory: 'MINDSET AURA → Whole Subject [Most children] → core children = MANY → MATCH ARE → excited → time tail.',
    choices: freeze({
      a: 'BRAIN: AURA cần host BE trước adjective; MANY → ARE → excited.'
    })
  })
});

const ORDER_BRAIN = freeze({
  0: freeze({
    theory: 'BRAIN v1.2 · AURA/BE question: How → IS → Whole Subject [your first week] (core week = ONE) → place.'
  }),
  1: freeze({
    theory: 'BRAIN v1.2 · HÀNH ĐỘNG question: WH chunk → YOU = SPECIAL → DO → ONE JOB → HAVE → time.'
  }),
  2: freeze({
    theory: 'BRAIN v1.2 · Whole Subject [Some creative students] → core students = MANY → HÀNH ĐỘNG base DO → object → place.'
  }),
  3: freeze({
    theory: 'BRAIN v1.2 · WE = SPECIAL → DON’T; ONE JOB giữ HAVE ở base form. CUT: [We] | don’t have | English classes | at school | today.'
  }),
  4: freeze({
    theory: 'BRAIN v1.2 · SHE = ONE → DOESN’T; ONE JOB giữ GO ở base form. CUT: [She] | doesn’t often go shopping | in the afternoon.'
  }),
  5: freeze({
    theory: 'BRAIN v1.2 · MINDSET AURA → Whole Subject [Most children] → core children = MANY → ARE → excited. children là MANY dù không có -s.'
  })
});

const items = [];
WORD_SPECS.forEach((spec, index) => items.push(typingItem(withBrain(spec, WORD_BRAIN[index]), index, 'word')));
CHUNK_SPECS.forEach((spec, offset) => items.push(typingItem(withBrain(spec, CHUNK_BRAIN[offset]), 20 + offset, 'phrase')));
SENSE_SPECS.forEach((spec, offset) => {
  const enhanced = withBrain(spec, SENSE_BRAIN[offset]);
  items.push(mcqItem({
    prompt: `MAKE SENSE? Đọc cụm: “${enhanced.candidate}”. Con chọn mức chính xác nhất.`,
    choices: senseChoices(enhanced),
    correctChoiceId: enhanced.correctChoiceId,
    reason: enhanced.reason,
    theory: enhanced.theory,
    example: enhanced.example
  }, 36 + offset));
});
SKELETON_SPECS.forEach((spec, offset) => {
  const enhanced = withBrain(spec, SKELETON_BRAIN[offset]);
  items.push(mcqItem({
    ...enhanced,
    choices: enhanced.choices.map(([id, text, feedback]) => ({ id, text, feedback }))
  }, 46 + offset));
});
ORDER_SPECS.forEach((spec, offset) => items.push(orderItem(withBrain(spec, ORDER_BRAIN[offset]), 58 + offset)));

export const global6Unit1MlhWritingReorder01Content = freeze({ items: freeze(items) });
