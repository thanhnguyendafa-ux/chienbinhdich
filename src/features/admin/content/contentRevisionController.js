import { firebaseConfig } from '../../../config/firebaseConfig.js';
import { validateSet } from '../../../data/contentValidator.js';
import { createAdminLessonContentRepository } from '../../../repositories/adminLessonContentRepository.js';
import { loadLessonSet } from '../../../repositories/lessonRepository.js';
import { applyLessonContentOverride } from '../../../services/effectiveLessonService.js';

let repository = null;

function contentRepository() {
  if (!firebaseConfig.enabled) throw new Error('Firebase chưa được bật cho Content CMS.');
  repository ??= createAdminLessonContentRepository(firebaseConfig.project);
  return repository;
}

export async function listContentRevisions(setId) {
  return contentRepository().listRevisions(setId);
}

export async function restoreContentRevision(setId, revision) {
  const numericRevision = Number(revision);
  if (!String(setId ?? '').trim()) throw new Error('Thiếu Set cần khôi phục.');
  if (!Number.isInteger(numericRevision) || numericRevision < 1) throw new Error('Revision cần khôi phục không hợp lệ.');

  const [baseLesson, historical] = await Promise.all([
    loadLessonSet(setId),
    contentRepository().getRevisionContent(setId, numericRevision)
  ]);
  if (!historical) throw new Error(`Không tìm thấy revision ${numericRevision} của ${setId}.`);

  const candidate = applyLessonContentOverride(baseLesson, historical);
  const errors = validateSet(candidate);
  if (errors.length) {
    throw new Error(`Revision cũ không còn hợp lệ với Base hiện tại: ${errors.join('; ')}`);
  }

  return contentRepository().publishContent(setId, {
    baseVersion: Number(baseLesson.version ?? 1),
    items: historical.items,
    passages: historical.passages,
    printGroups: historical.printGroups
  });
}
