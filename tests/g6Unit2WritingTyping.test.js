import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { g6U2WritingFolders, g6U2WritingRegistry } from '../src/data/g6-u2-writing-typing-catalog.js';
import { g6U2WritingSource, getG6U2WritingTypingContent } from '../src/data/g6-u2-writing-typing-content.js';
import { lessonFolders as publishedFolders, lessonRegistry as publishedRegistry } from '../src/data/publishedLessonCatalog.js';

function normalized(text) {
  return String(text).toLowerCase().replace(/[“”'’.,?!]/g, '').replace(/\s+/g, ' ').trim();
}

function contentFor(descriptor) {
  return getG6U2WritingTypingContent(descriptor.id.replace('g6-u2-writing-', ''));
}

test('G6 U2 publishes exactly 16 one-target writing lessons under 6 structures', () => {
  assert.equal(g6U2WritingRegistry.length, 16);
  assert.equal(g6U2WritingSource.length, 16);
  assert.equal(g6U2WritingFolders.length, 8);
  assert.equal(g6U2WritingFolders.filter(folder => folder.parentId === 'global6-unit2-writing-sentence-builder').length, 6);
  assert.equal(new Set(g6U2WritingRegistry.map(lesson => lesson.id)).size, 16);
  assert.equal(new Set(g6U2WritingRegistry.map(lesson => lesson.lessonSlug)).size, 16);
  assert.equal(new Set(g6U2WritingRegistry.map(lesson => lesson.targetSentenceId)).size, 16);
});

test('all 16 locked targets are exact FINAL answers and every lesson has one FINAL', () => {
  const sourceById = new Map(g6U2WritingSource.map(record => [record.id, record]));
  for (const descriptor of g6U2WritingRegistry) {
    const source = sourceById.get(descriptor.targetSentenceId);
    const content = contentFor(descriptor);
    const finals = content.items.filter(item => item.scaffoldRole === 'final');
    assert.equal(finals.length, 1, `${descriptor.id} must have exactly one FINAL`);
    assert.equal(finals[0].en, source.targetSentence, `${descriptor.id} FINAL mismatch`);
    assert.equal(content.targetSentenceId, descriptor.targetSentenceId);
    assert.equal(content.items.length, descriptor.itemCount, `${descriptor.id} itemCount mismatch`);
    assert.deepEqual(validateSet({ ...descriptor, items: content.items }), []);
  }
});

test('no pre-final scaffold introduces a foreign full sentence or generic formula', () => {
  const bannedFormula = /S\s*\+\s*V|There is\s*\+\s*N|N'?s?\s*\+\s*N/i;
  for (const descriptor of g6U2WritingRegistry) {
    const content = contentFor(descriptor);
    for (const item of content.items) {
      assert.doesNotMatch(item.vi, bannedFormula, `${item.id} generic formula leaked into cue`);
      if (item.scaffoldRole !== 'final') assert.doesNotMatch(item.en, /[.?!]$/, `${item.id} pre-final must not be another full sentence`);
    }
  }
});

test('Vietnamese cue reuse has one stable English surface form across Unit 2', () => {
  const seen = new Map();
  for (const descriptor of g6U2WritingRegistry) {
    for (const item of contentFor(descriptor).items) {
      if (item.scaffoldRole === 'final') continue;
      const key = normalized(item.vi);
      const value = normalized(item.en);
      if (seen.has(key)) assert.equal(value, seen.get(key), `Ambiguous cue surface form: ${item.vi}`);
      else seen.set(key, value);
    }
  }
});

test('determiner-leading scaffold answers have an explicit Vietnamese cue marker', () => {
  for (const descriptor of g6U2WritingRegistry) {
    for (const item of contentFor(descriptor).items) {
      if (item.scaffoldRole === 'final') continue;
      const en = item.en.toLowerCase();
      if (en.startsWith('a ') || en.startsWith('an ')) assert.match(item.vi.toLowerCase(), /một/, `${item.id} must cue a/an with “một”`);
      if (en.startsWith('the ')) assert.match(item.vi.toLowerCase(), /đã xác định/, `${item.id} must cue THE explicitly`);
      if (en.startsWith('my ')) assert.match(item.vi.toLowerCase(), /của tôi/, `${item.id} must cue MY explicitly`);
      if (en.startsWith('your ')) assert.match(item.vi.toLowerCase(), /của bạn/, `${item.id} must cue YOUR explicitly`);
      if (en.startsWith('our ')) assert.match(item.vi.toLowerCase(), /của chúng tôi/, `${item.id} must cue OUR explicitly`);
    }
  }
});

test('WH lessons avoid the ambiguous bare cue “bạn sống”', () => {
  const whLessons = ['10', '12'].flatMap(key => getG6U2WritingTypingContent(key).items);
  assert.equal(whLessons.some(item => normalized(item.vi) === 'bạn sống'), false);
  assert.ok(whLessons.find(item => item.vi.includes('sau từ hỏi WHERE') && item.en === 'do you live'));
  assert.ok(whLessons.find(item => item.vi.includes('sau từ hỏi WHO') && item.en === 'do you live with'));
});

test('every pre-final English scaffold is contained in its own target sentence', () => {
  for (const descriptor of g6U2WritingRegistry) {
    const content = contentFor(descriptor);
    const target = normalized(content.targetSentence);
    for (const item of content.items.filter(item => item.scaffoldRole !== 'final')) {
      assert.ok(target.includes(normalized(item.en)), `${item.id} is not contained in target: ${item.en}`);
    }
  }
});

test('normalized transcript lessons document the exact pronoun-to-noun normalization', () => {
  const normalizedRecords = g6U2WritingSource.filter(record => record.sourceType === 'normalized-transcript');
  assert.deepEqual(normalizedRecords.map(record => record.order), [3, 9, 15]);
  assert.match(normalizedRecords[0].sourceNote, /it.*the living room/i);
  assert.match(normalizedRecords[1].sourceNote, /it.*my bedroom/i);
  assert.match(normalizedRecords[2].sourceNote, /it.*my bedroom/i);
});

test('catalog metadata follows the Unit 2 production contract', () => {
  for (const descriptor of g6U2WritingRegistry) {
    assert.equal(descriptor.course, 'Global Success 6');
    assert.equal(descriptor.unit, 'Unit 2 · My House');
    assert.deepEqual(descriptor.activityTypes, ['typing']);
    assert.equal(descriptor.passThreshold, 80);
    assert.equal(descriptor.completionPolicy, 'all-items');
    assert.equal(descriptor.typingTolerance, false);
    assert.ok(Number.isInteger(descriptor.expectedTimeMinutes));
    assert.ok(descriptor.expectedTimeMinutes >= 8 && descriptor.expectedTimeMinutes <= 18);
    assert.match(descriptor.subtitle, /CHUNK → SENTENCE/);
  }
});

test('published catalog exposes Unit 2 tree and all 16 lessons without breaking the Global 6 parent', () => {
  assert.equal(publishedFolders.filter(folder => folder.id === 'global6').length, 1);
  assert.ok(publishedFolders.find(folder => folder.id === 'global6-unit2' && folder.parentId === 'global6'));
  assert.ok(publishedFolders.find(folder => folder.id === 'global6-unit2-writing-sentence-builder' && folder.parentId === 'global6-unit2'));
  assert.equal(publishedRegistry.filter(lesson => lesson.id.startsWith('g6-u2-writing-')).length, 16);
});

test('final teaching feedback is present and hidden-content ready', () => {
  for (const descriptor of g6U2WritingRegistry) {
    const final = contentFor(descriptor).items.find(item => item.scaffoldRole === 'final');
    assert.ok(final.teachingFeedback);
    assert.equal(final.teachingFeedback.correctLabel, final.en);
    assert.ok(final.teachingFeedback.reason.length > 0);
    assert.match(final.teachingFeedback.theory, /MINDSET FIRST/);
  }
});
