import { esc, escAttr, formatDate, statusLabel } from '../shared/adminUi.js';

export function renderResultsView(sessions, setById) {
  return `<div class="admin-explorer-content-head"><div><p class="eyebrow">RESULTS</p><h1>Kết quả học sinh</h1></div><span>${sessions.length} session</span></div>
    <div class="admin-file-list-wrap is-full">
      <table class="admin-file-table admin-results-table">
        <thead><tr><th>Học sinh</th><th>Bài</th><th>Nguồn</th><th>Attempts</th><th>Trạng thái</th><th>Cập nhật</th><th></th></tr></thead>
        <tbody>${sessions.length ? sessions.map(session => {
          const set = setById.get(session.setId);
          const source = session.entryMode === 'fixed-link'
            ? session.accessSlug ?? 'Fixed link'
            : session.assignmentId ?? 'Legacy';
          return `<tr>
            <td><strong>${esc(session.studentName || 'Không có tên')}</strong></td>
            <td>${esc(set?.title ?? session.setId)}</td>
            <td><code>${esc(source)}</code></td>
            <td>${Number(session.attemptCount ?? 0)}</td>
            <td>${esc(statusLabel(session.status))}</td>
            <td>${formatDate(session.syncedAt ?? session.submittedAt ?? session.startedAt)}</td>
            <td><button class="ghost-btn admin-mini-btn" type="button" data-open-session="${escAttr(session.id)}">Xem</button></td>
          </tr>`;
        }).join('') : '<tr><td colspan="7" class="admin-empty-cell">Chưa có dữ liệu học sinh trên Firebase.</td></tr>'}</tbody>
      </table>
    </div>`;
}
