export function adminTopbar({ subtitle }) {
  return `<header class="admin-topbar shell"><div class="brand-lockup"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div><span>${esc(subtitle)}</span></header>`;
}

export function typeSummary(types) {
  const list = Array.isArray(types) ? types : [];
  return list.length === 1 ? typeLabel(list[0]) : 'MIX';
}

export function typeLabel(type) {
  return ({
    typing: 'Typing',
    mcq: 'MCQ',
    true_false: 'True/False',
    sentence_order: 'Order',
    sequence_number: 'Sequence / Đánh số',
    classification: 'Classification',
    matching: 'Match',
    fill_blank: 'Fill',
    reading: 'Reading',
    writing: 'Writing',
    speaking: 'Speaking'
  })[type] ?? String(type ?? 'Unknown');
}

export function statusLabel(status) {
  return ({ active: 'Đang làm', extended: 'Làm thêm', passed: 'Đạt', submitted: 'Đã nộp', abandoned: 'Đã thoát' })[status] ?? String(status ?? '');
}

export function formatDate(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(number));
}

export function formatDuration(value) {
  const ms = Number(value);
  if (!Number.isFinite(ms)) return '—';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export function displayValue(value) {
  if (Array.isArray(value)) return value.join(' → ');
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (value && typeof value === 'object') return Object.entries(value).map(([key, group]) => `${key} → ${group}`).join(' · ');
  return String(value ?? '—');
}

export function setBusy(button, label) {
  if (!button) return;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.textContent = label;
}

export function resetBusy(button, label) {
  if (!button) return;
  button.disabled = false;
  button.removeAttribute('aria-busy');
  button.textContent = label;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.className = 'clipboard-probe';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      return copied;
    } catch {
      return false;
    }
  }
}

export function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

export function escAttr(value) {
  return esc(value).replace(/`/g, '&#96;');
}
