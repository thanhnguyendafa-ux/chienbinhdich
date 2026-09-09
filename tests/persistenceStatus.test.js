import test from 'node:test';
import assert from 'node:assert/strict';
import { persistenceDisplay } from '../src/ui/persistenceStatus.js';

test('persistence status distinguishes local-only, pending sync and synced states', () => {
  assert.deepEqual(persistenceDisplay({ mode: 'local-only', remoteReady: false, pendingSessions: 0 }), {
    state: 'local-only',
    title: 'Đã lưu trên thiết bị',
    detail: 'Phiên học được giữ trên trình duyệt này.'
  });

  const pending = persistenceDisplay({ mode: 'firebase-with-local-fallback', remoteReady: false, pendingSessions: 2 });
  assert.equal(pending.state, 'pending');
  assert.match(pending.title, /đang chờ đồng bộ/i);
  assert.match(pending.detail, /2 phiên/);

  const synced = persistenceDisplay({ mode: 'firebase-with-local-fallback', remoteReady: true, pendingSessions: 0 });
  assert.equal(synced.state, 'synced');
  assert.equal(synced.title, 'Đã đồng bộ');
});
