import { getSessionMetrics } from '../../core/sessionMachine.js';
import { stageLabel } from '../../core/formatters.js';

export function renderDrill({ root, session, set, feedback = null, onSubmit }) {
  const item = set.items[session.currentIndex];
  const metrics = getSessionMetrics(session, set);
  const stageItems = set.items.filter(x => x.stage === item.stage);
  const stagePosition = stageItems.findIndex(x => x.id === item.id) + 1;
  const overallProgress = Math.round((metrics.completedItems / metrics.total) * 100);
  root.innerHTML = `
    <main class="drill-page">
      <header class="drill-topbar shell">
        <div><div class="mini-brand">⚔️ Chiến Binh Dịch</div><p>${set.unit} · Set 1</p></div>
        <div class="student-chip">${esc(session.studentName)}</div>
      </header>
      <section class="shell metrics-row">
        <div class="metric"><span>Tiến độ</span><strong>${metrics.completedItems} / ${metrics.total}</strong></div>
        <div class="progress-track"><div style="width:${overallProgress}%"></div></div>
        <div class="metric score-metric"><span>Điểm chính xác</span><strong>${metrics.score}%</strong></div>
      </section>
      <section class="drill-shell shell">
        <article class="prompt-card ${feedback?.type === 'incorrect' ? 'has-error' : ''}">
          <div class="stage-line"><span class="stage-badge">${stageLabel(item.stage)}</span><span>${stagePosition} / ${stageItems.length}</span></div>
          <p class="prompt-label">Gõ tiếng Anh đúng theo đáp án</p>
          <h1>${esc(item.vi)}</h1>
          <form id="answer-form" class="answer-form" novalidate>
            <label class="sr-only" for="answer-input">Câu trả lời tiếng Anh</label>
            <input id="answer-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type English here..." required />
            ${feedback?.type === 'incorrect' ? `<div class="feedback error-feedback" role="alert"><strong>Chưa chính xác.</strong><span>Em vừa nhập: “${esc(feedback.entered || '(trống)')}”</span><span>Hãy sửa và gõ lại. Điểm chính xác không tăng ở item này.</span></div>` : ''}
            <button class="primary-btn" type="submit">Kiểm tra</button>
          </form>
          <p class="encouragement">Cố gắng nhớ và gõ chính xác ngay lần đầu.</p>
        </article>
      </section>
    </main>`;
  const input = root.querySelector('#answer-input');
  input?.focus();
  root.querySelector('#answer-form')?.addEventListener('submit', e => {
    e.preventDefault();
    if (input.value.trim()) onSubmit(input.value);
  });
}

export function showSuccess({ root, type, answer, score, onContinue }) {
  const card = root.querySelector('.prompt-card');
  const form = card?.querySelector('.answer-form');
  if (!card || !form) return onContinue();
  card.classList.remove('has-error');
  card.classList.add('has-success');
  form.innerHTML = `<div class="success-panel" role="status"><div class="success-icon">✓</div><strong>${type === 'correct_first_try' ? 'Chính xác' : 'Đã sửa đúng'}</strong><span class="answer-reveal">${esc(answer)}</span><small>${type === 'correct_first_try' ? `Điểm chính xác hiện tại: ${score}%` : 'Item này không cộng điểm chính xác.'}</small></div>`;
  window.setTimeout(onContinue, 650);
}
function esc(v) { return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[c]); }
