import { orderForExposure } from '../../core/exposureOrder.js';
import { questionPromptDisplay, questionTypeForItem, typingUiForItem } from '../../core/questionTypes.js';

const registry = Object.freeze({
  typing: { render: renderTyping, bind: bindTyping },
  mcq: { render: renderMcq, bind: bindMcq },
  true_false: { render: renderTrueFalse, bind: bindTrueFalse },
  sentence_order: { render: renderSentenceOrder, bind: bindSentenceOrder }
});

export function renderQuestionInteraction(item, options = {}) {
  const type = questionTypeForItem(item);
  const definition = registry[type];
  if (!definition) throw new Error(`Unsupported question renderer: ${type}`);
  return definition.render(item, options);
}

export function bindQuestionInteraction({ root, item, onSubmit, attemptStartedAt = Date.now() }) {
  const type = questionTypeForItem(item);
  const definition = registry[type];
  if (!definition) throw new Error(`Unsupported question binder: ${type}`);
  return definition.bind({ root, item, onSubmit, attemptStartedAt });
}

function renderTyping(item, { reviewMode = false } = {}) {
  const typingUi = typingUiForItem(item);
  const promptLabel = reviewMode ? `${typingUi.promptLabel} — không nhìn đáp án` : typingUi.promptLabel;
  return `
    <div class="prompt-block">
      <p class="prompt-label">${esc(promptLabel)}</p>
      <h1>${esc(questionPromptDisplay(item))}</h1>
    </div>
    <form id="question-form" class="answer-form typing-question" novalidate>
      <label class="sr-only" for="answer-input">${esc(typingUi.inputLabel)}</label>
      <input id="answer-input" enterkeyhint="done" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${escAttr(typingUi.placeholder)}" required />
      <button class="primary-btn" type="submit">Kiểm tra</button>
    </form>`;
}

function bindTyping({ root, onSubmit, attemptStartedAt }) {
  const input = root.querySelector('#answer-input');
  const tracker = createInputTracker(input);
  focusInput(input);
  root.querySelector('#question-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const response = input?.value.trim() ?? '';
    if (!response) return;
    setBusy(event.currentTarget.querySelector('button[type="submit"]'));
    onSubmit({ response, attemptMeta: meta(attemptStartedAt, tracker.inputMethod(), tracker.pasteDetected()) });
  });
  return () => focusInput(input);
}

function renderMcq(item, { exposureKey = item.id } = {}) {
  const choices = orderForExposure(item.choices ?? [], `${exposureKey}:mcq`);
  return `
    <div class="prompt-block mixed-prompt-block">
      <p class="prompt-label">Chọn một đáp án</p>
      <h1>${esc(questionPromptDisplay(item))}</h1>
    </div>
    <div class="choice-grid mcq-grid" role="group" aria-label="Các lựa chọn">
      ${choices.map((choice, index) => `<button class="choice-btn" type="button" data-choice-id="${escAttr(choice.id)}"><span>${String.fromCharCode(65 + index)}</span><strong>${esc(choice.text)}</strong></button>`).join('')}
    </div>`;
}

function bindMcq({ root, onSubmit, attemptStartedAt }) {
  root.querySelectorAll('[data-choice-id]').forEach(button => button.addEventListener('click', () => {
    disableChoices(root);
    onSubmit({ response: button.dataset.choiceId, attemptMeta: meta(attemptStartedAt, 'choice', false) });
  }));
  root.querySelector('[data-choice-id]')?.focus({ preventScroll: true });
  return () => root.querySelector('[data-choice-id]')?.focus({ preventScroll: true });
}

function renderTrueFalse(item, { exposureKey = item.id } = {}) {
  const options = orderForExposure([
    { value: true, label: 'TRUE', helper: 'Đúng' },
    { value: false, label: 'FALSE', helper: 'Sai' }
  ], `${exposureKey}:true_false`);
  return `
    <div class="prompt-block mixed-prompt-block">
      <p class="prompt-label">Đúng hay sai?</p>
      <h1>${esc(questionPromptDisplay(item))}</h1>
    </div>
    <div class="choice-grid true-false-grid" role="group" aria-label="Chọn True hoặc False">
      ${options.map(option => `<button class="choice-btn tf-btn" type="button" data-boolean="${option.value}"><strong>${option.label}</strong><small>${option.helper}</small></button>`).join('')}
    </div>`;
}

function bindTrueFalse({ root, onSubmit, attemptStartedAt }) {
  root.querySelectorAll('[data-boolean]').forEach(button => button.addEventListener('click', () => {
    disableChoices(root);
    onSubmit({ response: button.dataset.boolean === 'true', attemptMeta: meta(attemptStartedAt, 'choice', false) });
  }));
  root.querySelector('[data-boolean]')?.focus({ preventScroll: true });
  return () => root.querySelector('[data-boolean]')?.focus({ preventScroll: true });
}

function renderSentenceOrder(item, { exposureKey = item.id } = {}) {
  const tokens = shuffledTokens(item, exposureKey);
  return `
    <div class="prompt-block mixed-prompt-block order-prompt">
      <p class="prompt-label">Chạm vào các từ để tạo câu đúng</p>
      <h1>${esc(questionPromptDisplay(item) || 'Sắp xếp thành câu đúng')}</h1>
    </div>
    <div class="sentence-order" data-order-root>
      <div class="token-bank" data-token-bank aria-label="Từ cho sẵn">
        ${tokens.map(token => tokenButton(token, 'bank')).join('')}
      </div>
      <div class="order-answer-wrap">
        <span>Câu của em</span>
        <div class="order-answer-zone" data-answer-zone aria-live="polite"></div>
      </div>
      <button class="primary-btn order-submit" data-order-submit type="button" disabled>Kiểm tra</button>
    </div>`;
}

function bindSentenceOrder({ root, onSubmit, attemptStartedAt }) {
  const bank = root.querySelector('[data-token-bank]');
  const zone = root.querySelector('[data-answer-zone]');
  const submit = root.querySelector('[data-order-submit]');
  const selected = [];

  const update = () => {
    if (zone) zone.innerHTML = selected.map(token => tokenButton(token, 'answer')).join('');
    if (submit) submit.disabled = selected.length === 0;
    zone?.querySelectorAll('[data-token-key]').forEach(button => button.addEventListener('click', () => {
      const index = selected.findIndex(token => token.key === button.dataset.tokenKey);
      if (index < 0) return;
      const [token] = selected.splice(index, 1);
      bank?.insertAdjacentHTML('beforeend', tokenButton(token, 'bank'));
      bindBankButtons();
      update();
    }));
  };

  const bindBankButtons = () => bank?.querySelectorAll('[data-token-key]').forEach(button => {
    if (button.dataset.bound === '1') return;
    button.dataset.bound = '1';
    button.addEventListener('click', () => {
      const token = { key: button.dataset.tokenKey, text: button.dataset.tokenText };
      selected.push(token);
      button.remove();
      update();
    });
  });

  bindBankButtons();
  submit?.addEventListener('click', () => {
    if (!selected.length) return;
    submit.disabled = true;
    submit.textContent = 'Đang kiểm tra...';
    onSubmit({ response: selected.map(token => token.text), attemptMeta: meta(attemptStartedAt, 'tap', false) });
  });
  bank?.querySelector('button')?.focus({ preventScroll: true });
  return () => bank?.querySelector('button')?.focus({ preventScroll: true });
}

function shuffledTokens(item, exposureKey) {
  const source = (item.displayOrder ?? item.tokens ?? item.correctOrder ?? [])
    .map((text, index) => ({ key: `${item.id}-${index}`, text: String(text) }));
  return orderForExposure(source, `${exposureKey}:order`);
}

function tokenButton(token, location) {
  return `<button class="token-btn ${location === 'answer' ? 'selected-token' : ''}" type="button" data-token-key="${escAttr(token.key)}" data-token-text="${escAttr(token.text)}">${esc(token.text)}</button>`;
}

function disableChoices(root) {
  root.querySelectorAll('.choice-btn').forEach(button => { button.disabled = true; });
}

function setBusy(button) {
  if (!button) return;
  button.disabled = true;
  button.textContent = 'Đang kiểm tra...';
}

function meta(startedAt, inputMethod, pasteDetected) {
  return { startedAt, submittedAt: Date.now(), inputMethod, pasteDetected };
}

function focusInput(input) {
  if (!input) return;
  input.focus({ preventScroll: true });
  window.setTimeout(() => input.scrollIntoView({ block: 'center', behavior: 'smooth' }), 180);
}

function createInputTracker(input) {
  let typed = false;
  let pasted = false;
  input?.addEventListener('paste', () => { pasted = true; });
  input?.addEventListener('beforeinput', event => {
    if (event.inputType === 'insertFromPaste') pasted = true;
    else if (event.inputType?.startsWith('insert')) typed = true;
  });
  return {
    pasteDetected: () => pasted,
    inputMethod: () => pasted && typed ? 'mixed' : pasted ? 'paste' : typed ? 'typed' : 'unknown'
  };
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function escAttr(value) {
  return esc(value).replace(/`/g, '&#96;');
}
