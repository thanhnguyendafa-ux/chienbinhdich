export function renderAnswerAnalysis(teachingFeedback, esc) {
  const analysis = teachingFeedback?.answerAnalysis;
  if (!Array.isArray(analysis) || analysis.length === 0) return '';
  return `
    <section class="answer-analysis" aria-label="Answer analysis / Giải thích từng từ">
      <div class="answer-analysis-heading">ANSWER ANALYSIS / GIẢI THÍCH TỪNG TỪ</div>
      <div class="answer-analysis-list">
        ${analysis.map(entry => `
          <div class="answer-analysis-row">
            <strong>${esc(entry.word)}</strong>
            <span>${esc(entry.sound)}</span>
            <p>${esc(entry.explanation)}</p>
          </div>`).join('')}
      </div>
    </section>`;
}
