const WORD_BANK_PREFIX = 'Từ / cụm từ cho sẵn:';

export function parseSourceWordBank(text = '') {
  const normalized = String(text).replace(/\r/g, '').trim();
  if (!normalized.startsWith(WORD_BANK_PREFIX)) return null;

  const separatorIndex = normalized.indexOf('\n\n');
  if (separatorIndex < 0) return null;

  const bankText = normalized.slice(WORD_BANK_PREFIX.length, separatorIndex).trim();
  const prompt = normalized.slice(separatorIndex + 2).trim();
  const items = bankText.split('·').map(item => item.trim()).filter(Boolean);
  if (!items.length || !prompt) return null;

  return { items, prompt };
}

export function enhanceSourceWordBanks(root = document) {
  root.querySelectorAll('.typing-question').forEach(form => {
    const scope = form.parentElement;
    const promptBlock = scope?.querySelector('.prompt-block');
    const heading = promptBlock?.querySelector('h1');
    if (!promptBlock || !heading || heading.dataset.sourceWordBankEnhanced === '1') return;

    const parsed = parseSourceWordBank(heading.textContent ?? '');
    if (!parsed) return;

    const bank = document.createElement('section');
    bank.className = 'source-word-bank';
    bank.setAttribute('aria-label', 'Từ hoặc cụm từ cho sẵn');

    const label = document.createElement('p');
    label.className = 'source-word-bank-label';
    label.textContent = 'TỪ / CỤM TỪ CHO SẴN';

    const grid = document.createElement('div');
    grid.className = 'source-word-bank-grid';

    parsed.items.forEach(text => {
      const item = document.createElement('span');
      item.className = 'source-word-bank-item';
      item.textContent = text;
      grid.append(item);
    });

    bank.append(label, grid);
    promptBlock.insertBefore(bank, heading);
    promptBlock.classList.add('has-source-word-bank');
    heading.textContent = parsed.prompt;
    heading.dataset.sourceWordBankEnhanced = '1';
  });
}

export function installSourceWordBankEnhancer() {
  const app = document.querySelector('#app');
  if (!app) return null;

  enhanceSourceWordBanks(app);
  const observer = new MutationObserver(() => enhanceSourceWordBanks(app));
  observer.observe(app, { childList: true, subtree: true });
  return observer;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installSourceWordBankEnhancer, { once: true });
  } else {
    installSourceWordBankEnhancer();
  }
}
