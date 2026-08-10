import { adminTopbar, copyText, esc, escAttr, typeSummary } from '../shared/adminUi.js';
import { openMasteryEditor } from '../mastery/masteryEditor.js';
import { openTypingToleranceEditor } from '../typing/typingToleranceEditor.js';
import { renderLessonContent } from '../shared/renderLessonContent.js';

export function renderLessonInspector({
  root,
  set,
  fixedUrl,
  onBack,
  onStudentPreview,
  onPrint,
  onSaveMastery,
  onResetMastery,
  onSaveTypingTolerance,
  onResetTypingTolerance,
  onRefresh
}) {
  const custom = set.masteryPolicy?.source === 'admin-override';
  const defaultThreshold = Number(set.masteryPolicy?.defaultThreshold ?? set.passThreshold);
  const completionLabel = set.completionPolicy === 'all-items' ? 'All items' : 'Theo Mastery';
  const hasTyping = (set.activityTypes ?? []).includes('typing');
  const typingCustom = set.typingPolicy?.source === 'admin-override';
  const typingDefault = set.typingPolicy?.defaultTolerance === true;

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
            ${set.difficulty === 'hard' ? '<span>Độ khó · KHÓ</span>' : ''}
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
          <button class="primary-btn" id="admin-copy-fixed-btn" type="button" data-url="${escAttr(fixedUrl)}">Copy link cố định</button>
          <p id="admin-copy-fixed-status" class="copy-status"></p>
        </div>
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
  root.querySelector('#admin-copy-fixed-btn')?.addEventListener('click', async event => {
    const copied = await copyText(event.currentTarget.dataset.url);
    const status = root.querySelector('#admin-copy-fixed-status');
    if (status) status.textContent = copied ? '✓ Đã copy link cố định.' : 'Không copy được link.';
  });
}
