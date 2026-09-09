import { getCurrentItem, getSessionMetrics } from '../../core/sessionMachine.js';
import { questionTypeForItem, questionTypeLabel } from '../../core/questionTypes.js';
import { stageLabel } from '../../core/formatters.js';
import { animateMasteryProgress, formatMasteryPercent, renderMasteryProgress } from '../../ui/masteryProgress.js';
import { bindQuestionInteraction, renderQuestionInteraction } from './questionTypeRegistry.js';
import { bindTheorySupport, renderTheorySupport } from './theorySupportRenderer.js';
import { renderFeedback } from './drillFeedback.js';
import { formatEffortClock, installEffortClock } from './effortClock.js';

export { showSuccess } from './drillFeedback.js';
export { renderPassed } from './qualificationView.js';

const EXPLAIN_ACCEPT_POLICY = 'explain-and-accept';

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
  const explainAndAccept = set?.completionPolicy === EXPLAIN_ACCEPT_POLICY;
  const completionMode = item.masteryMode === 'completion';
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

      <section class="shell metrics-row" aria-label="Tiến độ bài học, Mastery và thời gian cố gắng">
        <div class="metric sequence-metric"><span>${extendedMode ? 'Luyện thêm' : 'Chuỗi chính'}</span><strong>${extendedMode ? metrics.extendedAttempts : `${metrics.completedMainItems}/${metrics.total}`}</strong></div>
        <div class="metric mastery-count-metric"><span>Mastery units</span><strong>${metrics.masteryEarned}/${metrics.masteryTotal}</strong></div>
        ${renderMasteryProgress({ value: masteryTransition.to, previous: masteryTransition.from, threshold: masteryTarget, delta: masteryTransition.delta })}
        ${metrics.effortPassEnabled ? `<div class="metric effort-timer-metric ${metrics.effortThresholdReached ? 'is-reached' : ''}" data-effort-timer>
          <span>⏱ Cố gắng</span>
          <strong data-effort-clock>${formatEffortClock(metrics.effortActiveMs)} / ${formatEffortClock(metrics.effortTargetMs)}</strong>
          <small data-effort-note>${metrics.effortThresholdReached ? 'Đã đủ thời gian · hoàn thành câu hiện tại để hệ thống ghi nhận.' : `PASS khi đạt ${formatMasteryPercent(masteryTarget)}% Mastery HOẶC đủ ${metrics.effortTargetMinutes} phút học chủ động.`}</small>
        </div>` : ''}
      </section>

      <section class="drill-shell shell">
        <article class="prompt-card question-card type-${questionTypeForItem(item)} ${item.passageId ? 'has-reading-passage' : ''} ${feedback ? 'has-error' : ''} ${revealAnswer ? 'is-reveal' : ''}">
          <div class="stage-line"><span class="stage-badge">${esc(badge)}</span><span>${extendedMode ? 'LUYỆN THÊM' : reviewMode ? reviewLabel(session.currentPromptKind) : `${mainPosition}/${set.items.length}`}</span></div>

          ${renderFeedback(feedback, item)}

          <div class="question-interaction">
            ${renderQuestionInteraction(item, { reviewMode, exposureKey, passages: set.passages ?? [] })}
          </div>

          ${explainAndAccept ? '' : renderTheorySupport({ item, session, esc, escAttr })}

          <p class="encouragement">${extendedMode
            ? `Con đã đủ điều kiện nộp bài. Làm tiếp để củng cố; khi muốn dừng, bấm Nộp bài.`
            : explainAndAccept
              ? 'Tự gõ tiếng Anh. Sau khi Submit, đọc đáp án và giải thích rồi bấm Chấp nhận. Không có gợi ý trước.'
              : completionMode
                ? 'Câu này tính 1 Mastery unit khi con hoàn thành yêu cầu. Hệ thống ghi nhận HOÀN THÀNH, không giả chấm nội dung mở hoặc giọng nói là đúng/sai.'
                : revealAnswer
                  ? 'Xem đáp án chuẩn rồi tự sửa lại. Correction trong cùng lượt không cộng hoặc trừ Mastery.'
                  : item.passageId
                    ? 'Chọn phương án mà cả True/False và lý do đều khớp bài đọc.'
                    : questionTypeForItem(item) === 'classification'
                      ? 'Phân loại hết các mục trước khi kiểm tra. Click mục đã xếp để đưa về kho và sửa lại.'
                      : questionTypeForItem(item) === 'sentence_order' && item.orderDiagnostics
                        ? 'Không nhất thiết phải dùng hết các khối. Chọn đúng thành phần và đúng thứ tự.'
                        : metrics.effortPassEnabled
                          ? `Đọc kỹ và làm bằng thực lực. Không cần cố làm thật nhanh hoặc cố ngồi chờ; Timer chỉ tính thời gian học chủ động.`
                          : 'Câu có đáp án nhận 1 Mastery unit khi đúng ngay lần đầu; correction giúp học lại nhưng không cộng thêm unit.'}</p>
        </article>
      </section>

      <dialog class="exit-dialog" id="exit-dialog">
        <div class="dialog-copy"><strong>${extendedMode ? 'Con đã đạt mục tiêu rồi!' : 'Em muốn dừng bài?'}</strong><p>${extendedMode
          ? `Con đã đủ điều kiện PASS. Có thể tiếp tục luyện hoặc nộp bài để xem báo cáo.`
          : explainAndAccept
            ? 'Bài này hoàn thành bằng cách đi qua toàn bộ prompt: Submit → đọc giải thích → Chấp nhận.'
            : metrics.effortPassEnabled
              ? `Con được nộp khi đạt ${formatMasteryPercent(set.passThreshold)}% Mastery HOẶC học chủ động đủ ${metrics.effortTargetMinutes} phút. Rời tab không được tính vào Timer.`
              : `Chưa đạt ${formatMasteryPercent(set.passThreshold)}% thì chưa thể nộp bài. Mastery dùng toàn bộ ${metrics.masteryTotal} câu của bài làm mẫu số.`}</p></div>
        <div class="dialog-actions"><button class="primary-btn" id="keep-learning-btn" type="button">Tiếp tục học</button>${extendedMode
          ? '<button class="secondary-btn" id="dialog-submit-btn" type="button">Nộp bài & xem báo cáo</button>'
          : '<button class="danger-text-btn" id="abandon-btn" type="button">Bỏ cuộc và xem báo cáo</button>'}</div>
      </dialog>
    </main>`;

  window.requestAnimationFrame(() => animateMasteryProgress(root, masteryTransition));
  installEffortClock(root, session, set);
  const refocus = bindQuestionInteraction({ root, item, onSubmit, attemptStartedAt: Date.now() });
  bindTheorySupport(root);

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

function reviewLabel(kind) {
  return ({ retry: 'GẶP LẠI', review: 'CỦNG CỐ', spacing: 'ÔN NHANH' })[kind] ?? 'ÔN LẠI';
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function escAttr(value) {
  return esc(value);
}
