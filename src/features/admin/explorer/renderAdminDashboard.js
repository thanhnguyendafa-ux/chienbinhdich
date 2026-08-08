import {
  buildAdminLessonTree,
  findAdminTreeNode,
  folderBreadcrumbs,
  folderLessonCount,
  lessonMatchesType,
  rootFolderId,
  searchLessonDescriptors
} from '../adminTreeModel.js';
import { adminTopbar, copyText } from '../shared/adminUi.js';
import { createLessonPreviewController } from '../preview/lessonPreviewController.js';
import { renderResultsView } from '../results/renderResultsView.js';
import { createExplorerState, normalizePreviewWidth, persistExplorerState } from './explorerState.js';
import { renderExplorerBreadcrumb, renderExplorerSidebar, renderExplorerToolbar } from './renderExplorerChrome.js';
import { renderLessonBrowser } from './renderLessonBrowser.js';
import { attachPreviewSplitter } from './splitPane.js';

export function renderAdminDashboard({
  root,
  folders,
  sets,
  sessions,
  fixedUrlFor,
  loadLesson,
  onInspect,
  onOpenSession,
  onRefresh,
  onSignOut
}) {
  const tree = buildAdminLessonTree(folders, sets);
  const state = createExplorerState({ tree, findNode: findAdminTreeNode, rootId: rootFolderId() });
  const setById = new Map(sets.map(set => [set.id, set]));
  let searchFocus = false;

  expandBreadcrumbAncestors(tree, state.selectedFolderId, state.expanded);

  const previewController = createLessonPreviewController({
    loadLesson,
    onChange: () => render()
  });

  const persist = () => persistExplorerState(state);

  const render = () => {
    const preview = previewController.getState();
    root.innerHTML = `
      <main class="page admin-page admin-explorer-page">
        ${adminTopbar({ subtitle: 'Explorer' })}
        <section class="shell admin-explorer-shell">
          ${renderExplorerToolbar(state)}
          ${renderExplorerBreadcrumb(tree, state)}
          <section class="admin-explorer-workspace">
            ${renderExplorerSidebar(tree, state, sessions.length)}
            <section class="admin-explorer-content">
              ${state.view === 'results'
                ? renderResultsView(sessions, setById)
                : renderLessonBrowser({ tree, state, sets, preview, fixedUrlFor })}
            </section>
          </section>
          ${renderStatus(tree, state, sets)}
        </section>
      </main>`;

    bindEvents();
    if (searchFocus) {
      searchFocus = false;
      const input = root.querySelector('#admin-explorer-search');
      input?.focus();
      input?.setSelectionRange(input.value.length, input.value.length);
    }
  };

  const selectFolder = folderId => {
    state.view = 'lessons';
    state.selectedFolderId = folderId;
    state.selectedSetId = null;
    state.searchQuery = '';
    expandBreadcrumbAncestors(tree, folderId, state.expanded);
    persist();
    previewController.clear();
  };

  const bindEvents = () => {
    root.querySelector('#admin-refresh-btn')?.addEventListener('click', onRefresh);
    root.querySelector('#admin-signout-btn')?.addEventListener('click', onSignOut);

    root.querySelector('#admin-up-btn')?.addEventListener('click', () => {
      const crumbs = folderBreadcrumbs(tree, state.selectedFolderId);
      if (crumbs.length < 2) return;
      selectFolder(crumbs.at(-2).id);
    });

    root.querySelector('#admin-explorer-search')?.addEventListener('input', event => {
      state.searchQuery = event.currentTarget.value;
      state.selectedSetId = null;
      searchFocus = true;
      previewController.clear();
    });

    root.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
      state.view = button.dataset.view === 'results' ? 'results' : 'lessons';
      state.selectedSetId = null;
      persist();
      previewController.clear();
    }));

    root.querySelectorAll('[data-folder-select]').forEach(button => button.addEventListener('click', () => {
      selectFolder(button.dataset.folderSelect);
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
      selectFolder(button.dataset.breadcrumbFolder);
    }));

    root.querySelectorAll('[data-type-filter]').forEach(button => button.addEventListener('click', () => {
      state.typeFilter = button.dataset.typeFilter;
      state.selectedSetId = null;
      previewController.clear();
    }));

    root.querySelectorAll('[data-copy-fixed-link]').forEach(button => button.addEventListener('click', async event => {
      event.stopPropagation();
      const original = button.textContent;
      const copied = await copyText(button.dataset.copyFixedLink);
      button.textContent = copied ? '✓ Copied' : 'Copy lỗi';
      window.setTimeout(() => { if (button.isConnected) button.textContent = original; }, 1100);
    }));

    root.querySelectorAll('[data-select-set]').forEach(row => {
      const choose = () => {
        state.selectedSetId = row.dataset.selectSet;
        previewController.select(state.selectedSetId);
      };
      row.addEventListener('click', choose);
      row.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          choose();
        }
      });
    });

    root.querySelectorAll('[data-preview-full]').forEach(button => button.addEventListener('click', () => onInspect(button.dataset.previewFull)));
    root.querySelectorAll('[data-preview-close]').forEach(button => button.addEventListener('click', () => {
      state.selectedSetId = null;
      previewController.clear();
    }));
    root.querySelectorAll('[data-open-session]').forEach(button => button.addEventListener('click', () => onOpenSession(button.dataset.openSession)));

    const workspace = root.querySelector('[data-lesson-workspace]');
    const splitter = root.querySelector('[data-preview-splitter]');
    attachPreviewSplitter({
      workspace,
      splitter,
      initialWidth: state.previewWidth,
      onCommit: width => {
        state.previewWidth = width;
        persist();
      }
    });
    splitter?.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      state.previewWidth = normalizePreviewWidth(state.previewWidth + (event.key === 'ArrowLeft' ? 2 : -2));
      persist();
      render();
    });
  };

  render();
}

function renderStatus(tree, state, sets) {
  let count = sets.length;
  if (state.view === 'lessons' && !state.searchQuery.trim()) count = folderLessonCount(findAdminTreeNode(tree, state.selectedFolderId));
  if (state.view === 'lessons' && state.searchQuery.trim()) {
    count = searchLessonDescriptors(sets, state.searchQuery).filter(set => lessonMatchesType(set, state.typeFilter)).length;
  }
  return `<footer class="admin-statusbar"><span>${state.view === 'lessons' ? `${count} bài · Fixed links` : 'Learner sessions'}</span><span>Firebase ✓ · ${typeof navigator !== 'undefined' && navigator.onLine === false ? 'Offline' : 'Online ✓'}</span></footer>`;
}

function expandBreadcrumbAncestors(tree, folderId, expanded) {
  const crumbs = folderBreadcrumbs(tree, folderId);
  crumbs.slice(0, -1).forEach(crumb => {
    if (crumb.id !== rootFolderId()) expanded.add(crumb.id);
  });
}
