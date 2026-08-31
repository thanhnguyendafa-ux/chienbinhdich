import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  lessonSettingDocumentFor,
  lessonSettingOverrides,
  normalizeLessonSettingRecord
} from '../src/repositories/lessonSettingsModel.js';
import { mutateLessonSettingTransaction } from '../src/repositories/adminLessonSettingsRepository.js';
import { sessionDocumentFor } from '../src/repositories/firebaseSessionRepository.js';

const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const studentReader = readFileSync(new URL('../src/repositories/lessonSettingsReader.js', import.meta.url), 'utf8');
const adminWriter = readFileSync(new URL('../src/repositories/adminLessonSettingsRepository.js', import.meta.url), 'utf8');
const masteryEditor = readFileSync(new URL('../src/features/admin/mastery/masteryEditor.js', import.meta.url), 'utf8');
const typingEditor = readFileSync(new URL('../src/features/admin/typing/typingToleranceEditor.js', import.meta.url), 'utf8');
const accessUi = readFileSync(new URL('../src/features/access/renderAccess.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

test('lesson setting document supports independent mastery, typing and effort overrides', () => {
  assert.deepEqual(lessonSettingDocumentFor('g5-u1-reading-01', 90, 'admin-1', 123), {
    passThreshold: 90,
    updatedAt: 123,
    updatedBy: 'admin-1'
  });
  assert.deepEqual(lessonSettingDocumentFor('g2-u6-translation-01', { typingTolerance: true }, 'admin-1', 124), {
    typingTolerance: true,
    updatedAt: 124,
    updatedBy: 'admin-1'
  });
  assert.deepEqual(lessonSettingDocumentFor('g2-u6-translation-01', {
    passThreshold: 90,
    typingTolerance: false,
    effortPassEnabled: true,
    effortPassMinutes: 10
  }, 'admin-1', 125), {
    passThreshold: 90,
    typingTolerance: false,
    effortPassEnabled: true,
    effortPassMinutes: 10,
    updatedAt: 125,
    updatedBy: 'admin-1'
  });
  assert.throws(() => lessonSettingDocumentFor('x', 80.5, 'admin', 1), /1 to 100/);
  assert.throws(() => lessonSettingDocumentFor('x', { typingTolerance: 'yes' }, 'admin', 1), /boolean/);
  assert.throws(() => lessonSettingDocumentFor('x', { effortPassEnabled: true, effortPassMinutes: 4 }, 'admin', 1), /5 to 60/);
  assert.throws(() => lessonSettingDocumentFor('x', { effortPassEnabled: true }, 'admin', 1), /required/);
  assert.throws(() => lessonSettingDocumentFor('x', {}, 'admin', 1), /At least one/);
});

test('persisted setting parser accepts effort override and rejects corrupt values', () => {
  const mastery = normalizeLessonSettingRecord('x', { passThreshold: 70, updatedAt: 10, updatedBy: 'admin' });
  assert.equal(mastery.passThreshold, 70);
  const typing = normalizeLessonSettingRecord('x', { typingTolerance: false, updatedAt: 11, updatedBy: 'admin' });
  assert.equal(typing.typingTolerance, false);
  const effort = normalizeLessonSettingRecord('x', { effortPassEnabled: true, effortPassMinutes: 20, updatedAt: 12, updatedBy: 'admin' });
  assert.equal(effort.effortPassEnabled, true);
  assert.equal(effort.effortPassMinutes, 20);
  assert.deepEqual(lessonSettingOverrides(effort), { effortPassEnabled: true, effortPassMinutes: 20 });
  assert.throws(() => normalizeLessonSettingRecord('x', { passThreshold: 0 }), /không hợp lệ/);
  assert.throws(() => normalizeLessonSettingRecord('x', { typingTolerance: 'yes' }), /không hợp lệ/);
  assert.throws(() => normalizeLessonSettingRecord('x', { effortPassEnabled: true, effortPassMinutes: 61 }), /không hợp lệ/);
  assert.throws(() => normalizeLessonSettingRecord('x', { updatedAt: 1 }), /không có override/);
});

test('student reader is read-only while Admin repository owns transactional save and reset operations', () => {
  assert.match(studentReader, /getLessonSetting/);
  assert.doesNotMatch(studentReader, /setDoc|deleteDoc|listLessonSettings/);
  assert.match(adminWriter, /listLessonSettings/);
  assert.match(adminWriter, /savePassThreshold/);
  assert.match(adminWriter, /resetPassThreshold/);
  assert.match(adminWriter, /saveTypingTolerance/);
  assert.match(adminWriter, /resetTypingTolerance/);
  assert.match(adminWriter, /effortPassEnabled/);
  assert.match(adminWriter, /effortPassMinutes/);
  assert.match(adminWriter, /runTransaction/);
  assert.match(adminWriter, /transaction\.get\(ref\)/);
  assert.match(adminWriter, /transaction\.set\(ref, document\)/);
  assert.match(adminWriter, /transaction\.delete\(ref\)/);
  assert.match(adminWriter, /delete next\.passThreshold/);
  assert.match(adminWriter, /delete next\.effortPassEnabled/);
  assert.match(adminWriter, /delete next\.effortPassMinutes/);
  assert.match(adminWriter, /delete next\.typingTolerance/);
  assert.match(adminWriter, /Object\.keys\(nextOverrides\)\.length === 0/);
});

test('simultaneous independent lesson setting mutations retain all overrides', async () => {
  const state = createSerializedTransactionClient();
  await Promise.all([
    mutateLessonSettingTransaction({ client: state.client, user: { uid: 'admin-1' }, setId: 'g2-u6-translation-01', updatedAt: 100, mutate: overrides => ({ ...overrides, passThreshold: 90, effortPassEnabled: true, effortPassMinutes: 10 }) }),
    mutateLessonSettingTransaction({ client: state.client, user: { uid: 'admin-1' }, setId: 'g2-u6-translation-01', updatedAt: 101, mutate: overrides => ({ ...overrides, typingTolerance: true }) })
  ]);
  const stored = state.read();
  assert.equal(stored.passThreshold, 90);
  assert.equal(stored.typingTolerance, true);
  assert.equal(stored.effortPassEnabled, true);
  assert.equal(stored.effortPassMinutes, 10);
  assert.equal(stored.updatedBy, 'admin-1');
});

test('Firestore allows signed-in reads, Admin-only setting writes, and immutable session policy snapshots', () => {
  assert.match(rules, /match \/lessonSettings\/\{setId\}/);
  assert.match(rules, /allow get: if signedIn\(\)/);
  assert.match(rules, /allow list: if isAdmin\(\)/);
  assert.match(rules, /hasOnly\(\['passThreshold', 'typingTolerance', 'effortPassEnabled', 'effortPassMinutes', 'updatedAt', 'updatedBy'\]\)/);
  assert.match(rules, /typingTolerance is bool/);
  assert.match(rules, /validEffortMinutes/);
  assert.match(rules, /allow create, update: if isAdmin\(\) && validLessonSetting\(\)/);
  assert.match(rules, /allow delete: if isAdmin\(\)/);
  assert.match(rules, /validPassThreshold\(request\.resource\.data\.passThresholdAtStart\)/);
  assert.match(rules, /typingToleranceAtStart is bool/);
  assert.match(rules, /effortPassEnabledAtStart is bool/);
  assert.match(rules, /validEffortMinutes\(request\.resource\.data\.effortTargetMinutesAtStart\)/);
  assert.match(rules, /request\.resource\.data\.passThresholdAtStart == resource\.data\.passThresholdAtStart/);
  assert.match(rules, /request\.resource\.data\.typingToleranceAtStart == resource\.data\.typingToleranceAtStart/);
  assert.match(rules, /request\.resource\.data\.effortTargetMinutesAtStart == resource\.data\.effortTargetMinutesAtStart/);
});

test('Session persistence carries policy snapshots without embedding attempts', () => {
  const session = {
    schemaVersion: 8,
    id: 'MRT-ABC123',
    setId: 'g2-u6-translation-01',
    setVersion: 1,
    passThresholdAtStart: 80,
    typingToleranceAtStart: true,
    effortPassEnabledAtStart: true,
    effortTargetMinutesAtStart: 10,
    attempts: [{ id: 'a1' }]
  };
  const document = sessionDocumentFor(session, 'uid-1', 999);
  assert.equal(document.passThresholdAtStart, 80);
  assert.equal(document.typingToleranceAtStart, true);
  assert.equal(document.effortPassEnabledAtStart, true);
  assert.equal(document.effortTargetMinutesAtStart, 10);
  assert.equal('attempts' in document, false);
});

test('Admin policy editors are UI-only and state new-session snapshot semantics', () => {
  assert.match(masteryEditor, /Mastery \+ Timer cố gắng/);
  assert.match(masteryEditor, /Session đã bắt đầu giữ nguyên Mastery target và Timer/);
  assert.match(masteryEditor, /5/);
  assert.match(masteryEditor, /60/);
  assert.doesNotMatch(masteryEditor, /firebase|firestore|setDoc|deleteDoc/i);
  assert.match(typingEditor, /Chấm Typing lớp nhỏ/);
  assert.match(typingEditor, /Bỏ qua viết hoa & dấu câu/);
  assert.match(typingEditor, /Session đã bắt đầu giữ nguyên luật chấm lúc bắt đầu/);
  assert.doesNotMatch(typingEditor, /firebase|firestore|setDoc|deleteDoc/i);
});

test('app refreshes live lesson settings and current content before a new start, then snapshots policies and revision', () => {
  assert.match(app, /ensureSet\(\{ refreshSettings: true \}\)/);
  assert.match(app, /readStudentCurrentContent\(activeSetId\)/);
  assert.match(app, /contentRevisionAtStart: Number\(lesson\.contentPolicy\?\.revision \?\? 0\)/);
  assert.match(app, /applySessionMasterySnapshot\(applyLessonMasterySetting\(historical, null\), sessionSnapshot\)/);
  assert.match(app, /saveTypingTolerance/);
  assert.match(app, /resetTypingTolerance/);
  assert.match(app, /lesson_settings_unavailable/);
  assert.match(app, /lesson_content_unavailable/);
});

test('historical drill and report rendering use base plus snapshotted content revision, not live settings/content', () => {
  const helper = app.match(/async function loadHistoricalLessonForSession\([\s\S]*?\n}\n/)?.[0] ?? '';
  assert.match(helper, /loadLessonSet\(sessionSnapshot\.setId\)/);
  assert.match(helper, /contentRevisionAtStart/);
  assert.match(helper, /readStudentRevisionContent/);
  assert.match(helper, /applySessionMasterySnapshot/);
  assert.doesNotMatch(helper, /readStudentLessonSetting|readStudentCurrentContent|ensureSet/);
  assert.match(app, /const lesson = await loadSessionHistoricalLesson\(\)/);
});

test('settings read failures are retryable instead of silently falling back to incorrect grading policy', () => {
  assert.match(accessUi, /renderRetryableAccessError/);
  assert.match(accessUi, /access-retry-btn/);
  assert.match(app, /renderRetryableAccessError/);
  assert.match(app, /Chưa tải được cài đặt bài/);
  assert.match(app, /onRetry: bootstrap/);
});

function createSerializedTransactionClient(initial = null) {
  let stored = initial ? structuredClone(initial) : null;
  let queue = Promise.resolve();
  const firestore = {
    doc: (_db, _collection, id) => ({ id: String(id) }),
    runTransaction: (_db, callback) => {
      const run = queue.then(async () => {
        let pending = stored ? structuredClone(stored) : null;
        const transaction = {
          get: async ref => ({ id: ref.id, exists: () => stored !== null, data: () => structuredClone(stored) }),
          set: (_ref, document) => { pending = structuredClone(document); },
          delete: () => { pending = null; }
        };
        const result = await callback(transaction);
        stored = pending;
        return result;
      });
      queue = run.then(() => undefined, () => undefined);
      return run;
    }
  };
  return { client: { db: {}, firestore }, read: () => structuredClone(stored) };
}
