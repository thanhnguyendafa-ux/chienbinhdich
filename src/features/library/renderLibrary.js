export function renderLibrary({ root, studentName, set, onBegin, onBack }) {
  root.innerHTML = `
    <main class="page">
      <header class="topbar shell"><button class="ghost-btn" id="back-btn">← Đổi tên</button><div class="student-chip">${esc(studentName)}</div></header>
      <section class="shell library-wrap">
        <div class="section-heading"><p class="eyebrow">${set.course}</p><h1>${set.unit}</h1><p>Học ít nhưng xây thật chắc: từ đơn vị nhỏ đến câu hoàn chỉnh.</p></div>
        <article class="set-card">
          <div class="set-number">SET 1</div><h2>${set.title}</h2><p>${set.description}</p>
          <div class="set-meta"><span>${set.items.length} lượt gõ</span><span>Đạt từ ${set.passThreshold}%</span></div>
          <div class="flow-pills compact"><span>Từ</span><b>→</b><span>Cụm từ</span><b>→</b><span>Câu</span></div>
          <div class="rule-box"><strong>Luật học</strong><p>Sai thì gõ lại cho đúng mới được đi tiếp. Item đã sai sẽ không cộng điểm chính xác.</p></div>
          <button class="primary-btn" id="begin-btn">Vào Set 1</button>
        </article>
      </section>
    </main>`;
  root.querySelector('#begin-btn')?.addEventListener('click', onBegin);
  root.querySelector('#back-btn')?.addEventListener('click', onBack);
}
function esc(v) { return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[c]); }
