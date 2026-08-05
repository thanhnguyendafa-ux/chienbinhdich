export function renderLibraryHome({ root, folders, sets, shareUrlFor, onOpenFolder, onOpenSet }) {
  root.innerHTML = `
    <main class="page catalog-page">
      ${catalogTopbar()}
      <section class="shell catalog-shell">
        <div class="catalog-heading">
          <div>
            <p class="eyebrow">THƯ VIỆN BÀI TẬP MRT</p>
            <h1>Chọn bài, lấy link, gửi học sinh.</h1>
            <p>Mỗi Set có link riêng. Học sinh mở link sẽ vào thẳng màn chào của đúng bài đó.</p>
          </div>
          <label class="catalog-search">
            <span class="sr-only">Tìm bài tập</span>
            <input id="catalog-search-input" type="search" autocomplete="off" placeholder="Tìm theo tên bài, Unit..." />
          </label>
        </div>

        <section id="folder-section" aria-labelledby="folder-title">
          <div class="catalog-section-title"><h2 id="folder-title">Thư mục</h2><span>${folders.length} thư mục · ${sets.length} Set</span></div>
          <div class="folder-grid">
            ${folders.map(folder => renderFolderCard(folder, sets.filter(set => set.folderId === folder.id))).join('')}
          </div>
        </section>

        <section id="search-section" class="search-results" aria-labelledby="search-title" hidden>
          <div class="catalog-section-title"><h2 id="search-title">Kết quả tìm kiếm</h2><span id="search-count"></span></div>
          <div id="search-grid" class="set-grid"></div>
        </section>
      </section>
    </main>`;

  root.querySelectorAll('[data-folder-id]').forEach(button => button.addEventListener('click', () => onOpenFolder(button.dataset.folderId)));
  bindSetActions({ root, sets, shareUrlFor, onOpenSet });

  const input = root.querySelector('#catalog-search-input');
  const folderSection = root.querySelector('#folder-section');
  const searchSection = root.querySelector('#search-section');
  const searchGrid = root.querySelector('#search-grid');
  const searchCount = root.querySelector('#search-count');
  input?.addEventListener('input', () => {
    const query = normalize(input.value);
    if (!query) {
      if (folderSection) folderSection.hidden = false;
      if (searchSection) searchSection.hidden = true;
      if (searchGrid) searchGrid.innerHTML = '';
      return;
    }
    const matches = sets.filter(set => normalize([set.title, set.course, set.unit, set.subtitle, set.description].join(' ')).includes(query));
    if (folderSection) folderSection.hidden = true;
    if (searchSection) searchSection.hidden = false;
    if (searchCount) searchCount.textContent = `${matches.length} Set`;
    if (searchGrid) searchGrid.innerHTML = matches.length ? matches.map(renderSetCard).join('') : '<p class="catalog-empty">Không tìm thấy Set phù hợp.</p>';
    bindSetActions({ root: searchGrid, sets: matches, shareUrlFor, onOpenSet });
  });
}

export function renderFolderLibrary({ root, folder, sets, shareUrlFor, onBack, onOpenSet }) {
  root.innerHTML = `
    <main class="page catalog-page">
      <header class="catalog-topbar shell">
        <button class="ghost-btn" id="library-back-btn" type="button">← Thư viện</button>
        <div class="brand-lockup"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
      </header>
      <section class="shell catalog-shell folder-view">
        <div class="catalog-heading folder-heading">
          <div>
            <p class="eyebrow">THƯ MỤC</p>
            <h1>${esc(folder.name)}</h1>
            <p>${esc(folder.description)}</p>
          </div>
          <span class="folder-count">${sets.length} Set</span>
        </div>
        <div class="set-grid">
          ${sets.length ? sets.map(renderSetCard).join('') : '<p class="catalog-empty">Thư mục này chưa có bài tập.</p>'}
        </div>
      </section>
    </main>`;

  root.querySelector('#library-back-btn')?.addEventListener('click', onBack);
  bindSetActions({ root, sets, shareUrlFor, onOpenSet });
}

function catalogTopbar() {
  return `<header class="catalog-topbar shell"><div class="brand-lockup"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div><span class="catalog-badge">Published Sets</span></header>`;
}

function renderFolderCard(folder, sets) {
  const types = [...new Set(sets.flatMap(set => set.activityTypes))].map(typeLabel).join(' · ');
  return `
    <button class="folder-card" type="button" data-folder-id="${escAttr(folder.id)}">
      <span class="folder-icon" aria-hidden="true">▱</span>
      <span class="folder-copy"><strong>${esc(folder.name)}</strong><small>${sets.length} Set${types ? ` · ${esc(types)}` : ''}</small></span>
      <span class="folder-arrow" aria-hidden="true">→</span>
    </button>`;
}

function renderSetCard(set) {
  return `
    <article class="catalog-set-card" data-set-card="${escAttr(set.id)}">
      <div class="catalog-set-head"><span>${esc(set.course)}</span><strong>Mastery ≥ ${set.passThreshold}%</strong></div>
      <h2>${esc(set.title)}</h2>
      <p class="catalog-set-unit">${esc(set.unit)}</p>
      <p class="catalog-set-description">${esc(set.description)}</p>
      <div class="catalog-set-meta">
        <span>${set.itemCount} ${set.activityTypes.includes('typing') && set.activityTypes.length === 1 ? 'mục' : 'câu'}</span>
        ${set.activityTypes.map(type => `<span>${esc(typeLabel(type))}</span>`).join('')}
      </div>
      <div class="catalog-set-actions">
        <button class="primary-btn" type="button" data-open-set="${escAttr(set.id)}">Mở bài</button>
        <button class="secondary-btn" type="button" data-copy-set="${escAttr(set.id)}">Sao chép link</button>
      </div>
      <p class="copy-status" data-copy-status="${escAttr(set.id)}" aria-live="polite"></p>
    </article>`;
}

function bindSetActions({ root, sets, shareUrlFor, onOpenSet }) {
  if (!root) return;
  const setIds = new Set(sets.map(set => set.id));
  root.querySelectorAll('[data-open-set]').forEach(button => button.addEventListener('click', () => {
    if (setIds.has(button.dataset.openSet)) onOpenSet(button.dataset.openSet);
  }));
  root.querySelectorAll('[data-copy-set]').forEach(button => button.addEventListener('click', async () => {
    const setId = button.dataset.copySet;
    if (!setIds.has(setId)) return;
    const url = shareUrlFor(setId);
    const copied = await copyText(url);
    const status = root.querySelector(`[data-copy-status="${cssEscape(setId)}"]`);
    if (status) status.textContent = copied ? '✓ Đã sao chép link học sinh' : `Link học sinh: ${url}`;
    if (copied) {
      button.textContent = 'Đã sao chép';
      window.setTimeout(() => { if (button.isConnected) button.textContent = 'Sao chép link'; }, 1400);
    }
  }));
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

function typeLabel(type) {
  return ({ typing: 'Typing', mcq: 'MCQ', true_false: 'True/False', sentence_order: 'Sắp xếp câu' })[type] ?? type;
}

function normalize(value) {
  return String(value ?? '').trim().toLocaleLowerCase('vi');
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
