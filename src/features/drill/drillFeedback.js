import { acceptedSentenceOrderDisplays, questionTypeForItem } from '../../core/questionTypes.js';
import { classificationFeedbackHint } from '../../core/classificationDiagnostics.js';
import { mcqChoiceFeedback } from '../../core/mcqChoiceFeedback.js';
import { readingFeedbackHint } from '../../core/readingDiagnostics.js';
import { sentenceOrderFeedbackHint } from '../../core/sentenceOrderDiagnostics.js';
import { animateMasteryProgress, formatMasteryPercent } from '../../ui/masteryProgress.js';
import { getQuestionContext } from './questionContext.js';
import { renderAnswerAnalysis } from './answerAnalysisRenderer.js';
import { renderTypingErrorMapFeedback } from './typingErrorMapRenderer.js';

export function showSuccess({ root, type, item = null, entered, answer, teachingFeedback = null, mastery, masteryBefore, masteryDeltaPercent, onContinue }) {
  const card = root.querySelector('.prompt-card');
  const interaction = card?.querySelector('.question-interaction');
  if (!card || !interaction) return onContinue();

  animateMasteryProgress(root, { from: masteryBefore, to: mastery, delta: masteryDeltaPercent });
  card.classList.remove('has-error', 'is-reveal');
  const explainedIncorrect = type === 'explained_incorrect';
  const completionSuccess = type === 'completion_success';
  const completionRetry = type === 'completion_retry';
  const failed = explainedIncorrect || completionRetry;
  card.classList.add(failed ? 'has-error' : 'has-success');
  const correction = type === 'correction';
  const actualGain = Number(masteryDeltaPercent ?? 0);
  const masteryMessage = completionRetry
    ? `Chưa hoàn thành · Mastery giữ ở ${formatMasteryPercent(mastery)}%`
    : completionSuccess
      ? actualGain > 0
        ? `Hoàn thành · Mastery +${formatMasteryPercent(actualGain)}% → ${formatMasteryPercent(mastery)}%`
        : `Đã hoàn thành · Mastery giữ ở ${formatMasteryPercent(mastery)}%`
      : explainedIncorrect
        ? `Đã ghi nhận lượt trả lời · Mastery ${actualGain < 0 ? `−${formatMasteryPercent(Math.abs(actualGain))}%` : 'không đổi'}`
        : correction
          ? `Correction: Mastery không đổi · ${formatMasteryPercent(mastery)}%`
          : actualGain > 0
            ? `Mastery +${formatMasteryPercent(actualGain)}% → ${formatMasteryPercent(mastery)}%`
            : `Mastery giữ ở ${formatMasteryPercent(mastery)}%`;
  const mark = completionRetry ? 'CHƯA HOÀN THÀNH' : completionSuccess ? 'HOÀN THÀNH' : explainedIncorrect ? 'CHƯA ĐÚNG' : 'ĐÚNG';
  const heading = completionRetry
    ? 'Hãy hoàn thành yêu cầu rồi thử lại'
    : completionSuccess
      ? 'Đã ghi nhận completion credit'
      : explainedIncorrect
        ? 'Đọc đáp án và giải thích'
        : correction
          ? 'Đã sửa chính xác'
          : 'Retrieval chính xác';

  if (teachingFeedback) {
    interaction.innerHTML = `
      <div class="${failed ? 'feedback reveal-feedback' : 'success-panel teaching-success-heading'}" role="status">
        <span class="success-mark">${mark}</span>
        <strong>${heading}</strong>
        <small>${masteryMessage}</small>
      </div>
      ${renderTeachingFeedback({ item, entered, answer, teachingFeedback, includeContinue: true })}`;
    root.querySelector('#teaching-continue-btn')?.addEventListener('click', event => {
      event.currentTarget.disabled = true;
      event.currentTarget.textContent = completionRetry ? 'Đang mở lại câu...' : 'Đang sang câu tiếp...';
      onContinue();
    });
    root.querySelector('#teaching-continue-btn')?.focus({ preventScroll: true });
    return;
  }

  interaction.innerHTML = `
    <div class="${failed ? 'feedback error-feedback' : 'success-panel'}" role="status">
      <span class="success-mark">${mark}</span>
      <strong>${heading}</strong>
      ${completionSuccess || completionRetry ? '' : `<span class="answer-reveal">${esc(answer)}</span>`}
      <small>${masteryMessage}</small>
    </div>`;
  window.setTimeout(onContinue, failed ? 1200 : 430);
}

export function renderFeedback(feedback, item) {
  if (!feedback) return '';
  const delta = Number(feedback.masteryDeltaPercent ?? 0);
  const hitFloor = Number(feedback.masteryDeltaUnits ?? 0) < 0 && delta === 0 && Number(feedback.mastery ?? 0) === 0;
  const masteryMessage = delta < 0
    ? `Mastery −${formatMasteryPercent(Math.abs(delta))}%`
    : hitFloor
      ? 'Mastery đang ở sàn 0%'
      : 'Mastery không đổi';
  const typingErrorFeedback = renderTypingErrorMapFeedback({ feedback, item, masteryMessage, esc });
  if (typingErrorFeedback) return typingErrorFeedback;
  const choiceHint = mcqChoiceFeedback(item, feedback.entered);
  const readingHint = readingFeedbackHint(item, feedback.entered);
  const writingHint = sentenceOrderFeedbackHint(item, feedback.entered);
  const classificationHint = classificationFeedbackHint(item, feedback.entered);

  if (feedback.type === 'incorrect_reveal') {
    return `
      <div class="feedback reveal-feedback" role="alert">
        <div><span class="feedback-kicker">Sai lần ${feedback.attemptNumber} · ${masteryMessage}</span><strong>Đã mở đáp án để con học lại</strong></div>
        ${item?.teachingFeedback
          ? renderTeachingFeedback({ item, entered: feedback.entered, answer: feedback.revealAnswer, teachingFeedback: item.teachingFeedback })
          : `<code>${esc(feedback.revealAnswer)}</code>`}
        <p>Tự làm lại đúng để hoàn thành correction. Câu này vẫn sẽ quay lại trong chuỗi.</p>
      </div>`;
  }

  return `
    <div class="feedback error-feedback" role="alert">
      <div><span class="feedback-kicker">Sai · ${masteryMessage}</span><strong>Thử lại</strong></div>
      ${item?.teachingFeedback ? renderQuestionContext(item) : ''}
      <p>${item?.teachingFeedback ? learnerResponseLabel(item) : 'Câu trả lời vừa chọn/làm'}: <q>${esc(feedback.entered || '(trống)')}</q></p>
      ${choiceHint ? `<p class="mcq-choice-feedback">${esc(choiceHint)}</p>` : ''}
      ${readingHint ? `<p class="reading-diagnostic-hint"><strong>Gợi ý đọc:</strong> ${esc(readingHint)}</p>` : ''}
      ${writingHint ? `<p class="writing-diagnostic-hint"><strong>Gợi ý viết:</strong> ${esc(writingHint)}</p>` : ''}
      ${classificationHint ? `<p class="classification-diagnostic-hint"><strong>Gợi ý phân loại:</strong> ${esc(classificationHint)}</p>` : ''}
      <p>Đáp án đúng chưa được hiện. Hãy đọc lại câu hỏi và thử lại bằng trí nhớ của con.</p>
    </div>`;
}

function renderTeachingFeedback({ item = null, entered, answer, teachingFeedback, includeContinue = false }) {
  const type = questionTypeForItem(item);
  const completion = item?.masteryMode === 'completion';
  const sentenceOrder = type === 'sentence_order';
  const classification = type === 'classification';
  const acceptedDisplays = sentenceOrder ? acceptedSentenceOrderDisplays(item) : [];
  const alternatives = completion ? [] : acceptedDisplays.filter(candidate => !sameText(candidate, answer));
  const conceptLine = completion || sentenceOrder || classification || sameText(answer, teachingFeedback.correctLabel)
    ? ''
    : `<div class="teaching-row"><span>Loại đúng</span><strong>${esc(teachingFeedback.correctLabel)}</strong></div>`;
  const workedExample = teachingFeedback.workedExample;
  const workedLine = workedExample
    ? `<div class="teaching-copy teaching-worked"><span>${esc(workedExample.label)}</span><p>${esc(workedExample.text)}</p></div>`
    : '';
  const alternativesLine = alternatives.length
    ? `<div class="teaching-copy teaching-alternatives"><span>Cách đúng khác</span><p>${alternatives.map(esc).join(' · ')}</p></div>`
    : '';
  const answerLabel = completion ? 'Mastery' : sentenceOrder ? 'Câu chuẩn' : classification ? 'Phân loại đúng' : 'Đáp án đúng là';
  const answerValue = completion ? teachingFeedback.correctLabel : answer;
  const continueLabel = item?.acceptAfterSubmit ? 'Chấp nhận' : 'Tiếp tục';
  return `
    <section class="teaching-feedback" aria-label="Giải thích đáp án">
      ${item ? renderQuestionContext(item) : ''}
      <div class="teaching-row"><span>${esc(learnerResponseLabel(item))}</span><strong>${esc(entered || '(trống)')}</strong></div>
      <div class="teaching-row"><span>${answerLabel}</span><strong>${esc(answerValue)}</strong></div>
      ${alternativesLine}
      ${conceptLine}
      <div class="teaching-copy"><span>Vì</span><p>${esc(teachingFeedback.reason)}</p></div>
      <div class="teaching-copy"><span>Lý thuyết</span><p>${esc(teachingFeedback.theory)}</p></div>
      ${workedLine}
      <div class="teaching-copy teaching-example"><span>Ví dụ</span><p>${esc(teachingFeedback.example)}</p></div>
      ${renderAnswerAnalysis(teachingFeedback, esc)}
      ${includeContinue ? `<button class="primary-btn teaching-continue-btn" id="teaching-continue-btn" type="button">${continueLabel}</button>` : ''}
    </section>`;
}

function renderQuestionContext(item) {
  const questionContext = getQuestionContext(item);
  return `
    <section class="question-context" aria-label="${esc(questionContext.heading)}">
      <div class="question-context-heading">${esc(questionContext.heading)}</div>
      ${questionContext.rows.map(contextRow => `
        <div class="question-context-row">
          <span>${esc(contextRow.label)}</span>
          <p>${esc(contextRow.value)}</p>
        </div>`).join('')}
    </section>`;
}

function learnerResponseLabel(item) {
  if (item?.masteryMode === 'completion') return 'Con hoàn thành';
  const type = questionTypeForItem(item);
  if (type === 'typing') return 'Con gõ';
  if (type === 'sentence_order') return 'Câu của con';
  if (type === 'classification') return 'Con phân loại';
  return 'Con chọn';
}

function sameText(left, right) {
  return String(left ?? '').trim().toLocaleLowerCase('vi') === String(right ?? '').trim().toLocaleLowerCase('vi');
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
