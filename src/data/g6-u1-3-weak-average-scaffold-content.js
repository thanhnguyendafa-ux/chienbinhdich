const TYPING_UI=Object.freeze({promptLabel:'TỰ LÀM / TYPING',contextLabel:'Câu hỏi / yêu cầu',instruction:'Gõ đáp án tiếng Anh. Viết đúng cấu trúc; app bỏ qua khác biệt viết hoa/dấu câu nhỏ theo cài đặt của Set.',inputLabel:'Đáp án',placeholder:'Type your answer...'});
const cache=new Map();
function freeze(value){if(!value||typeof value!=='object'||Object.isFrozen(value))return value;for(const child of Object.values(value))freeze(child);return Object.freeze(value)}
function feedback(type,row,theory){let correct='';if(type==='m')correct=row[3][row[4]];else if(type==='f')correct=row[3]?'TRUE':'FALSE';else if(type==='t')correct=row[3];else if(type==='o')correct=row[4].join(' ');return freeze({correctLabel:String(correct),reason:String(row[type==='m'?5:type==='f'?4:type==='t'?5:5]),theory:String(theory),example:String(correct)})}
function inflate(setNo,source){const set=source[String(setNo)];if(!set)throw new Error(`Missing weak-average scaffold source: ${setNo}`);const items=set.rows.map((row,index)=>{const type=row[0],stage=row[1],id=`g6-u13-wa-s${String(setNo).padStart(2,'0')}-q${String(index+1).padStart(2,'0')}`,base={id,scaffoldStage:stage,sourceScaffoldQuestion:`Q${index+1}`,theorySupport:{access:index<4?'anytime':'after_submit'}};if(type==='m'){const choices=row[3].map((text,i)=>({id:`c${i+1}`,text}));return freeze({...base,type:'mcq',prompt:row[2],choices,correctChoiceId:`c${row[4]+1}`,teachingFeedback:feedback(type,row,set.theory)})}if(type==='f')return freeze({...base,type:'true_false',statement:row[2],answer:row[3],teachingFeedback:feedback(type,row,set.theory)});if(type==='t')return freeze({...base,type:'typing',vi:row[2],en:row[3],...(row[4]?.length?{acceptedAnswers:row[4]}:{}),...(row[6]?{typingSeparatorTolerance:true}:{}),typingUi:TYPING_UI,theorySupport:base.theorySupport,scaffoldStage:base.scaffoldStage,sourceScaffoldQuestion:base.sourceScaffoldQuestion,teachingFeedback:feedback(type,row,set.theory),id:base.id});if(type==='o')return freeze({...base,type:'sentence_order',prompt:row[2],tokens:row[3],displayOrder:row[3],correctOrder:row[4],acceptedOrders:[row[4]],teachingFeedback:feedback(type,row,set.theory)});throw new Error(`Unknown weak-average scaffold row type: ${type}`)});return freeze({items})}
const loaders=Object.freeze({
  1:()=>import('./g6-u1-3-weak-average-scaffold-data-01.js').then(m=>m.g6WeakAverageSource01),
  2:()=>import('./g6-u1-3-weak-average-scaffold-data-02.js').then(m=>m.g6WeakAverageSource02),
  3:()=>import('./g6-u1-3-weak-average-scaffold-data-03.js').then(m=>m.g6WeakAverageSource03),
  4:()=>import('./g6-u1-3-weak-average-scaffold-data-04.js').then(m=>m.g6WeakAverageSource04),
  5:()=>import('./g6-u1-3-weak-average-scaffold-data-05.js').then(m=>m.g6WeakAverageSource05),
  6:()=>import('./g6-u1-3-weak-average-scaffold-data-06.js').then(m=>m.g6WeakAverageSource06),
  7:()=>import('./g6-u1-3-weak-average-scaffold-data-07.js').then(m=>m.g6WeakAverageSource07),
  8:()=>import('./g6-u1-3-weak-average-scaffold-data-08.js').then(m=>m.g6WeakAverageSource08),
  9:()=>import('./g6-u1-3-weak-average-scaffold-data-09.js').then(m=>m.g6WeakAverageSource09),
  10:()=>import('./g6-u1-3-weak-average-scaffold-data-10.js').then(m=>m.g6WeakAverageSource10),
  11:()=>import('./g6-u1-3-weak-average-scaffold-data-11.js').then(m=>m.g6WeakAverageSource11),
  12:()=>import('./g6-u1-3-weak-average-scaffold-data-12.js').then(m=>m.g6WeakAverageSource12),
  13:()=>import('./g6-u1-3-weak-average-scaffold-data-13.js').then(m=>m.g6WeakAverageSource13),
  14:()=>import('./g6-u1-3-weak-average-scaffold-data-14.js').then(m=>m.g6WeakAverageSource14),
  15:()=>import('./g6-u1-3-weak-average-scaffold-data-15.js').then(m=>m.g6WeakAverageSource15),
  16:()=>import('./g6-u1-3-weak-average-scaffold-data-16.js').then(m=>m.g6WeakAverageSource16),
  17:()=>import('./g6-u1-3-weak-average-scaffold-data-17.js').then(m=>m.g6WeakAverageSource17),
  18:()=>import('./g6-u1-3-weak-average-scaffold-data-18.js').then(m=>m.g6WeakAverageSource18),
  19:()=>import('./g6-u1-3-weak-average-scaffold-data-19.js').then(m=>m.g6WeakAverageSource19),
  20:()=>import('./g6-u1-3-weak-average-scaffold-data-20.js').then(m=>m.g6WeakAverageSource20),
  21:()=>import('./g6-u1-3-weak-average-scaffold-data-21.js').then(m=>m.g6WeakAverageSource21),
  22:()=>import('./g6-u1-3-weak-average-scaffold-data-22.js').then(m=>m.g6WeakAverageSource22),
  23:()=>import('./g6-u1-3-weak-average-scaffold-data-23.js').then(m=>m.g6WeakAverageSource23),
  24:()=>import('./g6-u1-3-weak-average-scaffold-data-24.js').then(m=>m.g6WeakAverageSource24),
  25:()=>import('./g6-u1-3-weak-average-scaffold-data-25.js').then(m=>m.g6WeakAverageSource25),
  26:()=>import('./g6-u1-3-weak-average-scaffold-data-26.js').then(m=>m.g6WeakAverageSource26),
  27:()=>import('./g6-u1-3-weak-average-scaffold-data-27.js').then(m=>m.g6WeakAverageSource27),
  28:()=>import('./g6-u1-3-weak-average-scaffold-data-28.js').then(m=>m.g6WeakAverageSource28),
});
export async function getG6WeakAverageScaffoldContent(setNo){if(cache.has(setNo))return cache.get(setNo);const source=await loaders[Number(setNo)]();const content=inflate(setNo,source);cache.set(setNo,content);return content}
