import { questionPromptDisplay } from '../../../core/questionTypes.js';
import { renderSourceWordBank } from '../sourceWordBankRenderer.js';
import { attemptMeta, esc, escAttr } from './shared.js';

export const sequenceNumberDefinition = Object.freeze({
  render: renderSequenceNumber,
  bind: bindSequenceNumber
});

function renderSequenceNumber(item) {
  const lines = item.lines ?? [];
  const lockedNumbers = new Set(lines.map(line => Number(line.lockedPosition)).filter(Number.isInteger));
  const numbers = Array.from({ length: lines.length }, (_, index) => index + 1);
  return `
    <div class="prompt-block mixed-prompt-block sequence-number-prompt">
      <p class="prompt-label">Sắp xếp thứ tự / Đánh số</p>
      ${renderSourceWordBank(item)}
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
    onSubmit({ response, attemptMeta: attemptMeta(attemptStartedAt, 'tap', false) });
  });

  update();
  const firstInteractive = bank?.querySelector('[data-sequence-number]:not(:disabled)') ?? root.querySelector('[data-sequence-line-target]:not(:disabled)');
  firstInteractive?.focus({ preventScroll: true });
  return () => firstInteractive?.focus({ preventScroll: true });
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
