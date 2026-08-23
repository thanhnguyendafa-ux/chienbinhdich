import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { g2WorkbookRegistry } from '../src/data/workbooks/gs23/index.js';
import { applyLessonContentOverride } from '../src/services/effectiveLessonService.js';
import { mediaAssetById } from '../src/core/mediaCatalog.js';
import { renderQuestionWithMedia } from '../src/features/drill/questionMediaRenderer.js';

async function effectiveUnit(index){
  const base=await g2WorkbookRegistry[index].loadContent();
  return applyLessonContentOverride(base,null);
}

test('G2 Units 1-5 attach repo-SSOT image media after content resolution while Unit 6 remains unchanged',async()=>{
  for(let unit=1;unit<=5;unit+=1){
    const lesson=await effectiveUnit(unit-1);
    assert.equal(lesson.mediaPolicy.source,'repo-ssot');
    assert.equal(lesson.mediaPolicy.provider,'imagekit');
    assert.equal(lesson.preLessonTheory.media.imageAssetIds.length,1);
    assert.equal(lesson.items.length,10);

    for(let vocab=1;vocab<=3;vocab+=1){
      const id=`g2-u${String(unit).padStart(2,'0')}-wb-vocab-${String(vocab).padStart(2,'0')}`;
      assert.ok(lesson.items.find(item=>item.id===id)?.media,`${id} should have image media`);
    }

    for(const sourceIndex of [1,2,3,4,5,7]){
      const id=`g2-u${String(unit).padStart(2,'0')}-wb-src-${String(sourceIndex).padStart(2,'0')}`;
      const item=lesson.items.find(candidate=>candidate.id===id);
      assert.ok(item?.media,`${id} should have image media`);
      assert.equal(item.digitalAdaptation.kind,'image-supported');
    }

    const recallId=`g2-u${String(unit).padStart(2,'0')}-wb-src-06`;
    const recall=lesson.items.find(item=>item.id===recallId);
    assert.equal(recall.media,undefined,`${recallId} must not leak a pre-answer image`);
    assert.equal(recall.digitalAdaptation.kind,'text-only');

    for(const item of lesson.items.filter(candidate=>candidate.media)){
      for(const assetId of item.media.imageAssetIds) assert.equal(mediaAssetById(assetId).kind,'image');
    }
  }

  const unit6=await effectiveUnit(5);
  assert.equal(unit6.mediaPolicy,undefined);
  assert.ok(unit6.items.every(item=>item.media===undefined));
});

test('media mapping survives admin content override so Firebase content cannot become a second media owner',async()=>{
  const base=await g2WorkbookRegistry[1].loadContent();
  const override={
    revision:7,
    revisionId:'r7',
    baseVersion:base.version,
    items:base.items.map(item=>structuredClone(item))
  };
  const lesson=applyLessonContentOverride(base,override);
  assert.equal(lesson.contentPolicy.source,'admin-override');
  assert.equal(lesson.mediaPolicy.source,'repo-ssot');
  assert.ok(lesson.items.find(item=>item.id==='g2-u02-wb-src-04')?.media);
  assert.equal(lesson.items.find(item=>item.id==='g2-u02-wb-src-06')?.media,undefined);
});

test('question media renderer resolves asset ids through the one ImageKit endpoint and exposes responsive semantic HTML',async()=>{
  const lesson=await effectiveUnit(1);
  const item=lesson.items.find(candidate=>candidate.id==='g2-u02-wb-src-04');
  const html=renderQuestionWithMedia(item,'<div id="interaction">question</div>');
  assert.match(html,/question-media-layout has-single-media/);
  assert.match(html,/https:\/\/ik\.imagekit\.io\/47dprrwyd\/global-success\/g2\/u02\/img\//);
  assert.match(html,/loading="lazy"/);
  assert.match(html,/decoding="async"/);
  assert.match(html,/alt="A girl flying a kite/);
});

test('question media CSS owns mobile stack and laptop two-column behavior without cover-cropping semantic evidence',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const css=readFileSync(new URL('../styles/question-media.css',import.meta.url),'utf8');
  const renderDrill=readFileSync(new URL('../src/features/drill/renderDrill.js',import.meta.url),'utf8');
  const mediaRenderer=readFileSync(new URL('../src/features/drill/questionMediaRenderer.js',import.meta.url),'utf8');
  const mapping=readFileSync(new URL('../src/data/workbooks/gs23/g2-media.js',import.meta.url),'utf8');
  assert.match(html,/\/styles\/question-media\.css/);
  assert.match(css,/@media \(min-width:880px\)/);
  assert.match(css,/grid-template-columns:minmax\(280px,380px\) minmax\(0,1fr\)/);
  assert.match(css,/@media \(max-width:480px\)/);
  assert.match(css,/object-fit:contain/);
  assert.doesNotMatch(css,/object-fit:cover/);
  assert.match(renderDrill,/renderQuestionWithMedia/);
  assert.doesNotMatch(mediaRenderer,/MutationObserver/);
  assert.doesNotMatch(mapping,/https?:\/\//);
  assert.doesNotMatch(mapping,/src-06':(?:single|gallery)/);
});
