import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { g6U2TrapSource } from '../src/data/g6-u2-trap-source.js';
import { getG6U2TrapContent } from '../src/data/g6-u2-trap-content.js';
import { g6U2TrapTheoryCodes } from '../src/data/g6-u2-trap-prelesson-theory.js';
import { g6U2TrapRegistry } from '../src/data/g6-u2-trap-catalog.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';

const ADULT_JARGON = /\b(referent|evidence|agreement|exact target|transcript|semantic|predicate|morphology|noun phrase|NP)\b/i;

test('all 21 GS6 Unit 2 trap lessons have a required grade-3-friendly theory pack', () => {
  assert.equal(g6U2TrapSource.length, 21);
  assert.equal(g6U2TrapTheoryCodes.length, 21);
  assert.equal(new Set(g6U2TrapTheoryCodes).size, 21);

  for (const lesson of g6U2TrapSource) {
    const content = getG6U2TrapContent(lesson.key);
    const theory = content.preLessonTheory;
    assert.equal(theory?.required, true, lesson.key);
    assert.ok(theory.title?.trim(), `${lesson.key} missing theory title`);
    assert.match(theory.intro, /Kéo xuống tận cuối/i, lesson.key);
    assert.equal(theory.sections?.length, 4, `${lesson.key} must have 4 simple theory sections`);
    assert.match(theory.sections[0].heading, /Con cần nhớ/, lesson.key);
    assert.match(theory.sections[1].heading, /Ví dụ/, lesson.key);
    assert.match(theory.sections[2].heading, /Bẫy hay gặp/, lesson.key);
    assert.match(theory.sections[3].heading, /Chốt nhớ/, lesson.key);
    assert.ok(theory.summary?.trim(), `${lesson.key} missing summary`);

    const learnerTheory = JSON.stringify(theory);
    assert.doesNotMatch(learnerTheory, ADULT_JARGON, `${lesson.key} theory contains adult jargon`);
    for (const section of theory.sections) {
      for (const bullet of section.bullets) {
        assert.ok(bullet.length <= 150, `${lesson.key} theory bullet too long: ${bullet}`);
      }
    }
  }
});

test('required theory metadata survives loadLessonSet for all 21 published trap lessons', async () => {
  assert.equal(g6U2TrapRegistry.length, 21);
  for (const descriptor of g6U2TrapRegistry) {
    const set = await loadLessonSet(descriptor.id);
    assert.equal(set.preLessonTheory?.required, true, descriptor.id);
    assert.equal(set.preLessonTheory?.sections?.length, 4, descriptor.id);
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
