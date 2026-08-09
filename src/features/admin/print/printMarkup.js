export function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}

export function renderWritingLines(count = 1) {
  return `<div class="lesson-print-writing-lines" aria-hidden="true">${Array.from({ length: Math.max(1, Number(count) || 1) }, () => '<span></span>').join('')}</div>`;
}

export function renderTeacherAnswer(teacher) {
  if (!teacher) return '';
  const alternatives = Array.isArray(teacher.alternatives) && teacher.alternatives.length
    ? `<p><strong>Accepted:</strong> ${teacher.alternatives.map(esc).join(' · ')}</p>`
    : '';
  const grouped = Array.isArray(teacher.groups) && teacher.groups.length
    ? teacher.groups.map(group => `<p><strong>${esc(group.label)}:</strong> ${group.values.map(esc).join(' · ')}</p>`).join('')
    : '';
  const reason = teacher.reason ? `<p><strong>Giải thích:</strong> ${esc(teacher.reason)}</p>` : '';
  const theory = teacher.theory ? `<p><strong>Lý thuyết:</strong> ${esc(teacher.theory)}</p>` : '';
  const example = teacher.example ? `<p><strong>Ví dụ:</strong> ${esc(teacher.example)}</p>` : '';
  const worked = teacher.workedExample?.text
    ? `<p><strong>${esc(teacher.workedExample.label || 'Ví dụ')}: </strong>${esc(teacher.workedExample.text)}</p>`
    : '';
  return `<aside class="lesson-print-teacher-answer"><p class="lesson-print-answer-key"><strong>✓ ${esc(teacher.answer)}</strong></p>${alternatives}${grouped}${reason}${theory}${example}${worked}</aside>`;
}
