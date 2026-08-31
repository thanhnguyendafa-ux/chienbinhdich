import {
  acknowledgeCurrentIntegrityWarning,
  markCurrentIntegrityWarningShown,
  subscribeIntegrityWarnings
} from '../../core/integrityRuntime.js';

let installed = false;
let activeWarningId = null;
let previousFocus = null;
let dialog = null;

export function installIntegrityWarningGate() {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  dialog = ensureDialog();
  subscribeIntegrityWarnings(renderPendingWarnings);
}

export function warningCopy(warning) {
  const count = Math.max(1, Number(warning?.occurrenceNumber ?? 1));
  if (warning?.type === 'rapid_response') {
    const repeated = Number(warning?.currentStreak ?? 0) >= 3 || count >= 4;
    return {
      kicker: '⚠ NHẮC CON LÀM BẰNG THỰC LỰC',
      title: repeated ? 'Con đang trả lời quá nhanh ở nhiều câu' : 'Con đang trả lời khá nhanh',
      body: repeated
        ? 'Hãy chậm lại một chút, đọc kỹ câu hỏi và tự suy nghĩ trước khi trả lời. Mục tiêu của bài là học thật và thể hiện đúng năng lực, không phải bấm thật nhanh hoặc nhớ vị trí đáp án.'
        : 'Hãy đọc kỹ câu hỏi trước khi trả lời nhé. Một câu nhanh chưa có nghĩa là sai, nhưng hệ thống sẽ ghi nhận các phản hồi quá nhanh để giáo viên xem quá trình học.',
      countLabel: `Phản hồi rất nhanh đã ghi nhận: ${count} lần`
    };
  }
  if (warning?.type === 'tab_switch') {
    return {
      kicker: '⚠ CẢNH BÁO RỜI TRANG HỌC',
      title: 'Hệ thống đã ghi nhận bạn rời trang học',
      body: `Hệ thống vừa ghi nhận bạn rời trang học trong ${formatAwayDuration(warning.awayMs)}. Đây có thể là chuyển tab, minimize trình duyệt hoặc chuyển sang ứng dụng khác. Sự kiện này đã được lưu và sẽ xuất hiện trong báo cáo quá trình làm bài.`,
      countLabel: `Số lần rời trang đã ghi nhận: ${count}`
    };
  }
  if (warning?.type === 'copy') {
    return {
      kicker: '⚠ CẢNH BÁO TÍNH TRUNG THỰC',
      title: 'Hệ thống đã ghi nhận thao tác Copy',
      body: 'Hệ thống vừa ghi nhận thao tác sao chép nội dung trong lúc làm bài. Sự kiện này đã được lưu và có thể xuất hiện trong báo cáo giáo viên.',
      countLabel: `Copy đã ghi nhận: ${count} lần`
    };
  }
  return {
    kicker: '⚠ CẢNH BÁO TÍNH TRUNG THỰC',
    title: 'Hệ thống đã ghi nhận thao tác Paste',
    body: 'Hệ thống vừa ghi nhận thao tác Paste vào ô trả lời. Sự kiện này đã được lưu và có thể xuất hiện trong báo cáo giáo viên. Hãy tự hoàn thành câu trả lời của mình.',
    countLabel: `Paste đã ghi nhận: ${count} lần`
  };
}

function ensureDialog() {
  const existing = document.querySelector('#integrity-warning-dialog');
  if (existing) return existing;
  const element = document.createElement('dialog');
  element.id = 'integrity-warning-dialog';
  element.className = 'integrity-warning-dialog';
  element.setAttribute('aria-labelledby', 'integrity-warning-title');
  element.setAttribute('aria-describedby', 'integrity-warning-description');
  element.addEventListener('cancel', event => event.preventDefault());
  document.body.appendChild(element);
  return element;
}

function renderPendingWarnings(warnings = []) {
  if (!dialog) dialog = ensureDialog();
  const warning = warnings[0];
  if (!warning) {
    if (dialog.open) dialog.close();
    activeWarningId = null;
    restoreQuestionFocus();
    return;
  }

  if (activeWarningId === warning.id && dialog.open) return;
  if (!dialog.open) previousFocus = document.activeElement;
  activeWarningId = warning.id;
  const copy = warningCopy(warning);
  const remaining = Math.max(0, warnings.length - 1);
  dialog.innerHTML = `
    <section class="integrity-warning-shell">
      <p class="integrity-warning-kicker">${esc(copy.kicker)}</p>
      <h2 id="integrity-warning-title">${esc(copy.title)}</h2>
      <p id="integrity-warning-description" class="integrity-warning-description">${esc(copy.body)}</p>
      <p class="integrity-warning-count"><strong>${esc(copy.countLabel)}</strong></p>
      ${remaining ? `<p class="integrity-warning-remaining">Còn ${remaining} cảnh báo cần xác nhận.</p>` : ''}
      <p class="integrity-warning-record-note">Hệ thống đã lưu sự kiện này. Bạn phải xác nhận đã nắm thông tin trước khi tiếp tục bài.</p>
      <div class="integrity-warning-actions">
        <button class="primary-btn integrity-warning-ack-btn" id="integrity-warning-ack-btn" type="button">TÔI ĐÃ NẮM THÔNG TIN</button>
      </div>
    </section>`;

  const button = dialog.querySelector('#integrity-warning-ack-btn');
  button?.addEventListener('click', () => {
    button.disabled = true;
    const warningId = activeWarningId;
    activeWarningId = null;
    if (dialog.open) dialog.close();
    acknowledgeCurrentIntegrityWarning(warningId);
  }, { once: true });

  if (!dialog.open) dialog.showModal();
  button?.focus({ preventScroll: true });
  if (warning.shownAt === null || warning.shownAt === undefined) {
    markCurrentIntegrityWarningShown(warning.id);
  }
}

function restoreQuestionFocus() {
  const answer = document.querySelector('#answer-input');
  if (answer && typeof answer.focus === 'function') {
    answer.focus({ preventScroll: true });
    return;
  }
  if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === 'function') {
    previousFocus.focus({ preventScroll: true });
  }
  previousFocus = null;
}

function formatAwayDuration(value) {
  const totalSeconds = Math.max(0, Math.round(Number(value ?? 0) / 1000));
  if (totalSeconds < 60) return `${totalSeconds} giây`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds ? `${minutes} phút ${seconds} giây` : `${minutes} phút`;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

installIntegrityWarningGate();
