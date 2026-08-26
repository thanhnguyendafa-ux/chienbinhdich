import g1 from './catalog/u04-u06.js';
import g2 from './catalog/u07-u09.js';
import g3 from './catalog/u10-u12.js';
import { defineG6WorkbookLesson } from './shared/workbook-lesson-v2.js';
import { g6Tap2SupplementFolders, g6Tap2SupplementManifest, g6Tap2SupplementRegistry } from './tap2-supplements.js';

const units=Object.freeze([...g1,...g2,...g3]);
const baseManifest=units.flatMap(x=>x.manifest);
const supplementById=new Map(g6Tap2SupplementManifest.map(row=>[row.id,row]));
function manifestId(row){return `g6-u${String(row.unit).padStart(2,'0')}-wb-${row.key}`;}
const normalizedBaseManifest=baseManifest.map(row=>supplementById.get(manifestId(row))??row);
const normalizedBaseIds=new Set(normalizedBaseManifest.map(row=>row.id??manifestId(row)));
const extraSupplementManifest=g6Tap2SupplementManifest.filter(row=>!normalizedBaseIds.has(row.id));
export const g6WorkbookRemainingSourceManifest=Object.freeze([...normalizedBaseManifest,...extraSupplementManifest]);

const baseFolders=units.flatMap(x=>[Object.freeze({id:`global6-unit${x.unit}`,name:`Unit ${x.unit} · ${x.name}`,description:`Global Success 6 · Unit ${x.unit} · ${x.name}`,parentId:'global6',order:x.unit}),Object.freeze({id:`global6-unit${x.unit}-workbook`,name:`Sách bài tập · Unit ${x.unit}`,description:`SBT Global Success 6 Unit ${x.unit} · đủ bài nguồn; bài phụ thuộc hình/lưới được chuyển sang tương tác text tương đương · có lý thuyết lớp 3 và giải thích sau Submit.`,parentId:`global6-unit${x.unit}`,order:1})]);
export const g6WorkbookRemainingFolders=Object.freeze([...baseFolders,...g6Tap2SupplementFolders]);

const LOADERS=Object.freeze({
  4:()=>Promise.all([import('./units/u04/ab.js'),import('./units/u04/cde.js')]).then(([ab,cde])=>Object.freeze({...ab.default,...cde.default})),
  5:()=>Promise.all([import('./units/u05/ab.js'),import('./units/u05/cd.js'),import('./units/u05/e.js')]).then(([ab,cd,e])=>Object.freeze({...ab.default,...cd.default,...e.default})),
  6:()=>Promise.all([import('./units/u06/ab.js'),import('./units/u06/cd.js'),import('./units/u06/e.js')]).then(([ab,cd,e])=>Object.freeze({...ab.default,...cd.default,...e.default})),
  7:()=>Promise.all([import('./units/u07/ab.js'),import('./units/u07/cde.js')]).then(([ab,cde])=>Object.freeze({...ab.default,...cde.default})),
  8:()=>Promise.all([import('./units/u08/ab.js'),import('./units/u08/cde.js')]).then(([ab,cde])=>Object.freeze({...ab.default,...cde.default})),
  9:()=>Promise.all([import('./units/u09/ab.js'),import('./units/u09/cde.js')]).then(([ab,cde])=>Object.freeze({...ab.default,...cde.default})),
  10:()=>Promise.all([import('./units/u10/ab.js'),import('./units/u10/c.js'),import('./units/u10/d.js'),import('./units/u10/e.js')]).then(([ab,c,d,e])=>Object.freeze({...ab.default,...c.default,...d.default,...e.default})),
  11:()=>Promise.all([import('./units/u11/ab.js'),import('./units/u11/cde.js')]).then(([ab,cde])=>Object.freeze({...ab.default,...cde.default})),
  12:()=>Promise.all([import('./units/u12/ab.js'),import('./units/u12/cde.js')]).then(([ab,cde])=>Object.freeze({...ab.default,...cde.default}))
});

function descriptor(mod,row){const [key,order,title,sourceActivityTypes,sourceItemCount,expectedTimeMinutes]=row;const unit=mod.unit;const id=`g6-u${String(unit).padStart(2,'0')}-wb-${key}`;const activityTypes=[...new Set(['mcq',...sourceActivityTypes,...(sourceActivityTypes.includes('typing')?['sentence_order']:[])])];return Object.freeze({id,folderId:`global6-unit${unit}-workbook`,order,version:2,course:'Global Success 6',unit:`Unit ${unit} · ${mod.name} · Sách bài tập`,title,subtitle:'Nhắc nhanh lớp 3 · 4 từ + 4 cụm Anh→Việt · Bài SBT · Giải thích lớp 3 sau Submit',expectedTimeMinutes:Math.min(20,expectedTimeMinutes+4),lessonSlug:id,passThreshold:80,completionPolicy:'explain-and-accept',typingTolerance:true,teacher:'Thầy Thành MRT',description:`4 câu TỪ VỰNG tiếng Anh → nghĩa Việt + 4 câu CỤM TỪ tiếng Anh → nghĩa Việt + ${sourceItemCount} lượt bài SBT. Bài typing có đáp án chuẩn từ 5 từ trở lên tự chuyển thành sentence_order; bài mở vẫn unscored.`,sourceActivityTypes:Object.freeze(sourceActivityTypes),activityTypes:Object.freeze(activityTypes),sourceItemCount,preloadItemCount:8,itemCount:sourceItemCount+8,loadContent:()=>LOADERS[unit]().then(specs=>{const spec=specs[id];if(!spec)throw new Error(`Unknown G6 workbook lesson: ${id}`);return defineG6WorkbookLesson(spec);})});}
const baseRegistry=units.flatMap(mod=>mod.rows.map(row=>descriptor(mod,row)));
const normalizedSupplementRegistry=g6Tap2SupplementRegistry.map(entry=>Object.freeze({...entry,expectedTimeMinutes:Math.min(20,entry.expectedTimeMinutes),activityTypes:Object.freeze(entry.activityTypes.map(type=>type==='tf'?'true_false':type))}));
export const g6WorkbookRemainingRegistry=Object.freeze([...baseRegistry,...normalizedSupplementRegistry]);
