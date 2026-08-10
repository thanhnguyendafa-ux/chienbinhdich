import { sessionPassThreshold } from '../../core/masteryPolicy.js';
import { sessionTypingTolerance } from '../../core/typingPolicy.js';

export function renderEntry({ root, lastName, directSet = null, resumeSession, previewMode = false, onBack = null, onStart, onResume }) {
  const threshold = Number(directSet?.passThreshold ?? 80);
  const resumeThreshold = resumeSession ? sessionPassThreshold(resumeSession, directSet) : null;
  const teacher = directSet?.teacher ?? 'Thầy Thành MRT';
  const newSessionTypingTolerance = directSet?.typingTolerance === true;
  const resumeTypingTolerance = resumeSession ? sessionTypingTolerance(resumeSession, directSet) : null;
  const expectedTime = Number.isInteger(directSet?.expectedTimeMinutes) ? directSet.expectedTimeMinutes : null;
  root.innerHTML = `
    <main class="page page-centered entry-page">
      <section class="entry-card ${directSet ? 'direct-entry-card' : ''}">
        ${previewMode ? `<div class="preview-mode-bar"><span>ADMIN PREVIEW</span><button class="ghost-btn" id="preview-back-btn" type="button">← Quay lại</button></div>` : ''}
        <div class="brand-lockup centered"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
        <p class="eyebrow">${directSet ? esc(directSet.course) : 'GLOBAL SUCCESS · OUTPUT TRAINING'}</p>
        <h1>Chiến Binh Dịch</h1>
        ${directSet
          ? `<div class="direct-set"><strong>${esc(directSet.unit)}</strong><div class="entry-lesson-title-row"><span>${esc(directSet.title)}</span>${directSet.difficulty === 'hard' ? '<b class="lesson-difficulty-badge">KHÓ</b>' : ''}</div></div>
             ${expectedTime ? `<p class="typing-policy-note expected-time-note">⏱ Expected time: <strong>${expectedTime} phút</strong></p>` : ''}
             <p class="welcome-copy">Chào mừng con đến với bài test <strong>${esc(teacher)}</strong>.<br />Con hãy cố gắng vượt qua <strong>${threshold}% Mastery</strong> nhé!</p>
             ${newSessionTypingTolerance ? '<p class="typing-policy-note">⌨️ Bài này không trừ vì viết hoa hoặc dấu câu. Con vẫn cần gõ đúng từ và đúng thứ tự nhé.</p>' : ''}`
          : '<p class="lead">Nhớ tiếng Anh từ đơn vị nhỏ, rồi tự xây lên câu hoàn chỉnh.</p>'}
        ${directSet ? '' : '<div class="learning-path" aria-label="Từ đến câu"><span>TỪ</span><i></i><span>CỤM TỪ</span><i></i><span>CÂU</span></div>'}

        ${resumeSession ? `<button class="resume-card" id="resume-btn" type="button"><span>Tiếp tục bài đang làm</span><strong>${esc(resumeSession.studentName)}</strong><small>Mục tiêu lượt này: ${resumeThreshold}% Mastery${resumeTypingTolerance ? ' · Chấm lớp nhỏ' : ''}${expectedTime ? ` · Expected ${expectedTime} phút` : ''}</small></button>` : ''}

        <form id="name-form" class="entry-form">
          <label for="student-name">Tên của em</label>
          <input id="student-name" maxlength="50" autocomplete="name" value="${esc(lastName)}" placeholder="Ví dụ: Minh Anh" required />
          <p class="input-note">${previewMode ? 'Chế độ Preview không gửi session lên Firebase.' : directSet ? 'Nhập tên rồi bắt đầu ngay đúng bài thầy đã gửi.' : 'Tên và thời gian làm bài sẽ xuất hiện trong báo cáo cuối.'}</p>
          <button class="primary-btn" type="submit">${previewMode ? 'Bắt đầu Preview' : directSet ? 'Bắt đầu bài test' : 'Bắt đầu học'}</button>
        </form>
      </section>
    </main>`;

  const input = root.querySelector('#student-name');
  const submitButton = root.querySelector('#name-form .primary-btn');
  input?.focus();

  root.querySelector('#preview-back-btn')?.addEventListener('click', () => onBack?.());

  root.querySelector('#name-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const name = input.value.trim();
    if (!name) return;
    setBusy(submitButton, 'Đang mở bài...');
    await onStart(name);
  });

  root.querySelector('#resume-btn')?.addEventListener('click', async event => {
    setBusy(event.currentTarget, 'Đang mở lại bài...');
    await onResume();
  });
}

function setBusy(button, label) {
  if (!button) return;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.textContent = label;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
