import {
  acceptedSentenceOrderDisplays,
  expectedResponseDisplay,
  questionPromptDisplay,
  questionTypeForItem
} from '../../../core/questionTypes.js';
import { displayValue, esc, typeLabel } from './adminUi.js';

export function renderLessonContent(set, { compact = false } = {}) {
  if (!set?.items) return '';
  const passageById = new Map((set.passages ?? []).map(passage => [passage.id, passage]));
  return `<section class="admin-question-list ${compact ? 'is-compact' : ''}">
    ${set.items.map((item, index) => renderQuestion(item, index, compact, passageById.get(item.passageId))).join('')}
  </section>`;
}

function renderQuestion(item, index, compact, passage) {
  const type = questionTypeForItem(item);
  const answer = expectedResponseDisplay(item);
  const choices = Array.isArray(item.choices)
    ? `<ul>${item.choices.map(choice => `<li>${esc(choice.text ?? choice.label ?? choice.id)}${choice.diagnostic && !compact ? ` <small>(${diagnosticLabel(choice.diagnostic)})</small>` : ''}</li>`).join('')}</ul>`
    : '';
  const orderDetails = type === 'sentence_order' ? renderSentenceOrderDetails(item, compact) : '';
  const classificationDetails = type === 'classification' ? renderClassificationDetails(item) : '';
  const feedback = item.teachingFeedback ?? {};
  return `
    <article class="admin-question-card ${compact ? 'is-compact' : ''}">
      <div class="admin-question-head"><strong>Câu ${index + 1}</strong><span>${esc(typeLabel(type))}</span></div>
      ${passage ? `<section class="admin-reading-passage"><strong>${esc(passage.title)}</strong><p>${esc(passage.text)}</p></section>` : ''}
      <p class="admin-question-prompt">${esc(questionPromptDisplay(item) || item.id)}</p>
      ${choices}
      ${orderDetails}
      ${classificationDetails}
      <div class="admin-answer-box"><span>Đáp án chuẩn</span><strong>${esc(displayValue(answer))}</strong></div>
      ${feedback.reason ? `<p><strong>Giải thích:</strong> ${esc(feedback.reason)}</p>` : ''}
      ${feedback.theory && !compact ? `<p><strong>Lý thuyết:</strong> ${esc(feedback.theory)}</p>` : ''}
      ${feedback.example && !compact ? `<p><strong>Ví dụ:</strong> ${esc(feedback.example)}</p>` : ''}
    </article>`;
}

function renderSentenceOrderDetails(item, compact) {
  const tokens = item.tokens ?? item.correctOrder ?? [];
  const accepted = acceptedSentenceOrderDisplays(item);
  const distractors = item.orderDiagnostics?.distractors ?? [];
  return `
    <div class="admin-order-details">
      <p><strong>Token pool:</strong> ${tokens.map(token => `<code>${esc(token)}</code>`).join(' · ')}</p>
      ${accepted.length > 1 ? `<p><strong>Các cách đúng:</strong> ${accepted.map(value => `<code>${esc(value)}</code>`).join(' · ')}</p>` : ''}
      ${distractors.length && !compact
        ? `<ul>${distractors.map(value => `<li><strong>Nhiễu:</strong> <code>${esc(value.token)}</code> · ${esc(value.code)} — ${esc(value.hint)}</li>`).join('')}</ul>`
        : ''}
    </div>`;
}

function renderClassificationDetails(item) {
  return `
    <div class="admin-order-details admin-classification-details">
      <p><strong>Token pool:</strong> ${(item.tokens ?? []).map(token => `<code>${esc(token.text)}</code>`).join(' · ')}</p>
      ${(item.groups ?? []).map(group => {
        const tokens = (item.tokens ?? []).filter(token => token.correctGroupId === group.id).map(token => token.text);
        return `<p><strong>${esc(group.label)}:</strong> ${tokens.map(token => `<code>${esc(token)}</code>`).join(' · ')}${group.helper ? ` <small>— ${esc(group.helper)}</small>` : ''}</p>`;
      }).join('')}
    </div>`;
}

function diagnosticLabel(diagnostic) {
  if (diagnostic.verdictCorrect && diagnostic.reasonCorrect) return 'đúng verdict + đúng reason';
  if (diagnostic.verdictCorrect) return 'đúng verdict + sai reason';
  if (diagnostic.reasonCorrect) return 'sai verdict + đúng evidence';
  return 'sai verdict + sai reason';
}
