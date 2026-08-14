import { REVIEW_VIEW } from '../../../repositories/lessonReviewModel.js';
import { adminTopbar, copyText, esc, escAttr, typeSummary } from '../shared/adminUi.js';
import { openMasteryEditor } from '../mastery/masteryEditor.js';
import { openTypingToleranceEditor } from '../typing/typingToleranceEditor.js';
import { openUniversalContentEditor } from '../content/universalContentEditor.js';
import { isUniversalContentEditableLesson } from '../content/universalContentDraft.js';
import { renderLessonContent } from '../shared/renderLessonContent.js';

export function renderLessonInspector({
  root,
  set,
  baseSet,
  reviewState,
  fixedUrl,
  onBack,
  onStudentPreview,
  onPrint,
  onSaveMastery,
  onResetMastery,
  onSaveTypingTolerance,
  onResetTypingTolerance,
  onPublishContent,
  onResetContent,
  onListContentRevisions,
  onRestoreContent,
  onSaveReview,
  onClearReview,
  onRefresh
}) {
  const custom = set.masteryPolicy?.source === 'admin-override';
  const defaultThreshold = Number(set.masteryPolicy?.defaultThreshold ?? set.passThreshold);
  const completionLabel = set.completionPolicy === 'all-items' ? 'All items' : 'Theo Mastery';
  const hasTyping = (set.activityTypes ?? []).includes('typing');
  const contentEditable = isUniversalContentEditableLesson(set);
  const typingCustom = set.typingPolicy?.source === 'admin-override';
  const typingDefault = set.typingPolicy?.defaultTolerance === true;
  const contentCustom = set.contentPolicy?.source === 'admin-override';
  const contentRevision = Number(set.contentPolicy?.revision ?? 0);
  const baseChanged = set.contentPolicy?.baseChanged === true;
  const expectedTime = Number.isInteger(set.expectedTimeMinutes) ? set.expectedTimeMinutes : null;
  const review = reviewState ?? { state: REVIEW_VIEW.UNREVIEWED, label: 'Chưa duyệt', note: '', contentRevision, baseVersion: Number(set.version ?? 1) };

  root.innerHTML = `
    <main class="page admin-page">
      ${adminTopbar({ subtitle: 'Lesson Inspector' })}
      <section class="shell admin-shell">
        <button class="ghost-btn" id="admin-back-btn" type="button">← Dashboard</button>
        <section class="admin-inspector-head">
          <div>
            <p class="eyebrow">${esc(set.course)} · ${esc(set.unit)}</p>
            <div class="admin-title-badges"><h1>${esc(set.title)}</h1>${set.difficulty === 'hard' ? '<span class="lesson-difficulty-badge">KHÓ</span>' : ''}</div>
            <p>${esc(set.description)}</p>
          </div>
          <div class="admin-inspector-meta">
            <span>${set.items.length} câu</span>
            <span>${esc(typeSummary(set.activityTypes))}</span>
            ${expectedTime ? `<span>Expected time · ${expectedTime} phút</span>` : ''}
            ${set.difficulty === 'hard' ? '<span>Độ khó · KHÓ</span>' : ''}
            <span>Content · ${contentCustom ? `CUSTOM · Rev ${contentRevision}` : 'BASE'}</span>
            <span class="admin-review-badge is-${escAttr(review.state)}">Review · ${esc(review.label)}</span>
            ${baseChanged ? '<span class="lesson-difficulty-badge">BASE ĐÃ ĐỔI · CẦN REVIEW OVERRIDE</span>' : ''}
            <span>Mastery ≥ ${set.passThreshold}% · ${custom ? `Custom (mặc định ${defaultThreshold}%)` : 'Default'}</span>
            <span>Completion · ${esc(completionLabel)}</span>
            ${hasTyping ? `<span>Typing lớp nhỏ · ${set.typingTolerance ? 'BẬT' : 'TẮT'} · ${typingCustom ? `Custom (mặc định ${typingDefault ? 'BẬT' : 'TẮT'})` : 'Default'}</span>` : ''}
            <code>/a/${esc(set.lessonSlug)}</code>
          </div>
        </section>
        <div class="admin-inspector-actions">
          <button class="secondary-btn" id="admin-student-preview-btn" type="button">Xem như học sinh</button>
          <button class="secondary-btn" id="admin-print-btn" type="button">In / PDF</button>
          <button class="secondary-btn" id="admin-edit-mastery-btn" type="button">Chỉnh Mastery</button>
          ${hasTyping ? '<button class="secondary-btn" id="admin-edit-typing-btn" type="button">Chỉnh Typing</button>' : ''}
          ${contentEditable ? `<button class="secondary-btn" id="admin-edit-content-btn" type="button">Chỉnh nội dung${contentCustom ? ` · Rev ${contentRevision}` : ''}</button>` : ''}
          <button class="primary-btn" id="admin-copy-fixed-btn" type="button" data-url="${escAttr(fixedUrl)}">Copy link cố định</button>
          <p id="admin-copy-fixed-status" class="copy-status"></p>
        </div>
        ${renderReviewPanel(review, set)}
        ${renderLessonContent(set)}
      </section>
    </main>`;

  root.querySelector('#admin-back-btn')?.addEventListener('click', onBack);
  root.querySelector('#admin-student-preview-btn')?.addEventListener('click', onStudentPreview);
  root.querySelector('#admin-print-btn')?.addEventListener('click', onPrint);
  root.querySelector('#admin-edit-mastery-btn')?.addEventListener('click', () => {
    openMasteryEditor({
      root,
      lesson: set,
      onSave: value => onSaveMastery?.(set.id, value),
      onReset: () => onResetMastery?.(set.id),
      onDone: onRefresh
    });
  });
  root.querySelector('#admin-edit-typing-btn')?.addEventListener('click', () => {
    openTypingToleranceEditor({
      root,
      lesson: set,
      onSave: value => onSaveTypingTolerance?.(set.id, value),
      onReset: () => onResetTypingTolerance?.(set.id),
      onDone: onRefresh
    });
  });
  root.querySelector('#admin-edit-content-btn')?.addEventListener('click', () => {
    openUniversalContentEditor({
      root,
      lesson: set,
      baseLesson: baseSet ?? set,
      onPublish: content => onPublishContent?.(set.id, content),
      onReset: () => onResetContent?.(set.id),
      onListRevisions: () => onListContentRevisions?.(set.id),
      onRestore: (_id, revision) => onRestoreContent?.(set.id, revision),
      onDone: onRefresh
    });
  });
  root.querySelector('#admin-copy-fixed-btn')?.addEventListener('click', async event => {
    const copied = await copyText(event.currentTarget.dataset.url);
    const status = root.querySelector('#admin-copy-fixed-status');
    if (status) status.textContent = copied ? '✓ Đã copy link cố định.' : 'Không copy được link.';
  });

  const saveReview = async status => {
    const statusNode = root.querySelector('#admin-review-save-status');
    const note = root.querySelector('#admin-review-note')?.value ?? '';
    root.querySelectorAll('[data-review-save], #admin-review-clear').forEach(button => { button.disabled = true; });
    if (statusNode) statusNode.textContent = 'Đang lưu...';
    try {
      await onSaveReview?.(set.id, {
        status,
        note,
        contentRevision: Number(set.contentPolicy?.revision ?? 0),
        baseVersion: Number(set.version ?? 1)
      });
      await onRefresh?.();
    } catch (error) {
      root.querySelectorAll('[data-review-save], #admin-review-clear').forEach(button => { button.disabled = false; });
      if (statusNode) statusNode.textContent = error?.message ?? 'Không lưu được kiểm duyệt.';
    }
  };

  root.querySelectorAll('[data-review-save]').forEach(button => button.addEventListener('click', () => saveReview(button.dataset.reviewSave)));
  root.querySelector('#admin-review-clear')?.addEventListener('click', async () => {
    const statusNode = root.querySelector('#admin-review-save-status');
    try {
      await onClearReview?.(set.id);
      await onRefresh?.();
    } catch (error) {
      if (statusNode) statusNode.textContent = error?.message ?? 'Không bỏ được đánh dấu.';
    }
  });
}

function renderReviewPanel(review, set) {
  const staleMessage = review.state === REVIEW_VIEW.REREVIEW
    ? `<p class="admin-review-warning">↻ Nội dung hiện tại đã khác lần kiểm duyệt trước. Hãy đọc lại rồi xác nhận trạng thái mới.</p>`
    : '';
  const revisionLabel = Number(set.contentPolicy?.revision ?? 0) > 0
    ? `CUSTOM · Rev ${Number(set.contentPolicy.revision)}`
    : `BASE · Version ${Number(set.version ?? 1)}`;
  return `<section class="admin-review-panel" aria-label="Kiểm duyệt nội dung">
    <div class="admin-review-panel-head">
      <div><p class="eyebrow">CONTENT QA</p><h2>Kiểm duyệt nội dung</h2><p>Đánh dấu cho đúng phiên bản đang xem: ${esc(revisionLabel)}.</p></div>
      <span class="admin-review-badge is-${escAttr(review.state)}">${esc(review.label)}</span>
    </div>
    ${staleMessage}
    <label class="admin-review-note-label" for="admin-review-note">Ghi chú Admin</label>
    <textarea id="admin-review-note" class="admin-review-note" maxlength="2000" rows="3" placeholder="Ví dụ: WORD nên dùng ‘the pizza’ để khớp sentence phía sau.">${esc(review.note ?? '')}</textarea>
    <div class="admin-review-panel-actions">
      <button type="button" class="primary-btn" data-review-save="${REVIEW_VIEW.APPROVED}">✓ Đã duyệt</button>
      <button type="button" class="secondary-btn" data-review-save="${REVIEW_VIEW.NEEDS_EDIT}">⚠ Cần chỉnh</button>
      <button type="button" class="ghost-btn" id="admin-review-clear">Bỏ đánh dấu</button>
      <span id="admin-review-save-status" class="copy-status"></span>
    </div>
  </section>`;
}
