import { esc, renderTeacherAnswer } from '../printMarkup.js';

export function renderPrintMcq(question) {
  return `<article class="lesson-print-question lesson-print-mcq" data-print-question="${question.number}">
    ${question.stimulus ? `<section class="lesson-print-passage lesson-print-stimulus"><h3>${esc(question.stimulus.title)}</h3><p>${esc(question.stimulus.text)}</p></section>` : ''}
    <p class="lesson-print-prompt"><strong>${question.number}.</strong> ${esc(question.prompt)}</p>
    <div class="lesson-print-choices is-${esc(question.layout)}">
      ${question.choices.map(choice => `<div class="lesson-print-choice"><strong>${esc(choice.label)}.</strong><span>${esc(choice.text)}</span></div>`).join('')}
    </div>
    ${renderTeacherAnswer(question.teacher)}
  </article>`;
}
