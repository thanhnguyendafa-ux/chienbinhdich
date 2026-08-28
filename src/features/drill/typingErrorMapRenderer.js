import { buildTypingErrorMap, typingErrorMapEnabled } from '../../core/typingErrorMap.js';

const WRONG_FEEDBACK_TYPES = new Set(['incorrect_retry', 'incorrect_reveal']);

export function renderTypingErrorMapFeedback({ feedback, item, masteryMessage, esc }) {
  if (!typingErrorMapEnabled(item) || !WRONG_FEEDBACK_TYPES.has(feedback?.type)) return '';
  const errorMap = buildTypingErrorMap(item, feedback.entered);
  const separatorNote = item?.typingSeparatorTolerance === true
    ? '<p class="typing-error-map-note">Khoảng trắng, dấu - và dấu ? được bỏ qua khi chấm; chỉ phần chữ thực sự sai mới hiện đỏ.</p>'
    : '';
  return `
    <section class="feedback typing-error-map" role="alert" aria-label="Con đã gõ ${esc(errorMap.entered)}. Đáp án đúng ${esc(errorMap.expected)}.">
      <div class="typing-error-map-heading">
        <span class="feedback-kicker">Sai lần ${feedback.attemptNumber} · ${esc(masteryMessage)}</span>
        <strong>Nhìn chỗ đỏ rồi sửa lại</strong>
      </div>
      <div class="typing-error-map-legend" aria-hidden="true">
        <span class="typing-error-legend-correct">● Xanh = đúng</span>
        <span class="typing-error-legend-wrong">● Đỏ = cần sửa</span>
        <span>□ = thiếu chữ</span>
      </div>
      <div class="typing-error-comparison" aria-hidden="true">
        ${renderRow('Con đã gõ', errorMap.enteredTokens, esc)}
        ${renderRow('Đáp án đúng', errorMap.expectedTokens, esc)}
      </div>
      ${separatorNote}
      <p class="typing-error-map-action">Gõ lại từ/cụm từ đúng để hoàn thành correction. Câu này vẫn quay lại trong chuỗi ôn.</p>
    </section>`;
}

function renderRow(label, tokens, esc) {
  return `
    <div class="typing-error-row">
      <span class="typing-error-row-label">${label}</span>
      <code class="typing-diff-text">${tokens.map(token => renderToken(token, esc)).join('')}</code>
    </div>`;
}

function renderToken(token, esc) {
  const status = token.status === 'correct' ? 'correct' : token.status === 'missing' ? 'missing' : 'incorrect';
  return `<span class="typing-diff-token typing-diff-${status}">${esc(token.text)}</span>`;
}
