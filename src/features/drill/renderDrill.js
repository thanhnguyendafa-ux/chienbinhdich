import { getCurrentItem, getSessionMetrics } from '../../core/sessionMachine.js';
import { stageLabel } from '../../core/formatters.js';

export function renderDrill({ root, session, set, feedback = null, onSubmit, onExit }) {
  const item = getCurrentItem(session, set);
  if (!item) return;
  const metrics = getSessionMetrics(session, set);
  const stageItems = set.items.filter(candidate => candidate.stage === item.stage);
  const stagePosition = stageItems.findIndex(candidate => candidate.id === item.id) + 1;
  const mainProgress = Math.round((metrics.completedMainItems / metrics.total) * 100);
  const revealAnswer = feedback?.type === 'incorrect_reveal';
  const reviewMode = session.currentPromptKind !== 'main';

  root.innerHTML = `
    <main class="drill-page">
      <header class="drill-topbar shell">
        <button class="ghost-btn exit-btn" id="exit-btn" type="button">← Thoát</button>
        <div class="student-chip">${esc(session.studentName)}</div>
      </header>

      <section class="shell metrics-row" aria-label="Tiến độ bài học">
        <div class="metric"><span>${metrics.mainComplete ? 'Chuỗi chính' : 'Tiến độ'}</span><strong>${metrics.completedMainItems}/${metrics.total}</strong></div>
        <div class="progress-track" aria-hidden="true"><div style="width:${mainProgress}%"></div></div>
        <div class="metric score-metric"><span>Mastery</span><strong>${formatPercent(metrics.mastery)}%</strong></div>
      </section>

      <section class="drill-shell shell">
        <article class="prompt-card ${feedback ? 'has-error' : ''} ${revealAnswer ? 'is-reveal' : ''}">
          <div class="stage-line"><span class="stage-badge">${stageLabel(item.stage)}</span><span>${reviewMode ? reviewLabel(session.currentPromptKind) : `${stagePosition}/${stageItems.length}`}</span></div>
          <div class="prompt-block">
            <p class="prompt-label">${reviewMode ? 'Nhớ lại và tự gõ — không nhìn đáp án' : 'Gõ tiếng Anh'}</p>
            <h1>${esc(item.vi)}</h1>
          </div>

          ${renderFeedback(feedback)}

          <form id="answer-form" class="answer-form" novalidate>
            <label class="sr-only" for="answer-input">Câu trả lời tiếng Anh</label>
            <input id="answer-input" enterkeyhint="done" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type English here..." required />
            <button class="primary-btn" type="submit">Kiểm tra</button>
          </form>
          <p class="encouragement">${revealAnswer ? 'Nhìn kỹ rồi tự gõ lại đúng. Lần correction này không cộng Mastery.' : 'Gõ → Enter. App tự chuyển câu và tự đưa câu sai quay lại sau 2 item.'}</p>
        </article>
      </section>

      <dialog class="exit-dialog" id="exit-dialog">
        <div class="dialog-copy"><strong>Em muốn dừng bài?</strong><p>Chưa đạt ${set.passThreshold}% thì chưa thể nộp bài. Nếu đã cố gắng nhưng cần dừng, em vẫn có báo cáo thời gian và lịch sử làm bài.</p></div>
        <div class="dialog-actions"><button class="primary-btn" id="keep-learning-btn" type="button">Tiếp tục học</button><button class="danger-text-btn" id="abandon-btn" type="button">Bỏ cuộc và xem báo cáo</button></div>
      </dialog>
    </main>`;

  const input = root.querySelector('#answer-input');
  const tracker = createInputTracker(input);
  const attemptStartedAt = Date.now();
  focusInput(input);

  root.querySelector('#answer-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const answer = input.value.trim();
    if (!answer) return;
    const submitButton = event.currentTarget.querySelector('button[type="submit"]');
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Đang kiểm tra...'; }
    const submittedAt = Date.now();
    onSubmit({
      answer,
      attemptMeta: {
        startedAt: attemptStartedAt,
        submittedAt,
        inputMethod: tracker.inputMethod(),
        pasteDetected: tracker.pasteDetected()
      }
    });
  });

  const dialog = root.querySelector('#exit-dialog');
  root.querySelector('#exit-btn')?.addEventListener('click', () => dialog?.showModal());
  root.querySelector('#keep-learning-btn')?.addEventListener('click', () => {
    dialog?.close();
    focusInput(input);
  });
  root.querySelector('#abandon-btn')?.addEventListener('click', onExit);
  dialog?.addEventListener('cancel', () => window.setTimeout(() => focusInput(input), 0));
}

export function showSuccess({ root, type, answer, mastery, masteryDeltaPercent, onContinue }) {
  const card = root.querySelector('.prompt-card');
  const form = card?.querySelector('.answer-form');
  if (!card || !form) return onContinue();
  card.classList.remove('has-error', 'is-reveal');
  card.classList.add('has-success');
  const correction = type === 'correction';
  form.innerHTML = `
    <div class="success-panel" role="status">
      <span class="success-mark">ĐÚNG</span>
      <strong>${correction ? 'Đã sửa chính xác' : 'Retrieval chính xác'}</strong>
      <span class="answer-reveal">${esc(answer)}</span>
      <small>${correction ? `Correction: Mastery không đổi · ${formatPercent(mastery)}%` : `Mastery +${formatPercent(masteryDeltaPercent)}% → ${formatPercent(mastery)}%`}</small>
    </div>`;
  window.setTimeout(onContinue, 430);
}

export function renderPassed({ root, session, set, onSubmit }) {
  const metrics = getSessionMetrics(session, set);
  root.innerHTML = `
    <main class="page page-centered passed-page">
      <section class="passed-card">
        <div class="brand-lockup centered"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
        <p class="eyebrow">ĐÃ ĐẠT MỨC YÊU CẦU</p>
        <h1>${formatPercent(metrics.mastery)}% Mastery</h1>
        <p>Em đã hoàn thành chuỗi Từ → Cụm từ → Câu và đạt mốc ${set.passThreshold}%.</p>
        <div class="passed-stats"><span>${metrics.totalAttempts} lượt gõ</span><span>${metrics.retryCount} lượt gặp lại</span></div>
        <button class="primary-btn submit-assignment-btn" id="submit-assignment-btn" type="button">Nộp bài</button>
        <small>Chỉ sau khi bấm Nộp bài, báo cáo mới được đánh dấu là đã nộp.</small>
      </section>
    </main>`;
  root.querySelector('#submit-assignment-btn')?.addEventListener('click', async event => {
    event.currentTarget.disabled = true;
    event.currentTarget.textContent = 'Đang tạo báo cáo...';
    await onSubmit();
  });
}

function renderFeedback(feedback) {
  if (!feedback) return '';
  const masteryLoss = Math.abs(feedback.masteryDeltaPercent ?? 0);
  if (feedback.type === 'incorrect_reveal') {
    return `
      <div class="feedback reveal-feedback" role="alert">
        <div><span class="feedback-kicker">Sai lần ${feedback.attemptNumber} · Mastery −${formatPercent(masteryLoss)}%</span><strong>Đáp án chuẩn</strong></div>
        <code>${esc(feedback.revealAnswer)}</code>
        <p>Gõ lại đúng để hoàn thành correction. Câu này vẫn sẽ quay lại trong chuỗi.</p>
      </div>`;
  }
  return `
    <div class="feedback error-feedback" role="alert">
      <div><span class="feedback-kicker">Sai · Mastery −${formatPercent(masteryLoss)}%</span><strong>Thử lại</strong></div>
      <p>Em vừa nhập: <q>${esc(feedback.entered || '(trống)')}</q></p>
      <p>Chưa hiện đáp án. Hãy tự nhớ và gõ lại.</p>
    </div>`;
}

function reviewLabel(kind) {
  return ({ retry: 'GẶP LẠI', review: 'CỦNG CỐ', spacing: 'ÔN NHANH' })[kind] ?? 'ÔN LẠI';
}

function focusInput(input) {
  if (!input) return;
  input.focus({ preventScroll: true });
  window.setTimeout(() => input.scrollIntoView({ block: 'center', behavior: 'smooth' }), 180);
}

function createInputTracker(input) {
  let typed = false;
  let pasted = false;
  input?.addEventListener('paste', () => { pasted = true; });
  input?.addEventListener('beforeinput', event => {
    if (event.inputType === 'insertFromPaste') pasted = true;
    else if (event.inputType?.startsWith('insert')) typed = true;
  });
  return {
    pasteDetected: () => pasted,
    inputMethod: () => {
      if (pasted && typed) return 'mixed';
      if (pasted) return 'paste';
      if (typed) return 'typed';
      return 'unknown';
    }
  };
}

function formatPercent(value) {
  const numeric = Number(value ?? 0);
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
