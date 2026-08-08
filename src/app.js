import { validateSet } from './data/contentValidator.js';
import { firebaseConfig } from './config/firebaseConfig.js';
import { localSessionRepository as sessions } from './repositories/localSessionRepository.js';
import { createFirebaseAssignmentRepository } from './repositories/assignmentRepository.js';
import { getSetDescriptor, listFolders, listSetDescriptors, loadLessonSet } from './repositories/lessonRepository.js';
import { abandonSession, continueQualifiedSession, createSession, qualifySessionIfEligible, submitAnswer, submitPassedSession } from './core/sessionMachine.js';
import { buildAssignmentShareUrl, resolveAccessRoute } from './core/accessRouting.js';
import { renderLoading } from './ui/renderLoading.js';

const route = resolveAccessRoute(window.location);
const root = document.querySelector('#app');
const moduleCache = new Map();
let assignmentRepository = null;
let currentStudentName = sessions.getLastStudentName();
let session = route.kind === 'assignment' ? sessions.loadActive() : null;
let feedback = null;
let set = null;
let activeSetId = null;
let assignment = null;
let previewMode = false;

const screenLoaders = Object.freeze({
  access: () => import('./features/access/renderAccess.js'),
  admin: () => import('./features/admin/renderAdmin.js'),
  entry: () => import('./features/entry/renderEntry.js'),
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

function getAssignmentRepository() {
  if (!firebaseConfig.enabled) throw new Error('Firebase chưa được bật cho Chiến Binh Dịch.');
  assignmentRepository ??= createFirebaseAssignmentRepository(firebaseConfig.project);
  return assignmentRepository;
}

function setActiveSet(setId) {
  if (activeSetId !== setId) set = null;
  activeSetId = setId;
}

async function ensureSet() {
  if (!activeSetId) throw new Error('Không có Set đang hoạt động.');
  if (set) return set;
  set = await loadLessonSet(activeSetId);
  const contentErrors = validateSet(set);
  if (contentErrors.length) throw new Error(`Invalid lesson content: ${contentErrors.join('; ')}`);
  return set;
}

function canResumeCurrentSet() {
  if (previewMode) return false;
  return ['active', 'extended', 'passed'].includes(session?.status)
    && session.setId === activeSetId
    && session.assignmentId === assignment?.id
    && (!set || session.setVersion === set.version);
}

function createCurrentSession(studentName, lesson) {
  const created = createSession({ studentName, set: lesson });
  if (previewMode) return { ...created, persistenceMode: 'preview' };
  if (!assignment?.id) throw new Error('Assignment chưa được xác định.');
  return {
    ...created,
    assignmentId: assignment.id,
    assignmentSlug: assignment.slug
  };
}

function saveActiveSession() {
  if (!previewMode && session) sessions.saveActive(session);
}

function saveReportSession() {
  if (!previewMode && session) sessions.saveReport(session);
}

async function showStudentHome() {
  const { renderStudentHome } = await getScreen('access', 'Đang mở Chiến Binh Dịch...');
  renderStudentHome({ root });
}

async function showAssignment() {
  if (!firebaseConfig.enabled) {
    const { renderAssignmentUnavailable } = await getScreen('access', 'Đang kiểm tra link bài...');
    return renderAssignmentUnavailable({
      root,
      title: 'Bài tập chưa được mở',
      message: 'Hệ thống giao bài đang được giáo viên cấu hình. Hãy thử lại sau.'
    });
  }

  const repository = getAssignmentRepository();
  assignment = await repository.getStudentAssignment(route.code);
  setActiveSet(assignment.setId);

  if (assignment.setVersion && getSetDescriptor(assignment.setId)?.version !== assignment.setVersion) {
    throw new Error('Assignment này dùng phiên bản bài cũ. Hãy xin giáo viên tạo link mới.');
  }

  const canonicalUrl = buildAssignmentShareUrl(window.location, assignment);
  if (window.location.href !== canonicalUrl) window.history.replaceState(null, '', canonicalUrl);
  await showEntry();
}

async function showEntry() {
  const lesson = await ensureSet();
  const { renderEntry } = await getScreen('entry', 'Đang mở trang học...');
  renderEntry({
    root,
    lastName: currentStudentName,
    directSet: lesson,
    resumeSession: canResumeCurrentSet() ? session : null,
    previewMode,
    onBack: previewMode ? () => navigateAdmin({ inspect: activeSetId }) : null,
    onStart: async name => {
      currentStudentName = name;
      renderLoading(root, 'Đang chuẩn bị bài luyện...');
      session = createCurrentSession(name, lesson);
      saveActiveSession();
      await showDrill();
    },
    onResume: showDrill
  });
}

async function showDrill() {
  if (!session) return showEntry();
  if (!set) renderLoading(root, 'Đang tải bài luyện...');
  const lesson = await ensureSet();

  const reconciled = qualifySessionIfEligible(session, lesson);
  if (reconciled !== session) {
    session = reconciled;
    saveActiveSession();
    feedback = null;
  }

  const { renderDrill, renderPassed, showSuccess } = await getScreen('drill', 'Đang tải bài luyện...');

  if (session.status === 'passed') {
    return renderPassed({
      root,
      session,
      set: lesson,
      onSubmit: finishQualified,
      onContinue: async () => {
        session = continueQualifiedSession(session, lesson);
        saveActiveSession();
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
      const answeredItem = lesson.items.find(candidate => candidate.id === session.currentItemId) ?? null;
      const result = submitAnswer({ session, set: lesson, response, attemptMeta });
      session = result.session;
      saveActiveSession();

      if (result.event.type === 'incorrect_retry' || result.event.type === 'incorrect_reveal') {
        feedback = result.event;
        return showDrill();
      }

      feedback = null;
      showSuccess({
        root,
        type: result.event.type,
        item: answeredItem,
        entered: result.event.entered,
        answer: result.event.answer,
        teachingFeedback: answeredItem?.teachingFeedback ?? null,
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
  saveReportSession();
  feedback = null;
  await showReport();
}

async function finishAbandoned() {
  if (!session) return;
  session = abandonSession(session);
  saveReportSession();
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
        session = createCurrentSession(session.studentName, lesson);
        saveActiveSession();
        await showDrill();
      },
      onHome: async () => {
        currentStudentName = session.studentName;
        session = null;
        if (previewMode) return navigateAdmin({ inspect: activeSetId });
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
          <button class="secondary-btn" id="report-home-btn" type="button">${previewMode ? 'Về Admin' : 'Về bài được giao'}</button>
        </div>
      </section>
    </main>`;
  root.querySelector('#retry-report-btn')?.addEventListener('click', showReport);
  root.querySelector('#report-home-btn')?.addEventListener('click', async () => {
    currentStudentName = session?.studentName ?? currentStudentName;
    session = null;
    if (previewMode) return navigateAdmin({ inspect: activeSetId });
    await showEntry();
  });
}

async function showAdmin() {
  if (!firebaseConfig.enabled) {
    const { renderFirebaseSetupGate } = await getScreen('access', 'Đang kiểm tra Firebase...');
    return renderFirebaseSetupGate({ root });
  }

  const repository = getAssignmentRepository();
  const state = await repository.getAdminState();
  const { renderAdminLogin } = await getScreen('admin', 'Đang mở khu vực quản trị...');

  if (!state.isAdmin) {
    return renderAdminLogin({
      root,
      onSubmit: async (email, password) => {
        await repository.signInAdmin(email, password);
        await showAdmin();
      }
    });
  }

  const params = new URL(window.location.href).searchParams;
  if (params.get('preview')) return showAdminPreview(params.get('preview'));
  if (params.get('inspect')) return showAdminInspector(params.get('inspect'));
  if (params.get('session')) return showAdminSession(params.get('session'));
  return showAdminDashboard();
}

async function showAdminDashboard() {
  const repository = getAssignmentRepository();
  renderLoading(root, 'Đang tải Dashboard...');
  const [assignments, remoteSessions] = await Promise.all([
    repository.listAssignments(),
    repository.listSessions()
  ]);

  const { renderAdminDashboard } = await getScreen('admin', 'Đang mở Dashboard...');
  const sets = listSetDescriptors();
  renderAdminDashboard({
    root,
    folders: listFolders(),
    sets,
    assignments,
    sessions: remoteSessions,
    assignmentUrlFor: item => buildAssignmentShareUrl(window.location, item),
    onInspect: setId => navigateAdmin({ inspect: setId }),
    onPreview: setId => navigateAdmin({ preview: setId }),
    onCreateAssignment: createAssignmentForSet,
    onToggleAssignment: async (code, enable) => {
      if (enable) await repository.enableAssignment(code);
      else await repository.disableAssignment(code);
      await showAdminDashboard();
    },
    onOpenSession: sessionId => navigateAdmin({ session: sessionId }),
    onRefresh: showAdminDashboard,
    onSignOut: async () => {
      await repository.signOutAdmin();
      window.location.assign('/admin');
    }
  });
}

async function showAdminInspector(setId) {
  const lesson = await loadLessonSet(setId);
  const contentErrors = validateSet(lesson);
  if (contentErrors.length) throw new Error(`Invalid lesson content: ${contentErrors.join('; ')}`);
  const { renderLessonInspector } = await getScreen('admin', 'Đang tải nội dung bài...');
  renderLessonInspector({
    root,
    set: lesson,
    onBack: () => navigateAdmin(),
    onPreview: () => navigateAdmin({ preview: setId }),
    onCreateAssignment: () => createAssignmentForSet(setId)
  });
}

async function showAdminPreview(setId) {
  const descriptor = getSetDescriptor(setId);
  if (!descriptor) throw new Error(`Không tìm thấy set: ${setId}`);
  previewMode = true;
  assignment = null;
  session = null;
  feedback = null;
  setActiveSet(setId);
  await showEntry();
}

async function showAdminSession(sessionId) {
  const repository = getAssignmentRepository();
  renderLoading(root, 'Đang tải kết quả học sinh...');
  const detail = await repository.getSessionDetail(sessionId);
  const lesson = await loadLessonSet(detail.session.setId);
  const { renderAdminSessionDetail } = await getScreen('admin', 'Đang mở kết quả...');
  renderAdminSessionDetail({
    root,
    ...detail,
    set: lesson,
    onBack: () => navigateAdmin()
  });
}

async function createAssignmentForSet(setId) {
  const descriptor = getSetDescriptor(setId);
  if (!descriptor) throw new Error(`Không tìm thấy set: ${setId}`);
  const created = await getAssignmentRepository().createAssignment(descriptor);
  return {
    assignment: created,
    url: buildAssignmentShareUrl(window.location, created)
  };
}

function navigateAdmin(params = {}) {
  const url = new URL('/admin', window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  window.location.assign(url.href);
}

async function bootstrap() {
  if (route.kind === 'home') return showStudentHome();
  if (route.kind === 'assignment') return showAssignment();
  if (route.kind === 'admin') return showAdmin();
  if (route.kind === 'legacy-set') {
    const url = new URL('/admin', window.location.origin);
    url.searchParams.set('preview', route.setId);
    window.location.replace(url.href);
    return;
  }

  const { renderAssignmentUnavailable } = await getScreen('access', 'Đang kiểm tra đường dẫn...');
  renderAssignmentUnavailable({
    root,
    title: route.kind === 'invalid-assignment' ? 'Mã bài tập không hợp lệ' : 'Không tìm thấy trang',
    message: 'Hãy dùng đúng đường link do giáo viên gửi.'
  });
}

bootstrap().catch(showFatalError);

function showFatalError(error) {
  console.error(error);
  const code = error?.code;
  const assignmentProblem = ['assignment_not_found', 'assignment_closed', 'assignment_invalid'].includes(code);
  root.innerHTML = `<main class="loading-page"><section class="loading-panel error-panel"><div class="brand-lockup"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div><h1>${assignmentProblem ? 'Không mở được bài được giao' : 'Không mở được trang'}</h1><p>${assignmentProblem ? escapeHtml(error.message) : 'Hãy tải lại trang. Nếu lỗi vẫn còn, báo cho Thầy Thành MRT.'}</p></section></main>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
