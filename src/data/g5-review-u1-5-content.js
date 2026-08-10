import { g5ReviewU15Part01 } from './g5-review-u1-5-part01.js';
import { g5ReviewU15Part02 } from './g5-review-u1-5-part02.js';
import { g5ReviewU15Part03 } from './g5-review-u1-5-part03.js';
import { g5ReviewU15Part04 } from './g5-review-u1-5-part04.js';
import { g5ReviewU15Part05 } from './g5-review-u1-5-part05.js';
import { g5ReviewU15Part06 } from './g5-review-u1-5-part06.js';
import { g5ReviewU15Part07 } from './g5-review-u1-5-part07.js';
import { g5ReviewU15Part08 } from './g5-review-u1-5-part08.js';
import { g5ReviewU15Part09 } from './g5-review-u1-5-part09.js';
import { g5ReviewU15Part10 } from './g5-review-u1-5-part10.js';

export const g5ReviewU15MixedContents = Object.freeze({
  ...g5ReviewU15Part01,
  ...g5ReviewU15Part02,
  ...g5ReviewU15Part03,
  ...g5ReviewU15Part04,
  ...g5ReviewU15Part05,
  ...g5ReviewU15Part06,
  ...g5ReviewU15Part07,
  ...g5ReviewU15Part08,
  ...g5ReviewU15Part09,
  ...g5ReviewU15Part10
});

export function getG5ReviewU15MixedContent(key) {
  const content = g5ReviewU15MixedContents[String(key)];
  if (!content) throw new Error(`Không tìm thấy Global Success 5 Review Unit 1–5 Mixed Grammar Traps content: ${key}`);
  return content;
}
