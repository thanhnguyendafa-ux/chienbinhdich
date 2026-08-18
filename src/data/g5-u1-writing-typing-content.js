import { buildG5U1LessonMap } from './g5-u1-writing-typing-builder.js';
import { g5U1WritingSource } from './g5-u1-writing-source.js';

const freezeSteps = steps => Object.freeze(steps.map(step => Object.freeze(step)));
const spec = (targetSentenceId, steps) => Object.freeze({ targetSentenceId, steps: freezeSteps(steps) });

const SPECS = Object.freeze({
  '01': spec('g5u1-wr-t01', [
    { role: 'see', vi: 'có thể = can · Nhìn và gõ lại.', en: 'can' },
    { role: 'see', vi: 'bạn = you · Nhìn và gõ lại.', en: 'you' },
    { role: 'see', vi: 'bạn có thể = can you · Nhìn và gõ lại.', en: 'can you' },
    { role: 'see', vi: 'nói/kể cho tôi = tell me · Nhìn và gõ lại.', en: 'tell me' },
    { role: 'see', vi: 'về bản thân bạn = about yourself · Nhìn và gõ lại.', en: 'about yourself' },
    { role: 'recall', vi: 'bạn có thể', en: 'can you' },
    { role: 'chunk', vi: 'nói cho tôi về bản thân bạn', en: 'tell me about yourself' },
    { role: 'build', vi: 'Bạn có thể nói cho tôi ...', en: 'Can you tell me' },
    { role: 'final', vi: 'Bạn có thể nói cho tôi về bản thân bạn không?', en: 'Can you tell me about yourself?' }
  ]),
  '02': spec('g5u1-wr-t02', [
    { role: 'see', vi: 'tôi = I · Nhìn và gõ lại.', en: 'I' },
    { role: 'see', vi: 'sống = live · Nhìn và gõ lại.', en: 'live' },
    { role: 'see', vi: 'ở vùng nông thôn = in the countryside · Nhìn và gõ lại cả cụm.', en: 'in the countryside' },
    { role: 'recall', vi: 'sống', en: 'live' },
    { role: 'chunk', vi: 'ở vùng nông thôn', en: 'in the countryside' },
    { role: 'build', vi: 'sống ở vùng nông thôn', en: 'live in the countryside' },
    { role: 'final', vi: 'Tôi sống ở vùng nông thôn.', en: 'I live in the countryside.' }
  ]),
  '03': spec('g5u1-wr-t03', [
    { role: 'see', vi: 'yêu thích = favourite · Nhìn và gõ lại.', en: 'favourite' },
    { role: 'see', vi: 'màu sắc = colour · Nhìn và gõ lại.', en: 'colour' },
    { role: 'see', vi: 'của bạn = your · Nhìn và gõ lại.', en: 'your' },
    { role: 'chunk', vi: 'màu sắc yêu thích', en: 'favourite colour' },
    { role: 'chunk', vi: 'màu sắc yêu thích của bạn', en: 'your favourite colour' },
    { role: 'see', vi: "What is viết tắt = What's · Nhìn và gõ lại.", en: "What's" },
    { role: 'build', vi: "What's + màu sắc yêu thích của bạn", en: "What's your favourite colour" },
    { role: 'final', vi: 'Màu sắc yêu thích của bạn là gì?', en: "What's your favourite colour?" }
  ]),
  '04': spec('g5u1-wr-t04', [
    { role: 'see', vi: 'tôi = I · Nhìn và gõ lại.', en: 'I' },
    { role: 'see', vi: 'rất thích/yêu thích = love · Nhìn và gõ lại.', en: 'love' },
    { role: 'see', vi: 'chơi = play · Nhìn và gõ lại.', en: 'play' },
    { role: 'see', vi: 'bóng bàn = table tennis · Nhìn và gõ lại.', en: 'table tennis' },
    { role: 'bridge', vi: 'chơi, khi đứng sau love = playing · Nhìn và gõ lại.', en: 'playing' },
    { role: 'chunk', vi: 'chơi bóng bàn, sau love', en: 'playing table tennis' },
    { role: 'build', vi: 'Tôi rất thích', en: 'I love' },
    { role: 'final', vi: 'Tôi rất thích chơi bóng bàn.', en: 'I love playing table tennis.' }
  ]),
  '05': spec('g5u1-wr-t05', [
    { role: 'see', vi: 'tôi = I · Nhìn và gõ lại.', en: 'I' },
    { role: 'see', vi: 'am = dạng be đi với I · Nhìn và gõ lại.', en: 'am' },
    { role: 'see', vi: 'lớp 5A = Class 5A · Nhìn và gõ lại.', en: 'Class 5A' },
    { role: 'see', vi: 'ở lớp 5A = in Class 5A · Nhìn và gõ lại.', en: 'in Class 5A' },
    { role: 'build', vi: 'I am', en: 'I am' },
    { role: 'see', vi: "I am viết tắt = I'm · Nhìn và gõ lại.", en: "I'm" },
    { role: 'chunk', vi: 'ở lớp 5A', en: 'in Class 5A' },
    { role: 'final', vi: 'Tôi học lớp 5A.', en: "I'm in Class 5A." }
  ]),
  '06': spec('g5u1-wr-t06', [
    { role: 'see', vi: 'tôi = I · Nhìn và gõ lại.', en: 'I' },
    { role: 'see', vi: 'sống = live · Nhìn và gõ lại.', en: 'live' },
    { role: 'see', vi: 'ở thành phố = in the city · Nhìn và gõ lại cả cụm.', en: 'in the city' },
    { role: 'recall', vi: 'sống', en: 'live' },
    { role: 'chunk', vi: 'ở thành phố', en: 'in the city' },
    { role: 'build', vi: 'sống ở thành phố', en: 'live in the city' },
    { role: 'final', vi: 'Tôi sống ở thành phố.', en: 'I live in the city.' }
  ]),
  '07': spec('g5u1-wr-t07', [
    { role: 'see', vi: 'yêu thích = favourite · Nhìn và gõ lại.', en: 'favourite' },
    { role: 'see', vi: 'môn thể thao = sport · Nhìn và gõ lại.', en: 'sport' },
    { role: 'see', vi: 'của bạn = your · Nhìn và gõ lại.', en: 'your' },
    { role: 'chunk', vi: 'môn thể thao yêu thích', en: 'favourite sport' },
    { role: 'chunk', vi: 'môn thể thao yêu thích của bạn', en: 'your favourite sport' },
    { role: 'see', vi: "What is viết tắt = What's · Nhìn và gõ lại.", en: "What's" },
    { role: 'build', vi: "What's + môn thể thao yêu thích của bạn", en: "What's your favourite sport" },
    { role: 'final', vi: 'Môn thể thao yêu thích của bạn là gì?', en: "What's your favourite sport?" }
  ]),
  '08': spec('g5u1-wr-t08', [
    { role: 'see', vi: 'của tôi = my · Nhìn và gõ lại.', en: 'my' },
    { role: 'see', vi: 'môn thể thao yêu thích = favourite sport · Nhìn và gõ lại.', en: 'favourite sport' },
    { role: 'see', vi: 'là = is · Nhìn và gõ lại.', en: 'is' },
    { role: 'see', vi: 'bóng đá = football · Nhìn và gõ lại.', en: 'football' },
    { role: 'chunk', vi: 'môn thể thao yêu thích của tôi', en: 'my favourite sport' },
    { role: 'chunk', vi: 'là bóng đá', en: 'is football' },
    { role: 'build', vi: 'Môn thể thao yêu thích của tôi là ...', en: 'My favourite sport is' },
    { role: 'final', vi: 'Môn thể thao yêu thích của tôi là bóng đá.', en: 'My favourite sport is football.' }
  ]),
  '09': spec('g5u1-wr-t09', [
    { role: 'see', vi: 'yêu thích = favourite · Nhìn và gõ lại.', en: 'favourite' },
    { role: 'see', vi: 'món ăn/thức ăn = food · Nhìn và gõ lại.', en: 'food' },
    { role: 'see', vi: 'của bạn = your · Nhìn và gõ lại.', en: 'your' },
    { role: 'chunk', vi: 'món ăn yêu thích', en: 'favourite food' },
    { role: 'chunk', vi: 'món ăn yêu thích của bạn', en: 'your favourite food' },
    { role: 'see', vi: "What is viết tắt = What's · Nhìn và gõ lại.", en: "What's" },
    { role: 'build', vi: "What's + món ăn yêu thích của bạn", en: "What's your favourite food" },
    { role: 'final', vi: 'Món ăn yêu thích của bạn là gì?', en: "What's your favourite food?" }
  ]),
  '10': spec('g5u1-wr-t10', [
    { role: 'see', vi: 'của tôi = my · Nhìn và gõ lại.', en: 'my' },
    { role: 'see', vi: 'món ăn yêu thích = favourite food · Nhìn và gõ lại.', en: 'favourite food' },
    { role: 'see', vi: 'là = is · Nhìn và gõ lại.', en: 'is' },
    { role: 'see', vi: 'một chiếc bánh sandwich = a sandwich · Nhìn và gõ lại cả cụm.', en: 'a sandwich' },
    { role: 'chunk', vi: 'món ăn yêu thích của tôi', en: 'my favourite food' },
    { role: 'chunk', vi: 'là một chiếc bánh sandwich', en: 'is a sandwich' },
    { role: 'build', vi: 'Món ăn yêu thích của tôi là ...', en: 'My favourite food is' },
    { role: 'final', vi: 'Món ăn yêu thích của tôi là một chiếc bánh sandwich.', en: 'My favourite food is a sandwich.' }
  ]),
  '11': spec('g5u1-wr-t11', [
    { role: 'see', vi: 'yêu thích = favourite · Nhìn và gõ lại.', en: 'favourite' },
    { role: 'see', vi: 'con vật/động vật = animal · Nhìn và gõ lại.', en: 'animal' },
    { role: 'see', vi: 'của bạn = your · Nhìn và gõ lại.', en: 'your' },
    { role: 'chunk', vi: 'con vật yêu thích', en: 'favourite animal' },
    { role: 'chunk', vi: 'con vật yêu thích của bạn', en: 'your favourite animal' },
    { role: 'see', vi: "What is viết tắt = What's · Nhìn và gõ lại.", en: "What's" },
    { role: 'build', vi: "What's + con vật yêu thích của bạn", en: "What's your favourite animal" },
    { role: 'final', vi: 'Con vật yêu thích của bạn là gì?', en: "What's your favourite animal?" }
  ]),
  '12': spec('g5u1-wr-t12', [
    { role: 'see', vi: 'của tôi = my · Nhìn và gõ lại.', en: 'my' },
    { role: 'see', vi: 'con vật yêu thích = favourite animal · Nhìn và gõ lại.', en: 'favourite animal' },
    { role: 'see', vi: 'là = is · Nhìn và gõ lại.', en: 'is' },
    { role: 'see', vi: 'một con cá heo = a dolphin · Nhìn và gõ lại cả cụm.', en: 'a dolphin' },
    { role: 'chunk', vi: 'con vật yêu thích của tôi', en: 'my favourite animal' },
    { role: 'chunk', vi: 'là một con cá heo', en: 'is a dolphin' },
    { role: 'build', vi: 'Con vật yêu thích của tôi là ...', en: 'My favourite animal is' },
    { role: 'final', vi: 'Con vật yêu thích của tôi là một con cá heo.', en: 'My favourite animal is a dolphin.' }
  ]),
  '13': spec('g5u1-wr-t13', [
    { role: 'see', vi: 'tôi = I · Nhìn và gõ lại.', en: 'I' },
    { role: 'see', vi: 'thích = like · Nhìn và gõ lại.', en: 'like' },
    { role: 'see', vi: 'chơi = play · Nhìn và gõ lại.', en: 'play' },
    { role: 'see', vi: 'bóng rổ = basketball · Nhìn và gõ lại.', en: 'basketball' },
    { role: 'bridge', vi: 'chơi, khi đứng sau like = playing · Nhìn và gõ lại.', en: 'playing' },
    { role: 'chunk', vi: 'chơi bóng rổ, sau like', en: 'playing basketball' },
    { role: 'build', vi: 'Tôi thích', en: 'I like' },
    { role: 'final', vi: 'Tôi thích chơi bóng rổ.', en: 'I like playing basketball.' }
  ]),
  '14': spec('g5u1-wr-t14', [
    { role: 'see', vi: 'của tôi = my · Nhìn và gõ lại.', en: 'my' },
    { role: 'see', vi: 'màu sắc yêu thích = favourite colour · Nhìn và gõ lại.', en: 'favourite colour' },
    { role: 'see', vi: 'là = is · Nhìn và gõ lại.', en: 'is' },
    { role: 'see', vi: 'màu xanh lá = green · Nhìn và gõ lại.', en: 'green' },
    { role: 'chunk', vi: 'màu sắc yêu thích của tôi', en: 'my favourite colour' },
    { role: 'chunk', vi: 'là màu xanh lá', en: 'is green' },
    { role: 'build', vi: 'Màu sắc yêu thích của tôi là ...', en: 'My favourite colour is' },
    { role: 'final', vi: 'Màu sắc yêu thích của tôi là màu xanh lá.', en: 'My favourite colour is green.' }
  ])
});

export const g5U1WritingTypingContents = buildG5U1LessonMap(g5U1WritingSource, SPECS);

export function getG5U1WritingTypingContent(key) {
  const content = g5U1WritingTypingContents[String(key).padStart(2, '0')];
  if (!content) throw new Error(`Unknown G5 U1 Writing Typing lesson: ${key}`);
  return content;
}
