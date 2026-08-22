import { freeze, preTheory, mcq, typing, classification, theorySupport } from '../../../workbook-content-helpers.js';

const LETTERS = freeze(['A','B','C','D']);
const FALLBACK_VI = freeze(['một hoạt động khác','một nơi khác','một ý khác']);

function distinctDistractors(correct, pool) {
  const options = pool.filter(value => value && value !== correct);
  const unique = [...new Set(options)];
  while (unique.length < 3) unique.push(FALLBACK_VI[unique.length % FALLBACK_VI.length]);
  return unique.slice(0,3);
}

function preloadItems(prefix, vocab, phrases) {
  const source = [...vocab.map(entry => ({...entry, phase:'vocab'})), ...phrases.map(entry => ({...entry, phase:'phrase'}))];
  return source.map((entry,index) => {
    const phasePool = source.filter(candidate => candidate.phase === entry.phase).map(candidate => candidate.vi);
    const wrongs = distinctDistractors(entry.vi, phasePool);
    const correctIndex = [1,3,0,2][index % 4];
    let w=0;
    const options = LETTERS.map((letter,i) => [letter, i===correctIndex ? entry.vi : wrongs[w++]]);
    return mcq({
      id:`${prefix}-${entry.phase}-${String(index+1).padStart(2,'0')}`,
      prompt:`${entry.phase==='vocab' ? 'TỪ VỰNG' : 'CỤM TỪ'} · “${entry.en}” có nghĩa là gì?`,
      options,
      correct:LETTERS[correctIndex],
      reason:`“${entry.en}” = “${entry.vi}”.`,
      theory:entry.phase==='vocab' ? 'Nhìn từ tiếng Anh rồi gọi nghĩa tiếng Việt.' : 'Đọc cả cụm như một khối nghĩa.',
      example:`${entry.en} → ${entry.vi}`,
      phase:entry.phase
    });
  });
}

function makeTrueFalse(id, raw, theory) {
  return freeze({
    id, type:'true_false', statement:raw.statement, answer:Boolean(raw.answer), learningPhase:'source', theorySupport,
    teachingFeedback:freeze({
      correctLabel:raw.answer ? 'TRUE' : 'FALSE',
      reason:raw.explanation,
      theory,
      example:raw.trap || 'So từng chi tiết với bài đọc trước khi chọn.'
    })
  });
}

function makeSequence(id, raw, theory) {
  return freeze({
    id, type:'sequence_number', prompt:'Sắp xếp các câu theo thứ tự đúng.', learningPhase:'source',
    lines:freeze(raw.lines.map(line => freeze({...line,preserveOrder:true}))),
    correctOrder:freeze(raw.correctOrder), theorySupport,
    teachingFeedback:freeze({correctLabel:raw.correctOrder.join(' → '),reason:raw.explanation,theory,example:'Tìm câu mở đầu rồi nối câu hỏi với câu trả lời.'})
  });
}

function makeSentenceOrder(id, raw, theory, adaptation) {
  return freeze({
    id,type:'sentence_order',prompt:'Sắp xếp các mảnh thành câu đúng.',learningPhase:'source',
    tokens:freeze(raw.tokens),correctOrder:freeze(raw.correctOrder),acceptedOrders:freeze([freeze(raw.correctOrder)]),
    ...(adaptation ? {digitalAdaptation:freeze(adaptation)} : {}), theorySupport,
    teachingFeedback:freeze({correctLabel:raw.sentence,reason:raw.explanation,theory,example:raw.trap || 'Đọc lại cả câu sau khi sắp xếp.'})
  });
}

function sourceItems(spec) {
  const theory = spec.theory.join(' ');
  const prefix = spec.id;
  if (spec.type === 'MCQ') return spec.items.map((raw,index) => {
    const options = raw.options.map(([id,text]) => [id,text]);
    const answerPair = options.find(([,text]) => text === raw.answer);
    if (!answerPair) throw new Error(`${spec.id}: MCQ answer not found: ${raw.answer}`);
    return mcq({id:`${prefix}-source-${String(index+1).padStart(2,'0')}`,prompt:raw.prompt,options,correct:answerPair[0],reason:raw.explanation,theory,example:raw.trap,stimulus:spec.sourceContext ? {title:'Bài đọc trong SBT',text:spec.sourceContext} : null});
  });
  if (spec.type === 'TYPE') return spec.items.map((raw,index) => typing({id:`${prefix}-source-${String(index+1).padStart(2,'0')}`,prompt:raw.prompt,answer:raw.answer,reason:raw.explanation,theory,example:raw.trap}));
  if (spec.type === 'TF') return spec.items.map((raw,index) => makeTrueFalse(`${prefix}-source-${String(index+1).padStart(2,'0')}`,raw,theory));
  if (spec.type === 'SO') {
    const adaptation = spec.source.exercise === 'F2' ? {kind:'controlled_open_writing_to_sentence_order',reason:'F2 gốc là open writing; bản online khóa câu theo trọng tâm Unit để auto-score.'} : null;
    return spec.items.map((raw,index) => makeSentenceOrder(`${prefix}-source-${String(index+1).padStart(2,'0')}`,raw,theory,adaptation));
  }
  if (spec.type === 'SEQ') return spec.items.map((raw,index) => makeSequence(`${prefix}-source-${String(index+1).padStart(2,'0')}`,raw,theory));
  if (spec.type === 'MATCH') {
    const groups = spec.items.map((pair,index) => freeze({id:`g${index+1}`,label:pair.right}));
    const tokens = spec.items.map((pair,index) => freeze({id:`t${index+1}`,text:pair.left,correctGroupId:`g${index+1}`,preserveOrder:true}));
    return [classification({
      id:`${prefix}-source-01`,prompt:'Ghép mỗi phần bên trái với phần bên phải phù hợp.',groups,tokens,
      correctLabel:spec.items.map(pair => `${pair.left} → ${pair.right}`).join(' | '),
      reason:spec.items.map(pair => `${pair.left} + ${pair.right}: ${pair.why}`).join(' · '),
      theory,example:'Đọc cả hai vế sau khi ghép để kiểm tra nghĩa.'
    })];
  }
  throw new Error(`Unsupported G5 workbook type: ${spec.type}`);
}

export function defineG5WorkbookLesson(spec) {
  const sections = freeze([{heading:'Nhắc nhanh',bullets:freeze(spec.theory)}, ...(spec.sourceContext ? [{heading:'Bài đọc trong SBT',bullets:freeze([spec.sourceContext])}] : [])]);
  const preLessonTheory = preTheory({
    title:`Nhắc nhanh · ${spec.title}`,
    intro:'Đọc các mẹo ngắn trước khi làm bài Sách bài tập.',
    sourceSections:freeze([`${spec.source.pdf} · trang ${spec.source.page} · ${spec.source.exercise}`]),
    sections,
    summary:spec.theory.join(' ')
  });
  const preload = preloadItems(spec.id,spec.vocab,spec.phrases);
  return freeze({
    preLessonTheory,
    sourceTrace:freeze(spec.source),
    items:freeze([...preload,...sourceItems(spec)])
  });
}
