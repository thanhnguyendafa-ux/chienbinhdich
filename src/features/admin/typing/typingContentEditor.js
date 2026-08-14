import { esc, escAttr } from '../shared/adminUi.js';
import { createTypingDraftItem, stageLabel, validateTypingDraft } from './typingContentDraft.js';

const STAGES = Object.freeze(['word', 'phrase', 'sentence']);

export function openTypingContentEditor({ root, lesson, baseLesson, onPublish, onReset, onDone = null }) {
  if (!root || !lesson || !(lesson.activityTypes ?? []).includes('typing')) return;
  root.querySelector('[data-content-editor]')?.remove();

  let draftItems = structuredClone(lesson.items ?? []);
  let previewOpen = false;
  const custom = lesson.contentPolicy?.source === 'admin-override';

  const dialog = document.createElement('dialog');
  dialog.className = 'admin-content-dialog';
  dialog.dataset.contentEditor = '1';
  root.appendChild(dialog);

  const render = (statusText = '') => {
    const result = validateTypingDraft(lesson, draftItems);
    const errors = result.errors;
    dialog.innerHTML = `
      <form method="dialog" class="admin-content-editor" data-content-form>
        <div class="admin-content-head">
          <div>
            <p class="eyebrow">TYPING CONTENT CMS</p>
            <h2>Chỉnh nội dung bài</h2>
            <p><strong>${esc(lesson.title)}</strong> · ${esc(lesson.unit)}</p>
            <small>Current: ${custom ? `Custom revision ${lesson.contentPolicy.revision}` : 'Base content'} · Draft chưa ảnh hưởng học sinh cho đến khi Publish.</small>
          </div>
          <button class="ghost-btn admin-mastery-close" type="button" data-content-close aria-label="Đóng">×</button>
        </div>

        <div class="admin-content-toolbar">
          <button class="secondary-btn" type="button" data-content-toggle-original>Xem bản gốc</button>
          <button class="secondary-btn" type="button" data-content-preview>${previewOpen ? 'Ẩn Preview' : 'Preview draft'}</button>
          <button class="secondary-btn" type="button" data-content-add="word">+ WORD</button>
          <button class="secondary-btn" type="button" data-content-add="phrase">+ PHRASE</button>
          <button class="secondary-btn" type="button" data-content-add="sentence">+ SENTENCE</button>
        </div>

        <section class="admin-content-original" data-content-original hidden>
          <h3>Base Content · factory default</h3>
          ${renderReadOnlyItems(baseLesson?.items ?? [])}
        </section>

        ${previewOpen ? `<section class="admin-content-preview"><h3>Preview draft</h3>${renderReadOnlyItems(result.items)}</section>` : ''}

        <div class="admin-content-stage-list">
          ${STAGES.map(stage => renderStage(stage, draftItems.filter(item => item.stage === stage))).join('')}
        </div>

        <section class="admin-content-validation ${errors.length ? 'has-errors' : 'is-valid'}">
          <strong>${errors.length ? `Không thể Publish · ${errors.length} lỗi` : '✓ Draft hợp lệ'}</strong>
          ${errors.length ? `<ul>${errors.map(error => `<li>${esc(error)}</li>`).join('')}</ul>` : '<p>Dependency sẽ được tính lại tự động khi Publish.</p>'}
        </section>
        <p class="admin-mastery-status" data-content-status aria-live="polite">${esc(statusText)}</p>
        <div class="admin-content-actions">
          <button class="danger-btn" type="button" data-content-reset ${custom ? '' : 'disabled'}>Reset về Base</button>
          <button class="secondary-btn" type="button" data-content-close>Hủy</button>
          <button class="primary-btn" type="submit" data-content-publish ${errors.length ? 'disabled' : ''}>Publish revision mới</button>
        </div>
      </form>`;
    bind();
  };

  const bind = () => {
    const close = () => {
      if (dialog.open) dialog.close();
      dialog.remove();
    };
    dialog.querySelectorAll('[data-content-close]').forEach(button => button.addEventListener('click', close));
    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      close();
    }, { once: true });

    dialog.querySelector('[data-content-toggle-original]')?.addEventListener('click', () => {
      const section = dialog.querySelector('[data-content-original]');
      if (section) section.hidden = !section.hidden;
    });
    dialog.querySelector('[data-content-preview]')?.addEventListener('click', () => {
      syncInputs();
      previewOpen = !previewOpen;
      render();
    });

    dialog.querySelectorAll('[data-content-add]').forEach(button => button.addEventListener('click', () => {
      syncInputs();
      const stage = button.dataset.contentAdd;
      draftItems.push(createTypingDraftItem(lesson.id, stage, draftItems.length + 1));
      render();
    }));

    dialog.querySelectorAll('[data-item-delete]').forEach(button => button.addEventListener('click', () => {
      syncInputs();
      draftItems = draftItems.filter(item => item.id !== button.dataset.itemDelete);
      render();
    }));
    dialog.querySelectorAll('[data-item-up]').forEach(button => button.addEventListener('click', () => moveItem(button.dataset.itemUp, -1)));
    dialog.querySelectorAll('[data-item-down]').forEach(button => button.addEventListener('click', () => moveItem(button.dataset.itemDown, 1)));

    dialog.querySelector('[data-content-form]')?.addEventListener('submit', async event => {
      event.preventDefault();
      syncInputs();
      const result = validateTypingDraft(lesson, draftItems);
      if (result.errors.length) return render('Hãy sửa các lỗi trước khi Publish.');
      setBusy(true, 'Đang Publish revision mới...');
      try {
        await onPublish?.(result.items);
        close();
        await onDone?.();
      } catch (error) {
        console.error('Publish lesson content failed', error);
        setBusy(false, error?.message || 'Không Publish được nội dung.');
      }
    });

    dialog.querySelector('[data-content-reset]')?.addEventListener('click', async () => {
      if (!custom) return;
      setBusy(true, 'Đang khôi phục Base Content...');
      try {
        await onReset?.();
        close();
        await onDone?.();
      } catch (error) {
        console.error('Reset lesson content failed', error);
        setBusy(false, error?.message || 'Không Reset được nội dung.');
      }
    });
  };

  const syncInputs = () => {
    const byId = new Map(draftItems.map(item => [item.id, item]));
    dialog.querySelectorAll('[data-content-item]').forEach(card => {
      const item = byId.get(card.dataset.contentItem);
      if (!item) return;
      item.vi = card.querySelector('[data-field="vi"]')?.value ?? item.vi;
      item.en = card.querySelector('[data-field="en"]')?.value ?? item.en;
      const accepted = card.querySelector('[data-field="accepted"]')?.value ?? '';
      const parsed = accepted.split('\n').map(value => value.trim()).filter(Boolean);
      if (parsed.length) item.acceptedAnswers = parsed;
      else delete item.acceptedAnswers;
    });
  };

  const moveItem = (id, direction) => {
    syncInputs();
    const index = draftItems.findIndex(item => item.id === id);
    if (index < 0) return;
    const stage = draftItems[index].stage;
    const stageIndexes = draftItems.map((item, position) => item.stage === stage ? position : -1).filter(position => position >= 0);
    const stagePosition = stageIndexes.indexOf(index);
    const targetStagePosition = stagePosition + direction;
    if (targetStagePosition < 0 || targetStagePosition >= stageIndexes.length) return;
    const targetIndex = stageIndexes[targetStagePosition];
    [draftItems[index], draftItems[targetIndex]] = [draftItems[targetIndex], draftItems[index]];
    render();
  };

  const setBusy = (busy, message) => {
    dialog.querySelectorAll('button, input, textarea').forEach(element => { element.disabled = busy; });
    const status = dialog.querySelector('[data-content-status]');
    if (status) status.textContent = message;
  };

  render();
  dialog.showModal();
}

function renderStage(stage, items) {
  return `
    <section class="admin-content-stage">
      <div class="admin-content-stage-head"><h3>${esc(stageLabel(stage))}</h3><span>${items.length} item</span></div>
      ${items.length ? items.map((item, index) => renderEditableItem(item, index, items.length)).join('') : '<p class="admin-content-empty">Chưa có item ở stage này.</p>'}
    </section>`;
}

function renderEditableItem(item, index, total) {
  const accepted = Array.isArray(item.acceptedAnswers) ? item.acceptedAnswers.join('\n') : '';
  return `
    <article class="admin-content-item" data-content-item="${escAttr(item.id)}">
      <div class="admin-content-item-head">
        <div><strong>${esc(item.id)}</strong><small>${esc(item.sourceSentenceId ?? item.sourceRole ?? '')}</small></div>
        <div class="admin-content-item-actions">
          <button type="button" class="ghost-btn" data-item-up="${escAttr(item.id)}" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" class="ghost-btn" data-item-down="${escAttr(item.id)}" ${index === total - 1 ? 'disabled' : ''}>↓</button>
          <button type="button" class="danger-btn" data-item-delete="${escAttr(item.id)}">Xóa</button>
        </div>
      </div>
      <label>VI cue<textarea rows="2" data-field="vi">${esc(item.vi ?? '')}</textarea></label>
      <label>EN target<textarea rows="2" data-field="en">${esc(item.en ?? '')}</textarea></label>
      <label>Accepted answers <small>(mỗi dòng một đáp án)</small><textarea rows="2" data-field="accepted">${esc(accepted)}</textarea></label>
      <div class="admin-content-locked"><span>Stage: <strong>${esc(stageLabel(item.stage))}</strong></span>${item.sourceSentenceId ? `<span>Source: <strong>${esc(item.sourceSentenceId)}</strong> · khóa</span>` : ''}</div>
    </article>`;
}

function renderReadOnlyItems(items) {
  return `<div class="admin-content-readonly">${(items ?? []).map(item => `
    <article><strong>${esc(stageLabel(item.stage))}</strong><span>${esc(item.vi ?? '')}</span><code>${esc(item.en ?? '')}</code></article>`).join('')}</div>`;
}
