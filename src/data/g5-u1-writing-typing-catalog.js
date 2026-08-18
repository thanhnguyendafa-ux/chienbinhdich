import { g5U1WritingSource } from './g5-u1-writing-source.js';
import { getG5U1WritingTypingContent } from './g5-u1-writing-typing-content.js';

export const g5U1WritingFolders = Object.freeze([
  Object.freeze({ id: 'global5-unit1-writing-typing', name: 'Writing · Sentence Builder', description: '14 mini lessons Typing Việt → Anh; mỗi bài tự dạy lại từ và chunk trước FINAL.', parentId: 'global5-unit1', order: 5 }),
  Object.freeze({ id: 'global5-unit1-writing-about-self', name: '1 · About yourself & place', description: 'Giới thiệu bản thân, lớp học và nơi sống.', parentId: 'global5-unit1-writing-typing', order: 1 }),
  Object.freeze({ id: 'global5-unit1-writing-favourite-questions', name: '2 · Favourite questions', description: 'Hỏi colour, sport, food và animal.', parentId: 'global5-unit1-writing-typing', order: 2 }),
  Object.freeze({ id: 'global5-unit1-writing-favourite-answers', name: '3 · Favourite answers', description: 'Trả lời favourite sport, food, animal và colour.', parentId: 'global5-unit1-writing-typing', order: 3 }),
  Object.freeze({ id: 'global5-unit1-writing-like-love', name: '4 · Like / Love + V-ing', description: 'Nói hoạt động yêu thích bằng like/love + V-ing.', parentId: 'global5-unit1-writing-typing', order: 4 })
]);

const folderByOrder = Object.freeze({
  1: 'global5-unit1-writing-about-self', 2: 'global5-unit1-writing-about-self', 5: 'global5-unit1-writing-about-self', 6: 'global5-unit1-writing-about-self',
  3: 'global5-unit1-writing-favourite-questions', 7: 'global5-unit1-writing-favourite-questions', 9: 'global5-unit1-writing-favourite-questions', 11: 'global5-unit1-writing-favourite-questions',
  8: 'global5-unit1-writing-favourite-answers', 10: 'global5-unit1-writing-favourite-answers', 12: 'global5-unit1-writing-favourite-answers', 14: 'global5-unit1-writing-favourite-answers',
  4: 'global5-unit1-writing-like-love', 13: 'global5-unit1-writing-like-love'
});

const safeTitleByOrder = Object.freeze({
  1: 'Giới thiệu bản thân', 2: 'Sống ở nông thôn', 3: 'Màu em thích', 4: 'Chơi bóng bàn',
  5: 'Lớp của em', 6: 'Sống ở thành phố', 7: 'Môn thể thao em thích', 8: 'Bóng đá yêu thích',
  9: 'Món ăn em thích', 10: 'Sandwich yêu thích', 11: 'Con vật em thích', 12: 'Cá heo yêu thích',
  13: 'Chơi bóng rổ', 14: 'Màu xanh lá yêu thích'
});

export const g5U1WritingRegistry = Object.freeze(g5U1WritingSource.map(source => {
  const key = String(source.order).padStart(2, '0');
  const itemCount = getG5U1WritingTypingContent(key).items.length;
  return Object.freeze({
    id: `g5-u1-writing-typing-${key}`,
    folderId: folderByOrder[source.order],
    order: source.order,
    version: 1,
    course: 'Global Success 5',
    unit: 'Unit 1 · All about me!',
    title: `${key} · ${safeTitleByOrder[source.order]}`,
    subtitle: 'Typing · Việt → Anh · NHÌN → CHUNK → CÂU',
    expectedTimeMinutes: source.expectedTimeMinutes,
    difficulty: source.difficulty,
    lessonSlug: `g5u1-writing-${key}`,
    passThreshold: 80,
    completionPolicy: 'all-items',
    typingTolerance: false,
    teacher: 'Thầy Thành MRT',
    description: `${itemCount} lượt Typing dựng đúng một câu trọng tâm; mọi từ/chunk cần cho FINAL đều được dạy lại ngay trong lesson. Dự kiến ${source.expectedTimeMinutes} phút.`,
    activityTypes: Object.freeze(['typing']),
    itemCount,
    targetSentenceId: source.id,
    loadContent: () => import('./g5-u1-writing-typing-content.js').then(module => module.getG5U1WritingTypingContent(key))
  });
}));
