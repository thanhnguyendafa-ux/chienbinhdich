import test from 'node:test';
import assert from 'node:assert/strict';
import { g5WorkbookFolders, g5WorkbookRegistry, loadG5WorkbookSourceManifest } from '../src/data/workbooks/g5/index.js';
import { renderQuestionInteraction } from '../src/features/drill/questionTypeRegistry.js';

const expectedPerUnit = Object.freeze({
  1:6,2:7,3:7,4:8,5:6,6:7,7:7,8:8,9:7,10:6,
  11:7,12:6,13:8,14:6,15:7,16:8,17:7,18:7,19:8,20:8
});

test('Global Success 5 workbook publishes 20 units and 141 semantic lesson titles', () => {
  assert.equal(g5WorkbookRegistry.length, 141);
  assert.equal(new Set(g5WorkbookRegistry.map(entry => entry.id)).size, 141);
  assert.equal(g5WorkbookFolders.filter(folder => folder.name === 'Sách bài tập').length, 20);
  const counts = {};
  for (const entry of g5WorkbookRegistry) {
    const match = entry.id.match(/^g5-u(\d{2})-wb-/);
    assert.ok(match, entry.id);
    counts[Number(match[1])] = (counts[Number(match[1])] ?? 0) + 1;
    assert.doesNotMatch(entry.title, /\b(?:A[123]|B[12]|E[12]|F[12])\b/);
    assert.ok(entry.expectedTimeMinutes >= 1 && entry.expectedTimeMinutes <= 20);
  }
  assert.deepEqual(counts, expectedPerUnit);
});

test('all 141 workbook lessons load with Grade-3 theory and no open typing', async () => {
  let f2Count = 0;
  const runtimeTypes = new Set();
  for (const entry of g5WorkbookRegistry) {
    const content = await entry.loadContent();
    assert.equal(content.preLessonTheory?.required, true, entry.id);
    assert.equal(content.items.length, entry.itemCount, entry.id);
    assert.ok(content.items.length > 0, entry.id);
    if (content.sourceTrace?.exercise === 'F2') {
      f2Count += 1;
      assert.equal(content.sourceTrace.policy, 'UNIT-FOCUS');
      assert.ok(content.items.some(item => item.learningPhase === 'source' && item.type === 'sentence_order'));
    }
    for (const item of content.items) {
      runtimeTypes.add(item.type);
      assert.notEqual(item.responseMode, 'open', item.id);
      assert.ok(item.teachingFeedback?.reason, item.id);
    }
  }
  assert.equal(f2Count, 20);
  assert.deepEqual([...runtimeTypes].sort(), ['classification','mcq','sentence_order','sequence_number','true_false','typing']);
});

test('G5 workbook retained E2 reading lessons keep source context visible at answer time', async () => {
  const e2 = g5WorkbookRegistry.filter(entry => /-wb-e2$/.test(entry.id));
  assert.equal(e2.length, 19);
  let sourceQuestionCount = 0;
  const runtimeTypes = new Set();
  for (const descriptor of e2) {
    const content = await descriptor.loadContent();
    assert.ok(content.sourceTrace, descriptor.id);
    const readingSection = content.preLessonTheory?.sections?.find(section => section.heading === 'Bài đọc trong SBT');
    const sourceContext = readingSection?.bullets?.[0];
    assert.ok(sourceContext?.length > 40, `${descriptor.id} thiếu passage/context trong source data`);

    const sourceItems = content.items.filter(item => item.learningPhase === 'source');
    assert.ok(sourceItems.length > 0, `${descriptor.id} không có source questions`);
    for (const item of sourceItems) {
      sourceQuestionCount += 1;
      runtimeTypes.add(item.type);
      assert.equal(item.stimulus?.text, sourceContext, `${item.id} không mang passage vào answer item`);
      const html = renderQuestionInteraction(item, { exposureKey:`test:${item.id}`, passages:[] });
      assert.match(html, /class="reading-passage"/, `${item.id} không render passage ở answer-time`);
      assert.match(html, /Bài đọc trong SBT/, `${item.id} không render tiêu đề passage`);
    }
  }
  assert.equal(sourceQuestionCount, 76);
  assert.deepEqual([...runtimeTypes].sort(), ['mcq','true_false','typing']);
});

test('source manifests preserve all 220 workbook task slots and 79 media omissions', async () => {
  let kept=0, omitted=0;
  for (let unit=1;unit<=20;unit+=1) {
    const manifest=await loadG5WorkbookSourceManifest(unit);
    assert.equal(manifest.length,11,`Unit ${unit}`);
    kept += manifest.filter(row=>row.status==='KEEP').length;
    omitted += manifest.filter(row=>row.status==='OMIT').length;
  }
  assert.equal(kept,141);
  assert.equal(omitted,79);
});