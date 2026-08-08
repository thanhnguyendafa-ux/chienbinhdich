import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lessonFolders, lessonRegistry } from '../src/data/lessonCatalog.js';
import { validateCatalog } from '../src/data/catalogValidator.js';
import { buildFixedLessonUrl } from '../src/core/lessonLinks.js';
import { getSetDescriptorBySlug } from '../src/repositories/lessonRepository.js';

const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const legacyRepository = readFileSync(new URL('../src/repositories/legacyAssignmentRepository.js', import.meta.url), 'utf8');
const adminRepository = readFileSync(new URL('../src/repositories/adminRepository.js', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/features/admin/explorer/renderAdminDashboard.js', import.meta.url), 'utf8');
const lessonBrowser = readFileSync(new URL('../src/features/admin/explorer/renderLessonBrowser.js', import.meta.url), 'utf8');
const preview = readFileSync(new URL('../src/features/admin/preview/renderLessonPreview.js', import.meta.url), 'utf8');
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');

test('every published Set has one stable readable lesson slug', () => {
  assert.deepEqual(validateCatalog(lessonFolders, lessonRegistry), []);
  const slugs = lessonRegistry.map(entry => entry.lessonSlug);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.equal(getSetDescriptorBySlug('g7u1-dich2-mcq')?.id, 'g7-u1-translation-02');
  assert.equal(getSetDescriptorBySlug('mrt-left-cut-right-mix')?.id, 'mrt-left-cut-right-01');
});

test('same lesson always produces the same fixed student URL', () => {
  const descriptor = getSetDescriptorBySlug('g7u1-dich2-mcq');
  const one = buildFixedLessonUrl({ href: 'https://cbd.example/admin' }, descriptor);
  const two = buildFixedLessonUrl({ href: 'https://cbd.example/anything' }, descriptor);
  assert.equal(one, 'https://cbd.example/a/g7u1-dich2-mcq');
  assert.equal(two, one);
});

test('fixed lesson route resolves catalog directly without Firestore assignment creation', () => {
  assert.match(app, /getSetDescriptorBySlug\(route\.slug\)/);
  assert.match(app, /entryMode: 'fixed-link'/);
  assert.match(app, /accessSlug: accessContext\.slug/);
  assert.doesNotMatch(app, /createAssignmentForSet|createAssignment\(/);
});

test('legacy random assignment support is isolated to a read-only compatibility repository', () => {
  assert.match(legacyRepository, /getStudentAssignment/);
  assert.match(legacyRepository, /collection|assignments|doc/);
  assert.doesNotMatch(legacyRepository, /createAssignment|enableAssignment|disableAssignment|setDoc|updateDoc/);
  assert.doesNotMatch(adminRepository, /assignments|createAssignment|enableAssignment|disableAssignment/);
});

test('Admin Explorer copies fixed links inline and preview is not a create-link dialog', () => {
  assert.match(lessonBrowser, /data-copy-fixed-link/);
  assert.match(preview, /Copy link/);
  assert.match(preview, /data-preview-full/);
  assert.match(dashboard, /createLessonPreviewController/);
  assert.doesNotMatch(dashboard, /createAssignment|assignment-dialog|Tạo link/);
});

test('Firestore keeps owner-only learner writes while legacy assignment reads remain compatible', () => {
  assert.match(rules, /match \/admins\/\{uid\}/);
  assert.match(rules, /match \/assignments\/\{assignmentId\}/);
  assert.match(rules, /allow get: if isAdmin\(\) \|\| \(signedIn\(\) && resource\.data\.active == true\)/);
  assert.match(rules, /allow read: if isAdmin\(\) \|\| \(signedIn\(\) && resource\.data\.ownerUid == request\.auth\.uid\)/);
});
