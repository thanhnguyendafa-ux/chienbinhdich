import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const deliveryMode = fs.readFileSync(new URL('../src/core/deliveryMode.js', import.meta.url), 'utf8');
const rules = fs.readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const entry = fs.readFileSync(new URL('../src/features/entry/renderEntry.js', import.meta.url), 'utf8');
const assessEntry = fs.readFileSync(new URL('../src/assess-app.js', import.meta.url), 'utf8');
const warningGate = fs.readFileSync(new URL('../src/features/drill/integrityWarningGate.js', import.meta.url), 'utf8');

test('Timer remains a Mastery policy instead of becoming a third delivery mode', () => {
  assert.match(deliveryMode, /DELIVERY_MODE_MASTERY = 'mastery'/);
  assert.match(deliveryMode, /DELIVERY_MODE_ASSESS = 'assess'/);
  assert.doesNotMatch(deliveryMode, /DELIVERY_MODE_TIMER|['"]timer['"]/);
});

test('Firestore validates effort settings and keeps effort snapshots immutable', () => {
  assert.match(rules, /effortPassEnabled/);
  assert.match(rules, /effortPassMinutes/);
  assert.match(rules, /value is int && value >= 5 && value <= 60/);
  assert.match(rules, /effortPassEnabledAtStart/);
  assert.match(rules, /effortTargetMinutesAtStart/);
  assert.match(rules, /request\.resource\.data\.effortTargetMinutesAtStart == resource\.data\.effortTargetMinutesAtStart/);
});

test('Mastery entry explains OR qualification and requires learner acknowledgement', () => {
  assert.match(entry, /MASTERY MODE/);
  assert.match(entry, /HOẶC/);
  assert.match(entry, /không cần cố làm thật nhanh/i);
  assert.match(entry, /mode-contract-ack/);
});

test('Assess entry remains independent and explicitly has no Effort Timer', () => {
  assert.match(assessEntry, /ASSESS MODE/);
  assert.match(assessEntry, /Không có hint, correction hay Effort Timer trong Assess/);
  assert.doesNotMatch(assessEntry, /PASS khi đạt.*HOẶC/s);
});

test('rapid response warning is advisory language, not auto-fail language', () => {
  assert.match(warningGate, /rapid_response/);
  assert.match(warningGate, /không phải bấm thật nhanh/i);
  assert.doesNotMatch(warningGate, /auto.?fail|tự động.*fail/i);
});
