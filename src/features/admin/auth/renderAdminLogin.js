import { esc, setBusy } from '../shared/adminUi.js';

export function renderAdminLogin({ root, errorMessage = '', onSubmit }) {
  root.innerHTML = `
    <main class="page page-centered admin-login-page">
      <section class="admin-login-card">
        <div class="brand-lockup centered"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
        <p class="eyebrow">ADMIN</p>
        <h1>Đăng nhập quản trị</h1>
        <p>Thư viện bài và dữ liệu học sinh chỉ dành cho tài khoản Admin.</p>
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
