import { g2Raw, g2Read } from './g2-raw.js';
import { g3Raw, selfCheckRaw } from './g3-raw.js';

const clean=value=>String(value??'').replaceAll('*','');
const pad=n=>String(n).padStart(2,'0');
function chunks(sentence,max){
  const parts=String(sentence).replace(/[?.!,]/g,'').split(/\s+/).filter(Boolean);
  if(parts.length<=max)return parts;
  const size=Math.ceil(parts.length/max),out=[];
  for(let i=0;i<parts.length;i+=size)out.push(parts.slice(i,i+size).join(' '));
  return out;
}
function firstVocabInText(unit,text){
  const lower=text.toLowerCase();let best=null;
  for(const [en,vi] of unit.vocab){const p=lower.indexOf(en.toLowerCase());if(p>=0&&(!best||p<best[0]))best=[p,en,vi];}
  return best?[best[1],best[2]]:unit.vocab[0];
}
function matchPairs(vocab,max=4){return vocab.slice(0,max).map(([left,right],i)=>({id:`p${i+1}`,left,right}));}
function dialogue(unit){
  const ex=unit.ex;
  if(ex.includes(' – ')){const [a,b]=ex.split(' – ',2);return {lines:[{id:'a',text:a},{id:'b',text:b},{id:'c',text:'Thank you.'}],correctOrder:['a','b','c']};}
  return {lines:[{id:'a',text:'Hello!'},{id:'b',text:ex},{id:'c',text:'OK. Thank you.'}],correctOrder:['a','b','c']};
}
function grade2Source(unit){
  const n=unit.n,v=unit.vocab,[firstEn,firstVi]=v[0],items=[];
  items.push({sourceBlock:`G2-U${pad(n)}-S01`,originalActivity:'Activity 1 · Look and match',type:'matching',prompt:'Nối mỗi từ tiếng Anh với nghĩa tiếng Việt.',pairs:matchPairs(v,4),reason:'Mỗi từ chỉ ghép với đúng một nghĩa em đã học.',example:`${firstEn} → ${firstVi}`,adaptation:'Bỏ tranh; giữ mục tiêu nhận biết từ bằng ghép cặp chữ.'});
  if(unit.a2==='sequence_number'){
    items.push({sourceBlock:`G2-U${pad(n)}-S02`,originalActivity:'Activity 2 · Listen and number',type:'sequence_number',prompt:'Đọc 3 câu thay cho audio, rồi đánh số các từ theo thứ tự xuất hiện.',stimulus:{title:'Đọc thay cho audio',text:unit.listen.map((line,i)=>`${i+1}. ${line}`).join(' ')},lines:unit.seq_items.map(([id,text])=>({id,text})),correctOrder:[...unit.seq_items].sort((a,b)=>a[2]-b[2]).map(row=>row[0]),reason:'Tìm từ khóa trong từng câu rồi gắn số 1–3 theo thứ tự.',example:'Mỗi số chỉ dùng một lần.',adaptation:'Audio được thay bằng transcript chữ; kỹ năng xác định thứ tự được giữ.'});
  }else{
    const [en,vi]=firstVocabInText(unit,unit.listen[0]);const choices=v.slice(0,3).map(row=>row[0]);if(!choices.includes(en))choices[choices.length-1]=en;
    items.push({sourceBlock:`G2-U${pad(n)}-S02`,originalActivity:'Activity 2 · Listen and circle',type:'mcq',prompt:`Đọc thay cho audio: “${unit.listen[0]}” Từ nào xuất hiện?`,choices,answer:en,reason:`Trong câu có từ “${en}”.`,example:`${en} = ${vi}`,adaptation:'Audio được thay bằng một câu đọc ngắn; chọn từ xuất hiện trong câu.'});
  }
  items.push({sourceBlock:`G2-U${pad(n)}-S03`,originalActivity:'Activity 3 · Look and write',type:'typing',prompt:`Gõ từ tiếng Anh nghĩa là “${firstVi}”.`,answer:firstEn,reason:`“${firstEn}” nghĩa là “${firstVi}”.`,example:`Chữ/âm trọng tâm: ${unit.focus}.`,adaptation:'Bỏ tranh; typing một từ giữ mục tiêu nhớ và viết từ.'});
  let target=v.find(([en])=>unit.example.toLowerCase().includes(en.toLowerCase()))??v[0];
  const blank=unit.example.replace(new RegExp(target[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),'___');
  items.push({sourceBlock:`G2-U${pad(n)}-S04`,originalActivity:'Activity 4 · Look and write, then say',type:'typing',prompt:`Điền từ còn thiếu: ${blank}`,answer:target[0],reason:`Đáp án là “${target[0]}”. ${clean(unit.vi)}`,example:unit.example,adaptation:'Typing ngắn thay cho nhìn tranh/viết tay; không giả chấm phát âm.'});
  const rc=g2Read[String(n)];
  if(rc.kind==='matching')items.push({sourceBlock:`G2-U${pad(n)}-S05`,originalActivity:'Activity 5 · Read and match',type:'matching',prompt:'Ghép mỗi câu tiếng Anh với câu tiếng Việt đúng.',pairs:rc.pairs.map(([left,right],i)=>({id:`p${i+1}`,left,right})),reason:'Đọc từ khóa trong từng câu rồi ghép nghĩa.',example:`${rc.pairs[0][0]} → ${rc.pairs[0][1]}`,adaptation:'Matching chữ thay thế bố cục/tranh; mục tiêu đọc và ghép vẫn giữ.'});
  else items.push({sourceBlock:`G2-U${pad(n)}-S05`,originalActivity:'Activity 5 · Read and circle/tick',type:'mcq',prompt:rc.prompt,choices:rc.choices.split('/').map(x=>x.trim()),answer:rc.answer,reason:clean(rc.explain),example:'Đọc cả câu rồi tìm từ khóa.',adaptation:'MCQ một chạm thay cho circle/tick; stimulus được viết thành chữ.'});
  const mode=['typing','sentence_order','matching','classification'][(n-1)%4];let game;
  if(mode==='typing')game={type:'typing',prompt:`Gõ lại đúng từ từ gợi ý “${firstVi}”.`,answer:firstEn,reason:`“${firstEn}” = “${firstVi}”.`,example:firstEn};
  else if(mode==='sentence_order'){const sentence=unit.example.split(' – ')[0].trim(),t=chunks(sentence,5);game={type:'sentence_order',prompt:'Chạm các khối để xếp thành câu đúng.',tokens:t,correctOrder:t,reason:`Câu đúng là “${sentence}”.`,example:sentence};}
  else if(mode==='matching')game={type:'matching',prompt:'Trò chơi nối nhanh từ với nghĩa.',pairs:matchPairs(v,4),reason:'Mỗi cặp đúng giúp em nhớ nghĩa từ.',example:`${firstEn} → ${firstVi}`};
  else{const next=g2Raw[n%g2Raw.length].vocab,own=v.map(row=>row[0]),other=next.slice(0,3).map(row=>row[0]);game={type:'classification',prompt:'Chia các từ vào hai nhóm: Unit này / Từ khác.',groups:[{id:'own',label:'Unit này'},{id:'other',label:'Từ khác'}],tokens:[...own.map((text,i)=>({id:`o${i+1}`,text,group:'own'})),...other.map((text,i)=>({id:`x${i+1}`,text,group:'other'}))],reason:'Các từ của Unit này đều vừa xuất hiện trong bài.',example:own.join(', ')};}
  items.push({...game,sourceBlock:`G2-U${pad(n)}-S06`,originalActivity:'Activity 6 · Game',adaptation:'Game phụ thuộc tranh/grid được chuyển sang thao tác chữ ngắn, tự chấm được.'});
  items.push({sourceBlock:`G2-U${pad(n)}-S07`,originalActivity:'Activity 7 · Project',type:'typing_open',prompt:'Mini challenge: gõ một câu ngắn theo mẫu của Unit.',sample:unit.example,reason:'Bài Project có nhiều câu trả lời hợp lý; hệ thống ghi nhận khi em hoàn thành một câu không trống.',example:unit.example,adaptation:'Project vẽ/tô/cắt được chuyển thành viết có hướng dẫn; tính Mastery theo completion, không giả chấm nội dung tự do.'});
  return items;
}
function taskType(task){const s=task.toLowerCase();if(s.includes('listen and number')||(s.includes('number')&&s.includes('listen')))return'sequence_number';if(s.includes('true or false')||s.includes('tick or cross')||(s.includes('tick')&&s.includes('read')))return'true_false';if(s.includes('table'))return'classification';if(s.includes('match'))return'matching';if(s.includes('make sentences'))return'sentence_order';if(s.includes('interview'))return'typing';if(s.includes('ask and answer')||s.includes('speak')||s.includes('point and say')||s.includes('tell your classmate'))return'sentence_order';if(s.includes('puzzle')||s.includes('find and circle')||s.includes('odd one out'))return'classification';if(s.includes('circle')&&s.includes('read'))return'mcq';if(s.includes('number'))return'sequence_number';return'typing';}
function grade3Source(unit,index,task){
  const q=taskType(task),[en,vi]=unit.vocab[index%unit.vocab.length],base={sourceBlock:`G3-U${pad(unit.n)}-S${pad(index+1)}`,originalActivity:task,adaptation:'PUBLIC-STRUCTURE-ADAPTED: interaction giữ mục tiêu activity; stimulus/đáp án text-only vì chưa có PDF lớp 3 source-lock.'};
  if(q==='matching'){const pairs=matchPairs(unit.vocab,4);return{...base,type:q,prompt:'Ghép từ tiếng Anh với nghĩa tiếng Việt.',pairs,reason:'Đọc từ bên trái rồi chọn đúng nghĩa bên phải.',example:`${pairs[0].left} → ${pairs[0].right}`};}
  if(q==='sentence_order'){const sentence=unit.ex.split(' – ')[0].trim(),t=chunks(sentence,7);return{...base,type:q,prompt:'Chạm các khối để xếp thành câu đúng.',tokens:t,correctOrder:t,reason:`Câu đúng là “${sentence}”.`,example:sentence};}
  if(q==='true_false')return{...base,type:q,statement:`“${en}” nghĩa là “${vi}”.`,answer:true,reason:`Đúng. “${en}” = “${vi}”.`,example:`${en} → ${vi}`};
  if(q==='classification'){const next=g3Raw[unit.n%g3Raw.length].vocab,own=unit.vocab.slice(0,3).map(row=>row[0]),other=next.slice(0,3).map(row=>row[0]).filter(x=>!own.includes(x)).slice(0,3);return{...base,type:q,prompt:`Chia từ vào Unit ${unit.n} / Từ khác.`,groups:[{id:'own',label:`Unit ${unit.n}`},{id:'other',label:'Từ khác'}],tokens:[...own.map((text,i)=>({id:`o${i+1}`,text,group:'own'})),...other.map((text,i)=>({id:`x${i+1}`,text,group:'other'}))],reason:'Nhìn nghĩa/chủ đề của từng từ rồi chọn nhóm.',example:`${own[0]} → Unit ${unit.n}`};}
  if(q==='sequence_number'){const d=dialogue(unit);return{...base,type:q,prompt:'Đọc 3 dòng hội thoại và đánh số theo thứ tự logic.',...d,reason:'Câu mở đầu/câu hỏi đi trước, câu đáp ở sau, rồi tới câu kết.',example:'Mỗi số chỉ dùng một lần.'};}
  if(q==='mcq'){const choices=unit.vocab.slice(0,3).map(row=>row[1]);if(!choices.includes(vi))choices[choices.length-1]=vi;return{...base,type:q,prompt:`“${en}” nghĩa là gì?`,choices,answer:vi,reason:`“${en}” = “${vi}”.`,example:`${en} → ${vi}`};}
  const lower=task.toLowerCase();if(['write about','write your answer','interview','draw and write'].some(k=>lower.includes(k)))return{...base,type:'typing_open',prompt:'Gõ một câu ngắn theo mẫu của Unit.',sample:unit.ex,reason:'Có nhiều câu trả lời cá nhân hợp lý; câu không trống được ghi nhận hoàn thành.',example:unit.ex};
  return{...base,type:'typing',prompt:`Gõ từ tiếng Anh nghĩa là “${vi}”.`,answer:en,reason:`“${en}” = “${vi}”.`,example:en};
}
function selfSource(sc,index,task){
  const start=(sc-1)*5,cohort=g3Raw.slice(start,start+5),unit=cohort[index%5],q=taskType(task),[en,vi]=unit.vocab[0],base={sourceBlock:`G3-SC${sc}-S${pad(index+1)}`,originalActivity:task,adaptation:'PUBLIC-STRUCTURE-ADAPTED: Self-check dùng stimulus chữ tự chấm; chưa tuyên bố page-by-page khi chưa có PDF lớp 3.'};
  if(q==='sequence_number'){const d=dialogue(unit);return{...base,type:q,prompt:`Ôn Units ${start+1}–${start+5}: đánh số hội thoại theo thứ tự.`,...d,reason:'Xếp câu mở đầu/câu hỏi → câu đáp → câu kết.',example:'Mỗi số chỉ dùng một lần.'};}
  if(q==='true_false')return{...base,type:q,statement:`“${en}” nghĩa là “${vi}”.`,answer:true,reason:`Đúng. “${en}” = “${vi}”.`,example:`${en} → ${vi}`};
  if(q==='sentence_order'){const sentence=unit.ex.split(' – ')[0].trim(),t=chunks(sentence,7);return{...base,type:q,prompt:'Xếp các khối thành câu ôn tập đúng.',tokens:t,correctOrder:t,reason:`Câu đúng là “${sentence}”.`,example:sentence};}
  if(q==='classification'){const a=cohort[0].vocab.slice(0,3).map(row=>row[0]),b=cohort[1].vocab.slice(0,3).map(row=>row[0]);return{...base,type:q,prompt:'Chia từ vào đúng Unit.',groups:[{id:'a',label:`Unit ${cohort[0].n}`},{id:'b',label:`Unit ${cohort[1].n}`}],tokens:[...a.map((text,i)=>({id:`a${i}`,text,group:'a'})),...b.map((text,i)=>({id:`b${i}`,text,group:'b'}))],reason:'Nhớ chủ đề của từng Unit để phân nhóm.',example:`${a[0]} → Unit ${cohort[0].n}`};}
  if(q==='matching'){const pairs=matchPairs(unit.vocab,4);return{...base,type:q,prompt:'Ghép từ với nghĩa để ôn tập.',pairs,reason:'Mỗi từ ghép đúng một nghĩa.',example:`${pairs[0].left} → ${pairs[0].right}`};}
  if(q==='mcq'){const choices=unit.vocab.slice(0,3).map(row=>row[1]);return{...base,type:q,prompt:`“${en}” nghĩa là gì?`,choices,answer:vi,reason:`“${en}” = “${vi}”.`,example:`${en} → ${vi}`};}
  const lower=task.toLowerCase();if(lower.includes('interview')||lower.includes('ask and answer'))return{...base,type:'typing_open',prompt:`Gõ một câu trả lời ngắn để ôn Units ${start+1}–${start+5}.`,sample:unit.ex,reason:'Câu trả lời cá nhân có thể khác nhau; hệ thống ghi nhận completion.',example:unit.ex};
  return{...base,type:'typing',prompt:`Gõ từ tiếng Anh nghĩa là “${vi}”.`,answer:en,reason:`“${en}” = “${vi}”.`,example:en};
}
export const g2WorkbookUnits=Object.freeze(g2Raw.map(unit=>Object.freeze({grade:2,unit:unit.n,title:unit.title,sourcePolicy:'PDF-SOURCE-LOCKED',sourceSummary:`16 Units × 7 activities; Unit ${unit.n} có 7 source blocks.`,theory:[`Từ mới: ${unit.vocab.map(row=>row[0]).join(', ')}.`,clean(unit.vi),`Ví dụ: ${unit.example}`],vocab:unit.vocab.map(([en,vi])=>({en,vi})),sourceItems:grade2Source(unit)})));
export const g3WorkbookUnits=Object.freeze(g3Raw.map(unit=>Object.freeze({grade:3,unit:unit.n,title:unit.title,sourcePolicy:'PUBLIC-STRUCTURE-ADAPTED',sourceSummary:`Public SBT structure: ${unit.tasks.length} top-level tasks in A/B/C/D/E.`,theory:[clean(unit.vi),`Mẫu chính: ${unit.pattern}`,`Ví dụ: ${unit.ex}`],vocab:unit.vocab.map(([en,vi])=>({en,vi})),sourceItems:unit.tasks.map((task,index)=>grade3Source(unit,index,task))})));
export const g3WorkbookSelfChecks=Object.freeze(selfCheckRaw.map(([selfCheck,tasks])=>{const start=(selfCheck-1)*5+1;return Object.freeze({grade:3,selfCheck,title:`Self-check & Fun time ${selfCheck}`,sourcePolicy:'PUBLIC-STRUCTURE-ADAPTED',sourceSummary:`Public SBT structure: ${tasks.length} top-level review tasks.`,theory:[`Ôn lại Units ${start}–${start+4}.`,'Đọc từ khóa trước khi trả lời.','Nếu chưa chắc, quay lại mẫu câu của Unit liên quan.'],vocab:[],sourceItems:tasks.map((task,index)=>selfSource(selfCheck,index,task))});}));
