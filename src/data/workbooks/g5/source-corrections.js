const freeze = value => Object.freeze(value);

export const G5_WORKBOOK_SOURCE_CORRECTIONS = freeze({
  'g5-u04-wb-e2#4': freeze({
    prompt: 'The writer sometimes ___ at the swimming pool.',
    answer: 'goes swimming',
    explanation: 'Passage dùng “I go swimming”; khi gọi người kể là “the writer”, động từ đổi thành “goes swimming”.',
    reason: 'Bản cũ tự thêm tên Mary dù passage không giới thiệu Mary; online phải giữ chủ thể có bằng chứng trong bài đọc.'
  })
});

export const G5_WORKBOOK_PRELOAD_CORRECTIONS = freeze({
  'g5-u04-wb-a3#phrase#1': freeze({
    en: 'water the flowers',
    vi: 'tưới hoa',
    reason: 'Không dạy distractor sai “play the flowers” như một cụm từ hợp lệ.'
  })
});

export function correctedG5SourceItem(specId, raw, index) {
  const correction = G5_WORKBOOK_SOURCE_CORRECTIONS[`${specId}#${index + 1}`];
  return correction ? freeze({ ...raw, ...correction }) : raw;
}

export function correctedG5PreloadEntry(specId, phase, entry, index) {
  const correction = G5_WORKBOOK_PRELOAD_CORRECTIONS[`${specId}#${phase}#${index + 1}`];
  return correction ? freeze({ ...entry, ...correction }) : entry;
}
