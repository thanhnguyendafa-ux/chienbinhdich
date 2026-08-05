import { getSessionMetrics } from '../../core/sessionMachine.js';
import { getMasteryTransitions } from '../../core/masteryEngine.js';
import { deriveAttemptAnalytics } from '../../core/attemptAnalytics.js';
import { formatClockTime, formatDateTime, formatDuration, formatResponseDuration, stageLabel } from '../../core/formatters.js';

export function renderReport({ root, session, set, onRetry, onHome }) {
  const metrics = getSessionMetrics(session, set);
  const analytics = deriveAttemptAnalytics(session, set);
  const transitions = getMasteryTransitions(session.attempts, set.items.length);
  const itemById = new Map(set.items.map(item => [item.id, item]));
  const submitted = session.status === 'submitted';
  const abandoned = session.status === 'abandoned';

  root.innerHTML = `
    <main class="report-page">
      <section class="report-shell shell ${submitted ? 'passed' : 'not-passed'}">
        <header class="report-header">
          <div class="brand-lockup"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
          <span class="result-stamp">${submitted ? 'ĐÃ NỘP BÀI' : 'ĐÃ BỎ CUỘC'}</span>
        </header>

        <section class="report-summary">
          <div>
            <p class="eyebrow">BÁO CÁO HỌC TẬP</p>
            <h1>${esc(session.studentName)}</h1>
            <p class="report-course">${esc(set.course)} · ${esc(set.unit)} · Set 1</p>
          </div>
          <div class="score-hero"><span>Mastery cuối</span><strong>${formatPercent(metrics.mastery)}%</strong><small>${submitted ? `Đạt mốc ${set.passThreshold}% và đã bấm Nộp bài` : `Chưa nộp · mốc yêu cầu ${set.passThreshold}%`}</small></div>
        </section>

        <section class="report-grid" aria-label="Tóm tắt buổi học">
          ${summaryCell('Tổng lượt gõ', metrics.totalAttempts)}
          ${summaryCell('Retrieval đúng', metrics.retrievalSuccesses)}
          ${summaryCell('Retrieval sai', metrics.retrievalErrors)}
          ${summaryCell('Correction', metrics.corrections)}
          ${summaryCell('Lượt gặp lại', metrics.retryCount)}
          ${summaryCell('Đã hiện đáp án', metrics.revealedCount)}
          ${summaryCell('Paste detected', analytics.pasteCount)}
          ${summaryCell('Phản hồi rất nhanh', analytics.rapidCount)}
          ${summaryCell('Trung vị phản hồi', formatResponseDuration(analytics.medianResponseMs))}
          ${summaryCell('Bắt đầu', formatDateTime(session.startedAt))}
          ${summaryCell('Tổng thời gian', formatDuration(metrics.durationMs))}
          ${summaryCell('Kết thúc', formatDateTime(session.completedAt))}
        </section>

        ${renderOutcome({ submitted, abandoned, metrics, set })}

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
            ${analytics.attempts.map((attempt, index) => renderAttempt(attempt, itemById.get(attempt.itemId), transitions[index]?.delta ?? 0)).join('')}
          </ol>
        </section>

        <footer class="report-footer">
          <code>Session: ${esc(session.id)}</code>
          <div class="report-actions">${abandoned ? '<button id="retry-btn" class="secondary-btn">Làm lại Set 1</button>' : ''}<button id="home-btn" class="secondary-btn">Về trang đầu</button></div>
        </footer>
      </section>
    </main>`;

  root.querySelector('#retry-btn')?.addEventListener('click', onRetry);
  root.querySelector('#home-btn')?.addEventListener('click', onHome);
}

function renderAttempt(attempt, item, impact) {
  const correction = attempt.result === 'correction';
  const status = correction ? 'Sửa đúng' : (attempt.correct ? 'Đúng' : 'Sai');
  const statusClass = attempt.correct ? 'attempt-correct' : 'attempt-wrong';
  const flags = attempt.flags.map(flag => `<span class="attempt-flag ${flag}">${flagLabel(flag)}</span>`).join('');
  const impactLabel = impact > 0 ? `+${formatPercent(impact)}%` : impact < 0 ? `−${formatPercent(Math.abs(impact))}%` : '0%';
  return `
    <li class="attempt-row ${statusClass}">
      <div class="attempt-time"><strong>${formatClockTime(attempt.submittedAt)}</strong><span>${formatResponseDuration(attempt.responseDurationMs)}</span></div>
      <div class="attempt-body">
        <div class="attempt-meta"><span>${stageLabel(item?.stage)}</span><span>${promptKindLabel(attempt.promptKind)}</span><span>Lần ${attempt.attemptNumber}</span><span class="attempt-status">${status}</span><span class="mastery-impact">Mastery ${impactLabel}</span></div>
        <p class="attempt-prompt">${esc(item?.vi ?? attempt.itemId)}</p>
        <code class="attempt-answer">${esc(attempt.submittedAnswer || '(trống)')}</code>
        ${flags ? `<div class="attempt-flags">${flags}</div>` : ''}
      </div>
    </li>`;
}

function renderOutcome({ submitted, abandoned, metrics, set }) {
  if (submitted) {
    return `<section class="submission-callout"><strong>Bài đã được đánh dấu là ĐÃ NỘP</strong><p>Mastery ${formatPercent(metrics.mastery)}%. Chụp báo cáo này và gửi cho <b>${esc(set.teacher)}</b> nếu lớp đang dùng quy trình nộp bằng ảnh.</p></section>`;
  }
  if (abandoned) {
    return `<section class="submission-callout retry-callout"><strong>Chưa được tính là nộp bài</strong><p>Học sinh đã chọn Bỏ cuộc ở Mastery ${formatPercent(metrics.mastery)}%. Báo cáo vẫn giữ tổng thời gian và toàn bộ lịch sử gõ để thầy/phụ huynh nhìn thấy mức độ cố gắng.</p></section>`;
  }
  return '';
}

function summaryCell(label, value) {
  return `<div><span>${label}</span><strong>${value}</strong></div>`;
}

function flagLabel(flag) {
  return ({ paste: 'PASTE', rapid: 'RẤT NHANH', answer_seen: 'ĐÃ XEM ĐÁP ÁN' })[flag] ?? flag;
}

function promptKindLabel(kind) {
  return ({ main: 'CHUỖI CHÍNH', retry: 'GẶP LẠI', review: 'CỦNG CỐ', spacing: 'ÔN NHANH' })[kind] ?? 'LUYỆN';
}

function formatPercent(value) {
  const numeric = Number(value ?? 0);
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
