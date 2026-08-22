import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { g6U2TrapSource } from '../src/data/g6-u2-trap-source.js';
import { getG6U2TrapContent } from '../src/data/g6-u2-trap-content.js';
import { g6U2TrapTheoryCodes } from '../src/data/g6-u2-trap-prelesson-theory.js';
import { g6U2TrapRegistry } from '../src/data/g6-u2-trap-catalog.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';

const TECHNICAL_JARGON = /\b(referent|evidence|exact target|transcript|semantic|predicate|morphology|noun phrase|NP)\b/i;
const EXPECTED_HEADINGS = [
  '1. Mục tiêu',
  '2. Hiểu bản chất',
  '3. Cách nhận biết',
  '4. Quy tắc / Cách làm',
  '5. Ví dụ Unit 2',
  '6. Bẫy thường gặp',
  '7. Tự kiểm trước khi làm',
  '8. Chốt nhớ'
];

function theoryFor(key) {
  return getG6U2TrapContent(key).preLessonTheory;
}

test('all 21 GS6 Unit 2 trap lessons have systematic Grade 6 theory', () => {
  assert.equal(g6U2TrapSource.length, 21);
  assert.equal(g6U2TrapTheoryCodes.length, 21);
  assert.equal(new Set(g6U2TrapTheoryCodes).size, 21);

  for (const lesson of g6U2TrapSource) {
    const theory = theoryFor(lesson.key);
    assert.equal(theory?.required, true, lesson.key);
    assert.equal(theory?.level, 'grade-6', lesson.key);
    assert.ok(theory.title?.trim(), `${lesson.key} missing theory title`);
    assert.match(theory.intro, /Đọc theo thứ tự từ trên xuống dưới/i, lesson.key);
    assert.deepEqual(theory.sections?.map(section => section.heading), EXPECTED_HEADINGS, lesson.key);
    assert.ok(theory.summary?.trim(), `${lesson.key} missing summary`);
    assert.ok(Array.isArray(theory.sourceSections) && theory.sourceSections.length >= 1, `${lesson.key} missing Unit 2 source sections`);

    const learnerTheory = JSON.stringify({ title: theory.title, intro: theory.intro, sections: theory.sections, summary: theory.summary });
    assert.doesNotMatch(learnerTheory, TECHNICAL_JARGON, `${lesson.key} theory contains unnecessary technical jargon`);

    for (const section of theory.sections) {
      assert.ok(section.bullets.length >= 1, `${lesson.key}/${section.heading} has no content`);
      for (const bullet of section.bullets) {
        assert.ok(bullet.length <= 230, `${lesson.key} theory bullet too long: ${bullet}`);
      }
    }
  }
});

test('theory maps to Global Success Unit 2 lesson sections', () => {
  assert.ok(theoryFor('vocab-odd-01').sourceSections.includes('A Closer Look 1'));
  assert.ok(theoryFor('vocab-odd-01').sourceSections.includes('Looking Back'));
  assert.ok(theoryFor('grammar-preposition-01').sourceSections.includes('A Closer Look 2'));
  assert.ok(theoryFor('grammar-suggestion-01').sourceSections.includes('Communication'));
  assert.ok(theoryFor('reading-tf-01').sourceSections.includes('Skills 2'));
  assert.ok(theoryFor('pronunciation-s-01').sourceSections.includes('Pronunciation'));
});

test('pronunciation theory teaches the physical voiced/unvoiced distinction, not rote lists only', () => {
  const text = JSON.stringify(theoryFor('pronunciation-s-01'));
  assert.match(text, /\/s\/ là âm vô thanh/i);
  assert.match(text, /\/z\/ là âm hữu thanh/i);
  assert.match(text, /không rung/i);
  assert.match(text, /cổ rung/i);
  assert.match(text, /\/p, t, k, f, θ\//i);
  assert.match(text, /lamps/i);
  assert.match(text, /rooms/i);
});

test('grammar theory restores possessive case as a core Unit 2 reminder', () => {
  const text = JSON.stringify(theoryFor('grammar-have-there-01'));
  assert.match(text, /sở hữu cách/i);
  assert.match(text, /Elena’s room/i);
  assert.match(text, /grandmother’s house/i);
  assert.match(text, /A Closer Look 2/i);
  assert.match(text, /“của ai”/i);
});

test('reading theories teach relationship checking rather than keyword matching', () => {
  const tf = JSON.stringify(theoryFor('reading-tf-01'));
  const numbers = JSON.stringify(theoryFor('reading-detail-01'));
  const wh = JSON.stringify(theoryFor('reading-wh-01'));
  assert.match(tf, /True = đúng quan hệ/i);
  assert.match(tf, /living room = bright/i);
  assert.match(numbers, /six → rooms/i);
  assert.match(numbers, /two → bedrooms/i);
  assert.match(wh, /Who → người/i);
  assert.match(wh, /Where → nơi/i);
});

test('required theory metadata survives loadLessonSet for all 21 published trap lessons', async () => {
  assert.equal(g6U2TrapRegistry.length, 21);
  for (const descriptor of g6U2TrapRegistry) {
    const set = await loadLessonSet(descriptor.id);
    assert.equal(set.preLessonTheory?.required, true, descriptor.id);
    assert.equal(set.preLessonTheory?.level, 'grade-6', descriptor.id);
    assert.equal(set.preLessonTheory?.sections?.length, 8, descriptor.id);
    assert.ok(set.preLessonTheory?.sourceSections?.length >= 1, descriptor.id);
  }
});

test('theory gate requires scroll-to-bottom, explicit checkbox, then confirmation before onStart', async () => {
  const renderer = await readFile(new URL('../src/features/drill/renderTheoryGate.js', import.meta.url), 'utf8');
  const entry = await readFile(new URL('../src/features/entry/renderEntry.js', import.meta.url), 'utf8');

  assert.match(renderer, /addEventListener\('scroll'/);
  assert.match(renderer, /scrollTop \+ scrollBox\.clientHeight >= scrollBox\.scrollHeight - 4/);
  assert.match(renderer, /id="theory-confirm-check" type="checkbox"/);
  assert.match(renderer, /id="theory-start-btn" type="button" disabled/);
  assert.match(renderer, /unlocked && check\.checked/);
  assert.match(renderer, /VÀO LÀM BÀI/);
  assert.match(renderer, /Bám theo Unit 2:/);

  assert.match(entry, /directSet\?\.preLessonTheory\?\.required === true/);
  assert.match(entry, /renderTheoryGate\(/);
  assert.match(entry, /onConfirm: async \(\) => onStart\(name\)/);
  assert.match(entry, /resume-btn/);
});

test('theory is shown before session creation so reading time is not question-1 response time', async () => {
  const entry = await readFile(new URL('../src/features/entry/renderEntry.js', import.meta.url), 'utf8');
  const requiredBranch = entry.slice(entry.indexOf("if (requiresTheory)"), entry.indexOf("setBusy(submitButton, 'Đang mở bài...')"));
  assert.match(requiredBranch, /renderTheoryGate\(/);
  assert.doesNotMatch(requiredBranch, /await onStart\(name\)/);
  assert.match(requiredBranch, /onConfirm: async \(\) => onStart\(name\)/);
});
