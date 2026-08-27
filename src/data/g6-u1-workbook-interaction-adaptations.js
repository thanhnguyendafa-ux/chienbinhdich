const freeze = value => Object.freeze(value);

const choice = (id, text) => freeze({ id, text, preserveOrder: true });

function sentenceOrder(item, { correctOrder, tokens, acceptedOrders = [] }) {
  const { vi, en, acceptedAnswers, typingUi, responseMode, ...rest } = item;
  return freeze({
    ...rest,
    type: 'sentence_order',
    prompt: vi ?? item.prompt ?? '',
    tokens: freeze(tokens),
    correctOrder: freeze(correctOrder),
    ...(acceptedOrders.length ? { acceptedOrders: freeze(acceptedOrders.map(order => freeze(order))) } : {}),
    digitalAdaptation: freeze({
      sourceResponseType: 'written_sentence_from_cues',
      adaptedResponseType: 'sentence_order',
      reason: 'Bài kiểm tra trật tự/cấu trúc câu nên học sinh chọn và sắp khối thay vì phải gõ lại cả câu.'
    }),
    teachingFeedback: freeze({
      ...(item.teachingFeedback ?? {}),
      correctLabel: correctOrder.join(' ')
    })
  });
}

function closedTypingMcq(item, { options, correct, prompt }) {
  const { vi, en, acceptedAnswers, typingUi, responseMode, ...rest } = item;
  return freeze({
    ...rest,
    type: 'mcq',
    prompt: prompt ?? vi ?? item.prompt ?? '',
    choices: freeze(options.map(([id, text]) => choice(id, text))),
    correctChoiceId: correct,
    digitalAdaptation: freeze({
      sourceResponseType: 'closed_written_answer',
      adaptedResponseType: 'mcq',
      reason: 'Đáp án nguồn là đáp án đóng. Chuyển sang MCQ để học sinh tập trung vào kiến thức, không bị trừ vì khác cách gõ, viết hoa, dấu câu hoặc một biến thể hợp lý.'
    }),
    teachingFeedback: freeze({
      ...(item.teachingFeedback ?? {}),
      correctLabel: options.find(([id]) => id === correct)?.[1] ?? correct
    })
  });
}

function withSourceWordBank(item) {
  const bank = (item.choices ?? []).map(candidate => String(candidate.text));
  if (!bank.length) return item;
  return freeze({
    ...item,
    sourceWordBank: freeze(bank),
    sourceWordBankLabel: 'Từ / cụm từ cho sẵn',
    digitalAdaptation: freeze({
      ...(item.digitalAdaptation ?? {}),
      sourceResponseType: 'word_box_fill',
      adaptedResponseType: 'word_bank_choice',
      reason: 'Đề đã cho word box nên học sinh chọn trực tiếp từ bank thay vì phải gõ lại.'
    })
  });
}

function splitReadingPrompt(text) {
  const source = String(text ?? '');
  const cut = source.lastIndexOf('\n\n');
  if (cut < 0) return { passage: '', question: source };
  return { passage: source.slice(0, cut).trim(), question: source.slice(cut + 2).trim() };
}

function readingMcq(item, { options, correct }) {
  const { vi, en, acceptedAnswers, typingUi, responseMode, ...rest } = item;
  const { passage, question } = splitReadingPrompt(vi);
  return freeze({
    ...rest,
    type: 'mcq',
    prompt: question,
    stimulus: freeze({ title: 'D2 · Tom ở trường mới', promptLabel: 'Đọc hội thoại và chọn đáp án đúng', text: passage }),
    choices: freeze(options.map(([id, text]) => choice(id, text))),
    correctChoiceId: correct,
    digitalAdaptation: freeze({
      sourceResponseType: 'written_reading_answer',
      adaptedResponseType: 'mcq',
      reason: 'Câu đọc hiểu có đáp án đóng được chuyển sang lựa chọn có bẫy gần nghĩa để tránh tranh cãi do cách diễn đạt hoặc định dạng câu trả lời.'
    }),
    teachingFeedback: freeze({
      ...(item.teachingFeedback ?? {}),
      correctLabel: options.find(([id]) => id === correct)?.[1] ?? correct
    })
  });
}

const B3 = freeze({
  'g6-u1-wb-b3-01': freeze({ correct:'A', options:[['A','bench'],['B','desk'],['C','chair'],['D','board']] }),
  'g6-u1-wb-b3-02': freeze({ correct:'B', options:[['A','compasses'],['B','coloured pencils'],['C','notebooks'],['D','calculators']] }),
  'g6-u1-wb-b3-03': freeze({ correct:'A', options:[['A','bike / bicycle'],['B','bus'],['C','car'],['D','train']] }),
  'g6-u1-wb-b3-04': freeze({ correct:'C', options:[['A','notebook'],['B','textbook'],['C','dictionary'],['D','calculator']] }),
  'g6-u1-wb-b3-05': freeze({ correct:'B', options:[['A','dictionary'],['B','notebook'],['C','poster'],['D','pencil case']] }),
  'g6-u1-wb-b3-06': freeze({ correct:'D', options:[['A','compass'],['B','sharpener'],['C','ruler'],['D','calculator']] }),
  'g6-u1-wb-b3-07': freeze({ correct:'C', options:[['A','classroom'],['B','playground'],['C','library'],['D','canteen']] }),
  'g6-u1-wb-b3-08': freeze({ correct:'A', options:[['A','poster'],['B','board'],['C','map'],['D','notebook']] })
});

const B4 = freeze({
  'g6-u1-wb-b4-01': freeze({ correct:'A', options:[['A','finishes'],['B','finish'],['C','finishing'],['D','finished']] }),
  'g6-u1-wb-b4-02a': freeze({ correct:'A', options:[['A','Do'],['B','Does'],['C','Is'],['D','Are']] }),
  'g6-u1-wb-b4-02b': freeze({ correct:'B', options:[['A','writes'],['B','write'],['C','writing'],['D','wrote']] }),
  'g6-u1-wb-b4-03a': freeze({ correct:'B', options:[['A','Do'],['B','Does'],['C','Is'],['D','Has']] }),
  'g6-u1-wb-b4-03b': freeze({ correct:'A', options:[['A','like'],['B','likes'],['C','liking'],['D','liked']] }),
  'g6-u1-wb-b4-03c': freeze({ correct:'C', options:[['A','say'],['B','said'],['C','says'],['D','saying']] }),
  'g6-u1-wb-b4-04a': freeze({ correct:'A', options:[['A',"don't want"],['B',"doesn't want"],['C','not want'],['D',"didn't want"]] }),
  'g6-u1-wb-b4-04b': freeze({ correct:'B', options:[['A','stay'],['B','to stay'],['C','staying'],['D','stayed']] }),
  'g6-u1-wb-b4-05a': freeze({ correct:'A', options:[['A','wear'],['B','wears'],['C','wearing'],['D','wore']] }),
  'g6-u1-wb-b4-05b': freeze({ correct:'C', options:[['A','goes'],['B','went'],['C','go'],['D','going']] }),
  'g6-u1-wb-b4-06a': freeze({ correct:'C', options:[['A','to spend'],['B','spending'],['C','Cả A và B đều được chấp nhận'],['D','spent']] }),
  'g6-u1-wb-b4-06b': freeze({ correct:'D', options:[['A','go'],['B','goes'],['C','gone'],['D','went']] })
});

const B6 = freeze({
  'g6-u1-wb-b6-01': freeze({ correctOrder:['My grandmother','is','always','at home','in the evening'], tokens:['always','are','in the evening','My grandmother','at home','is'] }),
  'g6-u1-wb-b6-02': freeze({ correctOrder:['I','usually','celebrate','my birthday','with my friends'], tokens:['with my friends','usually','I','celebrate','am','my birthday'] }),
  'g6-u1-wb-b6-03': freeze({ correctOrder:['What time','do','you','usually','get up','on Sunday?'], tokens:['does','get up','What time','usually','on Sunday?','you','do'] }),
  'g6-u1-wb-b6-04': freeze({ correctOrder:['We','hardly ever','speak Vietnamese','in our English class'], tokens:['speak Vietnamese','We','hardly ever','are','in our English class'] }),
  'g6-u1-wb-b6-05': freeze({ correctOrder:['The school bus','always','arrives','at six forty-five'], tokens:['at six forty-five','arrive','always','The school bus','arrives'] })
});

const E1 = freeze({
  'g6-u1-wb-e1-01': freeze({ correctOrder:['What','are','your'], tokens:['is','your','What','are','you'] }),
  'g6-u1-wb-e1-02': freeze({ correctOrder:['What kind of music','do'], tokens:['does','do','What kind of music','What music'] }),
  'g6-u1-wb-e1-03': freeze({ correctOrder:['school','do','you','attend'], tokens:['school','does','you','attend','go','to','do'], acceptedOrders:[['school','do','you','attend'],['school','do','you','go','to']] }),
  'g6-u1-wb-e1-04': freeze({ correctOrder:['What','do','you','usually','do','on'], tokens:['usually','does','on','What','do','you','do'] }),
  'g6-u1-wb-e1-05': freeze({ correctOrder:['Who','is','your'], tokens:['Who','does','your','is','What'] })
});

const E2 = freeze({
  'g6-u1-wb-e2-01': freeze({ correctOrder:['IT','is',"Trong's favourite subject."], tokens:['IT','are',"Trong's favourite subject.",'is'] }),
  'g6-u1-wb-e2-02': freeze({ correctOrder:['Mrs Hoa','is','our English teacher.'], tokens:['Mrs Hoa','our English teacher.','are','is'] }),
  'g6-u1-wb-e2-03': freeze({ correctOrder:['There are','six coloured pencils',"in my friend's box."], tokens:['There is','six coloured pencils',"in my friend's box.",'There are','on'] }),
  'g6-u1-wb-e2-04': freeze({ correctOrder:['Where','does','Ms Lan','live?'], tokens:['Where','do','does','Ms Lan','lives?','live?'] }),
  'g6-u1-wb-e2-05': freeze({ correctOrder:['Shall I','introduce you','to my best friend, An Son?'], tokens:['Shall I','introduce you','my best friend, An Son?','to my best friend, An Son?','introducing'] })
});

const D2 = freeze({
  'g6-u1-wb-d2-01': freeze({
    correct:'A',
    options:[
      ['A','Because the teachers and most of his classmates were new to him.'],
      ['B','Because the new subjects were too difficult for him.'],
      ['C','Because nobody in his class wanted to talk to him.'],
      ['D','Because he forgot all of his homework on the first day.']
    ]
  }),
  'g6-u1-wb-d2-02': freeze({
    correct:'C',
    options:[
      ['A','They are strict and unfriendly to him.'],
      ['B','They are quiet but they do not help him.'],
      ['C','They are all nice and friendly to him.'],
      ['D','They are nervous because Tom is new.']
    ]
  }),
  'g6-u1-wb-d2-03': freeze({
    correct:'B',
    options:[
      ['A','Maths.'],
      ['B','IT.'],
      ['C','Geography.'],
      ['D','Judo.']
    ]
  }),
  'g6-u1-wb-d2-04': freeze({
    correct:'A',
    options:[
      ['A','The judo club.'],
      ['B','The IT club.'],
      ['C','The geography club.'],
      ['D','The homework club.']
    ]
  }),
  'g6-u1-wb-d2-05': freeze({
    correct:'B',
    options:[
      ['A','No. He said his first day was difficult.'],
      ['B','Yes. He said he had a good first day.'],
      ['C','No. He wanted to leave the new school.'],
      ['D','Yes. He had already joined the judo club that day.']
    ]
  })
});

function adaptSentenceOrderBySpec(item, specs) {
  const spec = specs[item?.id];
  return spec ? sentenceOrder(item, spec) : item;
}

function adaptClosedTypingBySpec(item, specs) {
  const spec = specs[item?.id];
  return spec ? closedTypingMcq(item, spec) : item;
}

export function applyG6U1WorkbookInteractionAdaptations(key, content) {
  const lessonKey = String(key ?? '').toLowerCase();
  let items = content.items ?? [];

  if (lessonKey === 'b3') items = items.map(item => adaptClosedTypingBySpec(item, B3));
  if (lessonKey === 'b4') items = items.map(item => adaptClosedTypingBySpec(item, B4));
  if (lessonKey === 'b5' || lessonKey === 'd1') items = items.map(withSourceWordBank);
  if (lessonKey === 'b6') items = items.map(item => adaptSentenceOrderBySpec(item, B6));
  if (lessonKey === 'e1') items = items.map(item => adaptSentenceOrderBySpec(item, E1));
  if (lessonKey === 'e2') items = items.map(item => adaptSentenceOrderBySpec(item, E2));
  if (lessonKey === 'd2') items = items.map(item => D2[item.id] ? readingMcq(item, D2[item.id]) : item);

  return freeze({ ...content, items: freeze(items) });
}
