import { g2WorkbookUnits, g3WorkbookUnits, g3WorkbookSelfChecks } from './source-spec.js';
import { buildGs23WorkbookLesson, sourceTypeCounts } from './workbook-lesson.js';

const freeze=Object.freeze;
const pad=n=>String(n).padStart(2,'0');

const g2Root=freeze({id:'global2-workbook',name:'Sách bài tập',description:'Global Success 2 SBT · học từ → bài nguồn chuyển online → giải thích · Mastery 80%.',parentId:'global2',order:2});
const g3Root=freeze({id:'global3-workbook',name:'Sách bài tập',description:'Global Success 3 SBT · text-only adaptation → giải thích · Mastery 80%.',parentId:'global3',order:2});

const g2UnitFolders=g2WorkbookUnits.map(spec=>freeze({id:`global2-workbook-u${pad(spec.unit)}`,name:`Unit ${spec.unit} · ${spec.title}`,description:`SBT lớp 2 · 7 activity nguồn · ${spec.sourcePolicy}.`,parentId:g2Root.id,order:spec.unit}));
const g3UnitFolders=g3WorkbookUnits.map(spec=>freeze({id:`global3-workbook-u${pad(spec.unit)}`,name:`Unit ${spec.unit} · ${spec.title}`,description:`SBT lớp 3 · ${spec.sourceItems.length} activity nguồn · ${spec.sourcePolicy}.`,parentId:g3Root.id,order:spec.unit}));
const g3SelfFolders=g3WorkbookSelfChecks.map(spec=>freeze({id:`global3-workbook-sc${pad(spec.selfCheck)}`,name:spec.title,description:`Ôn tập SBT lớp 3 · ${spec.sourceItems.length} activity nguồn · ${spec.sourcePolicy}.`,parentId:g3Root.id,order:90+spec.selfCheck}));

function descriptor(spec,grade,key,folderId,order){
  const id=`g${grade}-${key}-wb`;
  const sourceCount=spec.sourceItems.length;
  const itemCount=sourceCount+spec.vocab.length;
  const sourceTypes=[...new Set(spec.sourceItems.map(item=>item.type==='typing_open'?'typing':item.type))];
  return freeze({
    id,folderId,order,version:1,course:`Global Success ${grade}`,unit:`${spec.title} · Sách bài tập`,title:'Học & làm SBT online',
    subtitle:'Nhắc nhanh → Từ Anh→Việt → Bài SBT → giải thích',expectedTimeMinutes:grade===2?15:18,lessonSlug:id,passThreshold:80,
    completionPolicy:'explain-and-accept',typingTolerance:true,teacher:'Thầy Thành MRT',
    description:`${itemCount} lượt Mastery khi publish: ${spec.vocab.length} từ hỗ trợ + ${sourceCount} activity nguồn. Câu objective tính accuracy; bài mở tính completion.`,
    activityTypes:freeze([...new Set(['mcq',...sourceTypes])]),itemCount,sourceBlockCount:sourceCount,sourcePolicy:spec.sourcePolicy,
    loadContent:()=>Promise.resolve(buildGs23WorkbookLesson(spec,id))
  });
}

export const g2WorkbookFolders=freeze([g2Root,...g2UnitFolders]);
export const g3WorkbookFolders=freeze([g3Root,...g3UnitFolders,...g3SelfFolders]);
export const g2WorkbookRegistry=freeze(g2WorkbookUnits.map(spec=>descriptor(spec,2,`u${pad(spec.unit)}`,`global2-workbook-u${pad(spec.unit)}`,spec.unit)));
export const g3WorkbookRegistry=freeze([
  ...g3WorkbookUnits.map(spec=>descriptor(spec,3,`u${pad(spec.unit)}`,`global3-workbook-u${pad(spec.unit)}`,spec.unit)),
  ...g3WorkbookSelfChecks.map(spec=>descriptor(spec,3,`sc${pad(spec.selfCheck)}`,`global3-workbook-sc${pad(spec.selfCheck)}`,90+spec.selfCheck))
]);

export const gs23WorkbookProductionAudit=freeze({
  grade2:freeze({units:16,sourceBlocks:112,sourcePolicy:'PDF-SOURCE-LOCKED'}),
  grade3:freeze({units:20,selfChecks:4,sourceBlocks:257,sourcePolicy:'PUBLIC-STRUCTURE-ADAPTED'}),
  sourceBlocksTotal:369,
  supplementalVocabMcq:200,
  sourceTypeCounts:freeze(sourceTypeCounts([...g2WorkbookUnits,...g3WorkbookUnits,...g3WorkbookSelfChecks])),
  mastery:freeze({passThreshold:80,publicationPolicy:'workbook-all-items-v1'}),
  ux:freeze({grade2VocabChoices:3,grade2MatchingPairsMax:4,grade2SentenceOrderBlocksMax:5,dragOnly:false})
});
