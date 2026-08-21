const freeze = value => Object.freeze(value);
const theorySupport = freeze({ access: 'after_submit' });

const THEORY_BY_TRAP = freeze({
  'V-CAT': 'Xác định đúng nhóm nghĩa: loại nhà, phòng, đồ nội thất/đồ vật. Không chọn chỉ vì một từ quen mắt.',
  'V-CTX': 'Một từ có thể đúng chủ đề nhưng vẫn sai vị trí. Kiểm tra nghĩa của cả câu và cụm từ đi cùng.',
  'V-REL': 'Hai từ đều có thể có trong Unit 2 nhưng vẫn ghép sai quan hệ. Phải giữ đúng hành động–đồ vật hoặc nơi chốn–đồ vật.',
  'G-THERE': 'There is + cụm danh từ số ít; There are + cụm danh từ số nhiều. Khi hỏi: Is there ...? / Are there ...?',
  'G-HAVE-THERE': 'Phân biệt chủ thể có gì với cấu trúc There is/There are. I + have; chủ thể số ít như My bedroom + has.',
  'G-PREP': 'Giới từ và cụm chỉ vị trí phải khớp đúng quan hệ: in, on, with, behind, next to, near, for.',
  'G-SUGGEST': 'How about + V-ing; Let’s + động từ nguyên mẫu không to. Hai mẫu đều là lời đề nghị nhưng dạng động từ khác nhau.',
  'G-DESC': 'Mô tả bằng be + tính từ; because nêu lý do; but nối hai ý tương phản; often thường đứng trước động từ thường.',
  'R-TF': 'True/False phải kiểm đúng chủ thể + chi tiết. Từ khóa có thật nhưng gắn sai phòng vẫn là sai.',
  'R-NUM-REL': 'Con số và chi tiết phải gắn đúng danh từ/đúng phòng đang được hỏi.',
  'R-WH': 'Xác định loại thông tin trước khi tìm đáp án: WHO hỏi người, WHERE hỏi nơi chốn, WHY hỏi lý do, HOW MANY hỏi số lượng.',
  'R-REF': 'Theo dõi mạch nghĩa để tìm từ được đại từ/thay thế nhắc lại. Không chọn máy móc danh từ đứng gần nhất.',
  'W-ORDER': 'Sắp xếp theo trật tự câu tiếng Anh và giữ các cụm cố định của Unit 2.',
  'W-ERROR': 'Không sửa một phần đang đúng. Xác định chính xác vị trí lỗi rồi mới sửa.',
  'W-REWRITE': 'Viết lại phải giữ đúng ý và đồng thời dùng đúng cấu trúc mới.',
  'W-VI-EN': 'Dịch Việt → Anh theo cấu trúc đích của Unit 2, không dịch từng từ theo thứ tự tiếng Việt.',
  'P-FINAL-S': 'Phân loại âm cuối -s theo nhóm /s/ và /z/ trong chính bộ từ của Unit 2.',
  'C-FUNCTION': 'Chọn câu đáp lại theo chức năng giao tiếp. Câu đề nghị cần một phản hồi phù hợp, không chỉ một cụm từ cùng chủ đề.',
  'M-EASY': 'Đọc đủ cả câu rồi xác định một lỗi nổi bật: từ, cấu trúc, quan hệ thông tin hoặc chức năng giao tiếp.',
  'M-MED': 'Thông tin có thể đúng trong transcript nhưng vẫn sai nếu bị gắn sang danh từ, phòng, câu hỏi hoặc ngữ cảnh khác.',
  'M-HARD': 'Câu đúng ngữ pháp hoặc nghe hợp lý ngoài đời chưa chắc là đáp án đúng. Phải khớp chính xác evidence và yêu cầu của câu hỏi.'
});

const MAI_HOUSE_CONTEXT = [
  'Mai lives in a townhouse in Hanoi with her parents.',
  'There are six rooms in the house: a living room, a kitchen, two bedrooms and two bathrooms.',
  'Mai loves the living room best because it is bright. It is next to the kitchen.',
  'Mai has her own bedroom. It is small but beautiful.',
  'There is a bed, a desk, a chair and a bookshelf.',
  'The bedroom also has a big window and a clock on the wall.',
  'Mai often reads books in her bedroom.'
].join(' ');

const NEW_FLAT_CONTEXT = [
  'The family is moving to a flat next month.',
  'There is a living room, three bedrooms, a kitchen and two bathrooms.'
].join(' ');

const SHOPPING_CONTEXT = [
  'They bought new bowls and chopsticks at a department store near the house.',
  'Two lamps are needed for the bedroom.'
].join(' ');

const COMMUNICATION_CONTEXT = [
  'How about putting a picture on the wall?',
  'Great idea.',
  "Let's go to the department store to buy one."
].join(' ');

const WRONG_FEEDBACK = 'Gói này chưa đúng hoàn toàn. Hãy kiểm đủ ba phần: chỗ sai, cách sửa và lý do. Đáp án đúng chưa được mở.';

function swap(text, left, right) {
  const source = String(text ?? '');
  if (!source.includes(left) && !source.includes(right)) return source;
  const marker = '§§SWAP§§';
  return source.replaceAll(left, marker).replaceAll(right, left).replaceAll(marker, right);
}

function mutatedReason(record) {
  const reason = record.correctDiagnosis.reason;
  switch (record.trapCode) {
    case 'V-CAT':
      return `${record.wrongResponse} mới là từ khác nhóm; các từ còn lại đều cùng category vì đều liên quan trực tiếp đến house.`;
    case 'V-CTX':
      return `${record.wrongResponse} và đáp án sửa đều thuộc Unit 2, nên chỉ cần cùng chủ đề là có thể thay cho nhau trong vị trí này.`;
    case 'V-REL':
      return `Các keyword trong ${record.wrongResponse} đều xuất hiện ở Unit 2, nên quan hệ giữa chúng không làm thay đổi đáp án.`;
    case 'G-THERE': {
      const target = /thành are\b/i.test(record.correctDiagnosis.repair) ? 'are' : 'is';
      return `Phải dùng ${target} vì danh từ chỉ nơi chốn ở cuối câu quyết định is/are, không phải cụm danh từ ngay sau there.`;
    }
    case 'G-HAVE-THERE':
      return `have/has và There is/There are đều có thể dịch là “có”, nên chỉ cần chọn cấu trúc có nghĩa gần nhất với tiếng Việt.`;
    case 'G-PREP':
      return `Các cụm vị trí trong Unit 2 đều mô tả nơi chốn, nên ${record.wrongResponse} vẫn có thể giữ nếu câu nghe tự nhiên.`;
    case 'G-SUGGEST':
      return `How about và Let's đều dùng để đề nghị, nên có thể giữ cùng dạng động từ cho cả hai mẫu.`;
    case 'G-DESC':
      return `Chỉ cần giữ đúng các từ mô tả trong Unit 2; be, connector và vị trí often không làm thay đổi cấu trúc đích.`;
    case 'R-TF':
      return `Statement dùng các từ có thật trong đoạn nên verdict ${record.wrongResponse} vẫn hợp lý, dù detail có thể thuộc một room khác.`;
    case 'R-NUM-REL':
      return `Con số/chi tiết ${record.wrongResponse} có thật trong transcript nên có thể gắn cho danh từ đang được hỏi.`;
    case 'R-WH':
      return `Đáp án ${record.wrongResponse} là thông tin thật trong đoạn nên vẫn dùng được dù WH-word đang hỏi loại thông tin khác.`;
    case 'R-REF':
      return `Đại từ hoặc từ thay thế thường trỏ về danh từ đứng gần nhất, nên ${record.wrongResponse} là lựa chọn an toàn hơn.`;
    case 'W-ORDER':
      return `Các từ đều đúng keyword Unit 2 nên thứ tự gần với tiếng Việt vẫn có thể chấp nhận.`;
    case 'W-ERROR':
      return `Phần bạn học sinh đã đánh dấu xuất hiện trong một câu sai, nên chính phần đó phải là lỗi cần sửa.`;
    case 'W-REWRITE':
      return `Rewrite chỉ cần giữ nghĩa gần giống; không cần giữ đúng marker và dạng từ của cấu trúc mới.`;
    case 'W-VI-EN':
      return `Dịch đúng các keyword chính là đủ; trật tự và marker có thể bám trực tiếp theo tiếng Việt.`;
    case 'P-FINAL-S':
      return swap(reason, '/s/', '/z/');
    case 'C-FUNCTION':
      return `Một response có cùng keyword/chủ đề với câu trước vẫn phù hợp, dù chức năng hội thoại khác.`;
    case 'M-EASY':
      return `Cách làm hiện tại vẫn dùng đúng keyword Unit 2, nên không cần kiểm thêm cấu trúc hoặc quan hệ thông tin.`;
    case 'M-MED':
      return `Thông tin ${record.wrongResponse} có thật trong Unit 2, nên có thể giữ dù đang được gắn sang noun/room/question khác.`;
    case 'M-HARD':
      return `Nếu câu đúng ngữ pháp và hợp lý ngoài đời thì có thể xem là đáp án đúng, dù transcript không xác nhận đúng quan hệ đó.`;
    default:
      return `Dữ kiện này có trong Unit 2 nên có thể giữ cách làm hiện tại.`;
  }
}

function secondNearMissReason(record) {
  switch (record.trapCode) {
    case 'V-CAT':
      return `Nhóm được xác định theo vị trí/từ quen trong list, không cần phân biệt room, furniture-object và home type.`;
    case 'V-CTX':
      return `${record.wrongResponse} có trong Unit 2 nên chỉ cần sửa phần ngữ pháp xung quanh là vẫn dùng được ở slot này.`;
    case 'V-REL':
      return `Hai keyword cùng thuộc Unit 2 nên chỉ cần giữ đúng từng từ; quan hệ giữa hai từ không quyết định đáp án.`;
    case 'G-THERE':
      return `is/are nên hòa hợp với danh từ chỉ nơi chốn ở cuối câu, không phải với cụm danh từ ngay sau there.`;
    case 'G-HAVE-THERE':
      return `Chỉ cần câu có một đồ vật/phòng thì có thể đổi giữa has/have và There is/There are mà không đổi khung câu.`;
    case 'G-PREP':
      return `near, next to, in, on, with và for đều chỉ quan hệ nên có thể thay nhau nếu hai danh từ vẫn giữ nguyên.`;
    case 'G-SUGGEST':
      return `Dạng động từ sau How about/Let's phụ thuộc vào từ đứng sau nó, không phụ thuộc vào mẫu đề nghị.`;
    case 'G-DESC':
      return `beautiful/bright/small là từ khóa chính; chỉ cần các tính từ đúng thì be/because/but có thể đổi cho nhau.`;
    case 'R-TF':
      return `Chỉ cần một nửa statement đúng với passage thì có thể giữ verdict ${record.wrongResponse}.`;
    case 'R-NUM-REL':
      return `Các con số trong cùng đoạn đều mô tả house/rooms nên có thể dùng chéo nếu câu hỏi cũng hỏi về phòng.`;
    case 'R-WH':
      return `WHO/WHERE/WHY chỉ giúp tìm vị trí trong passage; đáp án không bắt buộc phải cùng loại thông tin với WH-word.`;
    case 'R-REF':
      return `Chỉ cần referent là một noun đã xuất hiện trong câu hoặc câu trước thì đều có thể chấp nhận.`;
    case 'P-FINAL-S':
      return `Các từ đều có chữ -s ở cuối nên chỉ cần nhìn spelling, không cần so âm /s/ và /z/.`;
    case 'C-FUNCTION':
      return `Response đúng ngữ pháp và cùng chủ đề là đủ, không cần khớp speech function.`;
    default:
      return `Evidence ${record.sourceEvidence} có trong Unit 2, nhưng có thể áp trực tiếp cho cách làm hiện tại mà không cần kiểm quan hệ.`;
  }
}

function candidateFromQuestion(record) {
  const source = String(record.originalQuestion ?? '');
  if (record.trapCode === 'V-CAT') {
    const line = source.split('\n').at(-1) ?? '';
    const candidates = line.split('·').map(value => value.trim()).filter(Boolean);
    const haystack = `${record.wrongResponse} ${record.correctDiagnosis.repair}`.toLowerCase();
    return candidates.find(candidate => !haystack.includes(candidate.toLowerCase())) ?? null;
  }
  if (record.trapCode === 'P-FINAL-S') {
    const known = ['lamps', 'sinks', 'flats', 'toilets', 'cupboards', 'sofas', 'kitchens', 'rooms'];
    const candidates = known.filter(word => source.toLowerCase().includes(word));
    const haystack = `${record.wrongResponse} ${record.correctDiagnosis.repair}`.toLowerCase();
    return candidates.find(candidate => !haystack.includes(candidate.toLowerCase())) ?? null;
  }
  return null;
}

function thirdCandidate(record) {
  const fromQuestion = candidateFromQuestion(record);
  if (fromQuestion) return fromQuestion;
  const pools = {
    'G-PREP': ['on the wall', 'next to the kitchen', 'near the house', 'in Hanoi', 'with my parents', 'behind you', 'for my bedroom'],
    'G-SUGGEST': ['put', 'putting', 'to put', 'go', 'going', 'to go', 'buy', 'buying'],
    'R-NUM-REL': ['two', 'three', 'six', 'living room', 'bedroom', 'clock'],
    'R-WH': ['her parents', 'in Hanoi', 'in her bedroom', 'the living room', 'because it is bright', 'a clock', 'six', 'two'],
    'R-REF': ['living room', 'bedroom', 'kitchen', 'bowls and chopsticks', 'picture', 'department store'],
    'C-FUNCTION': ['Great idea.', 'On the wall.', 'A picture.', 'There is one.', "Let's go to the department store to buy one."],
    'P-FINAL-S': ['lamps', 'sinks', 'flats', 'toilets', 'cupboards', 'sofas', 'kitchens', 'rooms'],
    'M-EASY': ['two', 'six', 'living room', 'bedroom', 'her parents', 'in Hanoi', 'TRUE', 'FALSE', 'because', 'but'],
    'M-MED': ['two', 'three', 'six', 'living room', 'bedroom', 'her parents', 'in Hanoi', 'TRUE', 'FALSE', 'near', 'next to'],
    'M-HARD': ['TRUE', 'FALSE', 'two bedrooms', 'six rooms', 'living room', 'bedroom', 'her parents', 'in Hanoi', 'because it is bright']
  };
  const pool = pools[record.trapCode] ?? [];
  const haystack = `${record.wrongResponse} ${record.correctDiagnosis.repair}`.toLowerCase();
  return pool.find(candidate => !haystack.includes(candidate.toLowerCase())) ?? record.wrongResponse;
}

function alternativeRepairs(record) {
  const wrong = record.wrongResponse;
  switch (record.trapCode) {
    case 'G-THERE':
      return /thành are\b/i.test(record.correctDiagnosis.repair)
        ? ['đổi cụm danh từ sang số ít để giữ is', `giữ nguyên ${wrong}`]
        : ['đổi cụm danh từ sang số nhiều để giữ are', `giữ nguyên ${wrong}`];
    case 'G-SUGGEST': {
      const text = `${record.correctDiagnosis.error} ${record.correctDiagnosis.repair}`.toLowerCase();
      if (text.includes('put')) return ['đổi sang to put', `giữ nguyên ${wrong}`];
      if (text.includes('buy')) return ['đổi sang to buy', `giữ nguyên ${wrong}`];
      return ['đổi sang to go', `giữ nguyên ${wrong}`];
    }
    case 'W-ERROR':
      return ['sửa chính phần mà bạn học sinh đã đánh dấu', 'giữ nguyên câu và đổi một keyword khác'];
    case 'W-ORDER':
      return [`giữ nguyên thứ tự ${wrong}`, 'chỉ đổi vị trí một keyword nhưng giữ skeleton hiện tại'];
    case 'W-REWRITE':
      return [`giữ nguyên bản rewrite ${wrong}`, 'giữ marker của câu gốc thay vì đổi sang cấu trúc mới'];
    case 'W-VI-EN':
      return [`giữ nguyên bản dịch ${wrong}`, 'chỉ sửa một keyword nhưng giữ trật tự tiếng Việt'];
    case 'V-REL':
      return [`giữ nguyên quan hệ ${wrong}`, 'đổi một keyword nhưng giữ quan hệ hiện tại'];
    default: {
      const candidate = thirdCandidate(record);
      return [`đổi thành ${candidate}`, `giữ nguyên ${wrong}`];
    }
  }
}

function choice(id, role, error, repair, reason, correct = false) {
  const diagnostic = freeze({ role, error, repair, reason });
  return freeze({
    id,
    text: `Sai ở: ${error} → Sửa: ${repair} → Vì: ${reason}`,
    feedback: correct ? 'Đúng: cả chỗ sai, cách sửa và lý do đều khớp.' : WRONG_FEEDBACK,
    diagnostic
  });
}

function buildChoices(record) {
  const { error, repair, reason } = record.correctDiagnosis;
  const [wrongRepair, contextRepair] = alternativeRepairs(record);
  const nearMiss1 = mutatedReason(record);
  const nearMiss2 = secondNearMissReason(record);
  const contextReason = `Dữ kiện “${record.sourceEvidence}” là thật trong Unit 2, nhưng có thể gắn nó cho cách sửa này vì cùng chủ đề.`;
  const keepReason = `Cách làm ${record.wrongResponse} vẫn giữ được keyword chính của Unit 2 nên không cần đổi.`;

  return freeze([
    choice('correct', 'correct', error, repair, reason, true),
    choice('wrong-reason-1', 'wrong_reason', error, repair, nearMiss1),
    choice('wrong-reason-2', 'wrong_reason', error, repair, nearMiss2),
    choice('wrong-repair', 'wrong_repair', error, wrongRepair, reason),
    choice('context-swap', 'context_swap', error, contextRepair, contextReason),
    choice('keep-wrong', 'keep_wrong', error, `giữ nguyên ${record.wrongResponse}`, keepReason)
  ]);
}

function compactScenario(text) {
  return String(text ?? '')
    .replace(/^Bạn học sinh viết:\s*/i, '')
    .replace(/^Bạn học sinh chọn\/viết:\s*/i, '')
    .replace(/^Bạn học sinh xử lý câu sau như một câu đề nghị:\s*/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function readingContext(record) {
  const text = `${record.originalQuestion} ${record.sourceEvidence}`.toLowerCase();
  if (record.trapCode === 'R-NUM-REL' && text.includes('new flat')) return NEW_FLAT_CONTEXT;
  if (record.trapCode === 'R-REF' && (text.includes('them') || text.includes('bowls') || text.includes('chopsticks'))) return SHOPPING_CONTEXT;
  if (record.trapCode === 'R-REF' && (text.includes('buy one') || text.includes(' one') || text.includes('picture'))) return COMMUNICATION_CONTEXT;
  return MAI_HOUSE_CONTEXT;
}

function buildPrompt(record) {
  const scenario = compactScenario(record.originalQuestion);
  const exactNote = record.exactCorpusRequired
    ? ' Yêu cầu của item này: bám đúng wording/quan hệ trong transcript Unit 2.'
    : '';
  return `Đề/tình huống: ${scenario} | Bạn học sinh đã chọn/viết: ${record.wrongResponse} ❌. ${record.diagnosisPrompt}${exactNote}`;
}

function buildStimulus(record) {
  if (!String(record.trapCode).startsWith('R-')) return null;
  return freeze({
    title: record.examType,
    promptLabel: 'ĐỌC DỮ KIỆN → CHỌN GÓI CHẨN ĐOÁN ĐÚNG',
    text: `${readingContext(record)}\n\nTÌNH HUỐNG: ${compactScenario(record.originalQuestion)}\nBẠN HỌC SINH CHỌN/VIẾT: ${record.wrongResponse} ❌`
  });
}

function buildTeachingFeedback(record, correctChoice) {
  const exactNote = record.exactCorpusRequired
    ? ' Đây là item khóa theo transcript: một câu khác có thể vẫn đúng tiếng Anh nhưng không phải đáp án/quan hệ đích.'
    : '';
  return freeze({
    correctLabel: correctChoice.text,
    reason: `Bạn học sinh trong tình huống sai ở ${record.correctDiagnosis.error}. Nên ${record.correctDiagnosis.repair} vì ${record.correctDiagnosis.reason}`,
    theory: `${THEORY_BY_TRAP[record.trapCode] ?? 'Kiểm tra đồng thời chỗ sai, cách sửa và lý do.'}${exactNote}`,
    example: record.sourceEvidence
  });
}

export function buildG6U2TrapLesson(lesson) {
  if (!lesson?.key || !Array.isArray(lesson.items) || lesson.items.length === 0) {
    throw new Error('G6 U2 Trap lesson source không hợp lệ.');
  }

  const items = lesson.items.map(record => {
    const choices = buildChoices(record);
    const correctChoice = choices.find(entry => entry.id === 'correct');
    const stimulus = buildStimulus(record);
    return freeze({
      id: record.id,
      type: 'mcq',
      prompt: stimulus ? record.diagnosisPrompt : buildPrompt(record),
      ...(stimulus ? { stimulus } : {}),
      choices,
      correctChoiceId: 'correct',
      trapCode: record.trapCode,
      examType: record.examType,
      sourceScope: record.sourceScope,
      sourceEvidence: record.sourceEvidence,
      exactCorpusRequired: record.exactCorpusRequired === true,
      diagnosticSpec: freeze({ ...record.correctDiagnosis }),
      theorySupport,
      teachingFeedback: buildTeachingFeedback(record, correctChoice)
    });
  });

  return freeze({ items: freeze(items) });
}
