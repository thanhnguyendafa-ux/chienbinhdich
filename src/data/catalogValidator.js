export function validateCatalog(folders, registry) {
  const errors = [];
  const folderIds = new Set();
  const setIds = new Set();
  const assignmentSlugs = new Set();

  for (const folder of folders ?? []) {
    if (!folder?.id) errors.push('Folder thiếu id.');
    else if (folderIds.has(folder.id)) errors.push(`Folder id bị trùng: ${folder.id}`);
    else folderIds.add(folder.id);
    if (!folder?.name) errors.push(`Folder ${folder?.id ?? '(unknown)'} thiếu name.`);
    if (!Number.isInteger(folder?.order)) errors.push(`Folder ${folder?.id ?? '(unknown)'} có order không hợp lệ.`);
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
    if (!Number.isFinite(entry?.passThreshold) || entry.passThreshold <= 0 || entry.passThreshold > 100) errors.push(`Set ${entry?.id ?? '(unknown)'} có passThreshold không hợp lệ.`);
    if (!Array.isArray(entry?.activityTypes) || entry.activityTypes.length === 0) errors.push(`Set ${entry?.id ?? '(unknown)'} thiếu activityTypes.`);
    if (typeof entry?.loadContent !== 'function') errors.push(`Set ${entry?.id ?? '(unknown)'} thiếu content loader.`);

    const slug = String(entry?.assignmentSlug ?? '');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.push(`Set ${entry?.id ?? '(unknown)'} có assignmentSlug không hợp lệ.`);
    } else if (assignmentSlugs.has(slug)) {
      errors.push(`assignmentSlug bị trùng: ${slug}`);
    } else {
      assignmentSlugs.add(slug);
    }
  }

  return errors;
}
