import { firebaseConfig } from './config/firebaseConfig.js';
import { createFirebaseAdminRepository } from './repositories/adminRepository.js';
import { createAdminLessonContentRepository } from './repositories/adminLessonContentRepository.js';
import { createAssessDeliveryRepository } from './repositories/assessDeliveryRepository.js';
import { listSetDescriptors, loadLessonSet } from './repositories/lessonRepository.js';
import {
  applyLessonContentOverride,
  applyLessonMasterySetting,
  applySessionMasterySnapshot
} from './services/effectiveLessonService.js';
import { createAdminAssessResults } from './features/assess/adminAssessResults.js';

const root = document.querySelector('#app');
const admin = createFirebaseAdminRepository(firebaseConfig.project);
const contentRepository = createAdminLessonContentRepository(firebaseConfig.project);
const deliveryRepository = createAssessDeliveryRepository(firebaseConfig.project);
const assessResults = createAdminAssessResults({ root, admin, loadHistoricalLesson: loadAdminHistoricalAssessLesson });

bootstrap().catch(renderFatal);

async function bootstrap() {
  renderLoading('Đang kiểm tra quyền Admin...');
  const state = await admin.getAdminState();
  if (!state.isAdmin) return renderLogin();
  await renderDashboard();
}

function renderLogin() {
  root.innerHTML = `
    <main class="assess-admin-page">
      <section class="assess-admin-login shell">
        <span class="assess-mode-badge">ADMIN · ASSESS</span>
        <h1>Đăng nhập giáo viên</h1>
        <form data-admin-login>
          <label>Email <input type="email" name="email" required autocomplete="username" /></label>
          <label>Mật khẩu <input type="password" name="password" required autocomplete="current-password" /></label>
          <button type="submit" class="primary-btn">Đăng nhập</button>
        </form>
      </section>
    </main>`;
  root.querySelector('[data-admin-login]')?.addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const button = event.currentTarget.querySelector('button');
    button.disabled = true;
    try {
      await admin.signInAdmin(String(data.get('email') ?? ''), String(data.get('password') ?? ''));
      await renderDashboard();
    } catch (error) {
      button.disabled = false;
      renderInlineError(event.currentTarget, error.message);
    }
  });
}

async function renderDashboard() {
  renderLoading('Đang tải Assess Dashboard...');
  const descriptors = listSetDescriptors();
  const requestedSetId = new URL(window.location.href).searchParams.get('setId') ?? '';

  root.innerHTML = `
    <main class="assess-admin-page">
      <header class="assess-admin-header">
        <div><span class="assess-mode-badge">ADMIN · ASSESS</span><strong>Cold Baseline / Independent Check</strong></div>
        <div class="assess-admin-header-actions">
          <a class="secondary-btn" href="/admin">Admin chính</a>
          <button class="ghost-btn" type="button" data-signout>Đăng xuất</button>
        </div>
      </header>
      <section class="assess-admin-grid">
        <section class="shell assess-issue-panel">
          <h1>Phát hành Assess</h1>
          <p>Mỗi delivery khóa mode + version nội dung tại thời điểm phát hành. Cùng lesson vẫn có thể chạy Mastery song song.</p>
          <form data-issue-assess>
            <label>Chọn bài
              <select name="setId" required>
                <option value="">— Chọn lesson —</option>
                ${descriptors.map(set => `<option value="${escAttr(set.id)}" ${String(set.id) === String(requestedSetId) ? 'selected' : ''}>${esc(set.course)} · ${esc(set.unit)} · ${esc(set.title)}</option>`).join('')}
              </select>
            </label>
            <button type="submit" class="primary-btn">Tạo link Assess</button>
          </form>
          <div data-issued-link></div>
        </section>
        <section class="shell assess-results-panel">
          <div class="assess-results-heading">
            <div>
              <h1>Kết quả Assess</h1>
              <p>Điểm được derive từ Attempt log bằng một scoring owner. Lịch sử chỉ tải khi cần để giảm Firestore reads.</p>
            </div>
            <button class="secondary-btn" type="button" data-refresh>↻ Tải kết quả</button>
          </div>
          <div data-assess-results>
            <p>Nhấn “Tải kết quả” để xem tối đa 25 lượt Assess gần nhất.</p>
          </div>
        </section>
        <section class="shell assess-detail-panel" data-assess-detail>
          <h2>Chi tiết</h2>
          <p>Tải kết quả rồi chọn “Xem” ở một lượt Assess để kiểm tra từng câu.</p>
        </section>
      </section>
    </main>`;

  root.querySelector('[data-signout]')?.addEventListener('click', async () => {
    await admin.signOutAdmin();
    window.location.reload();
  });
  root.querySelector('[data-refresh]')?.addEventListener('click', assessResults.loadResults);
  root.querySelector('[data-issue-assess]')?.addEventListener('submit', issueAssess);
}

async function issueAssess(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  const setId = String(new FormData(form).get('setId') ?? '');
  if (!setId) return;
  button.disabled = true;
  const target = root.querySelector('[data-issued-link]');
  try {
    const delivery = await deliveryRepository.createDelivery(setId);
    const url = deliveryRepository.buildUrl(window.location, delivery);
    target.innerHTML = `
      <div class="assess-issued-card">
        <strong>Assess đã phát hành</strong>
        <code>${esc(url)}</code>
        <button type="button" class="secondary-btn" data-copy-issued>Sao chép link</button>
      </div>`;
    target.querySelector('[data-copy-issued]')?.addEventListener('click', async () => {
      await navigator.clipboard.writeText(url);
      target.querySelector('[data-copy-issued]').textContent = 'Đã sao chép ✓';
    });
  } catch (error) {
    target.innerHTML = `<p class="assess-inline-error">${esc(error.message)}</p>`;
  } finally {
    button.disabled = false;
  }
}

async function loadAdminHistoricalAssessLesson(session) {
  const staticLesson = await loadLessonSet(session.setId);
  const revision = Number(session.contentRevisionAtStart ?? 0);
  const content = revision > 0
    ? await contentRepository.getRevisionContent(session.setId, revision)
    : null;
  const historical = applyLessonMasterySetting(applyLessonContentOverride(staticLesson, content), null);
  return applySessionMasterySnapshot(historical, session);
}

function renderLoading(message) {
  root.innerHTML = `<main class="assess-admin-page"><section class="shell assess-loading-panel"><span class="assess-mode-badge">ADMIN · ASSESS</span><h1>${esc(message)}</h1></section></main>`;
}

function renderFatal(error) {
  console.error(error);
  root.innerHTML = `<main class="assess-admin-page"><section class="shell assess-error"><h1>Không mở được Assess Admin</h1><p>${esc(error?.message ?? 'Unknown error')}</p><button class="primary-btn" type="button" data-reload>Thử lại</button></section></main>`;
  root.querySelector('[data-reload]')?.addEventListener('click', () => window.location.reload());
}

function renderInlineError(form, message) {
  form.querySelector('.assess-inline-error')?.remove();
  form.insertAdjacentHTML('beforeend', `<p class="assess-inline-error">${esc(message)}</p>`);
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function escAttr(value) {
  return esc(value);
}
