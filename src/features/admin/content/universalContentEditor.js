import { questionTypeForItem } from '../../../core/questionTypes.js';
import { esc, escAttr, formatDate, typeLabel } from '../shared/adminUi.js';
import { renderLessonContent } from '../shared/renderLessonContent.js';
import {
  addDraftPassage,
  appendDraftItem,
  assignDraftItemToGroup,
  createUniversalDraft,
  draftGroupIdForItem,
  moveDraftItem,
  removeDraftItem,
  removeDraftPassage,
  validateUniversalDraft
} from './universalContentDraft.js';

const ADD_TYPES = Object.freeze([
  ['mcq', 'MCQ'],
  ['true_false', 'True / False'],
  ['classification', 'Phân loại'],
  ['sentence_order', 'Sắp xếp câu'],
  ['sequence_number', 'Sắp xếp thứ tự / Đánh số'],
  ['typing', 'Typing']
]);

let activeRender = null;

export function openUniversalContentEditor({
  root,
  lesson,
  baseLesson,
  onPublish,
  onReset,
  onListRevisions,
  onRestore,
  onDone = null
}) {
  if (!root || !lesson?.items?.length) return;
  root.querySelector('[data-content-editor]')?.remove();

  let draft = createUniversalDraft(lesson);
  let previewOpen = false;
  let originalOpen = false;
  let historyOpen = false;
  let revisions = null;
  let statusText = '';
  const custom = lesson.contentPolicy?.source === 'admin-override';

  const dialog = document.createElement('dialog');
  dialog.className = 'admin-content-dialog';
  dialog.dataset.contentEditor = '1';
  root.appendChild(dialog);

  const render = () => {
    const result = validateUniversalDraft(lesson, draft);
    const effectiveDraftLesson = { ...lesson, ...result.content, itemCount: result.content.items.length };
    dialog.innerHTML = `
      <form method="dialog" class="admin-content-editor admin-universal-content-editor" data-content-form>
        <div class="admin-content-head">
          <div>
            <p class="eyebrow">UNIVERSAL CONTENT CMS</p>
            <h2>Chỉnh nội dung bài</h2>
            <p><strong>${esc(lesson.title)}</strong> · ${esc(lesson.unit)}</p>
            <small>Current: ${custom ? `Custom revision ${Number(lesson.contentPolicy?.revision ?? 0)}` : 'Base content'} · Draft chưa ảnh hưởng học sinh cho đến khi Publish.</small>
          </div>
          <button class="ghost-btn admin-mastery-close" type="button" data-content-close aria-label="Đóng">×</button>
        </div>

        <div class="admin-content-toolbar">
          <button class="secondary-btn" type="button" data-content-toggle-original>${originalOpen ? 'Ẩn bản gốc' : 'Xem bản gốc'}</button>
          <button class="secondary-btn" type="button" data-content-preview>${previewOpen ? 'Ẩn Preview' : 'Preview draft'}</button>
          ${onListRevisions ? `<button class="secondary-btn" type="button" data-content-history>${historyOpen ? 'Ẩn lịch sử' : 'Lịch sử revision'}</button>` : ''}
          <label class="admin-inline-field">Thêm câu
            <select data-add-type>${ADD_TYPES.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select>
          </label>
          ${draft.printGroups?.length ? `<label class="admin-inline-field">Phần in
            <select data-add-group>${draft.printGroups.map(group => `<option value="${escAttr(group.id)}">${esc(group.title)}</option>`).join('')}</select>
          </label>` : ''}
          <button class="secondary-btn" type="button" data-content-add-item>+ Thêm câu</button>
          ${draft.passages !== undefined ? '<button class="secondary-btn" type="button" data-content-add-passage>+ Bài đọc</button>' : ''}
        </div>

        ${originalOpen ? `<section class="admin-content-original"><h3>Base Content · factory default</h3>${renderLessonContent(baseLesson ?? lesson)}</section>` : ''}
        ${previewOpen ? `<section class="admin-content-preview"><h3>Preview draft</h3>${renderLessonContent(effectiveDraftLesson)}</section>` : ''}
        ${historyOpen ? renderHistory(revisions) : ''}
        ${draft.passages !== undefined ? renderPassages(draft.passages) : ''}

        <section class="admin-content-stage">
          <div class="admin-content-stage-head"><div><p class="eyebrow">QUESTIONS</p><h3>${draft.items.length} câu</h3></div><small>Sửa trực tiếp từng loại câu; ID nội bộ được giữ ổn định để bảo vệ session/revision.</small></div>
          <div class="admin-content-stage-list">${draft.items.map((item, index) => renderItemCard(item, index, draft)).join('')}</div>
        </section>

        <section class="admin-content-validation ${result.errors.length ? 'has-errors' : 'is-valid'}">
          <strong>${result.errors.length ? `Không thể Publish · ${result.errors.length} lỗi` : '✓ Draft hợp lệ'}</strong>
          ${result.errors.length ? `<ul>${result.errors.map(error => `<li>${esc(error)}</li>`).join('')}</ul>` : '<p>Draft sẽ được lưu thành một revision mới; học sinh đang làm revision cũ không bị đổi nội dung giữa chừng.</p>'}
        </section>
        <p class="admin-mastery-status" data-content-status aria-live="polite">${esc(statusText)}</p>
        <div class="admin-content-actions">
          <button class="danger-btn" type="button" data-content-reset ${custom ? '' : 'disabled'}>Reset về Base</button>
          <button class="secondary-btn" type="button" data-content-close>Hủy</button>
          <button class="primary-btn" type="submit" data-content-publish ${result.errors.length ? 'disabled' : ''}>Publish revision mới</button>
        </div>
      </form>`;
    bind();
  };

  const bind = () => {
    const close = () => {
      if (activeRender === render) activeRender = null;
      if (dialog.open) dialog.close();
      dialog.remove();
    };
    dialog.querySelectorAll('[data-content-close]').forEach(button => button.addEventListener('click', close));
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); }, { once: true });

    dialog.querySelector('[data-content-toggle-original]')?.addEventListener('click', () => { originalOpen = !originalOpen; render(); });
    dialog.querySelector('[data-content-preview]')?.addEventListener('click', () => { previewOpen = !previewOpen; render(); });
    dialog.querySelector('[data-content-history]')?.addEventListener('click', async () => {
      historyOpen = !historyOpen;
      if (historyOpen && revisions === null) {
        statusText = 'Đang tải lịch sử revision...';
        render();
        try {
          revisions = await onListRevisions?.(lesson.id) ?? [];
          statusText = '';
        } catch (error) {
          revisions = [];
          statusText = error?.message ?? 'Không tải được lịch sử revision.';
        }
      }
      render();
    });

    dialog.querySelector('[data-content-add-item]')?.addEventListener('click', () => {
      const type = dialog.querySelector('[data-add-type]')?.value ?? 'mcq';
      const groupId = dialog.querySelector('[data-add-group]')?.value ?? null;
      draft = appendDraftItem(lesson, draft, type, groupId);
      render();
    });
    dialog.querySelector('[data-content-add-passage]')?.addEventListener('click', () => { draft = addDraftPassage(lesson, draft); render(); });

    bindPassageFields();
    bindItemFields();
    bindStructuralActions();

    dialog.querySelector('[data-content-form]')?.addEventListener('submit', async event => {
      event.preventDefault();
      const result = validateUniversalDraft(lesson, draft);
      if (result.errors.length) {
        statusText = 'Hãy sửa các lỗi trước khi Publish.';
        return render();
      }
      setBusy(true, 'Đang Publish revision mới...');
      try {
        await onPublish?.(bridgeContentForExistingCallback(result.content));
        close();
        await onDone?.();
      } catch (error) {
        console.error('Publish lesson content failed', error);
        statusText = error?.message || 'Không Publish được nội dung.';
        setBusy(false);
        render();
      }
    });

    dialog.querySelector('[data-content-reset]')?.addEventListener('click', async () => {
      if (!custom) return;
      if (!window.confirm('Reset bài này về Base Content? Revision lịch sử vẫn được giữ.')) return;
      setBusy(true, 'Đang Reset về Base...');
      try {
        await onReset?.(lesson.id);
        close();
        await onDone?.();
      } catch (error) {
        statusText = error?.message || 'Không Reset được nội dung.';
        setBusy(false);
        render();
      }
    });

    dialog.querySelectorAll('[data-restore-revision]').forEach(button => button.addEventListener('click', async () => {
      const revision = Number(button.dataset.restoreRevision);
      if (!Number.isInteger(revision) || !window.confirm(`Khôi phục Rev ${revision} thành một revision MỚI?`)) return;
      setBusy(true, `Đang khôi phục Rev ${revision}...`);
      try {
        await onRestore?.(lesson.id, revision);
        close();
        await onDone?.();
      } catch (error) {
        statusText = error?.message || 'Không khôi phục được revision.';
        setBusy(false);
        render();
      }
    }));
  };

  const bindPassageFields = () => {
    dialog.querySelectorAll('[data-passage-card]').forEach(card => {
      const index = Number(card.dataset.passageCard);
      const passage = draft.passages?.[index];
      if (!passage) return;
      card.querySelectorAll('[data-passage-field]').forEach(input => input.addEventListener('input', () => {
        passage[input.dataset.passageField] = input.value;
      }));
      card.querySelector('[data-passage-delete]')?.addEventListener('click', () => {
        draft = removeDraftPassage(lesson, draft, passage.id);
        render();
      });
    });
  };

  const bindItemFields = () => {
    dialog.querySelectorAll('[data-item-card]').forEach(card => {
      const item = draft.items.find(candidate => candidate.id === card.dataset.itemCard);
      if (!item) return;

      card.querySelectorAll('[data-item-field]').forEach(input => input.addEventListener('input', () => {
        const field = input.dataset.itemField;
        if (['classificationHint'].includes(field) && !input.value.trim()) delete item[field];
        else item[field] = input.value;
      }));
      card.querySelectorAll('[data-item-select]').forEach(input => input.addEventListener('change', () => {
        const field = input.dataset.itemSelect;
        if (field === 'passageId' && !input.value) delete item.passageId;
        else item[field] = input.dataset.valueType === 'boolean' ? input.value === 'true' : input.value;
        render();
      }));

      bindTyping(card, item);
      bindMcq(card, item);
      bindTrueFalse(card, item);
      bindSentenceOrder(card, item);
      bindSequenceNumber(card, item);
      bindClassification(card, item);
      bindFeedback(card, item);
    });
  };

  const bindStructuralActions = () => {
    dialog.querySelectorAll('[data-item-up]').forEach(button => button.addEventListener('click', () => { draft = moveDraftItem(lesson, draft, button.dataset.itemUp, -1); render(); }));
    dialog.querySelectorAll('[data-item-down]').forEach(button => button.addEventListener('click', () => { draft = moveDraftItem(lesson, draft, button.dataset.itemDown, 1); render(); }));
    dialog.querySelectorAll('[data-item-delete]').forEach(button => button.addEventListener('click', () => {
      if (draft.items.length <= 1) return window.alert('Bài phải có ít nhất một câu.');
      draft = removeDraftItem(lesson, draft, button.dataset.itemDelete);
      render();
    }));
    dialog.querySelectorAll('[data-item-group]').forEach(select => select.addEventListener('change', () => {
      draft = assignDraftItemToGroup(lesson, draft, select.dataset.itemGroup, select.value);
      render();
    }));
  };

  const setBusy = (busy, message = '') => {
    dialog.querySelectorAll('button,select,textarea,input').forEach(control => { control.disabled = busy; });
    if (message) {
      const node = dialog.querySelector('[data-content-status]');
      if (node) node.textContent = message;
    }
  };

  activeRender = render;
  render();
  dialog.showModal();
}

function renderHistory(revisions) {
  if (revisions === null) return '<section class="admin-content-original"><h3>Lịch sử revision</h3><p>Đang tải...</p></section>';
  if (!revisions?.length) return '<section class="admin-content-original"><h3>Lịch sử revision</h3><p>Chưa có custom revision.</p></section>';
  return `<section class="admin-content-original"><h3>Lịch sử revision</h3><div class="admin-revision-list">${revisions.map(record => `
    <article><div><strong>Rev ${Number(record.revision)}</strong><small>${record.updatedAt ? esc(formatDate(record.updatedAt)) : '—'} · ${Number(record.items?.length ?? 0)} câu</small></div><button type="button" class="secondary-btn" data-restore-revision="${Number(record.revision)}">Khôi phục thành revision mới</button></article>`).join('')}</div></section>`;
}

function renderPassages(passages = []) {
  return `<section class="admin-content-stage"><div class="admin-content-stage-head"><div><p class="eyebrow">READING</p><h3>Passages / Bài đọc</h3></div><small>${passages.length} passage</small></div>
    <div class="admin-content-stage-list">${passages.map((passage, index) => `<article class="admin-content-item" data-passage-card="${index}">
      <div class="admin-content-item-head"><strong>${esc(passage.id)}</strong><button class="danger-btn" type="button" data-passage-delete>Xóa passage</button></div>
      <label>Title / Tiêu đề<textarea rows="2" data-passage-field="title">${esc(passage.title)}</textarea></label>
      <label>Text / Nội dung<textarea rows="8" data-passage-field="text">${esc(passage.text)}</textarea></label>
    </article>`).join('') || '<p class="admin-content-empty">Chưa có passage.</p>'}</div></section>`;
}

function renderItemCard(item, index, draft) {
  const type = questionTypeForItem(item);
  const groupId = draftGroupIdForItem(draft, item.id);
  return `<article class="admin-content-item admin-universal-item" data-item-card="${escAttr(item.id)}">
    <div class="admin-content-item-head">
      <div><strong>Câu ${index + 1}</strong> <span class="admin-type-badge">${esc(typeLabel(type))}</span><small> · ${esc(item.id)}</small></div>
      <div class="admin-content-item-actions">
        <button type="button" class="ghost-btn admin-mini-btn" data-item-up="${escAttr(item.id)}">↑</button>
        <button type="button" class="ghost-btn admin-mini-btn" data-item-down="${escAttr(item.id)}">↓</button>
        <button type="button" class="danger-btn" data-item-delete="${escAttr(item.id)}">Xóa</button>
      </div>
    </div>
    ${draft.printGroups?.length ? `<label>Section / Phần in<select data-item-group="${escAttr(item.id)}">${draft.printGroups.map(group => `<option value="${escAttr(group.id)}" ${group.id === groupId ? 'selected' : ''}>${esc(group.title)}</option>`).join('')}</select></label>` : ''}
    ${renderTypeEditor(item, draft)}
    ${renderFeedbackEditor(item)}
  </article>`;
}

function renderTypeEditor(item, draft) {
  const type = questionTypeForItem(item);
  if (type === 'typing') return renderTyping(item);
  if (type === 'mcq') return renderMcq(item, draft);
  if (type === 'true_false') return renderTrueFalse(item);
  if (type === 'sentence_order') return renderSentenceOrder(item);
  if (type === 'sequence_number') return renderSequenceNumber(item);
  if (type === 'classification') return renderClassification(item);
  return `<p>Unsupported type: ${esc(type)}</p>`;
}

function renderTyping(item) {
  return `<div class="admin-editor-grid">
    <label>Vietnamese / Tiếng Việt<textarea rows="3" data-item-field="vi">${esc(item.vi)}</textarea></label>
    <label>English answer / Đáp án tiếng Anh<textarea rows="3" data-item-field="en">${esc(item.en)}</textarea></label>
    <label>Accepted answers / Đáp án chấp nhận thêm (mỗi dòng một đáp án)<textarea rows="3" data-accepted-answers>${esc((item.acceptedAnswers ?? []).join('\n'))}</textarea></label>
  </div>`;
}

function renderMcq(item, draft) {
  const passages = draft.passages ?? [];
  const hasDiagnostics = Boolean(item.passageId) || (item.choices ?? []).some(choice => choice.diagnostic);
  return `<div class="admin-editor-grid">
    <label>Question / Câu hỏi<textarea rows="4" data-item-field="prompt">${esc(item.prompt)}</textarea></label>
    ${passages.length ? `<label>Reading passage<select data-item-select="passageId"><option value="">— Không gắn passage —</option>${passages.map(passage => `<option value="${escAttr(passage.id)}" ${passage.id === item.passageId ? 'selected' : ''}>${esc(passage.title)}</option>`).join('')}</select></label>` : ''}
    <label>Stimulus mode<select data-stimulus-toggle><option value="off" ${item.stimulus ? '' : 'selected'}>Không dùng</option><option value="on" ${item.stimulus ? 'selected' : ''}>Dùng stimulus riêng</option></select></label>
    ${item.stimulus ? `<label>Stimulus title<textarea rows="2" data-stimulus-field="title">${esc(item.stimulus.title)}</textarea></label><label>Stimulus text<textarea rows="6" data-stimulus-field="text">${esc(item.stimulus.text)}</textarea></label>` : ''}
    <div class="admin-choice-editor"><div class="admin-content-stage-head"><strong>Choices / Lựa chọn</strong><button type="button" class="secondary-btn" data-choice-add>+ Choice</button></div>
      ${(item.choices ?? []).map((choice, choiceIndex) => `<div class="admin-choice-row" data-choice-index="${choiceIndex}">
        <code>${esc(choice.id)}</code><label class="admin-choice-main">Text<input data-choice-text value="${escAttr(choice.text)}"></label>
        <label><input type="radio" name="correct-${escAttr(item.id)}" value="${escAttr(choice.id)}" data-choice-correct ${choice.id === item.correctChoiceId ? 'checked' : ''}> Đúng</label>
        ${hasDiagnostics ? renderDiagnostic(choice) : ''}
        <button type="button" class="danger-btn" data-choice-delete="${choiceIndex}" ${(item.choices ?? []).length <= 2 ? 'disabled' : ''}>Xóa</button>
      </div>`).join('')}
    </div>
  </div>`;
}

function renderDiagnostic(choice) {
  const diagnostic = choice.diagnostic ?? { verdictCorrect: false, reasonCorrect: false, errorCode: '' };
  return `<div class="admin-diagnostic-row">
    <label>Verdict<select data-diagnostic-field="verdictCorrect" data-value-type="boolean"><option value="true" ${diagnostic.verdictCorrect ? 'selected' : ''}>Đúng</option><option value="false" ${diagnostic.verdictCorrect ? '' : 'selected'}>Sai</option></select></label>
    <label>Reason<select data-diagnostic-field="reasonCorrect" data-value-type="boolean"><option value="true" ${diagnostic.reasonCorrect ? 'selected' : ''}>Đúng</option><option value="false" ${diagnostic.reasonCorrect ? '' : 'selected'}>Sai</option></select></label>
    <label>Error code<input data-diagnostic-field="errorCode" value="${escAttr(diagnostic.errorCode ?? '')}"></label>
  </div>`;
}

function renderTrueFalse(item) {
  return `<div class="admin-editor-grid"><label>Statement / Mệnh đề<textarea rows="4" data-item-field="statement">${esc(item.statement)}</textarea></label>
    <label>Correct answer / Đáp án<select data-item-select="answer" data-value-type="boolean"><option value="true" ${item.answer === true ? 'selected' : ''}>TRUE</option><option value="false" ${item.answer === false ? '' : 'selected'}>FALSE</option></select></label></div>`;
}

function renderSentenceOrder(item) {
  const tokens = item.tokens ?? item.correctOrder ?? [];
  const accepted = item.acceptedOrders ?? [];
  return `<div class="admin-editor-grid">
    <label>Prompt / Câu hỏi<textarea rows="3" data-item-field="prompt">${esc(item.prompt)}</textarea></label>
    <label>Token pool (mỗi dòng một token)<textarea rows="6" data-order-tokens>${esc(tokens.join('\n'))}</textarea></label>
    <label>Correct order (mỗi dòng một token)<textarea rows="6" data-order-correct>${esc((item.correctOrder ?? []).join('\n'))}</textarea></label>
    <label>Accepted orders (mỗi đáp án một dòng; token cách nhau bằng ||)<textarea rows="4" data-order-accepted>${esc(accepted.map(order => order.join(' || ')).join('\n'))}</textarea></label>
    ${item.orderDiagnostics ? `<details><summary>Advanced: Order diagnostics JSON</summary><textarea rows="8" data-order-diagnostics>${esc(JSON.stringify(item.orderDiagnostics, null, 2))}</textarea><small>JSON không hợp lệ sẽ không được áp dụng; validator vẫn chặn Publish nếu diagnostics không khớp token.</small></details>` : ''}
  </div>`;
}

function renderSequenceNumber(item) {
  const sequenceLines = item.lines ?? [];
  const order = item.correctOrder ?? sequenceLines.map(line => line.id);
  const positions = new Map(order.map((lineId, index) => [String(lineId), index + 1]));
  return `<div class="admin-editor-grid">
    <label>Prompt / Câu hỏi<textarea rows="3" data-item-field="prompt">${esc(item.prompt)}</textarea></label>
    <div class="admin-choice-editor admin-sequence-editor">
      <div class="admin-content-stage-head"><div><strong>Lines / Các dòng</strong><small> · ↑/↓ đổi vị trí hiển thị; Correct position là thứ tự đáp án.</small></div><button type="button" class="secondary-btn" data-sequence-line-add>+ Dòng</button></div>
      ${sequenceLines.map((line, lineIndex) => `<div class="admin-choice-row admin-sequence-row" data-sequence-line-index="${lineIndex}">
        <code>${esc(line.id)}</code>
        <label class="admin-choice-main">Text<textarea rows="2" data-sequence-line-text>${esc(line.text)}</textarea></label>
        <label>Correct position<select data-sequence-correct-position>${Array.from({ length: sequenceLines.length }, (_, index) => `<option value="${index + 1}" ${positions.get(String(line.id)) === index + 1 ? 'selected' : ''}>${index + 1}</option>`).join('')}</select></label>
        <label><input type="checkbox" data-sequence-locked ${Number.isInteger(Number(line.lockedPosition)) ? 'checked' : ''}> Cho sẵn</label>
        <button type="button" class="ghost-btn admin-mini-btn" data-sequence-line-up="${lineIndex}" ${lineIndex === 0 ? 'disabled' : ''}>↑</button>
        <button type="button" class="ghost-btn admin-mini-btn" data-sequence-line-down="${lineIndex}" ${lineIndex === sequenceLines.length - 1 ? 'disabled' : ''}>↓</button>
        <button type="button" class="danger-btn" data-sequence-line-delete="${lineIndex}" ${sequenceLines.length <= 2 ? 'disabled' : ''}>Xóa</button>
      </div>`).join('')}
    </div>
  </div>`;
}

function renderClassification(item) {
  const analysis = item.teachingFeedback?.answerAnalysis ?? [];
  return `<div class="admin-editor-grid">
    <label>Prompt / Câu hỏi<textarea rows="3" data-item-field="prompt">${esc(item.prompt)}</textarea></label>
    <label>Hint / Gợi ý<textarea rows="2" data-item-field="classificationHint">${esc(item.classificationHint ?? '')}</textarea></label>
    <label>Kind<select data-item-select="classificationKind"><option value="generic" ${item.classificationKind === 'generic' || !item.classificationKind ? 'selected' : ''}>generic</option><option value="stress" ${item.classificationKind === 'stress' ? 'selected' : ''}>stress</option><option value="vocabulary" ${item.classificationKind === 'vocabulary' ? 'selected' : ''}>vocabulary</option></select></label>
    <div class="admin-choice-editor"><div class="admin-content-stage-head"><strong>Groups / Nhóm</strong><button type="button" class="secondary-btn" data-group-add>+ Group</button></div>
      ${(item.groups ?? []).map((group, groupIndex) => `<div class="admin-group-row" data-group-index="${groupIndex}"><code>${esc(group.id)}</code><label>Label<input data-group-label value="${escAttr(group.label)}"></label><label>Helper<input data-group-helper value="${escAttr(group.helper ?? '')}"></label><button type="button" class="danger-btn" data-group-delete="${groupIndex}" ${(item.groups ?? []).length <= 2 ? 'disabled' : ''}>Xóa</button></div>`).join('')}
    </div>
    <div class="admin-choice-editor"><div class="admin-content-stage-head"><strong>Tokens / Từ cần phân loại</strong><button type="button" class="secondary-btn" data-token-add>+ Token</button></div>
      ${(item.tokens ?? []).map((token, tokenIndex) => {
        const entry = analysis[tokenIndex] ?? {};
        return `<div class="admin-token-row" data-token-index="${tokenIndex}"><code>${esc(token.id)}</code><label>Word<input data-token-text value="${escAttr(token.text)}"></label><label>Correct group<select data-token-group>${(item.groups ?? []).map(group => `<option value="${escAttr(group.id)}" ${group.id === token.correctGroupId ? 'selected' : ''}>${esc(group.label)}</option>`).join('')}</select></label>${analysis.length ? `<label>Sound<input data-analysis-sound value="${escAttr(entry.sound ?? '')}"></label><label class="admin-token-explanation">Explanation<input data-analysis-explanation value="${escAttr(entry.explanation ?? '')}"></label>` : ''}<button type="button" class="danger-btn" data-token-delete="${tokenIndex}" ${(item.tokens ?? []).length <= 2 ? 'disabled' : ''}>Xóa</button></div>`;
      }).join('')}
    </div>
  </div>`;
}

function renderFeedbackEditor(item) {
  const feedback = item.teachingFeedback;
  const access = item.theorySupport?.access ?? 'none';
  return `<details class="admin-feedback-editor" ${feedback || access !== 'none' ? 'open' : ''}>
    <summary>Teaching Feedback & Theory / Giải thích & Lý thuyết</summary>
    <label class="admin-toggle-line"><input type="checkbox" data-feedback-enabled ${feedback ? 'checked' : ''}> Bật Teaching Feedback</label>
    <label>Theory access / Quyền xem lý thuyết<select data-theory-access><option value="none" ${access === 'none' ? 'selected' : ''}>Không có nút Theory</option><option value="anytime" ${access === 'anytime' ? 'selected' : ''}>Anytime / Xem bất cứ lúc nào</option><option value="after_submit" ${access === 'after_submit' ? 'selected' : ''}>After submit / Sau khi làm</option></select></label>
    ${feedback ? `<div class="admin-editor-grid">
      <label>Correct label<textarea rows="2" data-feedback-field="correctLabel">${esc(feedback.correctLabel)}</textarea></label>
      <label>Reason / Giải thích<textarea rows="3" data-feedback-field="reason">${esc(feedback.reason)}</textarea></label>
      <label>Theory / Lý thuyết<textarea rows="5" data-feedback-field="theory">${esc(feedback.theory)}</textarea></label>
      <label>Example / Ví dụ<textarea rows="3" data-feedback-field="example">${esc(feedback.example)}</textarea></label>
      <label>Worked example label<input data-worked-field="label" value="${escAttr(feedback.workedExample?.label ?? '')}"></label>
      <label>Worked example text<textarea rows="3" data-worked-field="text">${esc(feedback.workedExample?.text ?? '')}</textarea></label>
    </div>` : '<p class="admin-content-empty">Bật Teaching Feedback để nhập reason, theory và example.</p>'}
  </details>`;
}

function bindTyping(card, item) {
  if (questionTypeForItem(item) !== 'typing') return;
  card.querySelector('[data-accepted-answers]')?.addEventListener('input', event => {
    const values = lines(event.currentTarget.value);
    if (values.length) item.acceptedAnswers = values;
    else delete item.acceptedAnswers;
  });
}

function bindMcq(card, item) {
  if (questionTypeForItem(item) !== 'mcq') return;
  card.querySelector('[data-stimulus-toggle]')?.addEventListener('change', event => {
    if (event.currentTarget.value === 'on') {
      item.stimulus ??= { title: 'Stimulus / Dữ liệu', text: '' };
      delete item.passageId;
    } else delete item.stimulus;
    rerender();
  });
  card.querySelectorAll('[data-stimulus-field]').forEach(input => input.addEventListener('input', () => {
    item.stimulus ??= { title: '', text: '' };
    item.stimulus[input.dataset.stimulusField] = input.value;
  }));
  card.querySelector('[data-item-select="passageId"]')?.addEventListener('change', event => {
    if (event.currentTarget.value) {
      item.passageId = event.currentTarget.value;
      delete item.stimulus;
    } else delete item.passageId;
    rerender();
  });
  card.querySelectorAll('[data-choice-index]').forEach(row => {
    const index = Number(row.dataset.choiceIndex);
    const choice = item.choices?.[index];
    if (!choice) return;
    row.querySelector('[data-choice-text]')?.addEventListener('input', event => { choice.text = event.currentTarget.value; });
    row.querySelector('[data-choice-correct]')?.addEventListener('change', event => { if (event.currentTarget.checked) item.correctChoiceId = choice.id; });
    row.querySelectorAll('[data-diagnostic-field]').forEach(input => input.addEventListener('input', () => {
      choice.diagnostic ??= { verdictCorrect: false, reasonCorrect: false, errorCode: '' };
      const field = input.dataset.diagnosticField;
      choice.diagnostic[field] = input.dataset.valueType === 'boolean' ? input.value === 'true' : input.value;
      if (choice.diagnostic.verdictCorrect && choice.diagnostic.reasonCorrect) delete choice.diagnostic.errorCode;
    }));
  });
  card.querySelector('[data-choice-add]')?.addEventListener('click', () => {
    item.choices ??= [];
    const used = new Set(item.choices.map(choice => choice.id));
    let n = item.choices.length + 1;
    let id = `c${n}`;
    while (used.has(id)) id = `c${++n}`;
    item.choices.push({ id, text: `Choice ${n} / Lựa chọn ${n}` });
    rerender();
  });
  card.querySelectorAll('[data-choice-delete]').forEach(button => button.addEventListener('click', () => {
    if ((item.choices ?? []).length <= 2) return;
    const index = Number(button.dataset.choiceDelete);
    const removed = item.choices[index];
    item.choices.splice(index, 1);
    if (removed?.id === item.correctChoiceId) item.correctChoiceId = item.choices[0]?.id ?? '';
    rerender();
  }));
}

function bindTrueFalse() {}

function bindSentenceOrder(card, item) {
  if (questionTypeForItem(item) !== 'sentence_order') return;
  card.querySelector('[data-order-tokens]')?.addEventListener('input', event => { item.tokens = lines(event.currentTarget.value); });
  card.querySelector('[data-order-correct]')?.addEventListener('input', event => { item.correctOrder = lines(event.currentTarget.value); });
  card.querySelector('[data-order-accepted]')?.addEventListener('input', event => {
    const orders = lines(event.currentTarget.value).map(line => line.split('||').map(value => value.trim()).filter(Boolean));
    if (orders.length) item.acceptedOrders = orders;
    else delete item.acceptedOrders;
  });
  card.querySelector('[data-order-diagnostics]')?.addEventListener('change', event => {
    try {
      item.orderDiagnostics = JSON.parse(event.currentTarget.value);
      event.currentTarget.setCustomValidity('');
    } catch {
      event.currentTarget.setCustomValidity('JSON không hợp lệ.');
      event.currentTarget.reportValidity();
    }
  });
}

function bindSequenceNumber(card, item) {
  if (questionTypeForItem(item) !== 'sequence_number') return;
  item.lines ??= [];
  item.correctOrder ??= item.lines.map(line => String(line.id));

  card.querySelectorAll('[data-sequence-line-index]').forEach(row => {
    const index = Number(row.dataset.sequenceLineIndex);
    const line = item.lines?.[index];
    if (!line) return;
    row.querySelector('[data-sequence-line-text]')?.addEventListener('input', event => { line.text = event.currentTarget.value; });
    row.querySelector('[data-sequence-correct-position]')?.addEventListener('change', event => {
      const currentIndex = item.correctOrder.indexOf(String(line.id));
      const targetIndex = Number(event.currentTarget.value) - 1;
      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= item.correctOrder.length || currentIndex === targetIndex) return;
      [item.correctOrder[currentIndex], item.correctOrder[targetIndex]] = [item.correctOrder[targetIndex], item.correctOrder[currentIndex]];
      syncSequenceLocks(item);
      rerender();
    });
    row.querySelector('[data-sequence-locked]')?.addEventListener('change', event => {
      const position = item.correctOrder.indexOf(String(line.id)) + 1;
      if (event.currentTarget.checked && position > 0) line.lockedPosition = position;
      else delete line.lockedPosition;
      rerender();
    });
  });

  card.querySelector('[data-sequence-line-add]')?.addEventListener('click', () => {
    const id = uniqueLocalId(`${item.id}-line`, item.lines.map(line => line.id));
    item.lines.push({ id, text: `New line ${item.lines.length + 1} / Dòng mới ${item.lines.length + 1}` });
    item.correctOrder.push(id);
    syncSequenceLocks(item);
    rerender();
  });

  card.querySelectorAll('[data-sequence-line-delete]').forEach(button => button.addEventListener('click', () => {
    if (item.lines.length <= 2) return;
    const index = Number(button.dataset.sequenceLineDelete);
    const [removed] = item.lines.splice(index, 1);
    item.correctOrder = item.correctOrder.filter(lineId => String(lineId) !== String(removed?.id));
    syncSequenceLocks(item);
    rerender();
  }));

  card.querySelectorAll('[data-sequence-line-up]').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.sequenceLineUp);
    if (index <= 0 || index >= item.lines.length) return;
    [item.lines[index - 1], item.lines[index]] = [item.lines[index], item.lines[index - 1]];
    rerender();
  }));

  card.querySelectorAll('[data-sequence-line-down]').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.sequenceLineDown);
    if (index < 0 || index >= item.lines.length - 1) return;
    [item.lines[index], item.lines[index + 1]] = [item.lines[index + 1], item.lines[index]];
    rerender();
  }));
}

function syncSequenceLocks(item) {
  const positions = new Map((item.correctOrder ?? []).map((lineId, index) => [String(lineId), index + 1]));
  for (const line of item.lines ?? []) {
    if (line.lockedPosition !== undefined) line.lockedPosition = positions.get(String(line.id));
  }
}

function bindClassification(card, item) {
  if (questionTypeForItem(item) !== 'classification') return;
  card.querySelectorAll('[data-group-index]').forEach(row => {
    const group = item.groups?.[Number(row.dataset.groupIndex)];
    if (!group) return;
    row.querySelector('[data-group-label]')?.addEventListener('input', event => { group.label = event.currentTarget.value; });
    row.querySelector('[data-group-helper]')?.addEventListener('input', event => {
      if (event.currentTarget.value.trim()) group.helper = event.currentTarget.value;
      else delete group.helper;
    });
  });
  card.querySelector('[data-group-add]')?.addEventListener('click', () => {
    item.groups ??= [];
    const id = uniqueLocalId('group', item.groups.map(group => group.id));
    item.groups.push({ id, label: `New group / Nhóm mới ${item.groups.length + 1}` });
    rerender();
  });
  card.querySelectorAll('[data-group-delete]').forEach(button => button.addEventListener('click', () => {
    if ((item.groups ?? []).length <= 2) return;
    const index = Number(button.dataset.groupDelete);
    const removed = item.groups[index];
    item.groups.splice(index, 1);
    const fallback = item.groups[0]?.id ?? '';
    for (const token of item.tokens ?? []) if (token.correctGroupId === removed?.id) token.correctGroupId = fallback;
    rerender();
  }));

  card.querySelectorAll('[data-token-index]').forEach(row => {
    const index = Number(row.dataset.tokenIndex);
    const token = item.tokens?.[index];
    if (!token) return;
    row.querySelector('[data-token-text]')?.addEventListener('input', event => {
      token.text = event.currentTarget.value;
      const entry = item.teachingFeedback?.answerAnalysis?.[index];
      if (entry) entry.word = token.text;
    });
    row.querySelector('[data-token-group]')?.addEventListener('change', event => { token.correctGroupId = event.currentTarget.value; });
    row.querySelector('[data-analysis-sound]')?.addEventListener('input', event => {
      const entry = ensureAnalysisEntry(item, index, token);
      entry.sound = event.currentTarget.value;
    });
    row.querySelector('[data-analysis-explanation]')?.addEventListener('input', event => {
      const entry = ensureAnalysisEntry(item, index, token);
      entry.explanation = event.currentTarget.value;
    });
  });
  card.querySelector('[data-token-add]')?.addEventListener('click', () => {
    item.tokens ??= [];
    const id = uniqueLocalId('token', item.tokens.map(token => token.id));
    const token = { id, text: `New item ${item.tokens.length + 1}`, correctGroupId: item.groups?.[0]?.id ?? '' };
    item.tokens.push(token);
    if (item.teachingFeedback?.answerAnalysis) item.teachingFeedback.answerAnalysis.push({ word: token.text, sound: '', explanation: '' });
    rerender();
  });
  card.querySelectorAll('[data-token-delete]').forEach(button => button.addEventListener('click', () => {
    if ((item.tokens ?? []).length <= 2) return;
    const index = Number(button.dataset.tokenDelete);
    item.tokens.splice(index, 1);
    if (item.teachingFeedback?.answerAnalysis) item.teachingFeedback.answerAnalysis.splice(index, 1);
    rerender();
  }));
}

function bindFeedback(card, item) {
  card.querySelector('[data-feedback-enabled]')?.addEventListener('change', event => {
    if (event.currentTarget.checked) ensureFeedback(item);
    else {
      delete item.teachingFeedback;
      delete item.theorySupport;
    }
    rerender();
  });
  card.querySelector('[data-theory-access]')?.addEventListener('change', event => {
    const access = event.currentTarget.value;
    if (access === 'none') delete item.theorySupport;
    else {
      ensureFeedback(item);
      item.theorySupport = { access };
    }
    rerender();
  });
  card.querySelectorAll('[data-feedback-field]').forEach(input => input.addEventListener('input', () => {
    ensureFeedback(item)[input.dataset.feedbackField] = input.value;
  }));
  card.querySelectorAll('[data-worked-field]').forEach(input => input.addEventListener('input', () => {
    const feedback = ensureFeedback(item);
    feedback.workedExample ??= { label: '', text: '' };
    feedback.workedExample[input.dataset.workedField] = input.value;
    if (!feedback.workedExample.label.trim() && !feedback.workedExample.text.trim()) delete feedback.workedExample;
  }));
}

function ensureFeedback(item) {
  item.teachingFeedback ??= {
    correctLabel: 'Correct / Đúng',
    reason: 'Explain why this answer is correct. / Giải thích vì sao đáp án này đúng.',
    theory: 'Add the rule or theory here. / Thêm quy luật hoặc lý thuyết ở đây.',
    example: 'Add one useful example. / Thêm một ví dụ hữu ích.'
  };
  return item.teachingFeedback;
}

function ensureAnalysisEntry(item, index, token) {
  const feedback = ensureFeedback(item);
  feedback.answerAnalysis ??= (item.tokens ?? []).map(value => ({ word: value.text, sound: '', explanation: '' }));
  feedback.answerAnalysis[index] ??= { word: token.text, sound: '', explanation: '' };
  feedback.answerAnalysis[index].word = token.text;
  return feedback.answerAnalysis[index];
}

function bridgeContentForExistingCallback(content) {
  const items = content.items.map(item => structuredClone(item));
  if (content.passages !== undefined) items.passages = content.passages.map(value => structuredClone(value));
  if (content.printGroups !== undefined) items.printGroups = content.printGroups.map(value => structuredClone(value));
  return items;
}

function lines(value) {
  return String(value ?? '').split('\n').map(line => line.trim()).filter(Boolean);
}

function uniqueLocalId(prefix, values = []) {
  const used = new Set(values.map(String));
  let n = used.size + 1;
  let id = `${prefix}-${n}`;
  while (used.has(id)) id = `${prefix}-${++n}`;
  return id;
}

function rerender() {
  activeRender?.();
}