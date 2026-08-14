import test from 'node:test';
import assert from 'node:assert/strict';
import { global7Unit1Pronunciation01Content } from '../src/data/g7-u1-pronunciation-01.js';

const items = global7Unit1Pronunciation01Content.items;
const sourceWords = [
  'occasion', 'world', 'girl', 'answer', 'heard', 'mother', 'birth', 'around', 'neighbour', 'work',
  'early', 'upon', 'parent', 'learn', 'expert', 'singer', 'nature', 'sunburn', 'collect', 'shirt',
  'monopoly', 'hurt', 'carrot', 'doctor', 'word', 'dirty'
];

function isBilingual(text) {
  const value = String(text ?? '');
  return value.includes(' / ') || /[À-ỹ]/u.test(value);
}

test('G7 pronunciation lesson has the agreed 17-item scaffold flow', () => {
  assert.equal(items.length, 17);
  assert.deepEqual(items.slice(0, 8).map(item => item.type), ['mcq', 'mcq', 'mcq', 'mcq', 'mcq', 'mcq', 'mcq', 'true_false']);
  assert.ok(items.slice(8, 11).every(item => item.type === 'mcq'));
  assert.ok(items.slice(11).every(item => item.type === 'classification'));
});

test('foundation and guided items allow theory anytime while classifications unlock only after submit', () => {
  for (const item of items.slice(0, 11)) assert.equal(item.theorySupport?.access, 'anytime', item.id);
  for (const item of items.slice(11)) assert.equal(item.theorySupport?.access, 'after_submit', item.id);
});

test('all learner-facing prompts are bilingual', () => {
  for (const item of items) {
    const prompt = item.type === 'true_false' ? item.statement : item.prompt;
    assert.ok(isBilingual(prompt), `prompt must be bilingual: ${item.id}`);
    if (item.type === 'classification') {
      for (const group of item.groups) {
        assert.ok(isBilingual(group.label), `group label must be bilingual: ${item.id}/${group.id}`);
        assert.ok(isBilingual(group.helper), `group helper must be bilingual: ${item.id}/${group.id}`);
      }
    }
  }
});

test('classification rounds keep workload at four or five words and cover the 26 source words exactly once', () => {
  const rounds = items.filter(item => item.type === 'classification');
  assert.deepEqual(rounds.map(item => item.tokens.length), [5, 5, 4, 4, 4, 4]);
  const actual = rounds.flatMap(item => item.tokens.map(token => token.text));
  assert.equal(actual.length, 26);
  assert.equal(new Set(actual).size, 26);
  assert.deepEqual([...actual].sort(), [...sourceWords].sort());
});

test('every classification round carries a per-word resolved answer analysis', () => {
  for (const item of items.filter(candidate => candidate.type === 'classification')) {
    const analysis = item.teachingFeedback?.answerAnalysis ?? [];
    assert.equal(analysis.length, item.tokens.length, item.id);
    assert.deepEqual(analysis.map(entry => entry.word).sort(), item.tokens.map(token => token.text).sort(), item.id);
    for (const entry of analysis) {
      assert.ok(['/ə/', '/ɜː/'].includes(entry.sound), `${item.id}/${entry.word}`);
      assert.ok(isBilingual(entry.explanation), `${item.id}/${entry.word} explanation must be bilingual`);
    }
  }
});

test('classification answer key matches the agreed target sounds', () => {
  const expectedLong = new Set(['world', 'girl', 'heard', 'birth', 'work', 'early', 'learn', 'expert', 'sunburn', 'shirt', 'hurt', 'word', 'dirty']);
  for (const item of items.filter(candidate => candidate.type === 'classification')) {
    for (const token of item.tokens) {
      assert.equal(token.correctGroupId, expectedLong.has(token.text) ? 'long-er' : 'schwa', token.text);
    }
  }
});
