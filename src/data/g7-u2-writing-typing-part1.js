import { buildG7U2LessonMap } from './g7-u2-writing-typing-builder.js';
import { g7U2WritingSource } from './g7-u2-writing-source.js';

const SPECS = Object.freeze({
  '01': Object.freeze({
    targetSentenceId: 'g7u2-wr-t01',
    steps: Object.freeze([
      Object.freeze({ role: "chunk", vi: "thói quen lành mạnh", en: "healthy habits" }),
      Object.freeze({ role: "chunk", vi: "giữ khỏe", en: "keep fit" }),
      Object.freeze({ role: "chunk", vi: "tránh bệnh tật", en: "avoid disease" }),
      Object.freeze({ role: "chunk", vi: "giữ khỏe và tránh bệnh tật", en: "keep fit and avoid disease" }),
      Object.freeze({ role: "chunk", vi: "giúp chúng ta giữ khỏe", en: "help us keep fit" }),
      Object.freeze({ role: "sentence_part", vi: "những thói quen lành mạnh giúp chúng ta", en: "healthy habits help us" }),
      Object.freeze({ role: "final", vi: "Những thói quen lành mạnh giúp chúng ta giữ khỏe và tránh bệnh tật.", en: "Healthy habits help us keep fit and avoid disease." })
    ])
  }),
  '02': Object.freeze({
    targetSentenceId: 'g7u2-wr-t02',
    steps: Object.freeze([
      Object.freeze({ role: "chunk", vi: "các hoạt động ngoài trời", en: "outdoor activities" }),
      Object.freeze({ role: "chunk", vi: "sức khỏe của chúng ta", en: "our health" }),
      Object.freeze({ role: "chunk", vi: "tốt cho sức khỏe của chúng ta", en: "good for our health" }),
      Object.freeze({ role: "sentence_part", vi: "các hoạt động ngoài trời thì tốt", en: "outdoor activities are good" }),
      Object.freeze({ role: "final", vi: "Các hoạt động ngoài trời tốt cho sức khỏe của chúng ta.", en: "Outdoor activities are good for our health." })
    ])
  }),
  '03': Object.freeze({
    targetSentenceId: 'g7u2-wr-t03',
    steps: Object.freeze([
      Object.freeze({ role: "chunk", vi: "gia đình của tôi", en: "my family" }),
      Object.freeze({ role: "word", vi: "thường", en: "often" }),
      Object.freeze({ role: "chunk", vi: "ở vùng nông thôn", en: "in the countryside" }),
      Object.freeze({ role: "chunk", vi: "thường đi đạp xe — sau chủ ngữ “my family”", en: "often goes cycling" }),
      Object.freeze({ role: "final", vi: "Gia đình tôi thường đi đạp xe ở vùng nông thôn.", en: "My family often goes cycling in the countryside." })
    ])
  }),
  '04': Object.freeze({
    targetSentenceId: 'g7u2-wr-t04',
    steps: Object.freeze([
      Object.freeze({ role: "word", vi: "năng động", en: "active" }),
      Object.freeze({ role: "chunk", vi: "việc năng động", en: "being active" }),
      Object.freeze({ role: "chunk", vi: "giữ cho bạn khỏe", en: "keep you fit" }),
      Object.freeze({ role: "chunk", vi: "giúp giữ cho bạn khỏe — sau “Being active”", en: "helps keep you fit" }),
      Object.freeze({ role: "final", vi: "Việc năng động giúp giữ cho bạn khỏe.", en: "Being active helps keep you fit." })
    ])
  })
});

export const g7U2WritingPart1 = buildG7U2LessonMap(g7U2WritingSource, SPECS);
