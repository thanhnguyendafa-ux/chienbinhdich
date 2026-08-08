import { masteryDisplayPercent } from '../../../core/masteryEngine.js';
import { adminTopbar, displayValue, esc, formatDate, formatDuration, statusLabel, typeLabel } from '../shared/adminUi.js';

export function renderAdminSessionDetail({ root, session, attempts, set, onBack }) {
  const mastery = masteryDisplayPercent(attempts, set?.items?.length ?? set?.itemCount ?? 1);
  const source = session.entryMode === 'fixed-link'
    ? session.accessSlug ?? 'Fixed link'
    : session.assignmentId ?? 'Legacy';

  root.innerHTML = `
    <main class="page admin-page">
      ${adminTopbar({ subtitle: 'Student Result' })}
      <section class="shell admin-shell">
        <button class="ghost-btn" id="admin-back-btn" type="button">← Dashboard</button>
        <section class="admin-result-head">
          <div>
            <p class="eyebrow">STUDENT SESSION</p>
            <h1>${esc(session.studentName || 'Không có tên')}</h1>
            <p>${esc(set?.title ?? session.setId)}</p>
          </div>
          <div class="admin-result-score"><span>Mastery</span><strong>${mastery}%</strong></div>
        </section>
        <div class="admin-result-grid">
          <div><span>Nguồn</span><strong>${esc(source)}</strong></div>
          <div><span>Set</span><strong>${esc(session.setId)}</strong></div>
          <div><span>Trạng thái</span><strong>${esc(statusLabel(session.status))}</strong></div>
          <div><span>Tổng attempt</span><strong>${attempts.length}</strong></div>
        </div>
        <section class="admin-question-list">
          ${attempts.map((attempt, index) => `
            <article class="admin-attempt ${attempt.correct ? 'is-correct' : 'is-wrong'}">
              <div><strong>#${index + 1} · ${esc(attempt.itemId)}</strong><span>${esc(typeLabel(attempt.questionType))}</span></div>
              <p>Trả lời: <code>${esc(displayValue(attempt.submittedAnswer ?? attempt.submittedResponse))}</code></p>
              <small>${attempt.correct ? '✓ Đúng' : '✗ Sai'} · ${formatDuration(attempt.responseDurationMs)} · ${formatDate(attempt.submittedAt)}</small>
            </article>`).join('') || '<p class="admin-empty">Session chưa có attempt.</p>'}
        </section>
      </section>
    </main>`;
  root.querySelector('#admin-back-btn')?.addEventListener('click', onBack);
}
