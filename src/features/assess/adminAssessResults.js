import { deriveAssessSummary } from '../../core/assessSummary.js';

export function createAdminAssessResults({ root, admin, loadHistoricalLesson }) {
  async function loadResults() {
    const target = root.querySelector('[data-assess-results]');
    const button = root.querySelector('[data-refresh]');
    if (!target || !button) return;
    button.disabled = true;
    target.innerHTML = '<p>Đang tải kết quả Assess...</p>';
    try {
      const sessions = await admin.listAssessSessions(25);
      const rows = await mapWithConcurrency(sessions, 3, loadRow);
      applyBaselineLabels(rows);
      target.innerHTML = renderResultsTable(rows);
      root.querySelectorAll('[data-session-id]').forEach(resultButton => {
        resultButton.addEventListener('click', () => renderDetail(resultButton.dataset.sessionId, rows));
      });
    } catch (error) {
      target.innerHTML = `<p class="assess-inline-error">${esc(error?.message ?? 'Không tải được kết quả Assess.')}</p>`;
    } finally {
      button.disabled = false;
    }
  }

  async function loadRow(session) {
    try {
      const [attempts, lesson] = await Promise.all([
        admin.listSessionAttempts(session.id),
        loadHistoricalLesson(session)
      ]);
      const summary = deriveAssessSummary(attempts, lesson, {
        typingTolerance: session.typingToleranceAtStart === true
      });
      return { session, attempts, lesson, summary, label: '', error: null };
    } catch (error) {
      return { session, attempts: [], lesson: null, summary: null, label: '', error };
    }
  }

  function renderDetail(sessionId, rows) {
    const row = rows.find(candidate => candidate.session.id === sessionId);
    const target = root.querySelector('[data-assess-detail]');
    if (!row || !target) return;
    if (row.error || !row.summary) {
      target.innerHTML = `<h2>Không tải được chi tiết</h2><p>${esc(row.error?.message ?? 'Không có dữ liệu.')}</p>`;
      return;
    }
    const summary = row.summary;
    target.innerHTML = `
      <div class="assess-detail-head">
        <div><span class="assess-mode-badge">ASSESS · ${esc(row.label)}</span><h2>${esc(row.session.studentName)}</h2><p>${esc(row.lesson.title)}</p></div>
        <strong class="assess-big-score">${formatPercent(summary.percent)}</strong>
      </div>
      <div class="assess-stat-grid">
        <div><strong>${summary.correct}</strong><span>Đúng</span></div>
        <div><strong>${summary.incorrect}</strong><span>Sai</span></div>
        <div><strong>${summary.unanswered}</strong><span>Chưa trả lời</span></div>
        <div><strong>${summary.assessableTotal}</strong><span>Tổng chấm</span></div>
        <div><strong>${formatDuration(durationFor(row.session))}</strong><span>Thời gian</span></div>
      </div>
      <div class="assess-detail-list">
        ${summary.details.map((detail, index) => `
          <article class="assess-detail-item">
            <header><strong>Q${index + 1}</strong><span class="assess-status-${detail.status}">${statusLabel(detail.status)}</span></header>
            <p><b>Học sinh:</b> ${esc(detail.submittedAnswer || '—')}</p>
            <p><b>Đáp án chuẩn:</b> ${esc(detail.expectedAnswer || '—')}</p>
            <small>${formatDuration(detail.responseDurationMs)} · ${detail.pasteDetected ? 'Có paste' : esc(detail.inputMethod)}</small>
          </article>`).join('')}
      </div>`;
  }

  return Object.freeze({ loadResults });
}

export function applyBaselineLabels(rows) {
  const groups = new Map();
  for (const row of [...rows].sort((a, b) => Number(a.session.startedAt ?? 0) - Number(b.session.startedAt ?? 0))) {
    const key = `${String(row.session.studentName).trim().toLocaleLowerCase('vi')}::${row.session.setId}`;
    const count = groups.get(key) ?? 0;
    row.label = count === 0 ? 'BASELINE' : 'RETEST';
    groups.set(key, count + 1);
  }
}

export function renderResultsTable(rows) {
  if (!rows.length) return '<p>Chưa có lượt Assess nào.</p>';
  return `
    <div class="assess-table-wrap">
      <table class="assess-results-table">
        <thead><tr><th>Học sinh</th><th>Mode</th><th>Bài</th><th>Điểm</th><th>Đúng/Tổng</th><th>Thời gian</th><th>Lần</th><th>Cập nhật</th><th></th></tr></thead>
        <tbody>
          ${rows.map(row => {
            const summary = row.summary;
            return `<tr>
              <td>${esc(row.session.studentName)}</td>
              <td><span class="assess-mode-badge small">ASSESS</span></td>
              <td>${esc(row.session.setId)}</td>
              <td>${summary ? `<strong>${formatPercent(summary.percent)}</strong>` : '—'}</td>
              <td>${summary ? `${summary.correct}/${summary.assessableTotal}` : '—'}</td>
              <td>${formatDuration(durationFor(row.session))}</td>
              <td>${esc(row.label)}</td>
              <td>${formatDate(row.session.submittedAt ?? row.session.syncedAt ?? row.session.startedAt)}</td>
              <td><button class="ghost-btn" type="button" data-session-id="${escAttr(row.session.id)}">Xem</button></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

async function mapWithConcurrency(values, limit, mapper) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= values.length) return;
      results[index] = await mapper(values[index], index);
    }
  }
  const workerCount = Math.min(Math.max(1, Number(limit) || 1), values.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

function durationFor(session) {
  return Math.max(0, Number(session.completedAt ?? session.submittedAt ?? session.syncedAt ?? Date.now()) - Number(session.startedAt ?? 0));
}

function formatPercent(value) {
  const number = Number(value ?? 0);
  return `${Number.isInteger(number) ? number : number.toFixed(2)}%`;
}

function formatDuration(ms) {
  const seconds = Math.max(0, Math.round(Number(ms ?? 0) / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function formatDate(value) {
  const date = new Date(Number(value ?? 0));
  return Number.isFinite(date.getTime()) ? date.toLocaleString('vi-VN') : '—';
}

function statusLabel(status) {
  return ({ correct: 'ĐÚNG', incorrect: 'SAI', unanswered: 'CHƯA TRẢ LỜI' })[status] ?? String(status).toUpperCase();
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function escAttr(value) {
  return esc(value);
}
