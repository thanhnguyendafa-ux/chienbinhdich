import { getSessionMetrics } from '../../core/sessionMachine.js';

export function installEffortClock(root, session, set) {
  const clock = root.querySelector('[data-effort-clock]');
  const note = root.querySelector('[data-effort-note]');
  const card = root.querySelector('[data-effort-timer]');
  if (!clock || !card) return;
  const tick = () => {
    if (!clock.isConnected) return false;
    const metrics = getSessionMetrics(session, set, Date.now());
    clock.textContent = `${formatEffortClock(metrics.effortActiveMs)} / ${formatEffortClock(metrics.effortTargetMs)}`;
    card.classList.toggle('is-reached', metrics.effortThresholdReached);
    if (note && metrics.effortThresholdReached) {
      note.textContent = 'Đã đủ thời gian cố gắng · hoàn thành câu hiện tại để hệ thống ghi nhận PASS.';
    }
    return true;
  };
  tick();
  const timer = window.setInterval(() => {
    if (!tick()) window.clearInterval(timer);
  }, 1000);
}

export function formatEffortClock(value) {
  const totalSeconds = Math.max(0, Math.floor(Number(value ?? 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
