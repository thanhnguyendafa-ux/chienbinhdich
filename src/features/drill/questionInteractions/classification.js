import { orderForExposure } from '../../../core/exposureOrder.js';
import { questionPromptDisplay } from '../../../core/questionTypes.js';
import { renderSourceWordBank } from '../sourceWordBankRenderer.js';
import { attemptMeta, cssEscape, esc, escAttr } from './shared.js';

export const classificationDefinition = Object.freeze({
  render: renderClassification,
  bind: bindClassification
});

function renderClassification(item, { exposureKey = item.id } = {}) {
  const tokens = orderForExposure(item.tokens ?? [], `${exposureKey}:classification`);
  return `
    <div class="prompt-block mixed-prompt-block classification-prompt">
      <p class="prompt-label">Phân loại vào đúng nhóm</p>
      ${renderSourceWordBank(item)}
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
    onSubmit({ response, attemptMeta: attemptMeta(attemptStartedAt, 'tap', false) });
  });

  update();
  bank?.querySelector('button')?.focus({ preventScroll: true });
  return () => bank?.querySelector('button')?.focus({ preventScroll: true });
}

function classificationTokenButton(token) {
  return `<button class="classification-token" type="button" aria-pressed="false" data-classification-token-id="${escAttr(token.id)}">${esc(token.text)}</button>`;
}
