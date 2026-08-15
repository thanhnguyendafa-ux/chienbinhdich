import { esc, renderStudentTheory, renderTeacherAnswer, renderWritingLines } from '../printMarkup.js';

export function renderPrintTyping(question) {
  return `<article class="lesson-print-question lesson-print-typing" data-print-question="${question.number}">
    ${renderStudentTheory(question.studentTheory)}
    <p class="lesson-print-prompt"><strong>${question.number}.</strong> ${esc(question.prompt)}</p>
    ${renderWritingLines(question.lines)}
    ${renderTeacherAnswer(question.teacher)}
  </article>`;
}
