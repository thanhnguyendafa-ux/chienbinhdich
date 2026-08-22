import { orderForExposure } from '../../core/exposureOrder.js';
import {
  questionPromptDisplay,
  questionTypeForItem,
  sentenceOrderHasUnusedTokens,
  sentenceOrderMinimumLength,
  typingUiForItem
} from '../../core/questionTypes.js';

const registry = Object.freeze({
  typing: { render: renderTyping, bind: bindTyping },
  mcq: { render: renderMcq, bind: bindMcq },
  true_false: { render: renderTrueFalse, bind: bindTrueFalse },
  sentence_order: { render: renderSentenceOrder, bind: bindSentenceOrder },
  sequence_number: { render: renderSequenceNumber, bind: bindSequenceNumber },
  classification: { render: renderClassification, bind: bindClassification }
});

export function renderQuestionInteraction(item, options = {}) {
  const type = questionTypeForItem(item);
  const definition = registry[type];
  if (!definition) throw new Error(`Unsupported question renderer: ${type}`);
  const interaction = definition.render(item, options);
  if (type === 'mcq') return interaction;
  const readingBlock = readingBlockForItem(item, options.passages ?? []);
  return `${readingBlock ? renderReadingPassage(readingBlock) : ''}${interaction}`;
}

function readingBlockForItem(item, passages = []) {
  const passage = item?.passageId ? passages.find(candidate => candidate.id === item.passageId) : null;
  return passage ?? item?.stimulus ?? null;
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

function renderMcq(item, { exposureKey = item.id, passages = [] } = {}) {
  const choices = orderForExposure(item.choices ?? [], `${exposureKey}:mcq`);
  const passage = item.passageId ? passages.find(candidate => candidate.id === item.passageId) : null;
  const stimulus = item.stimulus ?? null;
  const readingBlock = passage ?? stimulus;
  const promptLabel = passage
    ? 'Chọn phương án có cả True/False và lý do đúng'
    : stimulus
      ? (stimulus.promptLabel ?? 'Đọc bài và chọn Main Idea phù hợp nhất')
      : 'Chọn một đáp án';
  return `
    ${readingBlock ? renderReadingPassage(readingBlock) : ''}
    <div class="prompt-block mixed-prompt-block ${readingBlock ? 'reading-question-prompt' : ''}">
      <p class="prompt-label">${esc(promptLabel)}</p>
      <h1>${esc(questionPromptDisplay(item))}</h1>
    </div>
    <div class="choice-grid mcq-grid ${readingBlock ? 'reading-choice-grid' : ''}" role="group" aria-label="Các lựa chọn">
      ${choices.map((choice, index) => `<button class="choice-btn" type="button" data-choice-id="${escAttr(choice.id)}"><span>${String.fromCharCode(65 + index)}</span><strong>${esc(choice.text)}</strong></button>`).join('')}
    </div>`;
}

function renderReadingPassage(passage) {
  return `
    <section class="reading-passage" aria-label="Bài đọc ${escAttr(passage.title)}">
      <div class="reading-passage-heading"><span>READING</span><strong>${esc(passage.title)}</strong></div>
      <p>${esc(passage.text)}</p>
    </section>`;
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
  const selectMode = sentenceOrderHasUnusedTokens(item);
  return `
    <div class="prompt-block mixed-prompt-block order-prompt">
      <p class="prompt-label">${selectMode ? 'Chọn khối đúng rồi sắp xếp' : 'Chạm vào các từ để tạo câu đúng'}</p>
      <h1>${esc(questionPromptDisplay(item) || 'Sắp xếp thành câu đúng')}</h1>
      ${selectMode ? '<p class="order-helper">Không nhất thiết phải dùng hết các khối. Hãy chọn đúng trước, rồi xếp đúng thứ tự.</p>' : ''}
    </div>
    <div class="sentence-order ${selectMode ? 'select-order' : ''}" data-order-root>
      <div class="token-bank" data-token-bank aria-label="Các khối cho sẵn">
        ${tokens.map(token => tokenButton(token, 'bank')).join('')}
      </div>
      <div class="order-answer-wrap">
        <span>Câu của em</span>
        <div class="order-answer-zone" data-answer-zone aria-live="polite"></div>
      </div>
      <button class="primary-btn order-submit" data-order-submit type="button" disabled>Kiểm tra</button>
    </div>`;
}

function bindSentenceOrder({ root, item, onSubmit, attemptStartedAt }) {
  const bank = root.querySelector('[data-token-bank]');
  const zone = root.querySelector('[data-answer-zone]');
  const submit = root.querySelector('[data-order-submit]');
  const selected = [];
  const minimumLength = sentenceOrderMinimumLength(item);

  const update = () => {
    if (zone) zone.innerHTML = selected.map(token => tokenButton(token, 'answer')).join('');
    if (submit) submit.disabled = selected.length < minimumLength;
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
    if (selected.length < minimumLength) return;
    submit.disabled = true;
    submit.textContent = 'Đang kiểm tra...';
    onSubmit({ response: selected.map(token => token.text), attemptMeta: meta(attemptStartedAt, 'tap', false) });
  });
  bank?.querySelector('button')?.focus({ preventScroll: true });
  return () => bank?.querySelector('button')?.focus({ preventScroll: true });
}

function renderSequenceNumber(item) {
  const lines = item.lines ?? [];
  const lockedNumbers = new Set(lines.map(line => Number(line.lockedPosition)).filter(Number.isInteger));
  const numbers = Array.from({ length: lines.length }, (_, index) => index + 1);
  return `
    <div class="prompt-block mixed-prompt-block sequence-number-prompt">
      <p class="prompt-label">Sắp xếp thứ tự / Đánh số</p>
      <h1>${esc(questionPromptDisplay(item) || 'Đánh số các dòng theo đúng thứ tự')}</h1>
      <p class="sequence-number-helper">Chọn một số rồi bấm vào cả câu phù hợp. Con cũng có thể kéo số sang câu. Số có khóa là số đề đã cho sẵn.</p>
    </div>
    <div class="sequence-number" data-sequence-root>
      <div class="sequence-number-progress" aria-live="polite">
        <strong data-sequence-count>${lockedNumbers.size}/${lines.length} đã xếp</strong>
        <span>Mỗi số chỉ dùng một lần.</span>
      </div>
      <div class="sequence-number-workspace">
        <div class="sequence-number-lines" data-sequence-lines aria-label="Các câu hội thoại cần đánh số">
          ${lines.map(line => sequenceLineRow(line)).join('')}
        </div>
        <aside class="sequence-number-bank-wrap" aria-label="Bộ số thứ tự">
          <span>BỘ SỐ THỨ TỰ</span>
          <div class="sequence-number-bank" data-sequence-bank aria-label="Các số thứ tự từ 1 đến ${lines.length}">
            ${numbers.map(number => sequenceNumberButton(number, { locked: lockedNumbers.has(number) })).join('')}
          </div>
          <p class="sequence-number-selection" data-sequence-selection aria-live="polite">Chọn một số, rồi bấm vào câu phù hợp.</p>
        </aside>
      </div>
      <div class="sequence-number-footer">
        <button class="primary-btn sequence-number-submit" data-sequence-submit type="button" disabled>Kiểm tra</button>
      </div>
    </div>`;
}

function bindSequenceNumber({ root, item, onSubmit, attemptStartedAt }) {
  const bank = root.querySelector('[data-sequence-bank]');
  const submit = root.querySelector('[data-sequence-submit]');
  const count = root.querySelector('[data-sequence-count]');
  const selection = root.querySelector('[data-sequence-selection]');
  const assignments = new Map();
  const lockedLineIds = new Set();
  const lockedNumbers = new Set();
  let activeNumber = null;
  const total = (item.lines ?? []).length;

  for (const line of item.lines ?? []) {
    if (!Number.isInteger(Number(line.lockedPosition))) continue;
    assignments.set(String(line.id), Number(line.lockedPosition));
    lockedLineIds.add(String(line.id));
    lockedNumbers.add(Number(line.lockedPosition));
  }

  const usedNumberOwner = number => {
    for (const [lineId, assigned] of assignments) if (assigned === number) return lineId;
    return null;
  };

  const assign = (lineId, number) => {
    const key = String(lineId);
    const position = Number(number);
    if (lockedLineIds.has(key) || !Number.isInteger(position) || position < 1 || position > total || lockedNumbers.has(position)) return;
    const owner = usedNumberOwner(position);
    if (owner && owner !== key && !lockedLineIds.has(owner)) assignments.delete(owner);
    assignments.set(key, position);
    activeNumber = null;
    update();
  };

  const unassign = lineId => {
    const key = String(lineId);
    if (lockedLineIds.has(key)) return;
    assignments.delete(key);
    activeNumber = null;
    update();
  };

  const update = () => {
    bank?.querySelectorAll('[data-sequence-number]').forEach(button => {
      const number = Number(button.dataset.sequenceNumber);
      const owner = usedNumberOwner(number);
      const locked = lockedNumbers.has(number);
      const used = Boolean(owner);
      const active = !locked && number === activeNumber;
      button.hidden = false;
      button.disabled = locked;
      button.classList.toggle('is-locked', locked);
      button.classList.toggle('is-used', used);
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.setAttribute('aria-label', locked
        ? `Số ${number}, đề đã cho sẵn`
        : used
          ? `Số ${number}, đang dùng. Bấm để chuyển số này sang câu khác`
          : active
            ? `Số ${number}, đang được chọn`
            : `Số ${number}, chưa dùng`);
    });

    root.querySelectorAll('[data-sequence-line-target]').forEach(line => {
      const lineId = String(line.dataset.sequenceLineId);
      const assigned = assignments.get(lineId);
      const locked = lockedLineIds.has(lineId);
      const slot = line.querySelector('[data-sequence-slot]');
      const text = line.querySelector('.sequence-number-line-text')?.textContent?.trim() ?? '';
      if (slot) {
        slot.textContent = assigned ?? '—';
        slot.classList.toggle('has-number', assigned !== undefined);
      }
      line.classList.toggle('has-number', assigned !== undefined);
      line.classList.toggle('is-active-target', activeNumber !== null && !locked);
      if (!locked) line.setAttribute('aria-label', `${assigned === undefined ? 'Câu chưa có số' : `Câu đang mang số ${assigned}`}. ${text}`);
    });

    if (count) count.textContent = `${assignments.size}/${total} đã xếp`;
    if (selection) selection.textContent = activeNumber === null
      ? 'Chọn một số, rồi bấm vào câu phù hợp.'
      : `Đang chọn số ${activeNumber}. Bây giờ con hãy bấm vào câu phù hợp.`;
    if (submit) submit.disabled = assignments.size !== total || new Set(assignments.values()).size !== total;
  };

  bank?.addEventListener('click', event => {
    const button = event.target.closest('[data-sequence-number]');
    if (!button || button.disabled) return;
    const number = Number(button.dataset.sequenceNumber);
    activeNumber = activeNumber === number ? null : number;
    update();
  });

  bank?.querySelectorAll('[data-sequence-number]').forEach(button => {
    if (button.disabled) return;
    button.addEventListener('dragstart', event => {
      const number = button.dataset.sequenceNumber;
      activeNumber = Number(number);
      event.dataTransfer?.setData('text/plain', number);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
      update();
    });
  });

  root.querySelectorAll('[data-sequence-line-target]').forEach(line => {
    if (line.dataset.sequenceLocked === '1') return;
    line.addEventListener('click', () => {
      const lineId = line.dataset.sequenceLineId;
      if (activeNumber !== null) assign(lineId, activeNumber);
      else if (assignments.has(String(lineId))) unassign(lineId);
    });
    line.addEventListener('dragover', event => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    });
    line.addEventListener('drop', event => {
      event.preventDefault();
      const number = Number(event.dataTransfer?.getData('text/plain') || activeNumber);
      assign(line.dataset.sequenceLineId, number);
    });
  });

  submit?.addEventListener('click', () => {
    if (assignments.size !== total || new Set(assignments.values()).size !== total) return;
    submit.disabled = true;
    submit.textContent = 'Đang kiểm tra...';
    const response = {};
    for (const line of item.lines ?? []) response[String(line.id)] = assignments.get(String(line.id));
    onSubmit({ response, attemptMeta: meta(attemptStartedAt, 'tap', false) });
  });

  update();
  const firstInteractive = bank?.querySelector('[data-sequence-number]:not(:disabled)') ?? root.querySelector('[data-sequence-line-target]:not(:disabled)');
  firstInteractive?.focus({ preventScroll: true });
  return () => firstInteractive?.focus({ preventScroll: true });
}

function renderClassification(item, { exposureKey = item.id } = {}) {
  const tokens = orderForExposure(item.tokens ?? [], `${exposureKey}:classification`);
  return `
    <div class="prompt-block mixed-prompt-block classification-prompt">
      <p class="prompt-label">Phân loại vào đúng nhóm</p>
      <h1>${esc(questionPromptDisplay(item) || 'Phân loại các từ')}</h1>
      <p class="classification-helper">Chọn một từ, sau đó chọn nhóm phù hợp. Hãy phân loại hết trước khi kiểm tra.</p>
    </div>
    <div class="classification" data-classification-root>
      <div class="classification-bank-wrap">
        <span>Chưa xếp</span>
        <div class="classification-bank" data-classification-bank aria-label="Các từ chưa phân loại">
          ${tokens.map(classificationTokenButton).join('')}
        </div>
      </div>
      <div class="classification-groups">
        ${(item.groups ?? []).map(group => `
          <section class="classification-group-card" data-classification-card="${escAttr(group.id)}">
            <button class="classification-group-target" type="button" data-classification-group="${escAttr(group.id)}">
              <strong>${esc(group.label)}</strong>${group.helper ? `<small>${esc(group.helper)}</small>` : ''}
            </button>
            <div class="classification-group-zone" data-classification-zone="${escAttr(group.id)}" aria-live="polite"></div>
          </section>`).join('')}
      </div>
      <div class="classification-footer"><span data-classification-count>0/${(item.tokens ?? []).length} đã xếp</span><button class="primary-btn classification-submit" data-classification-submit type="button" disabled>Kiểm tra</button></div>
    </div>`;
}

function bindClassification({ root, item, onSubmit, attemptStartedAt }) {
  const bank = root.querySelector('[data-classification-bank]');
  const submit = root.querySelector('[data-classification-submit]');
  const count = root.querySelector('[data-classification-count]');
  const assignments = new Map();
  let activeTokenId = null;
  const total = (item.tokens ?? []).length;

  const update = () => {
    root.querySelectorAll('[data-classification-token-id]').forEach(button => {
      button.classList.toggle('is-active', button.dataset.classificationTokenId === activeTokenId);
      button.setAttribute('aria-pressed', button.dataset.classificationTokenId === activeTokenId ? 'true' : 'false');
    });
    if (count) count.textContent = `${assignments.size}/${total} đã xếp`;
    if (submit) submit.disabled = assignments.size !== total;
  };

  bank?.addEventListener('click', event => {
    const button = event.target.closest('[data-classification-token-id]');
    if (!button || !bank.contains(button)) return;
    activeTokenId = button.dataset.classificationTokenId;
    update();
  });

  root.querySelectorAll('[data-classification-group]').forEach(target => target.addEventListener('click', () => {
    if (!activeTokenId) return;
    const groupId = target.dataset.classificationGroup;
    const tokenButton = root.querySelector(`[data-classification-token-id="${cssEscape(activeTokenId)}"]`);
    const zone = root.querySelector(`[data-classification-zone="${cssEscape(groupId)}"]`);
    if (!tokenButton || !zone) return;
    assignments.set(activeTokenId, groupId);
    zone.appendChild(tokenButton);
    activeTokenId = null;
    update();
  }));

  root.querySelectorAll('[data-classification-zone]').forEach(zone => zone.addEventListener('click', event => {
    const button = event.target.closest('[data-classification-token-id]');
    if (!button || !zone.contains(button)) return;
    const tokenId = button.dataset.classificationTokenId;
    assignments.delete(tokenId);
    activeTokenId = null;
    bank?.appendChild(button);
    update();
  }));

  submit?.addEventListener('click', () => {
    if (assignments.size !== total) return;
    submit.disabled = true;
    submit.textContent = 'Đang kiểm tra...';
    const response = {};
    for (const token of item.tokens ?? []) response[String(token.id)] = assignments.get(String(token.id));
    onSubmit({ response, attemptMeta: meta(attemptStartedAt, 'tap', false) });
  });

  update();
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

function sequenceNumberButton(number, { locked = false } = {}) {
  return `<button class="sequence-number-token ${locked ? 'is-locked is-used' : ''}" type="button" draggable="${locked ? 'false' : 'true'}" aria-pressed="false" data-sequence-number="${number}" ${locked ? `data-sequence-locked-number="1" disabled aria-label="Số ${number}, đề đã cho sẵn"` : `aria-label="Số ${number}, chưa dùng"`}>${number}</button>`;
}

function sequenceLineRow(line) {
  const locked = Number.isInteger(Number(line.lockedPosition));
  const lockedPosition = locked ? Number(line.lockedPosition) : null;
  return `
    <button class="sequence-number-line ${locked ? 'is-locked has-number' : ''}" type="button" data-sequence-line-id="${escAttr(line.id)}" data-sequence-line-target="1" ${locked ? `data-sequence-locked="1" disabled aria-label="Câu đã được cho sẵn số ${lockedPosition}. ${escAttr(line.text)}"` : `aria-label="Câu chưa có số. ${escAttr(line.text)}"`}>
      <span class="sequence-number-slot ${locked ? 'is-locked has-number' : ''}" data-sequence-slot="${escAttr(line.id)}" aria-hidden="true">${locked ? lockedPosition : '—'}</span>
      <span class="sequence-number-line-text">${esc(line.text)}</span>
    </button>`;
}

function classificationTokenButton(token) {
  return `<button class="classification-token" type="button" aria-pressed="false" data-classification-token-id="${escAttr(token.id)}">${esc(token.text)}</button>`;
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

function cssEscape(value) {
  return globalThis.CSS?.escape ? globalThis.CSS.escape(String(value)) : String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function escAttr(value) {
  return esc(value).replace(/`/g, '&#96;');
}
