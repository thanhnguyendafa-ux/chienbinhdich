import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAccessRoute } from '../src/core/accessRouting.js';
import {
  buildFixedLessonUrl,
  buildLegacyAssignmentUrl,
  normalizeLessonSlug,
  parseLegacyAssignmentToken,
  validateLessonSlug
} from '../src/core/lessonLinks.js';

test('access routing separates home, Admin, fixed lesson, legacy assignment and legacy Set routes', () => {
  assert.deepEqual(resolveAccessRoute({ href: 'https://cbd.example/' }), { kind: 'home' });
  assert.deepEqual(resolveAccessRoute({ href: 'https://cbd.example/admin' }), { kind: 'admin' });
  assert.deepEqual(resolveAccessRoute({ href: 'https://cbd.example/a/g7u1-dich2-mcq' }), {
    kind: 'lesson-link',
    slug: 'g7u1-dich2-mcq'
  });
  assert.deepEqual(resolveAccessRoute({ href: 'https://cbd.example/a/g7u1-dich2-mcq-P9M3X8' }), {
    kind: 'legacy-assignment',
    slug: 'g7u1-dich2-mcq',
    code: 'P9M3X8'
  });
  assert.deepEqual(resolveAccessRoute({ href: 'https://cbd.example/s/g7-u1-translation-02' }), {
    kind: 'legacy-set',
    setId: 'g7-u1-translation-02'
  });
});

test('fixed lesson URL is deterministic and does not need a generated code', () => {
  assert.equal(
    buildFixedLessonUrl({ href: 'https://chienbinhdich.vercel.app/admin?x=1' }, { lessonSlug: 'g7u1-dich2-mcq' }),
    'https://chienbinhdich.vercel.app/a/g7u1-dich2-mcq'
  );
  assert.equal(normalizeLessonSlug('G7U1-Dịch-2-MCQ'), 'g7u1-dich-2-mcq');
});

test('lesson slugs cannot collide with the legacy six-character suffix grammar', () => {
  assert.equal(validateLessonSlug('g7u1-dich2-mcq'), true);
  assert.equal(validateLessonSlug('g7u1-dich2-P9M3X8'), false);
});

test('legacy assignment links remain readable for already-issued URLs', () => {
  assert.deepEqual(parseLegacyAssignmentToken('G7U1-Dịch-2-MCQ-p9m3x8'), {
    slug: 'g7u1-dich-2-mcq',
    code: 'P9M3X8'
  });
  assert.equal(
    buildLegacyAssignmentUrl({ href: 'https://chienbinhdich.vercel.app/admin' }, { slug: 'g7u1-dich2-mcq', code: 'P9M3X8' }),
    'https://chienbinhdich.vercel.app/a/g7u1-dich2-mcq-P9M3X8'
  );
});
