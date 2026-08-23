import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSession, submitAnswer } from '../src/core/sessionMachine.js';
import { getQuestionContext } from '../src/features/drill/questionContext.js';

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

test('MCQ question context is derived from the item prompt and not duplicated teaching metadata', () => {
  const item = {
    id: 'mcq-context',
    type: 'mcq',
    prompt: 'Cho câu: “Nam là một học sinh.” Câu này thuộc loại nào?',
    teachingFeedback: {
      question: 'NỘI DUNG SAI KHÔNG ĐƯỢC DÙNG',
      correctLabel: 'Gán TO BE',
      reason: 'reason',
      theory: 'theory',
      example: 'example'
    }
  };
  assert.deepEqual(getQuestionContext(item), {
    heading: 'Thông tin câu hỏi',
    rows: [
      { label: 'Câu', value: 'Nam là một học sinh.' },
      { label: 'Yêu cầu', value: 'Câu này thuộc loại nào?' }
    ]
  });
});

test('True/False question context preserves both sentence and the claim being judged', () => {
  const item = {
    id: 'tf-context',
    type: 'true_false',
    statement: 'Cho câu: “Mai là bạn cùng lớp của tôi.” Nhận định: Đây là câu Hành động VERB.',
    answer: false
  };
  assert.deepEqual(getQuestionContext(item), {
    heading: 'Thông tin câu hỏi',
    rows: [
      { label: 'Câu', value: 'Mai là bạn cùng lớp của tôi.' },
      { label: 'Nhận định cần kiểm tra', value: 'Đây là câu Hành động VERB.' }
    ]
  });
});

test('generic question context has safe fallbacks for typing and sentence order', () => {
  assert.deepEqual(getQuestionContext({ id: 'typing', type: 'typing', vi: 'Lan thân thiện.', en: 'Lan is friendly.' }), {
    heading: 'Thông tin câu hỏi',
    rows: [
      { label: 'Tiếng Việt', value: 'Lan thân thiện.' },
      { label: 'Yêu cầu', value: 'Dịch sang tiếng Anh.' }
    ]
  });
  assert.deepEqual(getQuestionContext({ id: 'order', type: 'sentence_order', prompt: 'Tạo câu đúng.', correctOrder: ['Lan', 'is', 'friendly.'] }), {
    heading: 'Thông tin câu hỏi',
    rows: [
      { label: 'Câu cần tạo', value: 'Tạo câu đúng.' },
      { label: 'Yêu cầu', value: 'Sắp xếp các từ thành câu đúng.' }
    ]
  });
});

test('teaching feedback is learner-paced and resolved feedback includes derived question context', () => {
  const feedbackStart = renderSource.indexOf('if (teachingFeedback)');
  const firstInteraction = renderSource.indexOf('interaction.innerHTML', feedbackStart);
  const automaticFeedbackStart = renderSource.indexOf('interaction.innerHTML', firstInteraction + 1);
  const teachingBranch = renderSource.slice(feedbackStart, automaticFeedbackStart);

  assert.ok(feedbackStart >= 0 && firstInteraction >= 0 && automaticFeedbackStart > firstInteraction);
  assert.match(teachingBranch, /renderTeachingFeedback\(\{ item, entered, answer, teachingFeedback, includeContinue: true \}\)/);
  assert.match(teachingBranch, /querySelector\('#teaching-continue-btn'\)/);
  assert.match(teachingBranch, /addEventListener\('click', event =>/);
  assert.match(teachingBranch, /event\.currentTarget\.disabled = true;[\s\S]*onContinue\(\);/);
  assert.match(teachingBranch, /focus\(\{ preventScroll: true \}\);[\s\S]*return;/);
  assert.doesNotMatch(teachingBranch, /window\.setTimeout/);
  assert.match(renderSource, /id="teaching-continue-btn"/);
  assert.match(renderSource, /renderQuestionContext\(item\)/);
  assert.match(renderSource, /Con chọn/);
  assert.match(renderSource, /Đáp án đúng là/);
  assert.match(renderSource, /Lý thuyết/);
  assert.match(renderSource, /Ví dụ/);
});

test('first wrong keeps retrieval intact with context and reveal path adds the full explanation', () => {
  assert.match(renderSource, /item\?\.teachingFeedback \? renderQuestionContext\(item\) : ''/);
  assert.match(renderSource, /Đáp án đúng chưa được hiện/);
  assert.match(renderSource, /feedback\.type === 'incorrect_reveal'/);
  assert.match(renderSource, /renderTeachingFeedback\(\{ item, entered: feedback\.entered, answer: feedback\.revealAnswer/);
  assert.match(renderSource, /Tự làm lại đúng để hoàn thành correction/);
});

test('app passes the resolved item and teaching feedback without creating a Set-specific flow', () => {
  assert.match(appSource, /const answeredItem = lesson\.items\.find/);
  assert.match(appSource, /item: answeredItem/);
  assert.match(appSource, /teachingFeedback: answeredItem\?\.teachingFeedback \?\? null/);
  assert.doesNotMatch(appSource, /mrt-g6-gan-aura-action-01/);
});

test('teaching feedback stylesheet loads question context and protects short classroom plus mobile layouts', () => {
  assert.match(indexSource, /\/styles\/teaching-feedback\.css/);
  assert.match(teachingCss, /\.question-context\{/);
  assert.match(teachingCss, /\.question-context-row\{/);
  assert.match(teachingCss, /@media \(min-width:900px\) and \(max-height:620px\)/);
  assert.match(teachingCss, /@media \(max-width:640px\)/);
  assert.match(teachingCss, /teaching-continue-btn/);
  assert.match(teachingCss, /overflow-wrap:anywhere/);
  assert.doesNotMatch(teachingCss, /#[0-9a-fA-F]{3,8}/);
});
