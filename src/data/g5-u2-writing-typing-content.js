import { buildG5U2LessonMap } from './g5-u2-writing-typing-builder.js';
import { g5U2WritingSource } from './g5-u2-writing-source.js';

const freezeSteps = steps => Object.freeze(steps.map(step => Object.freeze(step)));
const spec = (targetSentenceId, steps) => Object.freeze({ targetSentenceId, steps: freezeSteps(steps) });

const SPECS = Object.freeze({
  '01': spec('g5u2-wr-t01', [
    { role: 'see', vi: 'bạn = you · Nhìn và gõ lại.', en: 'you' },
    { role: 'see', vi: 'sống = live · Nhìn và gõ lại.', en: 'live' },
    { role: 'see', vi: 'ngôi nhà = house · Nhìn và gõ lại.', en: 'house' },
    { role: 'see', vi: 'ngôi nhà này = this house · Nhìn và gõ lại.', en: 'this house' },
    { role: 'chunk', vi: 'ở ngôi nhà này', en: 'in this house' },
    { role: 'build', vi: 'sống ở ngôi nhà này', en: 'live in this house' },
    { role: 'build', vi: 'bạn sống ở ngôi nhà này', en: 'you live in this house' },
    { role: 'bridge', vi: 'Câu hỏi hiện tại với you + live dùng Do.', en: 'Do you live in this house' },
    { role: 'final', vi: 'Bạn có sống trong ngôi nhà này không?', en: 'Do you live in this house?' }
  ]),
  '02': spec('g5u2-wr-t02', [
    { role: 'see', vi: 'bạn = you · Nhìn và gõ lại.', en: 'you' },
    { role: 'see', vi: 'sống = live · Nhìn và gõ lại.', en: 'live' },
    { role: 'see', vi: 'căn hộ = flat · Nhìn và gõ lại.', en: 'flat' },
    { role: 'see', vi: 'căn hộ này = this flat · Nhìn và gõ lại.', en: 'this flat' },
    { role: 'chunk', vi: 'ở căn hộ này', en: 'in this flat' },
    { role: 'build', vi: 'sống ở căn hộ này', en: 'live in this flat' },
    { role: 'build', vi: 'bạn sống ở căn hộ này', en: 'you live in this flat' },
    { role: 'bridge', vi: 'Câu hỏi Yes/No dùng Do.', en: 'Do you live in this flat' },
    { role: 'final', vi: 'Bạn có sống trong căn hộ này không?', en: 'Do you live in this flat?' }
  ]),
  '03': spec('g5u2-wr-t03', [
    { role: 'see', vi: 'bạn = you · Nhìn và gõ lại.', en: 'you' },
    { role: 'see', vi: 'sống = live · Nhìn và gõ lại.', en: 'live' },
    { role: 'see', vi: 'tòa nhà = building · Nhìn và gõ lại.', en: 'building' },
    { role: 'see', vi: 'kia/đó = that · Nhìn và gõ lại.', en: 'that' },
    { role: 'chunk', vi: 'tòa nhà kia', en: 'that building' },
    { role: 'chunk', vi: 'ở tòa nhà kia', en: 'in that building' },
    { role: 'build', vi: 'bạn sống ở tòa nhà kia', en: 'you live in that building' },
    { role: 'bridge', vi: 'Do + you + live ...?', en: 'Do you live in that building' },
    { role: 'final', vi: 'Bạn có sống trong tòa nhà kia không?', en: 'Do you live in that building?' }
  ]),
  '04': spec('g5u2-wr-t04', [
    { role: 'see', vi: 'bạn = you · Nhìn và gõ lại.', en: 'you' },
    { role: 'see', vi: 'sống = live · Nhìn và gõ lại.', en: 'live' },
    { role: 'see', vi: 'tòa tháp = tower · Nhìn và gõ lại.', en: 'tower' },
    { role: 'see', vi: 'tòa tháp kia = that tower · Nhìn và gõ lại.', en: 'that tower' },
    { role: 'chunk', vi: 'ở tòa tháp kia', en: 'in that tower' },
    { role: 'build', vi: 'sống ở tòa tháp kia', en: 'live in that tower' },
    { role: 'build', vi: 'bạn sống ở tòa tháp kia', en: 'you live in that tower' },
    { role: 'bridge', vi: 'Do + you + live ...?', en: 'Do you live in that tower' },
    { role: 'final', vi: 'Bạn có sống trong tòa tháp kia không?', en: 'Do you live in that tower?' }
  ]),
  '05': spec('g5u2-wr-t05', [
    { role: 'see', vi: 'vâng/có = yes · Nhìn và gõ lại.', en: 'yes' },
    { role: 'see', vi: 'tôi = I · Nhìn và gõ lại.', en: 'I' },
    { role: 'see', vi: 'do = từ dùng lại trong câu trả lời ngắn cho Do you...? · Nhìn và gõ lại.', en: 'do' },
    { role: 'chunk', vi: 'tôi có', en: 'I do' },
    { role: 'bridge', vi: 'Do you ...? → trả lời Có', en: 'Yes, I do' },
    { role: 'final', vi: 'Vâng, tôi có.', en: 'Yes, I do.' }
  ]),
  '06': spec('g5u2-wr-t06', [
    { role: 'see', vi: 'không = no · Nhìn và gõ lại.', en: 'no' },
    { role: 'see', vi: 'tôi = I · Nhìn và gõ lại.', en: 'I' },
    { role: 'see', vi: 'do not · Nhìn và gõ lại.', en: 'do not' },
    { role: 'bridge', vi: "do not viết tắt = don't · Nhìn và gõ lại.", en: "don't" },
    { role: 'chunk', vi: 'tôi không', en: "I don't" },
    { role: 'build', vi: "No + I don't", en: "No, I don't" },
    { role: 'final', vi: 'Không, tôi không.', en: "No, I don't." }
  ]),
  '07': spec('g5u2-wr-t07', [
    { role: 'see', vi: 'tôi = I · Nhìn và gõ lại.', en: 'I' },
    { role: 'see', vi: 'sống = live · Nhìn và gõ lại.', en: 'live' },
    { role: 'see', vi: 'căn hộ = flat · Nhìn và gõ lại.', en: 'flat' },
    { role: 'see', vi: 'căn hộ kia = that flat · Nhìn và gõ lại.', en: 'that flat' },
    { role: 'chunk', vi: 'ở căn hộ kia', en: 'in that flat' },
    { role: 'build', vi: 'sống ở căn hộ kia', en: 'live in that flat' },
    { role: 'final', vi: 'Tôi sống trong căn hộ kia.', en: 'I live in that flat.' }
  ]),
  '08': spec('g5u2-wr-t08', [
    { role: 'see', vi: 'ở đâu = where · Nhìn và gõ lại.', en: 'where' },
    { role: 'see', vi: 'bạn = you · Nhìn và gõ lại.', en: 'you' },
    { role: 'see', vi: 'sống = live · Nhìn và gõ lại.', en: 'live' },
    { role: 'chunk', vi: 'bạn sống', en: 'you live' },
    { role: 'bridge', vi: 'Câu hỏi hiện tại với you + live cần do.', en: 'do' },
    { role: 'build', vi: 'do + you + live', en: 'do you live' },
    { role: 'build', vi: 'where + do you live', en: 'Where do you live' },
    { role: 'final', vi: 'Bạn sống ở đâu?', en: 'Where do you live?' }
  ]),
  '09': spec('g5u2-wr-t09', [
    { role: 'see', vi: 'tôi = I · Nhìn và gõ lại.', en: 'I' },
    { role: 'see', vi: 'sống = live · Nhìn và gõ lại.', en: 'live' },
    { role: 'see', vi: 'một ngôi nhà = a house · Nhìn và gõ lại cả cụm.', en: 'a house' },
    { role: 'see', vi: 'gần = near · Nhìn và gõ lại.', en: 'near' },
    { role: 'see', vi: 'ở đây = here · Nhìn và gõ lại.', en: 'here' },
    { role: 'chunk', vi: 'gần đây', en: 'near here' },
    { role: 'chunk', vi: 'trong một ngôi nhà', en: 'in a house' },
    { role: 'build', vi: 'một ngôi nhà gần đây', en: 'a house near here' },
    { role: 'build', vi: 'sống trong một ngôi nhà gần đây', en: 'live in a house near here' },
    { role: 'final', vi: 'Tôi sống trong một ngôi nhà gần đây.', en: 'I live in a house near here.' }
  ]),
  '10': spec('g5u2-wr-t10', [
    { role: 'see', vi: 'tôi = I · Nhìn và gõ lại.', en: 'I' },
    { role: 'see', vi: 'sống = live · Nhìn và gõ lại.', en: 'live' },
    { role: 'see', vi: 'một căn hộ = a flat · Nhìn và gõ lại cả cụm.', en: 'a flat' },
    { role: 'see', vi: 'gần đây = near here · Nhìn và gõ lại cả cụm.', en: 'near here' },
    { role: 'chunk', vi: 'trong một căn hộ', en: 'in a flat' },
    { role: 'build', vi: 'một căn hộ gần đây', en: 'a flat near here' },
    { role: 'build', vi: 'sống trong một căn hộ gần đây', en: 'live in a flat near here' },
    { role: 'final', vi: 'Tôi sống trong một căn hộ gần đây.', en: 'I live in a flat near here.' }
  ]),
  '11': spec('g5u2-wr-t11', [
    { role: 'see', vi: 'bạn = you · Nhìn và gõ lại.', en: 'you' },
    { role: 'see', vi: 'sống = live · Nhìn và gõ lại.', en: 'live' },
    { role: 'see', vi: 'ngôi trường = the school · Nhìn và gõ lại cả cụm.', en: 'the school' },
    { role: 'see', vi: 'gần = near · Nhìn và gõ lại.', en: 'near' },
    { role: 'chunk', vi: 'gần trường', en: 'near the school' },
    { role: 'build', vi: 'sống gần trường', en: 'live near the school' },
    { role: 'build', vi: 'bạn sống gần trường', en: 'you live near the school' },
    { role: 'bridge', vi: 'Câu hỏi Yes/No dùng Do.', en: 'Do you live near the school' },
    { role: 'final', vi: 'Bạn có sống gần trường không?', en: 'Do you live near the school?' }
  ]),
  '12': spec('g5u2-wr-t12', [
    { role: 'see', vi: 'tôi = I · Nhìn và gõ lại.', en: 'I' },
    { role: 'see', vi: 'sống = live · Nhìn và gõ lại.', en: 'live' },
    { role: 'see', vi: 'khoảng = about · Nhìn và gõ lại.', en: 'about' },
    { role: 'see', vi: '1 ki-lô-mét = 1 kilometre · Nhìn và gõ lại.', en: '1 kilometre' },
    { role: 'see', vi: 'từ = from · Nhìn và gõ lại.', en: 'from' },
    { role: 'see', vi: 'ở đây = here · Nhìn và gõ lại.', en: 'here' },
    { role: 'chunk', vi: 'từ đây', en: 'from here' },
    { role: 'chunk', vi: 'khoảng 1 ki-lô-mét', en: 'about 1 kilometre' },
    { role: 'build', vi: 'khoảng 1 ki-lô-mét từ đây', en: 'about 1 kilometre from here' },
    { role: 'build', vi: 'sống cách đây khoảng 1 ki-lô-mét', en: 'live about 1 kilometre from here' },
    { role: 'final', vi: 'Tôi sống cách đây khoảng 1 ki-lô-mét.', en: 'I live about 1 kilometre from here.' }
  ]),
  '13': spec('g5u2-wr-t13', [
    { role: 'see', vi: 'địa chỉ = address · Nhìn và gõ lại.', en: 'address' },
    { role: 'see', vi: 'của bạn = your · Nhìn và gõ lại.', en: 'your' },
    { role: 'chunk', vi: 'địa chỉ của bạn', en: 'your address' },
    { role: 'see', vi: 'What is · Nhìn và gõ lại.', en: 'What is' },
    { role: 'bridge', vi: "What is viết tắt = What's · Nhìn và gõ lại.", en: "What's" },
    { role: 'build', vi: "What's + địa chỉ của bạn", en: "What's your address" },
    { role: 'final', vi: 'Địa chỉ của bạn là gì?', en: "What's your address?" }
  ]),
  '14': spec('g5u2-wr-t14', [
    { role: 'see', vi: 'Oxford Street · Nhìn và gõ lại.', en: 'Oxford Street' },
    { role: 'see', vi: '93 · Nhìn và gõ lại.', en: '93' },
    { role: 'chunk', vi: '93 Oxford Street', en: '93 Oxford Street' },
    { role: 'see', vi: 'It is · Nhìn và gõ lại.', en: 'It is' },
    { role: 'bridge', vi: "It is viết tắt = It's · Nhìn và gõ lại.", en: "It's" },
    { role: 'build', vi: "It's + 93 Oxford Street", en: "It's 93 Oxford Street" },
    { role: 'final', vi: 'Địa chỉ là 93 Oxford Street.', en: "It's 93 Oxford Street." }
  ]),
  '15': spec('g5u2-wr-t15', [
    { role: 'see', vi: 'tôi = I · Nhìn và gõ lại.', en: 'I' },
    { role: 'see', vi: 'sống = live · Nhìn và gõ lại.', en: 'live' },
    { role: 'see', vi: 'Ba Dinh Street · Nhìn và gõ lại.', en: 'Ba Dinh Street' },
    { role: 'see', vi: '15 Ba Dinh Street · Nhìn và gõ lại.', en: '15 Ba Dinh Street' },
    { role: 'see', vi: 'tại/ở địa chỉ cụ thể = at · Nhìn và gõ lại.', en: 'at' },
    { role: 'chunk', vi: 'tại 15 Ba Dinh Street', en: 'at 15 Ba Dinh Street' },
    { role: 'build', vi: 'sống tại 15 Ba Dinh Street', en: 'live at 15 Ba Dinh Street' },
    { role: 'final', vi: 'Tôi sống tại 15 Ba Dinh Street.', en: 'I live at 15 Ba Dinh Street.' }
  ]),
  '16': spec('g5u2-wr-t16', [
    { role: 'see', vi: 'cô ấy = she · Nhìn và gõ lại.', en: 'she' },
    { role: 'see', vi: 'sống = live · Nhìn và gõ lại.', en: 'live' },
    { role: 'bridge', vi: 'I live / you live / she lives · Gõ dạng đi với she.', en: 'lives' },
    { role: 'see', vi: 'London Street · Nhìn và gõ lại.', en: 'London Street' },
    { role: 'see', vi: '16 London Street · Nhìn và gõ lại.', en: '16 London Street' },
    { role: 'see', vi: 'tại địa chỉ cụ thể = at · Nhìn và gõ lại.', en: 'at' },
    { role: 'chunk', vi: 'tại 16 London Street', en: 'at 16 London Street' },
    { role: 'build', vi: 'cô ấy sống tại 16 London Street', en: 'She lives at 16 London Street' },
    { role: 'final', vi: 'Cô ấy sống tại 16 London Street.', en: 'She lives at 16 London Street.' }
  ])
});

export const g5U2WritingTypingContents = buildG5U2LessonMap(g5U2WritingSource, SPECS);

export function getG5U2WritingTypingContent(key) {
  const content = g5U2WritingTypingContents[String(key).padStart(2, '0')];
  if (!content) throw new Error(`Unknown G5 U2 Writing Typing lesson: ${key}`);
  return content;
}
