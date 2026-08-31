import { sessionEffortPassPolicy } from '../../core/effortPassPolicy.js';
import { sessionPassThreshold } from '../../core/masteryPolicy.js';
import { sessionTypingTolerance } from '../../core/typingPolicy.js';
import { renderTheoryGate } from '../drill/renderTheoryGate.js';

export function renderEntry({ root, lastName, directSet = null, resumeSession, previewMode = false, onBack = null, onStart, onResume }) {
  const args = { root, lastName, directSet, resumeSession, previewMode, onBack, onStart, onResume };
  const threshold = Number(directSet?.passThreshold ?? 80);
  const resumeThreshold = resumeSession ? sessionPassThreshold(resumeSession, directSet) : null;
  const teacher = directSet?.teacher ?? 'Thầy Thành MRT';
  const newSessionTypingTolerance = directSet?.typingTolerance === true;
  const resumeTypingTolerance = resumeSession ? sessionTypingTolerance(resumeSession, directSet) : null;
  const effortEnabled = directSet?.effortPassEnabled === true;
  const effortMinutes = Number(directSet?.effortPassMinutes ?? 10);
  const resumeEffort = resumeSession ? sessionEffortPassPolicy(resumeSession, directSet) : null;
  const expectedTime = Number.isInteger(directSet?.expectedTimeMinutes) ? directSet.expectedTimeMinutes : null;
  const requiresTheory = directSet?.preLessonTheory?.required === true;

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
             <p class="welcome-copy">Chào mừng con đến với bài học <strong>${esc(teacher)}</strong>.</p>
             ${renderMasteryContract({ threshold, effortEnabled, effortMinutes })}
             ${requiresTheory ? '<p class="typing-policy-note">📘 Trước khi làm, con phải đọc hết phần Lý thuyết và xác nhận đã đọc xong.</p>' : ''}
             ${newSessionTypingTolerance ? '<p class="typing-policy-note">⌨️ Bài này không trừ vì viết hoa hoặc dấu câu. Con vẫn cần gõ đúng từ và đúng thứ tự nhé.</p>' : ''}`
          : '<p class="lead">Nhớ tiếng Anh từ đơn vị nhỏ, rồi tự xây lên câu hoàn chỉnh.</p>'}
        ${directSet ? '' : '<div class="learning-path" aria-label="Từ đến câu"><span>TỪ</span><i></i><span>CỤM TỪ</span><i></i><span>CÂU</span></div>'}

        ${resumeSession ? `<button class="resume-card" id="resume-btn" type="button"><span>Tiếp tục bài đang làm</span><strong>${esc(resumeSession.studentName)}</strong><small>Mục tiêu lượt này: ${resumeThreshold}% Mastery${resumeEffort?.enabled ? ` HOẶC ${resumeEffort.minutes} phút cố gắng` : ''}${resumeTypingTolerance ? ' · Chấm lớp nhỏ' : ''}${expectedTime ? ` · Expected ${expectedTime} phút` : ''}</small></button>` : ''}

        <form id="name-form" class="entry-form">
          <label for="student-name">Tên của em</label>
          <input id="student-name" maxlength="50" autocomplete="name" value="${esc(lastName)}" placeholder="Ví dụ: Minh Anh" required />
          ${directSet ? `<label class="mode-contract-ack"><input id="mode-contract-ack" type="checkbox" required /><span>Con đã hiểu mục tiêu và sẽ làm bằng thực lực của mình.</span></label>` : ''}
          <p class="input-note">${previewMode ? 'Chế độ Preview không gửi session lên Firebase.' : requiresTheory ? 'Nhập tên → xác nhận luật lượt học → đọc hết Lý thuyết → vào làm bài.' : directSet ? 'Nhập tên, xác nhận luật lượt học rồi bắt đầu.' : 'Tên và thời gian làm bài sẽ xuất hiện trong báo cáo cuối.'}</p>
          <button class="primary-btn" type="submit">${previewMode ? 'Tôi đã hiểu · Bắt đầu Preview' : requiresTheory ? 'TÔI ĐÃ HIỂU · ĐỌC LÝ THUYẾT →' : directSet ? 'TÔI ĐÃ HIỂU · BẮT ĐẦU' : 'Bắt đầu học'}</button>
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
    if (directSet && !root.querySelector('#mode-contract-ack')?.checked) return;
    if (requiresTheory) {
      setBusy(submitButton, 'Đang mở lý thuyết...');
      renderTheoryGate({
        root,
        set: directSet,
        session: null,
        onBottomReached: () => {},
        onConfirm: async () => onStart(name),
        onExit: () => renderEntry({ ...args, lastName: name })
      });
      return;
    }
    setBusy(submitButton, 'Đang mở bài...');
    await onStart(name);
  });

  root.querySelector('#resume-btn')?.addEventListener('click', async event => {
    setBusy(event.currentTarget, 'Đang mở lại bài...');
    await onResume();
  });
}

function renderMasteryContract({ threshold, effortEnabled, effortMinutes }) {
  return `
    <section class="mode-contract-card" aria-label="Luật lượt học Mastery">
      <div class="mode-contract-head"><span class="mode-contract-badge">MASTERY MODE</span><strong>Mục tiêu lượt học này</strong></div>
      <div class="mode-contract-targets">
        <div><span>🎯 Mastery</span><strong>${esc(threshold)}%</strong></div>
        ${effortEnabled ? `<b>HOẶC</b><div><span>⏱ Cố gắng</span><strong>${esc(effortMinutes)} phút</strong></div>` : ''}
      </div>
      <ul class="mode-contract-rules">
        <li>Đọc kỹ và trả lời bằng thực lực của con; không cần cố làm thật nhanh.</li>
        ${effortEnabled ? '<li>Timer dùng để ghi nhận sự kiên trì, không phải để ngồi chờ. Thời gian rời trang học không được tính.</li>' : ''}
        <li>Nếu con trả lời quá nhanh ở nhiều câu, hệ thống có thể nhắc con chậm lại.</li>
        <li>Sai cũng được: hãy sửa, học tiếp và cố gắng thật.</li>
      </ul>
      <p class="mode-contract-purpose"><strong>Học thật · Cố gắng thật · Thể hiện đúng năng lực.</strong></p>
    </section>`;
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
