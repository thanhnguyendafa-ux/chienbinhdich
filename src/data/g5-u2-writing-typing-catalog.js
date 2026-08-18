import { g5U2WritingSource } from './g5-u2-writing-source.js';
import { getG5U2WritingTypingContent } from './g5-u2-writing-typing-content.js';

export const g5U2WritingFolders = Object.freeze([
  Object.freeze({ id: 'global5-unit2-writing-typing', name: 'Writing · Sentence Builder', description: '16 mini lessons Typing Việt → Anh; mỗi bài cold-start từ từ/chunk đến một FINAL.', parentId: 'global5-unit2', order: 5 }),
  Object.freeze({ id: 'global5-unit2-writing-home-type', name: '1 · Home type', description: 'House, flat, building, tower với this/that và Do you live...?', parentId: 'global5-unit2-writing-typing', order: 1 }),
  Object.freeze({ id: 'global5-unit2-writing-yes-no', name: '2 · Yes / No', description: 'Trả lời Yes, I do. / No, I don’t.', parentId: 'global5-unit2-writing-typing', order: 2 }),
  Object.freeze({ id: 'global5-unit2-writing-where', name: '3 · Where', description: 'Hỏi và nói nơi mình sống.', parentId: 'global5-unit2-writing-typing', order: 3 }),
  Object.freeze({ id: 'global5-unit2-writing-distance', name: '4 · Near & distance', description: 'Gần trường và khoảng cách từ đây.', parentId: 'global5-unit2-writing-typing', order: 4 }),
  Object.freeze({ id: 'global5-unit2-writing-address', name: '5 · Address', description: 'Hỏi, trả lời và nói địa chỉ; in/at và live/lives.', parentId: 'global5-unit2-writing-typing', order: 5 })
]);

const folderByOrder = Object.freeze({
  1: 'global5-unit2-writing-home-type', 2: 'global5-unit2-writing-home-type', 3: 'global5-unit2-writing-home-type', 4: 'global5-unit2-writing-home-type',
  5: 'global5-unit2-writing-yes-no', 6: 'global5-unit2-writing-yes-no',
  7: 'global5-unit2-writing-where', 8: 'global5-unit2-writing-where', 9: 'global5-unit2-writing-where', 10: 'global5-unit2-writing-where',
  11: 'global5-unit2-writing-distance', 12: 'global5-unit2-writing-distance',
  13: 'global5-unit2-writing-address', 14: 'global5-unit2-writing-address', 15: 'global5-unit2-writing-address', 16: 'global5-unit2-writing-address'
});

const safeTitleByOrder = Object.freeze({
  1: 'Ngôi nhà này', 2: 'Căn hộ này', 3: 'Tòa nhà kia', 4: 'Tòa tháp kia',
  5: 'Trả lời Có', 6: 'Trả lời Không', 7: 'Căn hộ kia', 8: 'Bạn sống ở đâu?',
  9: 'Một ngôi nhà gần đây', 10: 'Một căn hộ gần đây', 11: 'Gần trường', 12: 'Cách đây khoảng 1 km',
  13: 'Địa chỉ của bạn', 14: 'Địa chỉ Oxford', 15: 'Tôi sống tại địa chỉ', 16: 'Cô ấy sống tại London Street'
});

export const g5U2WritingRegistry = Object.freeze(g5U2WritingSource.map(source => {
  const key = String(source.order).padStart(2, '0');
  const itemCount = getG5U2WritingTypingContent(key).items.length;
  return Object.freeze({
    id: `g5-u2-writing-typing-${key}`,
    folderId: folderByOrder[source.order],
    order: source.order,
    version: 1,
    course: 'Global Success 5',
    unit: 'Unit 2 · Our homes',
    title: `${key} · ${safeTitleByOrder[source.order]}`,
    subtitle: 'Typing · Việt → Anh · NHÌN → CHUNK → CÂU',
    expectedTimeMinutes: source.expectedTimeMinutes,
    difficulty: source.difficulty,
    lessonSlug: `g5u2-writing-${key}`,
    passThreshold: 80,
    completionPolicy: 'all-items',
    typingTolerance: false,
    teacher: 'Thầy Thành MRT',
    description: `${itemCount} lượt Typing dựng đúng một câu trọng tâm Unit 2; từ/chunk và bridge cần cho FINAL đều được dạy lại ngay trong lesson. Dự kiến ${source.expectedTimeMinutes} phút.`,
    activityTypes: Object.freeze(['typing']),
    itemCount,
    targetSentenceId: source.id,
    loadContent: () => import('./g5-u2-writing-typing-content.js').then(module => module.getG5U2WritingTypingContent(key))
  });
}));
