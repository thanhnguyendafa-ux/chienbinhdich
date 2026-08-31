import { firebaseConfig } from './config/firebaseConfig.js';
import { validateAssessAssignmentSnapshot } from './core/assessDelivery.js';
import { parseLegacyAssignmentToken } from './core/lessonLinks.js';
import { DELIVERY_MODE_ASSESS, resolveDeliveryMode } from './core/deliveryMode.js';
import { createAssessAttemptRepository } from './repositories/assessAttemptRepository.js';
import { createLegacyAssignmentRepository } from './repositories/legacyAssignmentRepository.js';
import { createAssessSessionRepository } from './repositories/assessSessionRepository.js';
import {
  advanceAssessSession,
  assessProgress,
  currentAssessItem,
  submitAssessSession
} from './features/assess/assessSessionController.js';
import { renderAssess } from './features/assess/renderAssess.js';
import { renderAssessReceipt } from './features/assess/renderAssessReceipt.js';

const root = document.querySelector('#app');
const assignmentRepository = createLegacyAssignmentRepository(firebaseConfig.project);
const attemptRepository = createAssessAttemptRepository(firebaseConfig.project);
const sessionRepository = createAssessSessionRepository(firebaseConfig.project);
let delivery = null;
let lesson = null;
let session = null;

bootstrap().catch(renderFatal);

async function bootstrap() {
  const parsed = parseAssessAccess(window.location);
  if (!parsed) throw assessError('assignment_invalid', 'Link Assess không hợp lệ.');

  renderLoading('Đang xác thực bài Assess...');
  const assignment = await assignmentRepository.getStudentAssignment(parsed.code);
  if (resolveDeliveryMode(assignment) !== DELIVERY_MODE_ASSESS) {
    throw assessError('delivery_mode_mismatch', 'Link này không phải chế độ Assess.');
  }
  if (String(assignment.slug) !== parsed.slug || String(assignment.code) !== parsed.code) {
    throw assessError('assignment_invalid', 'Link Assess không khớp delivery đã phát hành.');
  }

  delivery = assignment;
  lesson = validateAssessAssignmentSnapshot(assignment);
  session = resumeCandidate(sessionRepository.loadLocal(delivery.id), delivery, lesson);

  if (session?.status === 'submitted') return renderReceipt();
  if (session?.status === 'active') return renderCurrent();
  renderEntry();
}

function renderEntry() {
  root.innerHTML = `
    <main class="assess-entry-page">
      <section class="assess-entry shell">
        <span class="assess-mode-badge">ASSESS MODE</span>
        <h1>${esc(lesson.title)}</h1>
        <p>Đây là lượt kiểm tra độc lập để giáo viên xem năng lực hiện tại của con.</p>
        <div class="assess-contract-note">
          <strong>${lesson.itemCount} câu được chấm khách quan</strong>
          <span>Điểm chỉ hiển thị cho giáo viên.</span>
        </div>
        <section class="assess-mode-rules" aria-label="Luật lượt Assess">
          <strong>Con hãy làm bằng khả năng hiện tại của mình</strong>
          <ul>
            <li>Đọc kỹ và trả lời theo thực lực; không cần cố làm thật nhanh.</li>
            <li>Hệ thống không cho biết đúng/sai, đáp án hoặc điểm trong lúc làm.</li>
            <li>Không có hint, correction hay Effort Timer trong Assess.</li>
            <li>Nếu chưa biết, con có thể bỏ qua thay vì đoán theo đáp án đã nhớ.</li>
          </ul>
          <p><strong>Mục tiêu là đo đúng năng lực hiện tại, không phải đạt PASS bằng mọi cách.</strong></p>
        </section>
        <form data-assess-entry>
          <label>Họ và tên học sinh
            <input name="studentName" autocomplete="name" maxlength="100" required placeholder="Nhập họ và tên" />
          </label>
          <label class="assess-mode-ack"><input name="contractAck" type="checkbox" required /><span>Con đã hiểu đây là lượt kiểm tra độc lập và sẽ làm bằng thực lực.</span></label>
          <button type="submit" class="primary-btn">Tôi đã hiểu · Bắt đầu Assess</button>
        </form>
      </section>
    </main>`;
  root.querySelector('[data-assess-entry]')?.addEventListener('submit', async event => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button');
    button.disabled = true;
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('studentName') ?? '').trim();
    const acknowledged = formData.get('contractAck') !== null;
    if (!name || !acknowledged) {
      button.disabled = false;
      return;
    }
    try {
      renderLoading('Đang tạo lượt Assess...');
      session = await sessionRepository.create({ studentName: name, lesson, delivery });
      await renderCurrent();
    } catch (error) {
      button.disabled = false;
      throw error;
    }
  });
}

async function renderCurrent() {
  if (!session || session.status !== 'active') return renderReceipt();
  const progress = assessProgress(session, lesson);
  if (progress.complete || !currentAssessItem(session, lesson)) {
    session = submitAssessSession(session);
    await sessionRepository.save(session);
    return renderReceipt();
  }

  renderAssess({
    root,
    session,
    lesson,
    onExit: () => window.location.assign('/'),
    onSubmit: payload => record(payload, false),
    onSkip: payload => record(payload, true)
  });
}

async function record({ response, attemptMeta }, skipped) {
  const progress = assessProgress(session, lesson);
  const item = currentAssessItem(session, lesson);
  if (!item) return;

  const acknowledgement = await attemptRepository.record({
    session,
    item,
    promptIndex: progress.index,
    response,
    skipped,
    attemptMeta: {
      ...attemptMeta,
      submittedAt: Number(attemptMeta?.submittedAt ?? Date.now())
    }
  });

  session = advanceAssessSession(session, lesson, { attemptId: acknowledgement.attemptId });
  const nextProgress = assessProgress(session, lesson);
  if (nextProgress.complete) session = submitAssessSession(session);
  await sessionRepository.save(session);
  if (session.status === 'submitted') return renderReceipt();
  return renderCurrent();
}

function renderReceipt() {
  renderAssessReceipt({
    root,
    lessonTitle: lesson?.title ?? '',
    onClose: () => window.location.assign('/')
  });
}

function resumeCandidate(candidate, trustedDelivery, trustedLesson) {
  if (!candidate) return null;
  if (candidate.deliveryModeAtStart !== DELIVERY_MODE_ASSESS) return null;
  if (String(candidate.assignmentId) !== String(trustedDelivery.id)) return null;
  if (String(candidate.setId) !== String(trustedLesson.id)) return null;
  if (Number(candidate.setVersion) !== Number(trustedLesson.version)) return null;
  if (Number(candidate.deliveryContractVersionAtStart) !== Number(trustedDelivery.deliveryContractVersion)) return null;
  if (Number(candidate.contentRevisionAtStart ?? 0) !== Number(trustedDelivery.contentRevisionAtIssue ?? 0)) return null;
  return candidate;
}

function parseAssessAccess(locationLike) {
  const url = new URL(locationLike?.href ?? String(locationLike ?? 'https://example.invalid/'), 'https://example.invalid');
  return parseLegacyAssignmentToken(url.searchParams.get('assignment') ?? '');
}

function renderLoading(message) {
  root.innerHTML = `<main class="assess-loading"><section class="shell"><span class="assess-mode-badge">ASSESS</span><h1>${esc(message)}</h1></section></main>`;
}

function renderFatal(error) {
  console.error(error);
  root.innerHTML = `
    <main class="assess-loading">
      <section class="shell assess-error">
        <span class="assess-mode-badge">ASSESS</span>
        <h1>Không mở được bài Assess</h1>
        <p>${esc(error?.message ?? 'Hãy tải lại trang hoặc xin giáo viên gửi lại link.')}</p>
        <button class="primary-btn" type="button" data-reload>Thử lại</button>
      </section>
    </main>`;
  root.querySelector('[data-reload]')?.addEventListener('click', () => window.location.reload());
}

function assessError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}
