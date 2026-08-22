const freeze = value => Object.freeze(value);
const theorySupport = freeze({ access: 'after_submit' });

const THEORY_BY_TRAP = freeze({
  'V-CAT': 'Nhìn nhóm từ: loại nhà, phòng hay đồ vật.',
  'V-CTX': 'Đọc cả câu rồi chọn từ đúng nghĩa.',
  'V-REL': 'Hai từ phải đi với nhau đúng nghĩa.',
  'G-THERE': 'There is dùng với một; There are dùng với nhiều.',
  'G-HAVE-THERE': 'Nhìn chủ ngữ và ý câu để chọn have/has hay There is/are.',
  'G-PREP': 'Từ chỉ vị trí phải đúng với vị trí trong bài.',
  'G-SUGGEST': 'How about + V-ing. Let’s + động từ thường.',
  'G-DESC': 'Tả đúng với be; because nói lý do; but nối hai ý trái nhau.',
  'R-TF': 'Đúng từ chưa đủ. Phải đúng người, đúng phòng và đúng chi tiết.',
  'R-NUM-REL': 'Mỗi con số phải đi với đúng đồ vật hoặc đúng phòng.',
  'R-WH': 'Who hỏi người; Where hỏi nơi; Why hỏi lý do; How many hỏi số.',
  'R-REF': 'Nhìn câu trước và câu sau để biết it/them/one nói về gì.',
  'W-ORDER': 'Tiếng Anh cần đúng thứ tự từ.',
  'W-ERROR': 'Tìm đúng chỗ sai rồi mới sửa.',
  'W-REWRITE': 'Câu mới phải giữ đúng ý và đúng mẫu.',
  'W-VI-EN': 'Dịch Việt → Anh theo đúng mẫu câu tiếng Anh.',
  'P-FINAL-S': 'Nghe âm cuối và chọn /s/ hoặc /z/.',
  'C-FUNCTION': 'Lời đề nghị cần một câu đáp phù hợp.',
  'M-EASY': 'Tìm một lỗi rõ nhất trong câu.',
  'M-MED': 'Thông tin có thể đúng nhưng bị gắn nhầm chỗ.',
  'M-HARD': 'Câu nghe hợp lý vẫn có thể không đúng ý bài.'
});

const WRONG_REASON_ONE_BY_TRAP = freeze({
  'V-CAT': 'Các từ đều nói về nhà nên cùng nhóm.',
  'V-CTX': 'Từ có trong Unit 2 là dùng được.',
  'V-REL': 'Hai từ cùng Unit 2 nên ghép được.',
  'G-THERE': 'Nhìn từ cuối câu để chọn is/are.',
  'G-HAVE-THERE': 'Thấy nghĩa “có” thì luôn dùng have.',
  'G-PREP': 'Từ nào chỉ nơi chốn cũng dùng được.',
  'G-SUGGEST': "How about và Let's dùng cùng dạng động từ.",
  'G-DESC': 'Chỉ cần có từ tả là câu đúng.',
  'R-TF': 'Có từ giống bài thì câu là đúng.',
  'R-NUM-REL': 'Con số có trong bài là dùng được.',
  'R-WH': 'Đáp án có trong bài là đủ.',
  'R-REF': 'Chọn danh từ đứng gần nhất.',
  'W-ORDER': 'Đủ từ là được, thứ tự không quan trọng.',
  'W-ERROR': 'Câu sai thì từ nào cũng có thể sửa.',
  'W-REWRITE': 'Chỉ cần nghĩa gần giống là được.',
  'W-VI-EN': 'Dịch đúng từng từ là đủ.',
  'P-FINAL-S': 'Chỉ nhìn chữ -s là biết âm.',
  'C-FUNCTION': 'Cùng chủ đề là trả lời được.',
  'M-EASY': 'Có từ đúng chủ đề thì không cần sửa.',
  'M-MED': 'Thông tin có trong bài thì dùng ở đâu cũng được.',
  'M-HARD': 'Câu đúng ngữ pháp thì luôn đúng đáp án.'
});

const WRONG_REASON_TWO_BY_TRAP = freeze({
  'V-CAT': 'Từ quen nhất là từ khác nhóm.',
  'V-CTX': 'Chỉ cần câu đúng ngữ pháp là đủ.',
  'V-REL': 'Chỉ cần từng từ riêng đều đúng.',
  'G-THERE': 'Có số trong câu thì luôn dùng are.',
  'G-HAVE-THERE': 'Thấy nghĩa “có” thì luôn dùng There is.',
  'G-PREP': 'Từ có trong bài thì đổi cho nhau được.',
  'G-SUGGEST': 'Sau hai mẫu đều dùng to + V.',
  'G-DESC': 'because và but đổi cho nhau được.',
  'R-TF': 'Đúng một nửa câu là đủ.',
  'R-NUM-REL': 'Các số về phòng có thể đổi cho nhau.',
  'R-WH': 'Who/Where chỉ giúp tìm dòng trong bài.',
  'R-REF': 'Danh từ ở câu trước đều dùng được.',
  'W-ORDER': 'Đi theo thứ tự tiếng Việt là đúng.',
  'W-ERROR': 'Sửa từ đã khoanh là đủ.',
  'W-REWRITE': 'Giữ mẫu câu cũ cũng được.',
  'W-VI-EN': 'Giữ thứ tự tiếng Việt là đúng.',
  'P-FINAL-S': 'Từ có -s cuối đều đọc giống nhau.',
  'C-FUNCTION': 'Câu đúng ngữ pháp là trả lời được.',
  'M-EASY': 'Chỉ cần thấy một từ quen là chọn.',
  'M-MED': 'Đúng một chi tiết là đủ.',
  'M-HARD': 'Câu nghe tự nhiên thì luôn đúng.'
});

const LIVING_ROOM = 'living room';
const HER_PARENTS = 'her parents';

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

const WRONG_FEEDBACK = 'Chưa đúng. Xem lại 3 phần: Sai – Sửa – Vì.';

function cleanRepair(text) {
  return String(text ?? '')
    .replace(/^chọn\/dùng\s+/i, 'chọn ')
    .replace(/^sửa thành\s+/i, 'đổi thành ')
    .trim();
}

function shortError(record) {
  const raw = String(record.correctDiagnosis.error ?? '').trim();
  switch (record.trapCode) {
    case 'W-ORDER': return 'thứ tự từ';
    case 'W-REWRITE': return 'cách viết lại';
    case 'W-VI-EN': return 'cách dịch';
    case 'C-FUNCTION': return 'câu trả lời';
    case 'V-REL': return raw.length <= 42 ? raw : 'cách ghép từ';
    case 'R-REF': return raw.length <= 42 ? raw : 'từ thay thế';
    case 'M-EASY':
    case 'M-MED':
    case 'M-HARD': return raw.length <= 42 ? raw : 'cách làm';
    default: return raw.length <= 54 ? raw : 'chỗ đã chọn';
  }
}

function shortRepair(record) {
  const raw = cleanRepair(record.correctDiagnosis.repair);
  switch (record.trapCode) {
    case 'W-ORDER': return 'xếp lại đúng thứ tự';
    case 'W-REWRITE': return 'viết lại đúng mẫu';
    case 'W-VI-EN': return 'viết câu Anh đúng mẫu';
    case 'C-FUNCTION': return 'chọn câu đáp phù hợp';
    default: return raw.length <= 64 ? raw : 'đổi theo đúng bài';
  }
}

function targetThereForm(record) {
  const text = String(record.correctDiagnosis.repair ?? '').toLowerCase();
  if (/thành are\b|\bare there\b|dùng are\b/.test(text)) return 'are';
  if (/thành is\b|\bis there\b|dùng is\b/.test(text)) return 'is';
  return null;
}

function whMeaning(record) {
  const text = String(record.originalQuestion ?? '').toLowerCase();
  if (text.includes('how many')) return 'số lượng';
  if (/\bwho\b/.test(text)) return 'người';
  if (/\bwhere\b/.test(text)) return 'nơi chốn';
  if (/\bwhy\b/.test(text)) return 'lý do';
  if (text.includes('which room')) return 'phòng';
  if (/\bwhat\b/.test(text)) return 'đồ vật hoặc chi tiết';
  return 'đúng loại thông tin';
}

function thereReason(record) {
  return targetThereForm(record) === 'are'
    ? 'Cụm sau there là số nhiều.'
    : 'Cụm sau there là số ít.';
}

function haveThereReason(record) {
  const repair = String(record.correctDiagnosis.repair ?? '').toLowerCase();
  if (/\bhas\b/.test(repair)) return 'Chủ ngữ số ít dùng has.';
  if (/\bhave\b/.test(repair)) return 'I/you/we/they dùng have.';
  if (repair.includes('there are')) return 'Câu nói có nhiều đồ vật hoặc phòng.';
  if (repair.includes('there is')) return 'Câu nói có một đồ vật hoặc phòng.';
  return 'Phải chọn đúng mẫu có trong câu.';
}

function suggestionReason(record) {
  const repair = String(record.correctDiagnosis.repair ?? '').toLowerCase();
  const question = String(record.originalQuestion ?? '').toLowerCase();
  return question.includes('how about') || /\bputting\b|\bgoing\b|\bbuying\b/.test(repair)
    ? 'Sau How about dùng V-ing.'
    : "Sau Let's dùng động từ thường.";
}

function descriptionReason(record) {
  const repair = String(record.correctDiagnosis.repair ?? '').toLowerCase();
  const question = String(record.originalQuestion ?? '').toLowerCase();
  if (repair.includes('because')) return 'because dùng để nói lý do.';
  if (repair.includes('but')) return 'but nối hai ý trái nhau.';
  if (question.includes('often') || repair.includes('often')) return 'often đứng trước động từ thường.';
  return 'Tính từ đi sau is/are.';
}

function pronunciationReason(record) {
  const repair = String(record.correctDiagnosis.repair ?? '').toLowerCase();
  if (repair.includes('/s/')) return 'Từ này có âm cuối /s/.';
  if (repair.includes('/z/')) return 'Từ này có âm cuối /z/.';
  return 'Phải nghe đúng âm cuối của từ.';
}

const CORRECT_REASON_BY_TRAP = freeze({
  'V-CAT': () => 'Từ này khác nhóm với các từ còn lại.',
  'V-CTX': () => 'Chỗ này cần đúng nghĩa của cả câu.',
  'V-REL': () => 'Hai từ phải đi với nhau đúng nghĩa.',
  'G-THERE': thereReason,
  'G-HAVE-THERE': haveThereReason,
  'G-PREP': () => 'Từ chỉ vị trí phải đúng với bài.',
  'G-SUGGEST': suggestionReason,
  'G-DESC': descriptionReason,
  'R-TF': () => 'Chi tiết này bị gắn nhầm người hoặc phòng.',
  'R-NUM-REL': () => 'Số hoặc chi tiết này thuộc chỗ khác.',
  'R-WH': record => `Đề đang hỏi ${whMeaning(record)}.`,
  'R-REF': () => 'Nhìn mạch câu để biết từ này nhắc lại gì.',
  'W-ORDER': () => 'Tiếng Anh có thứ tự từ riêng.',
  'W-ERROR': () => 'Phải sửa đúng chỗ sai, không sửa chỗ đang đúng.',
  'W-REWRITE': () => 'Câu mới phải giữ đúng ý và đúng mẫu.',
  'W-VI-EN': () => 'Tiếng Anh cần đúng mẫu và đúng thứ tự.',
  'P-FINAL-S': pronunciationReason,
  'C-FUNCTION': () => 'Đây là lời đề nghị nên cần câu đáp phù hợp.',
  'M-EASY': () => 'Câu này có một lỗi rõ cần sửa.',
  'M-MED': () => 'Thông tin đúng nhưng bị gắn nhầm chỗ.',
  'M-HARD': () => 'Câu nghe đúng nhưng không đúng ý bài.'
});

function correctReason(record) {
  const resolver = CORRECT_REASON_BY_TRAP[record.trapCode];
  return resolver ? resolver(record) : 'Phải khớp đúng câu hỏi và đúng bài.';
}

function wrongReasonOne(record) {
  return WRONG_REASON_ONE_BY_TRAP[record.trapCode] ?? 'Từ này có trong bài nên dùng được.';
}

function wrongReasonTwo(record) {
  return WRONG_REASON_TWO_BY_TRAP[record.trapCode] ?? 'Chỉ cần cùng chủ đề là được.';
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
    'R-NUM-REL': ['two', 'three', 'six', LIVING_ROOM, 'bedroom', 'clock'],
    'R-WH': [HER_PARENTS, 'in Hanoi', 'in her bedroom', 'the living room', 'because it is bright', 'a clock', 'six', 'two'],
    'R-REF': [LIVING_ROOM, 'bedroom', 'kitchen', 'bowls and chopsticks', 'picture', 'department store'],
    'C-FUNCTION': ['Great idea.', 'On the wall.', 'A picture.', 'There is one.'],
    'P-FINAL-S': ['lamps', 'sinks', 'flats', 'toilets', 'cupboards', 'sofas', 'kitchens', 'rooms'],
    'M-EASY': ['two', 'six', LIVING_ROOM, 'bedroom', HER_PARENTS, 'in Hanoi', 'TRUE', 'FALSE', 'because', 'but'],
    'M-MED': ['two', 'three', 'six', LIVING_ROOM, 'bedroom', HER_PARENTS, 'in Hanoi', 'TRUE', 'FALSE', 'near', 'next to'],
    'M-HARD': ['TRUE', 'FALSE', 'two bedrooms', 'six rooms', LIVING_ROOM, 'bedroom', HER_PARENTS, 'in Hanoi']
  };
  const pool = pools[record.trapCode] ?? [];
  const haystack = `${record.wrongResponse} ${record.correctDiagnosis.repair}`.toLowerCase();
  return pool.find(candidate => !haystack.includes(candidate.toLowerCase())) ?? 'một đáp án khác';
}

function alternativeRepairs(record) {
  switch (record.trapCode) {
    case 'G-THERE': return ['giữ is/are và đổi số', 'không sửa'];
    case 'G-SUGGEST': return ['dùng to + V', 'không sửa'];
    case 'W-ERROR': return ['sửa từ đã khoanh', 'đổi một từ khác'];
    case 'W-ORDER': return ['giữ thứ tự cũ', 'đổi một từ'];
    case 'W-REWRITE': return ['giữ câu viết lại', 'giữ mẫu cũ'];
    case 'W-VI-EN': return ['giữ bản dịch', 'đổi một từ'];
    case 'V-REL': return ['giữ cách ghép cũ', 'đổi một từ'];
    case 'C-FUNCTION': return ['chọn câu cùng chủ đề', 'không đổi câu đáp'];
    default: return [`chọn ${thirdCandidate(record)}`, 'không sửa'];
  }
}

function learnerDiagnosis(record) {
  return freeze({
    error: shortError(record),
    repair: shortRepair(record),
    reason: correctReason(record)
  });
}

function choice(id, role, error, repair, reason, correct = false) {
  const diagnostic = freeze({ role, error, repair, reason });
  return freeze({
    id,
    text: `Sai: ${error} · Sửa: ${repair} · Vì: ${reason}`,
    feedback: correct ? 'Đúng. Em đã tìm đúng chỗ sai, cách sửa và lý do.' : WRONG_FEEDBACK,
    diagnostic
  });
}

function buildChoices(record, diagnosis) {
  const { error, repair, reason } = diagnosis;
  const [wrongRepair, contextRepair] = alternativeRepairs(record);
  const contextReason = 'Từ này có trong bài nên dùng được.';
  const keepReason = 'Câu có từ đúng chủ đề nên không cần sửa.';

  return freeze([
    choice('correct', 'correct', error, repair, reason, true),
    choice('wrong-reason-1', 'wrong_reason', error, repair, wrongReasonOne(record)),
    choice('wrong-reason-2', 'wrong_reason', error, repair, wrongReasonTwo(record)),
    choice('wrong-repair', 'wrong_repair', error, wrongRepair, reason),
    choice('context-swap', 'context_swap', error, contextRepair, contextReason),
    choice('keep-wrong', 'keep_wrong', error, 'không sửa', keepReason)
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
  const exactNote = record.exactCorpusRequired ? ' Phải đúng với bài đã học.' : '';
  return `Đề: ${scenario} | Bạn này làm: ${record.wrongResponse} ❌. Chọn gói giải thích đúng.${exactNote}`;
}

function buildStimulus(record) {
  if (!String(record.trapCode).startsWith('R-')) return null;
  return freeze({
    title: record.examType,
    promptLabel: 'ĐỌC BÀI → CHỌN GIẢI THÍCH ĐÚNG',
    text: `${readingContext(record)}\n\nCÂU HỎI: ${compactScenario(record.originalQuestion)}\nBẠN NÀY CHỌN: ${record.wrongResponse} ❌`
  });
}

function buildTeachingFeedback(record, diagnosis, correctChoice) {
  const exactNote = record.exactCorpusRequired ? ' Câu này phải đúng với bài đã học.' : '';
  return freeze({
    correctLabel: correctChoice.text,
    reason: `Sai: ${diagnosis.error}. Sửa đúng: ${record.correctDiagnosis.repair}. Vì: ${diagnosis.reason}`,
    theory: `${THEORY_BY_TRAP[record.trapCode] ?? 'Xem đúng chỗ sai, cách sửa và lý do.'}${exactNote}`,
    example: record.sourceEvidence
  });
}

export function buildG6U2TrapLesson(lesson) {
  if (!lesson?.key || !Array.isArray(lesson.items) || lesson.items.length === 0) {
    throw new Error('G6 U2 Trap lesson source không hợp lệ.');
  }

  const items = lesson.items.map(record => {
    const diagnosis = learnerDiagnosis(record);
    const choices = buildChoices(record, diagnosis);
    const correctChoice = choices.find(entry => entry.id === 'correct');
    const stimulus = buildStimulus(record);
    return freeze({
      id: record.id,
      type: 'mcq',
      prompt: stimulus ? 'Bạn này sai ở đâu? Chọn gói giải thích đúng.' : buildPrompt(record),
      ...(stimulus ? { stimulus } : {}),
      choices,
      correctChoiceId: 'correct',
      trapCode: record.trapCode,
      examType: record.examType,
      sourceScope: record.sourceScope,
      sourceEvidence: record.sourceEvidence,
      exactCorpusRequired: record.exactCorpusRequired === true,
      diagnosticSpec: diagnosis,
      theorySupport,
      teachingFeedback: buildTeachingFeedback(record, diagnosis, correctChoice)
    });
  });

  return freeze({ items: freeze(items) });
}
