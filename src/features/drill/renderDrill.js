import { getCurrentItem, getSessionMetrics } from '../../core/sessionMachine.js';
import { questionTypeForItem, questionTypeLabel } from '../../core/questionTypes.js';
import { stageLabel } from '../../core/formatters.js';
import { animateMasteryProgress, formatMasteryPercent, renderMasteryProgress } from '../../ui/masteryProgress.js';
import { bindQuestionInteraction, renderQuestionInteraction } from './questionTypeRegistry.js';

export function renderDrill({ root, session, set, feedback = null, onSubmit, onExit, onFinishQualified }) {
  const item = getCurrentItem(session, set);
  if (!item) return;
  const metrics = getSessionMetrics(session, set);
  const masteryTarget = Number(set.passThreshold ?? 80);
  const masteryTransition = {
    from: Number(feedback?.masteryBefore ?? metrics.mastery),
    to: Number(feedback?.mastery ?? metrics.mastery),
    delta: Number(feedback?.masteryDeltaPercent ?? 0)
  };
  const revealAnswer = feedback?.type === 'incorrect_reveal';
  const reviewMode = session.currentPromptKind !== 'main';
  const extendedMode = session.status === 'extended';
  const mainPosition = Math.max(1, set.items.findIndex(candidate => candidate.id === item.id) + 1);
  const badge = item.stage ? stageLabel(item.stage) : questionTypeLabel(item);
  const exposureKey = `${session.id}:${item.id}:${session.promptIndex}`;

  root.innerHTML = `
    <main class="drill-page ${extendedMode ? 'extended-practice-page' : ''}">
      <header class="drill-topbar shell">
        <button class="ghost-btn exit-btn" id="exit-btn" type="button">← Thoát</button>
        <div class="drill-top-actions">
          ${extendedMode ? '<button class="secondary-btn extended-submit-btn" id="finish-qualified-btn" type="button">Nộp bài</button>' : ''}
          <div class="student-chip">${esc(session.studentName)}</div>
        </div>
      </header>

      <section class="shell metrics-row" aria-label="Tiến độ bài học và Mastery">
        <div class="metric sequence-metric"><span>${extendedMode ? 'Luyện thêm' : 'Chuỗi chính'}</span><strong>${extendedMode ? metrics.extendedAttempts : `${metrics.completedMainItems}/${metrics.total}`}</strong></div>
        ${renderMasteryProgress({ value: masteryTransition.to, previous: masteryTransition.from, threshold: masteryTarget, delta: masteryTransition.delta })}
      </section>

      <section class="drill-shell shell">
        <article class="prompt-card question-card type-${questionTypeForItem(item)} ${feedback ? 'has-error' : ''} ${revealAnswer ? 'is-reveal' : ''}">
          <div class="stage-line"><span class="stage-badge">${esc(badge)}</span><span>${extendedMode ? 'LUYỆN THÊM' : reviewMode ? reviewLabel(session.currentPromptKind) : `${mainPosition}/${set.items.length}`}</span></div>

          ${renderFeedback(feedback)}

          <div class="question-interaction">
            ${renderQuestionInteraction(item, { reviewMode, exposureKey })}
          </div>

          <p class="encouragement">${extendedMode
            ? `Con đã vượt ${formatMasteryPercent(set.passThreshold)}%. Làm tiếp để củng cố; khi muốn dừng, bấm Nộp bài.`
            : revealAnswer
              ? 'Xem đáp án chuẩn rồi tự sửa lại. Correction trong cùng lượt không cộng hoặc trừ Mastery.'
              : 'Chỉ lần trả lời đầu tiên của mỗi lượt xuất hiện mới làm Mastery tăng hoặc giảm.'}</p>
        </article>
      </section>

      <dialog class="exit-dialog" id="exit-dialog">
        <div class="dialog-copy"><strong>${extendedMode ? 'Con đã đạt mục tiêu rồi!' : 'Em muốn dừng bài?'}</strong><p>${extendedMode
          ? `Con đã vượt ${formatMasteryPercent(set.passThreshold)}%. Có thể tiếp tục luyện hoặc nộp bài để xem báo cáo.`
          : `Chưa đạt ${formatMasteryPercent(set.passThreshold)}% thì chưa thể nộp bài. Nếu cần dừng, báo cáo vẫn giữ thời gian và lịch sử làm bài.`}</p></div>
        <div class="dialog-actions"><button class="primary-btn" id="keep-learning-btn" type="button">Tiếp tục học</button>${extendedMode
          ? '<button class="secondary-btn" id="dialog-submit-btn" type="button">Nộp bài & xem báo cáo</button>'
          : '<button class="danger-text-btn" id="abandon-btn" type="button">Bỏ cuộc và xem báo cáo</button>'}</div>
      </dialog>
    </main>`;

  window.requestAnimationFrame(() => animateMasteryProgress(root, masteryTransition));
  const refocus = bindQuestionInteraction({ root, item, onSubmit, attemptStartedAt: Date.now() });

  const dialog = root.querySelector('#exit-dialog');
  root.querySelector('#exit-btn')?.addEventListener('click', () => dialog?.showModal());
  root.querySelector('#keep-learning-btn')?.addEventListener('click', () => {
    dialog?.close();
    refocus?.();
  });
  root.querySelector('#abandon-btn')?.addEventListener('click', onExit);
  root.querySelector('#finish-qualified-btn')?.addEventListener('click', onFinishQualified);
  root.querySelector('#dialog-submit-btn')?.addEventListener('click', onFinishQualified);
  dialog?.addEventListener('cancel', () => window.setTimeout(() => refocus?.(), 0));
}

export function showSuccess({ root, type, answer, mastery, masteryBefore, masteryDeltaPercent, onContinue }) {
  const card = root.querySelector('.prompt-card');
  const interaction = card?.querySelector('.question-interaction');
  if (!card || !interaction) return onContinue();

  animateMasteryProgress(root, { from: masteryBefore, to: mastery, delta: masteryDeltaPercent });
  card.classList.remove('has-error', 'is-reveal');
  card.classList.add('has-success');
  const correction = type === 'correction';
  const actualGain = Number(masteryDeltaPercent ?? 0);
  const masteryMessage = correction
    ? `Correction: Mastery không đổi · ${formatMasteryPercent(mastery)}%`
    : actualGain > 0
      ? `Mastery +${formatMasteryPercent(actualGain)}% → ${formatMasteryPercent(mastery)}%`
      : `Mastery giữ ở ${formatMasteryPercent(mastery)}%`;

  interaction.innerHTML = `
    <div class="success-panel" role="status">
      <span class="success-mark">ĐÚNG</span>
      <strong>${correction ? 'Đã sửa chính xác' : 'Retrieval chính xác'}</strong>
      <span class="answer-reveal">${esc(answer)}</span>
      <small>${masteryMessage}</small>
    </div>`;
  window.setTimeout(onContinue, 430);
}

export function renderPassed({ root, session, set, onSubmit, onContinue }) {
  const metrics = getSessionMetrics(session, set);
  root.innerHTML = `
    <main class="page page-centered passed-page">
      <section class="passed-card qualification-card">
        <div class="brand-lockup centered"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
        <p class="eyebrow">🎉 ĐÃ VƯỢT MỤC TIÊU</p>
        <h1>${formatMasteryPercent(metrics.mastery)}% Mastery</h1>
        <p>Con đã vượt mục tiêu ${formatMasteryPercent(set.passThreshold)}%. Con có thể nộp bài ngay hoặc làm tiếp để củng cố và nâng Mastery.</p>
        <div class="passed-stats"><span>${metrics.totalAttempts} lượt trả lời</span><span>${metrics.retryCount} lượt gặp lại</span></div>
        <div class="qualification-actions">
          <button class="primary-btn submit-assignment-btn" id="submit-assignment-btn" type="button">Nộp bài</button>
          <button class="secondary-btn continue-learning-btn" id="continue-learning-btn" type="button">Làm tiếp</button>
        </div>
        <small>Cả hai lựa chọn đều giữ toàn bộ lịch sử. Nếu làm tiếp, con có thể nộp bài bất cứ lúc nào.</small>
      </section>
    </main>`;
  root.querySelector('#submit-assignment-btn')?.addEventListener('click', async event => {
    event.currentTarget.disabled = true;
    event.currentTarget.textContent = 'Đang tạo báo cáo...';
    await onSubmit();
  });
  root.querySelector('#continue-learning-btn')?.addEventListener('click', async event => {
    event.currentTarget.disabled = true;
    event.currentTarget.textContent = 'Đang mở lượt luyện thêm...';
    await onContinue();
  });
}

function renderFeedback(feedback) {
  if (!feedback) return '';
  const delta = Number(feedback.masteryDeltaPercent ?? 0);
  const hitFloor = Number(feedback.masteryDeltaUnits ?? 0) < 0 && delta === 0 && Number(feedback.mastery ?? 0) === 0;
  const masteryMessage = delta < 0
    ? `Mastery −${formatMasteryPercent(Math.abs(delta))}%`
    : hitFloor
      ? 'Mastery đang ở sàn 0%'
      : 'Mastery không đổi';

  if (feedback.type === 'incorrect_reveal') {
    return `
      <div class="feedback reveal-feedback" role="alert">
        <div><span class="feedback-kicker">Sai lần ${feedback.attemptNumber} · ${masteryMessage}</span><strong>Đáp án chuẩn</strong></div>
        <code>${esc(feedback.revealAnswer)}</code>
        <p>Tự làm lại đúng để hoàn thành correction. Câu này vẫn sẽ quay lại trong chuỗi.</p>
      </div>`;
  }
  return `
    <div class="feedback error-feedback" role="alert">
      <div><span class="feedback-kicker">Sai · ${masteryMessage}</span><strong>Thử lại</strong></div>
      <p>Câu trả lời vừa chọn/làm: <q>${esc(feedback.entered || '(trống)')}</q></p>
      <p>Chưa hiện đáp án. Hãy tự nhớ và thử lại.</p>
    </div>`;
}

function reviewLabel(kind) {
  return ({ retry: 'GẶP LẠI', review: 'CỦNG CỐ', spacing: 'ÔN NHANH' })[kind] ?? 'ÔN LẠI';
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
