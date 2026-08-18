import { g7U2WritingSource } from './g7-u2-writing-source.js';
import { getG7U2WritingTypingContent } from './g7-u2-writing-typing-content.js';

export const g7U2WritingFolders = Object.freeze([
  Object.freeze({ id: "global7-unit2", name: "Unit 2 · Healthy Living", description: "Kho bài Global Success 7 Unit 2 · Healthy Living.", parentId: "global7", order: 2 }),
  Object.freeze({ id: "global7-unit2-writing-sentence-builder", name: "Writing · Sentence Builder", description: "16 mini writing lessons: exact cue surface → chunk → sentence part → FINAL; title không lộ đáp án.", parentId: "global7-unit2", order: 1 }),
  Object.freeze({ id: "global7-unit2-writing-s1", name: "Cấu trúc 1 · Healthy habits & benefits", description: "Lợi ích, routine và healthy actions từ transcript Unit 2.", parentId: "global7-unit2-writing-sentence-builder", order: 1 }),
  Object.freeze({ id: "global7-unit2-writing-s2", name: "Cấu trúc 2 · Health advice", description: "Health advice với can / should not.", parentId: "global7-unit2-writing-sentence-builder", order: 2 }),
  Object.freeze({ id: "global7-unit2-writing-s3", name: "Cấu trúc 3 · Food & drink", description: "Food/drink advice, nutrients, limits và consequence.", parentId: "global7-unit2-writing-sentence-builder", order: 3 }),
  Object.freeze({ id: "global7-unit2-writing-s4", name: "Cấu trúc 4 · Exercise & outdoor activities", description: "Exercise, outdoor activities và example expansion.", parentId: "global7-unit2-writing-sentence-builder", order: 4 }),
  Object.freeze({ id: "global7-unit2-writing-s5", name: "Cấu trúc 5 · Sleep & consequences", description: "Sleep advice nối result bằng so.", parentId: "global7-unit2-writing-sentence-builder", order: 5 }),
  Object.freeze({ id: "global7-unit2-writing-s6", name: "Cấu trúc 6 · Healthy environment", description: "Room hygiene, fresh air, sunshine và purpose.", parentId: "global7-unit2-writing-sentence-builder", order: 6 })
]);

const folderByOrder = Object.freeze({
  1: "global7-unit2-writing-s1",
  2: "global7-unit2-writing-s1",
  3: "global7-unit2-writing-s1",
  4: "global7-unit2-writing-s1",
  5: "global7-unit2-writing-s2",
  6: "global7-unit2-writing-s2",
  7: "global7-unit2-writing-s3",
  8: "global7-unit2-writing-s3",
  9: "global7-unit2-writing-s3",
  10: "global7-unit2-writing-s3",
  11: "global7-unit2-writing-s3",
  12: "global7-unit2-writing-s4",
  13: "global7-unit2-writing-s4",
  14: "global7-unit2-writing-s5",
  15: "global7-unit2-writing-s6",
  16: "global7-unit2-writing-s6"
});

const safeTitleKeywordsByOrder = Object.freeze({
  1: "thói quen · giữ khỏe",
  2: "ngoài trời · sức khỏe",
  3: "gia đình · đạp xe",
  4: "năng động · giữ khỏe",
  5: "mắt · thuốc nhỏ",
  6: "ánh sáng mờ · lời khuyên",
  7: "trái cây · rau củ",
  8: "vitamin · thực phẩm",
  9: "thịt · trứng · phô mai",
  10: "tăng cân · cảnh báo",
  11: "nước · nước ngọt",
  12: "vận động · mỗi ngày",
  13: "đạp xe · bơi · thể thao",
  14: "ngủ sớm · tám tiếng",
  15: "phòng · gọn sạch",
  16: "không khí · ánh nắng"
});

export const g7U2WritingRegistry = Object.freeze(g7U2WritingSource.map(source => {
  const key = String(source.order).padStart(2, '0');
  const itemCount = getG7U2WritingTypingContent(key).items.length;
  const safeTitleKeywords = safeTitleKeywordsByOrder[source.order];
  if (!safeTitleKeywords) throw new Error(`Missing learner-safe G7 U2 title keywords for lesson ${key}`);
  return Object.freeze({
    id: `g7-u2-writing-${key}`,
    folderId: folderByOrder[source.order],
    order: source.order,
    version: 1,
    course: 'Global Success 7',
    unit: 'Unit 2 · Healthy Living',
    title: `${key} · ${safeTitleKeywords}`,
    subtitle: 'Typing · Việt → Anh · CHUNK → SENTENCE',
    expectedTimeMinutes: source.expectedTimeMinutes,
    difficulty: source.difficulty,
    lessonSlug: `g7u2-writing-${key}`,
    passThreshold: 80,
    completionPolicy: 'all-items',
    typingTolerance: false,
    teacher: 'Thầy Thành MRT',
    description: `${itemCount} lượt Typing dựng đúng một target sentence từ transcript Unit 2; cue Việt khóa surface form và title không lộ FINAL.`,
    activityTypes: Object.freeze(['typing']),
    itemCount,
    targetSentenceId: source.id,
    loadContent: () => import('./g7-u2-writing-typing-content.js').then(module => module.getG7U2WritingTypingContent(key))
  });
}));
