export function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

export function formatDateTime(timestamp) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short', hour12: false }).format(timestamp);
}

export function formatClockTime(timestamp) {
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(timestamp);
}

export function formatResponseDuration(ms) {
  if (!Number.isFinite(ms)) return '—';
  return `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)}s`;
}

export function stageLabel(stage) {
  return ({ word: 'TỪ', phrase: 'CỤM TỪ', sentence: 'CÂU' })[stage] ?? stage;
}
