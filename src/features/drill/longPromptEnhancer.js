export const LONG_PROMPT_WORD_THRESHOLD = 36;
export const LONG_PROMPT_CHAR_THRESHOLD = 240;

export function isLongPromptText(text) {
  const normalized = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!normalized) return false;
  const wordCount = normalized.split(' ').filter(Boolean).length;
  return wordCount >= LONG_PROMPT_WORD_THRESHOLD || normalized.length >= LONG_PROMPT_CHAR_THRESHOLD;
}

export function applyLongPromptTypography(root = globalThis.document) {
  if (!root?.querySelectorAll) return;
  root.querySelectorAll('.question-card .prompt-block').forEach(block => {
    const heading = block.querySelector('h1');
    block.classList.toggle('is-long-prompt', isLongPromptText(heading?.textContent));
  });
}

let scheduled = false;

function scheduleApply() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    applyLongPromptTypography();
  });
}

if (typeof document !== 'undefined') {
  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  globalThis.addEventListener?.('popstate', scheduleApply);
  scheduleApply();
}
