import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateQuestion, questionTypeForItem, questionTypeLabel } from '../src/core/questionTypes.js';
import { validateSet } from '../src/data/contentValidator.js';
import { withWorkbookAllItemsMastery, WORKBOOK_ALL_ITEMS_ASSESSMENT } from '../src/core/assessmentPolicy.js';
import { g2WorkbookRegistry, g3WorkbookRegistry, gs23WorkbookProductionAudit } from '../src/data/workbooks/gs23/index.js';

const allDescriptors=()=>[...g2WorkbookRegistry,...g3WorkbookRegistry];

test('GS2/GS3 production source coverage and vocabulary augmentation stay separated', async()=>{
  assert.equal(g2WorkbookRegistry.length,16);
  assert.equal(g3WorkbookRegistry.length,24);
  assert.equal(gs23WorkbookProductionAudit.grade2.sourceBlocks,112);
  assert.equal(gs23WorkbookProductionAudit.grade3.sourceBlocks,257);
  assert.equal(gs23WorkbookProductionAudit.sourceBlocksTotal,369);
  assert.equal(gs23WorkbookProductionAudit.supplementalVocabMcq,200);

  let source=0,support=0,total=0;
  const ids=new Set();
  for(const descriptor of allDescriptors()){
    assert.equal(descriptor.passThreshold,80);
    const set=await descriptor.loadContent();
    assert.deepEqual(validateSet(set),[],descriptor.id);
    assert.equal(set.items.length,descriptor.itemCount,descriptor.id);
    assert.equal(set.sourceAudit.sourceBlockCount,descriptor.sourceBlockCount,descriptor.id);
    source+=descriptor.sourceBlockCount;
    support+=set.items.filter(item=>item.learningPhase==='vocab').length;
    total+=set.items.length;
    for(const item of set.items){assert.equal(ids.has(item.id),false,`duplicate ${item.id}`);ids.add(item.id);}
  }
  assert.equal(source,369);
  assert.equal(support,200);
  assert.equal(total,569);
});

test('matching is a semantic type with tap-to-target classification adapter', async()=>{
  const set=await g2WorkbookRegistry[0].loadContent();
  const item=set.items.find(candidate=>candidate.type==='matching');
  assert.ok(item);
  assert.equal(questionTypeForItem(item),'classification');
  assert.equal(questionTypeLabel(item),'GHÉP CẶP');
  assert.equal(item.groups.length,item.tokens.length);
  const response=Object.fromEntries(item.tokens.map(token=>[token.id,token.correctGroupId]));
  assert.equal(evaluateQuestion(item,response).correct,true);
  assert.equal(evaluateQuestion(item,{...response,[item.tokens[0].id]:item.groups.at(-1).id}).correct,false);
});

test('Grade 2 interaction budget is enforced by produced content', async()=>{
  for(const descriptor of g2WorkbookRegistry){
    const set=await descriptor.loadContent();
    for(const item of set.items){
      if(item.learningPhase==='vocab') assert.equal(item.choices.length,3,`${item.id} vocab choices`);
      if(item.type==='matching') assert.ok(item.groups.length<=4,`${item.id} matching pairs`);
      if(item.type==='sentence_order') assert.ok(item.tokens.length<=5,`${item.id} order tokens`);
      if(item.type==='sequence_number') assert.ok(item.lines.length<=4,`${item.id} sequence lines`);
    }
  }
  assert.equal(gs23WorkbookProductionAudit.ux.dragOnly,false);
});

test('published-style all-items mastery contract is identical to G5/G6/G7 policy', async()=>{
  for(const base of [g2WorkbookRegistry[0],g3WorkbookRegistry[0]]){
    const descriptor=withWorkbookAllItemsMastery(base);
    assert.equal(descriptor.passThreshold,80);
    assert.equal(descriptor.assessmentPolicy,WORKBOOK_ALL_ITEMS_ASSESSMENT);
    assert.equal(descriptor.completionPolicy,'all-items');
    assert.equal(descriptor.assessmentContractVersion,1);
    const set=await descriptor.loadContent();
    assert.ok(set.items.every(item=>item.assessmentMode==='scored'));
    const open=set.items.find(item=>item.responseMode==='open');
    if(open) assert.equal(open.masteryMode,'completion');
    const objective=set.items.find(item=>item.responseMode!=='open');
    assert.equal(objective.masteryMode,'accuracy');
  }
});
