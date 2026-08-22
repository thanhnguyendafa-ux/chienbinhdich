const freeze = value => Object.freeze(value);
const theorySupport = freeze({ access: 'anytime' });

const THEORY_BY_TRAP = freeze({
  'V-CAT': 'Nhìn nhóm nghĩa trước khi chọn: loại nhà, phòng hay đồ vật. Từ cùng Unit 2 chưa chắc cùng nhóm.',
  'V-CTX': 'Đọc cả câu, không nhìn một từ riêng. Chọn từ làm cho cả câu đúng nghĩa.',
  'V-REL': 'Hai từ phải đi với nhau đúng quan hệ. Đúng từng từ nhưng ghép sai vẫn là sai.',
  'G-THERE': 'Nhìn cụm danh từ sau there. There is dùng với một; There are dùng với nhiều. Khi hỏi: Is there ...? / Are there ...?',
  'G-HAVE-THERE': 'have/has nói một người hoặc vật “có” gì. There is/are nói “có” một vật hay nhiều vật ở đâu đó.',
  'G-PREP': 'Giới từ cho biết quan hệ vị trí. Đọc đúng cặp: in, on, with, behind, next to, near, for.',
  'G-SUGGEST': 'How about + V-ing. Let’s + động từ nguyên mẫu không to. Hai mẫu đều dùng để đề nghị.',
  'G-DESC': 'is/are + tính từ để miêu tả. because nói lý do; but nối hai ý trái nhau; often thường đứng trước động từ thường.',
  'R-TF': 'True/False phải đúng đủ người, phòng và chi tiết. Có vài từ giống bài chưa chắc câu đã đúng.',
  'R-NUM-REL': 'Mỗi con số phải đi với đúng danh từ. Đừng lấy một con số đúng rồi gắn sang chỗ khác.',
  'R-WH': 'Who hỏi người; Where hỏi nơi; Why hỏi lý do; How many hỏi số lượng. Xác định đề hỏi gì trước.',
  'R-REF': 'Với it, them, one: nhìn câu trước và ý đang nói để biết từ đó thay cho ai hoặc vật nào.',
  'W-ORDER': 'Câu tiếng Anh có thứ tự riêng. Giữ đúng cụm từ và xếp theo mẫu câu, không theo thứ tự tiếng Việt.',
  'W-ERROR': 'Tìm đúng chỗ sai rồi mới sửa. Không sửa một từ đang đúng chỉ vì cả câu đang sai.',
  'W-REWRITE': 'Câu viết lại phải giữ nguyên ý chính và dùng đúng mẫu mới.',
  'W-VI-EN': 'Dịch theo mẫu câu tiếng Anh. Không dịch từng từ rồi giữ nguyên thứ tự tiếng Việt.',
  'P-FINAL-S': 'Âm cuối -s trong Unit 2 có hai nhóm chính /s/ và /z/. So âm, không chỉ nhìn chữ viết.',
  'C-FUNCTION': 'Câu đề nghị cần câu đáp phù hợp. Cùng chủ đề nhưng sai cách đáp vẫn không đúng.',
  'M-EASY': 'Đọc hết câu và tìm một lỗi rõ nhất: từ, mẫu câu, số lượng hay quan hệ thông tin.',
  'M-MED': 'Một thông tin có thể đúng trong bài nhưng bị gắn nhầm người, phòng, số hoặc câu hỏi.',
  'M-HARD': 'Câu nghe tự nhiên chưa chắc đúng bài. Đáp án phải vừa đúng tiếng Anh vừa đúng dữ kiện đang hỏi.'
});

const THEORY_EXAMPLE_BY_TRAP = freeze({
  'V-CAT': 'flat/townhouse = loại nhà · bedroom = phòng · lamp = đồ vật',
  'V-CTX': 'a clock on the wall: đọc cả cụm để chọn từ đúng.',
  'V-REL': 'read books · a clock on the wall: đúng từ và đúng quan hệ.',
  'G-THERE': 'There is a bed. · There are two bathrooms.',
  'G-HAVE-THERE': 'I have a bedroom. · My bedroom has a window. · There are six rooms.',
  'G-PREP': 'in Hanoi · with parents · on the wall · next to the kitchen',
  'G-SUGGEST': 'How about putting a picture...? · Let’s go to the department store.',
  'G-DESC': 'small but beautiful · because it is bright · often reads books',
  'R-TF': 'Kiểm từng ý: đúng người + đúng phòng + đúng chi tiết.',
  'R-NUM-REL': 'six rooms và two bedrooms là hai thông tin khác nhau.',
  'R-WH': 'Who → người · Where → nơi · Why → lý do · How many → số',
  'R-REF': 'Tìm vật/người vừa được nói đến và xem câu sau còn nói về nó không.',
  'W-ORDER': 'There are + two bathrooms + in the flat.',
  'W-ERROR': 'There is two rooms. → kiểm lại is/are với two rooms.',
  'W-REWRITE': 'There is a window in my bedroom. ↔ My bedroom has a window.',
  'W-VI-EN': 'Tôi sống với bố mẹ. → I live with my parents.',
  'P-FINAL-S': '/s/: lamps, sinks, flats, toilets · /z/: cupboards, sofas, kitchens, rooms',
  'C-FUNCTION': 'How about ...? → Great idea.',
  'M-EASY': 'Bước 1: tìm lỗi. Bước 2: sửa. Bước 3: nói lý do.',
  'M-MED': 'Đúng dữ kiện chưa đủ; phải đúng dữ kiện của câu đang hỏi.',
  'M-HARD': 'Hỏi: câu này đúng dữ kiện bài hay chỉ nghe có vẻ hợp lý?'
});

const WRONG_REASON_ONE_BY_TRAP = freeze({
  'V-CAT': 'Các từ đều nói về nhà nên cùng nhóm.',
  'V-CTX': 'Từ có trong Unit 2 là dùng được.',
  'V-REL': 'Hai từ cùng Unit 2 nên ghép được.',
  'G-THERE': 'Nhìn từ cuối câu để chọn is/are.',
  'G-HAVE-THERE': 'Thấy nghĩa “có” thì luôn dùng have.',
  'G-PREP': 'Từ nào chỉ nơi chốn cũng dùng được.',
  'G-SUGGEST': "How about và Let's dùng cùng dạng động từ.",
  'G-DESC': 'Chỉ cần có từ miêu tả là câu đúng.',
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
  'V-CAT': 'Từ quen nhất thường là từ khác nhóm.',
  'V-CTX': 'Câu đúng ngữ pháp thì nghĩa nào cũng được.',
  'V-REL': 'Chỉ cần từng từ riêng đều đúng.',
  'G-THERE': 'Có số trong câu thì luôn dùng are.',
  'G-HAVE-THERE': 'Thấy nghĩa “có” thì luôn dùng There is.',
  'G-PREP': 'Các giới từ trong bài đổi cho nhau được.',
  'G-SUGGEST': 'Sau cả hai mẫu đều dùng to + V.',
  'G-DESC': 'because và but đổi cho nhau được.',
  'R-TF': 'Đúng một nửa câu là đủ.',
  'R-NUM-REL': 'Các số về phòng đổi cho nhau được.',
  'R-WH': 'Who/Where chỉ giúp tìm dòng trong bài.',
  'R-REF': 'Danh từ ở câu trước đều dùng được.',
  'W-ORDER': 'Đi theo thứ tự tiếng Việt là đúng.',
  'W-ERROR': 'Sửa từ đã khoanh là đủ.',
  'W-REWRITE': 'Giữ mẫu câu cũ cũng được.',
  'W-VI-EN': 'Giữ thứ tự tiếng Việt là đúng.',
  'P-FINAL-S': 'Từ có -s cuối đều đọc giống nhau.',
  'C-FUNCTION': 'Câu đúng ngữ pháp là trả lời được.',
  'M-EASY': 'Thấy một từ quen là có thể chọn.',
  'M-MED': 'Đúng một chi tiết là đủ.',
  'M-HARD': 'Câu nghe tự nhiên thì luôn đúng.'
});

const READING_TITLE_BY_TRAP = freeze({
  'R-TF': 'Đọc: Đúng hay Sai',
  'R-NUM-REL': 'Đọc: Số và chi tiết',
  'R-WH': 'Đọc: Đề đang hỏi gì?',
  'R-REF': 'Đọc: it / them / one'
});

function cleanRepair(text) {
  return String(text ?? '')
    .replace(/^chọn\/dùng\s+/i, 'chọn ')
    .replace(/^sửa thành\s+/i, 'đổi thành ')
    .trim();
}

function shortError(item) {
  const raw = String(item.diagnosticSpec?.error ?? '').trim();
  switch (item.trapCode) {
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

function shortRepair(item) {
  const raw = cleanRepair(item.diagnosticSpec?.repair);
  switch (item.trapCode) {
    case 'W-ORDER': return 'xếp lại đúng thứ tự';
    case 'W-REWRITE': return 'viết lại đúng mẫu';
    case 'W-VI-EN': return 'viết câu Anh đúng mẫu';
    case 'C-FUNCTION': return 'chọn câu đáp phù hợp';
    default: return raw.length <= 64 ? raw : 'đổi theo đúng bài';
  }
}

function targetThereForm(item) {
  const text = String(item.diagnosticSpec?.repair ?? '').toLowerCase();
  const replacement = text.match(/thành\s+(are|is)(?:\s+there)?\b/);
  if (replacement) return replacement[1];
  if (/dùng\s+are\b/.test(text)) return 'are';
  if (/dùng\s+is\b/.test(text)) return 'is';
  return null;
}

function itemQuestionText(item) {
  return `${item.prompt ?? ''} ${item.stimulus?.text ?? ''}`.toLowerCase();
}

function whMeaning(item) {
  const text = itemQuestionText(item);
  if (text.includes('how many')) return 'số lượng';
  if (/\bwho\b/.test(text)) return 'người';
  if (/\bwhere\b/.test(text)) return 'nơi chốn';
  if (/\bwhy\b/.test(text)) return 'lý do';
  if (text.includes('which room')) return 'phòng';
  if (/\bwhat\b/.test(text)) return 'đồ vật hoặc chi tiết';
  return 'đúng loại thông tin';
}

function correctReason(item) {
  const repair = String(item.diagnosticSpec?.repair ?? '').toLowerCase();
  const question = itemQuestionText(item);
  switch (item.trapCode) {
    case 'V-CAT': return 'Từ này khác nhóm với các từ còn lại.';
    case 'V-CTX': return 'Chỗ này cần đúng nghĩa của cả câu.';
    case 'V-REL': return 'Hai từ phải đi với nhau đúng nghĩa.';
    case 'G-THERE': return targetThereForm(item) === 'are' ? 'Cụm sau there là số nhiều.' : 'Cụm sau there là số ít.';
    case 'G-HAVE-THERE':
      if (/\bhas\b/.test(repair)) return 'Chủ ngữ số ít dùng has.';
      if (/\bhave\b/.test(repair)) return 'I/you/we/they dùng have.';
      if (repair.includes('there are')) return 'Câu nói có nhiều đồ vật hoặc phòng.';
      if (repair.includes('there is')) return 'Câu nói có một đồ vật hoặc phòng.';
      return 'Phải chọn đúng mẫu “có” của câu.';
    case 'G-PREP': return 'Từ chỉ vị trí phải đúng với bài.';
    case 'G-SUGGEST': return question.includes('how about') || /\bputting\b|\bgoing\b|\bbuying\b/.test(repair)
      ? 'Sau How about dùng V-ing.'
      : "Sau Let's dùng động từ nguyên mẫu.";
    case 'G-DESC':
      if (repair.includes('because')) return 'because dùng để nói lý do.';
      if (repair.includes('but')) return 'but nối hai ý trái nhau.';
      if (question.includes('often') || repair.includes('often')) return 'often đứng trước động từ thường.';
      return 'Tính từ đi sau is/are.';
    case 'R-TF': return 'Chi tiết này bị gắn nhầm người hoặc phòng.';
    case 'R-NUM-REL': return 'Số hoặc chi tiết này thuộc chỗ khác.';
    case 'R-WH': return `Đề đang hỏi ${whMeaning(item)}.`;
    case 'R-REF': return 'Phải nhìn mạch câu để tìm từ được nhắc lại.';
    case 'W-ORDER': return 'Tiếng Anh có thứ tự từ riêng.';
    case 'W-ERROR': return 'Phải sửa đúng chỗ sai.';
    case 'W-REWRITE': return 'Câu mới phải giữ đúng ý và đúng mẫu.';
    case 'W-VI-EN': return 'Tiếng Anh cần đúng mẫu và đúng thứ tự.';
    case 'P-FINAL-S':
      if (repair.includes('/s/')) return 'Từ này có âm cuối /s/.';
      if (repair.includes('/z/')) return 'Từ này có âm cuối /z/.';
      return 'Phải nghe đúng âm cuối của từ.';
    case 'C-FUNCTION': return 'Lời đề nghị cần câu đáp phù hợp.';
    case 'M-EASY': return 'Câu này có một lỗi rõ cần sửa.';
    case 'M-MED': return 'Thông tin đúng nhưng bị gắn nhầm chỗ.';
    case 'M-HARD': return 'Câu nghe đúng nhưng không đúng ý bài.';
    default: return 'Phải khớp đúng câu hỏi và đúng bài.';
  }
}

function wrongRepair(item) {
  switch (item.trapCode) {
    case 'G-THERE': return 'giữ is/are và đổi số';
    case 'G-SUGGEST': return 'dùng to + V';
    case 'W-ERROR': return 'sửa từ đã khoanh';
    case 'W-ORDER': return 'giữ thứ tự cũ';
    case 'W-REWRITE': return 'giữ mẫu câu cũ';
    case 'W-VI-EN': return 'giữ thứ tự tiếng Việt';
    case 'V-REL': return 'giữ cách ghép cũ';
    case 'C-FUNCTION': return 'chọn câu cùng chủ đề';
    default: return 'giữ cách làm cũ';
  }
}

function choice(id, role, error, repair, reason, correct = false) {
  const diagnostic = freeze({ role, error, repair, reason });
  return freeze({
    id,
    text: `Sai: ${error} · Sửa: ${repair} · Vì: ${reason}`,
    feedback: correct ? 'Đúng. Em đã tìm đúng lỗi và cách sửa.' : 'Chưa đúng. Xem lại: Sai – Sửa – Vì.',
    diagnostic
  });
}

function fourChoices(item, diagnosis) {
  const { error, repair, reason } = diagnosis;
  return freeze([
    choice('correct', 'correct', error, repair, reason, true),
    choice('wrong-reason-1', 'wrong_reason', error, repair, WRONG_REASON_ONE_BY_TRAP[item.trapCode] ?? 'Từ này có trong bài nên dùng được.'),
    choice('wrong-reason-2', 'wrong_reason', error, repair, WRONG_REASON_TWO_BY_TRAP[item.trapCode] ?? 'Cùng chủ đề là dùng được.'),
    choice('wrong-repair', 'wrong_repair', error, wrongRepair(item), reason)
  ]);
}

function learnerPrompt(item) {
  if (String(item.trapCode).startsWith('R-')) return 'Bạn này sai ở đâu? Chọn giải thích đúng.';
  return String(item.prompt ?? '')
    .replace(/^Đề\/tình huống:\s*/i, 'Đề: ')
    .replace(/Bạn học sinh đã chọn\/viết:/i, 'Bạn này làm:')
    .replace(/Bạn này sai ở đâu, nên sửa lại thế nào và vì sao\?/i, 'Vì sao sai?')
    .replace(/\s*Yêu cầu của item này: bám đúng wording\/quan hệ trong transcript Unit 2\./i, ' Phải đúng với bài đã học.')
    .trim();
}

function learnerStimulus(item) {
  if (!item.stimulus) return null;
  return freeze({
    ...item.stimulus,
    title: READING_TITLE_BY_TRAP[item.trapCode] ?? 'Đọc hiểu',
    promptLabel: 'ĐỌC BÀI → CHỌN GIẢI THÍCH ĐÚNG'
  });
}

export function presentG6U2TrapForGrade4(content) {
  if (!content?.items) throw new Error('G6 U2 Trap content không hợp lệ.');
  const items = content.items.map(item => {
    const diagnosis = freeze({
      error: shortError(item),
      repair: shortRepair(item),
      reason: correctReason(item)
    });
    const choices = fourChoices(item, diagnosis);
    const correctChoice = choices.find(entry => entry.id === 'correct');
    const exactNote = item.exactCorpusRequired ? ' Câu này phải đúng với bài đã học.' : '';
    const stimulus = learnerStimulus(item);
    return freeze({
      ...item,
      prompt: learnerPrompt(item),
      ...(stimulus ? { stimulus } : {}),
      choices,
      correctChoiceId: 'correct',
      diagnosticSpec: diagnosis,
      theorySupport,
      teachingFeedback: freeze({
        correctLabel: correctChoice.text,
        reason: `Sai: ${diagnosis.error}. Sửa: ${diagnosis.repair}. Vì: ${diagnosis.reason}`,
        theory: `${THEORY_BY_TRAP[item.trapCode] ?? 'Tìm lỗi, sửa đúng rồi nói lý do.'}${exactNote}`,
        example: THEORY_EXAMPLE_BY_TRAP[item.trapCode] ?? 'Đọc cả câu rồi kiểm lại mẫu câu và ý nghĩa.'
      })
    });
  });
  return freeze({ ...content, items: freeze(items) });
}
