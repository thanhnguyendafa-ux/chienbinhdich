import { deriveAttemptAnalytics } from '../../../core/attemptAnalytics.js';
import { getSessionMetrics } from '../../../core/sessionMachine.js';
import { deriveReadingDiagnostics, selectedReadingChoice } from '../../../core/readingDiagnostics.js';
import {
  deriveSentenceOrderDiagnostics,
  diagnoseSentenceOrder,
  sentenceOrderDiagnosticLabel
} from '../../../core/sentenceOrderDiagnostics.js';
import {
  classificationAttemptSummary,
  deriveClassificationDiagnostics
} from '../../../core/classificationDiagnostics.js';
import { adminTopbar, displayValue, esc, formatDate, formatDuration, statusLabel, typeLabel } from '../shared/adminUi.js';

export function renderAdminSessionDetail({ root, session, attempts, set, currentPassThreshold = null, onBack }) {
  const hydratedSession = { ...session, attempts };
  const metrics = getSessionMetrics(hydratedSession, set);
  const analytics = deriveAttemptAnalytics(hydratedSession, set);
  const mastery = metrics.mastery;
  const source = session.entryMode === 'fixed-link' ? session.accessSlug ?? 'Fixed link' : session.assignmentId ?? 'Legacy';
  const historicalTarget = Number(set?.passThreshold ?? 80);
  const currentTarget = Number(currentPassThreshold ?? historicalTarget);
  const reading = deriveReadingDiagnostics(hydratedSession, set);
  const writing = deriveSentenceOrderDiagnostics(hydratedSession, set);
  const classification = deriveClassificationDiagnostics(hydratedSession, set);
  const itemById = new Map((set?.items ?? []).map(item => [item.id, item]));
  const reason = qualificationLabel(metrics.qualificationReason);

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
          <div><span>Target lúc bắt đầu</span><strong>${historicalTarget}%</strong></div><div><span>Target hiện tại</span><strong>${currentTarget}%</strong></div>
          <div><span>PASS bằng</span><strong>${esc(reason)}</strong></div><div><span>Mastery lúc đủ điều kiện</span><strong>${metrics.masteryAtQualification === null ? '—' : `${metrics.masteryAtQualification}%`}</strong></div>
          <div><span>Timer cố gắng</span><strong>${metrics.effortPassEnabled ? `${metrics.effortTargetMinutes} phút` : 'TẮT'}</strong></div><div><span>Effort active</span><strong>${formatDuration(metrics.effortActiveMs)}</strong></div>
          <div><span>Rapid responses</span><strong>${analytics.rapidCount}</strong></div><div><span>Rapid streak lớn nhất</span><strong>${analytics.rapidMaxStreak}</strong></div>
        </div>
        ${metrics.qualificationReason === 'effort' ? `<p class="admin-result-effort-note"><strong>PASS · EFFORT</strong> — học sinh được quyền nộp vì đủ thời gian học chủ động; Mastery thực tế vẫn giữ ở ${mastery}% và không bị nâng giả lên ${historicalTarget}%.</p>` : ''}
        ${reading.total ? `<section class="admin-result-grid" aria-label="Reading diagnostics">
          <div><span>Đúng kết luận + lý do</span><strong>${reading.correctVerdictCorrectReason}</strong></div>
          <div><span>Đúng kết luận + sai lý do</span><strong>${reading.rightVerdictWrongReason}</strong></div>
          <div><span>Sai kết luận + đúng dữ kiện</span><strong>${reading.wrongVerdictRightEvidence}</strong></div>
          <div><span>Sai kết luận + sai lý do</span><strong>${reading.wrongVerdictWrongReason}</strong></div>
        </section>` : ''}
        ${writing.total ? renderWritingSummary(writing) : ''}
        ${classification.total ? renderClassificationSummary(classification) : ''}
        <section class="admin-question-list">
          ${analytics.attempts.map((attempt, index) => renderAttempt(attempt, index, itemById.get(attempt.itemId))).join('') || '<p class="admin-empty">Session chưa có attempt.</p>'}
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

function renderClassificationSummary(classification) {
  const errorCells = classification.errors.map(error => `<div><span>${esc(error.label)}</span><strong>${error.count}</strong></div>`).join('');
  return `<section class="admin-result-grid" aria-label="Classification diagnostics">
    <div><span>Phân loại · lần đầu</span><strong>${classification.correct}/${classification.total} đúng</strong></div>
    <div><span>Token xếp nhầm</span><strong>${classification.tokenMistakes}</strong></div>
    ${errorCells}
  </section>`;
}

function renderAttempt(attempt, index, item) {
  const choice = selectedReadingChoice(item, attempt.submittedResponse);
  const readingDiagnostic = choice?.diagnostic;
  const writingDiagnostic = diagnoseSentenceOrder(item, attempt.submittedResponse);
  const classificationSummary = classificationAttemptSummary(item, attempt.submittedResponse);
  const rapid = (attempt.flags ?? []).includes('rapid');
  return `<article class="admin-attempt ${attempt.correct ? 'is-correct' : 'is-wrong'} ${rapid ? 'is-rapid' : ''}">
    <div><strong>#${index + 1} · ${esc(attempt.itemId)}</strong><span>${esc(typeLabel(attempt.questionType))}${rapid ? ' · ⚠ RAPID' : ''}</span></div>
    <p>Trả lời: <code>${esc(displayValue(attempt.submittedAnswer ?? attempt.submittedResponse))}</code></p>
    ${readingDiagnostic ? `<p><strong>Reading:</strong> ${esc(readingDiagnosticLabel(readingDiagnostic))}</p>` : ''}
    ${writingDiagnostic && writingDiagnostic.code !== 'correct' ? `<p><strong>Writing:</strong> ${esc(sentenceOrderDiagnosticLabel(writingDiagnostic.code))}</p>` : ''}
    ${classificationSummary ? `<p><strong>Phân loại:</strong> ${esc(classificationSummary)}</p>` : ''}
    <small>${attempt.correct ? '✓ Đúng' : '✗ Sai'} · ${formatDuration(attempt.responseDurationMs)} · ${formatDate(attempt.submittedAt)}</small>
  </article>`;
}

function qualificationLabel(reason) {
  if (reason === 'effort') return 'EFFORT · Cố gắng';
  if (reason === 'mastery') return 'MASTERY';
  return '—';
}

function readingDiagnosticLabel(diagnostic) {
  if (diagnostic.verdictCorrect && diagnostic.reasonCorrect) return 'đúng kết luận + đúng lý do';
  if (diagnostic.verdictCorrect) return 'đúng kết luận + sai lý do';
  if (diagnostic.reasonCorrect) return 'sai kết luận + đúng dữ kiện';
  return 'sai kết luận + sai lý do';
}
