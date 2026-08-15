const freeze = value => Object.freeze(value);
const anytime = freeze({ access: 'anytime' });
const afterSubmit = freeze({ access: 'after_submit' });

const WH = freeze([
  freeze({ id: 'what', text: 'what' }),
  freeze({ id: 'when', text: 'when' }),
  freeze({ id: 'where', text: 'where' }),
  freeze({ id: 'how', text: 'how' }),
  freeze({ id: 'who', text: 'who' }),
  freeze({ id: 'how-often', text: 'how often' }),
  freeze({ id: 'how-many', text: 'how many' }),
  freeze({ id: 'how-much', text: 'how much' })
]);

const wordTypingUi = freeze({
  promptLabel: 'Thầy hỏi · WORD Việt → Anh',
  contextLabel: 'Tiếng Việt + vai trò trong bài',
  instruction: 'Con gõ từ tiếng Anh. Lý thuyết chỉ mở sau khi con submit.',
  inputLabel: 'Từ tiếng Anh của con',
  placeholder: 'Type the English word...'
});

const chunkTypingUi = freeze({
  promptLabel: 'Thầy hỏi · CHUNK Việt → Anh',
  contextLabel: 'Tiếng Việt + cụm dùng trong bài',
  instruction: 'Con gõ đúng cả cụm tiếng Anh. Lý thuyết chỉ mở sau khi con submit.',
  inputLabel: 'Cụm tiếng Anh của con',
  placeholder: 'Type the English chunk...'
});

const teaching = (correctLabel, reason, theory, example) => freeze({ correctLabel, reason, theory, example });
const qid = number => `g6u1-mlh-wh-q${String(number).padStart(2, '0')}`;

function whChoices(correctId, special = {}) {
  return freeze(WH.map(choice => freeze({
    ...choice,
    feedback: special[choice.id] ?? (choice.id === correctId
      ? 'Thầy: Đúng. Con đã match đúng loại thông tin với WH word.'
      : `Thầy: Chưa đúng. ${choice.text.toUpperCase()} hỏi một loại thông tin khác.`)
  })));
}

function mcq({ number, stage, prompt, choices, correctChoiceId, reason, theory, example, access = 'after_submit' }) {
  return freeze({
    id: qid(number), type: 'mcq', stage, prompt,
    choices: freeze(choices.map(choice => freeze({ ...choice }))),
    correctChoiceId,
    theorySupport: access === 'anytime' ? anytime : afterSubmit,
    teachingFeedback: teaching(
      choices.find(choice => choice.id === correctChoiceId)?.text ?? correctChoiceId,
      reason, theory, example
    )
  });
}

function typing({ number, stage, vi, en, reason, theory, example }) {
  return freeze({
    id: qid(number), type: 'typing', stage, vi, en,
    typingUi: stage === 'word' ? wordTypingUi : chunkTypingUi,
    theorySupport: afterSubmit,
    teachingFeedback: teaching(en, reason, theory, example)
  });
}

const FOUNDATION = [
  ['what', 'NỀN 1/8 · Khi muốn hỏi “gì / cái gì / môn học nào”, con dùng WH nào?', 'VẬT · NỘI DUNG · MÔN HỌC', 'WHAT = gì / cái gì. Dùng khi câu trả lời cho biết một vật, nội dung, môn học hoặc hoạt động.', 'What is your favourite subject? – Maths.'],
  ['when', 'NỀN 2/8 · Khi câu trả lời là một thời điểm như “At seven o’clock”, con dùng WH nào?', 'THỜI GIAN', 'WHEN = khi nào. Dùng để hỏi giờ, ngày, buổi hoặc thời điểm.', 'When does the first lesson begin? – At seven o’clock.'],
  ['where', 'NỀN 3/8 · Khi câu trả lời cho biết nơi chốn / địa điểm, con dùng WH nào?', 'NƠI CHỐN', 'WHERE = ở đâu. Dùng để hỏi nơi chốn hoặc địa điểm.', 'Where do you live? – I live on Nguyen Trai Street.'],
  ['how', 'NỀN 4/8 · Khi muốn hỏi “bằng cách nào / như thế nào”, con dùng WH nào?', 'CÁCH THỨC · TÌNH TRẠNG', 'HOW = như thế nào / bằng cách nào. Dùng để hỏi cách thức hoặc tình trạng/cảm nhận.', 'How do you go to school? – By bike. / How is your first day at school? – It’s great.'],
  ['who', 'NỀN 5/8 · Khi câu trả lời là một người, con dùng WH nào?', 'NGƯỜI', 'WHO = ai. Dùng khi thông tin cần hỏi là một người.', 'Who often helps you with your homework? – My sister.'],
  ['how-often', 'NỀN 6/8 · Khi câu trả lời là “Three times a week”, con dùng WH nào?', 'TẦN SUẤT', 'HOW OFTEN = bao lâu một lần / thường xuyên thế nào. Dùng để hỏi tần suất.', 'How often does Phong do judo? – Three times a week.'],
  ['how-many', 'NỀN 7/8 · Khi hỏi số lượng của danh từ đếm được như students, con dùng WH nào?', 'SỐ LƯỢNG ĐẾM ĐƯỢC', 'HOW MANY = bao nhiêu. Dùng với danh từ đếm được số nhiều: how many + plural noun.', 'How many students are there in your class? – Forty.'],
  ['how-much', 'NỀN 8/8 · Khi hỏi số tiền như pocket money, con dùng WH nào?', 'TIỀN · LƯỢNG KHÔNG ĐẾM ĐƯỢC', 'HOW MUCH = bao nhiêu / bao nhiêu tiền. Dùng với tiền hoặc lượng không đếm được.', 'How much pocket money do you get? – Ten thousand dongs.']
];

const INTENTS = [
  ['when', 'Thầy: Con muốn hỏi một tiết học bắt đầu KHI NÀO. Con dùng WH nào?', 'TIME → WHEN.', 'ANSWER MEANING → TIME → WHEN.', 'When does the first lesson begin?'],
  ['where', 'Thầy: Con muốn hỏi một người SỐNG Ở ĐÂU. Con dùng WH nào?', 'PLACE → WHERE.', 'ANSWER MEANING → PLACE → WHERE.', 'Where do you live?'],
  ['what', 'Thầy: Con muốn hỏi bạn MANG NHỮNG THỨ GÌ đến trường. Con dùng WH nào?', 'THING/CONTENT → WHAT.', 'ANSWER MEANING → THING/CONTENT → WHAT.', 'What do you usually bring to school?'],
  ['how', 'Thầy: Con muốn hỏi bạn ĐI HỌC BẰNG CÁCH NÀO. Con dùng WH nào?', 'MANNER → HOW.', 'ANSWER MEANING → MANNER → HOW.', 'How do you go to school?'],
  ['who', 'Thầy: Con muốn hỏi AI thường giúp bạn làm bài tập về nhà. Con dùng WH nào?', 'PERSON → WHO.', 'Đừng nhìn keyword gần chỗ trống rồi đoán. INTENDED INFORMATION → PERSON → WHO.', 'Who often helps you with your homework?'],
  ['how-often', 'Thầy: Con muốn hỏi Phong tập judo BAO NHIÊU LẦN MỖI TUẦN. Con dùng WH nào?', 'FREQUENCY → HOW OFTEN.', 'ANSWER MEANING → FREQUENCY → HOW OFTEN.', 'How often does Phong do judo?'],
  ['how-many', 'Thầy: Con muốn hỏi CÓ BAO NHIÊU HỌC SINH trong lớp. Con dùng WH nào?', 'COUNTABLE QUANTITY → HOW MANY.', 'ANSWER MEANING → COUNTABLE QUANTITY → HOW MANY.', 'How many students are there in your class?'],
  ['how-much', 'Thầy: Con muốn hỏi một bạn nhận được BAO NHIÊU TIỀN TIÊU VẶT. Con dùng WH nào?', 'MONEY → HOW MUCH.', 'ANSWER MEANING → MONEY → HOW MUCH.', 'How much pocket money do you get?']
];

const WORDS = [
  ['đầu tiên — từ chỉ thứ tự', 'first', 'first = đầu tiên.', 'first thường đứng trước noun: first lesson, first day.', 'the first lesson'],
  ['tiết học — danh từ số ít', 'lesson', 'lesson = một tiết học.', 'first + lesson → first lesson.', 'the first lesson'],
  ['bắt đầu — động từ', 'begin', 'begin = bắt đầu.', 'BRAIN v1.2 · Khi DOES đã làm marker trong câu hỏi, action core giữ BEGIN.', 'When does the first lesson begin?'],
  ['sống / cư trú — động từ', 'live', 'live = sống / cư trú.', 'YOU = SPECIAL → DO; ONE JOB giữ LIVE ở base form.', 'Where do you live?'],
  ['thường / thường hay — trạng từ tần suất', 'usually', 'usually = thường / thường hay.', 'Trong câu nguồn: do + you + usually + bring.', 'What do you usually bring to school?'],
  ['mang / đem theo — động từ', 'bring', 'bring = mang / đem theo.', 'Sau DO, action core BRING giữ base form.', 'bring to school'],
  ['sách giáo khoa — số nhiều', 'textbooks', 'textbooks = các sách giáo khoa.', 'Đây là đồ vật trong câu trả lời cho WHAT.', 'Textbooks, notebooks and pens.'],
  ['vở — số nhiều', 'notebooks', 'notebooks = các quyển vở.', 'notebooks là plural noun.', 'Textbooks, notebooks and pens.'],
  ['bút — số nhiều', 'pens', 'pens = các cây bút.', 'pens là plural noun.', 'Textbooks, notebooks and pens.'],
  ['giúp — động từ', 'help', 'help = giúp.', 'Chunk: help + somebody + with + something.', 'help you with your homework'],
  ['bài tập về nhà', 'homework', 'homework = bài tập về nhà.', 'homework thường là uncountable noun trong cách dùng này.', 'your homework'],
  ['yêu thích — tính từ', 'favourite', 'favourite = yêu thích.', 'favourite đứng trước noun: favourite subject.', 'your favourite subject'],
  ['môn học', 'subject', 'subject = môn học.', 'favourite subject là noun chunk.', 'What is your favourite subject?'],
  ['ngày', 'day', 'day = ngày.', 'first day = ngày đầu tiên.', 'first day at school'],
  ['làm / tập — động từ trong “do judo”', 'do', 'do là action core trong do judo.', 'BRAIN v1.2 · Phong = ONE → DOES làm marker; ONE JOB → DO judo.', 'How often does Phong do judo?'],
  ['học sinh — số nhiều', 'students', 'students = các học sinh.', 'students = MANY và là plural countable noun sau HOW MANY.', 'How many students...?'],
  ['lớp học', 'class', 'class = lớp học.', 'your class là noun chunk chỉ lớp của con.', 'in your class'],
  ['tiền', 'money', 'money = tiền.', 'money không đếm trực tiếp bằng HOW MANY; hỏi lượng tiền dùng HOW MUCH.', 'pocket money']
];

const CHUNKS = [
  ['tiết học đầu tiên', 'the first lesson', 'the first lesson = tiết học đầu tiên.', 'Whole Subject trong câu nguồn; core lesson = ONE.', 'When does the first lesson begin?'],
  ['bắt đầu lúc bảy giờ', 'begin at seven o’clock', 'begin at seven o’clock = bắt đầu lúc bảy giờ.', 'at seven o’clock = TIME → WHEN.', 'At seven o’clock.'],
  ['sống trên/phố Nguyễn Trãi', 'live on Nguyen Trai Street', 'Đây là cụm chỉ nơi sống.', 'Nguyen Trai Street = PLACE → WHERE.', 'I live on Nguyen Trai Street.'],
  ['mang đến trường', 'bring to school', 'bring to school = mang đến trường.', 'bring là action core; to school là place/direction tail.', 'What do you usually bring to school?'],
  ['sách giáo khoa, vở và bút', 'textbooks, notebooks and pens', 'Đây là danh sách đồ vật.', 'Danh sách THINGS → WHAT.', 'Textbooks, notebooks and pens.'],
  ['bằng xe đạp', 'by bike', 'by bike = bằng xe đạp.', 'MANNER/CÁCH THỨC → HOW.', 'How do you go to school? – By bike.'],
  ['giúp con làm bài tập về nhà', 'help you with your homework', 'Đúng chunk của bài.', 'help + somebody + with + something.', 'Who often helps you with your homework?'],
  ['môn học yêu thích của con/bạn', 'your favourite subject', 'favourite đứng trước subject.', 'Nội dung môn học được hỏi bằng WHAT.', 'What is your favourite subject?'],
  ['ngày đầu tiên ở trường', 'first day at school', 'first day at school = ngày đầu tiên ở trường.', 'Câu trả lời mô tả ngày đó như thế nào → HOW.', 'How is your first day at school?'],
  ['tập judo', 'do judo', 'do judo là action chunk.', 'Phong = ONE → DOES; ONE JOB → DO judo.', 'How often does Phong do judo?'],
  ['ba lần một tuần', 'three times a week', 'Đây là cụm chỉ tần suất.', 'FREQUENCY → HOW OFTEN.', 'Three times a week.'],
  ['học sinh trong lớp của con', 'students in your class', 'students là plural countable noun.', 'COUNTABLE QUANTITY → HOW MANY.', 'How many students are there in your class?'],
  ['tiền tiêu vặt', 'pocket money', 'pocket money = tiền tiêu vặt.', 'MONEY → HOW MUCH.', 'How much pocket money do you get?'],
  ['mười nghìn đồng', 'ten thousand dongs', 'Đây là một số tiền.', 'MONEY information → HOW MUCH.', 'Ten thousand dongs.']
];

const INFORMATION = [
  ['At seven o’clock.', 'time', [['time','TIME · thời gian'],['place','PLACE · nơi chốn'],['person','PERSON · người'],['thing','THING · đồ vật/nội dung']], 'TIME → WHEN.'],
  ['I live on Nguyen Trai Street.', 'place', [['time','TIME · thời gian'],['place','PLACE · nơi chốn'],['frequency','FREQUENCY · tần suất'],['money','MONEY · tiền']], 'PLACE → WHERE.'],
  ['Textbooks, notebooks and pens.', 'thing', [['thing','THING · đồ vật/nội dung'],['person','PERSON · người'],['manner','MANNER · cách thức'],['time','TIME · thời gian']], 'THING/CONTENT → WHAT.'],
  ['By bike.', 'manner', [['place','PLACE · nơi chốn'],['manner','MANNER · cách thức'],['frequency','FREQUENCY · tần suất'],['count','COUNTABLE QUANTITY · số lượng']], 'MANNER → HOW.'],
  ['My sister.', 'person', [['person','PERSON · người'],['frequency','FREQUENCY · tần suất'],['thing','THING · đồ vật/nội dung'],['place','PLACE · nơi chốn']], 'PERSON → WHO.'],
  ['Three times a week.', 'frequency', [['count','COUNTABLE QUANTITY · số lượng'],['frequency','FREQUENCY · tần suất'],['money','MONEY · tiền'],['time','TIME · thời điểm']], 'FREQUENCY → HOW OFTEN.'],
  ['Forty students.', 'count', [['money','MONEY · tiền'],['count','COUNTABLE QUANTITY · số lượng đếm được'],['manner','MANNER · cách thức'],['person','PERSON · người']], 'COUNTABLE QUANTITY → HOW MANY.'],
  ['Ten thousand dongs.', 'money', [['frequency','FREQUENCY · tần suất'],['money','MONEY · số tiền'],['count','COUNTABLE QUANTITY · số lượng'],['place','PLACE · nơi chốn']], 'MONEY → HOW MUCH.']
];

const SOURCE = [
  ['when', '_____ does the first lesson begin? – At seven o’clock.', 'At seven o’clock = TIME → WHEN.', 'WH BRAIN: ANSWER MEANING → TIME → WHEN. BRAIN v1.2: Whole Subject [the first lesson], core lesson = ONE → DOES; ONE JOB → BEGIN.', 'When does the first lesson begin? – At seven o’clock.', { where: 'WHERE hỏi nơi chốn, nhưng At seven o’clock là thời gian.', what: 'WHAT hỏi vật/nội dung; câu trả lời đang cho một thời điểm.' }],
  ['where', '_____ do you live? – I live on Nguyen Trai Street.', 'Nguyen Trai Street = PLACE → WHERE.', 'WH BRAIN: ANSWER MEANING → PLACE → WHERE. BRAIN v1.2: YOU = SPECIAL → DO; ONE JOB → LIVE.', 'Where do you live? – I live on Nguyen Trai Street.', { when: 'WHEN hỏi thời gian; Nguyen Trai Street là địa điểm.', how: 'HOW hỏi cách thức; câu trả lời cho biết nơi sống.' }],
  ['what', '_____ do you usually bring to school? – Textbooks, notebooks and pens.', 'Danh sách THINGS → WHAT.', 'WH BRAIN: ANSWER MEANING → THING/CONTENT → WHAT. BRAIN v1.2: YOU = SPECIAL → DO; ONE JOB → BRING.', 'What do you usually bring to school? – Textbooks, notebooks and pens.', { who: 'WHO hỏi người; textbooks, notebooks and pens là đồ vật.', where: 'WHERE hỏi nơi chốn; câu trả lời không phải địa điểm.' }],
  ['how', '_____ do you go to school? – By bike.', 'By bike = MANNER → HOW.', 'WH BRAIN: ANSWER MEANING → MANNER → HOW. BRAIN v1.2: YOU = SPECIAL → DO → GO.', 'How do you go to school? – By bike.', { where: 'Câu không hỏi con đi ĐẾN ĐÂU; By bike cho biết đi BẰNG CÁCH NÀO → HOW.', when: 'WHEN hỏi thời gian; By bike không phải thời gian.' }],
  ['who', '_____ often helps you with your homework? – My sister.', 'My sister = PERSON → WHO. Đừng bị chữ often kéo mắt.', 'WH BRAIN: ANSWER MEANING → PERSON → WHO. BRAIN v1.2: WHO tự làm Whole Subject: [Who] | often helps you with your homework? Đây là subject question nên không thêm DO/DOES trước WHO.', 'Who often helps you with your homework? – My sister.', { 'how-often': 'Đây là bẫy. Chữ often có sẵn, nhưng My sister là NGƯỜI, không phải tần suất → WHO.' }],
  ['what', '_____ is your favourite subject? – Maths.', 'Maths = SUBJECT/CONTENT → WHAT.', 'WH BRAIN: ANSWER MEANING → SUBJECT/CONTENT → WHAT. Câu hỏi dùng BE frame: What + is + your favourite subject?', 'What is your favourite subject? – Maths.', { who: 'WHO hỏi người; Maths là môn học.', how: 'HOW hỏi tình trạng/cách thức; ở đây hỏi môn học là GÌ.' }],
  ['how', '_____ is your first day at school? – Oh, it’s great.', 'It’s great = CONDITION/FEELING → HOW.', 'WH BRAIN: ANSWER MEANING → CONDITION/FEELING → HOW. BRAIN v1.2: [your first day at school], core day = ONE; AURA/BE frame match IS.', 'How is your first day at school? – Oh, it’s great.', { what: 'Câu không hỏi ngày đầu tiên là CÁI GÌ; It’s great cho biết ngày đó NHƯ THẾ NÀO → HOW.' }],
  ['how-often', '_____ does Phong do judo? – Three times a week.', 'Three times a week = FREQUENCY → HOW OFTEN.', 'WH BRAIN: ANSWER MEANING → FREQUENCY → HOW OFTEN. BRAIN v1.2: Phong = ONE → DOES; ONE JOB → DO judo.', 'How often does Phong do judo? – Three times a week.', { 'how-many': 'HOW MANY hỏi số lượng của noun đếm được. Three times a week là TẦN SUẤT → HOW OFTEN.', when: 'WHEN hỏi một thời điểm; Three times a week là tần suất lặp lại.' }],
  ['how-many', '_____ students are there in your class? – Forty.', 'students đếm được và Forty là số lượng → HOW MANY.', 'WH BRAIN: ANSWER MEANING → COUNTABLE QUANTITY → HOW MANY + plural noun. STANDARD GRAMMAR BOUNDARY: existential THERE dùng There is/are; không tạo Mindset hay “đệ tử” mới cho THERE.', 'How many students are there in your class? – Forty.', { 'how-much': 'students đếm được từng người → HOW MANY, không HOW MUCH.', 'how-often': 'HOW OFTEN hỏi tần suất; Forty là số lượng người.' }],
  ['how-much', '_____ pocket money do you get? – Ten thousand dongs.', 'Ten thousand dongs = MONEY → HOW MUCH.', 'WH BRAIN: ANSWER MEANING → MONEY → HOW MUCH. pocket money được xử lý như lượng tiền, không dùng HOW MANY.', 'How much pocket money do you get? – Ten thousand dongs.', { 'how-many': 'Không hỏi “how many pocket moneys”. Đây là lượng tiền → HOW MUCH.', 'how-often': 'HOW OFTEN hỏi tần suất; Ten thousand dongs là số tiền.' }]
];

const items = [];

FOUNDATION.forEach(([correct, prompt, info, theory, example], index) => {
  const special = Object.fromEntries(WH.map(choice => [choice.id, choice.id === correct
    ? `Thầy: Đúng. ${choice.text.toUpperCase()} match ${info}.`
    : `Thầy: Chưa đúng. Con đang học nhóm ${info}; xem Theory đang mở.`]));
  items.push(mcq({ number: index + 1, stage: 'foundation', prompt, choices: whChoices(correct, special), correctChoiceId: correct, reason: `Thầy: ${info} → ${WH.find(choice => choice.id === correct).text.toUpperCase()}.`, theory: `LÝ THUYẾT NỀN · ${theory}`, example, access: 'anytime' }));
});

INTENTS.forEach(([correct, prompt, reason, theory, example], index) => {
  items.push(mcq({ number: 9 + index, stage: 'intent', prompt, choices: whChoices(correct), correctChoiceId: correct, reason: `Thầy: ${reason}`, theory, example }));
});

WORDS.forEach(([vi, en, reason, theory, example], index) => {
  items.push(typing({ number: 17 + index, stage: 'word', vi: `Thầy: ${vi}. Con gõ từ tiếng Anh.`, en, reason: `Thầy: ${reason}`, theory, example }));
});

CHUNKS.forEach(([vi, en, reason, theory, example], index) => {
  items.push(typing({ number: 35 + index, stage: 'phrase', vi: `Thầy: ${vi}. Con gõ cả cụm tiếng Anh.`, en, reason: `Thầy: ${reason}`, theory, example }));
});

INFORMATION.forEach(([answer, correct, rawChoices, theory], index) => {
  const choices = rawChoices.map(([id, text]) => ({ id, text, feedback: id === correct ? `Thầy: Đúng. “${answer}” match ${text}.` : `Thầy: Chưa đúng. Đọc lại ý nghĩa “${answer}”.` }));
  items.push(mcq({ number: 49 + index, stage: 'information', prompt: `ANSWER → INFORMATION TYPE · “${answer}” thuộc loại thông tin nào?`, choices, correctChoiceId: correct, reason: `Thầy: ${choices.find(choice => choice.id === correct).text}.`, theory: `WH BRAIN · ${theory}`, example: answer }));
});

SOURCE.forEach(([correct, prompt, reason, theory, example, traps], index) => {
  const special = Object.fromEntries(WH.map(choice => [choice.id, choice.id === correct
    ? `Thầy: Đúng. ${reason}`
    : `Thầy: ${traps[choice.id] ?? `${choice.text.toUpperCase()} không match loại thông tin trong câu trả lời. Hãy dùng ANSWER MEANING → INFORMATION TYPE → WH.`}`]));
  items.push(mcq({ number: 57 + index, stage: 'source', prompt, choices: whChoices(correct, special), correctChoiceId: correct, reason: `Thầy: ${reason}`, theory, example }));
});

export const global6Unit1MlhWritingQuestionWords01Content = freeze({ items: freeze(items) });
