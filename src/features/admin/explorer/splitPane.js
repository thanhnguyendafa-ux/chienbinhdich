import { normalizePreviewWidth } from './explorerState.js';

export function attachPreviewSplitter({ workspace, splitter, initialWidth, onCommit }) {
  if (!workspace || !splitter) return () => {};
  let width = normalizePreviewWidth(initialWidth);
  applyPreviewWidthClass(workspace, width);

  const onPointerDown = event => {
    if (event.button !== 0) return;
    splitter.setPointerCapture?.(event.pointerId);
    document.body.classList.add('is-resizing-admin-preview');

    const move = moveEvent => {
      const rect = workspace.getBoundingClientRect();
      if (!rect.width) return;
      width = normalizePreviewWidth(((rect.right - moveEvent.clientX) / rect.width) * 100);
      applyPreviewWidthClass(workspace, width);
      splitter.setAttribute('aria-valuenow', String(width));
    };

    const end = endEvent => {
      splitter.releasePointerCapture?.(endEvent.pointerId);
      splitter.removeEventListener('pointermove', move);
      splitter.removeEventListener('pointerup', end);
      splitter.removeEventListener('pointercancel', end);
      document.body.classList.remove('is-resizing-admin-preview');
      onCommit?.(width);
    };

    splitter.addEventListener('pointermove', move);
    splitter.addEventListener('pointerup', end);
    splitter.addEventListener('pointercancel', end);
  };

  splitter.addEventListener('pointerdown', onPointerDown);
  return () => splitter.removeEventListener('pointerdown', onPointerDown);
}

export function previewWidthClass(width) {
  return `preview-size-${normalizePreviewWidth(width)}`;
}

function applyPreviewWidthClass(workspace, width) {
  [...workspace.classList]
    .filter(name => /^preview-size-\d+$/.test(name))
    .forEach(name => workspace.classList.remove(name));
  workspace.classList.add(previewWidthClass(width));
}
