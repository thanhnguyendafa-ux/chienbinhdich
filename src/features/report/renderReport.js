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
      <div class="report-toolbar shell" aria-label="Thao tác báo cáo">
        <div class="brand-lockup"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
        <div class="report-actions">
          ${abandoned ? '<button id="retry-btn" type="button">Làm lại Set</button>' : ''}
          ${submitted ? '<button id="print-report-btn" class="print-report-btn" type="button">In báo cáo</button>' : ''}
          <button id="home-btn" type="button">Về trang đầu</button>
        </div>
      </div>

      <article class="report-document shell" aria-label="Báo cáo học tập">
        <header class="report-document-header">
          <div>
            <p class="eyebrow">BÁO CÁO HỌC TẬP</p>
            <h1>${esc(session.studentName)}</h1>
            <p class="report-course">${esc(set.course)} · ${esc(set.unit)}</p>
          </div>
          <span class="result-stamp">${submitted ? 'ĐÃ NỘP BÀI' : 'ĐÃ BỎ CUỘC'}</span>
        </header>

        <section class="report-hero">
          <div class="report-hero-copy">
            <span>Bài</span>
            <strong>${esc(set.title)}</strong>
          </div>
          <div class="score-hero">
            <span>Mastery cuối</span>
            <strong>${formatPercent(metrics.mastery)}%</strong>
            <small>Mục tiêu ${set.passThreshold}%</small>
          </div>
        </section>

        ${metricSection('Kết quả học tập', [
          [
            ['Mastery cuối', `${formatPercent(metrics.mastery)}%`],
            ['Mục tiêu', `${set.passThreshold}%`],
            ['Trạng thái', submitted ? 'Đã nộp bài' : 'Đã bỏ cuộc']
          ],
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
            ['Luyện thêm', metrics.extendedPractice ? 'Có' : 'Không'],
            ['Lượt luyện thêm', metrics.extendedAttempts],
            ['Mastery lúc đạt', metrics.masteryAtQualification === null ? '—' : `${formatPercent(metrics.masteryAtQualification)}%`]
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
            ['Thời gian luyện thêm', metrics.extendedPractice ? formatDuration(metrics.extendedPracticeDurationMs) : '—'],
            ['Số câu trong Set', set.items.length]
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

        <section class="integrity-note">
          <strong>Dấu hiệu cần xem lại</strong>
          <p>Paste và phản hồi rất nhanh chỉ là dữ liệu quá trình. Các dạng chọn đáp án hoặc chạm token được ghi theo input method và không tự động bị coi là gian lận.</p>
        </section>

        <section class="timeline-section">
          <div class="timeline-heading">
            <div><p class="eyebrow">ACTIVITY TIMELINE</p><h2>Lịch sử từng lần trả lời</h2></div>
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
      <h2 class="metric-section-title">${esc(title)}</h2>
      <div class="metric-table">
        ${rows.map(metricLine).join('')}
      </div>
    </section>`;
}

function metricLine(pairs) {
  return `<div class="metric-line">${pairs.map(([label, value]) => metricPair(label, value)).join('')}</div>`;
}

function metricPair(label, value) {
  return `<div class="metric-pair"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
}

function renderAttempt(attempt, item, impact) {
  const correction = attempt.result === 'correction';
  const status = correction ? 'SỬA ĐÚNG' : (attempt.correct ? 'ĐÚNG' : 'SAI');
  const flags = (attempt.flags ?? []).map(flag => `<span class="attempt-flag ${flag}">${flagLabel(flag)}</span>`).join('');
  const impactLabel = impact > 0 ? `+${formatPercent(impact)}%` : impact < 0 ? `−${formatPercent(Math.abs(impact))}%` : '0%';
  const typeLabel = item?.stage ? stageLabel(item.stage) : questionTypeLabel(attempt.questionType ?? item);
  return `
    <li class="attempt-row">
      <div class="attempt-topline">
        <span class="attempt-time">${formatClockTime(attempt.submittedAt)}</span>
        <div class="attempt-meta"><span>${esc(typeLabel)}</span><span>${promptKindLabel(attempt.promptKind)}</span><span>Lần ${attempt.attemptNumber}</span><span>${formatResponseDuration(attempt.responseDurationMs)}</span></div>
        <strong class="attempt-status">${status}</strong>
        <strong class="mastery-impact">${impactLabel}</strong>
      </div>
      <p class="attempt-prompt">${esc(questionPromptDisplay(item) || attempt.itemId)}</p>
      <div class="attempt-response"><span>Trả lời:</span><code class="attempt-answer">${esc(attempt.submittedAnswer || '(trống)')}</code></div>
      ${flags ? `<div class="attempt-flags">${flags}</div>` : ''}
    </li>`;
}

function renderOutcome({ submitted, abandoned, metrics, set }) {
  if (submitted) {
    const extra = metrics.extendedPractice
      ? `Học sinh đã chọn Làm tiếp sau khi đạt mục tiêu và luyện thêm ${metrics.extendedAttempts} lượt trước khi nộp.`
      : 'Học sinh đã nộp ngay sau khi đạt mục tiêu.';
    return `<section class="submission-callout"><strong>Bài đã được đánh dấu là ĐÃ NỘP</strong><p>Mastery cuối ${formatPercent(metrics.mastery)}%. ${extra} Báo cáo có thể được in hoặc lưu PDF để gửi cho ${esc(set.teacher)}.</p></section>`;
  }
  if (abandoned) return `<section class="submission-callout"><strong>Chưa được tính là nộp bài</strong><p>Học sinh đã chọn Bỏ cuộc ở Mastery ${formatPercent(metrics.mastery)}%. Báo cáo vẫn giữ tổng thời gian và lịch sử làm bài.</p></section>`;
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
