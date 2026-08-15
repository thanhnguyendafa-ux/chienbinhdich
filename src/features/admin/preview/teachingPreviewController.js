function clampCursor(value, total) {
  if (total <= 0) return 0;
  const numeric = Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0;
  return Math.max(0, Math.min(total - 1, numeric));
}

function shortSectionTitle(title, fallback) {
  const value = String(title ?? '').trim();
  if (!value) return fallback;
  const primary = value.split('/')[0].trim().replace(/^[A-Z]\.?\s*/i, '').trim();
  return primary || fallback;
}

export function deriveTeachingSections(lesson) {
  const items = Array.isArray(lesson?.items) ? lesson.items : [];
  const indexById = new Map(items.map((item, index) => [String(item.id), index]));
  const groups = Array.isArray(lesson?.printGroups) ? lesson.printGroups : [];

  return Object.freeze(groups.map((group, groupIndex) => {
    const indices = (group?.itemIds ?? [])
      .map(itemId => indexById.get(String(itemId)))
      .filter(index => Number.isInteger(index));
    if (!indices.length) return null;
    const startIndex = Math.min(...indices);
    const endIndex = Math.max(...indices);
    return Object.freeze({
      id: String(group.id ?? `section-${groupIndex + 1}`),
      title: String(group.title ?? `Phần ${groupIndex + 1}`),
      label: shortSectionTitle(group.title, `Phần ${groupIndex + 1}`),
      startIndex,
      endIndex,
      itemIds: Object.freeze(indices.map(index => items[index].id))
    });
  }).filter(Boolean));
}

export function createTeachingPreviewController({ lesson, onChange } = {}) {
  const total = Array.isArray(lesson?.items) ? lesson.items.length : 0;
  if (!total) throw new Error('Teaching Mode requires a lesson with at least one item.');
  const sections = deriveTeachingSections(lesson);
  let cursor = 0;

  const snapshot = () => {
    const currentSection = sections.find(section => cursor >= section.startIndex && cursor <= section.endIndex) ?? null;
    const nextSection = currentSection
      ? sections[sections.indexOf(currentSection) + 1] ?? null
      : sections.find(section => section.startIndex > cursor) ?? null;
    return Object.freeze({
      cursor,
      questionNumber: cursor + 1,
      total,
      itemId: lesson.items[cursor]?.id ?? null,
      sections,
      currentSection,
      nextSection,
      canPrevious: cursor > 0,
      canNext: cursor < total - 1
    });
  };

  const publish = nextCursor => {
    cursor = clampCursor(nextCursor, total);
    const state = snapshot();
    onChange?.(state);
    return state;
  };

  return Object.freeze({
    getState: snapshot,
    previous: () => publish(cursor - 1),
    next: () => publish(cursor + 1),
    jumpToQuestion: questionNumber => publish(Number(questionNumber) - 1),
    jumpToSection(sectionId) {
      const section = sections.find(candidate => candidate.id === String(sectionId));
      return section ? publish(section.startIndex) : snapshot();
    },
    skipSection() {
      const { nextSection } = snapshot();
      return nextSection ? publish(nextSection.startIndex) : snapshot();
    },
    resetNavigation: () => publish(0)
  });
}

export function alignTeachingSession(session, lesson, cursor) {
  if (!session) throw new Error('Teaching Mode requires a preview session.');
  const items = Array.isArray(lesson?.items) ? lesson.items : [];
  if (!items.length) throw new Error('Teaching Mode requires lesson items.');
  const safeCursor = clampCursor(cursor, items.length);
  const item = items[safeCursor];
  return {
    ...session,
    status: 'active',
    currentItemId: item.id,
    currentPromptKind: 'main',
    promptIndex: safeCursor,
    mainCursor: safeCursor + 1,
    retryQueue: [],
    qualifiedAt: null,
    completedAt: null,
    submittedAt: null,
    extendedPracticeStartedAt: null,
    extendedPracticeEndedAt: null,
    persistenceMode: 'preview'
  };
}

export function resetTeachingSession(session, lesson, { cursor = 0, all = false } = {}) {
  const items = Array.isArray(lesson?.items) ? lesson.items : [];
  const safeCursor = clampCursor(cursor, items.length);
  const currentItemId = items[safeCursor]?.id ?? null;
  const attempts = all
    ? []
    : (session?.attempts ?? []).filter(attempt => attempt.itemId !== currentItemId);
  return alignTeachingSession({ ...session, attempts }, lesson, safeCursor);
}
