export function requiresTheoryGate(set) {
  return set?.preLessonTheory?.required === true;
}

export function ensureTheoryGateState(session, set) {
  if (!session || !requiresTheoryGate(set)) return session;
  if (session.theoryGate?.required === true) return session;
  return {
    ...session,
    theoryGate: {
      required: true,
      bottomReachedAt: null,
      confirmedAt: null
    }
  };
}

export function theoryGateConfirmed(session, set) {
  if (!requiresTheoryGate(set)) return true;
  return Boolean(session?.theoryGate?.confirmedAt);
}

export function markTheoryBottomReached(session, set, now = Date.now()) {
  const next = ensureTheoryGateState(session, set);
  if (!requiresTheoryGate(set) || next.theoryGate.bottomReachedAt) return next;
  return {
    ...next,
    theoryGate: {
      ...next.theoryGate,
      bottomReachedAt: now
    }
  };
}

export function confirmTheoryGate(session, set, now = Date.now()) {
  const next = ensureTheoryGateState(session, set);
  if (!requiresTheoryGate(set)) return next;
  if (!next.theoryGate.bottomReachedAt) {
    throw new Error('Phải kéo đến cuối phần lý thuyết trước khi xác nhận.');
  }
  if (next.theoryGate.confirmedAt) return next;
  return {
    ...next,
    theoryGate: {
      ...next.theoryGate,
      confirmedAt: now
    }
  };
}
