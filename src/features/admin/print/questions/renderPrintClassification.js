import { esc, renderTeacherAnswer } from '../printMarkup.js';

export function renderPrintClassification(question) {
  return `<article class="lesson-print-question lesson-print-classification" data-print-question="${question.number}">
    <p class="lesson-print-prompt"><strong>${question.number}.</strong> ${esc(question.prompt)}</p>
    <p class="lesson-print-token-bank">${question.tokens.map(esc).join(' · ')}</p>
    <div class="lesson-print-classification-groups">
      ${question.groups.map(group => `<div><strong>${esc(group.label)}:</strong><span></span>${group.helper ? `<small>${esc(group.helper)}</small>` : ''}</div>`).join('')}
    </div>
    ${renderTeacherAnswer(question.teacher)}
  </article>`;
}
