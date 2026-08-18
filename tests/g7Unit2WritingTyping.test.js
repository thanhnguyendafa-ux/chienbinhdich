import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { g7U2WritingFolders, g7U2WritingRegistry } from '../src/data/g7-u2-writing-typing-catalog.js';
import { g7U2WritingSource, getG7U2WritingTypingContent } from '../src/data/g7-u2-writing-typing-content.js';
import { lessonFolders as publishedFolders, lessonRegistry as publishedRegistry } from '../src/data/publishedLessonCatalog.js';

function normalized(text) {
  return String(text).toLowerCase().replace(/[“”'’.,?!;:—–-]/g, '').replace(/\s+/g, ' ').trim();
}

function lexicalTokens(text) {
  return String(text).split('·').slice(1).join(' ').trim().split(/\s+/).filter(Boolean);
}

function contentFor(descriptor) {
  return getG7U2WritingTypingContent(descriptor.id.replace('g7-u2-writing-', ''));
}

const SAFE_TITLES = Object.freeze({
  '01': '01 · thói quen · giữ khỏe',
  '02': '02 · ngoài trời · sức khỏe',
  '03': '03 · gia đình · đạp xe',
  '04': '04 · năng động · giữ khỏe',
  '05': '05 · mắt · thuốc nhỏ',
  '06': '06 · ánh sáng mờ · lời khuyên',
  '07': '07 · trái cây · rau củ',
  '08': '08 · vitamin · thực phẩm',
  '09': '09 · thịt · trứng · phô mai',
  '10': '10 · tăng cân · cảnh báo',
  '11': '11 · nước · nước ngọt',
  '12': '12 · vận động · mỗi ngày',
  '13': '13 · đạp xe · bơi · thể thao',
  '14': '14 · ngủ sớm · tám tiếng',
  '15': '15 · phòng · gọn sạch',
  '16': '16 · không khí · ánh nắng'
});

test('G7 U2 publishes exactly 16 one-target writing lessons under 6 structures', () => {
  assert.equal(g7U2WritingRegistry.length, 16);
  assert.equal(g7U2WritingSource.length, 16);
  assert.equal(g7U2WritingFolders.length, 8);
  assert.equal(g7U2WritingFolders.filter(folder => folder.parentId === 'global7-unit2-writing-sentence-builder').length, 6);
  assert.equal(new Set(g7U2WritingRegistry.map(lesson => lesson.id)).size, 16);
  assert.equal(new Set(g7U2WritingRegistry.map(lesson => lesson.lessonSlug)).size, 16);
  assert.equal(new Set(g7U2WritingRegistry.map(lesson => lesson.targetSentenceId)).size, 16);
});

test('all 16 locked targets are exact FINAL answers and total authored item count is 95', () => {
  const sourceById = new Map(g7U2WritingSource.map(record => [record.id, record]));
  let itemTotal = 0;
  for (const descriptor of g7U2WritingRegistry) {
    const source = sourceById.get(descriptor.targetSentenceId);
    const content = contentFor(descriptor);
    const finals = content.items.filter(item => item.scaffoldRole === 'final');
    assert.equal(finals.length, 1, `${descriptor.id} must have exactly one FINAL`);
    assert.equal(finals[0].en, source.targetSentence, `${descriptor.id} FINAL mismatch`);
    assert.equal(content.targetSentenceId, descriptor.targetSentenceId);
    assert.equal(content.items.length, descriptor.itemCount, `${descriptor.id} itemCount mismatch`);
    assert.deepEqual(validateSet({ ...descriptor, items: content.items }), []);
    itemTotal += content.items.length;
  }
  assert.equal(itemTotal, 95);
});

test('engine stage compatibility preserves authored scaffoldRole without violating validator order', () => {
  for (const descriptor of g7U2WritingRegistry) {
    const content = contentFor(descriptor);
    for (const item of content.items) {
      assert.ok(['word', 'chunk', 'sentence_part', 'final'].includes(item.scaffoldRole));
      assert.equal(item.stage, item.scaffoldRole === 'final' ? 'sentence' : 'phrase');
    }
  }
});

test('no pre-final scaffold introduces a foreign full sentence or generic formula', () => {
  const bannedFormula = /S\s*\+\s*V|Modal\s*\+\s*V|Imperative\s*\+/i;
  for (const descriptor of g7U2WritingRegistry) {
    for (const item of contentFor(descriptor).items) {
      assert.doesNotMatch(item.vi, bannedFormula, `${item.id} generic formula leaked into cue`);
      if (item.scaffoldRole !== 'final') assert.notEqual(normalized(item.en), normalized(contentFor(descriptor).targetSentence));
    }
  }
});

test('every pre-final English scaffold is contained in its own target sentence', () => {
  for (const descriptor of g7U2WritingRegistry) {
    const content = contentFor(descriptor);
    const target = normalized(content.targetSentence);
    for (const item of content.items.filter(item => item.scaffoldRole !== 'final')) {
      assert.ok(target.includes(normalized(item.en)), `${item.id} is not contained in target: ${item.en}`);
    }
  }
});

test('Vietnamese cue reuse has one stable English surface form across Unit 2', () => {
  const seen = new Map();
  for (const descriptor of g7U2WritingRegistry) {
    for (const item of contentFor(descriptor).items) {
      if (item.scaffoldRole === 'final') continue;
      const key = normalized(item.vi);
      const value = normalized(item.en);
      if (seen.has(key)) assert.equal(value, seen.get(key), `Ambiguous cue surface form: ${item.vi}`);
      else seen.set(key, value);
    }
  }
});

test('locked ambiguity fixes remain distinct', () => {
  const all = g7U2WritingRegistry.flatMap(descriptor => contentFor(descriptor).items);
  assert.ok(all.find(item => normalized(item.vi) === normalized('có thể dùng thuốc nhỏ mắt') && item.en === 'can use eye drops'));
  assert.ok(all.find(item => normalized(item.vi) === normalized('có khả năng tăng cân') && item.en === 'may put on weight'));
  assert.equal(all.some(item => normalized(item.vi) === normalized('có thể') && ['can', 'may'].includes(item.en)), false);
  assert.ok(all.find(item => normalized(item.vi) === normalized('mỗi ngày') && item.en === 'every day'));
  assert.ok(all.find(item => normalized(item.vi) === normalized('hằng ngày') && item.en === 'daily'));
  assert.ok(all.find(item => normalized(item.vi) === normalized('phần đối lập: còn nước ngọt thì không') && item.en === 'but not soft drinks'));
});

test('normalized transcript lessons are exactly 06, 08 and 14 with explicit notes', () => {
  const records = g7U2WritingSource.filter(record => record.sourceType === 'normalized-transcript');
  assert.deepEqual(records.map(record => record.order), [6, 8, 14]);
  for (const record of records) assert.ok(record.sourceNote.length > 0);
  assert.match(records[0].sourceNote, /shouldn't.*should not/i);
  assert.match(records[1].sourceNote, /They.*Fruits and vegetables/i);
  assert.match(records[2].sourceNote, /8.*eight/i);
});

test('every source record keeps transcript trace metadata', () => {
  for (const source of g7U2WritingSource) {
    assert.ok(source.sourceTrace.length > 0, `${source.id} missing source trace`);
    assert.ok(source.feedbackReason.length > 0, `${source.id} missing feedback reason`);
    assert.ok(source.core.length > 0);
    assert.ok(source.mindset.length > 0);
  }
});

test('catalog uses exact learner-safe titles and never reveals target or FINAL', () => {
  const sourceById = new Map(g7U2WritingSource.map(record => [record.id, record]));
  for (const descriptor of g7U2WritingRegistry) {
    const key = descriptor.id.replace('g7-u2-writing-', '');
    const source = sourceById.get(descriptor.targetSentenceId);
    const final = contentFor(descriptor).items.find(item => item.scaffoldRole === 'final');
    assert.equal(descriptor.title, SAFE_TITLES[key]);
    assert.ok(lexicalTokens(descriptor.title).length >= 2 && lexicalTokens(descriptor.title).length <= 5);
    assert.doesNotMatch(descriptor.title, /[.?!]$/);
    assert.equal(normalized(descriptor.title).includes(normalized(source.targetSentence)), false);
    assert.equal(normalized(descriptor.title).includes(normalized(final.en)), false);
  }
});

test('catalog metadata follows the locked Unit 2 production contract', () => {
  for (const descriptor of g7U2WritingRegistry) {
    assert.equal(descriptor.course, 'Global Success 7');
    assert.equal(descriptor.unit, 'Unit 2 · Healthy Living');
    assert.deepEqual(descriptor.activityTypes, ['typing']);
    assert.equal(descriptor.passThreshold, 80);
    assert.equal(descriptor.completionPolicy, 'all-items');
    assert.equal(descriptor.typingTolerance, false);
    assert.ok(Number.isInteger(descriptor.expectedTimeMinutes));
    assert.ok(descriptor.expectedTimeMinutes >= 8 && descriptor.expectedTimeMinutes <= 18);
    assert.match(descriptor.subtitle, /CHUNK → SENTENCE/);
  }
});

test('published catalog exposes G7 Unit 2 tree and all 16 lessons without duplicating Global 7', () => {
  assert.equal(publishedFolders.filter(folder => folder.id === 'global7').length, 1);
  assert.ok(publishedFolders.find(folder => folder.id === 'global7-unit2' && folder.parentId === 'global7'));
  assert.ok(publishedFolders.find(folder => folder.id === 'global7-unit2-writing-sentence-builder' && folder.parentId === 'global7-unit2'));
  assert.equal(publishedRegistry.filter(lesson => lesson.id.startsWith('g7-u2-writing-')).length, 16);
});

test('final teaching feedback exists and keeps MINDSET FIRST explanation hidden until answer feedback', () => {
  for (const descriptor of g7U2WritingRegistry) {
    const final = contentFor(descriptor).items.find(item => item.scaffoldRole === 'final');
    assert.ok(final.teachingFeedback);
    assert.equal(final.teachingFeedback.correctLabel, final.en);
    assert.ok(final.teachingFeedback.reason.length > 0);
    assert.match(final.teachingFeedback.theory, /MINDSET FIRST/);
  }
});
