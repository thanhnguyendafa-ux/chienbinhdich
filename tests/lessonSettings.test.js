import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  lessonSettingDocumentFor,
  normalizeLessonSettingRecord
} from '../src/repositories/lessonSettingsModel.js';
import { sessionDocumentFor } from '../src/repositories/firebaseSessionRepository.js';

const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const studentReader = readFileSync(new URL('../src/repositories/lessonSettingsReader.js', import.meta.url), 'utf8');
const adminWriter = readFileSync(new URL('../src/repositories/adminLessonSettingsRepository.js', import.meta.url), 'utf8');
const masteryEditor = readFileSync(new URL('../src/features/admin/mastery/masteryEditor.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

test('lesson setting document stores only mutable mastery metadata', () => {
  assert.deepEqual(lessonSettingDocumentFor('g5-u1-reading-01', 90, 'admin-1', 123), {
    passThreshold: 90,
    updatedAt: 123,
    updatedBy: 'admin-1'
  });
  assert.throws(() => lessonSettingDocumentFor('x', 80.5, 'admin', 1), /1 to 100/);
  assert.throws(() => lessonSettingDocumentFor('x', 101, 'admin', 1), /1 to 100/);
});

test('persisted setting parser rejects corrupt thresholds', () => {
  assert.deepEqual(normalizeLessonSettingRecord('x', {
    passThreshold: 70,
    updatedAt: 10,
    updatedBy: 'admin'
  }), {
    setId: 'x',
    passThreshold: 70,
    updatedAt: 10,
    updatedBy: 'admin'
  });
  assert.throws(() => normalizeLessonSettingRecord('x', { passThreshold: 0 }), /không hợp lệ/);
});

test('student reader is read-only while Admin repository owns save and reset operations', () => {
  assert.match(studentReader, /getLessonSetting/);
  assert.doesNotMatch(studentReader, /setDoc|deleteDoc|listLessonSettings/);
  assert.match(adminWriter, /listLessonSettings/);
  assert.match(adminWriter, /savePassThreshold/);
  assert.match(adminWriter, /resetPassThreshold/);
  assert.match(adminWriter, /setDoc/);
  assert.match(adminWriter, /deleteDoc/);
});

test('Firestore allows signed-in reads, Admin-only writes, and immutable session threshold snapshots', () => {
  assert.match(rules, /match \/lessonSettings\/\{setId\}/);
  assert.match(rules, /allow get: if signedIn\(\)/);
  assert.match(rules, /allow list: if isAdmin\(\)/);
  assert.match(rules, /allow create, update: if isAdmin\(\) && validLessonSetting\(\)/);
  assert.match(rules, /allow delete: if isAdmin\(\)/);
  assert.match(rules, /validPassThreshold\(request\.resource\.data\.passThresholdAtStart\)/);
  assert.match(rules, /request\.resource\.data\.passThresholdAtStart == resource\.data\.passThresholdAtStart/);
});

test('Session V7 persistence carries passThresholdAtStart without embedding attempts', () => {
  const session = {
    schemaVersion: 7,
    id: 'MRT-ABC123',
    setId: 'g5-u1-reading-01',
    setVersion: 1,
    passThresholdAtStart: 90,
    attempts: [{ id: 'a1' }]
  };
  const document = sessionDocumentFor(session, 'uid-1', 999);
  assert.equal(document.passThresholdAtStart, 90);
  assert.equal('attempts' in document, false);
});

test('Admin Mastery editor is UI-only and states the fixed-link/session semantics', () => {
  assert.match(masteryEditor, /Fixed link không đổi/);
  assert.match(masteryEditor, /Session đã bắt đầu giữ nguyên mốc lúc bắt đầu/);
  assert.doesNotMatch(masteryEditor, /firebase|firestore|setDoc|deleteDoc/i);
});

test('app refreshes live Mastery before a new start but renders active sessions with their snapshot', () => {
  assert.match(app, /ensureSet\(\{ refreshSettings: true \}\)/);
  assert.match(app, /applySessionMasterySnapshot\(currentLesson, session\)/);
  assert.match(app, /lesson_settings_unavailable/);
});
