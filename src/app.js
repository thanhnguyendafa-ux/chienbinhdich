import { validateSet } from './data/contentValidator.js';
import { localSessionRepository as sessions } from './repositories/localSessionRepository.js';
import { loadLessonSet } from './repositories/lessonRepository.js';
import { abandonSession, continueQualifiedSession, createSession, submitAnswer, submitPassedSession } from './core/sessionMachine.js';
import { buildSetShareUrl, resolveSetIdFromLocation } from './core/setRouting.js';
import { renderLoading } from './ui/renderLoading.js';

const DEFAULT_SET_ID = 'g7-u1-s1';
const requestedSetId = resolveSetIdFromLocation(window.location);
const activeSetId = requestedSetId || DEFAULT_SET_ID;
const isDirectSetLink = Boolean(requestedSetId);
const root = document.querySelector('#app');
const moduleCache = new Map();
let currentStudentName = sessions.getLastStudentName();
let session = sessions.loadActive();
let feedback = null;
let set = null;

const screenLoaders = Object.freeze({
  entry: () => import('./features/entry/renderEntry.js'),
  library: () => import('./features/library/renderLibrary.js'),
  drill: () => import('./features/drill/renderDrill.js'),
  report: () => import('./features/report/renderReport.js')
});

async function getScreen(name, loadingMessage) {
  if (moduleCache.has(name)) return moduleCache.get(name);
  renderLoading(root, loadingMessage);
  const modulePromise = screenLoaders[name]();
  moduleCache.set(name, modulePromise);
  return modulePromise;
}

async function ensureSet() {
  if (set) return set;
  set = await loadLessonSet(activeSetId);
  const contentErrors = validateSet(set);
  if (contentErrors.length) throw new Error(`Invalid lesson content: ${contentErrors.join('; ')}`);
  return set;
}

function canResumeCurrentSet() {
  return ['active', 'extended', 'passed'].includes(session?.status)
    && session.setId === activeSetId
    && (!set || session.setVersion === set.version);
}

async function showEntry() {
  const lesson = isDirectSetLink ? await ensureSet() : null;
  const { renderEntry } = await getScreen('entry', 'Đang mở trang học...');
  renderEntry({
    root,
    lastName: currentStudentName,
    directSet: lesson,
    resumeSession: canResumeCurrentSet() ? session : null,
    onStart: async name => {
      currentStudentName = name;
      if (isDirectSetLink) {
        renderLoading(root, 'Đang chuẩn bị bài luyện...');
        session = createSession({ studentName: name, set: lesson });
        sessions.saveActive(session);
        await showDrill();
      } else {
        session = null;
        await showLibrary();
      }
    },
    onResume: showDrill
  });
}

async function showLibrary() {
  if (!set) renderLoading(root, 'Đang tải nội dung bài học...');
  const lesson = await ensureSet();
  const { renderLibrary } = await getScreen('library', 'Đang mở bài học...');
  renderLibrary({
    root,
    studentName: currentStudentName,
    set: lesson,
    shareUrl: buildSetShareUrl(window.location, lesson.id),
    onBegin: async () => {
      renderLoading(root, 'Đang chuẩn bị bài luyện...');
      session = createSession({ studentName: currentStudentName, set: lesson });
      sessions.saveActive(session);
      await showDrill();
    },
    onBack: showEntry
  });
}

async function showDrill() {
  if (!session) return showEntry();
  if (!set) renderLoading(root, 'Đang tải bài luyện...');
  const lesson = await ensureSet();
  const { renderDrill, renderPassed, showSuccess } = await getScreen('drill', 'Đang tải bài luyện...');

  if (session.status === 'passed') {
    return renderPassed({
      root,
      session,
      set: lesson,
      onSubmit: finishQualified,
      onContinue: async () => {
        session = continueQualifiedSession(session, lesson);
        sessions.saveActive(session);
        feedback = null;
        await showDrill();
      }
    });
  }

  if (session.status === 'submitted' || session.status === 'abandoned') return showReport();

  renderDrill({
    root,
    session,
    set: lesson,
    feedback,
    onExit: finishAbandoned,
    onFinishQualified: session.status === 'extended' ? finishQualified : null,
    onSubmit: ({ response, attemptMeta }) => {
      const result = submitAnswer({ session, set: lesson, response, attemptMeta });
      session = result.session;
      sessions.saveActive(session);

      if (result.event.type === 'incorrect_retry' || result.event.type === 'incorrect_reveal') {
        feedback = result.event;
        return showDrill();
      }

      feedback = null;
      showSuccess({
        root,
        type: result.event.type,
        answer: result.event.answer,
        mastery: result.event.mastery,
        masteryBefore: result.event.masteryBefore,
        masteryDeltaPercent: result.event.masteryDeltaPercent,
        onContinue: showDrill
      });
    }
  });
}

async function finishQualified() {
  if (!session) return;
  session = submitPassedSession(session);
  sessions.saveReport(session);
  feedback = null;
  await showReport();
}

async function finishAbandoned() {
  if (!session) return;
  session = abandonSession(session);
  sessions.saveReport(session);
  feedback = null;
  await showReport();
}

async function showReport() {
  if (!session) return showEntry();
  const lesson = await ensureSet();
  try {
    const { renderReport } = await getScreen('report', 'Đang tổng hợp quá trình học...');
    renderReport({
      root,
      session,
      set: lesson,
      onRetry: async () => {
        renderLoading(root, 'Đang tạo lượt làm mới...');
        session = createSession({ studentName: session.studentName, set: lesson });
        sessions.saveActive(session);
        await showDrill();
      },
      onHome: async () => {
        currentStudentName = session.studentName;
        session = null;
        await showEntry();
      }
    });
  } catch (error) {
    console.error('Report render failed', error);
    moduleCache.delete('report');
    renderReportError();
  }
}

function renderReportError() {
  root.innerHTML = `
    <main class="loading-page report-error-page">
      <section class="loading-panel error-panel report-error-panel">
        <div class="brand-lockup"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div>
        <h1>Không thể mở báo cáo</h1>
        <p>Dữ liệu làm bài vẫn đã được giữ. Con có thể thử mở lại báo cáo mà không cần làm lại bài.</p>
        <div class="report-error-actions">
          <button class="primary-btn" id="retry-report-btn" type="button">Thử mở lại báo cáo</button>
          <button class="secondary-btn" id="report-home-btn" type="button">Về trang đầu</button>
        </div>
      </section>
    </main>`;
  root.querySelector('#retry-report-btn')?.addEventListener('click', showReport);
  root.querySelector('#report-home-btn')?.addEventListener('click', async () => {
    currentStudentName = session?.studentName ?? currentStudentName;
    session = null;
    await showEntry();
  });
}

showEntry().catch(showFatalError);

function showFatalError(error) {
  console.error(error);
  const missingSet = String(error?.message ?? '').includes('Không tìm thấy set');
  root.innerHTML = `<main class="loading-page"><section class="loading-panel error-panel"><div class="brand-lockup"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div><h1>${missingSet ? 'Không tìm thấy bài học' : 'Không mở được bài học'}</h1><p>${missingSet ? 'Link bài học không còn hợp lệ. Hãy xin lại link từ giáo viên.' : 'Hãy tải lại trang. Nếu lỗi vẫn còn, báo cho Thầy Thành MRT.'}</p></section></main>`;
}
