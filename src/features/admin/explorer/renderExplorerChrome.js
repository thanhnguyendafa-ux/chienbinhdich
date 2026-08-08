import { esc, escAttr } from '../shared/adminUi.js';
import { folderBreadcrumbs, folderLessonCount, rootFolderId } from '../adminTreeModel.js';

export function renderExplorerToolbar(state) {
  return `
    <div class="admin-explorer-toolbar">
      <div class="admin-toolbar-nav">
        <button class="admin-tool-icon" id="admin-up-btn" type="button" title="Lên thư mục cha" ${state.view !== 'lessons' ? 'disabled' : ''}>↑</button>
        <button class="admin-tool-icon" id="admin-refresh-btn" type="button" title="Làm mới dữ liệu">↻</button>
      </div>
      <label class="admin-search-box">
        <span>⌕</span>
        <input id="admin-explorer-search" type="search" placeholder="Tìm tên bài, Unit, link, Set ID..." value="${escAttr(state.searchQuery)}" ${state.view !== 'lessons' ? 'disabled' : ''} />
      </label>
      <div class="admin-toolbar-actions">
        <span class="admin-toolbar-role">ADMIN</span>
        <button class="ghost-btn admin-compact-btn" id="admin-signout-btn" type="button">Đăng xuất</button>
      </div>
    </div>`;
}

export function renderExplorerBreadcrumb(tree, state) {
  if (state.view === 'results') return '<nav class="admin-breadcrumb"><span>Bài tập</span><b>›</b><strong>Kết quả học sinh</strong></nav>';
  if (state.searchQuery.trim()) return `<nav class="admin-breadcrumb"><span>Bài tập</span><b>›</b><strong>Tìm kiếm: ${esc(state.searchQuery)}</strong></nav>`;
  const crumbs = folderBreadcrumbs(tree, state.selectedFolderId);
  return `<nav class="admin-breadcrumb" aria-label="Đường dẫn thư mục">${crumbs.map((crumb, index) => `
    ${index ? '<b>›</b>' : ''}<button type="button" data-breadcrumb-folder="${escAttr(crumb.id)}">${esc(crumb.label)}</button>`).join('')}</nav>`;
}

export function renderExplorerSidebar(tree, state, sessionCount) {
  return `<aside class="admin-explorer-sidebar" aria-label="Cây thư mục quản trị">
    <div class="admin-tree-title">FOLDERS</div>
    ${renderTreeRoot(tree, state)}
    <div class="admin-tree-divider"></div>
    <button class="admin-tree-special ${state.view === 'results' ? 'is-selected' : ''}" type="button" data-view="results">
      <span>▥</span><span>Kết quả học sinh</span><strong>${sessionCount}</strong>
    </button>
  </aside>`;
}

function renderTreeRoot(tree, state) {
  return `<div class="admin-tree">
    <div class="admin-tree-row depth-0 ${state.view === 'lessons' && state.selectedFolderId === rootFolderId() ? 'is-selected' : ''}">
      <span class="admin-tree-spacer"></span>
      <button class="admin-tree-label" type="button" data-folder-select="${rootFolderId()}"><span>📁</span><span>Bài tập</span></button>
    </div>
    ${(tree.children ?? []).filter(node => node.type === 'folder').map(node => renderTreeFolder(node, state, 1)).join('')}
  </div>`;
}

function renderTreeFolder(node, state, depth) {
  const childFolders = (node.children ?? []).filter(child => child.type === 'folder');
  const expandable = childFolders.length > 0;
  const expanded = state.expanded.has(node.id);
  return `<div class="admin-tree-branch">
    <div class="admin-tree-row depth-${Math.min(depth, 5)} ${state.view === 'lessons' && state.selectedFolderId === node.id ? 'is-selected' : ''}">
      ${expandable
        ? `<button class="admin-tree-toggle" type="button" data-folder-toggle="${escAttr(node.id)}" aria-label="${expanded ? 'Thu gọn' : 'Mở'} ${escAttr(node.label)}">${expanded ? '▼' : '▶'}</button>`
        : '<span class="admin-tree-spacer"></span>'}
      <button class="admin-tree-label" type="button" data-folder-select="${escAttr(node.id)}"><span>${expanded ? '📂' : '📁'}</span><span>${esc(node.label)}</span></button>
      <small>${folderLessonCount(node)}</small>
    </div>
    ${expanded ? childFolders.map(child => renderTreeFolder(child, state, depth + 1)).join('') : ''}
  </div>`;
}
