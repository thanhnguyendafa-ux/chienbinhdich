export function renderSourceWordBank(item) {
  const words = Array.isArray(item?.sourceWordBank) ? item.sourceWordBank : [];
  if (!words.length) return '';
  const label = item.sourceWordBankLabel || 'Từ / cụm từ cho sẵn';
  return `
    <section class="source-word-bank" data-source-word-bank-item-id="${escAttr(item.id)}" aria-label="${escAttr(label)}">
      <p class="source-word-bank-label">${esc(label)}</p>
      <div class="source-word-bank-grid">
        ${words.map(word => `<span class="source-word-bank-item">${esc(word)}</span>`).join('')}
      </div>
    </section>`;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function escAttr(value) {
  return esc(value).replace(/`/g, '&#96;');
}
