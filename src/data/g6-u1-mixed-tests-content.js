import { test01 } from './g6-u1-mixed-test-01.js';
import { test02 } from './g6-u1-mixed-test-02.js';
import { test03 } from './g6-u1-mixed-test-03.js';
import { test04 } from './g6-u1-mixed-test-04.js';

const contents = Object.freeze({
  'g6-u01-mixed-test-01': test01,
  'g6-u01-mixed-test-02': test02,
  'g6-u01-mixed-test-03': test03,
  'g6-u01-mixed-test-04': test04
});

export function getG6U1MixedTestContent(id) {
  const content = contents[id];
  if (!content) throw new Error(`Không tìm thấy GS6 Unit 1 mixed test: ${id}`);
  return content;
}
