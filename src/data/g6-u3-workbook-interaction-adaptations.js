const freeze = value => Object.freeze(value);
const choice = (id, text) => freeze({ id, text, preserveOrder:true });

function sentenceOrder(item, { correctOrder, tokens }) {
  const { vi, en, acceptedAnswers, typingUi, responseMode, choices, correctChoiceId, digitalAdaptation, ...rest } = item;
  return freeze({
    ...rest,
    type:'sentence_order',
    prompt:item.prompt ?? vi ?? '',
    tokens:freeze(tokens),
    correctOrder:freeze(correctOrder),
    digitalAdaptation:freeze({
      sourceResponseType:'written_sentence_from_cues',
      adaptedResponseType:'sentence_order',
      reason:'Bài kiểm tra cách dựng câu từ cues nên học sinh tự chọn và sắp các khối.'
    }),
    teachingFeedback:freeze({ ...(item.teachingFeedback ?? {}), correctLabel:correctOrder.join(' ') })
  });
}

function bankMcq(item) {
  const bank = Array.isArray(item.sourceWordBank) ? item.sourceWordBank : [];
  const answer = String(item.en ?? '').trim();
  const choices = bank.map((text,index)=>choice(`w${index+1}`,String(text)));
  const correct = choices.find(candidate => candidate.text.toLowerCase() === answer.toLowerCase());
  if (!correct) return item;
  const { vi, en, acceptedAnswers, typingUi, responseMode, ...rest } = item;
  return freeze({
    ...rest,
    type:'mcq',
    prompt:`${vi}\n\nTừ / cụm từ cho sẵn: ${bank.join(' · ')}`,
    choices:freeze(choices),
    correctChoiceId:correct.id,
    sourceWordBank:freeze(bank),
    sourceWordBankLabel:item.sourceWordBankLabel || 'Từ / cụm từ cho sẵn',
    digitalAdaptation:freeze({ sourceResponseType:'word_box_fill', adaptedResponseType:'word_bank_choice', reason:'Đề đã cho word box nên học sinh chọn từ đúng thay vì phải gõ lại.' }),
    teachingFeedback:item.teachingFeedback
  });
}

function grammarMcq(item, options, correct) {
  const { vi, en, acceptedAnswers, typingUi, responseMode, ...rest } = item;
  return freeze({
    ...rest,
    type:'mcq',
    prompt:vi,
    choices:freeze(options.map(([id,text])=>choice(id,text))),
    correctChoiceId:correct,
    digitalAdaptation:freeze({ sourceResponseType:'verb_form_typing', adaptedResponseType:'diagnostic_mcq', reason:'Bài đang kiểm tra quyết định ngữ pháp; các lựa chọn bẫy giúp chẩn đoán sai BE, sai thì hoặc sai V-ing.' }),
    teachingFeedback:freeze({ ...(item.teachingFeedback ?? {}), correctLabel:options.find(([id])=>id===correct)?.[1] ?? correct })
  });
}

const B5_MCQ = freeze({
  'g6-u3-wb-b5-01': freeze({ correct:'A', options:[['A','is'],['B','are'],['C','am'],['D','is being']] }),
  'g6-u3-wb-b5-02': freeze({ correct:'B', options:[['A','wears'],['B','is wearing'],['C','wearing'],['D','wear']] }),
  'g6-u3-wb-b5-03': freeze({ correct:'B', options:[['A','plays'],['B','is playing'],['C','play'],['D','playing']] }),
  'g6-u3-wb-b5-04': freeze({ correct:'A', options:[['A','likes'],['B','is liking'],['C','like'],['D','liking']] }),
  'g6-u3-wb-b5-05': freeze({ correct:'B', options:[['A','is'],['B','are'],['C','be'],['D','is being']] }),
  'g6-u3-wb-b5-06a': freeze({ correct:'B', options:[['A','looks'],['B','is looking'],['C','look'],['D','looking']] }),
  'g6-u3-wb-b5-06b': freeze({ correct:'B', options:[['A','smiles'],['B','smiling'],['C','is smile'],['D','smile']] })
});

const B6_ORDER = freeze({
  'g6-u3-wb-b6-01': freeze({ correctOrder:['Our grandparents','are','watching','TV','in the living room.'], tokens:['Our grandparents','is','are','watch','watching','TV','in the living room.'] }),
  'g6-u3-wb-b6-02': freeze({ correctOrder:['My sister','is','swimming','in the pool','now.'], tokens:['My sister','are','is','swim','swimming','in the pool','now.'] }),
  'g6-u3-wb-b6-03': freeze({ correctOrder:['My best friend','is not','learning','English','at the moment.'], tokens:['My best friend','does not','is not','learn','learning','English','at the moment.'] }),
  'g6-u3-wb-b6-04': freeze({ correctOrder:['I','am not','reading;','I','am','listening to music.'], tokens:['I','do not','am not','read;','reading;','I','am','listen to music.','listening to music.'] }),
  'g6-u3-wb-b6-05': freeze({ correctOrder:['We','are','cooking','dinner','in the kitchen','at present.'], tokens:['We','is','are','cook','cooking','dinner','in the kitchen','at present.'] }),
  'g6-u3-wb-b6-06': freeze({ correctOrder:['What','are','you','doing?','I','am','writing','a poem.'], tokens:['What','do','are','you','do?','doing?','I','am','write','writing','a poem.'] })
});

const C1_ORDER = freeze({
  'g6-u3-wb-c1-01': freeze({ correctOrder:['What','does','your sister','look like?'], tokens:['What','is','does','your sister','looks','look like?'] }),
  'g6-u3-wb-c1-02': freeze({ correctOrder:['She','is','tall and thin,','with','long black hair.'], tokens:['She','has','is','tall and thin,','with','a long black hair.','long black hair.'] }),
  'g6-u3-wb-c1-03': freeze({ correctOrder:['What','is','she','like?'], tokens:['What','does','is','she','look','like?'] }),
  'g6-u3-wb-c1-04': freeze({ correctOrder:['She','is','friendly and hard-working.','What about','your brother?'], tokens:['She','has','is','friendly and hard-working.','What about','What is about','your brother?'] }),
  'g6-u3-wb-c1-05': freeze({ correctOrder:['He','is','caring and patient.','He','loves','me','a lot.'], tokens:['He','has','is','caring and patient.','He','love','loves','me','a lot.'] })
});

function combinedClassification(content, { id, promptTail, groups, groupForItem, correctLabel, reason, theory, example, adaptationReason }) {
  const sourceItems = content.items ?? [];
  const first = sourceItems[0] ?? {};
  const stimulusText = first.stimulus?.text ?? '';
  return freeze({
    ...content,
    items:freeze([
      freeze({
        id,
        type:'classification',
        prompt:`${stimulusText}\n\n${promptTail}`,
        classificationKind:'generic',
        groups:freeze(groups.map(group=>freeze(group))),
        tokens:freeze(sourceItems.map((item,index)=>freeze({ id:`q${index+1}`, text:String(item.prompt), correctGroupId:groupForItem(item), preserveOrder:true }))),
        theorySupport:first.theorySupport,
        digitalAdaptation:freeze({ sourceResponseType:'multiple_source_choices', adaptedResponseType:'single_classification_board', reason:adaptationReason }),
        teachingFeedback:freeze({ correctLabel, reason, theory, example })
      })
    ])
  });
}

export function applyG6U3WorkbookInteractionAdaptations(key, content) {
  const lessonKey = String(key ?? '').toLowerCase();
  let items = content.items ?? [];

  if (lessonKey === 'b3' || lessonKey === 'd1') items = items.map(bankMcq);
  if (lessonKey === 'b5') items = items.map(item => {
    const spec = B5_MCQ[item.id];
    return spec ? grammarMcq(item, spec.options, spec.correct) : item;
  });
  if (lessonKey === 'b6') items = items.map(item => B6_ORDER[item.id] ? sentenceOrder(item, B6_ORDER[item.id]) : item);
  if (lessonKey === 'c1') items = items.map(item => C1_ORDER[item.id] ? sentenceOrder(item, C1_ORDER[item.id]) : item);

  if (lessonKey === 'd3') {
    return combinedClassification(content, {
      id:'g6-u3-wb-d3-all',
      promptTail:'Phân loại cả 5 câu vào hai nhóm: đúng theo Miss Hong hoặc không đúng theo Miss Hong.',
      groups:[{id:'yes',label:'Đúng theo Miss Hong'},{id:'no',label:'Không đúng theo Miss Hong'}],
      groupForItem:item=>item.correctChoiceId === 'A' ? 'yes' : 'no',
      correctLabel:'Đúng: 1, 3, 5 · Không đúng: 2, 4',
      reason:'Miss Hong nói bạn tốt lắng nghe, giúp đỡ và ở bên ta trong lúc tốt/xấu; bạn tốt không nói dối và không bắt buộc luôn thích mọi thứ giống ta.',
      theory:'Đọc evidence cho từng statement rồi phân loại tất cả trước khi kiểm tra.',
      example:'never lie → câu “sometimes lies” phải vào nhóm Không đúng.',
      adaptationReason:'Bài nguồn yêu cầu chọn nhiều statement đúng; một bảng phân loại giữ được việc xem và quyết định cả 5 statement cùng lúc.'
    });
  }

  if (lessonKey === 'e2') {
    return combinedClassification(content, {
      id:'g6-u3-wb-e2-all',
      promptTail:'Ghép từng câu hỏi vào đúng phần a, b, c hoặc d của bài viết.',
      groups:[{id:'A',label:'Phần a'},{id:'B',label:'Phần b'},{id:'C',label:'Phần c'},{id:'D',label:'Phần d'}],
      groupForItem:item=>String(item.correctChoiceId),
      correctLabel:'a: câu 1 · b: câu 3, 4, 5 · c: câu 2, 6 · d: câu 7',
      reason:'Phần a giới thiệu người bạn; b tả ngoại hình/tính cách/sở thích; c nói lý do và hoạt động chung; d nói hy vọng tương lai.',
      theory:'Đây là bài matching theo chức năng của từng phần bài viết, nên cần nhìn cả 7 câu hỏi cùng lúc.',
      example:'Who is your best friend? → phần a; What is your hope for the future? → phần d.',
      adaptationReason:'Bài nguồn là ghép câu hỏi với phần bài viết; classification phù hợp hơn 7 màn MCQ rời.'
    });
  }

  return freeze({ ...content, items:freeze(items) });
}