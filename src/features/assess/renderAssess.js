import { bindQuestionInteraction, renderQuestionInteraction } from '../drill/questionTypeRegistry.js';
import { questionTypeLabel } from '../../core/questionTypes.js';
import { assessProgress } from './assessSessionController.js';

export function renderAssess({ root, session, lesson, onSubmit, onSkip, onExit }) {
  const progress = assessProgress(session, lesson);
  const item = lesson.items[progress.index];
  if (!item) throw new Error('Assess item not found.');

  const interaction = renderQuestionInteraction(item, {
    exposureKey: `${session.id}:assess:${progress.index}`,
    passages: lesson.passages ?? []
  }).replaceAll('Kiểm tra', 'Ghi nhận');

  root.innerHTML = `
    <main class="assess-page">
      <header class="assess-topbar">
        <div>
          <span class="assess-mode-badge">ASSESS</span>
          <strong>${esc(lesson.title)}</strong>
        </div>
        <button type="button" class="ghost-btn" data-assess-exit>Thoát</button>
      </header>
      <section class="assess-progress" aria-label="Tiến độ bài Assess">
        <strong>Câu ${progress.number} / ${progress.total}</strong>
        <span>Chế độ kiểm tra độc lập · không hiện đúng sai hoặc đáp án</span>
      </section>
      <section class="assess-question shell">
        <div class="assess-question-meta">
          <span>${esc(questionTypeLabel(item))}</span>
          <span data-assess-status aria-live="polite">Câu trả lời chỉ được ghi nhận.</span>
        </div>
        ${interaction}
        <div class="assess-skip-row">
          <button type="button" class="secondary-btn" data-assess-skip>Bỏ qua câu này</button>
        </div>
      </section>
    </main>`;

  const status = root.querySelector('[data-assess-status]');
  let locked = false;
  const lockAndRun = async action => {
    if (locked) return;
    locked = true;
    if (status) status.textContent = 'Đang ghi nhận...';
    root.querySelectorAll('button, input, textarea, select').forEach(node => { node.disabled = true; });
    try {
      await action();
    } catch (error) {
      locked = false;
      root.querySelectorAll('button, input, textarea, select').forEach(node => { node.disabled = false; });
      if (status) status.textContent = 'Chưa ghi nhận được. Hãy thử lại.';
      throw error;
    }
  };

  bindQuestionInteraction({
    root,
    item,
    attemptStartedAt: Date.now(),
    onSubmit: payload => lockAndRun(() => onSubmit(payload))
  });

  root.querySelector('[data-assess-skip]')?.addEventListener('click', () => lockAndRun(() => onSkip({
    response: null,
    attemptMeta: { startedAt: Date.now(), submittedAt: Date.now(), inputMethod: 'unknown', pasteDetected: false }
  })));
  root.querySelector('[data-assess-exit]')?.addEventListener('click', onExit);
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}
