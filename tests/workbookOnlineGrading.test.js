import test from 'node:test';
import assert from 'node:assert/strict';
import { isScoredItem, scoredItemCount } from '../src/core/assessmentPolicy.js';
import { expectedResponseDisplay } from '../src/core/questionTypes.js';
import { createSession, getSessionMetrics, submitAnswer } from '../src/core/sessionMachine.js';
import { lessonRegistry } from '../src/data/publishedLessonCatalog.js';
import { g5WorkbookRegistry } from '../src/data/workbooks/g5/index.js';
import { g6U1WorkbookRegistry } from '../src/data/g6-u1-workbook-catalog.js';
import { g6U2WorkbookRegistry } from '../src/data/g6-u2-workbook-catalog.js';
import { g6U3WorkbookRegistry } from '../src/data/g6-u3-workbook-catalog.js';
import { g6WorkbookRemainingRegistry } from '../src/data/workbooks/g6/index.js';

const sourceItems = content => content.items.filter(item => item.learningPhase === 'source');
const publishedWorkbook = lessonRegistry.filter(entry => /^g[56]-u\d{1,2}-wb-/.test(entry.id));

function byId(registry,id) {
  const descriptor=registry.find(entry=>entry.id===id);
  assert.ok(descriptor,`missing ${id}`);
  return descriptor;
}

test('published G5/G6 workbooks use source-only graded assessment with real 80% qualification', () => {
  const g5=publishedWorkbook.filter(entry=>entry.id.startsWith('g5-'));
  const g6=publishedWorkbook.filter(entry=>entry.id.startsWith('g6-'));
  assert.equal(g5.length,141);
  assert.equal(g6.length,192);
  for(const descriptor of publishedWorkbook) {
    assert.equal(descriptor.assessmentPolicy,'source-only',descriptor.id);
    assert.equal(descriptor.completionPolicy,'all-items',descriptor.id);
    assert.equal(descriptor.passThreshold,80,descriptor.id);
    assert.match(descriptor.assessmentLabel,/Điểm SBT chỉ tính câu nguồn/);
  }
});

test('all 333 G5/G6 workbook lessons score only deterministic source interactions', async () => {
  let unscoredOpen=0;
  let scoredSource=0;
  let completionOnlyLessons=0;
  let objectivelyGradedLessons=0;
  for(const descriptor of publishedWorkbook) {
    const content=await descriptor.loadContent();
    const set={...descriptor,...content};
    const graded=scoredItemCount(set);
    if(graded===0) completionOnlyLessons+=1;
    else objectivelyGradedLessons+=1;
    for(const item of content.items) {
      if(item.learningPhase==='vocab'||item.learningPhase==='phrase') {
        assert.equal(isScoredItem(set,item),false,`${item.id} preload must be unscored`);
      }
      if(item.responseMode==='open'||item.assessmentMode==='unscored') {
        unscoredOpen+=1;
        assert.equal(isScoredItem(set,item),false,`${item.id} open/practice must be unscored`);
      }
      if(item.learningPhase==='source' && isScoredItem(set,item)) {
        scoredSource+=1;
        assert.notEqual(item.responseMode,'open',item.id);
        assert.ok(expectedResponseDisplay(item).length>0,`${item.id} needs deterministic expected response`);
      }
    }
    if(graded===0) {
      assert.ok(sourceItems(content).length>0,`${descriptor.id} completion-only lesson still needs source practice`);
      assert.ok(sourceItems(content).every(item=>!isScoredItem(set,item)),`${descriptor.id} must not hide a gradable source item`);
    }
  }
  assert.ok(completionOnlyLessons>0,'expected genuine open/pronunciation lessons to be completion-only');
  assert.ok(objectivelyGradedLessons>300,`expected broad objectively graded coverage, got ${objectivelyGradedLessons}`);
  assert.ok(unscoredOpen>0,'expected real open workbook tasks to remain available but unscored');
  assert.ok(scoredSource>500,`expected broad graded source coverage, got ${scoredSource}`);
});

test('preload and open practice complete without changing Mastery; source answer alone earns the score', () => {
  const set={
    id:'grading-contract',version:1,passThreshold:80,typingTolerance:true,
    completionPolicy:'all-items',assessmentPolicy:'source-only',
    items:[
      {id:'vocab',type:'mcq',learningPhase:'vocab',choices:[{id:'A',text:'x'}],correctChoiceId:'A'},
      {id:'open',type:'typing',learningPhase:'source',responseMode:'open',vi:'Write about you',en:'personal answer'},
      {id:'source',type:'mcq',learningPhase:'source',choices:[{id:'A',text:'wrong'},{id:'B',text:'right'}],correctChoiceId:'B'}
    ]
  };
  let session=createSession({studentName:'Lan',set,now:1});
  let result=submitAnswer({session,set,response:'A',now:2});
  session=result.session;
  assert.equal(result.event.mastery,0);
  assert.equal(result.event.assessmentMode,'unscored');
  result=submitAnswer({session,set,response:'My own answer',now:3});
  session=result.session;
  assert.equal(result.event.mastery,0);
  assert.equal(result.event.assessmentMode,'unscored');
  result=submitAnswer({session,set,response:'B',now:4});
  session=result.session;
  assert.equal(result.event.mastery,100);
  assert.equal(result.event.assessmentMode,'scored');
  assert.equal(session.status,'passed');
  const metrics=getSessionMetrics(session,set,5);
  assert.equal(metrics.gradedTotal,1);
  assert.equal(metrics.unscoredTotal,2);
  assert.equal(metrics.mastery,100);
  assert.deepEqual(session.attempts.map(attempt=>attempt.masteryDeltaUnits),[0,0,1]);
});

test('graded workbook cannot pass below 80 percent even after all items were attempted', () => {
  const items=Array.from({length:5},(_,index)=>({
    id:`q${index+1}`,type:'mcq',learningPhase:'source',choices:[{id:'A',text:'wrong'},{id:'B',text:'right'}],correctChoiceId:'B'
  }));
  const set={id:'threshold-contract',version:1,passThreshold:80,completionPolicy:'all-items',assessmentPolicy:'source-only',items};
  let session=createSession({studentName:'Minh',set,now:1});
  for(let index=0;index<5;index+=1) {
    const response=index<2?'A':'B';
    const result=submitAnswer({session,set,response,now:index+2});
    session=result.session;
    if(index<4 && !result.event.passed) {
      while(session.currentPromptKind==='retry') {
        const retry=submitAnswer({session,set,response:'B',now:index+20});
        session=retry.session;
      }
    }
  }
  assert.ok(getSessionMetrics(session,set,50).mastery<80);
  assert.notEqual(session.status,'passed');
});

test('G5 source word bank stays visible in item metadata and known U4 ambiguities are corrected', async () => {
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

test('G5 F2 tells learners why open writing became auto-graded sentence order', async () => {
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

test('G6 crossword clues without their original grid use constrained MCQ instead of synonym-fragile typing', async () => {
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

test('G6 self-confirmed pronunciation and genuine open production remain unscored in published assessment', async () => {
  const published=new Map(publishedWorkbook.map(entry=>[entry.id,entry]));
  const practice=published.get('g6-u05-wb-a1');
  const practiceContent=await practice.loadContent();
  assert.ok(sourceItems(practiceContent).every(item=>item.assessmentMode==='unscored'));
  assert.ok(sourceItems(practiceContent).every(item=>!isScoredItem({...practice,...practiceContent},item)));

  const open=published.get('g6-u04-wb-c2');
  const openContent=await open.loadContent();
  assert.ok(sourceItems(openContent).every(item=>item.responseMode==='open'));
  assert.ok(sourceItems(openContent).every(item=>!isScoredItem({...open,...openContent},item)));
});

test('raw G6 workbook coverage used by published grading remains 192 lessons', () => {
  assert.equal(g6U1WorkbookRegistry.length,15);
  assert.equal(g6U2WorkbookRegistry.length,14);
  assert.equal(g6U3WorkbookRegistry.length,15);
  assert.equal(g6WorkbookRemainingRegistry.length,148);
});
