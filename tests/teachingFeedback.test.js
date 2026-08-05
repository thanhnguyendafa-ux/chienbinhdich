import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSession, submitAnswer } from '../src/core/sessionMachine.js';

const renderSource = readFileSync(new URL('../src/features/drill/renderDrill.js', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const teachingCss = readFileSync(new URL('../styles/teaching-feedback.css', import.meta.url), 'utf8');

test('successful attempt event exposes the learner response without changing Attempt Log evidence', () => {
  const set = {
    id: 'teaching-event',
    version: 1,
    passThreshold: 80,
    items: [{
      id: 'q1',
      type: 'mcq',
      prompt: 'Choose.',
      choices: [{ id: 'gan', text: 'Gán TO BE' }, { id: 'aura', text: 'Aura TO BE' }],
      correctChoiceId: 'gan'
    }]
  };
  const session = createSession({ studentName: 'MRT', set, now: 100 });
  const result = submitAnswer({ session, set, response: 'gan', now: 200 });
  assert.equal(result.event.entered, 'Gán TO BE');
  assert.equal(result.event.answer, 'Gán TO BE');
  assert.equal(result.session.attempts[0].submittedAnswer, 'Gán TO BE');
});

test('teaching feedback is learner-paced while legacy success keeps auto advance', () => {
  assert.match(renderSource, /if \(teachingFeedback\)/);
  assert.match(renderSource, /id="teaching-continue-btn"/);
  assert.match(renderSource, /addEventListener\('click', event =>/);
  assert.match(renderSource, /window\.setTimeout\(onContinue, 430\)/);
  assert.match(renderSource, /Con chọn/);
  assert.match(renderSource, /Đáp án đúng là/);
  assert.match(renderSource, /Lý thuyết/);
  assert.match(renderSource, /Ví dụ/);
});

test('first wrong keeps retrieval intact and reveal path adds full teaching explanation', () => {
  assert.match(renderSource, /Đáp án đúng chưa được hiện/);
  assert.match(renderSource, /feedback\.type === 'incorrect_reveal'/);
  assert.match(renderSource, /renderTeachingFeedback\(\{ entered: feedback\.entered, answer: feedback\.revealAnswer/);
  assert.match(renderSource, /Tự làm lại đúng để hoàn thành correction/);
});

test('app passes the resolved item teaching feedback instead of creating a Set-specific flow', () => {
  assert.match(appSource, /const answeredItem = lesson\.items\.find/);
  assert.match(appSource, /teachingFeedback: answeredItem\?\.teachingFeedback \?\? null/);
  assert.doesNotMatch(appSource, /mrt-g6-gan-aura-action-01/);
});

test('teaching feedback stylesheet is loaded and protects short classroom plus mobile layouts', () => {
  assert.match(indexSource, /\/styles\/teaching-feedback\.css/);
  assert.match(teachingCss, /@media \(min-width:900px\) and \(max-height:620px\)/);
  assert.match(teachingCss, /@media \(max-width:640px\)/);
  assert.match(teachingCss, /teaching-continue-btn/);
  assert.match(teachingCss, /overflow-wrap:anywhere/);
  assert.doesNotMatch(teachingCss, /#[0-9a-fA-F]{3,8}/);
});
