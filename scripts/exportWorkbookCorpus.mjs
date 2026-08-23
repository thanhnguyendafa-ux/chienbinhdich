import fs from 'node:fs/promises';
import path from 'node:path';
import { listFolders, listSetDescriptors, loadLessonSet } from '../src/repositories/lessonRepository.js';
import { acceptedSentenceOrderDisplays, classificationAnswerMap, classificationResponseDisplay, sequenceNumberAnswerMap, sequenceNumberResponseDisplay } from '../src/core/questionTypes.js';

const OUT = process.env.EXPORT_OUT || 'workbook-export-data';
const PRODUCTION_ORIGIN = process.env.PRODUCTION_ORIGIN || 'https://chien-binh-dich.vercel.app';
const PRODUCTION_SHA = process.env.PRODUCTION_SHA || '9d122b708f4519f9c54d0b384f6489d82dedd358';
const COURSES = new Set(['Global Success 2','Global Success 3','Global Success 5','Global Success 6','Global Success 7']);
const EXPECTED_LESSONS = Object.freeze({2:16,3:24,5:141,6:192,7:45});
const EXPECTED_ITEMS = Object.freeze({2:161,3:408,5:1309,6:2455,7:539});

await fs.rm(OUT,{recursive:true,force:true});
await fs.mkdir(OUT,{recursive:true});

const folders = listFolders();
const folderById = new Map(folders.map(folder => [folder.id, folder]));
const descriptors = listSetDescriptors()
  .filter(set => COURSES.has(set.course) && String(set.folderId).includes('workbook'))
  .sort((a,b) => gradeOf(a)-gradeOf(b) || folderPath(a.folderId).localeCompare(folderPath(b.folderId),'vi') || a.order-b.order || a.id.localeCompare(b.id));

const lessons=[];
const audit={
  productionSha:PRODUCTION_SHA,
  productionOrigin:PRODUCTION_ORIGIN,
  generatedAt:new Date().toISOString(),
  totalLessons:0,totalItems:0,
  grades:{},
  passThresholdNot80:[],
  missingObjectiveAnswers:[],
  duplicateSlugs:[],
  unknownTypes:[],
  openCompletionItems:0,
  status:'pending'
};
const slugSeen=new Set();
const knownTypes=new Set(['typing','mcq','true_false','sentence_order','sequence_number','classification','matching']);

for(const descriptor of descriptors){
  const grade=gradeOf(descriptor);
  const lesson=await loadLessonSet(descriptor.id);
  const passages=new Map((lesson.passages??[]).map(p=>[String(p.id),p]));
  if(descriptor.passThreshold!==80) audit.passThresholdNot80.push(descriptor.id);
  if(slugSeen.has(descriptor.lessonSlug)) audit.duplicateSlugs.push(descriptor.lessonSlug);
  slugSeen.add(descriptor.lessonSlug);
  const serializedItems=(lesson.items??[]).map((item,index)=>{
    const rawType=String(item.type??'typing');
    if(!knownTypes.has(rawType)) audit.unknownTypes.push(`${descriptor.id}:${item.id}:${rawType}`);
    const answer=answerFor(item);
    if(answer.mode==='accuracy' && !answer.text.trim()) audit.missingObjectiveAnswers.push(`${descriptor.id}:${item.id}`);
    if(answer.mode==='completion') audit.openCompletionItems+=1;
    return serializeItem(item,index,passages,answer);
  });
  const record={
    grade,
    course:descriptor.course,
    setId:descriptor.id,
    lessonSlug:descriptor.lessonSlug,
    productionUrl:`${PRODUCTION_ORIGIN}/a/${descriptor.lessonSlug}`,
    folderId:descriptor.folderId,
    folderPath:folderPath(descriptor.folderId),
    unit:descriptor.unit,
    title:descriptor.title,
    subtitle:descriptor.subtitle??'',
    description:descriptor.description??'',
    expectedTimeMinutes:descriptor.expectedTimeMinutes??null,
    passThreshold:descriptor.passThreshold,
    completionPolicy:descriptor.completionPolicy??'',
    assessmentPolicy:descriptor.assessmentPolicy??'',
    assessmentContractVersion:descriptor.assessmentContractVersion??null,
    activityTypes:descriptor.activityTypes??[],
    itemCount:serializedItems.length,
    preLessonTheory:lesson.preLessonTheory??null,
    passages:lesson.passages??[],
    items:serializedItems
  };
  lessons.push(record);
  const g=audit.grades[grade]??={lessons:0,items:0,types:{},accuracyItems:0,completionItems:0,expectedLessons:EXPECTED_LESSONS[grade],expectedItems:EXPECTED_ITEMS[grade]};
  g.lessons+=1; g.items+=serializedItems.length;
  for(const item of serializedItems){
    g.types[item.type]=(g.types[item.type]??0)+1;
    if(item.answer.mode==='completion')g.completionItems+=1; else g.accuracyItems+=1;
  }
}

audit.totalLessons=lessons.length;
audit.totalItems=lessons.reduce((sum,l)=>sum+l.itemCount,0);
const countFailures=[];
for(const [grade,expected] of Object.entries(EXPECTED_LESSONS)) if(audit.grades[grade]?.lessons!==expected) countFailures.push(`G${grade} lessons ${audit.grades[grade]?.lessons} != ${expected}`);
for(const [grade,expected] of Object.entries(EXPECTED_ITEMS)) if(audit.grades[grade]?.items!==expected) countFailures.push(`G${grade} items ${audit.grades[grade]?.items} != ${expected}`);
audit.countFailures=countFailures;
audit.status=(countFailures.length||audit.passThresholdNot80.length||audit.missingObjectiveAnswers.length||audit.duplicateSlugs.length||audit.unknownTypes.length)?'FAIL':'PASS';

await fs.writeFile(path.join(OUT,'corpus.json'),JSON.stringify({audit,lessons},null,2));
await fs.writeFile(path.join(OUT,'audit.json'),JSON.stringify(audit,null,2));
await fs.writeFile(path.join(OUT,'index.csv'),toCsv(lessons));
await fs.writeFile(path.join(OUT,'audit.md'),toAuditMarkdown(audit));

console.log(JSON.stringify(audit,null,2));
if(audit.status!=='PASS') process.exitCode=1;

function gradeOf(descriptor){
  const match=String(descriptor.course??'').match(/(\d+)/);
  return match?Number(match[1]):0;
}
function folderPath(id){
  const parts=[]; let current=folderById.get(id); const guard=new Set();
  while(current&&!guard.has(current.id)){guard.add(current.id);parts.unshift(current.name);current=current.parentId?folderById.get(current.parentId):null;}
  return parts.join(' > ');
}
function answerFor(item){
  const type=String(item.type??'typing');
  if(type==='typing'){
    if(item.responseMode==='open') return {mode:'completion',text:'Hoàn thành bằng một câu trả lời không trống.',accepted:[],sample:String(item.en??'')};
    const accepted=[item.en,...(Array.isArray(item.acceptedAnswers)?item.acceptedAnswers:[])].filter(v=>String(v??'').trim());
    return {mode:'accuracy',text:[...new Set(accepted.map(String))].join(' / '),accepted:[...new Set(accepted.map(String))]};
  }
  if(type==='mcq'){
    const choice=(item.choices??[]).find(c=>String(c.id)===String(item.correctChoiceId));
    return {mode:'accuracy',text:String(choice?.text??item.correctChoiceId??''),accepted:[String(item.correctChoiceId??'')]};
  }
  if(type==='true_false') return {mode:'accuracy',text:item.answer===true?'TRUE':'FALSE',accepted:[item.answer===true?'true':'false']};
  if(type==='sentence_order'){
    const displays=acceptedSentenceOrderDisplays(item);
    return {mode:'accuracy',text:displays.join(' / '),accepted:displays};
  }
  if(type==='sequence_number'){
    const map=sequenceNumberAnswerMap(item);
    return {mode:'accuracy',text:sequenceNumberResponseDisplay(item,map),accepted:[JSON.stringify(map)]};
  }
  if(type==='matching'){
    const groups=new Map((item.groups??[]).map(g=>[String(g.id),String(g.label??g.id)]));
    const pairs=(item.tokens??[]).map(t=>`${String(t.text)} → ${groups.get(String(t.correctGroupId))??String(t.correctGroupId)}`);
    return {mode:'accuracy',text:pairs.join(' · '),accepted:pairs};
  }
  if(type==='classification'){
    const map=classificationAnswerMap(item);
    return {mode:'accuracy',text:classificationResponseDisplay(item,map),accepted:[JSON.stringify(map)]};
  }
  return {mode:'accuracy',text:'',accepted:[]};
}
function serializeItem(item,index,passages,answer){
  const passage=item.passageId?passages.get(String(item.passageId))??null:null;
  return {
    number:index+1,
    id:item.id,
    type:String(item.type??'typing'),
    learningPhase:item.learningPhase??'',
    prompt:String(item.type==='typing'?(item.vi??''):(item.type==='true_false'?(item.statement??''):(item.prompt??''))),
    stimulus:item.stimulus??null,
    passage,
    choices:item.choices??null,
    tokens:item.tokens??null,
    groups:item.groups??null,
    lines:item.lines??null,
    correctOrder:item.correctOrder??null,
    acceptedOrders:item.acceptedOrders??null,
    wordBank:item.wordBank??item.sourceWordBank??null,
    sourceContext:item.sourceContext??null,
    sourceTrace:item.sourceTrace??null,
    digitalAdaptation:item.digitalAdaptation??null,
    theorySupport:item.theorySupport??null,
    typingUi:item.typingUi??null,
    teachingFeedback:item.teachingFeedback??null,
    answer
  };
}
function csvEscape(value){const s=String(value??'');return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s;}
function toCsv(rows){
  const header=['grade','setId','folderPath','unit','title','lessonSlug','productionUrl','itemCount','passThreshold','activityTypes'];
  const out=[header.join(',')];
  for(const r of rows) out.push([r.grade,r.setId,r.folderPath,r.unit,r.title,r.lessonSlug,r.productionUrl,r.itemCount,r.passThreshold,(r.activityTypes??[]).join('|')].map(csvEscape).join(','));
  return out.join('\n')+'\n';
}
function toAuditMarkdown(a){
  const lines=['# Workbook PDF export audit','',`- Production SHA: \`${a.productionSha}\``,`- Production origin: ${a.productionOrigin}`,`- Status: **${a.status}**`,`- Lessons: **${a.totalLessons}**`,`- Items: **${a.totalItems}**`,`- Open/completion items: **${a.openCompletionItems}**`,'','| Grade | Lessons | Items | Accuracy | Completion | Type counts |','|---:|---:|---:|---:|---:|---|'];
  for(const grade of [2,3,5,6,7]){const g=a.grades[grade]??{};lines.push(`| ${grade} | ${g.lessons??0} | ${g.items??0} | ${g.accuracyItems??0} | ${g.completionItems??0} | ${Object.entries(g.types??{}).map(([k,v])=>`${k}:${v}`).join(', ')} |`);}
  lines.push('',`- Count failures: ${a.countFailures.length?a.countFailures.join('; '):'0'}`,`- passThreshold != 80: ${a.passThresholdNot80.length}`,`- Missing objective answers: ${a.missingObjectiveAnswers.length}`,`- Duplicate slugs: ${a.duplicateSlugs.length}`,`- Unknown types: ${a.unknownTypes.length}`,'');
  return lines.join('\n');
}
