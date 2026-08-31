import { isValidEffortPassMinutes, MAX_EFFORT_PASS_MINUTES, MIN_EFFORT_PASS_MINUTES } from '../../../core/effortPassPolicy.js';
import { isValidPassThreshold } from '../../../core/masteryPolicy.js';
import { esc, escAttr } from '../shared/adminUi.js';

export function openMasteryEditor({ root, lesson, onSave, onReset, onDone = null }) {
  if (!root || !lesson) return;
  root.querySelector('[data-mastery-editor]')?.remove();

  const current = Number(lesson.passThreshold);
  const defaultThreshold = Number(lesson.masteryPolicy?.defaultThreshold ?? current);
  const masteryCustom = lesson.masteryPolicy?.source === 'admin-override';
  const effortEnabled = lesson.effortPassEnabled === true;
  const effortMinutes = Number(lesson.effortPassMinutes ?? 10);
  const effortCustom = lesson.effortPassPolicy?.source === 'admin-override';
  const custom = masteryCustom || effortCustom;
  const completionLabel = lesson.completionPolicy === 'all-items'
    ? 'Mastery branch yêu cầu hoàn thành tất cả câu; Effort branch vẫn là đường PASS thay thế khi đủ thời gian học chủ động.'
    : 'Học sinh có thể PASS khi đạt Mastery hoặc đạt mục tiêu Effort nếu Timer được bật.';

  const dialog = document.createElement('dialog');
  dialog.className = 'admin-mastery-dialog';
  dialog.dataset.masteryEditor = '1';
  dialog.innerHTML = `
    <form method="dialog" class="admin-mastery-editor" data-mastery-form>
      <div class="admin-mastery-editor-head">
        <div><p class="eyebrow">MASTERY POLICY</p><h2>Mastery + Timer cố gắng</h2></div>
        <button class="ghost-btn admin-mastery-close" type="button" data-mastery-close aria-label="Đóng">×</button>
      </div>
      <div class="admin-mastery-lesson"><strong>${esc(lesson.title)}</strong><small>${esc(lesson.unit)}</small></div>
      <label class="admin-mastery-field" for="admin-mastery-threshold">
        <span>Mốc Mastery</span>
        <div><input id="admin-mastery-threshold" data-mastery-input type="number" inputmode="numeric" min="1" max="100" step="1" value="${escAttr(current)}" required /><strong>%</strong></div>
      </label>
      <section class="admin-effort-policy" aria-label="Timer cố gắng">
        <label class="admin-effort-toggle" for="admin-effort-enabled">
          <span><strong>Timer cố gắng</strong><small>Cho học sinh yếu một đường PASS bằng sự kiên trì.</small></span>
          <input id="admin-effort-enabled" data-effort-enabled type="checkbox" ${effortEnabled ? 'checked' : ''} />
        </label>
        <label class="admin-mastery-field" for="admin-effort-minutes" data-effort-minutes-field>
          <span>Thời gian học chủ động</span>
          <div><input id="admin-effort-minutes" data-effort-minutes type="number" inputmode="numeric" min="${MIN_EFFORT_PASS_MINUTES}" max="${MAX_EFFORT_PASS_MINUTES}" step="1" value="${escAttr(effortMinutes)}" ${effortEnabled ? 'required' : 'disabled'} /><strong>phút</strong></div>
        </label>
        <p class="admin-effort-contract" data-effort-contract>${renderContract(current, effortEnabled, effortMinutes)}</p>
      </section>
      <div class="admin-mastery-facts">
        <p>Mặc định Mastery của bài: <strong>${defaultThreshold}%</strong></p>
        <p>Trạng thái: <strong>${custom ? 'Custom' : 'Mặc định'}</strong></p>
        <p>${esc(completionLabel)}</p>
      </div>
      <div class="admin-mastery-note">
        <strong>Phạm vi áp dụng</strong>
        <p>Setting mới chỉ áp dụng cho lượt bắt đầu mới. Session đã bắt đầu giữ nguyên Mastery target và Timer tại thời điểm bắt đầu. Timer chỉ tính thời gian học chủ động; thời gian rời tab không được tính.</p>
      </div>
      <p class="admin-mastery-status" data-mastery-status aria-live="polite"></p>
      <div class="admin-mastery-actions">
        <button class="secondary-btn" type="button" data-mastery-reset ${custom ? '' : 'disabled'}>Khôi phục mặc định</button>
        <button class="primary-btn" type="submit" data-mastery-save>Lưu chính sách</button>
      </div>
    </form>`;

  root.appendChild(dialog);
  const input = dialog.querySelector('[data-mastery-input]');
  const effortToggle = dialog.querySelector('[data-effort-enabled]');
  const effortInput = dialog.querySelector('[data-effort-minutes]');
  const effortContract = dialog.querySelector('[data-effort-contract]');
  const status = dialog.querySelector('[data-mastery-status]');
  const save = dialog.querySelector('[data-mastery-save]');
  const reset = dialog.querySelector('[data-mastery-reset]');

  const syncEffortUi = () => {
    const enabled = effortToggle?.checked === true;
    if (effortInput) {
      effortInput.disabled = !enabled;
      effortInput.required = enabled;
    }
    if (effortContract) effortContract.textContent = renderContract(Number(input?.value), enabled, Number(effortInput?.value));
  };
  const close = () => {
    if (dialog.open) dialog.close();
    dialog.remove();
  };
  const busy = (active, label = '') => {
    if (save) save.disabled = active;
    if (reset) reset.disabled = active || !custom;
    if (input) input.disabled = active;
    if (effortToggle) effortToggle.disabled = active;
    if (effortInput) effortInput.disabled = active || effortToggle?.checked !== true;
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
  input?.addEventListener('input', syncEffortUi);
  effortInput?.addEventListener('input', syncEffortUi);
  effortToggle?.addEventListener('change', syncEffortUi);

  dialog.querySelector('[data-mastery-form]')?.addEventListener('submit', async event => {
    event.preventDefault();
    const value = Number(input?.value);
    const enabled = effortToggle?.checked === true;
    const minutes = Number(effortInput?.value);
    if (!isValidPassThreshold(value)) {
      if (status) status.textContent = 'Mastery phải là số nguyên từ 1 đến 100.';
      input?.focus();
      return;
    }
    if (enabled && !isValidEffortPassMinutes(minutes)) {
      if (status) status.textContent = `Timer phải là số nguyên từ ${MIN_EFFORT_PASS_MINUTES} đến ${MAX_EFFORT_PASS_MINUTES} phút.`;
      effortInput?.focus();
      return;
    }
    busy(true, 'Đang lưu...');
    try {
      await onSave?.({
        passThreshold: value,
        effortPassEnabled: enabled,
        effortPassMinutes: enabled ? minutes : Number.isFinite(minutes) ? minutes : 10
      });
      await finish();
    } catch (error) {
      console.error('Save Mastery failed', error);
      busy(false, error?.message || 'Không lưu được Mastery + Timer.');
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
      busy(false, error?.message || 'Không khôi phục được Mastery + Timer.');
    }
  });

  dialog.showModal();
  syncEffortUi();
  input?.focus();
  input?.select();
}

function renderContract(threshold, enabled, minutes) {
  if (!enabled) return `PASS khi đạt ${Number(threshold) || 80}% Mastery.`;
  return `PASS khi đạt ${Number(threshold) || 80}% Mastery HOẶC học chủ động đủ ${Number(minutes) || 10} phút.`;
}
