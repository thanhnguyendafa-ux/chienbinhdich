import { questionTypeForItem } from '../../core/questionTypes.js';
import { basicQuestionDefinitions } from './questionInteractions/basic.js';
import { classificationDefinition } from './questionInteractions/classification.js';
import { sequenceNumberDefinition } from './questionInteractions/sequenceNumber.js';
import { renderReadingPassage } from './questionInteractions/shared.js';

const registry = Object.freeze({
  ...basicQuestionDefinitions,
  sequence_number: sequenceNumberDefinition,
  classification: classificationDefinition
});

export function renderQuestionInteraction(item, options = {}) {
  const type = questionTypeForItem(item);
  const definition = registry[type];
  if (!definition) throw new Error(`Unsupported question renderer: ${type}`);
  const interaction = definition.render(item, options);
  if (type === 'mcq') return interaction;
  const readingBlock = readingBlockForItem(item, options.passages ?? []);
  return `${readingBlock ? renderReadingPassage(readingBlock) : ''}${interaction}`;
}

export function bindQuestionInteraction({ root, item, onSubmit, attemptStartedAt = Date.now() }) {
  const type = questionTypeForItem(item);
  const definition = registry[type];
  if (!definition) throw new Error(`Unsupported question binder: ${type}`);
  return definition.bind({ root, item, onSubmit, attemptStartedAt });
}

function readingBlockForItem(item, passages = []) {
  const passage = item?.passageId ? passages.find(candidate => candidate.id === item.passageId) : null;
  return passage ?? item?.stimulus ?? null;
}
