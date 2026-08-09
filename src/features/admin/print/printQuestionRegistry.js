import { renderPrintMcq } from './questions/renderPrintMcq.js';
import { renderPrintTrueFalse } from './questions/renderPrintTrueFalse.js';
import { renderPrintTyping } from './questions/renderPrintTyping.js';
import { renderPrintSentenceOrder } from './questions/renderPrintSentenceOrder.js';
import { renderPrintClassification } from './questions/renderPrintClassification.js';

const registry = Object.freeze({
  mcq: renderPrintMcq,
  true_false: renderPrintTrueFalse,
  typing: renderPrintTyping,
  sentence_order: renderPrintSentenceOrder,
  classification: renderPrintClassification
});

export function renderPrintQuestion(question) {
  const renderer = registry[question?.type];
  if (!renderer) throw new Error(`Unsupported print question type: ${question?.type ?? '(missing)'}`);
  return renderer(question);
}
