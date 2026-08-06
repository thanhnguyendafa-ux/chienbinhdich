import { questionPromptDisplay, questionTypeForItem } from '../../core/questionTypes.js';

export function getQuestionContext(item) {
  const type = questionTypeForItem(item);
  const prompt = questionPromptDisplay(item).trim();

  if (type === 'typing') {
    return context([
      row('Tiếng Việt', prompt),
      row('Yêu cầu', 'Dịch sang tiếng Anh.')
    ]);
  }

  if (type === 'true_false') {
    const quoted = splitQuotedPrompt(prompt);
    if (quoted) {
      return context([
        row('Câu', quoted.sentence),
        row('Nhận định cần kiểm tra', stripPrefix(quoted.remainder, 'Nhận định:') || quoted.remainder)
      ]);
    }
    return context([row('Nhận định cần kiểm tra', prompt)]);
  }

  if (type === 'sentence_order') {
    return context([
      row('Câu cần tạo', prompt || 'Sắp xếp thành câu đúng.'),
      row('Yêu cầu', 'Sắp xếp các từ thành câu đúng.')
    ]);
  }

  const quoted = splitQuotedPrompt(prompt);
  if (quoted) {
    return context([
      row('Câu', quoted.sentence),
      row('Yêu cầu', stripPrefix(quoted.remainder, 'Yêu cầu:') || quoted.remainder || 'Chọn đáp án đúng.')
    ]);
  }

  return context([row('Câu hỏi', prompt)]);
}

function context(rows) {
  return Object.freeze({
    heading: 'Thông tin câu hỏi',
    rows: Object.freeze(rows.filter(candidate => candidate.value))
  });
}

function row(label, value) {
  return Object.freeze({ label, value: String(value ?? '').trim() });
}

function splitQuotedPrompt(prompt) {
  const prefix = 'Cho câu:';
  const text = String(prompt ?? '').trim();
  if (!text.startsWith(prefix)) return null;

  const quotedText = text.slice(prefix.length).trimStart();
  const openingQuote = quotedText[0];
  let closingQuote = null;
  if (openingQuote === '“') closingQuote = '”';
  else if (openingQuote === '"') closingQuote = '"';
  if (!closingQuote) return null;

  const closingIndex = quotedText.indexOf(closingQuote, 1);
  if (closingIndex < 0) return null;

  const sentence = quotedText.slice(1, closingIndex).trim();
  if (!sentence) return null;

  return {
    sentence,
    remainder: quotedText.slice(closingIndex + 1).trim()
  };
}

function stripPrefix(value, prefix) {
  const text = String(value ?? '').trim();
  return text.startsWith(prefix) ? text.slice(prefix.length).trim() : text;
}
