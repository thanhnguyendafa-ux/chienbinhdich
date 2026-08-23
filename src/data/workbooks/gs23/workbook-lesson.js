const freeze = Object.freeze;
const theorySupport = freeze({ access:'after_submit' });
const LETTERS = freeze(['A','B','C','D']);
const typingUi = freeze({ promptLabel:'Bài SBT', contextLabel:'Đề bài', instruction:'Gõ câu trả lời ngắn rồi bấm Kiểm tra.', inputLabel:'Câu trả lời của em', placeholder:'Gõ câu trả lời...' });
const openTypingUi = freeze({ promptLabel:'Bài mở', contextLabel:'Đề bài', instruction:'Tự viết một câu ngắn. Có nhiều cách trả lời hợp lý.', inputLabel:'Câu trả lời của em', placeholder:'Gõ câu của em...' });

function teaching(spec, label) {
  return freeze({ correctLabel:label, reason:spec.reason, theory:'Đọc từ khóa và nhớ mẫu câu ngay trước bài. Nếu sai, xem lại ví dụ rồi thử lại.', example:spec.example });
}

function sourceMeta(spec, sourcePolicy) {
  return {
    sourceTrace:freeze({ sourcePolicy, sourceBlock:spec.sourceBlock, originalActivity:spec.originalActivity }),
    digitalAdaptation:freeze({ kind:'text-only', note:spec.adaptation }),
    theorySupport,
    learningPhase:'source'
  };
}

function choiceItems(texts) {
  return texts.map((text,index) => freeze({ id:LETTERS[index], text, preserveOrder:true }));
}

function mcqItem(id, spec, sourcePolicy) {
  const choices = choiceItems(spec.choices);
  const index = spec.choices.findIndex(text => String(text) === String(spec.answer));
  if (index < 0) throw new Error(`${id}: MCQ answer missing from choices`);
  return freeze({ id,type:'mcq',prompt:spec.prompt,choices:freeze(choices),correctChoiceId:LETTERS[index],...sourceMeta(spec,sourcePolicy),teachingFeedback:teaching(spec,spec.answer) });
}

function typingItem(id, spec, sourcePolicy, open=false) {
  return freeze({ id,type:'typing',vi:spec.prompt,en:open ? spec.sample : spec.answer,responseMode:open?'open':undefined,typingUi:open?openTypingUi:typingUi,...sourceMeta(spec,sourcePolicy),teachingFeedback:teaching(spec,open?'Hoàn thành · +1 Mastery':spec.answer) });
}

function matchingItem(id, spec, sourcePolicy) {
  const groups = spec.pairs.map(pair => freeze({ id:String(pair.id), label:String(pair.right) }));
  const tokens = spec.pairs.map(pair => freeze({ id:String(pair.id), text:String(pair.left), correctGroupId:String(pair.id), preserveOrder:true }));
  return freeze({ id,type:'matching',prompt:spec.prompt,classificationKind:'generic',groups:freeze(groups),tokens:freeze(tokens),...sourceMeta(spec,sourcePolicy),teachingFeedback:teaching(spec,spec.pairs.map(pair=>`${pair.left} → ${pair.right}`).join(' · ')) });
}

function classificationItem(id,spec,sourcePolicy) {
  const groups=spec.groups.map(group=>freeze(group));
  const tokens=spec.tokens.map(token=>freeze({id:String(token.id),text:String(token.text),correctGroupId:String(token.group),preserveOrder:true}));
  return freeze({id,type:'classification',prompt:spec.prompt,classificationKind:'generic',groups:freeze(groups),tokens:freeze(tokens),...sourceMeta(spec,sourcePolicy),teachingFeedback:teaching(spec,'Phân nhóm đúng')});
}

function sentenceOrderItem(id,spec,sourcePolicy) {
  return freeze({id,type:'sentence_order',prompt:spec.prompt,tokens:freeze(spec.tokens),correctOrder:freeze(spec.correctOrder),acceptedOrders:freeze([freeze(spec.correctOrder)]),...sourceMeta(spec,sourcePolicy),teachingFeedback:teaching(spec,spec.correctOrder.join(' '))});
}

function sequenceItem(id,spec,sourcePolicy) {
  return freeze({id,type:'sequence_number',prompt:spec.prompt,lines:freeze(spec.lines.map(freeze)),correctOrder:freeze(spec.correctOrder),...(spec.stimulus?{stimulus:freeze(spec.stimulus)}:{}),...sourceMeta(spec,sourcePolicy),teachingFeedback:teaching(spec,spec.correctOrder.join(' → '))});
}

function trueFalseItem(id,spec,sourcePolicy) {
  return freeze({id,type:'true_false',statement:spec.statement,answer:Boolean(spec.answer),...sourceMeta(spec,sourcePolicy),teachingFeedback:teaching(spec,spec.answer?'TRUE':'FALSE')});
}

function sourceItem(prefix,spec,index,sourcePolicy) {
  const id=`${prefix}-src-${String(index+1).padStart(2,'0')}`;
  if(spec.type==='mcq') return mcqItem(id,spec,sourcePolicy);
  if(spec.type==='typing') return typingItem(id,spec,sourcePolicy,false);
  if(spec.type==='typing_open') return typingItem(id,spec,sourcePolicy,true);
  if(spec.type==='matching') return matchingItem(id,spec,sourcePolicy);
  if(spec.type==='classification') return classificationItem(id,spec,sourcePolicy);
  if(spec.type==='sentence_order') return sentenceOrderItem(id,spec,sourcePolicy);
  if(spec.type==='sequence_number') return sequenceItem(id,spec,sourcePolicy);
  if(spec.type==='true_false') return trueFalseItem(id,spec,sourcePolicy);
  throw new Error(`${id}: unsupported source type ${spec.type}`);
}

function vocabChoices(vocab,index) {
  const correct=vocab[index].vi;
  const distractors=[];
  for(let offset=1; distractors.length<2 && offset<vocab.length+3; offset+=1){
    const candidate=vocab[(index+offset)%vocab.length]?.vi;
    if(candidate && candidate!==correct && !distractors.includes(candidate)) distractors.push(candidate);
  }
  while(distractors.length<2) distractors.push(`nghĩa khác ${distractors.length+1}`);
  const slot=index%3;
  const texts=[...distractors]; texts.splice(slot,0,correct);
  return {texts,correctId:LETTERS[slot]};
}

function vocabPreload(prefix,vocab) {
  return freeze(vocab.map((entry,index)=>{
    const {texts,correctId}=vocabChoices(vocab,index);
    return freeze({
      id:`${prefix}-vocab-${String(index+1).padStart(2,'0')}`,type:'mcq',prompt:`TỪ MỚI · “${entry.en}” nghĩa là gì?`,learningPhase:'vocab',
      choices:freeze(choiceItems(texts)),correctChoiceId:correctId,theorySupport,
      teachingFeedback:freeze({correctLabel:entry.vi,reason:`“${entry.en}” = “${entry.vi}”.`,theory:'Nhìn từ tiếng Anh rồi gọi nghĩa tiếng Việt. Học từng từ một.',example:`${entry.en} → ${entry.vi}`})
    });
  }));
}

function theoryFor(spec) {
  return freeze({required:true,title:`Nhắc nhanh · ${spec.title}`,intro:'Đọc thật ngắn rồi làm từng bước. Không cần nhớ hết ngay.',sourceSections:freeze([spec.sourceSummary]),sections:freeze([
    freeze({heading:'TỪ MỚI',bullets:freeze([spec.theory[0]])}),
    freeze({heading:'MẪU CÂU',bullets:freeze(spec.theory.slice(1))})
  ]),summary:'Nhớ từ khóa trước; sai thì xem giải thích và thử lại.'});
}

export function buildGs23WorkbookLesson(spec,prefix) {
  const sourceItems=spec.sourceItems.map((item,index)=>sourceItem(prefix,item,index,spec.sourcePolicy));
  const items=freeze([...vocabPreload(prefix,spec.vocab),...sourceItems]);
  return freeze({
    id:prefix,passThreshold:80,preLessonTheory:theoryFor(spec),items,
    sourceAudit:freeze({policy:spec.sourcePolicy,sourceBlockCount:sourceItems.length,sourceBlocks:freeze(spec.sourceItems.map(item=>item.sourceBlock))})
  });
}

export function sourceTypeCounts(specs) {
  const counts={};
  for(const spec of specs) for(const item of spec.sourceItems) counts[item.type]=(counts[item.type]??0)+1;
  return freeze(counts);
}
