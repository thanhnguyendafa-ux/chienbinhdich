import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createIntegrityState,
  deriveIntegritySummary,
  recordCopy,
  recordPaste,
  recordTabHidden,
  recordTabVisible
} from '../src/core/integrityTracker.js';

function activeSession(overrides = {}) {
  return {
    id: 'S1',
    status: 'active',
    startedAt: 1000,
    attempts: [],
    ...overrides
  };
}

test('new integrity state distinguishes full tracking from legacy no-tracking sessions', () => {
  const legacy = deriveIntegritySummary(activeSession(), 2000);
  assert.equal(legacy.trackingAvailable, false);
  assert.equal(legacy.tabSwitchCount, null);

  const trackedSession = activeSession({ integrity: createIntegrityState({ now: 1000 }) });
  const tracked = deriveIntegritySummary(trackedSession, 2000);
  assert.equal(tracked.trackingAvailable, true);
  assert.equal(tracked.trackingScope, 'full');
  assert.equal(tracked.tabSwitchCount, 0);
});

test('paste and copy are counted as events, not only as submitted attempts', () => {
  let session = activeSession({ integrity: createIntegrityState({ now: 1000 }) });
  session = recordPaste(session, 1100);
  session = recordPaste(session, 1200);
  session = recordCopy(session, 1300);
  const summary = deriveIntegritySummary(session, 1400);
  assert.equal(summary.pasteCount, 2);
  assert.equal(summary.copyCount, 1);
});

test('tab switch counts only visible-to-hidden transitions and accumulates time away', () => {
  let session = activeSession({ integrity: createIntegrityState({ now: 1000 }) });
  session = recordTabHidden(session, 2000);
  const repeatedHidden = recordTabHidden(session, 2200);
  assert.equal(repeatedHidden.integrity.tabSwitchCount, 1);

  session = recordTabVisible(repeatedHidden, 5000);
  session = recordTabHidden(session, 7000);
  session = recordTabVisible(session, 9000);

  const summary = deriveIntegritySummary(session, 10000);
  assert.equal(summary.tabSwitchCount, 2);
  assert.equal(summary.tabAwayMs, 5000);
  assert.deepEqual(summary.tabEvents.map(event => event.type), ['hidden', 'visible', 'hidden', 'visible']);
});

test('existing in-progress sessions begin as partial integrity coverage', () => {
  let session = activeSession({ attempts: [{ id: 'a1' }] });
  session = recordPaste(session, 5000);
  const summary = deriveIntegritySummary(session, 6000);
  assert.equal(summary.trackingScope, 'partial');
  assert.equal(summary.pasteCount, 1);
});

test('passed sessions do not collect new integrity events', () => {
  const passed = activeSession({
    status: 'passed',
    integrity: createIntegrityState({ now: 1000 })
  });
  assert.equal(recordPaste(passed, 2000), passed);
  assert.equal(recordCopy(passed, 2000), passed);
  assert.equal(recordTabHidden(passed, 2000), passed);
});
