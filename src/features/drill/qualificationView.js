import { getSessionMetrics } from '../../core/sessionMachine.js';
import { formatMasteryPercent } from '../../ui/masteryProgress.js';
import { formatEffortClock } from './effortClock.js';

const EXPLAIN_ACCEPT_POLICY = 'explain-and-accept';

export function renderPassed({ root, session, set, onSubmit, onContinue }) {
  const metrics = getSessionMetrics(session, set);
  const explainAndAccept = set?.completionPolicy === EXPLAIN_ACCEPT_POLICY;
  const effortPass = metrics.qualificationReason === 'effort';
  root.innerHTML = `
    <main class="page page-centered passed-page">
      <section class="passed-card qualification-card ${effortPass ? 'effort-qualified-card' : ''}">
        <div class="brand-lockup centered"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
        <p class="eyebrow">${effortPass ? '👏 ĐÃ HOÀN THÀNH MỤC TIÊU CỐ GẮNG' : explainAndAccept ? '✅ ĐÃ HOÀN THÀNH' : '🎉 ĐÃ VƯỢT MỤC TIÊU'}</p>
        <h1>${effortPass
          ? `${formatMasteryPercent(metrics.mastery)}% Mastery · ${formatEffortClock(metrics.effortMsAtQualification ?? metrics.effortActiveMs)} cố gắng`
          : explainAndAccept
            ? `${metrics.completedMainItems}/${metrics.total} lượt đã học`
            : `${metrics.masteryEarned}/${metrics.masteryTotal} · ${formatMasteryPercent(metrics.mastery)}% Mastery`}</h1>
        <p>${effortPass
          ? `Con chưa cần giả thành ${formatMasteryPercent(set.passThreshold)}% Mastery. Hệ thống ghi nhận đúng rằng con đã kiên trì học chủ động đủ ${metrics.effortTargetMinutes} phút. Con có thể nộp bài hoặc tiếp tục học để nâng Mastery.`
          : explainAndAccept
            ? 'Con đã đi qua toàn bộ prompt Việt → Anh, đọc đáp án/giải thích sau mỗi lần Submit và Chấp nhận để tiếp tục.'
            : `Con đã đạt mục tiêu ${formatMasteryPercent(set.passThreshold)}% Mastery. Accuracy và completion đều nằm trong cùng Mastery.`}</p>
        <div class="passed-stats"><span>Accuracy ${metrics.accuracyEarned}/${metrics.accuracyTotal}</span><span>Completion ${metrics.completionEarned}/${metrics.completionTotal}</span><span>${metrics.totalAttempts} lượt trả lời</span>${metrics.effortPassEnabled ? `<span>Effort ${formatEffortClock(metrics.effortActiveMs)} / ${formatEffortClock(metrics.effortTargetMs)}</span>` : ''}</div>
        <div class="qualification-actions">
          <button class="primary-btn submit-assignment-btn" id="submit-assignment-btn" type="button">Nộp bài</button>
          ${explainAndAccept ? '' : '<button class="secondary-btn continue-learning-btn" id="continue-learning-btn" type="button">Làm tiếp</button>'}
        </div>
        <small>${effortPass
          ? 'PASS bằng Effort ghi nhận sự kiên trì; Mastery thực tế vẫn được giữ nguyên trong báo cáo.'
          : explainAndAccept
            ? 'Bài này không bắt sửa lại sau khi sai; mục tiêu là production → noticing → chấp nhận đáp án cục bộ.'
            : 'Mỗi câu là 1 Mastery unit. Bài mở/tự luyện nhận unit khi hoàn thành; câu có đáp án nhận unit khi đúng ngay lần đầu.'}</small>
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
