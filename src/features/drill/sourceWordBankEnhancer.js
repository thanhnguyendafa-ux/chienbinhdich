import { questionPromptDisplay } from '../../core/questionTypes.js';
import { g5WorkbookRegistry } from '../../data/workbooks/g5/index.js';
import { g6U1WorkbookRegistry } from '../../data/g6-u1-workbook-catalog.js';
import { g6U2WorkbookRegistry } from '../../data/g6-u2-workbook-catalog.js';
import { g6U3WorkbookRegistry } from '../../data/g6-u3-workbook-catalog.js';
import { g6WorkbookRemainingRegistry } from '../../data/workbooks/g6/index.js';
import { g7U1WorkbookRegistry } from '../../data/g7-u1-workbook-catalog.js';
import { g7U2WorkbookRegistry } from '../../data/g7-u2-workbook-catalog.js';
import { g7U3WorkbookRegistry } from '../../data/g7-u3-workbook-catalog.js';

const WORKBOOK_REGISTRY = Object.freeze([
  ...g5WorkbookRegistry,
  ...g6U1WorkbookRegistry,
  ...g6U2WorkbookRegistry,
  ...g6U3WorkbookRegistry,
  ...g6WorkbookRemainingRegistry,
  ...g7U1WorkbookRegistry,
  ...g7U2WorkbookRegistry,
  ...g7U3WorkbookRegistry
]);

// Audited examples retained as public regression anchors; runtime discovery is registry-driven,
// so new sourceWordBank lessons need no slug allow-list change.
export const SOURCE_WORD_BANK_REFERENCE_IDS = Object.freeze([
  'g6-u1-wb-b5','g6-u1-wb-d1',
  'g6-u2-wb-d1',
  'g6-u3-wb-b3','g6-u3-wb-d1',
  'g7-u1-wb-d1',
  'g7-u2-wb-b3','g7-u2-wb-b4',
  'g7-u3-wb-b3'
]);

const contentCache = new Map();
const inFlightPromptBlocks = new WeakSet();
let scheduled = false;

function currentLessonSlug() {
  const match = globalThis.location?.pathname?.match(/\/a\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function normalizedPrompt(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

async function lessonContent(slug) {
  if (contentCache.has(slug)) return contentCache.get(slug);
  const descriptor = WORKBOOK_REGISTRY.find(entry => entry.lessonSlug === slug);
  if (!descriptor) return null;
  const pending = Promise.resolve(descriptor.loadContent()).catch(error => {
    contentCache.delete(slug);
    throw error;
  });
  contentCache.set(slug, pending);
  return pending;
}

export function sourceWordBankConfigForPrompt(content, renderedPrompt) {
  const prompt = normalizedPrompt(renderedPrompt);
  if (!prompt) return null;
  const matches = (content?.items ?? []).filter(item =>
    Array.isArray(item?.sourceWordBank)
    && item.sourceWordBank.length > 0
    && normalizedPrompt(questionPromptDisplay(item)) === prompt
  );
  // Ambiguous prompts must never leak a bank onto the wrong item.
  if (matches.length !== 1) return null;
  const item = matches[0];
  return Object.freeze({
    itemId: String(item.id ?? ''),
    label: item.sourceWordBankLabel || 'Từ / cụm từ cho sẵn',
    words: Object.freeze([...item.sourceWordBank])
  });
}

function buildWordBank(slug, config) {
  const section = document.createElement('section');
  section.className = 'source-word-bank';
  section.dataset.sourceWordBankSlug = slug;
  section.dataset.sourceWordBankItemId = config.itemId;
  section.setAttribute('aria-label', config.label);

  const label = document.createElement('p');
  label.className = 'source-word-bank-label';
  label.textContent = config.label;
  section.appendChild(label);

  const grid = document.createElement('div');
  grid.className = 'source-word-bank-grid';
  for (const word of config.words) {
    const chip = document.createElement('span');
    chip.className = 'source-word-bank-item';
    chip.textContent = word;
    grid.appendChild(chip);
  }
  section.appendChild(grid);
  return section;
}

function reconcileWordBanks(promptBlock, config) {
  const banks = [...promptBlock.querySelectorAll('.source-word-bank')];
  let keptCurrent = false;
  for (const bank of banks) {
    const isCurrent = Boolean(config) && bank.dataset.sourceWordBankItemId === config.itemId;
    if (isCurrent && !keptCurrent) {
      keptCurrent = true;
      continue;
    }
    bank.remove();
  }
  promptBlock.classList.toggle('has-source-word-bank', Boolean(config));
  return keptCurrent;
}

async function applySourceWordBank() {
  const slug = currentLessonSlug();
  if (!slug) return;

  const promptBlock = document.querySelector('.question-card .prompt-block');
  if (!promptBlock || inFlightPromptBlocks.has(promptBlock)) return;
  const renderedPrompt = normalizedPrompt(promptBlock.querySelector('h1')?.textContent);
  if (!renderedPrompt) {
    reconcileWordBanks(promptBlock, null);
    return;
  }

  inFlightPromptBlocks.add(promptBlock);
  try {
    const content = await lessonContent(slug);
    if (!content || currentLessonSlug() !== slug || !promptBlock.isConnected) return;

    // The DOM may have advanced to another question while the lazy lesson import was pending.
    const currentPrompt = normalizedPrompt(promptBlock.querySelector('h1')?.textContent);
    if (currentPrompt !== renderedPrompt) return;

    const config = sourceWordBankConfigForPrompt(content, currentPrompt);
    if (reconcileWordBanks(promptBlock, config) || !config) return;

    const bank = buildWordBank(slug, config);
    const promptLabel = promptBlock.querySelector('.prompt-label');
    if (promptLabel) promptLabel.insertAdjacentElement('afterend', bank);
    else promptBlock.prepend(bank);
    promptBlock.classList.add('has-source-word-bank');
  } finally {
    inFlightPromptBlocks.delete(promptBlock);
  }
}

function scheduleApply() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    applySourceWordBank().catch(() => {});
  });
}

if (typeof document !== 'undefined') {
  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, { childList:true, subtree:true });
  globalThis.addEventListener?.('popstate', scheduleApply);
  scheduleApply();
}
