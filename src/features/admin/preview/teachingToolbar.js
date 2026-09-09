export function attachTeachingToolbar({
  root,
  state,
  onExit,
  onPrevious,
  onNext,
  onSkipSection,
  onJumpToSection,
  onJumpToQuestion,
  onResetCurrent,
  onResetAll
}) {
  const page = root.querySelector('.drill-page');
  const topbar = root.querySelector('.drill-topbar');
  if (!state || !page || !topbar) return;

  page.classList.add('admin-teaching-mode');
  root.querySelector('.metrics-row')?.setAttribute('hidden', '');
  const studentChip = root.querySelector('.student-chip');
  if (studentChip) studentChip.textContent = 'ADMIN DEMO';
  const encouragement = root.querySelector('.encouragement');
  if (encouragement) encouragement.textContent = 'Teaching Mode: Thầy chủ động Prev / Next / Jump. Demo chỉ nằm trong phiên hiện tại và không ghi điểm.';

  const oldExit = root.querySelector('#exit-btn');
  if (oldExit) {
    const adminExit = oldExit.cloneNode(true);
    adminExit.textContent = '← Về Admin';
    oldExit.replaceWith(adminExit);
    adminExit.addEventListener('click', onExit);
  }

  const sectionButtons = state.sections.map(section => `
    <button type="button" class="ghost-btn admin-mini-btn admin-teaching-section-btn ${state.currentSection?.id === section.id ? 'is-current' : ''}" data-teaching-section="${escAttr(section.id)}">${esc(section.label)}</button>`).join('');

  topbar.insertAdjacentHTML('afterend', `
    <section class="shell admin-teaching-toolbar" aria-label="Admin Teaching Mode controls">
      <div class="admin-teaching-toolbar-head">
        <div class="admin-teaching-title">
          <strong>ADMIN · TEACHING MODE</strong>
          <small>Demo local · Không ghi điểm · Không thay đổi tiến độ học sinh</small>
        </div>
        <span>${state.currentSection ? esc(state.currentSection.label) : 'Tất cả câu'}</span>
      </div>
      <div class="admin-teaching-nav">
        <button type="button" class="secondary-btn" data-teaching-previous ${state.canPrevious ? '' : 'disabled'}>← Câu trước</button>
        <strong class="admin-teaching-counter">Q${state.questionNumber} / ${state.total}</strong>
        <button type="button" class="secondary-btn" data-teaching-next ${state.canNext ? '' : 'disabled'}>Câu tiếp →</button>
        <button type="button" class="ghost-btn" data-teaching-skip-section ${state.nextSection ? '' : 'disabled'}>${state.nextSection ? `Bỏ qua phần này → ${esc(state.nextSection.label)}` : 'Đang ở phần cuối'}</button>
      </div>
      ${sectionButtons ? `<div class="admin-teaching-sections" aria-label="Đi tới phần">${sectionButtons}</div>` : ''}
      <div class="admin-teaching-actions">
        <label class="admin-teaching-jump">Đi tới câu
          <input type="number" min="1" max="${state.total}" value="${state.questionNumber}" inputmode="numeric" data-teaching-jump-input />
          <button type="button" class="ghost-btn admin-mini-btn" data-teaching-jump>Đi tới</button>
        </label>
        <button type="button" class="ghost-btn" data-teaching-reset-current>↺ Reset câu</button>
        <button type="button" class="ghost-btn" data-teaching-reset-all>Reset toàn bài</button>
      </div>
    </section>`);

  root.querySelector('[data-teaching-previous]')?.addEventListener('click', onPrevious);
  root.querySelector('[data-teaching-next]')?.addEventListener('click', onNext);
  root.querySelector('[data-teaching-skip-section]')?.addEventListener('click', onSkipSection);
  root.querySelectorAll('[data-teaching-section]').forEach(button => {
    button.addEventListener('click', () => onJumpToSection(button.dataset.teachingSection));
  });

  const jump = () => onJumpToQuestion(root.querySelector('[data-teaching-jump-input]')?.value);
  root.querySelector('[data-teaching-jump]')?.addEventListener('click', jump);
  root.querySelector('[data-teaching-jump-input]')?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      jump();
    }
  });

  root.querySelector('[data-teaching-reset-current]')?.addEventListener('click', onResetCurrent);
  root.querySelector('[data-teaching-reset-all]')?.addEventListener('click', onResetAll);
}

export function decorateTeachingSuccess(root) {
  root.querySelectorAll('.success-panel small').forEach(node => {
    node.textContent = 'Demo local · Không ghi điểm';
  });
  root.querySelector('#teaching-continue-btn')?.remove();
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function escAttr(value) {
  return esc(value);
}
