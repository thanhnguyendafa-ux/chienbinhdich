import { esc, renderStudentTheory, renderTeacherAnswer } from '../printMarkup.js';

export function renderPrintSequenceNumber(question) {
  const teacherPositions = new Map((question.teacher?.sequencePositions ?? []).map(entry => [String(entry.id), Number(entry.position)]));
  const rows = (question.sequenceLines ?? []).map(line => {
    const teacherPosition = teacherPositions.get(String(line.id));
    const studentPosition = Number.isInteger(Number(line.lockedPosition)) ? Number(line.lockedPosition) : null;
    const displayed = Number.isInteger(teacherPosition) ? teacherPosition : studentPosition;
    const positionMarkup = Number.isInteger(displayed) ? String(displayed) : '____';
    return `<div class="lesson-print-sequence-row"><strong class="lesson-print-sequence-position">${esc(positionMarkup)}</strong><span>${esc(line.text)}</span></div>`;
  }).join('');

  return `<article class="lesson-print-question lesson-print-sequence" data-print-question="${question.number}">
    ${renderStudentTheory(question.studentTheory)}
    <p class="lesson-print-prompt"><strong>${question.number}.</strong> ${esc(question.prompt)}</p>
    <div class="lesson-print-sequence-list">${rows}</div>
    ${renderTeacherAnswer(question.teacher)}
  </article>`;
}
