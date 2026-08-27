import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { lessonFolders, lessonRegistry } from '../src/data/publishedLessonCatalog.js';
import { g6WorkbookRemainingFolders,g6WorkbookRemainingRegistry,g6WorkbookRemainingSourceManifest } from '../src/data/workbooks/g6/index.js';
import { renderQuestionInteraction } from '../src/features/drill/questionTypeRegistry.js';

const expectedByUnit=Object.freeze({4:14,5:19,6:16,7:17,8:18,9:17,10:18,11:16,12:18});
const sourceItems = content => content.items.filter(item=>item.learningPhase==='source');
const learnerPrompt = item => item.prompt ?? item.vi ?? item.statement ?? '';
const unitFromLessonId = id => Number(/^g6-u(\d{2})-wb-/.exec(id)?.[1]);
const unitRegistry = g6WorkbookRemainingRegistry.filter(descriptor => {
  const unit=unitFromLessonId(descriptor.id);
  return Number.isInteger(unit) && unit>=4 && unit<=12;
});
const unitManifest = g6WorkbookRemainingSourceManifest.filter(row => {
  const unit=Number(row.unit);
  return Number.isInteger(unit) && unit>=4 && unit<=12;
});

test('G6 U4-U12 is published through one SSOT registry with bounded lazy loaders', () => {
  assert.equal(unitRegistry.length,153);
  assert.equal(g6WorkbookRemainingFolders.filter(folder=>/^global6-unit(?:[4-9]|1[0-2])(?:-workbook)?$/.test(folder.id)).length,18);
  for (const [unit,count] of Object.entries(expectedByUnit)) {
    const prefix=`g6-u${String(unit).padStart(2,'0')}-wb-`;
    assert.equal(unitRegistry.filter(x=>x.id.startsWith(prefix)).length,count);
    assert.ok(lessonFolders.some(folder=>folder.id===`global6-unit${unit}-workbook`));
  }
  for (const descriptor of unitRegistry) {
    assert.equal(lessonRegistry.filter(x=>x.id===descriptor.id).length,1,`${descriptor.id} must publish exactly once`);
    assert.equal(typeof descriptor.loadContent,'function',descriptor.id);
  }
});

test('G6 U4-U12 base manifest keeps legacy media omissions while recovered supplements are explicit', () => {
  const retained=unitManifest.filter(x=>x.status==='retained');
  const omitted=unitManifest.filter(x=>x.status==='omitted');
  const recovered=new Set(['8:b2','9:c3','11:b2','11:c3','11:d2c']);
  assert.equal(retained.length,148);
  assert.equal(omitted.length,9);
  assert.ok(omitted.every(x=>/image|picture|map|hình|tranh|bản đồ|lưới/i.test(x.reason)),JSON.stringify(omitted));
  for (const row of omitted) {
    const lessonId=`g6-u${String(row.unit).padStart(2,'0')}-wb-${row.key}`;
    const isPublished=unitRegistry.some(x=>x.id===lessonId);
    assert.equal(isPublished,recovered.has(`${Number(row.unit)}:${row.key}`),lessonId);
  }
});

test('every G6 U4-U12 lesson has Grade-3 theory, exactly 4 vocab + 4 phrase MCQs, and valid source feedback', async () => {
  for (const descriptor of unitRegistry) {
    const content=await descriptor.loadContent();
    const set={...descriptor,...content};
    assert.deepEqual(validateSet(set),[],descriptor.id);
    assert.equal(content.preLessonTheory?.required,true,descriptor.id);
    assert.match(content.preLessonTheory?.title??'',/lớp 3/i,descriptor.id);
    assert.match(content.preLessonTheory?.intro??'',/lớp 3/i,descriptor.id);
    assert.equal(content.sourceTrace?.mediaPolicy,'TEXT-ONLY · no image · no audio',descriptor.id);
    const vocab=content.items.filter(item=>item.learningPhase==='vocab');
    const phrases=content.items.filter(item=>item.learningPhase==='phrase');
    assert.equal(vocab.length,4,`${descriptor.id} vocab preload`);
    assert.equal(phrases.length,4,`${descriptor.id} phrase preload`);
    assert.ok(vocab.every(item=>item.type==='mcq' && /^TỪ VỰNG ·/.test(item.prompt)),`${descriptor.id} vocab MCQ contract`);
    assert.ok(phrases.every(item=>item.type==='mcq' && /^CỤM TỪ ·/.test(item.prompt)),`${descriptor.id} phrase MCQ contract`);
    const source=sourceItems(content);
    assert.equal(source.length,descriptor.sourceItemCount,descriptor.id);
    const unit=unitFromLessonId(descriptor.id);
    assert.ok(Number.isInteger(unit) && unit>=4 && unit<=12,`invalid G6 workbook lesson id: ${descriptor.id}`);
    for (const item of source) {
      assert.ok(item.teachingFeedback?.reason?.length>15,item.id);
      assert.ok(item.teachingFeedback?.theory?.length>15,item.id);
      assert.ok(item.teachingFeedback?.example?.length>2,item.id);
    }
    assert.doesNotMatch(JSON.stringify(content.items),/\.(?:mp3|wav|m4a|ogg|png|jpe?g|gif|webp)(?:["'?]|$)/i,descriptor.id);
  }
});

test('every G6 U4-U12 Reading question carries passage context at answer time', async () => {
  let readingItems=0;
  for (const descriptor of unitRegistry) {
    const content=await descriptor.loadContent();
    for (const item of sourceItems(content).filter(item=>item.stimulus)) {
      readingItems+=1;
      assert.ok(item.stimulus.title?.length>0,item.id);
      assert.ok(item.stimulus.text?.length>40,item.id);
      const html=renderQuestionInteraction(item,{exposureKey:`g6-test:${item.id}`,passages:[]});
      assert.match(html,/class="reading-passage"/,item.id);
      assert.ok(html.includes(item.stimulus.title),item.id);
    }
  }
  assert.ok(readingItems>40,`expected broad Reading coverage, got ${readingItems}`);
});

test('source-fidelity regressions: U10 keeps source clues/dialogues and U12 D2 is Reading MCQ', async () => {
  const byId=new Map(unitRegistry.map(x=>[x.id,x]));
  const u10b3=await byId.get('g6-u10-wb-b3').loadContent();
  const b3=sourceItems(u10b3);
  assert.match(learnerPrompt(b3[0]),/to learn English/);
  assert.match(learnerPrompt(b3[4]),/buy food from the supermarket/);
  const u10b7=await byId.get('g6-u10-wb-b7').loadContent();
  assert.equal(sourceItems(u10b7)[0].type,'mcq');
  const u10c2=await byId.get('g6-u10-wb-c2').loadContent();
  const c2=sourceItems(u10c2).map(learnerPrompt);
  assert.ok(c2.includes('What will it look like?'));
  assert.ok(c2.includes('What will there be around the house?'));
  const u10d1=await byId.get('g6-u10-wb-d1').loadContent();
  assert.match(learnerPrompt(sourceItems(u10d1)[4]),/any neighbours/);
  const u12d2=await byId.get('g6-u12-wb-d2').loadContent();
  const d2=sourceItems(u12d2);
  assert.equal(d2.length,5);
  assert.ok(d2.every(x=>x.type==='mcq' && x.stimulus?.text?.includes('Scientists have worked')));
});
