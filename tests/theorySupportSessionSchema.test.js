import test from 'node:test';
import assert from 'node:assert/strict';
import { SESSION_SCHEMA_VERSION } from '../src/core/sessionMachine.js';

test('theory support keeps Session Schema V7 unchanged', () => {
  assert.equal(SESSION_SCHEMA_VERSION, 7);
});
