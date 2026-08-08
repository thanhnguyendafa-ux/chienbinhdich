import test from 'node:test';
import assert from 'node:assert/strict';
import {
  activityTypeSlug,
  buildAssignmentShareUrl,
  generateAssignmentCode,
  parseAssignmentPathToken,
  resolveAccessRoute
} from '../src/core/accessRouting.js';

test('access routing separates home, Admin, assignment and legacy Set routes', () => {
  assert.deepEqual(resolveAccessRoute({ href: 'https://cbd.example/' }), { kind: 'home' });
  assert.deepEqual(resolveAccessRoute({ href: 'https://cbd.example/admin' }), { kind: 'admin' });
  assert.deepEqual(resolveAccessRoute({ href: 'https://cbd.example/a/g7u1-dich2-mcq-P9M3X8' }), {
    kind: 'assignment',
    slug: 'g7u1-dich2-mcq',
    code: 'P9M3X8'
  });
  assert.deepEqual(resolveAccessRoute({ href: 'https://cbd.example/s/g7-u1-translation-02' }), {
    kind: 'legacy-set',
    setId: 'g7-u1-translation-02'
  });
});

test('assignment token keeps readable slug while code remains the stable lookup key', () => {
  assert.deepEqual(parseAssignmentPathToken('G7U1-Dịch-2-MCQ-p9m3x8'), {
    slug: 'g7u1-dich-2-mcq',
    code: 'P9M3X8'
  });
  assert.equal(parseAssignmentPathToken('g7u1-dich2-mcq-ABC123'), null, 'I/O/1/0-like alphabet exclusions keep codes easy to read');
});

test('assignment share URL is readable and canonical', () => {
  assert.equal(
    buildAssignmentShareUrl({ href: 'https://chienbinhdich.vercel.app/admin?x=1' }, { slug: 'g7u1-dich2-mcq', code: 'P9M3X8' }),
    'https://chienbinhdich.vercel.app/a/g7u1-dich2-mcq-P9M3X8'
  );
});

test('assignment code generation uses secure random values and fixed six-character length', () => {
  const fakeCrypto = {
    getRandomValues(values) {
      values.set([0, 1, 2, 3, 4, 5]);
      return values;
    }
  };
  assert.equal(generateAssignmentCode(fakeCrypto), 'ABCDEF');
});

test('activity type slug is concise and collapses mixed Sets to mix', () => {
  assert.equal(activityTypeSlug(['typing']), 'typing');
  assert.equal(activityTypeSlug(['mcq']), 'mcq');
  assert.equal(activityTypeSlug(['true_false']), 'tf');
  assert.equal(activityTypeSlug(['mcq', 'typing']), 'mix');
});
