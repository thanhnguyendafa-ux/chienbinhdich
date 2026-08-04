const loaders = Object.freeze({
  'g7-u1-s1': () => import('../data/global7-unit1-set1.js').then(module => module.global7Unit1Set1)
});

const cache = new Map();

export async function loadLessonSet(setId) {
  if (!loaders[setId]) throw new Error(`Không tìm thấy set: ${setId}`);
  if (!cache.has(setId)) cache.set(setId, loaders[setId]());
  return cache.get(setId);
}
