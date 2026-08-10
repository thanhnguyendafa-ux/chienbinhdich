import {
  findAdminTreeNode,
  folderEntries,
  folderLessonCount,
  lessonMatchesType,
  searchLessonDescriptors
} from '../adminTreeModel.js';
import { esc, escAttr, typeSummary } from '../shared/adminUi.js';
import { renderLessonPreview } from '../preview/renderLessonPreview.js';
import { previewWidthClass } from './splitPane.js';

export function renderLessonBrowser({ tree, state, sets, preview, fixedUrlFor }) {
  const query = state.searchQuery.trim();
  const entries = query ? [] : folderEntries(tree, state.selectedFolderId);
  const folderRows = entries.filter(entry => entry.type === 'folder');
  const directSets = entries.filter(entry => entry.type === 'lesson').map(entry => entry.descriptor);
  const candidateSets = query ? searchLessonDescriptors(sets, query) : directSets;
  const visibleSets = candidateSets.filter(set => lessonMatchesType(set, state.typeFilter));
  const currentNode = findAdminTreeNode(tree, state.selectedFolderId);
  const title = query ? 'Kết quả tìm kiếm' : currentNode?.label ?? 'Bài tập';
  const hasPreview = preview?.status && preview.status !== 'idle';

  return `<div class="admin-explorer-content-head">
      <div><p class="eyebrow">LESSONS</p><h1>${esc(title)}</h1></div>
      <span>${query ? visibleSets.length : folderLessonCount(currentNode)} bài</span>
    </div>
    <div class="admin-filter-strip" aria-label="Lọc dạng bài">
      ${[['all','Tất cả'],['mcq','MCQ'],['typing','Typing'],['tf','T/F'],['order','Sắp xếp'],['classify','Phân loại'],['mix','Mix']].map(([value, label]) => `<button type="button" data-type-filter="${value}" class="${state.typeFilter === value ? 'is-active' : ''}">${label}</button>`).join('')}
    </div>
    <div class="admin-lesson-workspace ${hasPreview ? `has-preview ${previewWidthClass(state.previewWidth)}` : 'no-preview'}" data-lesson-workspace>
      <div class="admin-file-list-wrap">
        <table class="admin-file-table">
          <thead><tr><th>Tên</th><th>Dạng</th><th>Câu</th><th>Mastery</th><th>Link</th></tr></thead>
          <tbody>
            ${folderRows.map(renderFolderListRow).join('')}
            ${visibleSets.map(set => renderLessonListRow(set, state.selectedSetId === set.id, query ? lessonLocation(tree, set) : '', fixedUrlFor(set))).join('')}
            ${folderRows.length + visibleSets.length ? '' : '<tr><td colspan="5" class="admin-empty-cell">Không có bài phù hợp.</td></tr>'}
          </tbody>
        </table>
      </div>
      ${hasPreview ? `<div class="admin-preview-splitter" role="separator" aria-orientation="vertical" aria-label="Đổi kích thước preview" aria-valuemin="30" aria-valuemax="70" aria-valuenow="${state.previewWidth}" tabindex="0" data-preview-splitter><span></span></div>${renderLessonPreview({ preview, fixedUrlFor })}` : ''}
    </div>`;
}

function renderFolderListRow(folder) {
  return `<tr class="admin-folder-list-row">
    <td colspan="5"><button type="button" data-folder-select="${escAttr(folder.id)}"><span>📁</span><strong>${esc(folder.label)}</strong><small>${folderLessonCount(folder)} bài</small></button></td>
  </tr>`;
}

function renderLessonListRow(set, selected, location, fixedUrl) {
  const custom = set.masteryPolicy?.source === 'admin-override';
  return `<tr class="admin-lesson-row ${selected ? 'is-selected' : ''}" tabindex="0" data-select-set="${escAttr(set.id)}">
    <td><div class="admin-file-name"><span>📄</span><div><div class="admin-file-title-row"><strong>${esc(set.title)}</strong>${set.difficulty === 'hard' ? '<span class="lesson-difficulty-badge">KHÓ</span>' : ''}</div>${location ? `<small>${esc(location)}</small>` : `<small>${esc(set.unit)}</small>`}</div></div></td>
    <td><span class="admin-type-badge">${esc(typeSummary(set.activityTypes))}</span></td>
    <td>${Number(set.itemCount)}</td>
    <td><div class="admin-mastery-inline"><strong>${Number(set.passThreshold)}%</strong><span class="admin-mastery-badge ${custom ? 'is-custom' : ''}">${custom ? 'Custom' : 'Default'}</span><button class="ghost-btn admin-mini-btn admin-mastery-edit-btn" type="button" data-edit-mastery="${escAttr(set.id)}" aria-label="Chỉnh Mastery cho ${escAttr(set.title)}">✎</button></div></td>
    <td><button class="ghost-btn admin-mini-btn admin-row-copy" type="button" data-copy-fixed-link="${escAttr(fixedUrl)}">Copy</button></td>
  </tr>`;
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
