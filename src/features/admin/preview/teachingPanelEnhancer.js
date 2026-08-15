const appRoot = document.querySelector('#app');
const PANEL_ID = 'admin-teaching-panel';
let panelOpen = false;
let hadTeachingMode = false;

function setPanelOpen(nextOpen, { focusPanel = false } = {}) {
  panelOpen = Boolean(nextOpen);
  const page = appRoot?.querySelector('.drill-page.admin-teaching-mode');
  const panel = page?.querySelector(`#${PANEL_ID}`);
  if (!page || !panel) return;

  page.classList.toggle('admin-teaching-panel-open', panelOpen);
  panel.setAttribute('aria-hidden', panelOpen ? 'false' : 'true');
  panel.inert = !panelOpen;
  page.querySelectorAll('[data-teaching-panel-toggle]').forEach(button => {
    button.setAttribute('aria-expanded', panelOpen ? 'true' : 'false');
  });

  if (panelOpen && focusPanel) {
    window.requestAnimationFrame(() => panel.querySelector('[data-teaching-panel-close]')?.focus({ preventScroll: true }));
  }
}

function currentCounter(panel) {
  return String(panel?.querySelector('.admin-teaching-counter')?.textContent ?? 'Teaching').replace(/\s+/g, ' ').trim();
}

function bindPanelControls(page) {
  page.querySelectorAll('[data-teaching-panel-toggle]').forEach(button => {
    if (button.dataset.teachingPanelBound === '1') return;
    button.dataset.teachingPanelBound = '1';
    button.addEventListener('click', () => setPanelOpen(!panelOpen, { focusPanel: !panelOpen }));
  });

  const close = page.querySelector('[data-teaching-panel-close]');
  if (close && close.dataset.teachingPanelBound !== '1') {
    close.dataset.teachingPanelBound = '1';
    close.addEventListener('click', () => setPanelOpen(false));
  }
}

function ensureWorkspace(page, panel) {
  let workspace = page.querySelector('.admin-teaching-workspace');
  const drillShell = page.querySelector('.drill-shell');
  if (!drillShell) return null;

  if (!workspace) {
    workspace = document.createElement('div');
    workspace.className = 'shell admin-teaching-workspace';
    drillShell.before(workspace);
    workspace.append(drillShell);
  }
  if (panel.parentElement !== workspace) workspace.append(panel);
  return workspace;
}

function ensureTriggers(page, panel) {
  const topActions = page.querySelector('.drill-top-actions');
  const counter = currentCounter(panel);

  if (topActions && !topActions.querySelector('[data-teaching-panel-top-toggle]')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ghost-btn admin-teaching-trigger';
    button.dataset.teachingPanelToggle = '1';
    button.dataset.teachingPanelTopToggle = '1';
    button.setAttribute('aria-controls', PANEL_ID);
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = `<span aria-hidden="true">🎓</span><span>Teaching · ${counter}</span>`;
    topActions.prepend(button);
  }

  if (!page.querySelector('[data-teaching-panel-bottom-toggle]')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'admin-teaching-bottom-trigger';
    button.dataset.teachingPanelToggle = '1';
    button.dataset.teachingPanelBottomToggle = '1';
    button.setAttribute('aria-controls', PANEL_ID);
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = `<span aria-hidden="true">🎓</span><strong>Teaching · ${counter}</strong><span aria-hidden="true">▲</span>`;
    page.append(button);
  }
}

function ensureCloseButton(panel) {
  const head = panel.querySelector('.admin-teaching-toolbar-head');
  if (!head || head.querySelector('[data-teaching-panel-close]')) return;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'ghost-btn admin-teaching-panel-close';
  close.dataset.teachingPanelClose = '1';
  close.setAttribute('aria-label', 'Đóng Teaching Mode');
  close.textContent = '×';
  head.append(close);
}

function setTextIfChanged(node, nextText) {
  if (!node || node.textContent === nextText) return false;
  node.textContent = nextText;
  return true;
}

function updateTriggerCounters(page, panel) {
  const counter = currentCounter(panel);
  const nextLabel = `Teaching · ${counter}`;
  const topLabel = page.querySelector('[data-teaching-panel-top-toggle] span:last-child');
  setTextIfChanged(topLabel, nextLabel);
  const bottomLabel = page.querySelector('[data-teaching-panel-bottom-toggle] strong');
  setTextIfChanged(bottomLabel, nextLabel);
}

function enhanceTeachingMode() {
  if (!appRoot) return;
  const page = appRoot.querySelector('.drill-page.admin-teaching-mode');
  const panel = page?.querySelector('.admin-teaching-toolbar');

  if (!page || !panel) {
    if (hadTeachingMode) panelOpen = false;
    hadTeachingMode = false;
    return;
  }
  hadTeachingMode = true;

  if (panel.dataset.teachingPanelEnhanced !== '1') {
    panel.dataset.teachingPanelEnhanced = '1';
    panel.id = PANEL_ID;
    panel.classList.remove('shell');
    panel.classList.add('admin-teaching-panel');
    ensureCloseButton(panel);
    ensureWorkspace(page, panel);
    ensureTriggers(page, panel);
    bindPanelControls(page);
  }

  updateTriggerCounters(page, panel);
  setPanelOpen(panelOpen);
}

if (appRoot) {
  const observerOptions = { childList: true, subtree: true };
  let observer = null;

  const handleTeachingMutation = () => {
    observer?.disconnect();
    try {
      enhanceTeachingMode();
    } finally {
      observer?.observe(appRoot, observerOptions);
    }
  };

  observer = new MutationObserver(handleTeachingMutation);
  observer.observe(appRoot, observerOptions);
  enhanceTeachingMode();

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !panelOpen) return;
    setPanelOpen(false);
    appRoot.querySelector('[data-teaching-panel-top-toggle]')?.focus({ preventScroll: true });
  });
}
