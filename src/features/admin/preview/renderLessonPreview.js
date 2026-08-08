import { esc, escAttr, typeSummary } from '../shared/adminUi.js';
import { renderLessonContent } from '../shared/renderLessonContent.js';

export function renderLessonPreview({ preview, fixedUrlFor }) {
  if (!preview || preview.status === 'idle') return '';
  if (preview.status === 'loading') {
    return `<aside class="admin-preview-pane" aria-live="polite"><div class="admin-preview-loading">Đang tải nội dung bài...</div></aside>`;
  }
  if (preview.status === 'error') {
    return `<aside class="admin-preview-pane"><div class="admin-preview-error"><strong>Không mở được preview</strong><p>${esc(preview.error?.message ?? 'Lỗi không xác định.')}</p><button type="button" class="ghost-btn admin-mini-btn" data-preview-close>Đóng</button></div></aside>`;
  }

  const set = preview.lesson;
  const url = fixedUrlFor(set);
  return `<aside class="admin-preview-pane" aria-label="Preview bài ${escAttr(set.title)}">
    <header class="admin-preview-head">
      <div>
        <p class="eyebrow">PREVIEW</p>
        <h2>${esc(set.title)}</h2>
        <p>${esc(set.course)} · ${esc(set.unit)}</p>
      </div>
      <div class="admin-preview-actions">
        <button type="button" class="ghost-btn admin-mini-btn" data-copy-fixed-link="${escAttr(url)}">Copy link</button>
        <button type="button" class="ghost-btn admin-mini-btn" data-preview-full="${escAttr(set.id)}">↗ Mở rộng</button>
        <button type="button" class="ghost-btn admin-mini-btn" data-preview-close aria-label="Đóng preview">×</button>
      </div>
    </header>
    <div class="admin-preview-meta">
      <span>${esc(typeSummary(set.activityTypes))}</span><span>${set.items.length} câu</span><span>Mastery ${Number(set.passThreshold)}%</span>
    </div>
    <div class="admin-fixed-link"><code>/a/${esc(set.lessonSlug)}</code><button type="button" class="ghost-btn admin-mini-btn" data-copy-fixed-link="${escAttr(url)}">Copy</button></div>
    <div class="admin-preview-scroll">${renderLessonContent(set, { compact: true })}</div>
  </aside>`;
}
