import { theorySupportViewModel } from './theorySupport.js';

export function renderTheorySupport({ item, session, esc, escAttr }) {
  const model = theorySupportViewModel({ item, session });
  if (!model) return '';
  if (!model.unlocked) {
    return `
      <section class="theory-support is-locked" aria-label="Theory support / Hỗ trợ lý thuyết">
        <button class="theory-support-toggle" type="button" disabled aria-disabled="true">
          🔒 View theory after submitting / Xem lý thuyết sau khi làm câu này
        </button>
      </section>`;
  }

  const worked = model.workedExample
    ? `<div class="theory-support-worked"><strong>${esc(model.workedExample.label)}</strong><p>${esc(model.workedExample.text)}</p></div>`
    : '';
  return `
    <section class="theory-support" aria-label="Theory support / Hỗ trợ lý thuyết">
      <button class="theory-support-toggle" type="button" data-theory-toggle aria-expanded="false" aria-controls="theory-panel-${escAttr(item.id)}">
        📘 View theory / Xem lý thuyết
      </button>
      <div class="theory-support-panel" id="theory-panel-${escAttr(item.id)}" data-theory-panel hidden>
        <div class="theory-support-copy"><strong>Theory / Lý thuyết</strong><p>${esc(model.theory)}</p></div>
        ${model.example ? `<div class="theory-support-copy"><strong>Example / Ví dụ</strong><p>${esc(model.example)}</p></div>` : ''}
        ${worked}
      </div>
    </section>`;
}

export function bindTheorySupport(root) {
  root.querySelectorAll('[data-theory-toggle]').forEach(button => {
    if (button.dataset.boundTheory === '1') return;
    button.dataset.boundTheory = '1';
    button.addEventListener('click', () => {
      const panel = root.querySelector(`#${cssEscape(button.getAttribute('aria-controls'))}`);
      if (!panel) return;
      const opening = panel.hidden;
      panel.hidden = !opening;
      button.setAttribute('aria-expanded', opening ? 'true' : 'false');
      button.textContent = opening
        ? '📕 Hide theory / Ẩn lý thuyết'
        : '📘 View theory / Xem lý thuyết';
    });
  });
}

function cssEscape(value) {
  if (globalThis.CSS?.escape) return globalThis.CSS.escape(String(value));
  return String(value).replace(/[^a-zA-Z0-9_-]/g, char => `\\${char}`);
}
