const freeze = value => Object.freeze(value);

function sentenceOrder(item, { correctOrder, tokens, acceptedOrders = [] }) {
  const { vi, en, acceptedAnswers, typingUi, responseMode, choices, correctChoiceId, digitalAdaptation, ...rest } = item;
  return freeze({
    ...rest,
    type: 'sentence_order',
    prompt: item.prompt ?? vi ?? '',
    tokens: freeze(tokens),
    correctOrder: freeze(correctOrder),
    ...(acceptedOrders.length ? { acceptedOrders: freeze(acceptedOrders.map(order => freeze(order))) } : {}),
    digitalAdaptation: freeze({
      sourceResponseType: 'written_sentence_from_cues',
      adaptedResponseType: 'sentence_order',
      reason: 'Bài kiểm tra cách dựng câu từ cues nên học sinh chọn và sắp khối, không cần gõ lại cả câu.'
    }),
    teachingFeedback: freeze({
      ...(item.teachingFeedback ?? {}),
      correctLabel: correctOrder.join(' ')
    })
  });
}

function bankMcq(item) {
  const bank = Array.isArray(item.sourceWordBank) ? item.sourceWordBank : [];
  const answer = String(item.en ?? '').trim();
  const choices = bank.map((text, index) => freeze({ id:`w${index + 1}`, text:String(text), preserveOrder:true }));
  const correct = choices.find(candidate => candidate.text.toLowerCase() === answer.toLowerCase());
  if (!correct) return item;
  const { vi, en, acceptedAnswers, typingUi, responseMode, sourceWordBank, sourceWordBankLabel, ...rest } = item;
  return freeze({
    ...rest,
    type:'mcq',
    prompt:`${vi}\n\nTừ / cụm từ cho sẵn: ${bank.join(' · ')}`,
    choices:freeze(choices),
    correctChoiceId:correct.id,
    digitalAdaptation:freeze({
      sourceResponseType:'word_box_fill',
      adaptedResponseType:'word_bank_choice',
      reason:'Đề đã cho word box; học sinh chọn từ đúng thay vì bị kiểm tra kỹ năng đánh máy.'
    }),
    teachingFeedback:item.teachingFeedback
  });
}

const C3 = freeze({
  'g6-u2-wb-c3-01': freeze({ correctOrder:['Mira,','who','do','you','live','with?'], tokens:['Mira,','who','does','you','live','with?','do','are'] }),
  'g6-u2-wb-c3-02': freeze({ correctOrder:['I','live','with','my parents.','And you?'], tokens:['I','lives','live','with','in','my parents.','And you?'] }),
  'g6-u2-wb-c3-03': freeze({ correctOrder:['I live with','my parents','and','my younger brother.','Do you','live','in a house?'], tokens:['I live with','my parents','and','my younger brother.','Does you','Do you','lives','live','in a house?'] }),
  'g6-u2-wb-c3-04': freeze({ correctOrder:["No, I don't.",'I live','in a flat.','Do you','live','in a house?'], tokens:["No, I don't.","No, I isn't.",'I live','on a flat.','in a flat.','Does you','Do you','live','in a house?'] }),
  'g6-u2-wb-c3-05': freeze({ correctOrder:['Yes, I do.','Is','your flat','big?'], tokens:['Yes, I am.','Yes, I do.','Does','Is','your flat','big?'] }),
  'g6-u2-wb-c3-06': freeze({ correctOrder:["No, it isn't.",'There is','a living room,','two bedrooms,','a bathroom','and a kitchen.'], tokens:["No, it doesn't.","No, it isn't.",'There are','There is','a living room,','two bedroom,','two bedrooms,','a bathroom','and a kitchen.'] })
});

const E1 = freeze({
  'g6-u2-wb-e1-01': freeze({ correctOrder:["There isn't",'a bookshelf','in my bedroom.'], tokens:["There aren't", "There isn't",'a bookshelf','bookshelf','in my bedroom.'] }),
  'g6-u2-wb-e1-02': freeze({ correctOrder:['There is','a sink, a fridge, a cooker and a cupboard','in our kitchen.'], tokens:['There are','There is','There have','a sink, a fridge, a cooker and a cupboard','in our kitchen.','on our kitchen.'] }),
  'g6-u2-wb-e1-03': freeze({ correctOrder:["Mai's notebook",'is','on the table.'], tokens:['Mai notebook',"Mai's notebook",'are','is','on the table.'] }),
  'g6-u2-wb-e1-04': freeze({ correctOrder:['The microwave','is','behind','the dog.'], tokens:['The microwave','is','in front of','next to','behind','the dog.'] }),
  'g6-u2-wb-e1-05': freeze({ correctOrder:['I like','the living room','best','in the house.'], tokens:['I like','the living room','good','more','best','in the house.'] })
});

function adaptBySpec(item, specs) {
  const spec = specs[item?.id];
  return spec ? sentenceOrder(item, spec) : item;
}

export function applyG6U2WorkbookInteractionAdaptations(key, content) {
  const lessonKey = String(key ?? '').toLowerCase();
  let items = content.items ?? [];

  if (lessonKey === 'd1') items = items.map(bankMcq);
  if (lessonKey === 'c3') items = items.map(item => adaptBySpec(item, C3));
  if (lessonKey === 'e1') items = items.map(item => adaptBySpec(item, E1));

  return freeze({ ...content, items: freeze(items) });
}
