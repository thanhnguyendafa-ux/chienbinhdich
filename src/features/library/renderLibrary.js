export function renderLibrary({ root, studentName, set, onBegin, onBack }) {
  root.innerHTML = `
    <main class="page library-page">
      <header class="topbar shell">
        <button class="ghost-btn" id="back-btn" type="button">← Đổi tên</button>
        <div class="student-chip">${esc(studentName)}</div>
      </header>

      <section class="shell library-wrap">
        <div class="section-heading">
          <p class="eyebrow">${set.course}</p>
          <h1>${set.unit}</h1>
          <p>Học ít nhưng xây chắc. Mỗi đơn vị đều được gõ lại để tạo đầu ra chính xác cho Speaking và Writing.</p>
        </div>

        <article class="set-card">
          <div class="set-header"><span class="set-number">SET 1</span><span class="set-threshold">PASS ≥ ${set.passThreshold}%</span></div>
          <h2>${set.title}</h2>
          <p>${set.description}</p>
          <div class="set-meta"><span>${set.items.length} items</span><span>2 lần tự thử trước reveal</span></div>
          <div class="learning-path compact"><span>TỪ</span><i></i><span>CỤM TỪ</span><i></i><span>CÂU</span></div>
          <div class="rule-box">
            <strong>Luật của bộ này</strong>
            <p>Sai lần 1: tự thử lại. Sai lần 2: app mới hiện đáp án. Sau đó vẫn phải tự gõ đúng mới được đi tiếp. Item từng sai không cộng điểm chính xác.</p>
          </div>
          <button class="primary-btn" id="begin-btn" type="button">Vào Set 1</button>
        </article>
      </section>
    </main>`;

  root.querySelector('#begin-btn')?.addEventListener('click', async event => {
    setBusy(event.currentTarget, 'Đang chuẩn bị...');
    await onBegin();
  });
  root.querySelector('#back-btn')?.addEventListener('click', onBack);
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
