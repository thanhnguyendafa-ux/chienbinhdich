export function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
}
export function formatDateTime(timestamp) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short', hour12: false }).format(timestamp);
}
export function stageLabel(stage) {
  return ({ word: 'TỪ', phrase: 'CỤM TỪ', sentence: 'CÂU' })[stage] ?? stage;
}
