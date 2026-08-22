import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';

const global7Unit1Set1 = await loadLessonSet('g7-u1-s1');

test('Global 7 Unit 1 Set 1 dependency order is valid', () => {
  assert.deepEqual(validateSet(global7Unit1Set1), []);
  assert.equal(global7Unit1Set1.items.length, 16);
  assert.deepEqual(global7Unit1Set1.items.map(item => item.stage), [
    ...Array(7).fill('word'),
    ...Array(6).fill('phrase'),
    ...Array(3).fill('sentence')
  ]);
});

test('generic Typing can omit stage and provide complete custom UI metadata', () => {
  const set = {
    id: 'generic-typing-ui',
    passThreshold: 80,
    items: [{
      id: 'typing-left',
      type: 'typing',
      vi: 'The library user checks the shelf mark.',
      en: 'The library user',
      typingUi: {
        promptLabel: 'Gõ phần TRÁI / SUBJECT',
        contextLabel: 'Câu',
        instruction: 'Gõ phần TRÁI / SUBJECT.',
        inputLabel: 'Phần TRÁI / SUBJECT',
        placeholder: 'Gõ phần TRÁI...'
      }
    }]
  };
  assert.deepEqual(validateSet(set), []);

  const invalid = structuredClone(set);
  invalid.items[0].typingUi.placeholder = '';
  assert.ok(validateSet(invalid).some(error => error.includes('thiếu placeholder')));
});

test('stimulus is valid shared reading context for non-MCQ questions and remains shape-checked', () => {
  const set = {
    id: 'shared-reading-stimulus',
    passThreshold: 80,
    items: [{
      id: 'reading-typing',
      type: 'typing',
      vi: 'Where does Jack live?',
      en: 'He lives in the countryside.',
      stimulus: {
        title: 'Bài đọc trong SBT',
        text: 'My name is Jack. I live in the countryside with my family.'
      }
    }, {
      id: 'reading-tf',
      type: 'true_false',
      statement: 'Jack lives in the countryside.',
      answer: true,
      stimulus: {
        title: 'Bài đọc trong SBT',
        text: 'My name is Jack. I live in the countryside with my family.'
      }
    }]
  };
  assert.deepEqual(validateSet(set), []);

  const missingText = structuredClone(set);
  missingText.items[0].stimulus.text = '';
  assert.ok(validateSet(missingText).some(error => error.includes('thiếu text')));

  const mixedSources = structuredClone(set);
  mixedSources.items[0].passageId = 'p1';
  assert.ok(validateSet(mixedSources).some(error => error.includes('không được dùng đồng thời stimulus và passageId')));
});
