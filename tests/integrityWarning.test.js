import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  acknowledgeIntegrityWarning,
  createIntegrityState,
  deriveIntegritySummary,
  markIntegrityWarningShown,
  queueIntegrityWarning
} from '../src/core/integrityTracker.js';

const runtime = readFileSync(new URL('../src/core/integrityRuntime.js', import.meta.url), 'utf8');
const gate = readFileSync(new URL('../src/features/drill/integrityWarningGate.js', import.meta.url), 'utf8');
const report = readFileSync(new URL('../src/features/report/renderReport.js', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function session(overrides = {}) {
  return { id: 'S1', status: 'active', startedAt: 1000, attempts: [], integrity: createIntegrityState({ now: 1000 }), ...overrides };
}

test('warning queue survives normalization and acknowledgement is auditable', () => {
  let current = queueIntegrityWarning(session(), { type: 'paste', occurredAt: 2000, occurrenceNumber: 1 }, 2000);
  current = JSON.parse(JSON.stringify(current));
  let summary = deriveIntegritySummary(current, 2100);
  assert.equal(summary.warningPendingCount, 1);
  assert.equal(summary.warningShownCount, 0);

  const id = current.integrity.warningQueue[0].id;
  current = markIntegrityWarningShown(current, id, 2200);
  current = acknowledgeIntegrityWarning(current, id, 2300);
  summary = deriveIntegritySummary(current, 2400);
  assert.equal(summary.warningPendingCount, 0);
  assert.equal(summary.warningShownCount, 1);
  assert.equal(summary.warningAcknowledgedCount, 1);
  assert.equal(summary.warningCounts.paste, 1);
});

test('multiple warnings preserve FIFO order instead of overwriting each other', () => {
  let current = session();
  current = queueIntegrityWarning(current, { type: 'paste', occurredAt: 2000, occurrenceNumber: 1 });
  current = queueIntegrityWarning(current, { type: 'copy', occurredAt: 2100, occurrenceNumber: 1 });
  current = queueIntegrityWarning(current, { type: 'tab_switch', occurredAt: 2200, occurrenceNumber: 1, awayMs: 25000 });
  assert.deepEqual(current.integrity.warningQueue.map(item => item.type), ['paste', 'copy', 'tab_switch']);
});

test('legacy tracked sessions upgrade warning coverage as partial', () => {
  const legacyIntegrity = createIntegrityState({ now: 1000 });
  delete legacyIntegrity.warningVersion;
  delete legacyIntegrity.warningTrackingStartedAt;
  delete legacyIntegrity.warningTrackingScope;
  delete legacyIntegrity.warningQueue;
  delete legacyIntegrity.acknowledgements;
  const legacy = { id: 'S2', status: 'active', attempts: [{ id: 'a1' }], integrity: legacyIntegrity };
  const upgraded = queueIntegrityWarning(legacy, { type: 'paste', occurredAt: 3000, occurrenceNumber: 1 }, 3000);
  assert.equal(upgraded.integrity.warningTrackingScope, 'partial');
});

test('runtime warns after paste/copy/tab while copy requires real selection', () => {
  assert.match(runtime, /queueIntegrityWarning/);
  assert.match(runtime, /scheduleWarningNotification/);
  assert.match(runtime, /selectionEnd > target\.selectionStart/);
  assert.match(runtime, /selectionInsideIntegrityDialog/);
  assert.doesNotMatch(runtime, /preventDefault\(\)[\s\S]*recordPaste/);
});

test('learner warning is blocking and only acknowledgement continues', () => {
  assert.match(gate, /showModal\(\)/);
  assert.match(gate, /cancel[^\n]*preventDefault/);
  assert.match(gate, /TÔI ĐÃ NẮM THÔNG TIN/);
  assert.match(gate, /markCurrentIntegrityWarningShown/);
  assert.match(gate, /acknowledgeCurrentIntegrityWarning/);
  assert.match(index, /integrityWarningGate\.js/);
  assert.match(index, /integrity-warning\.css/);
});

test('report exposes warning shown, acknowledgement, pending and timeline evidence', () => {
  assert.match(report, /Cảnh báo tính trung thực/);
  assert.match(report, /Đã hiện cảnh báo/);
  assert.match(report, /Đã xác nhận/);
  assert.match(report, /Chưa xác nhận/);
  assert.match(report, /CẢNH BÁO ĐÃ HIỆN/);
  assert.match(report, /HỌC SINH ĐÃ XÁC NHẬN/);
  assert.match(report, /không tự động bị coi là gian lận/);
});
