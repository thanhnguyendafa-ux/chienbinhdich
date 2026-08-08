export function renderStudentHome({ root }) {
  root.innerHTML = `
    <main class="page page-centered access-page">
      <section class="access-card">
        <div class="brand-lockup centered"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
        <p class="eyebrow">KHU VỰC HỌC SINH</p>
        <h1>Mở bài bằng link giáo viên gửi.</h1>
        <p>Con không cần chọn bài trên website. Hãy bấm đúng đường link thầy gửi, nhập tên và bắt đầu làm bài.</p>
        <div class="access-note">Mỗi đường link chỉ dẫn tới đúng bài tập đã được giao.</div>
        <a class="access-admin-link" href="/admin">Giáo viên / Admin đăng nhập</a>
      </section>
    </main>`;
}

export function renderAssignmentUnavailable({ root, title = 'Không mở được bài tập', message }) {
  root.innerHTML = `
    <main class="page page-centered access-page">
      <section class="access-card">
        <div class="brand-lockup centered"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
        <p class="eyebrow">LINK BÀI TẬP</p>
        <h1>${esc(title)}</h1>
        <p>${esc(message ?? 'Link này không còn hợp lệ. Hãy xin lại link từ giáo viên.')}</p>
      </section>
    </main>`;
}

export function renderFirebaseSetupGate({ root }) {
  root.innerHTML = `
    <main class="page page-centered access-page">
      <section class="access-card">
        <div class="brand-lockup centered"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
        <p class="eyebrow">ADMIN SETUP</p>
        <h1>Firebase chưa được bật.</h1>
        <p>Code Admin + Assignment đã sẵn sàng nhưng production vẫn đang khóa Firebase để tránh ghi dữ liệu trước khi Authentication và Firestore Rules được cấu hình.</p>
      </section>
    </main>`;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
