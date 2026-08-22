import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createIntegrityState, deriveIntegritySummary, recordTabHidden, recordTabVisible } from '../src/core/integrityTracker.js';
import { SESSION_SCHEMA_VERSION } from '../src/core/sessionMachine.js';
import { browserSessionKeys, browserSessionStore } from '../src/repositories/browserSessionStore.js';

class MemoryStorage {
  constructor() { this.values = new Map(); }
  get length() { return this.values.size; }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(String(key), String(value)); }
  removeItem(key) { this.values.delete(String(key)); }
  key(index) { return [...this.values.keys()][index] ?? null; }
  clear() { this.values.clear(); }
}

let previousStorage;
let previousLocation;

beforeEach(() => {
  previousStorage = globalThis.localStorage;
  previousLocation = globalThis.location;
  Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true, writable: true });
  setPath('/');
});

afterEach(() => {
  if (previousStorage === undefined) delete globalThis.localStorage;
  else Object.defineProperty(globalThis, 'localStorage', { value: previousStorage, configurable: true, writable: true });
  if (previousLocation === undefined) delete globalThis.location;
  else Object.defineProperty(globalThis, 'location', { value: previousLocation, configurable: true, writable: true });
});

function setPath(pathname) {
  Object.defineProperty(globalThis, 'location', {
    value: { pathname, href: `https://example.test${pathname}` },
    configurable: true,
    writable: true
  });
}

function activeFixedSession(id, slug) {
  return {
    schemaVersion: SESSION_SCHEMA_VERSION,
    id,
    status: 'active',
    studentName: 'Min',
    setId: 'same-set',
    setVersion: 1,
    entryMode: 'fixed-link',
    accessSlug: slug,
    startedAt: 1000,
    attempts: [],
    integrity: createIntegrityState({ now: 1000 })
  };
}

function activeLegacySession(id, assignmentId, assignmentSlug) {
  return {
    schemaVersion: SESSION_SCHEMA_VERSION,
    id,
    status: 'active',
    studentName: 'Min',
    setId: 'same-set',
    setVersion: 1,
    entryMode: 'legacy-assignment',
    assignmentId,
    assignmentSlug,
    startedAt: 1000,
    attempts: [],
    integrity: createIntegrityState({ now: 1000 })
  };
}

function addTabSwitches(session, count, startAt = 2000) {
  let next = session;
  for (let index = 0; index < count; index += 1) {
    const hiddenAt = startAt + index * 2000;
    next = recordTabHidden(next, hiddenAt);
    next = recordTabVisible(next, hiddenAt + 500);
  }
  return next;
}

function count(session) {
  return deriveIntegritySummary(session, 99999).tabSwitchCount;
}

test('Link A and Link B keep independent tab-switch counts even for the same set', () => {
  setPath('/a/link-a');
  let sessionA = addTabSwitches(activeFixedSession('A', 'link-a'), 3);
  browserSessionStore.saveActive(sessionA);
  assert.equal(count(browserSessionStore.loadActive()), 3);

  setPath('/a/link-b');
  let sessionB = activeFixedSession('B', 'link-b');
  assert.equal(browserSessionStore.loadActive(), null, 'Link B must not inherit Link A active attempt');
  assert.equal(count(sessionB), 0);
  sessionB = addTabSwitches(sessionB, 2, 10000);
  browserSessionStore.saveActive(sessionB);
  assert.equal(count(browserSessionStore.loadActive()), 2);

  setPath('/a/link-a');
  sessionA = browserSessionStore.loadActive();
  assert.equal(count(sessionA), 3, 'Returning to A must resume A, not B');
  sessionA = addTabSwitches(sessionA, 1, 20000);
  browserSessionStore.saveActive(sessionA);
  assert.equal(count(browserSessionStore.loadActive()), 4);

  setPath('/a/link-b');
  assert.equal(count(browserSessionStore.loadActive()), 2, 'B must remain unchanged after A continues');
});

test('finishing Link A clears only A active attempt and leaves Link B resumable', () => {
  setPath('/a/link-a');
  const sessionA = addTabSwitches(activeFixedSession('A', 'link-a'), 3);
  browserSessionStore.saveActive(sessionA);

  setPath('/a/link-b');
  const sessionB = addTabSwitches(activeFixedSession('B', 'link-b'), 2);
  browserSessionStore.saveActive(sessionB);

  setPath('/a/link-a');
  browserSessionStore.saveReport({ ...sessionA, status: 'submitted' });
  assert.equal(browserSessionStore.loadActive(), null);
  assert.equal(browserSessionStore.loadReport('A')?.id, 'A');

  setPath('/a/link-b');
  assert.equal(browserSessionStore.loadActive()?.id, 'B');
  assert.equal(count(browserSessionStore.loadActive()), 2);
});

test('different legacy assignment URLs also keep separate active attempts', () => {
  setPath('/a/unit-two-ABC234');
  const sessionA = addTabSwitches(activeLegacySession('LA', 'assignment-a', 'unit-two'), 2);
  browserSessionStore.saveActive(sessionA);

  setPath('/a/unit-two-DEF567');
  const sessionB = addTabSwitches(activeLegacySession('LB', 'assignment-b', 'unit-two'), 1);
  browserSessionStore.saveActive(sessionB);

  setPath('/a/unit-two-ABC234');
  assert.equal(browserSessionStore.loadActive()?.id, 'LA');
  assert.equal(count(browserSessionStore.loadActive()), 2);

  setPath('/a/unit-two-DEF567');
  assert.equal(browserSessionStore.loadActive()?.id, 'LB');
  assert.equal(count(browserSessionStore.loadActive()), 1);
});

test('legacy global active storage migrates only when a fixed link can be matched safely', () => {
  const matching = addTabSwitches(activeFixedSession('OLD-A', 'link-a'), 2);
  globalThis.localStorage.setItem(browserSessionKeys.active, JSON.stringify(matching));

  setPath('/a/link-b');
  assert.equal(browserSessionStore.loadActive(), null, 'A legacy session must never be attached to B');
  assert.ok(globalThis.localStorage.getItem(browserSessionKeys.active), 'unmatched legacy data is retained');

  setPath('/a/link-a');
  assert.equal(browserSessionStore.loadActive()?.id, 'OLD-A');
  assert.equal(globalThis.localStorage.getItem(browserSessionKeys.active), null, 'matching fixed-link legacy data is migrated');
  assert.ok([...globalThis.localStorage.values.keys()].some(key => key.startsWith(browserSessionKeys.activePrefix)));
});

test('remote migration enumeration sees all scoped active sessions, not just the last opened link', () => {
  setPath('/a/link-a');
  browserSessionStore.saveActive(activeFixedSession('A', 'link-a'));
  setPath('/a/link-b');
  browserSessionStore.saveActive(activeFixedSession('B', 'link-b'));

  assert.deepEqual(browserSessionStore.listPersistedSessions().map(session => session.id).sort(), ['A', 'B']);
});
