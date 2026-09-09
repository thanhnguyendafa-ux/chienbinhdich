export function createAdminFlow({
  root,
  firebaseEnabled,
  getScreen,
  getAdminRepository,
  getAdminLessonSettingsRepository,
  getAdminLessonContentRepository,
  getAdminLessonReviewRepository,
  loadAdminEffectiveLesson,
  loadHistoricalLessonForSession,
  loadLessonSet,
  listSetDescriptors,
  listFolders,
  applyLessonMasterySettings,
  buildFixedLessonUrl,
  deriveLessonReviewState,
  validateLesson,
  startStudentPreview,
  renderLoading
}) {
  async function showAdmin() {
    if (!firebaseEnabled) {
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
    if (params.get('preview')) return startStudentPreview(params.get('preview'));
    if (params.get('inspect')) return showAdminInspector(params.get('inspect'));
    if (params.get('session')) return showAdminSession(params.get('session'));
    return showAdminDashboard();
  }

  async function showAdminDashboard() {
    const repository = getAdminRepository();
    const settingsRepository = getAdminLessonSettingsRepository();
    const contentRepository = getAdminLessonContentRepository();
    const reviewRepository = getAdminLessonReviewRepository();
    renderLoading(root, 'Đang tải Dashboard...');
    const [remoteSessions, lessonSettings, currentContents, reviews] = await Promise.all([
      repository.listSessions(),
      settingsRepository.listLessonSettings(),
      contentRepository.listCurrentContent(),
      reviewRepository.listLessonReviews()
    ]);
    const { renderAdminDashboard } = await getScreen('admin', 'Đang mở Dashboard...');
    const sets = applyLessonMasterySettings(listSetDescriptors(), lessonSettings);
    renderAdminDashboard({
      root,
      folders: listFolders(),
      sets,
      sessions: remoteSessions,
      reviews,
      currentContents,
      fixedUrlFor: descriptor => buildFixedLessonUrl(window.location, descriptor),
      loadLesson: loadAdminEffectiveLesson,
      onInspect: setId => navigateAdmin({ inspect: setId }),
      onOpenSession: sessionId => navigateAdmin({ session: sessionId }),
      onSaveMastery: (setId, value) => settingsRepository.savePassThreshold(setId, value),
      onResetMastery: setId => settingsRepository.resetPassThreshold(setId),
      onSaveReview: (setId, review) => reviewRepository.saveLessonReview(setId, review),
      onClearReview: setId => reviewRepository.clearLessonReview(setId),
      onRefresh: showAdminDashboard,
      onSignOut: async () => {
        await repository.signOutAdmin();
        window.location.assign('/admin');
      }
    });
  }

  async function showAdminInspector(setId) {
    const settingsRepository = getAdminLessonSettingsRepository();
    const contentRepository = getAdminLessonContentRepository();
    const reviewRepository = getAdminLessonReviewRepository();
    const [lesson, baseLesson, review] = await Promise.all([
      loadAdminEffectiveLesson(setId),
      loadLessonSet(setId),
      reviewRepository.getLessonReview(setId)
    ]);
    const reviewState = deriveLessonReviewState(lesson, review);
    const { renderLessonInspector } = await getScreen('admin', 'Đang tải nội dung bài...');
    renderLessonInspector({
      root,
      set: lesson,
      baseSet: baseLesson,
      reviewState,
      fixedUrl: buildFixedLessonUrl(window.location, lesson),
      onBack: () => navigateAdmin(),
      onStudentPreview: () => navigateAdmin({ preview: setId }),
      onPrint: () => navigateAdmin({ print: setId }),
      onSaveMastery: (id, value) => settingsRepository.savePassThreshold(id, value),
      onResetMastery: id => settingsRepository.resetPassThreshold(id),
      onSaveTypingTolerance: (id, value) => settingsRepository.saveTypingTolerance(id, value),
      onResetTypingTolerance: id => settingsRepository.resetTypingTolerance(id),
      onPublishContent: async (id, items) => {
        const base = id === setId ? baseLesson : await loadLessonSet(id);
        const candidate = { ...lesson, items };
        validateLesson(candidate);
        return contentRepository.publishContent(id, { baseVersion: base.version ?? 1, items });
      },
      onResetContent: id => contentRepository.resetToBase(id),
      onSaveReview: (id, nextReview) => reviewRepository.saveLessonReview(id, nextReview),
      onClearReview: id => reviewRepository.clearLessonReview(id),
      onRefresh: () => showAdminInspector(setId)
    });
  }

  async function showAdminLessonPrint(setId) {
    renderLoading(root, 'Đang chuẩn bị bản in...');
    const lesson = await loadAdminEffectiveLesson(setId);
    validateLesson(lesson);
    const { renderLessonPrint } = await getScreen('admin', 'Đang mở bản in...');
    renderLessonPrint({
      root,
      lesson,
      onBack: () => navigateAdmin({ inspect: setId })
    });
  }

  async function showAdminSession(sessionId) {
    const repository = getAdminRepository();
    renderLoading(root, 'Đang tải kết quả học sinh...');
    const detail = await repository.getSessionDetail(sessionId);
    const currentLesson = await loadAdminEffectiveLesson(detail.session.setId);
    const sessionLesson = await loadHistoricalLessonForSession(detail.session, { admin: true });
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

  return Object.freeze({ showAdmin, navigateAdmin });
}
