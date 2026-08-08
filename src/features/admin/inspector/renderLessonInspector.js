import { adminTopbar, copyText, esc, escAttr, typeSummary } from '../shared/adminUi.js';
import { renderLessonContent } from '../shared/renderLessonContent.js';

export function renderLessonInspector({ root, set, fixedUrl, onBack, onStudentPreview }) {
  root.innerHTML = `
    <main class="page admin-page">
      ${adminTopbar({ subtitle: 'Lesson Inspector' })}
      <section class="shell admin-shell">
        <button class="ghost-btn" id="admin-back-btn" type="button">← Dashboard</button>
        <section class="admin-inspector-head">
          <div>
            <p class="eyebrow">${esc(set.course)} · ${esc(set.unit)}</p>
            <h1>${esc(set.title)}</h1>
            <p>${esc(set.description)}</p>
          </div>
          <div class="admin-inspector-meta">
            <span>${set.items.length} câu</span>
            <span>${esc(typeSummary(set.activityTypes))}</span>
            <span>Mastery ≥ ${set.passThreshold}%</span>
            <code>/a/${esc(set.lessonSlug)}</code>
          </div>
        </section>
        <div class="admin-inspector-actions">
          <button class="secondary-btn" id="admin-student-preview-btn" type="button">Xem như học sinh</button>
          <button class="primary-btn" id="admin-copy-fixed-btn" type="button" data-url="${escAttr(fixedUrl)}">Copy link cố định</button>
          <p id="admin-copy-fixed-status" class="copy-status"></p>
        </div>
        ${renderLessonContent(set)}
      </section>
    </main>`;

  root.querySelector('#admin-back-btn')?.addEventListener('click', onBack);
  root.querySelector('#admin-student-preview-btn')?.addEventListener('click', onStudentPreview);
  root.querySelector('#admin-copy-fixed-btn')?.addEventListener('click', async event => {
    const copied = await copyText(event.currentTarget.dataset.url);
    const status = root.querySelector('#admin-copy-fixed-status');
    if (status) status.textContent = copied ? '✓ Đã copy link cố định.' : 'Không copy được link.';
  });
}
