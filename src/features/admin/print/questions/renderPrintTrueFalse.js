import { esc, renderTeacherAnswer } from '../printMarkup.js';

export function renderPrintTrueFalse(question) {
  return `<article class="lesson-print-question lesson-print-tf" data-print-question="${question.number}">
    <div class="lesson-print-inline-response"><p class="lesson-print-prompt"><strong>${question.number}.</strong> ${esc(question.prompt)}</p><span class="lesson-print-blank">________</span></div>
    ${renderTeacherAnswer(question.teacher)}
  </article>`;
}
