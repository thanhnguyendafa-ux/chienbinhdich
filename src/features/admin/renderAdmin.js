import { expectedResponseDisplay, questionTypeForItem } from '../../core/questionTypes.js';
import { masteryDisplayPercent } from '../../core/masteryEngine.js';
import {
  buildAdminLessonTree,
  findAdminTreeNode,
  folderBreadcrumbs,
  folderEntries,
  folderLessonCount,
  lessonMatchesType,
  rootFolderId,
  searchLessonDescriptors
} from './adminTreeModel.js';

const EXPLORER_STATE_KEY = 'cbd.adminExplorer.state.v1';

export function renderAdminLogin({ root, errorMessage = '', onSubmit }) {
  root.innerHTML = `
    <main class="page page-centered admin-login-page">
      <section class="admin-login-card">
        <div class="brand-lockup centered"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
        <p class="eyebrow">ADMIN</p>
        <h1>Đăng nhập quản trị</h1>
        <p>Thư viện bài, link giao bài và dữ liệu học sinh chỉ dành cho tài khoản Admin.</p>
        ${errorMessage ? `<div class="admin-alert admin-alert-error">${esc(errorMessage)}</div>` : ''}
        <form id="admin-login-form" class="admin-login-form">
          <label>Email Admin<input id="admin-email" type="email" autocomplete="username" required /></label>
          <label>Mật khẩu<input id="admin-password" type="password" autocomplete="current-password" required /></label>
          <button class="primary-btn" type="submit">Đăng nhập</button>
        </form>
      </section>
    </main>`;

  const form = root.querySelector('#admin-login-form');
  const submit = form?.querySelector('button[type="submit"]');
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    setBusy(submit, 'Đang xác thực...');
    try {
      await onSubmit(
        root.querySelector('#admin-email')?.value ?? '',
        root.querySelector('#admin-password')?.value ?? ''
      );
    } catch (error) {
      renderAdminLogin({ root, errorMessage: error?.message ?? 'Đăng nhập thất bại.', onSubmit });
    }
  });
}

export function renderAdminDashboard({
  root,
  folders,
  sets,
  assignments,
  sessions,
  assignmentUrlFor,
  onInspect,
  onPreview,
  onCreateAssignment,
  onToggleAssignment,
  onOpenSession,
  onRefresh,
  onSignOut
}) {
  const tree = buildAdminLessonTree(folders, sets);
  const persisted = readExplorerState();
  const defaultFolderId = findAdminTreeNode(tree, persisted.selectedFolderId) ? persisted.selectedFolderId : rootFolderId();
  const state = {
    view: ['lessons', 'assignments', 'results'].includes(persisted.view) ? persisted.view : 'lessons',
    selectedFolderId: defaultFolderId,
    selectedSetId: null,
    expanded: new Set((persisted.expanded ?? []).filter(id => findAdminTreeNode(tree, id))),
    searchQuery: '',
    typeFilter: 'all',
    dialogSetId: null,
    toast: ''
  };
  const setById = new Map(sets.map(set => [set.id, set]));
  const assignmentList = [...assignments];

  expandBreadcrumbAncestors(tree, state.selectedFolderId, state.expanded);

  const persist = () => writeExplorerState({
    view: state.view,
    selectedFolderId: state.selectedFolderId,
    expanded: [...state.expanded]
  });

  const render = ({ focusSearch = false } = {}) => {
    root.innerHTML = `
      <main class="page admin-page admin-explorer-page">
        ${adminTopbar({ subtitle: 'Explorer' })}
        <section class="shell admin-explorer-shell">
          ${renderExplorerToolbar(state)}
          ${renderExplorerBreadcrumb(tree, state)}
          <section class="admin-explorer-workspace">
            <aside class="admin-explorer-sidebar" aria-label="Cây thư mục quản trị">
              <div class="admin-tree-title">FOLDERS</div>
              ${renderTreeRoot(tree, state)}
              <div class="admin-tree-divider"></div>
              <button class="admin-tree-special ${state.view === 'assignments' ? 'is-selected' : ''}" type="button" data-view="assignments">
                <span>🔗</span><span>Link đã giao</span><strong>${assignmentList.length}</strong>
              </button>
              <button class="admin-tree-special ${state.view === 'results' ? 'is-selected' : ''}" type="button" data-view="results">
                <span>▥</span><span>Kết quả học sinh</span><strong>${sessions.length}</strong>
              </button>
            </aside>
            <section class="admin-explorer-content">
              ${renderExplorerContent({ tree, state, sets, setById, assignments: assignmentList, sessions, assignmentUrlFor })}
            </section>
          </section>
          ${renderExplorerStatus(tree, state, sets)}
        </section>
        ${renderAssignmentDialog(state.dialogSetId ? setById.get(state.dialogSetId) : null)}
        ${state.toast ? `<div class="admin-toast" role="status">${esc(state.toast)}</div>` : ''}
      </main>`;

    bindDashboardEvents();
    if (focusSearch) {
      const input = root.querySelector('#admin-explorer-search');
      input?.focus();
      input?.setSelectionRange(input.value.length, input.value.length);
    }
  };

  const closeAssignmentDialog = () => {
    state.dialogSetId = null;
    render();
  };

  const bindDashboardEvents = () => {
    root.querySelector('#admin-refresh-btn')?.addEventListener('click', onRefresh);
    root.querySelector('#admin-signout-btn')?.addEventListener('click', onSignOut);

    root.querySelector('#admin-up-btn')?.addEventListener('click', () => {
      const crumbs = folderBreadcrumbs(tree, state.selectedFolderId);
      if (crumbs.length < 2) return;
      state.selectedFolderId = crumbs.at(-2).id;
      state.selectedSetId = null;
      state.searchQuery = '';
      persist();
      render();
    });

    root.querySelector('#admin-explorer-search')?.addEventListener('input', event => {
      state.searchQuery = event.currentTarget.value;
      state.selectedSetId = null;
      render({ focusSearch: true });
    });

    root.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
      state.view = button.dataset.view;
      state.selectedSetId = null;
      state.dialogSetId = null;
      persist();
      render();
    }));

    root.querySelectorAll('[data-folder-select]').forEach(button => button.addEventListener('click', () => {
      state.view = 'lessons';
      state.selectedFolderId = button.dataset.folderSelect;
      state.selectedSetId = null;
      state.searchQuery = '';
      expandBreadcrumbAncestors(tree, state.selectedFolderId, state.expanded);
      persist();
      render();
    }));

    root.querySelectorAll('[data-folder-toggle]').forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      const id = button.dataset.folderToggle;
      if (state.expanded.has(id)) state.expanded.delete(id);
      else state.expanded.add(id);
      persist();
      render();
    }));

    root.querySelectorAll('[data-breadcrumb-folder]').forEach(button => button.addEventListener('click', () => {
      state.view = 'lessons';
      state.selectedFolderId = button.dataset.breadcrumbFolder;
      state.selectedSetId = null;
      state.searchQuery = '';
      persist();
      render();
    }));

    root.querySelectorAll('[data-type-filter]').forEach(button => button.addEventListener('click', () => {
      state.typeFilter = button.dataset.typeFilter;
      state.selectedSetId = null;
      render();
    }));

    root.querySelectorAll('[data-select-set]').forEach(row => {
      const choose = () => {
        state.selectedSetId = row.dataset.selectSet;
        render();
      };
      row.addEventListener('click', choose);
      row.addEventListener('dblclick', () => onInspect(row.dataset.selectSet));
      row.addEventListener('keydown', event => {
        if (event.key === 'Enter') onInspect(row.dataset.selectSet);
        if (event.key === ' ') {
          event.preventDefault();
          choose();
        }
      });
    });

    root.querySelectorAll('[data-inspect-set]').forEach(button => button.addEventListener('click', () => onInspect(button.dataset.inspectSet)));
    root.querySelectorAll('[data-preview-set]').forEach(button => button.addEventListener('click', () => onPreview(button.dataset.previewSet)));
    root.querySelectorAll('[data-create-assignment]').forEach(button => button.addEventListener('click', () => {
      state.dialogSetId = button.dataset.createAssignment;
      render();
      const dialog = root.querySelector('#admin-assignment-dialog');
      if (typeof dialog?.showModal === 'function') dialog.showModal();
      else dialog?.setAttribute('open', '');
    }));

    root.querySelector('#admin-dialog-cancel')?.addEventListener('click', closeAssignmentDialog);
    root.querySelector('#admin-dialog-cancel-bottom')?.addEventListener('click', closeAssignmentDialog);
    root.querySelector('#admin-assignment-dialog')?.addEventListener('cancel', () => {
      state.dialogSetId = null;
    });

    root.querySelector('#admin-dialog-create')?.addEventListener('click', async event => {
      const setId = state.dialogSetId;
      if (!setId) return;
      const button = event.currentTarget;
      setBusy(button, 'Đang tạo...');
      try {
        const result = await onCreateAssignment(setId);
        if (!assignmentList.some(item => item.code === result.assignment.code)) assignmentList.unshift(result.assignment);
        const copied = await copyText(result.url);
        state.dialogSetId = null;
        state.toast = copied ? `Đã tạo và copy ${result.assignment.slug}-${result.assignment.code}` : `Đã tạo ${result.assignment.slug}-${result.assignment.code}`;
        render();
        const toast = root.querySelector('.admin-toast');
        window.setTimeout(() => {
          state.toast = '';
          toast?.remove();
        }, 2400);
      } catch (error) {
        state.toast = error?.message ?? 'Không tạo được link.';
        state.dialogSetId = null;
        render();
      }
    });

    root.querySelectorAll('[data-copy-assignment]').forEach(button => button.addEventListener('click', async () => {
      const copied = await copyText(button.dataset.copyAssignment);
      button.textContent = copied ? 'Đã copy' : 'Copy lỗi';
      window.setTimeout(() => { if (button.isConnected) button.textContent = 'Copy'; }, 1200);
    }));

    root.querySelectorAll('[data-toggle-assignment]').forEach(button => button.addEventListener('click', async () => {
      setBusy(button, 'Đang lưu...');
      await onToggleAssignment(button.dataset.toggleAssignment, button.dataset.active !== 'true');
    }));

    root.querySelectorAll('[data-open-session]').forEach(button => button.addEventListener('click', () => onOpenSession(button.dataset.openSession)));
  };

  render();
}

function renderExplorerToolbar(state) {
  return `
    <div class="admin-explorer-toolbar">
      <div class="admin-toolbar-nav">
        <button class="admin-tool-icon" id="admin-up-btn" type="button" title="Lên thư mục cha" ${state.view !== 'lessons' ? 'disabled' : ''}>↑</button>
        <button class="admin-tool-icon" id="admin-refresh-btn" type="button" title="Làm mới dữ liệu">↻</button>
      </div>
      <label class="admin-search-box">
        <span>⌕</span>
        <input id="admin-explorer-search" type="search" placeholder="Tìm tên bài, Unit, slug, Set ID..." value="${escAttr(state.searchQuery)}" ${state.view !== 'lessons' ? 'disabled' : ''} />
      </label>
      <div class="admin-toolbar-actions">
        <span class="admin-toolbar-role">ADMIN</span>
        <button class="ghost-btn admin-compact-btn" id="admin-signout-btn" type="button">Đăng xuất</button>
      </div>
    </div>`;
}

function renderExplorerBreadcrumb(tree, state) {
  if (state.view === 'assignments') return '<nav class="admin-breadcrumb"><span>Bài tập</span><b>›</b><strong>Link đã giao</strong></nav>';
  if (state.view === 'results') return '<nav class="admin-breadcrumb"><span>Bài tập</span><b>›</b><strong>Kết quả học sinh</strong></nav>';
  if (state.searchQuery.trim()) return `<nav class="admin-breadcrumb"><span>Bài tập</span><b>›</b><strong>Tìm kiếm: ${esc(state.searchQuery)}</strong></nav>`;
  const crumbs = folderBreadcrumbs(tree, state.selectedFolderId);
  return `<nav class="admin-breadcrumb" aria-label="Đường dẫn thư mục">${crumbs.map((crumb, index) => `
    ${index ? '<b>›</b>' : ''}<button type="button" data-breadcrumb-folder="${escAttr(crumb.id)}">${esc(crumb.label)}</button>`).join('')}</nav>`;
}

function renderTreeRoot(tree, state) {
  return `
    <div class="admin-tree">
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
  return `
    <div class="admin-tree-branch">
      <div class="admin-tree-row depth-${Math.min(depth, 5)} ${state.view === 'lessons' && state.selectedFolderId === node.id ? 'is-selected' : ''}" style="--tree-depth:${depth}">
        ${expandable
          ? `<button class="admin-tree-toggle" type="button" data-folder-toggle="${escAttr(node.id)}" aria-label="${expanded ? 'Thu gọn' : 'Mở'} ${escAttr(node.label)}">${expanded ? '▼' : '▶'}</button>`
          : '<span class="admin-tree-spacer"></span>'}
        <button class="admin-tree-label" type="button" data-folder-select="${escAttr(node.id)}"><span>${expanded ? '📂' : '📁'}</span><span>${esc(node.label)}</span></button>
        <small>${folderLessonCount(node)}</small>
      </div>
      ${expanded ? childFolders.map(child => renderTreeFolder(child, state, depth + 1)).join('') : ''}
    </div>`;
}

function renderExplorerContent({ tree, state, sets, setById, assignments, sessions, assignmentUrlFor }) {
  if (state.view === 'assignments') return renderAssignmentsView(assignments, sessions, setById, assignmentUrlFor);
  if (state.view === 'results') return renderResultsView(sessions, setById);
  return renderLessonsView(tree, state, sets);
}

function renderLessonsView(tree, state, sets) {
  const query = state.searchQuery.trim();
  const entries = query ? [] : folderEntries(tree, state.selectedFolderId);
  const folderRows = entries.filter(entry => entry.type === 'folder');
  const directSets = entries.filter(entry => entry.type === 'lesson').map(entry => entry.descriptor);
  const candidateSets = query ? searchLessonDescriptors(sets, query) : directSets;
  const visibleSets = candidateSets.filter(set => lessonMatchesType(set, state.typeFilter));
  const selectedSet = sets.find(set => set.id === state.selectedSetId) ?? null;
  const currentNode = findAdminTreeNode(tree, state.selectedFolderId);
  const title = query ? 'Kết quả tìm kiếm' : currentNode?.label ?? 'Bài tập';

  return `
    <div class="admin-explorer-content-head">
      <div><p class="eyebrow">LESSONS</p><h1>${esc(title)}</h1></div>
      <span>${query ? visibleSets.length : folderLessonCount(currentNode)} bài</span>
    </div>
    <div class="admin-filter-strip" aria-label="Lọc dạng bài">
      ${[['all','Tất cả'],['mcq','MCQ'],['typing','Typing'],['tf','T/F'],['mix','Mix']].map(([value, label]) => `<button type="button" data-type-filter="${value}" class="${state.typeFilter === value ? 'is-active' : ''}">${label}</button>`).join('')}
    </div>
    <div class="admin-file-layout">
      <div class="admin-file-list-wrap">
        <table class="admin-file-table">
          <thead><tr><th>Tên</th><th>Dạng</th><th>Câu</th><th>Mastery</th><th>Version</th></tr></thead>
          <tbody>
            ${folderRows.map(folder => renderFolderListRow(folder)).join('')}
            ${visibleSets.map(set => renderLessonListRow(set, state.selectedSetId === set.id, query ? lessonLocation(tree, set) : '')).join('')}
            ${folderRows.length + visibleSets.length ? '' : '<tr><td colspan="5" class="admin-empty-cell">Không có bài phù hợp.</td></tr>'}
          </tbody>
        </table>
      </div>
      ${renderLessonSelectionPanel(selectedSet)}
    </div>`;
}

function renderFolderListRow(folder) {
  return `<tr class="admin-folder-list-row">
    <td colspan="5"><button type="button" data-folder-select="${escAttr(folder.id)}"><span>📁</span><strong>${esc(folder.label)}</strong><small>${folderLessonCount(folder)} bài</small></button></td>
  </tr>`;
}

function renderLessonListRow(set, selected, location) {
  return `<tr class="admin-lesson-row ${selected ? 'is-selected' : ''}" tabindex="0" data-select-set="${escAttr(set.id)}">
    <td><div class="admin-file-name"><span>📄</span><div><strong>${esc(set.title)}</strong>${location ? `<small>${esc(location)}</small>` : `<small>${esc(set.unit)}</small>`}</div></div></td>
    <td><span class="admin-type-badge">${esc(typeSummary(set.activityTypes))}</span></td>
    <td>${Number(set.itemCount)}</td>
    <td>${Number(set.passThreshold)}%</td>
    <td>v${Number(set.version)}</td>
  </tr>`;
}

function renderLessonSelectionPanel(set) {
  if (!set) return `
    <aside class="admin-selection-panel is-empty">
      <div class="admin-selection-icon">📄</div>
      <strong>Chọn một bài</strong>
      <p>Click một dòng để xem thông tin nhanh. Double-click hoặc Enter để mở nội dung.</p>
    </aside>`;
  return `
    <aside class="admin-selection-panel">
      <p class="eyebrow">SELECTED</p>
      <h2>${esc(set.title)}</h2>
      <p>${esc(set.course)} · ${esc(set.unit)}</p>
      <dl>
        <div><dt>Dạng</dt><dd>${esc(typeSummary(set.activityTypes))}</dd></div>
        <div><dt>Số câu</dt><dd>${Number(set.itemCount)}</dd></div>
        <div><dt>Mastery</dt><dd>${Number(set.passThreshold)}%</dd></div>
        <div><dt>Set ID</dt><dd><code>${esc(set.id)}</code></dd></div>
        <div><dt>Link name</dt><dd><code>${esc(set.assignmentSlug)}</code></dd></div>
      </dl>
      <div class="admin-selection-actions">
        <button class="secondary-btn admin-compact-btn" type="button" data-inspect-set="${escAttr(set.id)}">Xem nội dung</button>
        <button class="ghost-btn admin-compact-btn" type="button" data-preview-set="${escAttr(set.id)}">Preview</button>
        <button class="primary-btn admin-compact-btn" type="button" data-create-assignment="${escAttr(set.id)}">Tạo link</button>
      </div>
    </aside>`;
}

function renderAssignmentsView(assignments, sessions, setById, assignmentUrlFor) {
  const sessionCounts = new Map();
  sessions.forEach(session => {
    if (!session.assignmentId) return;
    sessionCounts.set(session.assignmentId, (sessionCounts.get(session.assignmentId) ?? 0) + 1);
  });
  return `
    <div class="admin-explorer-content-head"><div><p class="eyebrow">ASSIGNMENTS</p><h1>Link đã giao</h1></div><span>${assignments.length} link</span></div>
    <div class="admin-file-list-wrap is-full">
      <table class="admin-file-table admin-assignment-table">
        <thead><tr><th>Bài</th><th>Link dễ đọc</th><th>Trạng thái</th><th>Học sinh</th><th>Tạo lúc</th><th>Thao tác</th></tr></thead>
        <tbody>${assignments.length ? assignments.map(assignment => {
          const set = setById.get(assignment.setId);
          const url = assignmentUrlFor(assignment);
          return `<tr>
            <td><strong>${esc(set?.title ?? assignment.title ?? assignment.setId)}</strong><small>${esc(set?.unit ?? '')}</small></td>
            <td><code>${esc(`${assignment.slug}-${assignment.code}`)}</code></td>
            <td><span class="admin-status ${assignment.active ? 'is-open' : 'is-closed'}">${assignment.active ? 'Đang mở' : 'Đã đóng'}</span></td>
            <td>${sessionCounts.get(assignment.code) ?? 0}</td>
            <td>${formatDate(assignment.createdAt)}</td>
            <td class="admin-row-actions"><button class="ghost-btn admin-mini-btn" type="button" data-copy-assignment="${escAttr(url)}">Copy</button><button class="ghost-btn admin-mini-btn" type="button" data-toggle-assignment="${escAttr(assignment.code)}" data-active="${assignment.active ? 'true' : 'false'}">${assignment.active ? 'Đóng' : 'Mở lại'}</button></td>
          </tr>`;
        }).join('') : '<tr><td colspan="6" class="admin-empty-cell">Chưa tạo assignment link nào.</td></tr>'}</tbody>
      </table>
    </div>`;
}

function renderResultsView(sessions, setById) {
  return `
    <div class="admin-explorer-content-head"><div><p class="eyebrow">RESULTS</p><h1>Kết quả học sinh</h1></div><span>${sessions.length} session</span></div>
    <div class="admin-file-list-wrap is-full">
      <table class="admin-file-table admin-results-table">
        <thead><tr><th>Học sinh</th><th>Bài</th><th>Assignment</th><th>Attempts</th><th>Trạng thái</th><th>Cập nhật</th><th></th></tr></thead>
        <tbody>${sessions.length ? sessions.map(session => {
          const set = setById.get(session.setId);
          return `<tr>
            <td><strong>${esc(session.studentName || 'Không có tên')}</strong></td>
            <td>${esc(set?.title ?? session.setId)}</td>
            <td><code>${esc(session.assignmentId ?? 'Legacy')}</code></td>
            <td>${Number(session.attemptCount ?? 0)}</td>
            <td>${esc(statusLabel(session.status))}</td>
            <td>${formatDate(session.syncedAt ?? session.submittedAt ?? session.startedAt)}</td>
            <td><button class="ghost-btn admin-mini-btn" type="button" data-open-session="${escAttr(session.id)}">Xem</button></td>
          </tr>`;
        }).join('') : '<tr><td colspan="7" class="admin-empty-cell">Chưa có dữ liệu học sinh trên Firebase.</td></tr>'}</tbody>
      </table>
    </div>`;
}

function renderExplorerStatus(tree, state, sets) {
  let count = sets.length;
  if (state.view === 'lessons' && !state.searchQuery.trim()) count = folderLessonCount(findAdminTreeNode(tree, state.selectedFolderId));
  if (state.view === 'lessons' && state.searchQuery.trim()) count = searchLessonDescriptors(sets, state.searchQuery).filter(set => lessonMatchesType(set, state.typeFilter)).length;
  return `<footer class="admin-statusbar"><span>${state.view === 'lessons' ? `${count} bài` : state.view === 'assignments' ? 'Assignment links' : 'Learner sessions'}</span><span>Firebase ✓ · ${typeof navigator !== 'undefined' && navigator.onLine === false ? 'Offline' : 'Online ✓'}</span></footer>`;
}

function renderAssignmentDialog(set) {
  if (!set) return '';
  return `<dialog id="admin-assignment-dialog" class="admin-assignment-dialog">
    <div class="admin-dialog-head"><div><p class="eyebrow">TẠO LINK GIAO BÀI</p><h2>${esc(set.title)}</h2></div><button class="admin-dialog-x" id="admin-dialog-cancel" type="button" aria-label="Đóng">×</button></div>
    <div class="admin-dialog-summary"><span>${esc(set.course)}</span><span>${esc(set.unit)}</span><span>${esc(typeSummary(set.activityTypes))}</span><span>${Number(set.itemCount)} câu</span></div>
    <label>Link name<input value="${escAttr(set.assignmentSlug)}-XXXXXX" readonly /></label>
    <p>Mã 6 ký tự cuối sẽ được Firebase tạo riêng cho lần giao này.</p>
    <div class="admin-dialog-actions"><button class="ghost-btn" id="admin-dialog-cancel-bottom" type="button">Hủy</button><button class="primary-btn" id="admin-dialog-create" type="button">Tạo & Copy link</button></div>
  </dialog>`;
}

export function renderLessonInspector({ root, set, onBack, onPreview, onCreateAssignment }) {
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
            <code>${esc(set.assignmentSlug)}</code>
          </div>
        </section>
        <div class="admin-inspector-actions">
          <button class="secondary-btn" id="admin-preview-btn" type="button">Xem như học sinh</button>
          <button class="primary-btn" id="admin-create-link-btn" type="button">Tạo link giao bài</button>
          <p id="admin-create-link-status" class="copy-status"></p>
        </div>
        <section class="admin-question-list">
          ${set.items.map((item, index) => renderQuestion(item, index)).join('')}
        </section>
      </section>
    </main>`;

  root.querySelector('#admin-back-btn')?.addEventListener('click', onBack);
  root.querySelector('#admin-preview-btn')?.addEventListener('click', onPreview);
  root.querySelector('#admin-create-link-btn')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    const status = root.querySelector('#admin-create-link-status');
    setBusy(button, 'Đang tạo...');
    try {
      const result = await onCreateAssignment();
      const copied = await copyText(result.url);
      if (status) status.innerHTML = `${copied ? '✓ Đã copy: ' : ''}<code>${esc(result.url)}</code>`;
    } catch (error) {
      if (status) status.textContent = error?.message ?? 'Không tạo được link.';
    } finally {
      resetBusy(button, 'Tạo link giao bài');
    }
  });
}

export function renderAdminSessionDetail({ root, session, attempts, set, onBack }) {
  const mastery = masteryDisplayPercent(attempts, set?.items?.length ?? set?.itemCount ?? 1);
  root.innerHTML = `
    <main class="page admin-page">
      ${adminTopbar({ subtitle: 'Student Result' })}
      <section class="shell admin-shell">
        <button class="ghost-btn" id="admin-back-btn" type="button">← Dashboard</button>
        <section class="admin-result-head">
          <div>
            <p class="eyebrow">STUDENT SESSION</p>
            <h1>${esc(session.studentName || 'Không có tên')}</h1>
            <p>${esc(set?.title ?? session.setId)}</p>
          </div>
          <div class="admin-result-score"><span>Mastery</span><strong>${mastery}%</strong></div>
        </section>
        <div class="admin-result-grid">
          <div><span>Assignment</span><strong>${esc(session.assignmentId ?? 'Legacy')}</strong></div>
          <div><span>Set</span><strong>${esc(session.setId)}</strong></div>
          <div><span>Trạng thái</span><strong>${esc(statusLabel(session.status))}</strong></div>
          <div><span>Tổng attempt</span><strong>${attempts.length}</strong></div>
        </div>
        <section class="admin-question-list">
          ${attempts.map((attempt, index) => `
            <article class="admin-attempt ${attempt.correct ? 'is-correct' : 'is-wrong'}">
              <div><strong>#${index + 1} · ${esc(attempt.itemId)}</strong><span>${esc(typeLabel(attempt.questionType))}</span></div>
              <p>Trả lời: <code>${esc(displayValue(attempt.submittedAnswer ?? attempt.submittedResponse))}</code></p>
              <small>${attempt.correct ? '✓ Đúng' : '✗ Sai'} · ${formatDuration(attempt.responseDurationMs)} · ${formatDate(attempt.submittedAt)}</small>
            </article>`).join('') || '<p class="admin-empty">Session chưa có attempt.</p>'}
        </section>
      </section>
    </main>`;
  root.querySelector('#admin-back-btn')?.addEventListener('click', onBack);
}

function renderQuestion(item, index) {
  const type = questionTypeForItem(item);
  const answer = expectedResponseDisplay(item);
  const choices = Array.isArray(item.choices)
    ? `<ul>${item.choices.map(choice => `<li>${esc(choice.text ?? choice.label ?? choice.id)}</li>`).join('')}</ul>`
    : '';
  const feedback = item.teachingFeedback ?? {};
  return `
    <article class="admin-question-card">
      <div class="admin-question-head"><strong>Câu ${index + 1}</strong><span>${esc(typeLabel(type))}</span></div>
      <p class="admin-question-prompt">${esc(item.prompt ?? item.vi ?? item.en ?? item.id)}</p>
      ${choices}
      <div class="admin-answer-box"><span>Đáp án</span><strong>${esc(displayValue(answer))}</strong></div>
      ${feedback.reason ? `<p><strong>Giải thích:</strong> ${esc(feedback.reason)}</p>` : ''}
      ${feedback.theory ? `<p><strong>Lý thuyết:</strong> ${esc(feedback.theory)}</p>` : ''}
      ${feedback.example ? `<p><strong>Ví dụ:</strong> ${esc(feedback.example)}</p>` : ''}
    </article>`;
}

function adminTopbar({ subtitle }) {
  return `<header class="admin-topbar shell"><div class="brand-lockup"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div><span>${esc(subtitle)}</span></header>`;
}

function lessonLocation(tree, set) {
  return folderBreadcrumbs(tree, set.folderId).slice(1).map(crumb => crumb.label).join(' / ');
}

function expandBreadcrumbAncestors(tree, folderId, expanded) {
  folderBreadcrumbs(tree, folderId).slice(1, -1).forEach(crumb => expanded.add(crumb.id));
}

function readExplorerState() {
  try {
    const value = JSON.parse(localStorage.getItem(EXPLORER_STATE_KEY) ?? '{}');
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

function writeExplorerState(value) {
  try {
    localStorage.setItem(EXPLORER_STATE_KEY, JSON.stringify(value));
  } catch {
    // Admin navigation remains usable when browser storage is unavailable.
  }
}

function typeSummary(types) {
  const list = Array.isArray(types) ? types : [];
  return list.length === 1 ? typeLabel(list[0]) : 'MIX';
}

function typeLabel(type) {
  return ({
    typing: 'Typing',
    mcq: 'MCQ',
    true_false: 'True/False',
    sentence_order: 'Order',
    matching: 'Match',
    fill_blank: 'Fill',
    reading: 'Reading',
    writing: 'Writing',
    speaking: 'Speaking'
  })[type] ?? String(type ?? 'Unknown');
}

function statusLabel(status) {
  return ({ active: 'Đang làm', extended: 'Làm thêm', passed: 'Đạt', submitted: 'Đã nộp', abandoned: 'Đã thoát' })[status] ?? String(status ?? '');
}

function formatDate(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(number));
}

function formatDuration(value) {
  const ms = Number(value);
  if (!Number.isFinite(ms)) return '—';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function displayValue(value) {
  if (Array.isArray(value)) return value.join(' → ');
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  return String(value ?? '—');
}

function setBusy(button, label) {
  if (!button) return;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.textContent = label;
}

function resetBusy(button, label) {
  if (!button) return;
  button.disabled = false;
  button.removeAttribute('aria-busy');
  button.textContent = label;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.className = 'clipboard-probe';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      return copied;
    } catch {
      return false;
    }
  }
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function escAttr(value) {
  return esc(value).replace(/`/g, '&#96;');
}
