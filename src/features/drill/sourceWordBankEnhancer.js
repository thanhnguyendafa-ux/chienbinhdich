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
const configCache = new Map();
let scheduled = false;

function currentLessonSlug() {
  const match = globalThis.location?.pathname?.match(/\/a\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

async function sourceWordBankConfig(slug) {
  if (configCache.has(slug)) return configCache.get(slug);
  const descriptor = WORKBOOK_REGISTRY.find(entry => entry.lessonSlug === slug);
  if (!descriptor) return null;
  const content = await descriptor.loadContent();
  const item = content.items?.find(candidate => Array.isArray(candidate.sourceWordBank) && candidate.sourceWordBank.length);
  if (!item) return null;
  const config = Object.freeze({
    label: item.sourceWordBankLabel || 'Từ / cụm từ cho sẵn',
    words: Object.freeze([...item.sourceWordBank])
  });
  configCache.set(slug, config);
  return config;
}

function buildWordBank(slug, config) {
  const section = document.createElement('section');
  section.className = 'source-word-bank';
  section.dataset.sourceWordBankSlug = slug;
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

async function applySourceWordBank() {
  const slug = currentLessonSlug();
  if (!slug) return;

  const promptBlock = document.querySelector('.question-card .prompt-block');
  if (!promptBlock || promptBlock.querySelector('.source-word-bank')) return;

  const config = await sourceWordBankConfig(slug);
  if (!config || currentLessonSlug() !== slug || !promptBlock.isConnected) return;

  const bank = buildWordBank(slug, config);
  const promptLabel = promptBlock.querySelector('.prompt-label');
  if (promptLabel) promptLabel.insertAdjacentElement('afterend', bank);
  else promptBlock.prepend(bank);
  promptBlock.classList.add('has-source-word-bank');
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
