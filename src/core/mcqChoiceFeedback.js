export function mcqChoiceFeedback(item, submittedResponse) {
  if (item?.type !== 'mcq' || !Array.isArray(item?.choices)) return '';
  const submitted = String(submittedResponse ?? '').trim();
  if (!submitted) return '';
  const choice = item.choices.find(candidate =>
    String(candidate?.id ?? '') === submitted || String(candidate?.text ?? '') === submitted
  );
  return choice?.feedback ? String(choice.feedback) : '';
}
