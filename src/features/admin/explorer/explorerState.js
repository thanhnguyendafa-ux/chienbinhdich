const EXPLORER_STATE_KEY = 'cbd.adminExplorer.state.v3';
const DEFAULT_PREVIEW_WIDTH = 42;
const REVIEW_FILTERS = new Set(['all', 'unreviewed', 'approved', 'needs-edit', 'rereview']);

export function createExplorerState({ tree, findNode, rootId }) {
  const persisted = readExplorerState();
  const selectedFolderId = findNode(tree, persisted.selectedFolderId) ? persisted.selectedFolderId : rootId;
  return {
    view: persisted.view === 'results' ? 'results' : 'lessons',
    selectedFolderId,
    selectedSetId: null,
    expanded: new Set((persisted.expanded ?? []).filter(id => findNode(tree, id))),
    searchQuery: '',
    typeFilter: 'all',
    reviewFilter: REVIEW_FILTERS.has(persisted.reviewFilter) ? persisted.reviewFilter : 'all',
    previewWidth: normalizePreviewWidth(persisted.previewWidth)
  };
}

export function persistExplorerState(state) {
  try {
    localStorage.setItem(EXPLORER_STATE_KEY, JSON.stringify({
      view: state.view,
      selectedFolderId: state.selectedFolderId,
      expanded: [...state.expanded],
      reviewFilter: REVIEW_FILTERS.has(state.reviewFilter) ? state.reviewFilter : 'all',
      previewWidth: normalizePreviewWidth(state.previewWidth)
    }));
  } catch {
    // UI preference persistence must never block Admin usage.
  }
}

export function normalizePreviewWidth(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return DEFAULT_PREVIEW_WIDTH;
  const clamped = Math.min(70, Math.max(30, number));
  return Math.round(clamped / 2) * 2;
}

function readExplorerState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(EXPLORER_STATE_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}
