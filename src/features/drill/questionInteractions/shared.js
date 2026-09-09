export function disableChoices(root) {
  root.querySelectorAll('.choice-btn').forEach(button => { button.disabled = true; });
}

export function setBusy(button) {
  if (!button) return;
  button.disabled = true;
  button.textContent = 'Đang kiểm tra...';
}

export function attemptMeta(startedAt, inputMethod, pasteDetected) {
  return { startedAt, submittedAt: Date.now(), inputMethod, pasteDetected };
}

export function focusInput(input) {
  if (!input) return;
  input.focus({ preventScroll: true });
  window.setTimeout(() => input.scrollIntoView({ block: 'center', behavior: 'smooth' }), 180);
}

export function createInputTracker(input) {
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

export function cssEscape(value) {
  return globalThis.CSS?.escape ? globalThis.CSS.escape(String(value)) : String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

export function renderReadingPassage(passage) {
  return `
    <section class="reading-passage" aria-label="Bài đọc ${escAttr(passage.title)}">
      <div class="reading-passage-heading"><span>READING</span><strong>${esc(passage.title)}</strong></div>
      <p>${esc(passage.text)}</p>
    </section>`;
}

export function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

export function escAttr(value) {
  return esc(value).replace(/`/g, '&#96;');
}
