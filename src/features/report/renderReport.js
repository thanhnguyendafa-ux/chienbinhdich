import { getSessionMetrics } from '../../core/sessionMachine.js';
import { deriveAttemptAnalytics } from '../../core/attemptAnalytics.js';
import { formatClockTime, formatDateTime, formatDuration, formatResponseDuration, stageLabel } from '../../core/formatters.js';

export function renderReport({ root, session, set, onRetry, onHome }) {
  const metrics = getSessionMetrics(session, set);
  const analytics = deriveAttemptAnalytics(session, set);
  const itemById = new Map(set.items.map(item => [item.id, item]));

  root.innerHTML = `
    <main class="report-page">
      <section class="report-shell shell ${metrics.passed ? 'passed' : 'not-passed'}">
        <header class="report-header">
          <div class="brand-lockup"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
          <span class="result-stamp">${metrics.passed ? 'ĐẠT YÊU CẦU' : `CHƯA ĐẠT ${set.passThreshold}%`}</span>
        </header>

        <section class="report-summary">
          <div>
            <p class="eyebrow">BÁO CÁO HỌC TẬP</p>
            <h1>${esc(session.studentName)}</h1>
            <p class="report-course">${set.course} · ${set.unit} · Set 1</p>
          </div>
          <div class="score-hero"><span>Điểm chính xác</span><strong>${metrics.score}%</strong><small>${metrics.firstTryCorrect}/${metrics.total} item đúng ngay lần đầu</small></div>
        </section>

        <section class="report-grid" aria-label="Tóm tắt buổi học">
          ${summaryCell('Tổng lượt gõ', metrics.totalAttempts)}
          ${summaryCell('Item phải sửa', metrics.correctedCount)}
          ${summaryCell('Đã hiện đáp án', metrics.revealedCount)}
          ${summaryCell('Paste detected', analytics.pasteCount)}
          ${summaryCell('Phản hồi rất nhanh', analytics.rapidCount)}
          ${summaryCell('Trung vị phản hồi', formatResponseDuration(analytics.medianResponseMs))}
          ${summaryCell('Bắt đầu', formatDateTime(session.startedAt))}
          ${summaryCell('Thời gian', formatDuration(metrics.durationMs))}
        </section>

        ${renderSubmission(metrics, set)}

        <section class="integrity-note">
          <strong>Dấu hiệu cần xem lại</strong>
          <p>Paste và phản hồi rất nhanh chỉ là dữ liệu để thầy/phụ huynh xem quá trình làm bài, không tự động kết luận học sinh gian lận.</p>
        </section>

        <section class="timeline-section">
          <div class="timeline-heading">
            <div><p class="eyebrow">ACTIVITY TIMELINE</p><h2>Lịch sử từng lần gõ</h2></div>
            <span>${session.attempts.length} attempts</span>
          </div>
          <ol class="attempt-list">
            ${analytics.attempts.map(attempt => renderAttempt(attempt, itemById.get(attempt.itemId))).join('')}
          </ol>
        </section>

        <footer class="report-footer">
          <code>Session: ${esc(session.id)}</code>
          <div>${metrics.passed ? '<button id="home-btn" class="secondary-btn">Về trang đầu</button>' : '<button id="retry-btn" class="primary-btn">Làm lại Set 1</button>'}</div>
        </footer>
      </section>
    </main>`;

  root.querySelector('#retry-btn')?.addEventListener('click', onRetry);
  root.querySelector('#home-btn')?.addEventListener('click', onHome);
}

function renderAttempt(attempt, item) {
  const status = attempt.correct ? 'Đúng' : 'Sai';
  const statusClass = attempt.correct ? 'attempt-correct' : 'attempt-wrong';
  const flags = attempt.flags.map(flag => `<span class="attempt-flag ${flag}">${flagLabel(flag)}</span>`).join('');
  return `
    <li class="attempt-row ${statusClass}">
      <div class="attempt-time"><strong>${formatClockTime(attempt.submittedAt)}</strong><span>${formatResponseDuration(attempt.responseDurationMs)}</span></div>
      <div class="attempt-body">
        <div class="attempt-meta"><span>${stageLabel(item?.stage)}</span><span>Lần ${attempt.attemptNumber}</span><span class="attempt-status">${status}</span></div>
        <p class="attempt-prompt">${esc(item?.vi ?? attempt.itemId)}</p>
        <code class="attempt-answer">${esc(attempt.submittedAnswer || '(trống)')}</code>
        ${flags ? `<div class="attempt-flags">${flags}</div>` : ''}
      </div>
    </li>`;
}

function renderSubmission(metrics, set) {
  if (metrics.passed) {
    return `<section class="submission-callout"><strong>Chụp phần báo cáo này để nộp bài</strong><p>Gửi cho <b>${esc(set.teacher)}</b>. Nếu cần kiểm tra quá trình làm, kéo xuống xem Activity Timeline.</p></section>`;
  }
  return `<section class="submission-callout retry-callout"><strong>Chưa được tính là nộp bài</strong><p>Cần đạt ít nhất ${set.passThreshold}%. Hãy làm lại và cố gắng gõ đúng ngay lần đầu.</p></section>`;
}

function summaryCell(label, value) {
  return `<div><span>${label}</span><strong>${value}</strong></div>`;
}

function flagLabel(flag) {
  return ({ paste: 'PASTE', rapid: 'RẤT NHANH', answer_seen: 'ĐÃ XEM ĐÁP ÁN' })[flag] ?? flag;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
