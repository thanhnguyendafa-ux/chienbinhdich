import { getSessionMetrics } from '../../core/sessionMachine.js';
import { stageLabel } from '../../core/formatters.js';

export function renderDrill({ root, session, set, feedback = null, onSubmit }) {
  const item = set.items[session.currentIndex];
  const metrics = getSessionMetrics(session, set);
  const stageItems = set.items.filter(candidate => candidate.stage === item.stage);
  const stagePosition = stageItems.findIndex(candidate => candidate.id === item.id) + 1;
  const overallProgress = Math.round((metrics.completedItems / metrics.total) * 100);
  const revealAnswer = feedback?.type === 'incorrect_reveal';

  root.innerHTML = `
    <main class="drill-page">
      <header class="drill-topbar shell">
        <div class="brand-lockup compact"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
        <div class="student-chip">${esc(session.studentName)}</div>
      </header>

      <section class="shell metrics-row" aria-label="Tiến độ bài học">
        <div class="metric"><span>Tiến độ</span><strong>${metrics.completedItems}/${metrics.total}</strong></div>
        <div class="progress-track" aria-hidden="true"><div style="width:${overallProgress}%"></div></div>
        <div class="metric score-metric"><span>Điểm chính xác</span><strong>${metrics.score}%</strong></div>
      </section>

      <section class="drill-shell shell">
        <article class="prompt-card ${feedback ? 'has-error' : ''} ${revealAnswer ? 'is-reveal' : ''}">
          <div class="stage-line"><span class="stage-badge">${stageLabel(item.stage)}</span><span>${stagePosition}/${stageItems.length}</span></div>
          <div class="prompt-block">
            <p class="prompt-label">Gõ đúng tiếng Anh theo đáp án chuẩn</p>
            <h1>${esc(item.vi)}</h1>
          </div>

          ${renderFeedback(feedback)}

          <form id="answer-form" class="answer-form" novalidate>
            <label class="sr-only" for="answer-input">Câu trả lời tiếng Anh</label>
            <input id="answer-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type English here..." required />
            <button class="primary-btn" type="submit">Kiểm tra</button>
          </form>
          <p class="encouragement">${revealAnswer ? 'Đã xem đáp án vẫn phải tự gõ lại chính xác mới được đi tiếp.' : 'Sai lần đầu: tự thử lại. Sai lần hai: mới hiện đáp án.'}</p>
        </article>
      </section>
    </main>`;

  const input = root.querySelector('#answer-input');
  const tracker = createInputTracker(input);
  const attemptStartedAt = Date.now();
  input?.focus();
  input?.addEventListener('focus', () => {
    window.setTimeout(() => input.scrollIntoView({ block: 'center', behavior: 'smooth' }), 220);
  }, { once: true });

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
}

export function showSuccess({ root, type, answer, score, onContinue }) {
  const card = root.querySelector('.prompt-card');
  const form = card?.querySelector('.answer-form');
  if (!card || !form) return onContinue();
  card.classList.remove('has-error', 'is-reveal');
  card.classList.add('has-success');
  const isFirstTry = type === 'correct_first_try';
  form.innerHTML = `
    <div class="success-panel" role="status">
      <span class="success-mark">ĐÚNG</span>
      <strong>${isFirstTry ? 'Chính xác ngay lần đầu' : 'Đã sửa chính xác'}</strong>
      <span class="answer-reveal">${esc(answer)}</span>
      <small>${isFirstTry ? `Điểm chính xác hiện tại: ${score}%` : 'Item này không cộng điểm chính xác.'}</small>
    </div>`;
  window.setTimeout(onContinue, 720);
}

function renderFeedback(feedback) {
  if (!feedback) return '';
  if (feedback.type === 'incorrect_reveal') {
    return `
      <div class="feedback reveal-feedback" role="alert">
        <div><span class="feedback-kicker">Sai lần ${feedback.attemptNumber}</span><strong>Đáp án chuẩn</strong></div>
        <code>${esc(feedback.revealAnswer)}</code>
        <p>Nhìn kỹ, sau đó tự gõ lại đáp án này vào ô bên dưới.</p>
      </div>`;
  }
  return `
    <div class="feedback error-feedback" role="alert">
      <div><span class="feedback-kicker">Sai lần 1</span><strong>Chưa chính xác</strong></div>
      <p>Em vừa nhập: <q>${esc(feedback.entered || '(trống)')}</q></p>
      <p>Chưa hiện đáp án. Hãy tự nhớ và thử lại thêm một lần.</p>
    </div>`;
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

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
