import { expectedResponseDisplay, questionTypeForItem } from '../../core/questionTypes.js';
import { masteryDisplayPercent } from '../../core/masteryEngine.js';

export function renderAdminLogin({ root, errorMessage = '', onSubmit }) {
  root.innerHTML = `
    <main class="page page-centered admin-login-page">
      <section class="admin-login-card">
        <div class="brand-lockup centered"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
        <p class="eyebrow">ADMIN</p>
        <h1>Đăng nhập quản trị</h1>
        <p>Thư viện bài, link giao bài và dữ liệu học sinh chỉ dành cho tài khoản Admin.</p>
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

export function renderAdminDashboard({
  root,
  folders,
  sets,
  assignments,
  sessions,
  assignmentUrlFor,
  onInspect,
  onPreview,
  onCreateAssignment,
  onToggleAssignment,
  onOpenSession,
  onRefresh,
  onSignOut
}) {
  const setById = new Map(sets.map(set => [set.id, set]));
  root.innerHTML = `
    <main class="page admin-page">
      ${adminTopbar({ subtitle: 'Dashboard' })}
      <section class="shell admin-shell">
        <section class="admin-hero">
          <div>
            <p class="eyebrow">CHIẾN BINH DỊCH · ADMIN</p>
            <h1>Quản lý bài, link giao bài và kết quả.</h1>
            <p>Học sinh không thấy thư viện này. Mỗi em chỉ mở đúng assignment link anh gửi.</p>
          </div>
          <div class="admin-hero-actions">
            <button class="secondary-btn" id="admin-refresh-btn" type="button">Làm mới dữ liệu</button>
            <button class="ghost-btn" id="admin-signout-btn" type="button">Đăng xuất</button>
          </div>
        </section>

        <section class="admin-section">
          <div class="admin-section-head"><div><p class="eyebrow">LESSONS</p><h2>Thư viện bài tập</h2></div><span>${sets.length} bài</span></div>
          <div class="admin-folder-stack">
            ${folders.map(folder => `
              <section class="admin-folder">
                <div class="admin-folder-head"><strong>${esc(folder.name)}</strong><span>${sets.filter(set => set.folderId === folder.id).length} bài</span></div>
                <div class="admin-set-grid">
                  ${sets.filter(set => set.folderId === folder.id).map(renderSetCard).join('') || '<p class="admin-empty">Chưa có bài.</p>'}
                </div>
              </section>`).join('')}
          </div>
        </section>

        <section class="admin-section">
          <div class="admin-section-head"><div><p class="eyebrow">ASSIGNMENTS</p><h2>Link đã tạo</h2></div><span>${assignments.length} link</span></div>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Bài</th><th>Link dễ đọc</th><th>Trạng thái</th><th>Tạo lúc</th><th></th></tr></thead>
              <tbody>
                ${assignments.length ? assignments.map(assignment => renderAssignmentRow(assignment, setById, assignmentUrlFor)).join('') : '<tr><td colspan="5">Chưa tạo assignment link nào.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>

        <section class="admin-section">
          <div class="admin-section-head"><div><p class="eyebrow">RESULTS</p><h2>Kết quả học sinh</h2></div><span>${sessions.length} session gần nhất</span></div>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Học sinh</th><th>Bài</th><th>Lượt trả lời</th><th>Trạng thái</th><th>Cập nhật</th><th></th></tr></thead>
              <tbody>
                ${sessions.length ? sessions.map(session => renderSessionRow(session, setById)).join('') : '<tr><td colspan="6">Chưa có dữ liệu học sinh trên Firebase.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>`;

  root.querySelector('#admin-refresh-btn')?.addEventListener('click', onRefresh);
  root.querySelector('#admin-signout-btn')?.addEventListener('click', onSignOut);

  root.querySelectorAll('[data-inspect-set]').forEach(button => button.addEventListener('click', () => onInspect(button.dataset.inspectSet)));
  root.querySelectorAll('[data-preview-set]').forEach(button => button.addEventListener('click', () => onPreview(button.dataset.previewSet)));
  root.querySelectorAll('[data-create-assignment]').forEach(button => button.addEventListener('click', async () => {
    const setId = button.dataset.createAssignment;
    const status = root.querySelector(`[data-create-status="${cssEscape(setId)}"]`);
    setBusy(button, 'Đang tạo...');
    try {
      const result = await onCreateAssignment(setId);
      const copied = await copyText(result.url);
      if (status) status.innerHTML = `${copied ? '✓ Đã copy: ' : ''}<code>${esc(result.url)}</code>`;
    } catch (error) {
      if (status) status.textContent = error?.message ?? 'Không tạo được link.';
    } finally {
      resetBusy(button, 'Tạo link');
    }
  }));

  root.querySelectorAll('[data-copy-assignment]').forEach(button => button.addEventListener('click', async () => {
    const url = button.dataset.copyAssignment;
    const copied = await copyText(url);
    button.textContent = copied ? 'Đã copy' : 'Copy lỗi';
    window.setTimeout(() => { if (button.isConnected) button.textContent = 'Copy'; }, 1200);
  }));

  root.querySelectorAll('[data-toggle-assignment]').forEach(button => button.addEventListener('click', async () => {
    setBusy(button, 'Đang lưu...');
    await onToggleAssignment(button.dataset.toggleAssignment, button.dataset.active !== 'true');
  }));

  root.querySelectorAll('[data-open-session]').forEach(button => button.addEventListener('click', () => onOpenSession(button.dataset.openSession)));
}

export function renderLessonInspector({ root, set, onBack, onPreview, onCreateAssignment }) {
  root.innerHTML = `
    <main class="page admin-page">
      ${adminTopbar({ subtitle: 'Lesson Inspector' })}
      <section class="shell admin-shell">
        <button class="ghost-btn" id="admin-back-btn" type="button">← Dashboard</button>
        <section class="admin-inspector-head">
          <div>
            <p class="eyebrow">${esc(set.course)} · ${esc(set.unit)}</p>
            <h1>${esc(set.title)}</h1>
            <p>${esc(set.description)}</p>
          </div>
          <div class="admin-inspector-meta">
            <span>${set.items.length} câu</span>
            <span>${esc(typeSummary(set.activityTypes))}</span>
            <span>Mastery ≥ ${set.passThreshold}%</span>
            <code>${esc(set.assignmentSlug)}</code>
          </div>
        </section>
        <div class="admin-inspector-actions">
          <button class="secondary-btn" id="admin-preview-btn" type="button">Xem như học sinh</button>
          <button class="primary-btn" id="admin-create-link-btn" type="button">Tạo link giao bài</button>
          <p id="admin-create-link-status" class="copy-status"></p>
        </div>
        <section class="admin-question-list">
          ${set.items.map((item, index) => renderQuestion(item, index)).join('')}
        </section>
      </section>
    </main>`;

  root.querySelector('#admin-back-btn')?.addEventListener('click', onBack);
  root.querySelector('#admin-preview-btn')?.addEventListener('click', onPreview);
  root.querySelector('#admin-create-link-btn')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    const status = root.querySelector('#admin-create-link-status');
    setBusy(button, 'Đang tạo...');
    try {
      const result = await onCreateAssignment();
      const copied = await copyText(result.url);
      if (status) status.innerHTML = `${copied ? '✓ Đã copy: ' : ''}<code>${esc(result.url)}</code>`;
    } catch (error) {
      if (status) status.textContent = error?.message ?? 'Không tạo được link.';
    } finally {
      resetBusy(button, 'Tạo link giao bài');
    }
  });
}

export function renderAdminSessionDetail({ root, session, attempts, set, onBack }) {
  const mastery = masteryDisplayPercent(attempts, set?.items?.length ?? set?.itemCount ?? 1);
  root.innerHTML = `
    <main class="page admin-page">
      ${adminTopbar({ subtitle: 'Student Result' })}
      <section class="shell admin-shell">
        <button class="ghost-btn" id="admin-back-btn" type="button">← Dashboard</button>
        <section class="admin-result-head">
          <div>
            <p class="eyebrow">STUDENT SESSION</p>
            <h1>${esc(session.studentName || 'Không có tên')}</h1>
            <p>${esc(set?.title ?? session.setId)}</p>
          </div>
          <div class="admin-result-score"><span>Mastery</span><strong>${mastery}%</strong></div>
        </section>
        <div class="admin-result-grid">
          <div><span>Assignment</span><strong>${esc(session.assignmentId ?? 'Legacy')}</strong></div>
          <div><span>Set</span><strong>${esc(session.setId)}</strong></div>
          <div><span>Trạng thái</span><strong>${esc(statusLabel(session.status))}</strong></div>
          <div><span>Tổng attempt</span><strong>${attempts.length}</strong></div>
        </div>
        <section class="admin-question-list">
          ${attempts.map((attempt, index) => `
            <article class="admin-attempt ${attempt.correct ? 'is-correct' : 'is-wrong'}">
              <div><strong>#${index + 1} · ${esc(attempt.itemId)}</strong><span>${esc(typeLabel(attempt.questionType))}</span></div>
              <p>Trả lời: <code>${esc(displayValue(attempt.submittedAnswer ?? attempt.submittedResponse))}</code></p>
              <small>${attempt.correct ? '✓ Đúng' : '✗ Sai'} · ${formatDuration(attempt.responseDurationMs)} · ${formatDate(attempt.submittedAt)}</small>
            </article>`).join('') || '<p class="admin-empty">Session chưa có attempt.</p>'}
        </section>
      </section>
    </main>`;
  root.querySelector('#admin-back-btn')?.addEventListener('click', onBack);
}

function renderSetCard(set) {
  return `
    <article class="admin-set-card">
      <div class="admin-set-kicker"><span>${esc(set.course)}</span><strong>${esc(typeSummary(set.activityTypes))}</strong></div>
      <h3>${esc(set.title)}</h3>
      <p>${esc(set.unit)}</p>
      <code>${esc(set.assignmentSlug)}</code>
      <div class="admin-set-actions">
        <button class="secondary-btn" type="button" data-inspect-set="${escAttr(set.id)}">Xem nội dung</button>
        <button class="ghost-btn" type="button" data-preview-set="${escAttr(set.id)}">Preview</button>
        <button class="primary-btn" type="button" data-create-assignment="${escAttr(set.id)}">Tạo link</button>
      </div>
      <p class="copy-status" data-create-status="${escAttr(set.id)}"></p>
    </article>`;
}

function renderAssignmentRow(assignment, setById, assignmentUrlFor) {
  const set = setById.get(assignment.setId);
  const url = assignmentUrlFor(assignment);
  return `<tr>
    <td><strong>${esc(set?.title ?? assignment.title ?? assignment.setId)}</strong><small>${esc(assignment.code)}</small></td>
    <td><code>${esc(`${assignment.slug}-${assignment.code}`)}</code></td>
    <td><span class="admin-status ${assignment.active ? 'is-open' : 'is-closed'}">${assignment.active ? 'Đang mở' : 'Đã đóng'}</span></td>
    <td>${formatDate(assignment.createdAt)}</td>
    <td class="admin-row-actions">
      <button class="ghost-btn" type="button" data-copy-assignment="${escAttr(url)}">Copy</button>
      <button class="ghost-btn" type="button" data-toggle-assignment="${escAttr(assignment.code)}" data-active="${assignment.active ? 'true' : 'false'}">${assignment.active ? 'Đóng' : 'Mở lại'}</button>
    </td>
  </tr>`;
}

function renderSessionRow(session, setById) {
  const set = setById.get(session.setId);
  return `<tr>
    <td><strong>${esc(session.studentName || 'Không có tên')}</strong><small>${esc(session.assignmentId ?? 'Legacy')}</small></td>
    <td>${esc(set?.title ?? session.setId)}</td>
    <td>${Number(session.attemptCount ?? 0)}</td>
    <td>${esc(statusLabel(session.status))}</td>
    <td>${formatDate(session.syncedAt ?? session.submittedAt ?? session.startedAt)}</td>
    <td><button class="ghost-btn" type="button" data-open-session="${escAttr(session.id)}">Xem</button></td>
  </tr>`;
}

function renderQuestion(item, index) {
  const type = questionTypeForItem(item);
  const answer = expectedResponseDisplay(item);
  const choices = Array.isArray(item.choices)
    ? `<ul>${item.choices.map(choice => `<li>${esc(choice.text ?? choice.label ?? choice.id)}</li>`).join('')}</ul>`
    : '';
  const feedback = item.teachingFeedback ?? {};
  return `
    <article class="admin-question-card">
      <div class="admin-question-head"><strong>Câu ${index + 1}</strong><span>${esc(typeLabel(type))}</span></div>
      <p class="admin-question-prompt">${esc(item.prompt ?? item.vi ?? item.en ?? item.id)}</p>
      ${choices}
      <div class="admin-answer-box"><span>Đáp án</span><strong>${esc(displayValue(answer))}</strong></div>
      ${feedback.reason ? `<p><strong>Giải thích:</strong> ${esc(feedback.reason)}</p>` : ''}
      ${feedback.theory ? `<p><strong>Lý thuyết:</strong> ${esc(feedback.theory)}</p>` : ''}
      ${feedback.example ? `<p><strong>Ví dụ:</strong> ${esc(feedback.example)}</p>` : ''}
    </article>`;
}

function adminTopbar({ subtitle }) {
  return `<header class="admin-topbar shell"><div class="brand-lockup"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div><span>${esc(subtitle)}</span></header>`;
}

function typeSummary(types) {
  const list = Array.isArray(types) ? types : [];
  return list.length === 1 ? typeLabel(list[0]) : 'MIX';
}

function typeLabel(type) {
  return ({
    typing: 'Typing',
    mcq: 'MCQ',
    true_false: 'True/False',
    sentence_order: 'Order',
    matching: 'Match',
    fill_blank: 'Fill',
    reading: 'Reading',
    writing: 'Writing',
    speaking: 'Speaking'
  })[type] ?? String(type ?? 'Unknown');
}

function statusLabel(status) {
  return ({ active: 'Đang làm', extended: 'Làm thêm', passed: 'Đạt', submitted: 'Đã nộp', abandoned: 'Đã thoát' })[status] ?? String(status ?? '');
}

function formatDate(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(number));
}

function formatDuration(value) {
  const ms = Number(value);
  if (!Number.isFinite(ms)) return '—';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function displayValue(value) {
  if (Array.isArray(value)) return value.join(' → ');
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  return String(value ?? '—');
}

function setBusy(button, label) {
  if (!button) return;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.textContent = label;
}

function resetBusy(button, label) {
  if (!button) return;
  button.disabled = false;
  button.removeAttribute('aria-busy');
  button.textContent = label;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.className = 'clipboard-probe';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      return copied;
    } catch {
      return false;
    }
  }
}

function cssEscape(value) {
  return String(value).replace(/(["\\])/g, '\\$1');
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function escAttr(value) {
  return esc(value).replace(/`/g, '&#96;');
}
