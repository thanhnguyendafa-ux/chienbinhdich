import { getSessionMetrics } from '../../core/sessionMachine.js';
import { getMasteryTransitions } from '../../core/masteryEngine.js';
import { questionPromptDisplay, questionTypeLabel } from '../../core/questionTypes.js';
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
      <nav class="report-toolbar shell" aria-label="Tác vụ báo cáo">
        <div class="report-toolbar-title">
          <strong>Báo cáo học tập</strong>
          <span>${esc(session.studentName)}</span>
        </div>
        <div class="report-toolbar-actions">
          ${abandoned ? '<button id="retry-btn" class="secondary-btn" type="button">Làm lại Set</button>' : ''}
          ${submitted ? '<button id="print-report-btn" class="primary-btn print-report-btn" type="button">In báo cáo</button>' : ''}
          <button id="home-btn" class="secondary-btn" type="button">Về trang đầu</button>
        </div>
      </nav>

      <article class="report-document shell ${submitted ? 'is-submitted' : 'is-abandoned'}">
        <header class="report-document-header">
          <div class="report-brand">MRT · CHIẾN BINH DỊCH</div>
          <strong class="result-stamp">${submitted ? 'ĐÃ NỘP BÀI' : 'ĐÃ BỎ CUỘC'}</strong>
        </header>

        <section class="report-summary">
          <div>
            <p class="report-kicker">BÁO CÁO HỌC TẬP</p>
            <h1>${esc(session.studentName)}</h1>
            <p class="report-course">${esc(set.course)} · ${esc(set.unit)} · ${esc(set.title)}</p>
          </div>
          <div class="report-score">
            <span>Mastery cuối</span>
            <strong>${formatPercent(metrics.mastery)}%</strong>
            <small>${submitted ? `Mục tiêu ${set.passThreshold}% · Đã nộp bài` : `Mục tiêu ${set.passThreshold}% · Chưa nộp`}</small>
          </div>
        </section>

        ${metricSection('Kết quả học tập', [
          [
            ['Tổng lượt trả lời', metrics.totalAttempts],
            ['Retrieval đúng', metrics.retrievalSuccesses],
            ['Retrieval sai', metrics.retrievalErrors]
          ],
          [
            ['Correction', metrics.corrections],
            ['Lượt gặp lại', metrics.retryCount],
            ['Đã hiện đáp án', metrics.revealedCount]
          ],
          [
            ['Chuỗi chính', `${metrics.completedMainItems}/${metrics.total}`],
            ['Mastery cuối', `${formatPercent(metrics.mastery)}%`],
            ['Mục tiêu', `${set.passThreshold}%`]
          ],
          [
            ['Mastery lúc đạt', metrics.masteryAtQualification === null ? '—' : `${formatPercent(metrics.masteryAtQualification)}%`],
            ['Luyện thêm', metrics.extendedPractice ? 'Có' : 'Không'],
            ['Lượt luyện thêm', metrics.extendedAttempts]
          ]
        ])}

        ${metricSection('Thời gian', [
          [
            ['Bắt đầu', formatDateTime(session.startedAt)],
            ['Đạt mục tiêu', metrics.qualifiedAt ? formatDateTime(metrics.qualifiedAt) : 'Chưa đạt'],
            ['Kết thúc', formatDateTime(session.completedAt)]
          ],
          [
            ['Tổng thời gian', formatDuration(metrics.durationMs)],
            ['Thời gian luyện thêm', metrics.extendedPractice ? formatDuration(metrics.extendedPracticeDurationMs) : '—']
          ]
        ])}

        ${metricSection('Dấu hiệu quá trình', [
          [
            ['Paste detected', analytics.pasteCount],
            ['Phản hồi rất nhanh', analytics.rapidCount],
            ['Trung vị phản hồi', formatResponseDuration(analytics.medianResponseMs)]
          ]
        ])}

        ${renderOutcome({ submitted, abandoned, metrics, set })}

        <section class="process-note">
          <strong>Lưu ý khi đọc dữ liệu</strong>
          <p>Paste và phản hồi rất nhanh chỉ là dữ liệu quá trình. Các dạng chọn đáp án hoặc tap token được ghi riêng theo input method và không tự động bị coi là gian lận.</p>
        </section>

        <section class="timeline-section">
          <div class="timeline-heading">
            <div><p class="report-kicker">ACTIVITY TIMELINE</p><h2>Lịch sử từng lần trả lời</h2></div>
            <span>${session.attempts.length} lượt</span>
          </div>
          <ol class="attempt-list">
            ${analytics.attempts.map((attempt, index) => renderAttempt(attempt, itemById.get(attempt.itemId), transitions[index]?.delta ?? 0)).join('')}
          </ol>
        </section>

        <footer class="report-document-footer">
          <code>Session: ${esc(session.id)}</code>
        </footer>
      </article>
    </main>`;

  root.querySelector('#retry-btn')?.addEventListener('click', onRetry);
  root.querySelector('#print-report-btn')?.addEventListener('click', () => window.print());
  root.querySelector('#home-btn')?.addEventListener('click', onHome);
}

function metricSection(title, rows) {
  return `
    <section class="metric-section">
      <h2>${esc(title)}</h2>
      <div class="metric-lines">
        ${rows.map(row => `<div class="metric-line">${row.map(([label, value]) => metricItem(label, value)).join('')}</div>`).join('')}
      </div>
    </section>`;
}

function metricItem(label, value) {
  return `<div class="metric-item"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
}

function renderAttempt(attempt, item, impact) {
  const correction = attempt.result === 'correction';
  const status = correction ? 'SỬA ĐÚNG' : (attempt.correct ? 'ĐÚNG' : 'SAI');
  const flags = (attempt.flags ?? []).map(flag => `<span class="attempt-flag">${flagLabel(flag)}</span>`).join('');
  const impactLabel = impact > 0 ? `+${formatPercent(impact)}%` : impact < 0 ? `−${formatPercent(Math.abs(impact))}%` : '0%';
  const typeLabel = item?.stage ? stageLabel(item.stage) : questionTypeLabel(attempt.questionType ?? item);
  return `
    <li class="attempt-row">
      <div class="attempt-time"><strong>${formatClockTime(attempt.submittedAt)}</strong><span>${formatResponseDuration(attempt.responseDurationMs)}</span></div>
      <div class="attempt-body">
        <div class="attempt-meta">
          <span>${esc(typeLabel)}</span>
          <span>${promptKindLabel(attempt.promptKind)}</span>
          <span>Lần ${attempt.attemptNumber}</span>
          <strong class="attempt-status">${status}</strong>
          <strong class="mastery-impact">Mastery ${impactLabel}</strong>
        </div>
        <p class="attempt-prompt">${esc(questionPromptDisplay(item) || attempt.itemId)}</p>
        <div class="attempt-answer"><span>Trả lời:</span> <code>${esc(attempt.submittedAnswer || '(trống)')}</code></div>
        ${flags ? `<div class="attempt-flags">${flags}</div>` : ''}
      </div>
    </li>`;
}

function renderOutcome({ submitted, abandoned, metrics, set }) {
  if (submitted) {
    const extra = metrics.extendedPractice
      ? `Học sinh đã chọn Làm tiếp sau khi đạt mục tiêu và luyện thêm ${metrics.extendedAttempts} lượt trước khi nộp.`
      : 'Học sinh đã nộp ngay sau khi đạt mục tiêu.';
    return `<section class="report-outcome"><strong>Bài đã được đánh dấu là ĐÃ NỘP</strong><p>Mastery cuối ${formatPercent(metrics.mastery)}%. Chuỗi chính ${metrics.completedMainItems}/${metrics.total}. ${extra} Có thể bấm In báo cáo ở thanh công cụ phía trên để in hoặc lưu PDF và gửi cho ${esc(set.teacher)}.</p></section>`;
  }
  if (abandoned) return `<section class="report-outcome"><strong>Chưa được tính là nộp bài</strong><p>Học sinh đã chọn Bỏ cuộc ở Mastery ${formatPercent(metrics.mastery)}%. Báo cáo vẫn giữ tổng thời gian và toàn bộ lịch sử làm bài.</p></section>`;
  return '';
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
