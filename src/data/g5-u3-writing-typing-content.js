import { buildG5U3LessonMap } from './g5-u3-writing-typing-builder.js';
import { g5U3WritingSource } from './g5-u3-writing-source.js';

const freezeSteps = steps => Object.freeze(steps.map(step => Object.freeze(step)));
const spec = (targetSentenceId, steps) => Object.freeze({ targetSentenceId, steps: freezeSteps(steps) });

const SPECS = Object.freeze({
  '01': spec('g5u3-wr-t01', [
    { role: 'see', vi: 'Bối cảnh: Em đang giới thiệu rằng em có một người bạn mới đến từ nước ngoài.\n\ntôi = I · Nhìn và gõ lại.', en: 'I' },
    { role: 'see', vi: 'có = have · Nhìn và gõ lại.', en: 'have' },
    { role: 'see', vi: 'một = a · Nhìn và gõ lại.', en: 'a' },
    { role: 'see', vi: 'mới = new · Nhìn và gõ lại.', en: 'new' },
    { role: 'see', vi: 'nước ngoài = foreign · Nhìn và gõ lại.', en: 'foreign' },
    { role: 'see', vi: 'người bạn = friend · Nhìn và gõ lại.', en: 'friend' },
    { role: 'chunk', vi: 'một người bạn', en: 'a friend' },
    { role: 'chunk', vi: 'một người bạn nước ngoài mới', en: 'a new foreign friend' },
    { role: 'final', vi: 'Tôi có một người bạn nước ngoài mới.', en: 'I have a new foreign friend.' }
  ]),
  '02': spec('g5u3-wr-t02', [
    { role: 'see', vi: 'Bối cảnh: Trong hội thoại, em muốn hỏi một bạn nam đến từ đâu. Tiếng Anh có nhiều cách hỏi thông tin về một người; trong bài này em luyện cách hỏi nguồn gốc / nơi đến từ.\n\nở đâu / từ đâu = where · Nhìn và gõ lại.', en: 'where' },
    { role: 'see', vi: 'bạn ấy, nam = he · Nhìn và gõ lại.', en: 'he' },
    { role: 'see', vi: 'từ = from · Nhìn và gõ lại.', en: 'from' },
    { role: 'see', vi: 'Where is · Gõ lại.', en: 'Where is' },
    { role: 'bridge', vi: 'Where is viết tắt = ?', en: "Where's" },
    { role: 'recall', vi: 'bạn ấy, nam', en: 'he' },
    { role: 'recall', vi: 'từ', en: 'from' },
    { role: 'final', vi: 'Bạn ấy đến từ đâu?', en: "Where's he from?" }
  ]),
  '03': spec('g5u3-wr-t03', [
    { role: 'see', vi: 'Bối cảnh: Bạn nam đó đến từ Úc. Em cần nói nơi bạn ấy đến từ, chưa phải nói quốc tịch.\n\nbạn ấy, nam = he', en: 'he' },
    { role: 'see', vi: 'is · Gõ lại.', en: 'is' },
    { role: 'see', vi: 'từ = from', en: 'from' },
    { role: 'see', vi: 'Úc — tên nước = Australia', en: 'Australia' },
    { role: 'chunk', vi: 'từ Úc', en: 'from Australia' },
    { role: 'bridge', vi: 'He is viết tắt = ?', en: "He's" },
    { role: 'final', vi: 'Bạn ấy đến từ Úc.', en: "He's from Australia." }
  ]),
  '04': spec('g5u3-wr-t04', [
    { role: 'see', vi: 'Bối cảnh: Bây giờ em không hỏi bạn ấy đến từ đâu. Em muốn hỏi quốc tịch của bạn nam.\n\ngì = what', en: 'what' },
    { role: 'see', vi: 'quốc tịch = nationality', en: 'nationality' },
    { role: 'see', vi: 'bạn ấy, nam = he', en: 'he' },
    { role: 'see', vi: 'là = is', en: 'is' },
    { role: 'chunk', vi: 'quốc tịch gì', en: 'what nationality' },
    { role: 'bridge', vi: 'Câu nói he is → khi hỏi với BE đổi thành ?', en: 'is he' },
    { role: 'final', vi: 'Bạn ấy mang quốc tịch gì?', en: 'What nationality is he?' }
  ]),
  '05': spec('g5u3-wr-t05', [
    { role: 'see', vi: 'Bối cảnh: Bạn nam đến từ Úc. Bây giờ em cần nói quốc tịch / người nước nào.\n\nnước Úc', en: 'Australia' },
    { role: 'see', vi: 'người Úc / quốc tịch Úc', en: 'Australian' },
    { role: 'see', vi: 'bạn ấy, nam = he', en: 'he' },
    { role: 'see', vi: 'is · Gõ lại.', en: 'is' },
    { role: 'bridge', vi: 'He is viết tắt = ?', en: "He's" },
    { role: 'recall', vi: 'Tên nước Úc là?', en: 'Australia' },
    { role: 'recall', vi: 'Người/quốc tịch Úc là?', en: 'Australian' },
    { role: 'final', vi: 'Bạn ấy là người Úc.', en: "He's Australian." }
  ]),
  '06': spec('g5u3-wr-t06', [
    { role: 'see', vi: 'Bối cảnh: Em muốn hỏi quốc tịch của một bạn nữ.\n\ngì = what', en: 'what' },
    { role: 'see', vi: 'quốc tịch = nationality', en: 'nationality' },
    { role: 'see', vi: 'bạn ấy, nữ = she', en: 'she' },
    { role: 'see', vi: 'is · Gõ lại.', en: 'is' },
    { role: 'chunk', vi: 'quốc tịch gì', en: 'what nationality' },
    { role: 'bridge', vi: 'she is → câu hỏi với BE', en: 'is she' },
    { role: 'final', vi: 'Bạn ấy mang quốc tịch gì?', en: 'What nationality is she?' }
  ]),
  '07': spec('g5u3-wr-t07', [
    { role: 'see', vi: 'Bối cảnh: Em biết bạn nữ đến từ Nhật Bản. Bây giờ em cần nói quốc tịch của bạn ấy.\n\nNhật Bản — tên nước', en: 'Japan' },
    { role: 'see', vi: 'người Nhật / quốc tịch Nhật', en: 'Japanese' },
    { role: 'see', vi: 'bạn ấy, nữ = she', en: 'she' },
    { role: 'see', vi: 'is · Gõ lại.', en: 'is' },
    { role: 'bridge', vi: 'She is viết tắt = ?', en: "She's" },
    { role: 'recall', vi: 'Tên nước Nhật Bản là?', en: 'Japan' },
    { role: 'recall', vi: 'Người/quốc tịch Nhật là?', en: 'Japanese' },
    { role: 'final', vi: 'Bạn ấy là người Nhật.', en: "She's Japanese." }
  ]),
  '08': spec('g5u3-wr-t08', [
    { role: 'see', vi: 'Bối cảnh: Em muốn hỏi bạn nữ là người như thế nào. Trong tiếng Anh, like có nhiều cách dùng. Trong mẫu của Unit này, em đang hỏi đặc điểm / tính cách, không phải hỏi sở thích.\n\nbạn ấy, nữ = she', en: 'she' },
    { role: 'see', vi: 'What is · Gõ lại.', en: 'What is' },
    { role: 'bridge', vi: 'What is viết tắt = ?', en: "What's" },
    { role: 'see', vi: 'Trong mẫu hỏi tính cách của Unit này, từ đứng cuối là like. Gõ lại.', en: 'like' },
    { role: 'final', vi: 'Bạn ấy là người như thế nào?', en: "What's she like?" }
  ]),
  '09': spec('g5u3-wr-t09', [
    { role: 'see', vi: 'Bối cảnh: Em đang miêu tả bạn nữ là người thân thiện.\n\nbạn ấy, nữ = she', en: 'she' },
    { role: 'see', vi: 'thân thiện = friendly', en: 'friendly' },
    { role: 'bridge', vi: 'She is viết tắt = ?', en: "She's" },
    { role: 'recall', vi: 'thân thiện', en: 'friendly' },
    { role: 'final', vi: 'Bạn ấy thân thiện.', en: "She's friendly." }
  ]),
  '10': spec('g5u3-wr-t10', [
    { role: 'see', vi: 'Bối cảnh: Em muốn miêu tả bạn nữ là người thường sẵn lòng giúp người khác.\n\ngiúp = help', en: 'help' },
    { role: 'see', vi: 'hay / sẵn lòng giúp đỡ = helpful', en: 'helpful' },
    { role: 'see', vi: 'bạn ấy, nữ = she', en: 'she' },
    { role: 'bridge', vi: 'She is viết tắt = ?', en: "She's" },
    { role: 'recall', vi: 'hay giúp đỡ', en: 'helpful' },
    { role: 'final', vi: 'Bạn ấy là người hay giúp đỡ.', en: "She's helpful." }
  ]),
  '11': spec('g5u3-wr-t11', [
    { role: 'see', vi: 'Bối cảnh: Em muốn hỏi bạn nam là người như thế nào, không phải hỏi sở thích của bạn ấy. Trong tiếng Anh, like có nhiều cách dùng; trong mẫu Unit này nó thuộc câu hỏi về người đó như thế nào.\n\nbạn ấy, nam = he', en: 'he' },
    { role: 'see', vi: 'What is · Gõ lại.', en: 'What is' },
    { role: 'bridge', vi: 'What is viết tắt = ?', en: "What's" },
    { role: 'see', vi: 'Trong mẫu hỏi tính cách của Unit này, từ đứng cuối là like. Gõ lại.', en: 'like' },
    { role: 'final', vi: 'Bạn ấy là người như thế nào?', en: "What's he like?" }
  ]),
  '12': spec('g5u3-wr-t12', [
    { role: 'see', vi: 'Bối cảnh: Em đang miêu tả bạn nam là người thông minh.\n\nbạn ấy, nam = he', en: 'he' },
    { role: 'see', vi: 'thông minh = clever', en: 'clever' },
    { role: 'bridge', vi: 'He is viết tắt = ?', en: "He's" },
    { role: 'recall', vi: 'thông minh', en: 'clever' },
    { role: 'final', vi: 'Bạn ấy thông minh.', en: "He's clever." }
  ]),
  '13': spec('g5u3-wr-t13', [
    { role: 'see', vi: 'Bối cảnh: Em đang miêu tả bạn nam là người năng động.\n\nbạn ấy, nam = he', en: 'he' },
    { role: 'see', vi: 'năng động = active', en: 'active' },
    { role: 'bridge', vi: 'He is viết tắt = ?', en: "He's" },
    { role: 'recall', vi: 'năng động', en: 'active' },
    { role: 'final', vi: 'Bạn ấy năng động.', en: "He's active." }
  ]),
  '14': spec('g5u3-wr-t14', [
    { role: 'see', vi: 'Bối cảnh: Unit này không chỉ gọi một người là “hay giúp đỡ”. Một hành động cũng có thể cho thấy tính cách đó. Bài này nói về việc bạn nam thích giúp bạn bè.\n\nbạn ấy, nam = he', en: 'he' },
    { role: 'see', vi: 'thích = like', en: 'like' },
    { role: 'see', vi: 'giúp = help', en: 'help' },
    { role: 'see', vi: 'bạn bè = friends', en: 'friends' },
    { role: 'see', vi: 'của bạn ấy, nam = his', en: 'his' },
    { role: 'chunk', vi: 'bạn bè của bạn ấy', en: 'his friends' },
    { role: 'bridge', vi: 'he + like → ?', en: 'likes' },
    { role: 'bridge', vi: 'sau likes, hoạt động help đổi thành ?', en: 'helping' },
    { role: 'final', vi: 'Bạn ấy thích giúp đỡ bạn bè của mình.', en: 'He likes helping his friends.' }
  ]),
  '15': spec('g5u3-wr-t15', [
    { role: 'see', vi: 'Bối cảnh: Unit này dùng một hành động đang xảy ra để cho thấy bạn ấy năng động. Hành động đang xảy ra bây giờ.\n\nbạn ấy, nam = he', en: 'he' },
    { role: 'see', vi: 'chơi = play', en: 'play' },
    { role: 'see', vi: 'cầu lông = badminton', en: 'badminton' },
    { role: 'see', vi: 'bây giờ = now', en: 'now' },
    { role: 'bridge', vi: 'play → dạng -ing', en: 'playing' },
    { role: 'bridge', vi: 'He is viết tắt = ?', en: "He's" },
    { role: 'final', vi: 'Bây giờ bạn ấy đang chơi cầu lông.', en: "He's playing badminton now." }
  ]),
  '16': spec('g5u3-wr-t16', [
    { role: 'see', vi: 'Bối cảnh: Unit này dùng một hành động để cho thấy bạn ấy thông minh: nói về cách bạn ấy học.\n\nbạn ấy, nam = he', en: 'he' },
    { role: 'see', vi: 'học = learn', en: 'learn' },
    { role: 'see', vi: 'những điều = things', en: 'things' },
    { role: 'see', vi: 'nhanh — từ dùng để tả người/vật = quick', en: 'quick' },
    { role: 'see', vi: 'nhanh — từ dùng để nói cách một hành động xảy ra = quickly', en: 'quickly' },
    { role: 'recall', vi: 'Từ nào đã luyện dùng để nói cách hành động “học” xảy ra?', en: 'quickly' },
    { role: 'bridge', vi: 'he + learn → ?', en: 'learns' },
    { role: 'final', vi: 'Bạn ấy học những điều nhanh.', en: 'He learns things quickly.' }
  ]),
  '17': spec('g5u3-wr-t17', [
    { role: 'see', vi: 'Bối cảnh: Em muốn hỏi một bạn nữ có năng động không. Đây là câu hỏi về một đặc điểm, không phải câu hỏi về một hành động như “sống”.\n\nbạn ấy, nữ = she', en: 'she' },
    { role: 'see', vi: 'năng động = active', en: 'active' },
    { role: 'chunk', vi: 'she + is', en: 'she is' },
    { role: 'bridge', vi: 'she is → khi đổi thành câu hỏi với BE', en: 'is she' },
    { role: 'see', vi: 'Trong bài này, active đi với BE. Gõ lại BE dùng với she.', en: 'is' },
    { role: 'final', vi: 'Bạn ấy có năng động không?', en: 'Is she active?' }
  ]),
  '18': spec('g5u3-wr-t18', [
    { role: 'see', vi: 'Bối cảnh: Một bạn vừa hỏi “Bạn ấy có năng động không?”. Đây là câu hỏi dùng BE. Em cần trả lời ngắn là Có.\n\ncó / vâng = yes', en: 'yes' },
    { role: 'see', vi: 'bạn ấy, nữ = she', en: 'she' },
    { role: 'see', vi: 'BE dùng trong câu hỏi này = is', en: 'is' },
    { role: 'recall', vi: 'Câu hỏi đặc điểm dùng BE, vì vậy từ lặp lại trong short answer là?', en: 'is' },
    { role: 'final', vi: 'Hãy trả lời ngắn “Có” cho câu hỏi ở trên.', en: 'Yes, she is.' }
  ])
});

export const g5U3WritingTypingContents = buildG5U3LessonMap(g5U3WritingSource, SPECS);

const qbItems = [
  ['see', 'Úc — tên nước = Australia · Gõ lại.', 'Australia'],
  ['see', 'người Úc / quốc tịch Úc = Australian · Gõ lại.', 'Australian'],
  ['see', 'Malaysia — tên nước = Malaysia · Gõ lại.', 'Malaysia'],
  ['see', 'người Malaysia = Malaysian · Gõ lại.', 'Malaysian'],
  ['see', 'Mỹ — tên nước = America · Gõ lại.', 'America'],
  ['see', 'người Mỹ = American · Gõ lại.', 'American'],
  ['see', 'Nhật Bản — tên nước = Japan · Gõ lại.', 'Japan'],
  ['see', 'người Nhật = Japanese · Gõ lại.', 'Japanese'],
  ['see', 'Anh — tên nước = Britain · Gõ lại.', 'Britain'],
  ['see', 'người Anh = British · Gõ lại.', 'British'],
  ['recall', 'nước Úc', 'Australia'],
  ['recall', 'người Úc', 'Australian'],
  ['recall', 'Nhật Bản', 'Japan'],
  ['recall', 'người Nhật', 'Japanese']
].map(([role, vi, en], index, all) => Object.freeze({
  id: `g5u3-wr-qb-q${String(index + 1).padStart(2, '0')}`,
  stage: 'phrase',
  scaffoldRole: role,
  vi,
  en,
  buildsFrom: Object.freeze(all.slice(0, index).map((_, previousIndex) => `g5u3-wr-qb-q${String(previousIndex + 1).padStart(2, '0')}`))
}));

export const g5U3QuickBankContent = Object.freeze({
  items: Object.freeze(qbItems)
});

export function getG5U3WritingTypingContent(key) {
  if (String(key).toLowerCase() === 'qb') return g5U3QuickBankContent;
  const content = g5U3WritingTypingContents[String(key).padStart(2, '0')];
  if (!content) throw new Error(`Unknown G5 U3 Writing Typing lesson: ${key}`);
  return content;
}
