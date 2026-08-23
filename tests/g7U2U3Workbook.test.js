import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { g7U2WorkbookFolders,g7U2WorkbookRegistry } from '../src/data/g7-u2-workbook-catalog.js';
import { g7U3WorkbookFolders,g7U3WorkbookRegistry } from '../src/data/g7-u3-workbook-catalog.js';
import { renderQuestionInteraction } from '../src/features/drill/questionTypeRegistry.js';

async function load(registry,key,prefix){const descriptor=registry.find(entry=>entry.id===`${prefix}-${key}`);assert.ok(descriptor,`missing ${prefix}-${key}`);return {descriptor,content:await descriptor.loadContent()};}
const loadU2=key=>load(g7U2WorkbookRegistry,key,'g7-u2-wb');
const loadU3=key=>load(g7U3WorkbookRegistry,key,'g7-u3-wb');

function sourceItems(content){return content.items.filter(item=>item.learningPhase==='source');}
function phaseOrder(content){return content.items.map(item=>item.learningPhase);}
const bankCount=html=>(html.match(/class="source-word-bank"/g)??[]).length;

function assertPreloadBeforeSource(content,id){
  const phases=phaseOrder(content);const firstSource=phases.indexOf('source');
  assert.ok(firstSource>=0,`${id} missing source phase`);
  assert.ok(phases.slice(0,firstSource).every(phase=>phase==='vocab'||phase==='phrase'),`${id} preload order`);
  assert.ok(phases.slice(firstSource).every(phase=>phase==='source'),`${id} source must stay after preload`);
}

test('G7 U2 workbook publishes 16 text-based lessons and omits image-dependent B1',()=>{
  assert.deepEqual(g7U2WorkbookFolders.map(folder=>folder.id),['global7-unit2-workbook']);
  assert.equal(g7U2WorkbookFolders[0].parentId,'global7-unit2');
  assert.equal(g7U2WorkbookRegistry.length,16);
  assert.equal(g7U2WorkbookRegistry.some(entry=>entry.id==='g7-u2-wb-b1'),false);
  assert.deepEqual(g7U2WorkbookRegistry.map(entry=>entry.id),['g7-u2-wb-a1','g7-u2-wb-a2','g7-u2-wb-b2','g7-u2-wb-b3','g7-u2-wb-b4','g7-u2-wb-b5','g7-u2-wb-b6','g7-u2-wb-c1','g7-u2-wb-c2','g7-u2-wb-c3','g7-u2-wb-d1','g7-u2-wb-d2','g7-u2-wb-d3','g7-u2-wb-e1','g7-u2-wb-e2','g7-u2-wb-e3']);
});

test('G7 U3 workbook publishes 17 links, creates Unit 3 folder and omits image-dependent B1',()=>{
  assert.deepEqual(g7U3WorkbookFolders.map(folder=>folder.id),['global7-unit3','global7-unit3-workbook']);
  assert.equal(g7U3WorkbookFolders[0].parentId,'global7');
  assert.equal(g7U3WorkbookFolders[1].parentId,'global7-unit3');
  assert.equal(g7U3WorkbookRegistry.length,17);
  assert.equal(g7U3WorkbookRegistry.some(entry=>entry.id==='g7-u3-wb-b1'),false);
  assert.ok(g7U3WorkbookRegistry.some(entry=>entry.id==='g7-u3-wb-d2a'));
  assert.ok(g7U3WorkbookRegistry.some(entry=>entry.id==='g7-u3-wb-d2b'));
});

test('every new workbook lesson validates, has required micro-theory, preload then source, and post-submit feedback',async()=>{
  for(const descriptor of [...g7U2WorkbookRegistry,...g7U3WorkbookRegistry]){
    const content=await descriptor.loadContent();
    assert.equal(content.preLessonTheory?.required,true,`${descriptor.id} theory`);
    assert.match(content.preLessonTheory?.title??'',/^Nhắc nhanh/);
    assert.equal(content.items.length,descriptor.itemCount,`${descriptor.id} count`);
    assertPreloadBeforeSource(content,descriptor.id);
    assert.deepEqual(validateSet({...descriptor,...content}),[],`${descriptor.id} validation`);
    assert.ok(content.items.some(item=>item.learningPhase==='vocab'||item.learningPhase==='phrase'),`${descriptor.id} missing preload`);
    for(const item of content.items){assert.equal(item.theorySupport?.access,'after_submit',`${item.id} feedback access`);assert.ok(item.teachingFeedback?.reason?.length>12,`${item.id} reason`);}
  }
});

test('translation preload uses deterministic 4-choice English-to-Vietnamese MCQ',async()=>{
  for(const descriptor of [...g7U2WorkbookRegistry,...g7U3WorkbookRegistry]){
    const content=await descriptor.loadContent();
    for(const item of content.items.filter(item=>item.learningPhase==='vocab'||item.learningPhase==='phrase')){
      assert.equal(item.type,'mcq');assert.equal(item.choices.length,4);assert.match(item.prompt,/có nghĩa là gì/);assert.ok(item.choices.some(choice=>choice.id===item.correctChoiceId));
    }
  }
});

test('G7 U2 source answers and interaction types match the workbook tasks',async()=>{
  const {content:a1}=await loadU2('a1');assert.deepEqual(sourceItems(a1).map(item=>item.correctChoiceId),['C','B','B','A','D']);
  const {content:b3}=await loadU2('b3');assert.deepEqual(sourceItems(b3).map(item=>item.en),['fit','tofu','weight','bins','harms','chapped lips']);
  assert.ok(sourceItems(b3).every(item=>JSON.stringify(item.sourceWordBank)===JSON.stringify(['tofu','fit','chapped lips','weight','harms','bins'])));
  const {content:b4}=await loadU2('b4');assert.deepEqual(sourceItems(b4).map(item=>item.en),['fast food','cycling','soft drinks','acne','house cleaning']);
  const {content:b5}=await loadU2('b5');assert.ok(sourceItems(b5).every(item=>item.type==='sentence_order'));assert.equal(sourceItems(b5)[0].correctOrder.join(' '),'We eat a lot of garlic to prevent the flu');
  const {content:b6}=await loadU2('b6');assert.equal(sourceItems(b6)[0].type,'classification');assert.deepEqual(sourceItems(b6)[0].groups.map(group=>group.id),['S','V','O','ADV']);
  const {content:d1}=await loadU2('d1');assert.deepEqual(sourceItems(d1).map(item=>item.en),['heart','safe','physical','exercise','sleep','Handwash']);
  const {content:d2}=await loadU2('d2');assert.deepEqual(sourceItems(d2).map(item=>item.correctChoiceId),['B','A','C','A','B','A','C','C']);
  const {content:d3}=await loadU2('d3');assert.deepEqual(sourceItems(d3).map(item=>item.correctChoiceId),['A','A','B','C','B']);
});

test('G7 U2 E3 keeps habit planning and turns open writing into six auto-graded sentence orders',async()=>{
  const {descriptor,content}=await loadU2('e3');const items=sourceItems(content);
  assert.deepEqual(descriptor.activityTypes,['mcq','sentence_order']);
  assert.equal(items.length,7);
  assert.equal(items[0].type,'mcq');
  assert.equal(items[0].correctChoiceId,'C');
  assert.equal(items[0].choices.find(choice=>choice.id==='C').text,'eat a lot of meat and snacks');
  assert.ok(items.slice(1).every(item=>item.type==='sentence_order'));
  assert.equal(items[1].digitalAdaptation?.sourceResponseType,'habit_selection_then_open_writing_about_70_words');
  const paragraph=items.slice(1).map(item=>item.correctOrder.join(' ')).join(' ');
  const wordCount=paragraph.replace(/[,.]/g,'').trim().split(/\s+/).length;
  assert.ok(wordCount>=65&&wordCount<=75,`guided paragraph has ${wordCount} words`);
  assert.match(paragraph,/eat breakfast/);
  assert.match(paragraph,/seven to eight hours/);
  assert.match(paragraph,/chat with my friends/);
});

test('G7 U3 source answers and interaction types match the workbook tasks',async()=>{
  const {content:a1}=await loadU3('a1');assert.deepEqual(sourceItems(a1).map(item=>item.correctChoiceId),['B','A','D','C','C']);
  const {content:a2}=await loadU3('a2');const ed=sourceItems(a2)[0];assert.equal(ed.type,'classification');assert.deepEqual(Object.fromEntries(ed.tokens.map(token=>[token.text,token.correctGroupId])),{joined:'d',planted:'id',watered:'d',started:'id',stayed:'d',listened:'d',watched:'t',played:'d',enjoyed:'d',cooked:'t'});
  const {content:b2}=await loadU3('b2');assert.equal(sourceItems(b2)[0].type,'classification');
  const {content:b3}=await loadU3('b3');assert.deepEqual(sourceItems(b3).map(item=>item.en),['exchange used paper for notebooks','help old people','recycle used bottles','clean up dirty streets','donate food and clothes','plant trees']);
  const {content:b4}=await loadU3('b4');assert.deepEqual(sourceItems(b4).map(item=>item.en),['donate','started','tutor','give','became','write','gave']);
  const {content:b5}=await loadU3('b5');assert.deepEqual(sourceItems(b5).map(item=>item.en),['made','gave','choose','chose','saw','danced','sang','joined','were','plan']);
  const {content:b6}=await loadU3('b6');const conv=sourceItems(b6)[0];assert.equal(conv.type,'classification');assert.deepEqual(Object.fromEntries(conv.tokens.map(token=>[token.id,token.correctGroupId])),{A:'5',B:'1',C:'4',D:'6',E:'2',F:'3'});
  const {content:c2}=await loadU3('c2');assert.deepEqual(Object.fromEntries(sourceItems(c2)[0].tokens.map(token=>[token.text,token.correctGroupId])),{'planting trees':'Minh','tutoring primary children':'Lan','cleaning up the neighbourhood':'Nick','taking care of animals':'Mai'});
  const {content:c3}=await loadU3('c3');assert.equal(sourceItems(c3)[0].type,'classification');assert.equal(sourceItems(c3)[1].responseMode,'open');
  const {content:d1}=await loadU3('d1');assert.deepEqual(sourceItems(d1).map(item=>item.correctChoiceId),['C','B','C','A','B','C','B','A']);
  const {content:d2b}=await loadU3('d2b');assert.deepEqual(sourceItems(d2b).map(item=>item.correctChoiceId),['A','A','B','A','A']);
  const {content:d3}=await loadU3('d3');assert.deepEqual(sourceItems(d3).map(item=>item.correctChoiceId),['C','A','B','C','C','B']);
  const {content:e3}=await loadU3('e3');assert.equal(sourceItems(e3)[0].responseMode,'open');
});

test('genuinely open discussion tasks stay open instead of inventing a single source key',async()=>{
  for(const [loader,key] of [[loadU2,'b2'],[loadU2,'c1'],[loadU2,'c2'],[loadU2,'c3'],[loadU2,'e2'],[loadU3,'c1'],[loadU3,'c3'],[loadU3,'e3']]){
    const {content}=await loader(key);assert.ok(sourceItems(content).some(item=>item.responseMode==='open'),key);
  }
});

test('G7 U2/U3 source word banks render exactly once from their owner items and never leak to preload',async()=>{
  for(const [loader,key] of [[loadU2,'b3'],[loadU2,'b4'],[loadU3,'b3']]){
    const {content}=await loader(key);
    const owner=sourceItems(content).find(item=>item.sourceWordBank?.length);
    assert.ok(owner,`${key} owner`);
    assert.equal(bankCount(renderQuestionInteraction(owner)),1,`${key} owner bank`);
    const preload=content.items.find(item=>item.learningPhase!=='source'&&!item.sourceWordBank?.length);
    assert.ok(preload,`${key} preload`);
    assert.equal(bankCount(renderQuestionInteraction(preload)),0,`${key} preload leak`);
  }
});