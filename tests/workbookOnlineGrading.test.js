import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assessmentSetForSession,
  isScoredItem,
  masteryModeForItem,
  scoredItemCount,
  CURRENT_WORKBOOK_MASTERY_CONTRACT_VERSION,
  MASTERY_MODE_ACCURACY,
  MASTERY_MODE_COMPLETION,
  SOURCE_ONLY_ASSESSMENT,
  WORKBOOK_ALL_ITEMS_ASSESSMENT
} from '../src/core/assessmentPolicy.js';
import { expectedResponseDisplay } from '../src/core/questionTypes.js';
import { createSession, getSessionMetrics, qualifySessionIfEligible, submitAnswer } from '../src/core/sessionMachine.js';
import { lessonRegistry } from '../src/data/publishedLessonCatalog.js';
import { g5WorkbookRegistry } from '../src/data/workbooks/g5/index.js';
import { g6U1WorkbookRegistry } from '../src/data/g6-u1-workbook-catalog.js';
import { g6U2WorkbookRegistry } from '../src/data/g6-u2-workbook-catalog.js';
import { g6U3WorkbookRegistry } from '../src/data/g6-u3-workbook-catalog.js';
import { g6WorkbookRemainingRegistry } from '../src/data/workbooks/g6/index.js';
import { g7U1WorkbookRegistry } from '../src/data/g7-u1-workbook-catalog.js';
import { g7U2WorkbookRegistry } from '../src/data/g7-u2-workbook-catalog.js';
import { g7U3WorkbookRegistry } from '../src/data/g7-u3-workbook-catalog.js';

const sourceItems = content => content.items.filter(item => item.learningPhase === 'source');
const publishedWorkbook = lessonRegistry.filter(entry => /^g[567]-u\d{1,2}-wb-/.test(entry.id));

function byId(registry,id) {
  const descriptor=registry.find(entry=>entry.id===id);
  assert.ok(descriptor,`missing ${id}`);
  return descriptor;
}

function publishedById(id) {
  return byId(publishedWorkbook,id);
}

test('all 383 published G5/G6/G7 unit workbook lessons use one current all-items Mastery contract', () => {
  const g5=publishedWorkbook.filter(entry=>entry.id.startsWith('g5-'));
  const g6=publishedWorkbook.filter(entry=>entry.id.startsWith('g6-'));
  const g7=publishedWorkbook.filter(entry=>entry.id.startsWith('g7-'));
  assert.equal(g5.length,141);
  assert.equal(g6.length,197);
  assert.equal(g7.length,45);
  assert.equal(publishedWorkbook.length,383);
  for(const descriptor of publishedWorkbook) {
    assert.equal(descriptor.assessmentPolicy,WORKBOOK_ALL_ITEMS_ASSESSMENT,descriptor.id);
    assert.equal(descriptor.assessmentContractVersion,CURRENT_WORKBOOK_MASTERY_CONTRACT_VERSION,descriptor.id);
    assert.equal(descriptor.assessmentContractVersion,2,descriptor.id);
    assert.equal(descriptor.completionPolicy,'all-items',descriptor.id);
    assert.equal(descriptor.passThreshold,80,descriptor.id);
    assert.match(descriptor.assessmentLabel,/Mastery tính tất cả câu/);
  }
});

test('383/383 unit workbook lessons put every visible item in the Mastery denominator', async () => {
  const census={
    g5:{lessons:0,items:0,accuracy:0,completion:0},
    g6:{lessons:0,items:0,accuracy:0,completion:0},
    g7:{lessons:0,items:0,accuracy:0,completion:0}
  };

  for(const descriptor of publishedWorkbook) {
    const content=await descriptor.loadContent();
    const set={...descriptor,...content};
    const grade=descriptor.id.slice(0,2);
    census[grade].lessons+=1;
    census[grade].items+=content.items.length;
    assert.equal(scoredItemCount(set),content.items.length,`${descriptor.id}: mastery denominator must equal items.length`);

    for(const item of content.items) {
      assert.equal(isScoredItem(set,item),true,`${item.id}: every workbook item must count`);
      assert.equal(item.assessmentMode,'scored',`${item.id}: published item must not remain unscored`);
      const mode=masteryModeForItem(set,item);
      assert.ok([MASTERY_MODE_ACCURACY,MASTERY_MODE_COMPLETION].includes(mode),`${item.id}: invalid masteryMode`);
      assert.equal(item.masteryMode,mode,`${item.id}: published content must carry explicit masteryMode`);
      census[grade][mode]+=1;
      if(mode===MASTERY_MODE_ACCURACY) {
        assert.ok(expectedResponseDisplay(item).length>0,`${item.id}: accuracy item needs deterministic expected response`);
      }
    }
  }

  assert.equal(census.g5.completion,0,'G5 controlled adaptations should remain objective');
  assert.equal(census.g7.completion,33,'audited G7 open/pronunciation source interactions');
  assert.ok(census.g6.completion>0,'G6 must include real completion-mode open/pronunciation practice');
  assert.equal(census.g5.lessons+census.g6.lessons+census.g7.lessons,383);
  console.log('WORKBOOK_MASTERY_CENSUS',JSON.stringify(census));
});

test('current workbook accuracy is reversible while completion remains positive-only', () => {
  const set={
    id:'g6-u99-wb-contract',version:1,passThreshold:80,typingTolerance:true,
    completionPolicy:'all-items',assessmentPolicy:WORKBOOK_ALL_ITEMS_ASSESSMENT,assessmentContractVersion:2,
    items:[
      {id:'v1',type:'mcq',learningPhase:'vocab',masteryMode:'accuracy',choices:[{id:'A',text:'right'},{id:'B',text:'wrong'}],correctChoiceId:'A'},
      {id:'p1',type:'mcq',learningPhase:'phrase',masteryMode:'accuracy',choices:[{id:'A',text:'right'},{id:'B',text:'wrong'}],correctChoiceId:'A'},
      {id:'s1',type:'mcq',learningPhase:'source',masteryMode:'accuracy',choices:[{id:'A',text:'right'},{id:'B',text:'wrong'}],correctChoiceId:'A'},
      {id:'open',type:'typing',learningPhase:'source',masteryMode:'completion',responseMode:'open',vi:'Write about you',en:'sample'},
      {id:'s2',type:'mcq',learningPhase:'source',masteryMode:'accuracy',choices:[{id:'A',text:'right'},{id:'B',text:'wrong'}],correctChoiceId:'A'}
    ]
  };
  let session=createSession({studentName:'Lan',set,now:1});
  for(const response of ['A','A','A','My answer']) {
    session=submitAnswer({session,set,response,now:(session.attempts.length+2)}).session;
  }
  assert.equal(getSessionMetrics(session,set,20).mastery,80);
  const wrong=submitAnswer({session,set,response:'B',now:30});
  session=wrong.session;
  assert.equal(wrong.event.masteryDeltaUnits,-1);
  assert.equal(wrong.event.masteryDeltaPercent,-20);
  assert.equal(getSessionMetrics(session,set,31).mastery,60);
  assert.equal(session.attempts[3].masteryMode,'completion');
  assert.equal(session.attempts[3].correct,null,'completion must not fake correctness');
  assert.equal(session.attempts[3].completed,true);
  assert.equal(session.attempts[3].masteryDeltaUnits,1);
  session=qualifySessionIfEligible(session,set);
  assert.notEqual(session.status,'passed');
});

test('below 80 percent cannot PASS even after every question was reached', () => {
  const items=Array.from({length:5},(_,index)=>({
    id:`q${index+1}`,type:'mcq',learningPhase:'source',masteryMode:'accuracy',choices:[{id:'A',text:'wrong'},{id:'B',text:'right'}],correctChoiceId:'B'
  }));
  const set={id:'g5-u99-wb-threshold',version:1,passThreshold:80,completionPolicy:'all-items',assessmentPolicy:WORKBOOK_ALL_ITEMS_ASSESSMENT,assessmentContractVersion:2,items};
  let session=createSession({studentName:'Minh',set,now:1});
  for(let index=0;index<5;index+=1) {
    const result=submitAnswer({session,set,response:index<2?'A':'B',now:index+2});
    session=result.session;
    if(index<2 && result.event.type==='incorrect_retry') {
      session=submitAnswer({session,set,response:'B',now:index+20}).session;
    }
  }
  const metrics=getSessionMetrics(session,set,50);
  assert.equal(metrics.masteryTotal,5);
  assert.ok(metrics.mastery<80);
  session=qualifySessionIfEligible(session,set);
  assert.notEqual(session.status,'passed');
});

test('completion failure does not reveal a fake answer and completion success earns one unit', () => {
  const set={
    id:'g7-u99-wb-open',version:1,passThreshold:80,typingTolerance:true,
    completionPolicy:'all-items',assessmentPolicy:WORKBOOK_ALL_ITEMS_ASSESSMENT,assessmentContractVersion:2,
    items:[{id:'open',type:'typing',learningPhase:'source',masteryMode:'completion',responseMode:'open',vi:'Write one idea',en:'sample answer'}]
  };
  let session=createSession({studentName:'An',set,now:1});
  let result=submitAnswer({session,set,response:'',now:2});
  session=result.session;
  assert.equal(result.event.type,'completion_retry');
  assert.equal(result.event.mastery,0);
  assert.equal(session.attempts[0].correct,null);
  assert.equal(session.attempts[0].completed,false);
  assert.equal(session.attempts[0].answerRevealedAfterAttempt,false);
  result=submitAnswer({session,set,response:'My own idea',now:3});
  session=result.session;
  assert.equal(result.event.type,'completion_success');
  assert.equal(result.event.mastery,100);
  assert.equal(session.attempts[1].correct,null);
  assert.equal(session.attempts[1].completed,true);
  assert.equal(session.attempts[1].masteryDeltaUnits,1);
});

test('schema 8 snapshots contract v2 while active contract-v1 sessions keep historical earned-only law', () => {
  const newSet={
    id:'g5-u01-wb-demo',version:1,passThreshold:80,completionPolicy:'all-items',assessmentPolicy:WORKBOOK_ALL_ITEMS_ASSESSMENT,assessmentContractVersion:2,
    items:[{id:'vocab',type:'mcq',learningPhase:'vocab',assessmentMode:'scored',masteryMode:'accuracy',choices:[{id:'A',text:'x'},{id:'B',text:'y'}],correctChoiceId:'A'}]
  };
  const fresh=createSession({studentName:'Mai',set:newSet,now:1});
  assert.equal(fresh.schemaVersion,8);
  assert.equal(fresh.assessmentPolicyAtStart,WORKBOOK_ALL_ITEMS_ASSESSMENT);
  assert.equal(fresh.assessmentContractVersionAtStart,2);
  assert.equal(fresh.completionPolicyAtStart,'all-items');

  const activeV1={...fresh,assessmentContractVersionAtStart:1,attempts:[]};
  const historicalV1=assessmentSetForSession(activeV1,newSet);
  assert.equal(historicalV1.assessmentContractVersion,1);
  const v1Wrong=submitAnswer({session:activeV1,set:newSet,response:'B',now:2});
  assert.equal(v1Wrong.event.masteryDeltaUnits,0,'active v1 workbook session preserves earned-only historical law');

  const legacyG5={schemaVersion:7,setId:'g5-u01-wb-demo',attempts:[]};
  const historicalG5=assessmentSetForSession(legacyG5,newSet);
  assert.equal(historicalG5.assessmentPolicy,SOURCE_ONLY_ASSESSMENT);
  assert.equal(isScoredItem(historicalG5,newSet.items[0]),false,'legacy G5 preload stays outside its historical denominator');

  const legacyG7={schemaVersion:7,setId:'g7-u01-wb-demo',attempts:[]};
  const historicalG7=assessmentSetForSession(legacyG7,{...newSet,id:'g7-u01-wb-demo'});
  assert.equal(historicalG7.completionPolicy,'explain-and-accept');
});

test('published G6 pronunciation and open production count as completion Mastery, not unscored correctness', async () => {
  const practice=publishedById('g6-u05-wb-a1');
  const practiceContent=await practice.loadContent();
  for(const item of sourceItems(practiceContent)) {
    assert.equal(item.assessmentMode,'scored');
    assert.equal(item.masteryMode,'completion');
    assert.doesNotMatch(item.typingUi?.instruction??'',/không tính/i);
    assert.match(item.teachingFeedback?.correctLabel??'',/Hoàn thành/);
  }

  const open=publishedById('g6-u04-wb-c2');
  const openContent=await open.loadContent();
  for(const item of sourceItems(openContent)) {
    assert.equal(item.responseMode,'open');
    assert.equal(item.assessmentMode,'scored');
    assert.equal(item.masteryMode,'completion');
  }
});

test('published G7 open tasks are completion Mastery while objective items stay accuracy Mastery', async () => {
  const c1=publishedById('g7-u3-wb-c1');
  const c1Content=await c1.loadContent();
  assert.ok(sourceItems(c1Content).every(item=>item.masteryMode==='completion'));
  assert.ok(sourceItems(c1Content).every(item=>item.assessmentMode==='scored'));

  const d1=publishedById('g7-u3-wb-d1');
  const d1Content=await d1.loadContent();
  assert.ok(sourceItems(d1Content).every(item=>item.masteryMode==='accuracy'));
});

test('G5 source word bank stays visible and known U4 source corrections remain intact', async () => {
  const e1=await byId(g5WorkbookRegistry,'g5-u04-wb-e1').loadContent();
  const e1Source=sourceItems(e1);
  assert.deepEqual(e1Source[0].sourceWordBank,['comic','do','pictures','riding','usually']);
  assert.ok(e1Source.every(item=>JSON.stringify(item.sourceWordBank)===JSON.stringify(e1Source[0].sourceWordBank)));

  const e2=await byId(g5WorkbookRegistry,'g5-u04-wb-e2').loadContent();
  assert.equal(sourceItems(e2)[3].vi,'The writer sometimes ___ at the swimming pool.');
  assert.equal(sourceItems(e2)[3].en,'goes swimming');
  assert.doesNotMatch(sourceItems(e2)[3].vi,/Mary/);

  const a3=await byId(g5WorkbookRegistry,'g5-u04-wb-a3').loadContent();
  const phrasePrompts=a3.items.filter(item=>item.learningPhase==='phrase').map(item=>item.prompt);
  assert.ok(phrasePrompts.some(prompt=>prompt.includes('water the flowers')));
  assert.ok(phrasePrompts.every(prompt=>!prompt.includes('play the flowers')));
});

test('G5 F2 controlled writing remains deterministic and learner-visible', async () => {
  let count=0;
  for(const descriptor of g5WorkbookRegistry.filter(entry=>/-wb-f2$/.test(entry.id))) {
    const content=await descriptor.loadContent();
    for(const item of sourceItems(content)) {
      count+=1;
      assert.equal(item.type,'sentence_order',item.id);
      assert.match(item.prompt,/Bản online/);
      assert.match(item.prompt,/hệ thống chấm/);
      assert.equal(item.digitalAdaptation?.kind,'controlled_open_writing_to_sentence_order');
    }
  }
  assert.ok(count>20);
});

test('G6 crossword clues without their original grid remain constrained MCQ', async () => {
  const descriptor=byId(g6WorkbookRemainingRegistry,'g6-u05-wb-b3');
  const content=await descriptor.loadContent();
  const items=sourceItems(content);
  assert.equal(items.length,10);
  assert.ok(items.every(item=>item.type==='mcq'));
  assert.ok(items.every(item=>item.choices.length===4));
  assert.ok(items.every(item=>item.digitalAdaptation?.kind==='crossword_grid_to_mcq_clues'));
  assert.deepEqual(items.map(item=>item.choices.find(choice=>choice.id===item.correctChoiceId)?.text),[
    'wonderful','rock','Mount','Bay','Islands','desert','magnificent','shallow','coast','beach'
  ]);
});

test('raw workbook coverage reflects recovered G6 U4-U12 plus Test Yourself supplements', () => {
  const g6NumericRemaining=g6WorkbookRemainingRegistry.filter(entry=>/^g6-u(?:0[4-9]|1[0-2])-wb-/.test(entry.id));
  const g6TestYourself=g6WorkbookRemainingRegistry.filter(entry=>/^g6-ty[34]-wb-/.test(entry.id));
  assert.equal(g5WorkbookRegistry.length,141);
  assert.equal(g6U1WorkbookRegistry.length,15);
  assert.equal(g6U2WorkbookRegistry.length,14);
  assert.equal(g6U3WorkbookRegistry.length,15);
  assert.equal(g6NumericRemaining.length,153);
  assert.equal(g6TestYourself.length,16);
  assert.equal(g6WorkbookRemainingRegistry.length,169);
  assert.equal(g7U1WorkbookRegistry.length,12);
  assert.equal(g7U2WorkbookRegistry.length,16);
  assert.equal(g7U3WorkbookRegistry.length,17);
});
