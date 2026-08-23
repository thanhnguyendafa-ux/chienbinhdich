import test from 'node:test';
import assert from 'node:assert/strict';
import { SESSION_SCHEMA_VERSION } from '../src/core/sessionMachine.js';

test('theory support runs on Session Schema V8 after workbook grading semantics changed', () => {
  assert.equal(SESSION_SCHEMA_VERSION, 8);
});
