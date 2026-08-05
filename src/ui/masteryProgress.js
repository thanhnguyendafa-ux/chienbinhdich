const SVG_NS = 'http://www.w3.org/2000/svg';
const ANIMATION_MS = 320;

export function renderMasteryProgress({ value = 0, threshold = 80, previous = value, delta = 0 } = {}) {
  const current = normalizePercent(value);
  const before = normalizePercent(previous);
  const target = normalizePercent(threshold);
  const direction = directionFromDelta(delta);

  return `
    <div class="mastery-progress ${directionClass(direction)}" data-mastery-progress data-mastery-state="${direction}">
      <div class="mastery-progress-heading">
        <span>MASTERY</span>
        <strong data-mastery-value>${formatMasteryPercent(current)}%</strong>
      </div>
      <div class="mastery-progress-bar-row">
        <svg class="mastery-progress-svg" data-mastery-svg viewBox="0 0 100 12" preserveAspectRatio="none" role="progressbar" aria-label="Mastery" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${current}" aria-valuetext="Mastery ${formatMasteryPercent(current)}%, mục tiêu ${formatMasteryPercent(target)}%">
          <rect class="mastery-progress-track" x="0" y="2" width="100" height="8" rx="4"></rect>
          <rect class="mastery-progress-fill" data-mastery-fill x="0" y="2" width="${before}" height="8" rx="4"></rect>
          <line class="mastery-progress-target" x1="${target}" x2="${target}" y1="0" y2="12"></line>
        </svg>
        <span class="mastery-progress-delta" data-mastery-delta aria-live="polite">${deltaLabel(delta)}</span>
      </div>
      <div class="mastery-progress-scale" aria-hidden="true">
        <span>0%</span>
        <strong>▲ Mục tiêu ${formatMasteryPercent(target)}%</strong>
        <span>100%</span>
      </div>
    </div>`;
}

export function animateMasteryProgress(root, { from = 0, to = 0, delta = 0 } = {}) {
  const wrapper = root?.querySelector?.('[data-mastery-progress]');
  const fill = wrapper?.querySelector?.('[data-mastery-fill]');
  const svg = wrapper?.querySelector?.('[data-mastery-svg]');
  const value = wrapper?.querySelector?.('[data-mastery-value]');
  const deltaNode = wrapper?.querySelector?.('[data-mastery-delta]');
  if (!wrapper || !fill || !svg || !value || !deltaNode) return;

  const before = normalizePercent(from);
  const current = normalizePercent(to);
  const direction = directionFromDelta(delta);

  wrapper.dataset.masteryState = direction;
  wrapper.classList.remove('is-mastery-gain', 'is-mastery-loss', 'is-mastery-neutral');
  wrapper.classList.add(directionClass(direction));
  value.textContent = `${formatMasteryPercent(current)}%`;
  deltaNode.textContent = deltaLabel(delta);
  svg.setAttribute('aria-valuenow', String(current));
  svg.setAttribute('aria-valuetext', `Mastery ${formatMasteryPercent(current)}%`);
  fill.setAttribute('width', String(current));

  if (before === current || prefersReducedMotion()) return;

  const animation = document.createElementNS(SVG_NS, 'animate');
  animation.setAttribute('attributeName', 'width');
  animation.setAttribute('from', String(before));
  animation.setAttribute('to', String(current));
  animation.setAttribute('dur', `${ANIMATION_MS}ms`);
  animation.setAttribute('fill', 'freeze');
  fill.append(animation);
  animation.beginElement?.();
  window.setTimeout(() => animation.remove(), ANIMATION_MS + 60);
}

export function formatMasteryPercent(value) {
  const numeric = normalizePercent(value);
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function deltaLabel(delta) {
  const numeric = Number(delta ?? 0);
  if (numeric > 0) return `+${formatMasteryPercent(numeric)}%`;
  if (numeric < 0) return `−${formatMasteryPercent(Math.abs(numeric))}%`;
  return '';
}

function directionFromDelta(delta) {
  const numeric = Number(delta ?? 0);
  if (numeric > 0) return 'gain';
  if (numeric < 0) return 'loss';
  return 'neutral';
}

function directionClass(direction) {
  return `is-mastery-${direction}`;
}

function normalizePercent(value) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(Math.min(100, Math.max(0, numeric)) * 100) / 100;
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
