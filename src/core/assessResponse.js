import {
  classificationResponseDisplay,
  questionTypeForItem,
  sequenceNumberResponseDisplay
} from './questionTypes.js';

export function assessSubmittedAnswerDisplay(item, response, skipped = false) {
  if (skipped) return '';
  const type = questionTypeForItem(item);
  if (type === 'typing') return String(response ?? '').trim();
  if (type === 'mcq') {
    const choice = item?.choices?.find(candidate => String(candidate.id) === String(response ?? ''));
    return String(choice?.text ?? response ?? '');
  }
  if (type === 'true_false') {
    if (response === true || response === 'true') return 'TRUE';
    if (response === false || response === 'false') return 'FALSE';
    return '';
  }
  if (type === 'sentence_order') {
    return Array.isArray(response) ? response.map(String).join(' ') : '';
  }
  if (type === 'sequence_number') return sequenceNumberResponseDisplay(item, response);
  if (type === 'classification') return classificationResponseDisplay(item, response);
  return String(response ?? '');
}

export function cloneAssessResponse(response) {
  if (response === undefined) return null;
  if (response === null || typeof response !== 'object') return response;
  return JSON.parse(JSON.stringify(response));
}
