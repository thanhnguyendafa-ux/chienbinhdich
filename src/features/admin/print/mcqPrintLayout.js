export function mcqPrintLayout(choices = []) {
  const lengths = choices.map(choice => String(choice?.text ?? '').trim().length);
  const longest = Math.max(0, ...lengths);
  const total = lengths.reduce((sum, length) => sum + length, 0);

  if (choices.length === 4 && longest <= 18 && total <= 60) return 'inline-4';
  if (longest <= 48 && total <= 150) return 'grid-2';
  return 'stack-1';
}
