import { freeze, preTheory, preload, mcq, typing, classification, sentenceOrder, theorySupport } from '../../../workbook-content-helpers.js';

const OPEN_TYPING_UI=freeze({
  promptLabel:'Bài mở trong SBT',contextLabel:'Đề bài',
  instruction:'Tự viết câu trả lời của con. Bài này có thể có nhiều cách đúng và không tính vào điểm SBT tự động.',
  inputLabel:'Câu trả lời của con',placeholder:'Gõ câu trả lời của con...'
});
const PRACTICE_TYPING_UI=freeze({
  promptLabel:'Tự luyện bằng chữ · không audio/micro',contextLabel:'Nội dung luyện',
  instruction:'Đọc/luyện theo hướng dẫn rồi gõ XONG để xác nhận. Phần tự luyện này không tính vào điểm SBT.',
  inputLabel:'Xác nhận đã luyện',placeholder:'Gõ XONG...'
});

function feedback(spec,item,{answer='',reading=false,open=false,practice=false}={}) {
  const rule=spec.theory.rule;
  let reason=item?.reason ?? '';
  if (!reason && reading) reason=`Con tìm bằng chứng ngay trong bài đọc. Đáp án cần khớp đúng chi tiết được hỏi${answer ? `: “${answer}”` : ''}.`;
  if (!reason && open) reason='Đây là bài mở của SBT nên có nhiều cách trả lời đúng. Hệ thống lưu câu trả lời để con luyện nhưng không dùng phần này để tính điểm SBT.';
  if (!reason && practice) reason='Đây là bài tự luyện đọc/phát âm bằng chữ. Hệ thống không chấm giọng nói và không tính điểm; XONG chỉ xác nhận con đã luyện.';
  if (!reason) reason=`Đáp án phù hợp với nghĩa và cấu trúc của câu${answer ? `: “${answer}”` : ''}. Con kiểm tra lại theo luật dễ nhớ của bài.`;
  return freeze({
    correctLabel:open?'Bài mở · không tính điểm':practice?'Đã tự luyện · không tính điểm':String(answer || 'Đúng'),
    reason,theory:rule,example:spec.theory.example
  });
}

function withExtra(item,extra) { return freeze({...item,...extra}); }
function withStimulus(item,stimulus) { return stimulus ? withExtra(item,{stimulus:freeze(stimulus)}) : item; }
function iid(spec,index) { return `${spec.id}-source-${String(index).padStart(2,'0')}`; }
function choicePairs(options) { return options.map((text,index)=>[String.fromCharCode(65+index),text]); }

function makeMcq(spec,item,id,stimulus=null,adaptation=null) {
  const options=choicePairs(item.options);
  const correct=options.find(([,text])=>text===item.answer)?.[0];
  if (!correct) throw new Error(`${spec.id}: MCQ answer not found: ${item.answer}`);
  const base=mcq({id,prompt:item.prompt,options,correct,reason:item.reason??feedback(spec,item,{answer:item.answer,reading:Boolean(stimulus)}).reason,theory:spec.theory.rule,example:spec.theory.example,adaptation});
  return withStimulus(base,stimulus);
}
function makeTyping(spec,item,id,stimulus=null,sourceWordBank=null) {
  return withStimulus(typing({id,prompt:item.prompt,answer:item.answer,acceptedAnswers:item.accepted??[],reason:item.reason??feedback(spec,item,{answer:item.answer,reading:Boolean(stimulus)}).reason,theory:spec.theory.rule,example:spec.theory.example,sourceWordBank}),stimulus);
}
function makeTf(spec,item,id,stimulus=null) {
  const answer=Boolean(item.answer);
  return withStimulus(freeze({
    id,type:'true_false',statement:item.statement,answer,learningPhase:'source',theorySupport,
    teachingFeedback:feedback(spec,item,{answer:answer?'TRUE':'FALSE',reading:Boolean(stimulus)})
  }),stimulus);
}
function makeOpen(spec,prompt,id,stimulus=null) {
  const base=typing({id,prompt,answer:'Bài trả lời cá nhân',reason:'Đây là bài mở của SBT; hệ thống lưu câu trả lời không rỗng để con tiếp tục luyện.',theory:spec.theory.rule,example:spec.theory.example,open:true});
  return withStimulus(withExtra(base,{assessmentMode:'unscored',typingUi:OPEN_TYPING_UI,teachingFeedback:feedback(spec,null,{open:true,reading:Boolean(stimulus)})}),stimulus);
}
function makePractice(spec,prompt,id) {
  const base=typing({id,prompt,answer:'XONG',acceptedAnswers:['xong','Xong'],reason:'Tự luyện hoàn tất.',theory:spec.theory.rule,example:spec.theory.example});
  return withExtra(base,{assessmentMode:'unscored',typingUi:PRACTICE_TYPING_UI,teachingFeedback:feedback(spec,null,{practice:true})});
}
function makeMatch(spec,pairs,id,stimulus=null) {
  const groups=pairs.map((pair,index)=>freeze({id:`g${index+1}`,label:pair[1]}));
  const tokens=pairs.map((pair,index)=>freeze({id:`t${index+1}`,text:pair[0],correctGroupId:`g${index+1}`,preserveOrder:true}));
  const base=classification({
    id,prompt:'Ghép mỗi phần bên trái với phần bên phải phù hợp.',groups,tokens,
    correctLabel:pairs.map(pair=>`${pair[0]} → ${pair[1]}`).join(' | '),
    reason:feedback(spec,null,{reading:Boolean(stimulus)}).reason,theory:spec.theory.rule,example:spec.theory.example
  });
  return withStimulus(base,stimulus);
}
function makeSequence(spec,block,id) {
  return freeze({
    id,type:'sequence_number',prompt:'Đánh số các dòng theo đúng thứ tự.',learningPhase:'source',
    lines:freeze(block.lines.map(line=>freeze({...line,preserveOrder:true}))),correctOrder:freeze(block.correctOrder),theorySupport,
    teachingFeedback:feedback(spec,null,{answer:block.correctOrder.join(' → ')})
  });
}
function makeClassification(spec,block,id) {
  const groups=block.groups.map((label,index)=>freeze({id:`g${index+1}`,label}));
  const tokens=[];
  for (const [groupIndex,label] of block.groups.entries()) {
    for (const text of block.mapping[label]??[]) tokens.push(freeze({id:`t${tokens.length+1}`,text,correctGroupId:`g${groupIndex+1}`,preserveOrder:true}));
  }
  return classification({
    id,prompt:'Phân loại mỗi từ/cụm vào đúng nhóm.',groups,tokens,
    correctLabel:block.groups.map(label=>`${label}: ${(block.mapping[label]??[]).join(', ')}`).join(' | '),
    reason:feedback(spec,null).reason,theory:spec.theory.rule,example:spec.theory.example
  });
}
function tokensForSentence(sentence) { return String(sentence).trim().split(/\s+/); }
function makeSentenceOrder(spec,sentence,id) {
  const correctOrder=tokensForSentence(sentence);
  return sentenceOrder({id,prompt:'Sắp xếp các từ/cụm thành câu đúng.',tokens:correctOrder,correctOrder,reason:feedback(spec,null,{answer:sentence}).reason,theory:spec.theory.rule,example:spec.theory.example});
}

function crosswordMcqItem(item,pool,index) {
  const distractors=pool.filter(answer=>answer!==item.answer).slice(index,index+3);
  const fallback=pool.filter(answer=>answer!==item.answer && !distractors.includes(answer));
  while(distractors.length<3 && fallback.length) distractors.push(fallback.shift());
  const correctIndex=[1,3,0,2][index%4];
  let wrong=0;
  const options=Array.from({length:4},(_,position)=>position===correctIndex?item.answer:distractors[wrong++]);
  return {...item,options};
}

function sourceItems(spec) {
  const out=[];
  let n=1;
  for (const block of spec.blocks) {
    const reading=Boolean(block.passage);
    const stimulus=reading ? freeze({title:block.title,text:block.passage}) : null;
    if (block.type==='mcq' || block.type==='reading_mcq') {
      for (const item of block.items) out.push(makeMcq(spec,item,iid(spec,n++),stimulus));
    } else if ((block.type==='typing' || block.type==='reading_typing') && /crossword grid/i.test(spec.sourceNote??'')) {
      const pool=[...new Set(block.items.map(item=>item.answer))];
      for (const [index,item] of block.items.entries()) {
        const adapted=crosswordMcqItem(item,pool,index);
        out.push(makeMcq(spec,adapted,iid(spec,n++),stimulus,freeze({kind:'crossword_grid_to_mcq_clues',reason:'Lưới ô chữ là dữ kiện khóa đáp án trong SBT. Bản online giữ clue nhưng dùng lựa chọn để tránh chấm oan synonym khi bỏ grid.'})));
      }
    } else if (block.type==='typing' || block.type==='reading_typing') {
      const bank=Array.isArray(block.wordBank) ? freeze(block.wordBank) : null;
      for (const item of block.items) out.push(makeTyping(spec,item,iid(spec,n++),stimulus,bank));
    } else if (block.type==='reading_tf') {
      for (const item of block.items) out.push(makeTf(spec,item,iid(spec,n++),stimulus));
    } else if (block.type==='tf') {
      for (const item of block.items) out.push(makeTf(spec,item,iid(spec,n++)));
    } else if (block.type==='practice') {
      for (const prompt of block.prompts) out.push(makePractice(spec,prompt,iid(spec,n++)));
    } else if (block.type==='open') {
      for (const prompt of block.prompts) out.push(makeOpen(spec,prompt,iid(spec,n++),stimulus));
    } else if (block.type==='match') {
      out.push(makeMatch(spec,block.pairs,iid(spec,n++)));
    } else if (block.type==='reading_match') {
      out.push(makeMatch(spec,block.pairs,iid(spec,n++),stimulus));
    } else if (block.type==='classify') {
      out.push(makeClassification(spec,block,iid(spec,n++)));
    } else if (block.type==='sequence') {
      out.push(makeSequence(spec,block,iid(spec,n++)));
    } else if (block.type==='sentence_order') {
      for (const sentence of block.sentences) out.push(makeSentenceOrder(spec,sentence,iid(spec,n++)));
    } else {
      throw new Error(`${spec.id}: unsupported source block ${block.type}`);
    }
  }
  return out;
}

export function defineG6WorkbookLesson(spec) {
  const preLessonTheory=preTheory({
    title:`Nhắc nhanh lớp 3 · ${spec.title}`,
    intro:'Con đọc phần này trước khi làm. Thầy giải thích bằng câu ngắn, từ dễ và từng bước nhỏ để học sinh lớp 3 cũng theo được.',
    sourceSections:[`Global Success 6 SBT · Unit ${spec.unit} · trang ${spec.page} · ${spec.exercise}`],
    sections:[
      {heading:'Luật dễ nhớ · lớp 3',bullets:[spec.theory.rule]},
      {heading:'Làm từng bước',bullets:spec.theory.steps},
      {heading:'Bẫy dễ mắc',bullets:[spec.theory.trap]},
      {heading:'Ví dụ khác bài',bullets:[spec.theory.example]}
    ],
    summary:`Con nhớ một điều: ${spec.theory.rule}`
  });
  const preloadItems=preload(spec.id,spec.preload.vocab,spec.preload.phrases);
  const items=sourceItems(spec);
  return freeze({
    preLessonTheory,
    sourceTrace:freeze({
      source:'Uploaded Global Success 6 Workbook PDF',unit:spec.unit,page:spec.page,exercise:spec.exercise,
      policy:'SOURCE-LOCKED',mediaPolicy:'TEXT-ONLY · no image · no audio',sourceNote:spec.sourceNote??null
    }),
    items:freeze([...preloadItems,...items])
  });
}
