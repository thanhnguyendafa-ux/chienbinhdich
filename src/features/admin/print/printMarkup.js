export function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}

export function renderWritingLines(count = 1) {
  const numericCount = Number(count);
  const lineCount = Number.isFinite(numericCount) ? Math.max(1, Math.floor(numericCount)) : 1;
  return `<div class="lesson-print-writing-lines" aria-hidden="true">${Array.from({ length: lineCount }, () => '<span></span>').join('')}</div>`;
}

export function renderStudentTheory(studentTheory) {
  if (!studentTheory?.theory) return '';
  const example = studentTheory.example
    ? `<p><strong>Example / Ví dụ:</strong> ${esc(studentTheory.example)}</p>`
    : '';
  const worked = studentTheory.workedExample?.text
    ? `<p><strong>${esc(studentTheory.workedExample.label ?? 'Worked example / Ví dụ mẫu')}:</strong> ${esc(studentTheory.workedExample.text)}</p>`
    : '';
  return `<aside class="lesson-print-student-theory" data-print-student-theory><p class="lesson-print-student-theory-title"><strong>THEORY / LÝ THUYẾT</strong></p><p>${esc(studentTheory.theory)}</p>${example}${worked}</aside>`;
}

export function renderTeacherAnswer(teacher) {
  if (!teacher) return '';
  const alternatives = teacher.alternatives?.length
    ? `<p><strong>Accepted:</strong> ${teacher.alternatives.map(esc).join(' · ')}</p>`
    : '';
  const grouped = teacher.groups?.length
    ? teacher.groups.map(group => `<p><strong>${esc(group.label)}:</strong> ${group.values.map(esc).join(' · ')}</p>`).join('')
    : '';
  const answerKey = grouped ? '✓ Phân loại đúng' : `✓ ${esc(teacher.answer)}`;
  const reason = teacher.reason ? `<p><strong>Giải thích:</strong> ${esc(teacher.reason)}</p>` : '';
  const theory = teacher.theory ? `<p><strong>Lý thuyết:</strong> ${esc(teacher.theory)}</p>` : '';
  const example = teacher.example ? `<p><strong>Ví dụ:</strong> ${esc(teacher.example)}</p>` : '';
  const worked = teacher.workedExample?.text
    ? `<p><strong>${esc(teacher.workedExample.label ?? 'Ví dụ')}: </strong>${esc(teacher.workedExample.text)}</p>`
    : '';
  return `<aside class="lesson-print-teacher-answer"><p class="lesson-print-answer-key"><strong>${answerKey}</strong></p>${alternatives}${grouped}${reason}${theory}${example}${worked}</aside>`;
}
