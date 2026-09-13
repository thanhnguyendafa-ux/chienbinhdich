let activeAway = false;
let tripped = false;

function isStrictLessonActive() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  return /^\/a\/g6-grammar-scaffold-s\d{2}(?:-|$)/.test(window.location.pathname)
    && Boolean(document.querySelector('.drill-page'));
}

function blockClipboard(event) {
  if (!isStrictLessonActive()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  showNotice(event.type === 'paste'
    ? 'Paste đã bị khóa. Hãy tự gõ câu trả lời.'
    : 'Copy/Cut đã bị khóa trong bài Mastery 100%.');
}

function blockClipboardKeys(event) {
  if (!isStrictLessonActive() || !(event.ctrlKey || event.metaKey)) return;
  const key = String(event.key || '').toLowerCase();
  if (!['c', 'v', 'x'].includes(key)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  showNotice(key === 'v'
    ? 'Paste đã bị khóa. Hãy tự gõ câu trả lời.'
    : 'Copy/Cut đã bị khóa trong bài Mastery 100%.');
}

function blockDrop(event) {
  if (!isStrictLessonActive()) return;
  const target = event.target;
  if (!target?.closest?.('#answer-input, .typing-question')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  showNotice('Kéo-thả văn bản vào ô trả lời đã bị khóa.');
}

function blockPasteBeforeInput(event) {
  if (!isStrictLessonActive()) return;
  if (event.inputType !== 'insertFromPaste' && event.inputType !== 'insertFromDrop') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  showNotice('Paste/Kéo-thả đã bị khóa. Hãy tự gõ câu trả lời.');
}

function visibilityGuard() {
  if (!isStrictLessonActive() && document.visibilityState === 'hidden') return;
  if (document.visibilityState === 'hidden') {
    activeAway = isStrictLessonActive();
    return;
  }
  if (!activeAway || tripped) return;
  activeAway = false;
  tripped = true;
  window.setTimeout(() => {
    if (!document.querySelector('.drill-page')) return;
    window.alert('Bài làm đã kết thúc vì bạn rời tab/trang học. Hãy làm lại từ đầu để được công nhận Mastery 100%.');
    document.querySelector('#abandon-btn')?.click();
    tripped = false;
  }, 0);
}

function showNotice(message) {
  let notice = document.querySelector('#strict-integrity-notice');
  if (!notice) {
    notice = document.createElement('div');
    notice.id = 'strict-integrity-notice';
    notice.setAttribute('role', 'alert');
    Object.assign(notice.style, {
      position: 'fixed', left: '50%', bottom: '24px', transform: 'translateX(-50%)',
      zIndex: '99999', maxWidth: 'min(90vw, 560px)', padding: '12px 16px',
      borderRadius: '12px', background: '#111', color: '#fff', fontWeight: '700',
      boxShadow: '0 8px 30px rgba(0,0,0,.24)'
    });
    document.body.appendChild(notice);
  }
  notice.textContent = message;
  notice.hidden = false;
  window.clearTimeout(Number(notice.dataset.hideTimer || 0));
  const timer = window.setTimeout(() => { notice.hidden = true; }, 2200);
  notice.dataset.hideTimer = String(timer);
}

if (typeof document !== 'undefined') {
  document.addEventListener('copy', blockClipboard, true);
  document.addEventListener('cut', blockClipboard, true);
  document.addEventListener('paste', blockClipboard, true);
  document.addEventListener('keydown', blockClipboardKeys, true);
  document.addEventListener('drop', blockDrop, true);
  document.addEventListener('beforeinput', blockPasteBeforeInput, true);
  document.addEventListener('visibilitychange', visibilityGuard);
}
