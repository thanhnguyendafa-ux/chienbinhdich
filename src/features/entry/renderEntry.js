export function renderEntry({ root, lastName, resumeSession, onStart, onResume }) {
  root.innerHTML = `
    <main class="page page-centered">
      <section class="hero-card entry-card">
        <div class="brand-mark" aria-hidden="true">⚔️</div>
        <p class="eyebrow">MRT ENGLISH</p>
        <h1>Chiến Binh Dịch</h1>
        <p class="lead">Biến tiếng Việt thành tiếng Anh từng bước.</p>
        <div class="flow-pills"><span>Từ</span><b>→</b><span>Cụm từ</span><b>→</b><span>Câu</span></div>
        ${resumeSession ? `<button class="resume-card" id="resume-btn" type="button"><span>Tiếp tục bài đang làm</span><strong>${esc(resumeSession.studentName)}</strong></button>` : ''}
        <form id="name-form" class="entry-form">
          <label for="student-name">Tên của em</label>
          <input id="student-name" maxlength="50" autocomplete="name" value="${esc(lastName)}" placeholder="Ví dụ: Minh Anh" required />
          <p class="input-note">Tên và thời gian làm bài sẽ xuất hiện trong báo cáo cuối.</p>
          <button class="primary-btn" type="submit">Bắt đầu học</button>
        </form>
      </section>
    </main>`;
  const input = root.querySelector('#student-name');
  input?.focus();
  root.querySelector('#name-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = input.value.trim();
    if (name) onStart(name);
  });
  root.querySelector('#resume-btn')?.addEventListener('click', onResume);
}
function esc(v) { return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[c]); }
