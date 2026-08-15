import { validateLessonSlug } from '../core/lessonLinks.js';
import { validatePassThreshold } from '../core/masteryPolicy.js';
import { isValidTypingTolerance } from '../core/typingPolicy.js';

const DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

export function validateCatalog(folders, registry) {
  const errors = [];
  const folderIds = new Set();
  const setIds = new Set();
  const lessonSlugs = new Set();

  for (const folder of folders ?? []) {
    if (!folder?.id) errors.push('Folder thiếu id.');
    else if (folderIds.has(folder.id)) errors.push(`Folder id bị trùng: ${folder.id}`);
    else folderIds.add(folder.id);
    if (!folder?.name) errors.push(`Folder ${folder?.id ?? '(unknown)'} thiếu name.`);
    if (!Number.isInteger(folder?.order)) errors.push(`Folder ${folder?.id ?? '(unknown)'} có order không hợp lệ.`);
  }

  const folderById = new Map((folders ?? []).filter(folder => folder?.id).map(folder => [folder.id, folder]));
  for (const folder of folders ?? []) {
    if (!folder?.parentId) continue;
    if (folder.parentId === folder.id) errors.push(`Folder ${folder.id} không thể là parent của chính nó.`);
    else if (!folderIds.has(folder.parentId)) errors.push(`Folder ${folder.id} tham chiếu parent không tồn tại: ${folder.parentId}`);
  }
  for (const folder of folders ?? []) {
    const visited = new Set();
    let cursor = folder;
    while (cursor?.parentId) {
      if (visited.has(cursor.id)) {
        errors.push(`Folder tree có vòng lặp tại: ${folder.id}`);
        break;
      }
      visited.add(cursor.id);
      cursor = folderById.get(cursor.parentId);
    }
  }

  for (const entry of registry ?? []) {
    if (!entry?.id) errors.push('Set descriptor thiếu id.');
    else if (setIds.has(entry.id)) errors.push(`Set id bị trùng: ${entry.id}`);
    else setIds.add(entry.id);

    if (!Number.isInteger(entry?.order)) errors.push(`Set ${entry?.id ?? '(unknown)'} có order không hợp lệ.`);
    if (!entry?.folderId || !folderIds.has(entry.folderId)) errors.push(`Set ${entry?.id ?? '(unknown)'} tham chiếu folder không tồn tại: ${entry?.folderId ?? '(missing)'}`);
    if (!entry?.title) errors.push(`Set ${entry?.id ?? '(unknown)'} thiếu title.`);
    if (!entry?.course) errors.push(`Set ${entry?.id ?? '(unknown)'} thiếu course.`);
    if (!entry?.unit) errors.push(`Set ${entry?.id ?? '(unknown)'} thiếu unit.`);
    if (!Number.isInteger(entry?.itemCount) || entry.itemCount <= 0) errors.push(`Set ${entry?.id ?? '(unknown)'} có itemCount không hợp lệ.`);
    if (entry?.passThreshold !== undefined) {
      errors.push(...validatePassThreshold(entry.passThreshold, `Set ${entry?.id ?? '(unknown)'} passThreshold`));
    }
    if (entry?.typingTolerance !== undefined && !isValidTypingTolerance(entry.typingTolerance)) {
      errors.push(`Set ${entry?.id ?? '(unknown)'} có typingTolerance không hợp lệ.`);
    }
    if (entry?.difficulty !== undefined && !DIFFICULTIES.has(entry.difficulty)) {
      errors.push(`Set ${entry?.id ?? '(unknown)'} có difficulty không hợp lệ.`);
    }
    if (entry?.expectedTimeMinutes !== undefined && !isValidExpectedTime(entry.expectedTimeMinutes)) {
      errors.push(`Set ${entry?.id ?? '(unknown)'} có expectedTimeMinutes không hợp lệ; phải là số nguyên từ 1 đến 20.`);
    }
    if (!Array.isArray(entry?.activityTypes) || entry.activityTypes.length === 0) errors.push(`Set ${entry?.id ?? '(unknown)'} thiếu activityTypes.`);
    if (typeof entry?.loadContent !== 'function') errors.push(`Set ${entry?.id ?? '(unknown)'} thiếu content loader.`);

    registerLessonSlug(entry?.lessonSlug, `Set ${entry?.id ?? '(unknown)'} lessonSlug`, lessonSlugs, errors);

    if (entry?.lessonSlugAliases !== undefined && !Array.isArray(entry.lessonSlugAliases)) {
      errors.push(`Set ${entry?.id ?? '(unknown)'} có lessonSlugAliases không hợp lệ.`);
    } else {
      for (const alias of entry?.lessonSlugAliases ?? []) {
        registerLessonSlug(alias, `Set ${entry?.id ?? '(unknown)'} lessonSlug alias`, lessonSlugs, errors);
      }
    }
  }

  return errors;
}

function registerLessonSlug(value, label, lessonSlugs, errors) {
  const slug = String(value ?? '');
  if (!validateLessonSlug(slug)) {
    errors.push(`${label} không hợp lệ hoặc xung đột legacy route.`);
  } else if (lessonSlugs.has(slug)) {
    errors.push(`lessonSlug bị trùng: ${slug}`);
  } else {
    lessonSlugs.add(slug);
  }
}

function isValidExpectedTime(value) {
  return Number.isInteger(value) && value >= 1 && value <= 20;
}
