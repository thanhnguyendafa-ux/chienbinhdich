import { esc, renderStudentTheory, renderTeacherAnswer, renderWritingLines } from '../printMarkup.js';

export function renderPrintSentenceOrder(question) {
  return `<article class="lesson-print-question lesson-print-order" data-print-question="${question.number}">
    ${renderStudentTheory(question.studentTheory)}
    <p class="lesson-print-prompt"><strong>${question.number}.</strong> ${esc(question.prompt)}</p>
    <p class="lesson-print-token-bank">${question.tokens.map(esc).join(' / ')}</p>
    ${renderWritingLines(question.lines)}
    ${renderTeacherAnswer(question.teacher)}
  </article>`;
}
