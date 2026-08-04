export function renderLoading(root, message = 'Đang chuẩn bị...') {
  root.innerHTML = `
    <main class="loading-page" role="status" aria-live="polite">
      <section class="loading-panel">
        <div class="brand-lockup"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
        <div class="loading-rule" aria-hidden="true"><span></span></div>
        <p>${escapeHtml(message)}</p>
      </section>
    </main>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
