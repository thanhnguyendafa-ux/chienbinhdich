const stageRank = Object.freeze({ word: 0, phrase: 1, sentence: 2 });

export function validateSet(set) {
  const errors = [];
  const ids = new Set();
  const seen = new Set();
  let previousRank = -1;

  if (!set?.id || !Array.isArray(set.items) || set.items.length === 0) {
    return ['Set phải có id và ít nhất một item.'];
  }

  for (const item of set.items) {
    if (!item.id || !item.vi || !item.en || !(item.stage in stageRank)) {
      errors.push(`Item không hợp lệ: ${item.id ?? '(không id)'}`);
      continue;
    }
    if (ids.has(item.id)) errors.push(`ID trùng: ${item.id}`);
    ids.add(item.id);

    const rank = stageRank[item.stage];
    if (rank < previousRank) errors.push(`Sai thứ tự stage tại ${item.id}`);
    previousRank = Math.max(previousRank, rank);

    for (const dependency of item.buildsFrom ?? []) {
      if (!seen.has(dependency)) errors.push(`${item.id} dùng prerequisite chưa xuất hiện: ${dependency}`);
    }
    seen.add(item.id);
  }

  if (set.passThreshold !== 80) errors.push('V1 yêu cầu passThreshold = 80.');
  return errors;
}
