export function renderPersistenceStatus(root, status) {
  const documentRoot = root?.querySelector?.('.report-document');
  if (!documentRoot || !status) return;
  documentRoot.querySelector('[data-persistence-status]')?.remove();

  const state = persistenceDisplay(status);
  documentRoot.querySelector('.report-document-header')?.insertAdjacentHTML('afterend', `
    <aside class="integrity-note persistence-status-note" data-persistence-status aria-live="polite">
      <strong>${esc(state.title)}</strong>
      <p>${esc(state.detail)}</p>
    </aside>`);
}

export function persistenceDisplay(status) {
  const pending = Math.max(0, Number(status?.pendingSessions ?? 0));
  if (status?.mode === 'local-only') {
    return {
      state: 'local-only',
      title: 'Đã lưu trên thiết bị',
      detail: 'Phiên học được giữ trên trình duyệt này.'
    };
  }
  if (pending > 0 || status?.remoteReady !== true) {
    return {
      state: 'pending',
      title: 'Đã lưu trên thiết bị · đang chờ đồng bộ',
      detail: pending > 0
        ? `Còn ${pending} phiên đang chờ đồng bộ lên hệ thống giáo viên. Dữ liệu trên thiết bị vẫn được giữ.`
        : 'Kết nối đồng bộ hiện chưa sẵn sàng. Dữ liệu trên thiết bị vẫn được giữ và hệ thống sẽ thử lại khi kết nối trở lại.'
    };
  }
  return {
    state: 'synced',
    title: 'Đã đồng bộ',
    detail: 'Bản lưu trên thiết bị và hệ thống giáo viên hiện không còn phiên chờ đồng bộ.'
  };
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}
