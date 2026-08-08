import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assignmentDocumentFor } from '../src/repositories/assignmentRepository.js';
import { lessonFolders, lessonRegistry } from '../src/data/lessonCatalog.js';
import { validateCatalog } from '../src/data/catalogValidator.js';

const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const admin = readFileSync(new URL('../src/features/admin/renderAdmin.js', import.meta.url), 'utf8');

test('every published Set has a unique readable assignment slug', () => {
  assert.deepEqual(validateCatalog(lessonFolders, lessonRegistry), []);
  const slugs = lessonRegistry.map(entry => entry.assignmentSlug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(lessonRegistry.find(entry => entry.id === 'g7-u1-translation-02')?.assignmentSlug, 'g7u1-dich2-mcq');
  assert.equal(lessonRegistry.find(entry => entry.id === 'mrt-left-cut-right-01')?.assignmentSlug, 'mrt-left-cut-right-mix');
});

test('assignment document keeps readable label separate from stable code and Set id', () => {
  const descriptor = lessonRegistry.find(entry => entry.id === 'g7-u1-translation-02');
  const document = assignmentDocumentFor({ descriptor, code: 'P9M3X8', adminUid: 'admin-1', now: 123 });
  assert.equal(document.id, 'P9M3X8');
  assert.equal(document.slug, 'g7u1-dich2-mcq');
  assert.equal(document.setId, 'g7-u1-translation-02');
  assert.equal(document.activityType, 'mcq');
  assert.equal(document.createdBy, 'admin-1');
  assert.equal(document.createdAt, 123);
  assert.equal(document.active, true);
});

test('student app does not expose the catalog and always resolves an assignment before loading a lesson', () => {
  assert.match(app, /getStudentAssignment\(route\.code\)/);
  assert.match(app, /assignment = await repository\.getStudentAssignment/);
  assert.match(app, /setActiveSet\(assignment\.setId\)/);
  assert.doesNotMatch(app, /renderLibraryHome|showCatalogHome/);
});

test('Admin UI owns lesson inspection, assignment creation and result access', () => {
  assert.match(admin, /Xem nội dung/);
  assert.match(admin, /Tạo link/);
  assert.match(admin, /Kết quả học sinh/);
  assert.match(admin, /Xem như học sinh/);
  assert.match(admin, /Assignment/);
});

test('Firestore rules separate Admin, assignment lookup and owner-only learner writes', () => {
  assert.match(rules, /match \/admins\/\{uid\}/);
  assert.match(rules, /exists\(\/databases\/\$\(database\)\/documents\/admins\/\$\(request\.auth\.uid\)\)/);
  assert.match(rules, /match \/assignments\/\{assignmentId\}/);
  assert.match(rules, /allow get: if isAdmin\(\) \|\| \(signedIn\(\) && resource\.data\.active == true\)/);
  assert.match(rules, /allow list: if isAdmin\(\)/);
  assert.match(rules, /allow read: if isAdmin\(\) \|\| \(signedIn\(\) && resource\.data\.ownerUid == request\.auth\.uid\)/);
  assert.match(rules, /allow delete: if false/);
});
