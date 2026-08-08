import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildFixedLessonUrl } from '../src/core/lessonLinks.js';
import { getSetDescriptorBySlug } from '../src/repositories/lessonRepository.js';
import { normalizePreviewWidth } from '../src/features/admin/explorer/explorerState.js';
import { previewWidthClass } from '../src/features/admin/explorer/splitPane.js';
import { createLessonPreviewController } from '../src/features/admin/preview/lessonPreviewController.js';

const lessonTable = readFileSync(new URL('../src/features/admin/explorer/renderLessonBrowser.js', import.meta.url), 'utf8');
const previewRenderer = readFileSync(new URL('../src/features/admin/preview/renderLessonPreview.js', import.meta.url), 'utf8');
const splitPane = readFileSync(new URL('../src/features/admin/explorer/splitPane.js', import.meta.url), 'utf8');

test('fixed lesson links are stable across repeated copies', () => {
  const descriptor = getSetDescriptorBySlug('g7u1-dich2-mcq');
  const first = buildFixedLessonUrl({ href: 'https://cbd.example/admin' }, descriptor);
  const second = buildFixedLessonUrl({ href: 'https://cbd.example/admin?refresh=1' }, descriptor);
  assert.equal(first, 'https://cbd.example/a/g7u1-dich2-mcq');
  assert.equal(second, first);
});

test('lesson table exposes one-click copy without assignment creation UI', () => {
  assert.match(lessonTable, /data-copy-fixed-link/);
  assert.match(lessonTable, />Copy<\/button>/);
  assert.doesNotMatch(lessonTable, /Tạo link|data-create-assignment/);
});

test('preview pane shares lesson content renderer and exposes close/full/copy controls', () => {
  assert.match(previewRenderer, /renderLessonContent/);
  assert.match(previewRenderer, /data-preview-close/);
  assert.match(previewRenderer, /data-preview-full/);
  assert.match(previewRenderer, /data-copy-fixed-link/);
});

test('preview width is clamped, quantized and represented by CSS classes instead of inline style', () => {
  assert.equal(normalizePreviewWidth(15), 30);
  assert.equal(normalizePreviewWidth(43), 44);
  assert.equal(normalizePreviewWidth(88), 70);
  assert.equal(previewWidthClass(43), 'preview-size-44');
  assert.doesNotMatch(splitPane, /\.style\.|setAttribute\(['"]style/);
});

test('preview controller ignores stale async lesson loads', async () => {
  const resolvers = new Map();
  const states = [];
  const controller = createLessonPreviewController({
    loadLesson: id => new Promise(resolve => resolvers.set(id, resolve)),
    onChange: state => states.push(state)
  });

  const first = controller.select('set-a');
  const second = controller.select('set-b');
  resolvers.get('set-b')({ id: 'set-b', items: [] });
  await second;
  resolvers.get('set-a')({ id: 'set-a', items: [] });
  await first;

  assert.equal(controller.getState().status, 'ready');
  assert.equal(controller.getState().setId, 'set-b');
  assert.equal(controller.getState().lesson.id, 'set-b');
  assert.equal(states.at(-1).setId, 'set-b');
});
