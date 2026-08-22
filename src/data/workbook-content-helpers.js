export const freeze = value => Object.freeze(value);
export const theorySupport = freeze({ access:'after_submit' });
const LETTERS = freeze(['A','B','C','D']);
const ANSWER_POSITIONS = freeze([1,3,0,2,2,0,3,1]);

const typingUi = freeze({
  promptLabel:'Bài trong SBT',
  contextLabel:'Đề bài',
  instruction:'Gõ câu trả lời theo yêu cầu của SBT.',
  inputLabel:'Câu trả lời của em',
  placeholder:'Gõ câu trả lời...'
});
const openTypingUi = freeze({
  promptLabel:'Bài mở trong SBT',
  contextLabel:'Đề bài',
  instruction:'Tự viết câu trả lời của em. Bài này có thể có nhiều cách viết đúng.',
  inputLabel:'Câu trả lời của em',
  placeholder:'Gõ câu trả lời của em...'
});

const choice = (id,text) => freeze({ id,text,preserveOrder:true });
const teaching = ({ correctLabel,reason,theory,example }) => freeze({ correctLabel,reason,theory,example });

export function preTheory({ title,intro,sourceSections,sections,summary }) {
  return freeze({
    required:true,
    title,
    intro,
    sourceSections:freeze(sourceSections),
    sections:freeze(sections.map(section => freeze({ heading:section.heading, bullets:freeze(section.bullets) }))),
    summary
  });
}

export function mcq({ id,prompt,options,correct,reason,theory,example,stimulus=null,phase='source',adaptation=null }) {
  return freeze({
    id,type:'mcq',prompt,learningPhase:phase,
    ...(stimulus ? { stimulus:freeze(stimulus) } : {}),
    choices:freeze(options.map(([choiceId,text]) => choice(choiceId,text))),
    correctChoiceId:correct,
    ...(adaptation ? { digitalAdaptation:freeze(adaptation) } : {}),
    theorySupport,
    teachingFeedback:teaching({ correctLabel:options.find(([choiceId]) => choiceId === correct)?.[1] ?? correct,reason,theory,example })
  });
}

export function typing({ id,prompt,answer,acceptedAnswers=[],reason,theory,example,open=false,sourceWordBank=null,phase='source' }) {
  return freeze({
    id,type:'typing',vi:prompt,en:answer,learningPhase:phase,
    ...(acceptedAnswers.length ? { acceptedAnswers:freeze(acceptedAnswers) } : {}),
    ...(open ? { responseMode:'open' } : {}),
    ...(sourceWordBank ? { sourceWordBank:freeze(sourceWordBank),sourceWordBankLabel:'Từ / cụm từ cho sẵn' } : {}),
    typingUi:open ? openTypingUi : typingUi,
    theorySupport,
    teachingFeedback:teaching({ correctLabel:open ? 'Bài tham khảo' : answer,reason,theory,example })
  });
}

export function classification({ id,prompt,groups,tokens,correctLabel,reason,theory,example,phase='source',adaptation=null }) {
  return freeze({
    id,type:'classification',prompt,classificationKind:'generic',learningPhase:phase,
    groups:freeze(groups.map(group => freeze(group))),
    tokens:freeze(tokens.map(token => freeze({ ...token,preserveOrder:true }))),
    ...(adaptation ? { digitalAdaptation:freeze(adaptation) } : {}),
    theorySupport,
    teachingFeedback:teaching({ correctLabel,reason,theory,example })
  });
}

export function sentenceOrder({ id,prompt,tokens,correctOrder,reason,theory,example,acceptedOrders=null,displayOrder=null,phase='source',adaptation=null }) {
  return freeze({
    id,type:'sentence_order',prompt,learningPhase:phase,
    tokens:freeze(tokens),
    correctOrder:freeze(correctOrder),
    acceptedOrders:freeze((acceptedOrders ?? [correctOrder]).map(order => freeze(order))),
    ...(displayOrder ? { displayOrder:freeze(displayOrder) } : {}),
    ...(adaptation ? { digitalAdaptation:freeze(adaptation) } : {}),
    theorySupport,
    teachingFeedback:teaching({ correctLabel:correctOrder.join(' '),reason,theory,example })
  });
}

function translationItem(prefix,phase,entry,index) {
  const correctIndex = ANSWER_POSITIONS[index % ANSWER_POSITIONS.length];
  const wrongs = [...entry[2]];
  const texts = [];
  let wrongIndex = 0;
  for (let i=0;i<4;i+=1) texts.push(i===correctIndex ? entry[1] : wrongs[wrongIndex++]);
  const options = texts.map((text,i) => [LETTERS[i],text]);
  return mcq({
    id:`${prefix}-${phase}-${String(index+1).padStart(2,'0')}`,
    prompt:`${phase==='vocab' ? 'TỪ VỰNG' : 'CỤM TỪ'} · “${entry[0]}” có nghĩa là gì?`,
    options,
    correct:LETTERS[correctIndex],
    reason:entry[3] ?? `“${entry[0]}” = “${entry[1]}”. Con nhớ nghĩa này để đọc bài SBT dễ hơn.`,
    theory:phase==='vocab' ? 'Nhìn từ tiếng Anh → gọi nghĩa tiếng Việt.' : 'Đọc cả cụm như một khối nghĩa, đừng dịch từng chữ rời.',
    example:entry[4] ?? `${entry[0]} → ${entry[1]}`,
    phase
  });
}

export function preload(prefix,vocab=[],phrases=[]) {
  return freeze([
    ...vocab.map((entry,index) => translationItem(prefix,'vocab',entry,index)),
    ...phrases.map((entry,index) => translationItem(prefix,'phrase',entry,index))
  ]);
}

export function lesson(preLessonTheory,prefix,vocab,phrases,sourceItems) {
  return freeze({ preLessonTheory, items:freeze([...preload(prefix,vocab,phrases),...sourceItems]) });
}

export function itemCounts(lessons) {
  return freeze(Object.fromEntries(Object.entries(lessons).map(([key,value]) => [key,value.items.length])));
}
