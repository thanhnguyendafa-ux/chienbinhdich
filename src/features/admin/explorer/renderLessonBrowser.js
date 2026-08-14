import {
  findAdminTreeNode,
  folderEntries,
  folderLessonCount,
  lessonMatchesType,
  searchLessonDescriptors
} from '../adminTreeModel.js';
import { lessonMatchesReviewFilter, REVIEW_VIEW } from '../../../repositories/lessonReviewModel.js';
import { esc, escAttr, typeSummary } from '../shared/adminUi.js';
import { renderLessonPreview } from '../preview/renderLessonPreview.js';
import { previewWidthClass } from './splitPane.js';

export function renderLessonBrowser({ tree, state, sets, preview, fixedUrlFor, reviewStateFor }) {
  const query = state.searchQuery.trim();
  const entries = query ? [] : folderEntries(tree, state.selectedFolderId);
  const folderRows = entries.filter(entry => entry.type === 'folder');
  const directSets = entries.filter(entry => entry.type === 'lesson').map(entry => entry.descriptor);
  const candidateSets = query ? searchLessonDescriptors(sets, query) : directSets;
  const typedSets = candidateSets.filter(set => lessonMatchesType(set, state.typeFilter));
  const visibleSets = typedSets.filter(set => lessonMatchesReviewFilter(reviewStateFor(set), state.reviewFilter));
  const currentNode = findAdminTreeNode(tree, state.selectedFolderId);
  const title = query ? 'Kết quả tìm kiếm' : currentNode?.label ?? 'Bài tập';
  const hasPreview = preview?.status && preview.status !== 'idle';
  const summarySets = query ? typedSets : descendantLessonDescriptors(currentNode, sets);
  const reviewSummary = summarizeReview(summarySets.map(reviewStateFor));

  return `<div class="admin-explorer-content-head">
      <div><p class="eyebrow">LESSONS</p><h1>${esc(title)}</h1><p class="admin-review-summary">${esc(reviewSummary)}</p></div>
      <span>${query ? visibleSets.length : folderLessonCount(currentNode)} bài</span>
    </div>
    <div class="admin-filter-strip" aria-label="Lọc dạng bài">
      ${[['all','Tất cả'],['mcq','MCQ'],['typing','Typing'],['tf','T/F'],['order','Sắp xếp'],['classify','Phân loại'],['mix','Mix']].map(([value, label]) => `<button type="button" data-type-filter="${value}" class="${state.typeFilter === value ? 'is-active' : ''}">${label}</button>`).join('')}
    </div>
    <div class="admin-filter-strip admin-review-filter-strip" aria-label="Lọc kiểm duyệt">
      ${[['all','Tất cả review'],['unreviewed','☐ Chưa duyệt'],['approved','✓ Đã duyệt'],['needs-edit','⚠ Cần chỉnh'],['rereview','↻ Duyệt lại']].map(([value, label]) => `<button type="button" data-review-filter="${value}" class="${state.reviewFilter === value ? 'is-active' : ''}">${label}</button>`).join('')}
    </div>
    <div class="admin-lesson-workspace ${hasPreview ? `has-preview ${previewWidthClass(state.previewWidth)}` : 'no-preview'}" data-lesson-workspace>
      <div class="admin-file-list-wrap">
        <table class="admin-file-table">
          <thead><tr><th>Tên</th><th>Dạng</th><th>Câu</th><th>Thời gian</th><th>Duyệt</th><th>Mastery</th><th>Link</th></tr></thead>
          <tbody>
            ${folderRows.map(renderFolderListRow).join('')}
            ${visibleSets.map(set => renderLessonListRow(set, state.selectedSetId === set.id, query ? lessonLocation(tree, set) : '', fixedUrlFor(set), reviewStateFor(set))).join('')}
            ${folderRows.length + visibleSets.length ? '' : '<tr><td colspan="7" class="admin-empty-cell">Không có bài phù hợp.</td></tr>'}
          </tbody>
        </table>
      </div>
      ${hasPreview ? `<div class="admin-preview-splitter" role="separator" aria-orientation="vertical" aria-label="Đổi kích thước preview" aria-valuemin="30" aria-valuemax="70" aria-valuenow="${state.previewWidth}" tabindex="0" data-preview-splitter><span></span></div>${renderLessonPreview({ preview, fixedUrlFor, reviewState: reviewStateFor(preview.lesson) })}` : ''}
    </div>`;
}

function renderFolderListRow(folder) {
  return `<tr class="admin-folder-list-row">
    <td colspan="7"><button type="button" data-folder-select="${escAttr(folder.id)}"><span>📁</span><strong>${esc(folder.label)}</strong><small>${folderLessonCount(folder)} bài</small></button></td>
  </tr>`;
}

function renderLessonListRow(set, selected, location, fixedUrl, reviewState) {
  const custom = set.masteryPolicy?.source === 'admin-override';
  const expectedTime = Number.isInteger(set.expectedTimeMinutes) ? `${set.expectedTimeMinutes} phút` : '—';
  const state = reviewState?.state ?? REVIEW_VIEW.UNREVIEWED;
  const noteMarker = reviewState?.note ? '<span class="admin-review-note-marker" title="Có ghi chú Admin">📝</span>' : '';
  return `<tr class="admin-lesson-row ${selected ? 'is-selected' : ''}" tabindex="0" data-select-set="${escAttr(set.id)}">
    <td><div class="admin-file-name"><span>📄</span><div><div class="admin-file-title-row"><strong>${esc(set.title)}</strong>${set.difficulty === 'hard' ? '<span class="lesson-difficulty-badge">KHÓ</span>' : ''}</div>${location ? `<small>${esc(location)}</small>` : `<small>${esc(set.unit)}</small>`}</div></div></td>
    <td><span class="admin-type-badge">${esc(typeSummary(set.activityTypes))}</span></td>
    <td>${Number(set.itemCount)}</td>
    <td>${esc(expectedTime)}</td>
    <td><div class="admin-review-inline">
      <button class="ghost-btn admin-review-check ${state === REVIEW_VIEW.APPROVED ? 'is-active' : ''}" type="button" data-review-approved="${escAttr(set.id)}" aria-label="Đánh dấu đã duyệt ${escAttr(set.title)}" title="Đã duyệt">✓</button>
      <button class="ghost-btn admin-review-flag ${state === REVIEW_VIEW.NEEDS_EDIT ? 'is-active' : ''}" type="button" data-review-needs-edit="${escAttr(set.id)}" aria-label="Đánh dấu cần chỉnh ${escAttr(set.title)}" title="Cần chỉnh">⚠</button>
      <span class="admin-review-badge is-${escAttr(state)}">${esc(reviewState?.label ?? 'Chưa duyệt')}</span>${noteMarker}
    </div></td>
    <td><div class="admin-mastery-inline"><strong>${Number(set.passThreshold)}%</strong><span class="admin-mastery-badge ${custom ? 'is-custom' : ''}">${custom ? 'Custom' : 'Default'}</span><button class="ghost-btn admin-mini-btn admin-mastery-edit-btn" type="button" data-edit-mastery="${escAttr(set.id)}" aria-label="Chỉnh Mastery cho ${escAttr(set.title)}">✎</button></div></td>
    <td><button class="ghost-btn admin-mini-btn admin-row-copy" type="button" data-copy-fixed-link="${escAttr(fixedUrl)}">Copy</button></td>
  </tr>`;
}

function descendantLessonDescriptors(node, sets) {
  if (!node) return [];
  const byId = new Map(sets.map(set => [set.id, set]));
  const ids = [];
  const walk = current => {
    for (const child of current?.children ?? []) {
      if (child.type === 'lesson') ids.push(child.setId);
      else if (child.type === 'folder') walk(child);
    }
  };
  walk(node);
  return ids.map(id => byId.get(id)).filter(Boolean);
}

function summarizeReview(states) {
  if (!states.length) return 'Chưa có bài trong phạm vi này.';
  const count = key => states.filter(state => state?.state === key).length;
  return `${count(REVIEW_VIEW.APPROVED)}/${states.length} đã duyệt · ${count(REVIEW_VIEW.NEEDS_EDIT)} cần chỉnh · ${count(REVIEW_VIEW.REREVIEW)} cần duyệt lại · ${count(REVIEW_VIEW.UNREVIEWED)} chưa duyệt`;
}

function lessonLocation(tree, set) {
  const path = [];
  const walk = node => {
    if (node.type === 'folder' && (node.children ?? []).some(child => child.type === 'lesson' && child.setId === set.id)) {
      path.push(node.label);
      return true;
    }
    for (const child of node.children ?? []) {
      if (child.type === 'folder' && walk(child)) {
        path.unshift(node.label);
        return true;
      }
    }
    return false;
  };
  walk(tree);
  return path.filter(label => label !== 'Bài tập').join(' › ');
}
