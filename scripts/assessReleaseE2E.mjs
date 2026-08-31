import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, normalize, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { cert, deleteApp, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { assessableItems } from '../src/core/assessScoringPolicy.js';
import { parseLegacyAssignmentToken } from '../src/core/lessonLinks.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ARTIFACT_DIR = join(ROOT, 'artifacts', 'assess-release-e2e');
const PROJECT_ID = 'chienbinhdich';
const SET_ID = 'g7-u1-translation-01';
const PORT = 4173;
const EXTERNAL_ORIGIN = String(process.env.ASSESS_E2E_ORIGIN ?? '').trim().replace(/\/$/, '');
const ORIGIN = EXTERNAL_ORIGIN || `http://127.0.0.1:${PORT}`;
const FORBIDDEN_PAYLOAD_KEYS = new Set([
  'en', 'acceptedAnswers', 'correctChoiceId', 'answer', 'correctOrder', 'acceptedOrders',
  'correctGroupId', 'expectedAnswer', 'answerKey', 'sampleAnswer', 'modelAnswer',
  'teachingFeedback', 'theorySupport', 'preLessonTheory', 'explanation'
]);

await mkdir(ARTIFACT_DIR, { recursive: true });
const rawCredential = process.env.FIREBASE_SERVICE_ACCOUNT_CHIENBINHDICH;
assert.ok(rawCredential, 'FIREBASE_SERVICE_ACCOUNT_CHIENBINHDICH is required.');
const credential = JSON.parse(rawCredential);
const adminApp = initializeApp({ credential: cert(credential), projectId: PROJECT_ID }, `assess-release-e2e-${Date.now()}`);
const db = getFirestore(adminApp);
const firebaseAuth = getAuth(adminApp);
const server = EXTERNAL_ORIGIN ? null : createStaticServer();
const browser = await chromium.launch({ headless: true });

let issuedCode = null;
let assessSessionId = null;
let masterySessionId = null;
let assessOwnerUid = null;
let masteryOwnerUid = null;

try {
  if (server) await listen(server, PORT);

  const adminSnapshot = await db.collection('admins').limit(1).get();
  assert.equal(adminSnapshot.empty, false, 'No Firebase Admin marker exists for release E2E.');
  const adminUid = adminSnapshot.docs[0].id;
  const adminCustomToken = await firebaseAuth.createCustomToken(adminUid);

  const fullLesson = await loadLessonSet(SET_ID);
  const assessItems = assessableItems(fullLesson);
  assert.ok(assessItems.length > 1, 'Release E2E lesson must contain multiple assessable items.');
  assert.ok(assessItems.every(item => item.type === 'mcq'), 'Release E2E fixture expects an all-MCQ lesson.');
  assert.ok(fullLesson.lessonSlug, 'Release E2E lesson must expose a fixed Mastery slug.');

  const stamp = `${Date.now()}-${process.env.GITHUB_RUN_ID ?? 'local'}`;
  const assessStudent = `E2E Assess ${stamp}`;
  const masteryStudent = `E2E Mastery ${stamp}`;

  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const adminPage = await adminContext.newPage();
  attachPageDiagnostics(adminPage, 'admin');
  await adminPage.goto(`${ORIGIN}/assess-admin`, { waitUntil: 'domcontentloaded' });
  await adminPage.waitForSelector('[data-admin-login]');
  await signInAdminWithCustomToken(adminPage, adminCustomToken);
  await adminPage.reload({ waitUntil: 'domcontentloaded' });
  await adminPage.waitForSelector('[data-issue-assess]');

  await adminPage.selectOption('[data-issue-assess] select[name="setId"]', SET_ID);
  await adminPage.click('[data-issue-assess] button[type="submit"]');
  await waitForIssuedOrError(adminPage);
  const issueError = await adminPage.locator('[data-issued-link] .assess-inline-error').textContent().catch(() => null);
  assert.equal(issueError, null, `Assess issue UI failed: ${issueError}`);
  const issuedUrl = String(await adminPage.locator('.assess-issued-card code').textContent()).trim();
  const parsed = parseLegacyAssignmentToken(new URL(issuedUrl).searchParams.get('assignment') ?? '');
  assert.ok(parsed, `Issued Assess URL is not parseable: ${issuedUrl}`);
  issuedCode = parsed.code;

  const assignmentSnapshot = await db.collection('assignments').doc(issuedCode).get();
  assert.equal(assignmentSnapshot.exists, true, 'Issued Assess assignment was not persisted.');
  const assignment = assignmentSnapshot.data();
  assert.equal(assignment.deliveryMode, 'assess');
  assert.ok(assignment.sanitizedLesson, 'Assess assignment is missing learner snapshot.');
  assert.equal(findForbiddenKey(assignment.sanitizedLesson), null, 'Assess learner snapshot contains answer-key material.');
  assert.equal(assignment.sanitizedLesson.itemCount, assessItems.length, 'Learner snapshot item count drifted from source.');
  assert.ok(Number(assignment.sanitizedLessonBytes) > 0 && Number(assignment.sanitizedLessonBytes) <= 819200);
  await adminPage.screenshot({ path: join(ARTIFACT_DIR, '01-admin-issued.png'), fullPage: true });

  const masteryContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const masteryPage = await masteryContext.newPage();
  attachPageDiagnostics(masteryPage, 'mastery');
  await masteryPage.goto(`${ORIGIN}/a/${fullLesson.lessonSlug}`, { waitUntil: 'domcontentloaded' });
  await masteryPage.waitForSelector('#name-form');
  assert.match(await masteryPage.locator('body').innerText(), /Mastery/i, 'Same lesson did not open with Mastery semantics.');
  await masteryPage.fill('#student-name', masteryStudent);
  await masteryPage.click('#name-form button[type="submit"]');
  await masteryPage.waitForSelector('.metrics-row');
  assert.match(await masteryPage.locator('.metrics-row').innerText(), /Mastery/i);
  assert.equal(await masteryPage.locator('.assess-progress').count(), 0);
  await masteryPage.screenshot({ path: join(ARTIFACT_DIR, '02-mastery-live.png'), fullPage: true });

  const studentContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const studentPage = await studentContext.newPage();
  attachPageDiagnostics(studentPage, 'assess-student');
  await studentPage.goto(issuedUrl, { waitUntil: 'domcontentloaded' });
  await studentPage.waitForSelector('[data-assess-entry]');
  assert.match(await studentPage.locator('body').innerText(), /không hiển thị đúng\/sai, đáp án hoặc điểm/i);
  assert.equal(await studentPage.locator('.metrics-row, .mastery-progress, .answer-reveal').count(), 0);
  await studentPage.fill('[data-assess-entry] input[name="studentName"]', assessStudent);
  await studentPage.click('[data-assess-entry] button[type="submit"]');
  await waitForAssessQuestion(studentPage, 1, assessItems.length);

  const first = assessItems[0];
  const wrongChoice = first.choices.find(choice => String(choice.id) !== String(first.correctChoiceId));
  assert.ok(wrongChoice, 'Could not select deterministic wrong Q1 choice.');
  await studentPage.click(`[data-choice-id="${cssEscape(String(wrongChoice.id))}"]`);
  await waitForAssessQuestion(studentPage, 2, assessItems.length);
  assert.equal(await studentPage.locator('.answer-reveal, .feedback-panel, .mastery-progress, .metrics-row').count(), 0,
    'Wrong Assess answer exposed learning/result UI.');
  await studentPage.screenshot({ path: join(ARTIFACT_DIR, '03-assess-q2-after-wrong.png'), fullPage: true });

  for (let index = 1; index < assessItems.length; index += 1) {
    const item = assessItems[index];
    await studentPage.click(`[data-choice-id="${cssEscape(String(item.correctChoiceId))}"]`);
    if (index < assessItems.length - 1) await waitForAssessQuestion(studentPage, index + 2, assessItems.length);
  }

  await studentPage.waitForSelector('.assess-receipt');
  const receiptText = await studentPage.locator('.assess-receipt').innerText();
  assert.match(receiptText, /ĐÃ NỘP BÀI/);
  assert.match(receiptText, /Điểm và đáp án không hiển thị trong chế độ Assess/);
  assert.equal(/\b\d+(?:[.,]\d+)?%\b/.test(receiptText), false, 'Student receipt leaked score percentage.');
  await studentPage.screenshot({ path: join(ARTIFACT_DIR, '04-assess-receipt.png'), fullPage: true });

  const storedSession = await studentPage.evaluate(() => {
    const key = Object.keys(localStorage).find(candidate => candidate.startsWith('cbd.assess.session.v1.'));
    return key ? JSON.parse(localStorage.getItem(key)) : null;
  });
  assert.ok(storedSession?.id, 'Assess session was not persisted locally.');
  assessSessionId = storedSession.id;

  await studentPage.reload({ waitUntil: 'domcontentloaded' });
  await studentPage.waitForSelector('.assess-receipt');
  const reopenedText = await studentPage.locator('.assess-receipt').innerText();
  assert.equal(/\b\d+(?:[.,]\d+)?%\b/.test(reopenedText), false, 'Reopened Assess leaked score.');
  assert.match(reopenedText, /Điểm và đáp án không hiển thị/);

  assert.equal(await masteryPage.locator('.metrics-row').count(), 1, 'Assess completion changed concurrent Mastery page.');
  assert.equal(await masteryPage.locator('.assess-progress').count(), 0, 'Assess completion changed Mastery delivery mode.');

  await adminPage.reload({ waitUntil: 'domcontentloaded' });
  await adminPage.waitForSelector('[data-refresh]');
  await adminPage.click('[data-refresh]');
  const resultRow = adminPage.locator('tbody tr').filter({ hasText: assessStudent });
  await resultRow.waitFor();
  const expectedCorrect = assessItems.length - 1;
  const expectedPercent = expectedCorrect / assessItems.length * 100;
  const formattedPercent = Number.isInteger(expectedPercent) ? `${expectedPercent}%` : `${expectedPercent.toFixed(2)}%`;
  const rowText = await resultRow.innerText();
  assert.match(rowText, /ASSESS/);
  assert.match(rowText, new RegExp(escapeRegExp(formattedPercent)));
  assert.match(rowText, new RegExp(`${expectedCorrect}/${assessItems.length}`));
  assert.match(rowText, /BASELINE/);
  await resultRow.locator('button[data-session-id]').click();
  await adminPage.waitForSelector('.assess-detail-head');
  const detailText = await adminPage.locator('[data-assess-detail]').innerText();
  const q1ExpectedText = first.choices.find(choice => String(choice.id) === String(first.correctChoiceId))?.text ?? '';
  assert.match(detailText, /SAI/);
  assert.ok(q1ExpectedText && detailText.includes(q1ExpectedText), 'Teacher detail did not show Q1 expected answer.');
  await adminPage.screenshot({ path: join(ARTIFACT_DIR, '05-admin-result.png'), fullPage: true });

  await adminPage.reload({ waitUntil: 'domcontentloaded' });
  await adminPage.waitForSelector('[data-refresh]');
  await adminPage.click('[data-refresh]');
  const persistedRow = adminPage.locator('tbody tr').filter({ hasText: assessStudent });
  await persistedRow.waitFor();
  const persistedText = await persistedRow.innerText();
  assert.match(persistedText, new RegExp(escapeRegExp(formattedPercent)));
  assert.match(persistedText, new RegExp(`${expectedCorrect}/${assessItems.length}`));

  const assessSessionRef = db.collection('sessions').doc(assessSessionId);
  const assessSessionSnapshot = await assessSessionRef.get();
  assert.equal(assessSessionSnapshot.exists, true, 'Assess session is missing from Firestore.');
  const assessSession = assessSessionSnapshot.data();
  assessOwnerUid = assessSession.ownerUid ?? null;
  assert.equal(assessSession.deliveryModeAtStart, 'assess');
  assert.equal(assessSession.status, 'submitted');
  const attemptSnapshot = await assessSessionRef.collection('attempts').orderBy('promptIndex').get();
  assert.equal(attemptSnapshot.size, assessItems.length, 'Persisted Assess attempt count is incorrect.');
  for (const attemptDocument of attemptSnapshot.docs) {
    const attempt = attemptDocument.data();
    assert.equal('correct' in attempt, false, `Attempt ${attemptDocument.id} persisted forbidden correctness.`);
    assert.equal('expectedAnswer' in attempt, false, `Attempt ${attemptDocument.id} persisted expected answer.`);
    assert.equal(attempt.deliveryMode, 'assess');
    assert.equal(attempt.attemptNumber, 1);
  }

  const masteryQuery = await db.collection('sessions').where('studentName', '==', masteryStudent).get();
  const masteryDocument = masteryQuery.docs.at(0);
  assert.ok(masteryDocument, 'Concurrent Mastery session was not persisted.');
  masterySessionId = masteryDocument.id;
  masteryOwnerUid = masteryDocument.data().ownerUid ?? null;
  assert.notEqual(masteryDocument.data().deliveryModeAtStart, 'assess');

  const evidence = {
    ok: true,
    origin: ORIGIN,
    gitSha: process.env.GITHUB_SHA ?? null,
    runId: process.env.GITHUB_RUN_ID ?? null,
    setId: SET_ID,
    assessableTotal: assessItems.length,
    expectedCorrect,
    expectedPercent: formattedPercent,
    q1IntentionalWrong: true,
    learnerAssignmentSnapshotAnswerKeyFree: true,
    studentWritesRawAttemptsDirectly: true,
    studentReceiptBlind: true,
    teacherCanonicalResultPersisted: true,
    concurrentMasteryAssess: true,
    firestoreAttemptsStoreCorrectness: false,
    createdAt: new Date().toISOString()
  };
  await writeFile(join(ARTIFACT_DIR, 'evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  console.log(`ASSESS_RELEASE_E2E_PASS ${JSON.stringify(evidence)}`);

  await studentContext.close();
  await masteryContext.close();
  await adminContext.close();
} finally {
  await browser.close().catch(() => {});
  if (server) await closeServer(server).catch(() => {});
  await cleanupFirestore().catch(error => console.error('E2E cleanup failed', error));
  await deleteApp(adminApp).catch(() => {});
}

async function cleanupFirestore() {
  if (issuedCode) await db.collection('assignments').doc(issuedCode).delete().catch(() => {});
  for (const sessionId of [assessSessionId, masterySessionId].filter(Boolean)) {
    const ref = db.collection('sessions').doc(sessionId);
    const attempts = await ref.collection('attempts').get().catch(() => null);
    if (attempts) {
      const batch = db.batch();
      for (const doc of attempts.docs) batch.delete(doc.ref);
      if (!attempts.empty) await batch.commit();
    }
    await ref.delete().catch(() => {});
  }
  for (const uid of [assessOwnerUid, masteryOwnerUid].filter(Boolean)) {
    await firebaseAuth.deleteUser(uid).catch(() => {});
  }
}

async function signInAdminWithCustomToken(page, customToken) {
  await page.evaluate(async token => {
    const [appSdk, authSdk] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js')
    ]);
    const app = appSdk.getApp('cbd-admin-chienbinhdich');
    await authSdk.signInWithCustomToken(authSdk.getAuth(app), token);
  }, customToken);
}

async function waitForIssuedOrError(page) {
  await page.waitForFunction(() => Boolean(document.querySelector('.assess-issued-card') || document.querySelector('[data-issued-link] .assess-inline-error')));
}

async function waitForAssessQuestion(page, number, total) {
  await page.waitForSelector('.assess-question-card');
  await page.waitForFunction(({ number, total }) => {
    const text = document.querySelector('.assess-progress')?.textContent ?? '';
    return text.includes(`${number}/${total}`);
  }, { number, total });
}

function findForbiddenKey(value, path = '') {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      const match = findForbiddenKey(value[i], `${path}[${i}]`);
      if (match) return match;
    }
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_PAYLOAD_KEYS.has(key)) return `${path}.${key}`;
    const match = findForbiddenKey(child, `${path}.${key}`);
    if (match) return match;
  }
  return null;
}

function attachPageDiagnostics(page, label) {
  page.on('console', message => {
    if (message.type() === 'error') console.error(`[${label}] console.error`, message.text());
  });
  page.on('pageerror', error => console.error(`[${label}] pageerror`, error));
}

function createStaticServer() {
  return createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`).pathname);
      let relative = pathname === '/assess' ? 'assess.html'
        : pathname === '/assess-admin' ? 'assess-admin.html'
          : pathname === '/' || pathname.startsWith('/a/') || pathname.startsWith('/s/') ? 'index.html'
            : pathname.replace(/^\/+/, '');
      relative = normalize(relative).replace(/^(\.\.(\/|\\|$))+/, '');
      const filePath = resolve(ROOT, relative);
      if (!filePath.startsWith(ROOT)) throw new Error('Invalid path');
      const body = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': mime(extname(filePath)), 'Cache-Control': 'no-store' });
      res.end(body);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    }
  });
}

function mime(extension) {
  return ({
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.wav': 'audio/wav'
  })[extension] ?? 'application/octet-stream';
}

function listen(serverInstance, port) {
  return new Promise((resolvePromise, reject) => {
    serverInstance.once('error', reject);
    serverInstance.listen(port, '127.0.0.1', resolvePromise);
  });
}

function closeServer(serverInstance) {
  return new Promise((resolvePromise, reject) => serverInstance.close(error => error ? reject(error) : resolvePromise()));
}

function cssEscape(value) {
  return String(value).replace(/["\\]/g, '\\$&');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
