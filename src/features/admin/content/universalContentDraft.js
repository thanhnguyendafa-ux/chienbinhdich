import { SUPPORTED_QUESTION_TYPES, questionTypeForItem } from '../../../core/questionTypes.js';
import { validateSet } from '../../../data/contentValidator.js';

const QUESTION_TYPES = Object.freeze([...SUPPORTED_QUESTION_TYPES]);

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function uniqueId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isUniversalContentEditableLesson(lesson) {
  const items = lesson?.items ?? [];
  return items.length > 0 && items.every(item => QUESTION_TYPES.includes(questionTypeForItem(item)));
}

export function createUniversalDraft(lesson) {
  const draft = { items: clone(lesson?.items ?? []) };
  if (lesson?.passages !== undefined) draft.passages = clone(lesson.passages);
  if (lesson?.printGroups !== undefined) draft.printGroups = clone(lesson.printGroups);
  return normalizeUniversalDraft(lesson, draft);
}

export function validateUniversalDraft(lesson, draft) {
  const content = normalizeUniversalDraft(lesson, draft);
  const candidate = { ...lesson, items: content.items };
  if ('passages' in content) candidate.passages = content.passages;
  else delete candidate.passages;
  if ('printGroups' in content) candidate.printGroups = content.printGroups;
  else delete candidate.printGroups;
  return Object.freeze({ content: freezeContent(content), errors: Object.freeze(validateSet(candidate)) });
}

export function normalizeUniversalDraft(lesson, draft) {
  const items = clone(draft?.items ?? []);
  const result = { items };

  if (draft && Object.prototype.hasOwnProperty.call(draft, 'passages')) {
    result.passages = clone(draft.passages ?? []);
  } else if (lesson?.passages !== undefined) {
    result.passages = clone(lesson.passages);
  }

  if (draft && Object.prototype.hasOwnProperty.call(draft, 'printGroups')) {
    result.printGroups = normalizePrintGroups(clone(draft.printGroups ?? []), items);
  } else if (lesson?.printGroups !== undefined) {
    result.printGroups = normalizePrintGroups(clone(lesson.printGroups), items);
  }

  return result;
}

export function createUniversalDraftItem(lessonId, type, index = 0) {
  const safeType = QUESTION_TYPES.includes(type) ? type : 'mcq';
  const id = uniqueId(`${String(lessonId || 'lesson')}-admin-${safeType}-${index}`);
  if (safeType === 'typing') return { id, type: 'typing', vi: '', en: '' };
  if (safeType === 'true_false') return { id, type: 'true_false', statement: '', answer: true };
  if (safeType === 'sentence_order') {
    return { id, type: 'sentence_order', prompt: '', tokens: ['A', 'B'], correctOrder: ['A', 'B'] };
  }
  if (safeType === 'classification') {
    return {
      id,
      type: 'classification',
      prompt: '',
      classificationKind: 'generic',
      groups: [
        { id: 'group-a', label: 'Group A / Nhóm A' },
        { id: 'group-b', label: 'Group B / Nhóm B' }
      ],
      tokens: [
        { id: 'token-a', text: 'Item A', correctGroupId: 'group-a' },
        { id: 'token-b', text: 'Item B', correctGroupId: 'group-b' }
      ]
    };
  }
  return {
    id,
    type: 'mcq',
    prompt: '',
    choices: [
      { id: 'a', text: 'Choice A / Lựa chọn A' },
      { id: 'b', text: 'Choice B / Lựa chọn B' }
    ],
    correctChoiceId: 'a'
  };
}

export function appendDraftItem(lesson, draft, type, printGroupId = null) {
  const next = normalizeUniversalDraft(lesson, draft);
  const item = createUniversalDraftItem(lesson?.id, type, next.items.length + 1);
  next.items.push(item);
  if (next.printGroups?.length) {
    const group = next.printGroups.find(entry => entry.id === printGroupId) ?? next.printGroups.at(-1);
    group.itemIds.push(item.id);
    next.printGroups = normalizePrintGroups(next.printGroups, next.items);
    next.items = alignItemsToPrintGroups(next.items, next.printGroups);
  }
  return next;
}

export function removeDraftItem(lesson, draft, itemId) {
  const next = normalizeUniversalDraft(lesson, draft);
  next.items = next.items.filter(item => item.id !== itemId);
  if (next.printGroups) {
    next.printGroups = next.printGroups
      .map(group => ({ ...group, itemIds: group.itemIds.filter(id => id !== itemId) }))
      .filter(group => group.itemIds.length > 0);
    if (!next.printGroups.length && next.items.length) {
      next.printGroups = [{ id: 'admin-group-1', title: 'Bài tập / Exercises', itemIds: next.items.map(item => item.id) }];
    }
    next.items = alignItemsToPrintGroups(next.items, next.printGroups);
  }
  return next;
}

export function moveDraftItem(lesson, draft, itemId, direction) {
  const next = normalizeUniversalDraft(lesson, draft);
  if (next.printGroups?.length) {
    const group = next.printGroups.find(entry => entry.itemIds.includes(itemId));
    if (!group) return next;
    const index = group.itemIds.indexOf(itemId);
    const target = index + (direction < 0 ? -1 : 1);
    if (target < 0 || target >= group.itemIds.length) return next;
    [group.itemIds[index], group.itemIds[target]] = [group.itemIds[target], group.itemIds[index]];
    next.items = alignItemsToPrintGroups(next.items, next.printGroups);
    return next;
  }
  const index = next.items.findIndex(item => item.id === itemId);
  const target = index + (direction < 0 ? -1 : 1);
  if (index < 0 || target < 0 || target >= next.items.length) return next;
  [next.items[index], next.items[target]] = [next.items[target], next.items[index]];
  return next;
}

export function assignDraftItemToGroup(lesson, draft, itemId, groupId) {
  const next = normalizeUniversalDraft(lesson, draft);
  if (!next.printGroups?.length) return next;
  for (const group of next.printGroups) group.itemIds = group.itemIds.filter(id => id !== itemId);
  const target = next.printGroups.find(group => group.id === groupId) ?? next.printGroups.at(-1);
  target.itemIds.push(itemId);
  next.printGroups = next.printGroups.filter(group => group.itemIds.length > 0);
  next.items = alignItemsToPrintGroups(next.items, next.printGroups);
  return next;
}

export function draftGroupIdForItem(draft, itemId) {
  return draft?.printGroups?.find(group => group.itemIds.includes(itemId))?.id ?? null;
}

export function addDraftPassage(lesson, draft) {
  const next = normalizeUniversalDraft(lesson, draft);
  next.passages ??= [];
  const id = uniqueId(`${String(lesson?.id || 'lesson')}-passage`);
  next.passages.push({ id, title: 'New passage / Bài đọc mới', text: '' });
  return next;
}

export function removeDraftPassage(lesson, draft, passageId) {
  const next = normalizeUniversalDraft(lesson, draft);
  next.passages = (next.passages ?? []).filter(passage => passage.id !== passageId);
  return next;
}

function normalizePrintGroups(groups, items) {
  if (!Array.isArray(groups)) return [];
  const itemIds = new Set(items.map(item => String(item.id)));
  const assigned = new Set();
  const normalized = [];
  for (const [index, raw] of groups.entries()) {
    const ids = [];
    for (const rawId of raw?.itemIds ?? []) {
      const id = String(rawId);
      if (!itemIds.has(id) || assigned.has(id)) continue;
      assigned.add(id);
      ids.push(id);
    }
    if (!ids.length) continue;
    normalized.push({
      id: String(raw?.id ?? `group-${index + 1}`),
      title: String(raw?.title ?? `Group ${index + 1}`),
      itemIds: ids
    });
  }
  const missing = items.map(item => String(item.id)).filter(id => !assigned.has(id));
  if (missing.length) {
    if (!normalized.length) normalized.push({ id: 'admin-group-1', title: 'Bài tập / Exercises', itemIds: [] });
    normalized.at(-1).itemIds.push(...missing);
  }
  return normalized;
}

function alignItemsToPrintGroups(items, groups) {
  if (!groups?.length) return items;
  const byId = new Map(items.map(item => [String(item.id), item]));
  return groups.flatMap(group => group.itemIds.map(id => byId.get(String(id))).filter(Boolean));
}

function freezeContent(content) {
  const output = { items: Object.freeze(content.items.map(item => Object.freeze(clone(item)))) };
  if ('passages' in content) output.passages = Object.freeze((content.passages ?? []).map(value => Object.freeze(clone(value))));
  if ('printGroups' in content) output.printGroups = Object.freeze((content.printGroups ?? []).map(value => Object.freeze({ ...clone(value), itemIds: Object.freeze([...(value.itemIds ?? [])]) })));
  return Object.freeze(output);
}
