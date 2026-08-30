import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { cert, deleteApp, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import lessonHandler from '../api/assess/lesson.js';
import gradeHandler from '../api/assess/grade.js';
import { assessableItems } from '../src/core/assessScoringPolicy.js';
import { parseLegacyAssignmentToken } from '../src/core/lessonLinks.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ARTIFACT_DIR = join(ROOT, 'artifacts', 'assess-release-e2e');
const PROJECT_ID = 'chienbinhdich';
const SET_ID = 'g7-u1-translation-01';
const PORT = 4173;
const ORIGIN = `http://127.0.0.1:${PORT}`;
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
const server = createAppServer();
const browser = await chromium.launch({ headless: true });

let issuedCode = null;
let assessSessionId = null;
let masterySessionId = null;
let assessOwnerUid = null;
let masteryOwnerUid = null;
let evidence = null;

try {
  await listen(server, PORT);

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
  await adminPage.goto(`${ORIGIN}/assess-admin`, { waitUntil: 'networkidle' });
  await adminPage.waitForSelector('[data-admin-login]');
  await signInAdminWithCustomToken(adminPage, adminCustomToken);
  await adminPage.reload({ waitUntil: 'networkidle' });
  await adminPage.waitForSelector('[data-issue-assess]');

  await adminPage.selectOption('[data-issue-assess] select[name="setId"]', SET_ID);
  await adminPage.click('[data-issue-assess] button[type="submit"]');
  const issuedLocator = adminPage.locator('.assess-issued-card code');
  await issuedLocator.waitFor();
  const issuedUrl = String(await issuedLocator.textContent()).trim();
  const parsed = parseLegacyAssignmentToken(new URL(issuedUrl).searchParams.get('assignment') ?? '');
  assert.ok(parsed, `Issued Assess URL is not parseable: ${issuedUrl}`);
  issuedCode = parsed.code;
  await adminPage.screenshot({ path: join(ARTIFACT_DIR, '01-admin-issued.png'), fullPage: true });

  const masteryContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const masteryPage = await masteryContext.newPage();
  attachPageDiagnostics(masteryPage, 'mastery');
  await masteryPage.goto(`${ORIGIN}/a/${fullLesson.lessonSlug}`, { waitUntil: 'networkidle' });
  await masteryPage.waitForSelector('#name-form');
  const masteryEntryText = await masteryPage.locator('body').innerText();
  assert.match(masteryEntryText, /Mastery/i, 'Same lesson did not open with Mastery semantics.');
  assert.equal(await masteryPage.locator('.assess-mode-badge').count(), 0, 'Mastery entry leaked Assess presentation.');
  await masteryPage.fill('#student-name', masteryStudent);
  await masteryPage.click('#name-form button[type="submit"]');
  await masteryPage.waitForSelector('.metrics-row');
  assert.match(await masteryPage.locator('.metrics-row').innerText(), /Mastery/i, 'Mastery drill did not retain its Mastery metrics.');
  assert.equal(await masteryPage.locator('.assess-progress').count(), 0, 'Mastery drill crossed into Assess UI.');
  await masteryPage.screenshot({ path: join(ARTIFACT_DIR, '02-mastery-live.png'), fullPage: true });

  const studentContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const studentPage = await studentContext.newPage();
  attachPageDiagnostics(studentPage, 'assess-student');
  const learnerPayloadPromise = studentPage.waitForResponse(response => response.url().includes('/api/assess/lesson?'));
  await studentPage.goto(issuedUrl, { waitUntil: 'networkidle' });
  const learnerPayloadResponse = await learnerPayloadPromise;
  assert.equal(learnerPayloadResponse.status(), 200, 'Assess learner payload endpoint did not return 200.');
  const learnerPayload = await learnerPayloadResponse.json();
  assert.equal(findForbiddenKey(learnerPayload), null, 'Learner payload contains a recoverable answer-key field.');
  assert.equal(learnerPayload.lesson.itemCount, assessItems.length, 'Sanitized lesson item count drifted from assessable source items.');

  await studentPage.waitForSelector('[data-assess-entry]');
  const entryText = await studentPage.locator('body').innerText();
  assert.match(entryText, /không hiển thị đúng\/sai, đáp án hoặc điểm/i, 'Assess entry does not state the blind contract.');
  await studentPage.fill('[data-assess-entry] input[name="studentName"]', assessStudent);
  await studentPage.click('[data-assess-entry] button[type="submit"]');
  await waitForAssessQuestion(studentPage, 1, assessItems.length);

  const first = assessItems[0];
  const wrongChoice = first.choices.find(choice => String(choice.id) !== String(first.correctChoiceId));
  assert.ok(wrongChoice, 'Could not choose a deterministic wrong answer for Q1.');
  const firstGradePromise = studentPage.waitForResponse(response => response.url().includes('/api/assess/grade'));
  await studentPage.click(`[data-choice-id="${cssEscape(String(wrongChoice.id))}"]`);
  const firstGradeResponse = await firstGradePromise;
  assert.equal(firstGradeResponse.status(), 200, 'Trusted grade endpoint did not accept Q1.');
  const firstAck = await firstGradeResponse.json();
  assert.equal(firstAck.ok, true, 'Trusted grade endpoint did not return a neutral acknowledgement.');
  assert.equal('correct' in firstAck, false, 'Grade acknowledgement leaked correctness.');
  assert.equal('expectedAnswer' in firstAck, false, 'Grade acknowledgement leaked expected answer.');
  await waitForAssessQuestion(studentPage, 2, assessItems.length);
  assert.equal(await studentPage.locator('.answer-reveal, .feedback-panel, .mastery-progress, .metrics-row').count(), 0,
    'Q1 wrong answer exposed learning/result UI instead of advancing neutrally.');
  await studentPage.screenshot({ path: join(ARTIFACT_DIR, '03-assess-q2-after-wrong.png'), fullPage: true });

  for (let index = 1; index < assessItems.length; index += 1) {
    const item = assessItems[index];
    const choiceId = String(item.correctChoiceId);
    const responsePromise = studentPage.waitForResponse(response => response.url().includes('/api/assess/grade'));
    await studentPage.click(`[data-choice-id="${cssEscape(choiceId)}"]`);
    const response = await responsePromise;
    assert.equal(response.status(), 200, `Trusted grade endpoint failed at Q${index + 1}.`);
    const acknowledgement = await response.json();
    assert.equal(acknowledgement.ok, true, `Trusted grade acknowledgement failed at Q${index + 1}.`);
    assert.equal('correct' in acknowledgement, false, `Q${index + 1} acknowledgement leaked correctness.`);
    if (index < assessItems.length - 1) await waitForAssessQuestion(studentPage, index + 2, assessItems.length);
  }

  await studentPage.waitForSelector('.assess-receipt');
  const receiptText = await studentPage.locator('.assess-receipt').innerText();
  assert.match(receiptText, /ĐÃ NỘP BÀI/);
  assert.match(receiptText, /Điểm và đáp án không hiển thị trong chế độ Assess/);
  assert.equal(/\b\d+(?:[.,]\d+)?%\b/.test(receiptText), false, 'Student receipt leaked a score percentage.');
  await studentPage.screenshot({ path: join(ARTIFACT_DIR, '04-assess-receipt.png'), fullPage: true });

  const storedSession = await studentPage.evaluate(() => {
    const key = Object.keys(localStorage).find(candidate => candidate.startsWith('cbd.assess.session.v1.'));
    return key ? JSON.parse(localStorage.getItem(key)) : null;
  });
  assert.ok(storedSession?.id, 'Assess session was not persisted locally.');
  assessSessionId = storedSession.id;

  await studentPage.reload({ waitUntil: 'networkidle' });
  await studentPage.waitForSelector('.assess-receipt');
  const reopenedText = await studentPage.locator('.assess-receipt').innerText();
  assert.equal(/\b\d+(?:[.,]\d+)?%\b/.test(reopenedText), false, 'Reopened Assess leaked score.');
  assert.match(reopenedText, /Điểm và đáp án không hiển thị/);

  assert.equal(await masteryPage.locator('.metrics-row').count(), 1, 'Assess completion changed the concurrent Mastery page.');
  assert.equal(await masteryPage.locator('.assess-progress').count(), 0, 'Assess completion changed Mastery delivery mode.');

  await adminPage.reload({ waitUntil: 'networkidle' });
  await adminPage.waitForSelector('.assess-results-panel');
  const resultRow = adminPage.locator('tbody tr').filter({ hasText: assessStudent });
  await resultRow.waitFor();
  const rowText = await resultRow.innerText();
  const expectedCorrect = assessItems.length - 1;
  const expectedPercent = expectedCorrect / assessItems.length * 100;
  const formattedPercent = Number.isInteger(expectedPercent) ? `${expectedPercent}%` : `${expectedPercent.toFixed(2)}%`;
  assert.match(rowText, /ASSESS/);
  assert.match(rowText, new RegExp(escapeRegExp(formattedPercent)));
  assert.match(rowText, new RegExp(`${expectedCorrect}/${assessItems.length}`));
  assert.match(rowText, /BASELINE/);
  await resultRow.locator('button[data-session-id]').click();
  await adminPage.waitForSelector('.assess-detail-head');
  const detailText = await adminPage.locator('[data-assess-detail]').innerText();
  const q1ExpectedText = first.choices.find(choice => String(choice.id) === String(first.correctChoiceId))?.text ?? '';
  assert.match(detailText, /ASSESS · BASELINE/);
  assert.match(detailText, new RegExp(escapeRegExp(formattedPercent)));
  assert.match(detailText, /SAI/);
  assert.ok(q1ExpectedText && detailText.includes(q1ExpectedText), 'Teacher detail did not show Q1 expected answer.');
  await adminPage.screenshot({ path: join(ARTIFACT_DIR, '05-admin-result.png'), fullPage: true });

  await adminPage.reload({ waitUntil: 'networkidle' });
  const persistedRow = adminPage.locator('tbody tr').filter({ hasText: assessStudent });
  await persistedRow.waitFor();
  const persistedText = await persistedRow.innerText();
  assert.match(persistedText, new RegExp(escapeRegExp(formattedPercent)), 'Reload changed canonical Assess percentage.');
  assert.match(persistedText, new RegExp(`${expectedCorrect}/${assessItems.length}`), 'Reload changed canonical correct/total.');

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
  assert.notEqual(masteryDocument.data().deliveryModeAtStart, 'assess', 'Mastery session was stamped as Assess.');

  evidence = {
    ok: true,
    gitSha: process.env.GITHUB_SHA ?? null,
    runId: process.env.GITHUB_RUN_ID ?? null,
    setId: SET_ID,
    assessableTotal: assessItems.length,
    expectedCorrect,
    expectedPercent: formattedPercent,
    q1IntentionalWrong: true,
    learnerPayloadAnswerKeyFree: true,
    gradeAcknowledgementNeutral: true,
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
  try {
    if (assessSessionId) await cleanupSession(db, assessSessionId);
    if (masterySessionId) await cleanupSession(db, masterySessionId);
    if (issuedCode) await db.collection('assignments').doc(issuedCode).delete().catch(() => {});
    if (assessOwnerUid) await firebaseAuth.deleteUser(assessOwnerUid).catch(() => {});
    if (masteryOwnerUid) await firebaseAuth.deleteUser(masteryOwnerUid).catch(() => {});
  } finally {
    await browser.close().catch(() => {});
    await closeServer(server).catch(() => {});
    await deleteApp(adminApp).catch(() => {});
  }
}

function createAppServer() {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', ORIGIN);
      if (url.pathname === '/api/assess/lesson') {
        req.query = Object.fromEntries(url.searchParams.entries());
        return lessonHandler(req, apiResponse(res));
      }
      if (url.pathname === '/api/assess/grade') {
        req.body = await readJsonBody(req);
        return gradeHandler(req, apiResponse(res));
      }

      let requestedPath = url.pathname;
      if (requestedPath === '/assess') requestedPath = '/assess.html';
      else if (requestedPath === '/assess-admin') requestedPath = '/assess-admin.html';
      else if (requestedPath === '/' || requestedPath.startsWith('/a/') || requestedPath === '/admin') requestedPath = '/index.html';

      const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
      const absolute = resolve(ROOT, `.${safePath}`);
      if (!absolute.startsWith(ROOT)) return sendText(res, 403, 'Forbidden');
      const body = await readFile(absolute);
      res.statusCode = 200;
      res.setHeader('Content-Type', mimeType(extname(absolute)));
      res.setHeader('Cache-Control', 'no-store');
      res.end(body);
    } catch (error) {
      if (error?.code === 'ENOENT') return sendText(res, 404, 'Not found');
      console.error('E2E server error', error);
      return sendText(res, 500, 'Internal server error');
    }
  });
}

function apiResponse(res) {
  let statusCode = 200;
  return {
    setHeader(name, value) { res.setHeader(name, value); },
    status(value) { statusCode = Number(value); return this; },
    json(payload) {
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(payload));
    }
  };
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function sendText(res, status, text) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(text);
}

function mimeType(extension) {
  return ({
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
  })[extension] ?? 'application/octet-stream';
}

async function signInAdminWithCustomToken(page, token) {
  await page.evaluate(async customToken => {
    const { firebaseConfig } = await import('/src/config/firebaseConfig.js');
    const version = '12.16.0';
    const [appSdk, authSdk] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`)
    ]);
    const appName = `cbd-admin-${firebaseConfig.project.projectId}`;
    const app = appSdk.getApps().find(candidate => candidate.name === appName)
      ?? appSdk.initializeApp(firebaseConfig.project, appName);
    await authSdk.signInWithCustomToken(authSdk.getAuth(app), customToken);
  }, token);
}

async function waitForAssessQuestion(page, number, total) {
  await page.waitForFunction(({ number, total }) => {
    const value = document.querySelector('.assess-progress strong')?.textContent ?? '';
    return value.includes(`Câu ${number} / ${total}`);
  }, { number, total });
}

function attachPageDiagnostics(page, label) {
  page.on('pageerror', error => console.error(`[${label}] pageerror`, error));
  page.on('console', message => {
    if (message.type() === 'error') console.error(`[${label}] console.error`, message.text());
  });
}

function findForbiddenKey(value, path = '$') {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const match = findForbiddenKey(value[index], `${path}[${index}]`);
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

async function cleanupSession(database, sessionId) {
  const ref = database.collection('sessions').doc(sessionId);
  const attempts = await ref.collection('attempts').get().catch(() => null);
  if (attempts) {
    const writer = database.bulkWriter();
    for (const document of attempts.docs) writer.delete(document.ref);
    await writer.close();
  }
  await ref.delete().catch(() => {});
}

function listen(target, port) {
  return new Promise((resolvePromise, rejectPromise) => {
    target.once('error', rejectPromise);
    target.listen(port, '127.0.0.1', () => {
      target.off('error', rejectPromise);
      resolvePromise();
    });
  });
}

function closeServer(target) {
  return new Promise((resolvePromise, rejectPromise) => {
    if (!target.listening) return resolvePromise();
    target.close(error => error ? rejectPromise(error) : resolvePromise());
  });
}

function cssEscape(value) {
  return value.replace(/(["\\])/g, '\\$1');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
