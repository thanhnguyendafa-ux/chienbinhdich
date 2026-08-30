export function renderAssessReceipt({ root, lessonTitle = '', onClose = null }) {
  root.innerHTML = `
    <main class="assess-receipt-page">
      <section class="assess-receipt shell">
        <span class="assess-mode-badge">ASSESS</span>
        <div class="assess-receipt-check" aria-hidden="true">✓</div>
        <h1>ĐÃ NỘP BÀI</h1>
        ${lessonTitle ? `<strong>${esc(lessonTitle)}</strong>` : ''}
        <p>Câu trả lời đã được ghi nhận và gửi cho giáo viên.</p>
        <p>Điểm và đáp án không hiển thị trong chế độ Assess.</p>
        ${onClose ? '<button type="button" class="primary-btn" data-assess-close>Đóng</button>' : ''}
      </section>
    </main>`;
  root.querySelector('[data-assess-close]')?.addEventListener('click', onClose);
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}
