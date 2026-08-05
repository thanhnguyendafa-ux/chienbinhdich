import { getItemMasteryUnits, hasReachedMastery } from './masteryEngine.js';

export const RETRY_GAP = 2;

export function queueRetry(retryQueue = [], itemId, promptIndex) {
  if (retryQueue.some(entry => entry.itemId === itemId)) return retryQueue.map(entry => ({ ...entry }));
  return [
    ...retryQueue.map(entry => ({ ...entry })),
    { itemId, eligiblePromptIndex: promptIndex + RETRY_GAP + 1 }
  ];
}

export function advanceLearningPrompt(session, set) {
  const nextPromptIndex = session.promptIndex + 1;
  const queue = (session.retryQueue ?? []).map(entry => ({ ...entry }));
  const eligibleIndex = findEligibleRetryIndex(queue, nextPromptIndex);

  if (eligibleIndex >= 0) {
    const [retry] = queue.splice(eligibleIndex, 1);
    return withPrompt(session, {
      itemId: retry.itemId,
      promptKind: 'retry',
      promptIndex: nextPromptIndex,
      retryQueue: queue
    });
  }

  if (session.mainCursor < set.items.length) {
    const item = set.items[session.mainCursor];
    return withPrompt(session, {
      itemId: item.id,
      promptKind: 'main',
      promptIndex: nextPromptIndex,
      mainCursor: session.mainCursor + 1,
      retryQueue: queue
    });
  }

  if (queue.length) {
    const spacerId = pickSpacerItem(session, set, queue);
    if (spacerId) {
      return withPrompt(session, {
        itemId: spacerId,
        promptKind: 'spacing',
        promptIndex: nextPromptIndex,
        retryQueue: queue
      });
    }

    const [retry] = queue.splice(0, 1);
    return withPrompt(session, {
      itemId: retry.itemId,
      promptKind: 'retry',
      promptIndex: nextPromptIndex,
      retryQueue: queue
    });
  }

  if (session.status === 'extended') {
    return beginExtendedPracticePrompt(session, set, nextPromptIndex);
  }

  if (hasReachedMastery(session.attempts, set.items.length, set.passThreshold)) {
    return {
      ...session,
      retryQueue: queue,
      status: 'passed',
      qualifiedAt: session.qualifiedAt ?? session.attempts.at(-1)?.submittedAt ?? null
    };
  }

  const reviewId = pickContinuationReviewItem(session, set);
  return withPrompt(session, {
    itemId: reviewId,
    promptKind: 'review',
    promptIndex: nextPromptIndex,
    retryQueue: queue
  });
}

export function beginExtendedPracticePrompt(session, set, nextPromptIndex = session.promptIndex + 1) {
  const reviewId = pickContinuationReviewItem(session, set);
  return withPrompt(session, {
    itemId: reviewId,
    promptKind: 'review',
    promptIndex: nextPromptIndex,
    retryQueue: (session.retryQueue ?? []).map(entry => ({ ...entry }))
  });
}

export function getPromptHistory(session) {
  const byPrompt = new Map();
  for (const attempt of session.attempts ?? []) {
    if (!byPrompt.has(attempt.promptIndex)) byPrompt.set(attempt.promptIndex, attempt.itemId);
  }
  return [...byPrompt.entries()].sort((a, b) => a[0] - b[0]).map(([, itemId]) => itemId);
}

function findEligibleRetryIndex(queue, nextPromptIndex) {
  let candidate = -1;
  for (let index = 0; index < queue.length; index += 1) {
    if (queue[index].eligiblePromptIndex > nextPromptIndex) continue;
    if (candidate < 0 || queue[index].eligiblePromptIndex < queue[candidate].eligiblePromptIndex) candidate = index;
  }
  return candidate;
}

function pickSpacerItem(session, set, queue) {
  const blocked = new Set(queue.map(entry => entry.itemId));
  blocked.add(session.currentItemId);
  const recent = new Set(getPromptHistory(session).slice(-2));
  const ranked = rankReviewItems(session, set);

  return ranked.find(itemId => !blocked.has(itemId) && !recent.has(itemId))
    ?? ranked.find(itemId => !blocked.has(itemId))
    ?? null;
}

function pickContinuationReviewItem(session, set) {
  const ranked = rankReviewItems(session, set);
  const recent = new Set(getPromptHistory(session).slice(-2));
  return ranked.find(itemId => !recent.has(itemId)) ?? ranked[0] ?? set.items[0]?.id ?? null;
}

function rankReviewItems(session, set) {
  const attempts = session.attempts ?? [];
  return set.items
    .map((item, index) => ({
      itemId: item.id,
      index,
      units: getItemMasteryUnits(attempts, item.id),
      wrongs: attempts.filter(attempt => attempt.itemId === item.id && attempt.masteryDeltaUnits === -1).length
    }))
    .sort((a, b) => a.units - b.units || b.wrongs - a.wrongs || a.index - b.index)
    .map(entry => entry.itemId);
}

function withPrompt(session, changes) {
  return {
    ...session,
    ...changes,
    currentItemId: changes.itemId,
    currentPromptKind: changes.promptKind
  };
}
