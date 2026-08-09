import { masteryDisplayPercent } from '../../../core/masteryEngine.js';
import { deriveReadingDiagnostics, selectedReadingChoice } from '../../../core/readingDiagnostics.js';
import {
  deriveSentenceOrderDiagnostics,
  diagnoseSentenceOrder,
  sentenceOrderDiagnosticLabel
} from '../../../core/sentenceOrderDiagnostics.js';
import { adminTopbar, displayValue, esc, formatDate, formatDuration, statusLabel, typeLabel } from '../shared/adminUi.js';

export function renderAdminSessionDetail({ root, session, attempts, set, onBack }) {
  const mastery = masteryDisplayPercent(attempts, set?.items?.length ?? set?.itemCount ?? 1);
  const source = session.entryMode === 'fixed-link' ? session.accessSlug ?? 'Fixed link' : session.assignmentId ?? 'Legacy';
  const reading = deriveReadingDiagnostics({ ...session, attempts }, set);
  const writing = deriveSentenceOrderDiagnostics({ ...session, attempts }, set);
  const itemById = new Map((set?.items ?? []).map(item => [item.id, item]));

  root.innerHTML = `
    <main class="page admin-page">
      ${adminTopbar({ subtitle: 'Student Result' })}
      <section class="shell admin-shell">
        <button class="ghost-btn" id="admin-back-btn" type="button">← Dashboard</button>
        <section class="admin-result-head">
          <div><p class="eyebrow">STUDENT SESSION</p><h1>${esc(session.studentName || 'Không có tên')}</h1><p>${esc(set?.title ?? session.setId)}</p></div>
          <div class="admin-result-score"><span>Mastery</span><strong>${mastery}%</strong></div>
        </section>
        <div class="admin-result-grid">
          <div><span>Nguồn</span><strong>${esc(source)}</strong></div><div><span>Set</span><strong>${esc(session.setId)}</strong></div>
          <div><span>Trạng thái</span><strong>${esc(statusLabel(session.status))}</strong></div><div><span>Tổng attempt</span><strong>${attempts.length}</strong></div>
        </div>
        ${reading.total ? `<section class="admin-result-grid" aria-label="Reading diagnostics">
          <div><span>Đúng kết luận + lý do</span><strong>${reading.correctVerdictCorrectReason}</strong></div>
          <div><span>Đúng kết luận + sai lý do</span><strong>${reading.rightVerdictWrongReason}</strong></div>
          <div><span>Sai kết luận + đúng dữ kiện</span><strong>${reading.wrongVerdictRightEvidence}</strong></div>
          <div><span>Sai kết luận + sai lý do</span><strong>${reading.wrongVerdictWrongReason}</strong></div>
        </section>` : ''}
        ${writing.total ? renderWritingSummary(writing) : ''}
        <section class="admin-question-list">
          ${attempts.map((attempt, index) => renderAttempt(attempt, index, itemById.get(attempt.itemId))).join('') || '<p class="admin-empty">Session chưa có attempt.</p>'}
        </section>
      </section>
    </main>`;
  root.querySelector('#admin-back-btn')?.addEventListener('click', onBack);
}

function renderWritingSummary(writing) {
  const errorCells = writing.errors.map(error => `<div><span>${esc(error.label)}</span><strong>${error.count}</strong></div>`).join('');
  return `<section class="admin-result-grid" aria-label="Writing diagnostics">
    <div><span>Writing · lần đầu</span><strong>${writing.correct}/${writing.total} đúng</strong></div>
    ${errorCells || '<div><span>Lỗi Writing</span><strong>0</strong></div>'}
  </section>`;
}

function renderAttempt(attempt, index, item) {
  const choice = selectedReadingChoice(item, attempt.submittedResponse);
  const readingDiagnostic = choice?.diagnostic;
  const writingDiagnostic = diagnoseSentenceOrder(item, attempt.submittedResponse);
  return `<article class="admin-attempt ${attempt.correct ? 'is-correct' : 'is-wrong'}">
    <div><strong>#${index + 1} · ${esc(attempt.itemId)}</strong><span>${esc(typeLabel(attempt.questionType))}</span></div>
    <p>Trả lời: <code>${esc(displayValue(attempt.submittedAnswer ?? attempt.submittedResponse))}</code></p>
    ${readingDiagnostic ? `<p><strong>Reading:</strong> ${esc(readingDiagnosticLabel(readingDiagnostic))}</p>` : ''}
    ${writingDiagnostic && writingDiagnostic.code !== 'correct' ? `<p><strong>Writing:</strong> ${esc(sentenceOrderDiagnosticLabel(writingDiagnostic.code))}</p>` : ''}
    <small>${attempt.correct ? '✓ Đúng' : '✗ Sai'} · ${formatDuration(attempt.responseDurationMs)} · ${formatDate(attempt.submittedAt)}</small>
  </article>`;
}

function readingDiagnosticLabel(diagnostic) {
  if (diagnostic.verdictCorrect && diagnostic.reasonCorrect) return 'đúng kết luận + đúng lý do';
  if (diagnostic.verdictCorrect) return 'đúng kết luận + sai lý do';
  if (diagnostic.reasonCorrect) return 'sai kết luận + đúng dữ kiện';
  return 'sai kết luận + sai lý do';
}
