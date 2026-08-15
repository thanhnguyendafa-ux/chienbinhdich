import { buildLessonPrintModel } from './lessonPrintModel.js';
import { normalizePrintConfig, printDensityLabel } from './printConfig.js';
import { renderPrintQuestion } from './printQuestionRegistry.js';
import { esc } from './printMarkup.js';

export function renderLessonPrint({ root, lesson, onBack, onPrint = () => window.print() }) {
  root.innerHTML = `
    <main class="page admin-page lesson-print-screen">
      <section class="lesson-print-toolbar" aria-label="Thiết lập bản in">
        <div class="lesson-print-toolbar-head">
          <button class="ghost-btn" type="button" data-print-back>← Lesson</button>
          <div><p class="eyebrow">TẠO BẢN IN</p><h1>${esc(lesson.title)}</h1></div>
          <button class="primary-btn" type="button" data-print-now>In / Lưu PDF</button>
        </div>
        <div class="lesson-print-controls">
          <label><span>Phiên bản</span><select data-print-version><option value="student">Học sinh</option><option value="teacher">Giáo viên</option></select></label>
          <label><span>Mật độ</span><select data-print-density><option value="compact">${printDensityLabel('compact')}</option><option value="standard">${printDensityLabel('standard')}</option><option value="wide">${printDensityLabel('wide')}</option></select></label>
          <label class="lesson-print-theory-control" data-student-theory-wrap>
            <span>Lý thuyết học sinh</span>
            <span class="lesson-print-theory-toggle-row"><input type="checkbox" data-print-student-theory checked /><strong>Hiện lý thuyết hỗ trợ</strong></span>
            <small>Chỉ hiện ở các câu được thiết kế “Anytime”.</small>
          </label>
          <label data-teacher-detail-wrap hidden><span>Đáp án giáo viên</span><select data-teacher-detail><option value="compact">Đáp án gọn</option><option value="full">Đáp án + giải thích đầy đủ</option></select></label>
          <div class="lesson-print-paper-fact"><span>Khổ giấy</span><strong>A4 · Dọc · 13 pt</strong></div>
        </div>
      </section>
      <section class="lesson-print-preview-wrap"><div data-print-preview></div></section>
    </main>`;

  const preview = root.querySelector('[data-print-preview]');
  const version = root.querySelector('[data-print-version]');
  const density = root.querySelector('[data-print-density]');
  const detail = root.querySelector('[data-teacher-detail]');
  const detailWrap = root.querySelector('[data-teacher-detail-wrap]');
  const theoryToggle = root.querySelector('[data-print-student-theory]');
  const theoryWrap = root.querySelector('[data-student-theory-wrap]');

  const refresh = () => {
    const config = normalizePrintConfig({
      version: version?.value,
      density: density?.value,
      teacherDetail: detail?.value,
      showStudentTheory: theoryToggle?.checked ?? true
    });
    const teacher = config.version === 'teacher';
    if (detailWrap) detailWrap.hidden = !teacher;
    if (theoryWrap) theoryWrap.hidden = teacher;
    if (preview) preview.innerHTML = renderPaper(buildLessonPrintModel(lesson, config));
  };

  version?.addEventListener('change', refresh);
  density?.addEventListener('change', refresh);
  detail?.addEventListener('change', refresh);
  theoryToggle?.addEventListener('change', refresh);
  root.querySelector('[data-print-back]')?.addEventListener('click', onBack);
  root.querySelector('[data-print-now]')?.addEventListener('click', onPrint);
  refresh();
}

export function renderPaper(model) {
  const teacher = model.config.version === 'teacher';
  return `<article class="lesson-print-paper density-${esc(model.config.density)} ${teacher ? 'is-teacher' : 'is-student'}">
    <header class="lesson-print-header">
      <div class="lesson-print-title-row"><p>${esc(model.course)} · ${esc(model.unit)}</p>${teacher ? '<strong>BẢN GIÁO VIÊN</strong>' : ''}</div>
      <h1>${esc(model.title)}</h1>
      <div class="lesson-print-student-line"><span>Name: __________________</span><span>Class: ______</span><span>Date: __________</span><span>Score: ______</span></div>
    </header>
    <div class="lesson-print-body">
      ${model.sections.map(renderSection).join('')}
    </div>
    <footer class="lesson-print-footer"><span>${esc(model.course)} · ${esc(model.title)}</span><span>${model.questionCount} questions</span></footer>
  </article>`;
}

function renderSection(section) {
  return `<section class="lesson-print-section">
    <h2>${esc(section.title)}</h2>
    ${section.passage ? `<article class="lesson-print-passage"><h3>${esc(section.passage.title)}</h3><p>${esc(section.passage.text)}</p></article>` : ''}
    ${section.blocks.map(block => `<section class="lesson-print-block"><p class="lesson-print-instruction">${esc(block.instruction)}</p>${block.questions.map(renderPrintQuestion).join('')}</section>`).join('')}
  </section>`;
}
