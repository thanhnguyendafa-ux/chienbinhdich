import { esc } from '../shared/adminUi.js';

export function openTypingToleranceEditor({ root, lesson, onSave, onReset, onDone = null }) {
  if (!root || !lesson || !(lesson.activityTypes ?? []).includes('typing')) return;
  root.querySelector('[data-typing-editor]')?.remove();

  const current = lesson.typingTolerance === true;
  const defaultTolerance = lesson.typingPolicy?.defaultTolerance === true;
  const custom = lesson.typingPolicy?.source === 'admin-override';

  const dialog = document.createElement('dialog');
  dialog.className = 'admin-mastery-dialog';
  dialog.dataset.typingEditor = '1';
  dialog.innerHTML = `
    <form method="dialog" class="admin-mastery-editor" data-typing-form>
      <div class="admin-mastery-editor-head">
        <div><p class="eyebrow">TYPING POLICY</p><h2>Chấm Typing lớp nhỏ</h2></div>
        <button class="ghost-btn admin-mastery-close" type="button" data-typing-close aria-label="Đóng">×</button>
      </div>
      <div class="admin-mastery-lesson"><strong>${esc(lesson.title)}</strong><small>${esc(lesson.unit)}</small></div>
      <label class="admin-typing-toggle-row">
        <span>
          <strong>Bỏ qua viết hoa & dấu câu</strong>
          <small>Vẫn yêu cầu đúng từ, đúng a/an/the, đúng giới từ và đúng thứ tự.</small>
        </span>
        <span class="admin-switch">
          <input type="checkbox" data-typing-toggle ${current ? 'checked' : ''} />
          <i aria-hidden="true"></i>
        </span>
      </label>
      <div class="admin-mastery-facts">
        <p>Mặc định của bài: <strong>${defaultTolerance ? 'BẬT' : 'TẮT'}</strong></p>
        <p>Đang áp dụng: <strong>${current ? 'BẬT' : 'TẮT'}</strong></p>
        <p>Trạng thái: <strong>${custom ? 'Custom' : 'Mặc định'}</strong></p>
      </div>
      <div class="admin-mastery-note">
        <strong>Phạm vi áp dụng</strong>
        <p>Thay đổi chỉ áp dụng cho lượt bắt đầu mới. Session đã bắt đầu giữ nguyên luật chấm lúc bắt đầu.</p>
      </div>
      <p class="admin-mastery-status" data-typing-status aria-live="polite"></p>
      <div class="admin-mastery-actions">
        <button class="secondary-btn" type="button" data-typing-reset ${custom ? '' : 'disabled'}>Khôi phục ${defaultTolerance ? 'BẬT' : 'TẮT'}</button>
        <button class="primary-btn" type="submit" data-typing-save>Lưu</button>
      </div>
    </form>`;

  root.appendChild(dialog);
  const toggle = dialog.querySelector('[data-typing-toggle]');
  const status = dialog.querySelector('[data-typing-status]');
  const save = dialog.querySelector('[data-typing-save]');
  const reset = dialog.querySelector('[data-typing-reset]');

  const close = () => {
    if (dialog.open) dialog.close();
    dialog.remove();
  };
  const busy = (active, label = '') => {
    if (save) save.disabled = active;
    if (reset) reset.disabled = active || !custom;
    if (toggle) toggle.disabled = active;
    if (label && status) status.textContent = label;
  };
  const finish = async () => {
    close();
    await onDone?.();
  };

  dialog.querySelector('[data-typing-close]')?.addEventListener('click', close);
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    close();
  });

  dialog.querySelector('[data-typing-form]')?.addEventListener('submit', async event => {
    event.preventDefault();
    busy(true, 'Đang lưu...');
    try {
      await onSave?.(toggle?.checked === true);
      await finish();
    } catch (error) {
      console.error('Save Typing tolerance failed', error);
      busy(false, error?.message || 'Không lưu được chế độ Typing.');
    }
  });

  reset?.addEventListener('click', async () => {
    if (!custom) return;
    busy(true, 'Đang khôi phục mặc định...');
    try {
      await onReset?.();
      await finish();
    } catch (error) {
      console.error('Reset Typing tolerance failed', error);
      busy(false, error?.message || 'Không khôi phục được chế độ Typing.');
    }
  });

  dialog.showModal();
  toggle?.focus();
}
