export function renderLibrary({ root, studentName, set, shareUrl, onBegin, onBack }) {
  root.innerHTML = `
    <main class="page library-page">
      <header class="topbar shell">
        <button class="ghost-btn" id="back-btn" type="button">← Đổi tên</button>
        <div class="student-chip">${esc(studentName)}</div>
      </header>

      <section class="shell library-wrap">
        <div class="section-heading">
          <p class="eyebrow">${esc(set.course)}</p>
          <h1>${esc(set.unit)}</h1>
          <p>Mỗi Set có link riêng. Gửi đúng link là học sinh vào thẳng bài, không cần tìm lại trong thư viện.</p>
        </div>

        <article class="set-card">
          <div class="set-header"><span class="set-number">SET 1</span><span class="set-threshold">MASTERY ≥ ${set.passThreshold}%</span></div>
          <h2>${esc(set.title)}</h2>
          <p>${esc(set.description)}</p>
          <div class="set-meta"><span>${set.items.length} items</span><span>Sai → quay lại sau 2 item</span></div>
          <div class="learning-path compact"><span>TỪ</span><i></i><span>CỤM TỪ</span><i></i><span>CÂU</span></div>
          <div class="rule-box">
            <strong>Luật Mastery</strong>
            <p>Retrieval đúng: + Mastery. Gõ sai: − Mastery. Sửa đúng sau khi đã sai chỉ là correction, không cộng lại điểm. Chưa đạt ${set.passThreshold}% thì chưa có nút Nộp bài.</p>
          </div>
          <div class="set-actions">
            <button class="primary-btn" id="begin-btn" type="button">Vào Set 1</button>
            <button class="secondary-btn" id="copy-link-btn" type="button">Sao chép link</button>
          </div>
          <p class="copy-status" id="copy-status" aria-live="polite"></p>
        </article>
      </section>
    </main>`;

  root.querySelector('#begin-btn')?.addEventListener('click', async event => {
    setBusy(event.currentTarget, 'Đang chuẩn bị...');
    await onBegin();
  });
  root.querySelector('#back-btn')?.addEventListener('click', onBack);
  root.querySelector('#copy-link-btn')?.addEventListener('click', async event => {
    const copied = await copyText(shareUrl);
    const status = root.querySelector('#copy-status');
    if (status) status.textContent = copied ? '✓ Đã sao chép link Set 1' : `Link Set 1: ${shareUrl}`;
    if (copied) {
      event.currentTarget.textContent = 'Đã sao chép';
      window.setTimeout(() => { if (event.currentTarget) event.currentTarget.textContent = 'Sao chép link'; }, 1400);
    }
  });
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
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
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

function setBusy(button, label) {
  if (!button) return;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.textContent = label;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
