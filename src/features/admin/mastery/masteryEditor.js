import { isValidPassThreshold } from '../../../core/masteryPolicy.js';
import { esc, escAttr } from '../shared/adminUi.js';

export function openMasteryEditor({ root, lesson, onSave, onReset, onDone = null }) {
  if (!root || !lesson) return;
  root.querySelector('[data-mastery-editor]')?.remove();

  const current = Number(lesson.passThreshold);
  const defaultThreshold = Number(lesson.masteryPolicy?.defaultThreshold ?? current);
  const custom = lesson.masteryPolicy?.source === 'admin-override';
  const completionLabel = lesson.completionPolicy === 'all-items'
    ? 'Hoàn thành tất cả câu rồi mới xét Mastery.'
    : 'Có thể đạt khi chạm mốc Mastery.';

  const dialog = document.createElement('dialog');
  dialog.className = 'admin-mastery-dialog';
  dialog.dataset.masteryEditor = '1';
  dialog.innerHTML = `
    <form method="dialog" class="admin-mastery-editor" data-mastery-form>
      <div class="admin-mastery-editor-head">
        <div><p class="eyebrow">MASTERY POLICY</p><h2>Chỉnh mốc Mastery</h2></div>
        <button class="ghost-btn admin-mastery-close" type="button" data-mastery-close aria-label="Đóng">×</button>
      </div>
      <div class="admin-mastery-lesson"><strong>${esc(lesson.title)}</strong><small>${esc(lesson.unit)}</small></div>
      <label class="admin-mastery-field" for="admin-mastery-threshold">
        <span>Mốc PASS</span>
        <div><input id="admin-mastery-threshold" data-mastery-input type="number" inputmode="numeric" min="1" max="100" step="1" value="${escAttr(current)}" required /><strong>%</strong></div>
      </label>
      <div class="admin-mastery-facts">
        <p>Mặc định của bài: <strong>${defaultThreshold}%</strong></p>
        <p>Trạng thái: <strong>${custom ? 'Custom' : 'Mặc định'}</strong></p>
        <p>${esc(completionLabel)}</p>
      </div>
      <div class="admin-mastery-note">
        <strong>Phạm vi áp dụng</strong>
        <p>Mốc mới áp dụng cho lượt bắt đầu mới. Fixed link không đổi. Session đã bắt đầu giữ nguyên mốc lúc bắt đầu.</p>
      </div>
      <p class="admin-mastery-status" data-mastery-status aria-live="polite"></p>
      <div class="admin-mastery-actions">
        <button class="secondary-btn" type="button" data-mastery-reset ${custom ? '' : 'disabled'}>Khôi phục ${defaultThreshold}%</button>
        <button class="primary-btn" type="submit" data-mastery-save>Lưu</button>
      </div>
    </form>`;

  root.appendChild(dialog);
  const input = dialog.querySelector('[data-mastery-input]');
  const status = dialog.querySelector('[data-mastery-status]');
  const save = dialog.querySelector('[data-mastery-save]');
  const reset = dialog.querySelector('[data-mastery-reset]');

  const close = () => {
    if (dialog.open) dialog.close();
    dialog.remove();
  };
  const busy = (active, label = '') => {
    if (save) save.disabled = active;
    if (reset) reset.disabled = active || !custom;
    if (input) input.disabled = active;
    if (label && status) status.textContent = label;
  };
  const finish = async () => {
    close();
    await onDone?.();
  };

  dialog.querySelector('[data-mastery-close]')?.addEventListener('click', close);
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    close();
  });

  dialog.querySelector('[data-mastery-form]')?.addEventListener('submit', async event => {
    event.preventDefault();
    const value = Number(input?.value);
    if (!isValidPassThreshold(value)) {
      if (status) status.textContent = 'Nhập một số nguyên từ 1 đến 100.';
      input?.focus();
      return;
    }
    busy(true, 'Đang lưu...');
    try {
      await onSave?.(value);
      await finish();
    } catch (error) {
      console.error('Save Mastery failed', error);
      busy(false, error?.message || 'Không lưu được Mastery.');
    }
  });

  reset?.addEventListener('click', async () => {
    if (!custom) return;
    busy(true, 'Đang khôi phục mặc định...');
    try {
      await onReset?.();
      await finish();
    } catch (error) {
      console.error('Reset Mastery failed', error);
      busy(false, error?.message || 'Không khôi phục được Mastery.');
    }
  });

  dialog.showModal();
  input?.focus();
  input?.select();
}
