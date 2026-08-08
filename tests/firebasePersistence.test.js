import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  attemptDocumentFor,
  firebaseSdkVersion,
  sessionDocumentFor,
  validateFirebaseProjectConfig
} from '../src/repositories/firebaseSessionRepository.js';

const facade = readFileSync(new URL('../src/repositories/localSessionRepository.js', import.meta.url), 'utf8');
const browserStore = readFileSync(new URL('../src/repositories/browserSessionStore.js', import.meta.url), 'utf8');
const firebaseConfig = readFileSync(new URL('../src/config/firebaseConfig.js', import.meta.url), 'utf8');
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

test('Firebase session document preserves Session V7 metadata but removes embedded attempts', () => {
  const session = {
    schemaVersion: 7,
    id: 'MRT-ABC123',
    studentName: 'An',
    setId: 'g7-u1-translation-01',
    setVersion: 1,
    status: 'active',
    startedAt: 100,
    attempts: [{ id: 'MRT-ABC123-p0-a1', correct: true }]
  };
  const document = sessionDocumentFor(session, 'uid-1', 999);
  assert.equal(document.id, session.id);
  assert.equal(document.ownerUid, 'uid-1');
  assert.equal(document.attemptCount, 1);
  assert.equal(document.syncedAt, 999);
  assert.equal(document.persistenceVersion, 1);
  assert.equal('attempts' in document, false);
  assert.deepEqual(session.attempts, [{ id: 'MRT-ABC123-p0-a1', correct: true }]);
});

test('Firebase attempt documents keep deterministic attempt ids and ownership', () => {
  const attempt = { id: 'MRT-ABC123-p2-a1', itemId: 'q3', correct: false, submittedAt: 123 };
  assert.deepEqual(attemptDocumentFor(attempt, 'MRT-ABC123', 'uid-1'), {
    ...attempt,
    sessionId: 'MRT-ABC123',
    ownerUid: 'uid-1'
  });
});

test('Firebase config validation fails closed until all public web config fields are supplied', () => {
  assert.deepEqual(validateFirebaseProjectConfig({}), ['apiKey', 'authDomain', 'projectId', 'appId']);
  assert.deepEqual(validateFirebaseProjectConfig({ apiKey: 'a', authDomain: 'b', projectId: 'c', appId: 'd' }), []);
  assert.match(firebaseConfig, /enabled:\s*false/);
});

test('persistence facade keeps local-first safety and queues Firebase synchronization', () => {
  assert.match(facade, /browser\.saveActive\(session\)/);
  assert.match(facade, /browser\.saveReport\(session\)/);
  assert.match(facade, /enqueueRemote\(session\)/);
  assert.match(facade, /listPersistedSessions\(\)/);
  assert.match(facade, /window\.addEventListener\('online'/);
  assert.match(browserStore, /cbd\.activeSession\.v7/);
  assert.match(browserStore, /cbd\.report\.v7\./);
  assert.match(browserStore, /cbd\.firebaseMigration\.v1\./);
});

test('Firebase SDK is pinned and Vercel CSP permits only required Firebase network origins', () => {
  assert.equal(firebaseSdkVersion, '12.16.0');
  const csp = vercel.headers.flatMap(entry => entry.headers).find(header => header.key === 'Content-Security-Policy')?.value ?? '';
  assert.match(csp, /script-src 'self' https:\/\/www\.gstatic\.com/);
  assert.match(csp, /connect-src 'self' https:\/\/\*\.googleapis\.com https:\/\/\*\.firebaseapp\.com/);
  assert.doesNotMatch(csp, /connect-src \*/);
  assert.doesNotMatch(csp, /unsafe-inline/);
});

test('Firestore rules bind sessions to authenticated owner and keep attempts immutable', () => {
  assert.match(rules, /request\.auth != null/);
  assert.match(rules, /request\.resource\.data\.ownerUid == request\.auth\.uid/);
  assert.match(rules, /request\.resource\.data\.schemaVersion == 7/);
  assert.match(rules, /request\.resource\.data == resource\.data/);
  assert.match(rules, /allow delete: if false/);
});
