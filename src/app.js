import { validateSet } from './data/contentValidator.js';
import { firebaseConfig } from './config/firebaseConfig.js';
import { localSessionRepository as sessions } from './repositories/localSessionRepository.js';
import { createFirebaseAdminRepository } from './repositories/adminRepository.js';
import { createAdminLessonSettingsRepository } from './repositories/adminLessonSettingsRepository.js';
import { createLessonSettingsReader } from './repositories/lessonSettingsReader.js';
import { createLegacyAssignmentRepository } from './repositories/legacyAssignmentRepository.js';
import { getSetDescriptor, getSetDescriptorBySlug, listFolders, listSetDescriptors, loadLessonSet } from './repositories/lessonRepository.js';
import { applyLessonMasterySetting, applyLessonMasterySettings, applySessionMasterySnapshot } from './services/effectiveLessonService.js';
import { abandonSession, continueQualifiedSession, createSession, qualifySessionIfEligible, submitAnswer, submitPassedSession } from './core/sessionMachine.js';
import { resolveAccessRoute } from './core/accessRouting.js';
import { buildFixedLessonUrl, buildLegacyAssignmentUrl } from './core/lessonLinks.js';
import { renderLoading } from './ui/renderLoading.js';

const route = resolveAccessRoute(window.location);
const root = document.querySelector('#app');
const moduleCache = new Map();
let adminRepository = null;
let adminLessonSettingsRepository = null;
let lessonSettingsReader = null;
let legacyAssignmentRepository = null;
let currentStudentName = sessions.getLastStudentName();
let session = ['lesson-link', 'legacy-assignment'].includes(route.kind) ? sessions.loadActive() : null;
let feedback = null;
let set = null;
let activeSetId = null;
let accessContext = null;
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

function getAdminRepository() {
  if (!firebaseConfig.enabled) throw new Error('Firebase chưa được bật cho Chiến Binh Dịch.');
  adminRepository ??= createFirebaseAdminRepository(firebaseConfig.project);
  return adminRepository;
}

function getAdminLessonSettingsRepository() {
  if (!firebaseConfig.enabled) throw new Error('Firebase chưa được bật cho Chiến Binh Dịch.');
  adminLessonSettingsRepository ??= createAdminLessonSettingsRepository(firebaseConfig.project);
  return adminLessonSettingsRepository;
}

function getLessonSettingsReader() {
  if (!firebaseConfig.enabled) return null;
  lessonSettingsReader ??= createLessonSettingsReader(firebaseConfig.project);
  return lessonSettingsReader;
}

function getLegacyAssignmentRepository() {
  if (!firebaseConfig.enabled) throw new Error('Firebase chưa được bật cho Chiến Binh Dịch.');
  legacyAssignmentRepository ??= createLegacyAssignmentRepository(firebaseConfig.project);
  return legacyAssignmentRepository;
}

function setActiveSet(setId) {
  if (activeSetId !== setId) set = null;
  activeSetId = setId;
}

async function readStudentLessonSetting(setId) {
  const reader = getLessonSettingsReader();
  if (!reader) return null;
  try {
    return await reader.getLessonSetting(setId);
  } catch (cause) {
    const error = new Error('Không tải được cấu hình Mastery hiện tại. Hãy thử lại để tránh dùng sai mốc PASS.');
    error.code = 'lesson_settings_unavailable';
    error.cause = cause;
    throw error;
  }
}

async function ensureSet({ refreshSettings = false } = {}) {
  if (!activeSetId) throw new Error('Không có Set đang hoạt động.');
  if (set && !refreshSettings) return set;
  const [staticLesson, setting] = await Promise.all([
    loadLessonSet(activeSetId),
    readStudentLessonSetting(activeSetId)
  ]);
  set = applyLessonMasterySetting(staticLesson, setting);
  validateLesson(set);
  return set;
}

async function loadSessionHistoricalLesson() {
  if (!activeSetId || !session) throw new Error('Không có session đang hoạt động.');
  const staticLesson = await loadLessonSet(activeSetId);
  validateLesson(staticLesson);
  return applySessionMasterySnapshot(applyLessonMasterySetting(staticLesson, null), session);
}

async function loadAdminEffectiveLesson(setId) {
  const settingsRepository = getAdminLessonSettingsRepository();
  const [staticLesson, setting] = await Promise.all([
    loadLessonSet(setId),
    settingsRepository.getLessonSetting(setId)
  ]);
  const lesson = applyLessonMasterySetting(staticLesson, setting);
  validateLesson(lesson);
  return lesson;
}

function validateLesson(lesson) {
  const contentErrors = validateSet(lesson);
  if (contentErrors.length) throw new Error(`Invalid lesson content: ${contentErrors.join('; ')}`);
}

function canResumeCurrentSet() {
  if (previewMode || !accessContext) return false;
  const baseMatch = ['active', 'extended', 'passed'].includes(session?.status)
    && session.setId === activeSetId
    && (!set || session.setVersion === set.version);
  if (!baseMatch) return false;
  if (accessContext.kind === 'fixed-link') {
    return session.entryMode === 'fixed-link' && session.accessSlug === accessContext.slug;
  }
  return session.assignmentId === accessContext.assignmentId;
}

function createCurrentSession(studentName, lesson) {
  const created = createSession({ studentName, set: lesson });
  if (previewMode) return { ...created, persistenceMode: 'preview' };
  if (!accessContext) throw new Error('Nguồn truy cập bài học chưa được xác định.');
  if (accessContext.kind === 'fixed-link') {
    return { ...created, entryMode: 'fixed-link', accessSlug: accessContext.slug };
  }
  return {
    ...created,
    entryMode: 'legacy-assignment',
    assignmentId: accessContext.assignmentId,
    assignmentSlug: accessContext.slug
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

async function showFixedLessonLink() {
  const descriptor = getSetDescriptorBySlug(route.slug);
  if (!descriptor) throw accessError('lesson_not_found', 'Link bài tập không tồn tại.');
  accessContext = { kind: 'fixed-link', slug: descriptor.lessonSlug, setId: descriptor.id };
  setActiveSet(descriptor.id);
  const canonicalUrl = buildFixedLessonUrl(window.location, descriptor);
  if (window.location.href !== canonicalUrl) window.history.replaceState(null, '', canonicalUrl);
  await showEntry();
}

async function showLegacyAssignment() {
  if (!firebaseConfig.enabled) {
    const { renderAssignmentUnavailable } = await getScreen('access', 'Đang kiểm tra link bài cũ...');
    return renderAssignmentUnavailable({
      root,
      title: 'Bài tập chưa được mở',
      message: 'Link giao bài cũ cần Firebase để xác thực. Hãy thử lại sau.'
    });
  }
  const assignment = await getLegacyAssignmentRepository().getStudentAssignment(route.code);
  const descriptor = getSetDescriptor(assignment.setId);
  if (!descriptor) throw accessError('lesson_not_found', 'Bài học của link cũ không còn tồn tại.');
  if (assignment.setVersion && descriptor.version !== assignment.setVersion) {
    throw accessError('assignment_closed', 'Link cũ dùng phiên bản bài không còn hiện hành. Hãy xin giáo viên link cố định mới.');
  }
  accessContext = {
    kind: 'legacy-assignment',
    assignmentId: assignment.id,
    slug: assignment.slug,
    setId: assignment.setId
  };
  setActiveSet(assignment.setId);
  const canonicalUrl = buildLegacyAssignmentUrl(window.location, assignment);
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
      renderLoading(root, 'Đang xác nhận mốc Mastery mới nhất...');
      const latestLesson = previewMode ? lesson : await ensureSet({ refreshSettings: true });
      session = createCurrentSession(name, latestLesson);
      saveActiveSession();
      await showDrill();
    },
    onResume: showDrill
  });
}

async function showDrill() {
  if (!session) return showEntry();
  if (!set) renderLoading(root, 'Đang tải bài luyện...');
  const currentLesson = await ensureSet();
  const lesson = applySessionMasterySnapshot(currentLesson, session);
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
  const lesson = await loadSessionHistoricalLesson();
  try {
    const { renderReport } = await getScreen('report', 'Đang tổng hợp quá trình học...');
    renderReport({
      root,
      session,
      set: lesson,
      onRetry: async () => {
        renderLoading(root, 'Đang tạo lượt làm mới...');
        const latestLesson = await ensureSet({ refreshSettings: true });
        session = createCurrentSession(session.studentName, latestLesson);
        saveActiveSession();
        await showDrill();
      },
      onHome: async () => {
        currentStudentName = session.studentName;
        session = null;
        if (previewMode) return navigateAdmin({ inspect: activeSetId });
        set = null;
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
    set = null;
    await showEntry();
  });
}

async function showAdmin() {
  if (!firebaseConfig.enabled) {
    const { renderFirebaseSetupGate } = await getScreen('access', 'Đang kiểm tra Firebase...');
    return renderFirebaseSetupGate({ root });
  }
  const repository = getAdminRepository();
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
  if (params.get('print')) return showAdminLessonPrint(params.get('print'));
  if (params.get('preview')) return showAdminStudentPreview(params.get('preview'));
  if (params.get('inspect')) return showAdminInspector(params.get('inspect'));
  if (params.get('session')) return showAdminSession(params.get('session'));
  return showAdminDashboard();
}

async function showAdminDashboard() {
  const repository = getAdminRepository();
  const settingsRepository = getAdminLessonSettingsRepository();
  renderLoading(root, 'Đang tải Dashboard...');
  const [remoteSessions, lessonSettings] = await Promise.all([
    repository.listSessions(),
    settingsRepository.listLessonSettings()
  ]);
  const { renderAdminDashboard } = await getScreen('admin', 'Đang mở Dashboard...');
  const sets = applyLessonMasterySettings(listSetDescriptors(), lessonSettings);
  renderAdminDashboard({
    root,
    folders: listFolders(),
    sets,
    sessions: remoteSessions,
    fixedUrlFor: descriptor => buildFixedLessonUrl(window.location, descriptor),
    loadLesson: loadAdminEffectiveLesson,
    onInspect: setId => navigateAdmin({ inspect: setId }),
    onOpenSession: sessionId => navigateAdmin({ session: sessionId }),
    onSaveMastery: (setId, value) => settingsRepository.savePassThreshold(setId, value),
    onResetMastery: setId => settingsRepository.resetPassThreshold(setId),
    onRefresh: showAdminDashboard,
    onSignOut: async () => {
      await repository.signOutAdmin();
      window.location.assign('/admin');
    }
  });
}

async function showAdminInspector(setId) {
  const settingsRepository = getAdminLessonSettingsRepository();
  const lesson = await loadAdminEffectiveLesson(setId);
  const { renderLessonInspector } = await getScreen('admin', 'Đang tải nội dung bài...');
  renderLessonInspector({
    root,
    set: lesson,
    fixedUrl: buildFixedLessonUrl(window.location, lesson),
    onBack: () => navigateAdmin(),
    onStudentPreview: () => navigateAdmin({ preview: setId }),
    onPrint: () => navigateAdmin({ print: setId }),
    onSaveMastery: (id, value) => settingsRepository.savePassThreshold(id, value),
    onResetMastery: id => settingsRepository.resetPassThreshold(id),
    onRefresh: () => showAdminInspector(setId)
  });
}

async function showAdminLessonPrint(setId) {
  renderLoading(root, 'Đang chuẩn bị bản in...');
  const lesson = await loadLessonSet(setId);
  validateLesson(lesson);
  const { renderLessonPrint } = await getScreen('admin', 'Đang mở bản in...');
  renderLessonPrint({
    root,
    lesson,
    onBack: () => navigateAdmin({ inspect: setId })
  });
}

async function showAdminStudentPreview(setId) {
  const descriptor = getSetDescriptor(setId);
  if (!descriptor) throw new Error(`Không tìm thấy set: ${setId}`);
  previewMode = true;
  accessContext = null;
  session = null;
  feedback = null;
  setActiveSet(setId);
  await showEntry();
}

async function showAdminSession(sessionId) {
  const repository = getAdminRepository();
  renderLoading(root, 'Đang tải kết quả học sinh...');
  const detail = await repository.getSessionDetail(sessionId);
  const currentLesson = await loadAdminEffectiveLesson(detail.session.setId);
  const sessionLesson = applySessionMasterySnapshot(currentLesson, detail.session);
  const { renderAdminSessionDetail } = await getScreen('admin', 'Đang mở kết quả...');
  renderAdminSessionDetail({
    root,
    ...detail,
    set: sessionLesson,
    currentPassThreshold: currentLesson.passThreshold,
    onBack: () => navigateAdmin()
  });
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
  if (route.kind === 'lesson-link') return showFixedLessonLink();
  if (route.kind === 'legacy-assignment') return showLegacyAssignment();
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
    title: route.kind === 'invalid-lesson-link' ? 'Link bài tập không hợp lệ' : 'Không tìm thấy trang',
    message: 'Hãy dùng đúng đường link do giáo viên gửi.'
  });
}

bootstrap().catch(showFatalError);

async function showFatalError(error) {
  console.error(error);
  if (error?.code === 'lesson_settings_unavailable') {
    const { renderRetryableAccessError } = await getScreen('access', 'Đang chuẩn bị thử lại...');
    return renderRetryableAccessError({
      root,
      title: 'Chưa tải được mốc Mastery',
      message: error.message,
      onRetry: bootstrap
    });
  }

  const code = error?.code;
  const accessProblem = ['lesson_not_found', 'assignment_not_found', 'assignment_closed', 'assignment_invalid'].includes(code);
  root.innerHTML = `<main class="loading-page"><section class="loading-panel error-panel"><div class="brand-lockup"><span class="brand-seal">MRT</span><span>Chiến Binh Dịch</span></div><h1>${accessProblem ? 'Không mở được bài được giao' : 'Không mở được trang'}</h1><p>${accessProblem ? escapeHtml(error.message) : 'Hãy tải lại trang. Nếu lỗi vẫn còn, báo cho Thầy Thành.'}</p></section></main>`;
}

function accessError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
