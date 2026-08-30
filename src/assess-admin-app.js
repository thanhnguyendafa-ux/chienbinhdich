import { firebaseConfig } from './config/firebaseConfig.js';
import { createFirebaseAdminRepository } from './repositories/adminRepository.js';
import { createAdminLessonSettingsRepository } from './repositories/adminLessonSettingsRepository.js';
import { createAdminLessonContentRepository } from './repositories/adminLessonContentRepository.js';
import { createAssessDeliveryRepository } from './repositories/assessDeliveryRepository.js';
import { listSetDescriptors, loadLessonSet } from './repositories/lessonRepository.js';
import {
  applyLessonContentOverride,
  applyLessonMasterySetting,
  applySessionMasterySnapshot
} from './services/effectiveLessonService.js';
import { deriveAssessSummary } from './core/assessSummary.js';
import { isAssessSession } from './core/deliveryMode.js';
import { validateAssessDelivery } from './core/assessScoringPolicy.js';

const root = document.querySelector('#app');
const admin = createFirebaseAdminRepository(firebaseConfig.project);
const settingsRepository = createAdminLessonSettingsRepository(firebaseConfig.project);
const contentRepository = createAdminLessonContentRepository(firebaseConfig.project);
const deliveryRepository = createAssessDeliveryRepository(firebaseConfig.project);

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
  const sessions = (await admin.listSessions(100)).filter(isAssessSession);
  const rows = await Promise.all(sessions.map(loadAssessRow));
  applyBaselineLabels(rows);

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
                ${descriptors.map(set => `<option value="${escAttr(set.id)}">${esc(set.course)} · ${esc(set.unit)} · ${esc(set.title)}</option>`).join('')}
              </select>
            </label>
            <button type="submit" class="primary-btn">Tạo link Assess</button>
          </form>
          <div data-issued-link></div>
        </section>
        <section class="shell assess-results-panel">
          <div class="assess-results-heading">
            <div><h1>Kết quả Assess</h1><p>Điểm được derive từ Attempt log bằng một scoring owner.</p></div>
            <button class="secondary-btn" type="button" data-refresh>↻ Làm mới</button>
          </div>
          ${renderResultsTable(rows)}
        </section>
        <section class="shell assess-detail-panel" data-assess-detail>
          <h2>Chi tiết</h2>
          <p>Chọn “Xem” ở một lượt Assess để kiểm tra từng câu.</p>
        </section>
      </section>
    </main>`;

  root.querySelector('[data-signout]')?.addEventListener('click', async () => {
    await admin.signOutAdmin();
    window.location.reload();
  });
  root.querySelector('[data-refresh]')?.addEventListener('click', renderDashboard);
  root.querySelector('[data-issue-assess]')?.addEventListener('submit', issueAssess);
  root.querySelectorAll('[data-session-id]').forEach(button => button.addEventListener('click', () => renderDetail(button.dataset.sessionId, rows)));
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
    const lesson = await loadAdminEffectiveLesson(setId);
    validateAssessDelivery(lesson);
    const delivery = await deliveryRepository.createDelivery(lesson);
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

async function loadAssessRow(session) {
  try {
    const [detail, lesson] = await Promise.all([
      admin.getSessionDetail(session.id),
      loadAdminHistoricalAssessLesson(session)
    ]);
    const summary = deriveAssessSummary(detail.attempts, lesson, {
      typingTolerance: session.typingToleranceAtStart === true
    });
    return {
      session,
      attempts: detail.attempts,
      lesson,
      summary,
      label: '',
      error: null
    };
  } catch (error) {
    return { session, attempts: [], lesson: null, summary: null, label: '', error };
  }
}

function applyBaselineLabels(rows) {
  const groups = new Map();
  for (const row of [...rows].sort((a, b) => Number(a.session.startedAt ?? 0) - Number(b.session.startedAt ?? 0))) {
    const key = `${String(row.session.studentName).trim().toLocaleLowerCase('vi')}::${row.session.setId}`;
    const count = groups.get(key) ?? 0;
    row.label = count === 0 ? 'BASELINE' : 'RETEST';
    groups.set(key, count + 1);
  }
}

function renderResultsTable(rows) {
  if (!rows.length) return '<p>Chưa có lượt Assess nào.</p>';
  return `
    <div class="assess-table-wrap">
      <table class="assess-results-table">
        <thead><tr><th>Học sinh</th><th>Mode</th><th>Bài</th><th>Điểm</th><th>Đúng/Tổng</th><th>Thời gian</th><th>Lần</th><th>Cập nhật</th><th></th></tr></thead>
        <tbody>
          ${rows.map(row => {
            const summary = row.summary;
            return `<tr>
              <td>${esc(row.session.studentName)}</td>
              <td><span class="assess-mode-badge small">ASSESS</span></td>
              <td>${esc(row.session.setId)}</td>
              <td>${summary ? `<strong>${formatPercent(summary.percent)}</strong>` : '—'}</td>
              <td>${summary ? `${summary.correct}/${summary.assessableTotal}` : '—'}</td>
              <td>${formatDuration(durationFor(row.session))}</td>
              <td>${esc(row.label)}</td>
              <td>${formatDate(row.session.submittedAt ?? row.session.syncedAt ?? row.session.startedAt)}</td>
              <td><button class="ghost-btn" type="button" data-session-id="${escAttr(row.session.id)}">Xem</button></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderDetail(sessionId, rows) {
  const row = rows.find(candidate => candidate.session.id === sessionId);
  const target = root.querySelector('[data-assess-detail]');
  if (!row || !target) return;
  if (row.error || !row.summary) {
    target.innerHTML = `<h2>Không tải được chi tiết</h2><p>${esc(row.error?.message ?? 'Không có dữ liệu.')}</p>`;
    return;
  }
  const summary = row.summary;
  target.innerHTML = `
    <div class="assess-detail-head">
      <div><span class="assess-mode-badge">ASSESS · ${esc(row.label)}</span><h2>${esc(row.session.studentName)}</h2><p>${esc(row.lesson.title)}</p></div>
      <strong class="assess-big-score">${formatPercent(summary.percent)}</strong>
    </div>
    <div class="assess-stat-grid">
      <div><strong>${summary.correct}</strong><span>Đúng</span></div>
      <div><strong>${summary.incorrect}</strong><span>Sai</span></div>
      <div><strong>${summary.unanswered}</strong><span>Chưa trả lời</span></div>
      <div><strong>${summary.assessableTotal}</strong><span>Tổng chấm</span></div>
      <div><strong>${formatDuration(durationFor(row.session))}</strong><span>Thời gian</span></div>
    </div>
    <div class="assess-detail-list">
      ${summary.details.map((detail, index) => `
        <article class="assess-detail-item">
          <header><strong>Q${index + 1}</strong><span class="assess-status-${detail.status}">${statusLabel(detail.status)}</span></header>
          <p><b>Học sinh:</b> ${esc(detail.submittedAnswer || '—')}</p>
          <p><b>Đáp án chuẩn:</b> ${esc(detail.expectedAnswer || '—')}</p>
          <small>${formatDuration(detail.responseDurationMs)} · ${detail.pasteDetected ? 'Có paste' : esc(detail.inputMethod)}</small>
        </article>`).join('')}
    </div>`;
}

async function loadAdminEffectiveLesson(setId) {
  const [staticLesson, setting, content] = await Promise.all([
    loadLessonSet(setId),
    settingsRepository.getLessonSetting(setId),
    contentRepository.getCurrentContent(setId)
  ]);
  return applyLessonMasterySetting(applyLessonContentOverride(staticLesson, content), setting);
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

function durationFor(session) {
  return Math.max(0, Number(session.completedAt ?? session.submittedAt ?? session.syncedAt ?? Date.now()) - Number(session.startedAt ?? 0));
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

function formatPercent(value) {
  const number = Number(value ?? 0);
  return `${Number.isInteger(number) ? number : number.toFixed(2)}%`;
}

function formatDuration(ms) {
  const seconds = Math.max(0, Math.round(Number(ms ?? 0) / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function formatDate(value) {
  const date = new Date(Number(value ?? 0));
  return Number.isFinite(date.getTime()) ? date.toLocaleString('vi-VN') : '—';
}

function statusLabel(status) {
  return ({ correct: 'ĐÚNG', incorrect: 'SAI', unanswered: 'CHƯA TRẢ LỜI' })[status] ?? String(status).toUpperCase();
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function escAttr(value) {
  return esc(value);
}
