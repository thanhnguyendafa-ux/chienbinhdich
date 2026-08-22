export function renderTheoryGate({ root, set, session, onBottomReached, onConfirm, onExit }) {
  const theory = set?.preLessonTheory;
  if (!theory?.required) return onConfirm?.();
  const bottomAlreadyReached = Boolean(session?.theoryGate?.bottomReachedAt);
  const sourceLabel = Array.isArray(theory.sourceSections) && theory.sourceSections.length
    ? theory.sourceSections.join(' · ')
    : '';

  root.innerHTML = `
    <main class="theory-gate-page">
      <header class="theory-gate-topbar shell">
        <button class="ghost-btn" id="theory-gate-exit" type="button">← Thoát</button>
        <div><strong>LÝ THUYẾT TRƯỚC BÀI</strong><small>${esc(set.title)}</small></div>
      </header>

      <section class="theory-gate-shell shell">
        <div class="theory-gate-heading">
          <p class="eyebrow">GLOBAL SUCCESS 6 · UNIT 2</p>
          <h1>${esc(theory.title)}</h1>
          <p>${esc(theory.intro)}</p>
          ${sourceLabel ? `<p class="theory-source-note"><strong>Bám theo Unit 2:</strong> ${esc(sourceLabel)}</p>` : ''}
        </div>

        <div class="theory-read-progress" aria-live="polite">
          <div><strong>Tiến độ đọc</strong><span id="theory-progress-label">${bottomAlreadyReached ? '100%' : '0%'}</span></div>
          <div class="theory-progress-track"><span id="theory-progress-bar" style="width:${bottomAlreadyReached ? '100%' : '0%'}"></span></div>
        </div>

        <article class="theory-scroll-box" id="theory-scroll-box" tabindex="0" aria-label="Nội dung lý thuyết bắt buộc">
          ${theory.sections.map(section => `
            <section class="theory-section">
              <h2>${esc(section.heading)}</h2>
              <ul>${section.bullets.map(item => `<li>${esc(item)}</li>`).join('')}</ul>
            </section>`).join('')}
          <div class="theory-end-marker" id="theory-end-marker">
            <strong>✓ HẾT PHẦN LÝ THUYẾT</strong>
            <p>${esc(theory.summary)}</p>
          </div>
        </article>

        <div class="theory-gate-confirmation ${bottomAlreadyReached ? 'is-unlocked' : ''}" id="theory-gate-confirmation">
          <p id="theory-scroll-status">${bottomAlreadyReached
            ? '✓ Con đã xem đến cuối phần lý thuyết.'
            : '↓ Hãy kéo từ trên xuống tận cuối để mở bước xác nhận.'}</p>
          <label class="theory-confirm-check">
            <input id="theory-confirm-check" type="checkbox" ${bottomAlreadyReached ? '' : 'disabled'} />
            <span>Tôi xác nhận đã đọc xong phần lý thuyết.</span>
          </label>
          <button class="primary-btn" id="theory-start-btn" type="button" disabled>🔒 CHƯA THỂ VÀO LÀM BÀI</button>
        </div>
      </section>
    </main>`;

  const scrollBox = root.querySelector('#theory-scroll-box');
  const progressBar = root.querySelector('#theory-progress-bar');
  const progressLabel = root.querySelector('#theory-progress-label');
  const scrollStatus = root.querySelector('#theory-scroll-status');
  const confirmation = root.querySelector('#theory-gate-confirmation');
  const check = root.querySelector('#theory-confirm-check');
  const startButton = root.querySelector('#theory-start-btn');
  let unlocked = bottomAlreadyReached;

  const unlock = async () => {
    if (unlocked) return;
    unlocked = true;
    confirmation?.classList.add('is-unlocked');
    if (check) check.disabled = false;
    if (scrollStatus) scrollStatus.textContent = '✓ Con đã xem đến cuối phần lý thuyết.';
    await onBottomReached?.();
  };

  const updateProgress = () => {
    if (!scrollBox) return;
    const maxScroll = Math.max(1, scrollBox.scrollHeight - scrollBox.clientHeight);
    const percent = unlocked ? 100 : Math.min(100, Math.round((scrollBox.scrollTop / maxScroll) * 100));
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressLabel) progressLabel.textContent = `${percent}%`;
    if (!unlocked && scrollBox.scrollTop + scrollBox.clientHeight >= scrollBox.scrollHeight - 4) void unlock();
  };

  scrollBox?.addEventListener('scroll', updateProgress, { passive: true });
  check?.addEventListener('change', () => {
    const ready = unlocked && check.checked;
    if (startButton) {
      startButton.disabled = !ready;
      startButton.textContent = ready ? 'VÀO LÀM BÀI →' : '🔒 CHƯA THỂ VÀO LÀM BÀI';
    }
  });
  startButton?.addEventListener('click', async event => {
    if (!unlocked || !check?.checked) return;
    event.currentTarget.disabled = true;
    event.currentTarget.textContent = 'Đang mở câu 1...';
    await onConfirm?.();
  });
  root.querySelector('#theory-gate-exit')?.addEventListener('click', () => onExit?.());
  scrollBox?.focus({ preventScroll: true });
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}
