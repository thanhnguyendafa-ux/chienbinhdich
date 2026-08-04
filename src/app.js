import { validateSet } from './data/contentValidator.js';
import { localSessionRepository as sessions } from './repositories/localSessionRepository.js';
import { loadLessonSet } from './repositories/lessonRepository.js';
import { createSession, submitAnswer } from './core/sessionMachine.js';
import { renderLoading } from './ui/renderLoading.js';

const DEFAULT_SET_ID = 'g7-u1-s1';
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
  set = await loadLessonSet(DEFAULT_SET_ID);
  const contentErrors = validateSet(set);
  if (contentErrors.length) throw new Error(`Invalid lesson content: ${contentErrors.join('; ')}`);
  return set;
}

async function showEntry() {
  const { renderEntry } = await getScreen('entry', 'Đang mở trang học...');
  renderEntry({
    root,
    lastName: currentStudentName,
    resumeSession: session?.status === 'in_progress' ? session : null,
    onStart: async name => {
      currentStudentName = name;
      session = null;
      await showLibrary();
    },
    onResume: showDrill
  });
}

async function showLibrary() {
  if (!set) renderLoading(root, 'Đang tải nội dung Set 1...');
  const lesson = await ensureSet();
  const { renderLibrary } = await getScreen('library', 'Đang mở Set 1...');
  renderLibrary({
    root,
    studentName: currentStudentName,
    set: lesson,
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
  if (session.status === 'completed') return showReport();
  const { renderDrill, showSuccess } = await getScreen('drill', 'Đang tải bài luyện...');

  renderDrill({
    root,
    session,
    set: lesson,
    feedback,
    onSubmit: ({ answer, attemptMeta }) => {
      const currentItem = lesson.items[session.currentIndex];
      const result = submitAnswer({ session, set: lesson, answer, attemptMeta });
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
        answer: currentItem.en,
        score: result.event.score,
        onContinue: async () => {
          if (result.event.completed) {
            sessions.saveReport(session);
            await showReport();
          } else {
            await showDrill();
          }
        }
      });
    }
  });
}

async function showReport() {
  if (!session) return showEntry();
  const lesson = await ensureSet();
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
}

showEntry().catch(showFatalError);

function showFatalError(error) {
  console.error(error);
  root.innerHTML = `<main class="loading-page"><section class="loading-panel error-panel"><div class="brand-lockup"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div><h1>Không mở được bài học</h1><p>Hãy tải lại trang. Nếu lỗi vẫn còn, báo cho Thầy Thành MRT.</p></section></main>`;
}
