export function theoryAccessForItem(item) {
  const access = item?.theorySupport?.access;
  return access === 'anytime' || access === 'after_submit' ? access : null;
}

export function theoryUnlockedForExposure({ item, session }) {
  const access = theoryAccessForItem(item);
  if (!access) return false;
  if (access === 'anytime') return true;
  const promptIndex = Number(session?.promptIndex);
  return (session?.attempts ?? []).some(attempt => Number(attempt.promptIndex) === promptIndex);
}

export function theorySupportViewModel({ item, session }) {
  const access = theoryAccessForItem(item);
  if (!access || !item?.teachingFeedback?.theory) return null;
  const unlocked = theoryUnlockedForExposure({ item, session });
  return Object.freeze({
    access,
    unlocked,
    theory: String(item.teachingFeedback.theory),
    example: String(item.teachingFeedback.example ?? ''),
    workedExample: item.teachingFeedback.workedExample
      ? Object.freeze({
          label: String(item.teachingFeedback.workedExample.label ?? ''),
          text: String(item.teachingFeedback.workedExample.text ?? '')
        })
      : null
  });
}
