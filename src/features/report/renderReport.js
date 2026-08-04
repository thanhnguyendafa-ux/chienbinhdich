import { getSessionMetrics } from '../../core/sessionMachine.js';
import { formatDateTime, formatDuration } from '../../core/formatters.js';

export function renderReport({ root, session, set, onRetry, onHome }) {
  const m = getSessionMetrics(session, set);
  root.innerHTML = `
    <main class="page report-page"><section class="report-card ${m.passed ? 'passed' : 'not-passed'}">
      <div class="report-brand">⚔️ CHIẾN BINH DỊCH</div><p class="eyebrow">BÁO CÁO HOÀN THÀNH</p>
      <h1>${esc(session.studentName)}</h1><p class="report-course">${set.course} · ${set.unit} · Set 1</p>
      <div class="result-stamp">${m.passed ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT 80%'}</div>
      <div class="score-hero"><span>Điểm chính xác</span><strong>${m.score}%</strong><small>${m.firstTryCorrect}/${m.total} item đúng ngay lần đầu</small></div>
      <div class="report-grid">
        <div><span>Item phải sửa</span><strong>${m.correctedCount}</strong></div><div><span>Thời gian</span><strong>${formatDuration(m.durationMs)}</strong></div>
        <div><span>Bắt đầu</span><strong>${formatDateTime(session.startedAt)}</strong></div><div><span>Hoàn thành</span><strong>${formatDateTime(session.completedAt)}</strong></div>
      </div>
      ${m.passed ? `<div class="submission-callout"><strong>📸 Hãy chụp màn hình báo cáo này</strong><p>Gửi cho <b>${set.teacher}</b> để xác nhận đã nộp bài.</p></div>` : `<div class="submission-callout retry-callout"><strong>Chưa được tính là nộp bài.</strong><p>Em cần đạt ít nhất ${set.passThreshold}%. Hãy làm lại và cố gắng đúng ngay lần đầu.</p></div>`}
      <div class="session-code">Session: ${session.id}</div>
      <div class="report-actions">${m.passed ? '<button id="home-btn" class="secondary-btn">Về trang đầu</button>' : '<button id="retry-btn" class="primary-btn">Làm lại Set 1</button>'}</div>
    </section></main>`;
  root.querySelector('#retry-btn')?.addEventListener('click', onRetry);
  root.querySelector('#home-btn')?.addEventListener('click', onHome);
}
function esc(v) { return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[c]); }
