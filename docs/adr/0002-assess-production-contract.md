# ADR 0002 — Assess Production Contract

Status: Proposed for implementation; production acceptance requires every gate in this ADR to pass.

## 1. Decision summary

Chiến Binh Dịch has two peer delivery modes for the same lesson corpus:

- `mastery` — learning mode. The learner may receive correctness feedback, correction/retry flows, answer reveal where the Mastery contract allows it, theory support, Mastery progress, and qualification/pass behavior.
- `assess` — blind assessment mode. The learner completes the assigned questions without correctness feedback, answer reveal, hints/theory support, retry/correction loops, Mastery progress, pass/fail messaging, or a student-visible score.

The delivery mode is a separate domain concern from the existing assessment/scoring participation policy.

Canonical model:

```text
deliveryMode: "mastery" | "assess"
deliveryContractVersion: 1
```

A started session snapshots the delivery contract:

```text
deliveryModeAtStart: "mastery" | "assess"
deliveryContractVersionAtStart: 1
```

The same published lesson may be used concurrently in Mastery and Assess. No lesson content is duplicated to support the two modes.

## 2. Why this is a separate mode

`assessmentPolicy` already owns a different concern: whether a lesson item participates in objective scoring and whether it behaves as accuracy/completion/unscored work. It must not also own the learner delivery experience.

Therefore:

- `assessmentPolicy` answers: **what is gradable and how does the item participate in scoring?**
- `deliveryMode` answers: **is this session a learning experience or a blind assessment experience?**

These concepts must never be merged.

## 3. Production use case

Assess is designed for cold-baseline and independent-check scenarios, including:

- pre-unit baseline before instruction;
- no-preparation diagnostic assessment;
- post-instruction independent check;
- pre/post comparison around Mastery practice;
- teacher grouping and intervention decisions based on independent performance.

The canonical learning loop is:

```text
ASSESS (baseline) -> MASTERY (learn/practice) -> ASSESS (independent check)
```

A Mastery result and an Assess result are intentionally not the same measurement. Mastery measures progress inside a supported learning loop; Assess measures independent performance without learner-facing correction support.

## 4. Non-negotiable SSOT boundaries

One production concern has one authoritative owner.

| Concern | Authoritative owner |
| --- | --- |
| Published lesson metadata | published lesson catalog |
| Question content | lesson content |
| Question correctness/completion | question evaluators |
| Item scored/unscored participation | `assessmentPolicy` |
| Session delivery mode | delivery-mode domain + immutable session snapshot |
| Mastery scoring law | Mastery scoring policy |
| Assess scoring law | Assess scoring policy |
| What the learner actually submitted | Attempt log |
| Derived Assess result | Assess summary derived from Attempt log |
| Derived Mastery result | Mastery engine replayed from Attempt log |
| Student Assess presentation | Assess renderer/controller |
| Teacher Assess result presentation | Admin Assess result renderer |
| Production source provenance | GitHub `main` SHA matched by Vercel Production SHA |

### 4.1 Attempt log remains the result SSOT

Assess must not introduce an authoritative mutable `score`, `percent`, `correctCount`, `wrongCount`, or per-item state alongside the Attempt log.

The canonical result is derived:

```text
deriveAssessSummary(attempts, set)
  -> correct
  -> incorrect
  -> unanswered
  -> assessableTotal
  -> percent
```

A persisted projection/cache may be added only for read performance. If one exists:

- it is explicitly non-authoritative;
- it is reproducible from the Attempt log;
- it may be deleted and rebuilt without changing the result;
- tests must fail if projection output disagrees with canonical derivation.

## 5. Delivery mode ownership

`deliveryMode` must not be stored as a lesson-wide override in `lessonSettings`.

Reason: a single lesson must be usable at the same time as Mastery for one learner/group and Assess for another. A lesson-global mode would create hidden coupling and split-brain behavior.

The mode belongs to the access/assignment/session-delivery context.

Requirements:

1. The teacher/admin explicitly creates or selects a Mastery or Assess delivery.
2. Student access resolves the authoritative delivery mode from trusted delivery data.
3. The client may not make an Assess session become Mastery, or Mastery become Assess, by editing a query parameter, local storage value, DOM attribute, or arbitrary client field.
4. `createSession` snapshots the resolved mode and delivery contract version.
5. A running session never changes mode because an admin later changes an assignment/link configuration.

## 6. Mastery contract

Mastery remains the supported learning flow and preserves its existing behavior unless a separate ADR changes that contract.

Typical Mastery capabilities include:

- learner-visible correctness feedback;
- correction/retry behavior;
- answer reveal where permitted by the Mastery contract;
- theory/support guidance;
- Mastery gain/loss/neutral feedback;
- qualification/pass threshold behavior;
- extended practice;
- learner report/progress presentation.

Assess implementation must not regress any existing Mastery session, including supported historical session schemas.

## 7. Assess student contract

An Assess learner must be blind to scoring and answer feedback during and after the attempt.

### 7.1 Allowed learner-facing information

During Assess:

- lesson title/context;
- question/prompt;
- the input controls required to answer;
- neutral sequence progress such as `4/20` if desired;
- neutral acknowledgement that a response was recorded;
- navigation controls required by the test contract;
- submit/finish controls.

After submission:

```text
ĐÃ NỘP BÀI
Câu trả lời đã được ghi nhận và gửi cho giáo viên.
Điểm và đáp án không hiển thị trong chế độ Assess.
```

### 7.2 Forbidden learner-facing information

Assess must not expose:

- correct/incorrect state;
- expected answer;
- answer reveal;
- Mastery units or Mastery percentage;
- pass/fail or pass threshold;
- correction prompts;
- retry scheduling;
- theory hints/support triggered by correctness;
- per-error typing diagnostics that reveal correctness;
- a student result report containing score, correct/wrong counts, answer key, or item correctness;
- an indirect result channel that allows the learner to infer the answer key from response metadata.

An implementation that merely hides visible HTML while keeping the learner-facing response payload rich with correctness/expected-answer data does not satisfy the production contract.

## 8. Assess scoring contract

Assess scoring has one owner and is derived from canonical evaluator results recorded through the attempt flow.

Version 1 rules:

- objectively gradable accuracy items contribute to `correct` or `incorrect`;
- unanswered assessable items count as incorrect for percentage calculation at final submission;
- completion-only/open/personal-writing/pronunciation work is not silently converted into objective correctness;
- unscored items do not enter the Assess percentage denominator;
- no negative points;
- no retry-generated score changes because Assess has no correction/retry loop;
- percentage is `correct / assessableTotal * 100`, with deterministic rounding owned by the Assess scoring policy;
- an Assess delivery with zero assessable items is invalid and must be rejected before it is issued to students.

If the scoring law changes later, increment `deliveryContractVersion` or an explicitly named Assess scoring contract version and preserve compatibility at one centralized boundary. Do not keep two competing current implementations.

## 9. Secure answer-key boundary

Production Assess must not rely on UI-only secrecy.

For Assess delivery, the learner must not receive a payload that contains a recoverable answer key or expected answer for questions whose answers are meant to remain secret.

Therefore production Assess requires a trusted grading boundary:

1. student receives a sanitized Assess question payload;
2. answer-key fields are excluded from learner-readable lesson payloads;
3. submitted response is graded by trusted server-side/backend code or another access-controlled grading boundary;
4. the backend persists the canonical attempt/evaluation record;
5. student receives only a neutral acknowledgement/continuation response;
6. admin/teacher may retrieve the complete result and expected-answer detail through authorized admin access.

**Forbidden production shortcut:** shipping the full answer key to the browser and only hiding it with CSS/JavaScript.

If a question type cannot be securely graded under this boundary, it must not be enabled for production Assess until that question type has a safe grading path.

## 10. Module boundaries — no god components

Assess must be implemented as a delivery domain, not as dozens of `if (assess)` branches inside existing Mastery components.

Recommended ownership:

```text
src/core/deliveryMode.js
  validate/resolve delivery mode and contract version

src/core/assessScoringPolicy.js
  Assess scoring law only

src/core/assessSummary.js
  derive teacher-facing Assess summary from attempts

src/features/assess/assessSessionController.js
  Assess flow orchestration

src/features/assess/renderAssess.js
  learner Assess UI

src/features/assess/renderAssessReceipt.js
  learner post-submit neutral receipt

src/features/admin/results/renderAssessSessionDetail.js
  teacher Assess detail UI
```

Shared primitives may be reused when they are genuinely mode-neutral, for example:

- question prompt/input rendering;
- question evaluator interface;
- persistence primitives;
- formatters;
- safe layout components.

### 10.1 Forbidden dependency directions

CI architecture tests must reject at least these regressions:

- Assess renderer importing Mastery engine/progress;
- Assess renderer importing theory-support or retry scheduling;
- Assess scoring importing DOM/rendering code;
- admin result renderer inventing a second score formula;
- `app.js` implementing Assess scoring;
- `renderDrill.js` becoming the owner of both full Mastery and full Assess behavior;
- `lessonSettings` becoming an alternate delivery-mode SSOT;
- repository code deciding correctness or score;
- CSS/DOM/localStorage becoming a mode authority.

### 10.2 Orchestration rule

The application shell may select the correct mode-specific controller at one composition boundary, but mode-specific behavior remains inside its domain.

Conceptually:

```text
controller = sessionControllerFor(session.deliveryModeAtStart)
controller.start()
controller.submit()
controller.finish()
```

The shell routes and composes. It does not own Assess or Mastery business rules.

## 11. Admin/teacher contract

Teacher/admin results must make the mode explicit.

Recommended list projection:

| Học sinh | Mode | Bài | Điểm | Đúng/Tổng | Thời gian | Lần | Cập nhật |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| An | Assess | Unit 1 | 42% | 8/19 | 06:41 | Baseline | ... |

Assess detail must provide the authorized teacher with:

- student identity/display name available to the application;
- `ASSESS` mode label;
- baseline/retest classification where the product supports it;
- correct/incorrect/unanswered/assessable total;
- percentage;
- duration;
- submission timestamp;
- integrity diagnostics already supported by the app where appropriate;
- question-by-question submitted response;
- canonical expected answer for teacher review;
- item correctness/evaluation result.

The admin UI consumes the same canonical Assess summary; it must not maintain a second scoring formula.

## 12. Baseline and retest semantics

Where the same learner has multiple completed Assess sessions for the same delivery target:

- first qualifying independent Assess may be labeled `BASELINE`;
- later qualifying Assess may be labeled `RETEST`;
- these labels are derived from session history and do not change the raw result.

A future learning-gain view may compare:

```text
postAssessPercent - baselineAssessPercent
```

Learning gain is a derived analytics value, never a replacement for either source result.

## 13. Persistence and migration

### 13.1 New sessions

New session schema must include immutable-at-start delivery fields.

Example:

```text
deliveryModeAtStart
deliveryContractVersionAtStart
```

### 13.2 Historical sessions

Historical sessions remain readable/resumable according to the currently supported compatibility policy.

If historical sessions predate delivery mode:

- one centralized compatibility resolver maps them to their historical Mastery behavior;
- compatibility logic must not leak into every renderer/repository;
- compatibility code is explicitly marked as migration compatibility, not a second current implementation.

### 13.3 Firestore/security schema

Firestore rules, repository validation, and session schema version must be updated together. CI must detect mismatches between runtime session schema and rules validation.

No deployment may ship with the runtime writing a schema version that production Firestore rules reject.

## 14. Required tests

At minimum add:

```text
deliveryMode.test.js
assessScoringPolicy.test.js
assessSummary.test.js
assessSessionFlow.test.js
assessStudentUi.test.js
assessSecurityBoundary.test.js
adminAssessResults.test.js
assessPersistence.test.js
assessSsotArchitecture.test.js
assessMasteryRegression.test.js
```

### 14.1 Contract tests

Must prove:

- Mastery and Assess are peer modes;
- one lesson can be delivered in both modes concurrently;
- session mode snapshot is immutable after start;
- modifying delivery configuration does not mutate a running session;
- Assess does not invoke retry/correction behavior;
- Assess does not apply Mastery pass-threshold qualification;
- Assess score is deterministic from the Attempt log;
- unanswered final items are handled according to the Assess contract;
- zero-assessable-item delivery is rejected;
- historical Mastery sessions still behave under their historical contract.

### 14.2 Blind-UI tests

Automated tests must assert the absence of learner-visible or learner-retrievable:

- `Mastery` result/progress semantics in Assess;
- `PASS`/`FAIL` semantics;
- expected answer;
- correctness feedback;
- retry/correction controls;
- theory support based on correctness;
- final score/report.

Testing only the visible text is insufficient for the secure boundary. Network/data payload tests must also prove that answer-key material is not sent to the learner in production Assess.

### 14.3 Architecture tests

Tests must fail CI if ownership boundaries regress into a god component or duplicate source of truth.

Examples:

```text
renderAssess -> must not import masteryEngine
renderAssess -> must not import retryScheduler
renderAssess -> must not import theorySupport
app.js -> must not calculate Assess score
renderResultsView -> must not implement independent Assess scoring
lessonSettings -> must not own deliveryMode
session record -> must not treat derived score as authoritative state
```

## 15. End-to-end acceptance scenario

Production acceptance requires one full real-flow proof.

### 15.1 Admin issue

1. Admin selects an objectively assessable lesson.
2. Admin creates/chooses an `Assess` delivery.
3. System validates at least one assessable item.
4. System produces authorized student access carrying trusted delivery context.

### 15.2 Student execution

1. New learner opens Assess access.
2. Session records `deliveryModeAtStart = assess`.
3. Learner answers question 1 incorrectly.
4. Learner sees no incorrect indicator and no answer.
5. Learner proceeds without retry/correction.
6. Learner completes remaining questions.
7. Learner submits.
8. Learner sees only the neutral submitted receipt.
9. Refresh/reopen does not expose score or answer key.

### 15.3 Teacher result

1. Admin results list shows Mode = Assess.
2. Admin sees the canonical derived percentage and correct/total.
3. Admin opens the detail view.
4. Question 1 shows learner response, incorrect evaluation, and expected answer to the authorized teacher.
5. Reloading the admin result returns the same canonical derivation from persisted attempts.

### 15.4 Concurrent mode proof

Using the same lesson at the same time:

- Student A opens Mastery.
- Student B opens Assess.
- A receives normal Mastery learning behavior.
- B remains completely blind to correctness, answer key, and score.
- changing or completing A does not alter B's mode or result;
- changing or completing B does not alter A's mode or result.

Any cross-mode interference is a production failure.

## 16. Production gates

All gates are mandatory.

| Gate | PASS condition |
| --- | --- |
| SSOT | exactly one Assess scoring implementation |
| Mode SSOT | exactly one trusted delivery-mode resolution path + immutable session snapshot |
| No split brain | same lesson can run concurrently in both modes without cross-mode effects |
| Attempt SSOT | canonical Assess result is reproducible from attempts |
| Blind student | no score/correctness/answer/hint/retry leakage in UI or learner payload |
| Secure key | production Assess learner cannot read the answer key from downloaded data |
| No Mastery semantics | Assess has no Mastery progress, qualification threshold, retry or correction loop |
| Teacher visibility | authorized admin sees summary + question-level result |
| Historical compatibility | supported old sessions remain valid |
| No god component | architecture dependency tests pass |
| No schema drift | runtime/repository/rules agree on session schema |
| Regression | all pre-existing CI tests pass |
| New tests | all Assess domain/security/architecture tests pass |
| Browser E2E | admin -> student Assess -> admin result flow passes on production-like deployment |
| Production provenance | Vercel Production Git SHA exactly equals merged GitHub `main` SHA |

No gate may be waived as "follow-up" for production Assess.

## 17. Explicit technical-debt prohibitions

The following are not acceptable production implementations:

1. `?mode=assess` as the sole authority controlled by the student browser.
2. a global `lessonSettings.deliveryMode` that changes every learner using the lesson.
3. duplicating a lesson into `lesson-master.md` / `lesson-assess.md` or separate content sets solely for mode behavior.
4. copy/pasting the score formula into admin UI and student/session code.
5. storing mutable score state as a competing truth beside attempts.
6. hiding the answer with CSS while sending it to the learner browser.
7. reusing the full Mastery drill and sprinkling mode conditionals throughout it.
8. putting networking, persistence, scoring, rendering, routing, and grading into one new Assess component.
9. leaving schema/rules mismatch to be fixed after deployment.
10. shipping a temporary Assess path and promising to secure/refactor it later.

If implementation requires one of these shortcuts, Assess remains non-production.

## 18. Release workflow

Implementation follows this order:

1. land/update this ADR;
2. add delivery-mode domain and schema contracts;
3. add secure Assess grading boundary and sanitized learner payload;
4. add Assess scoring/summary domain;
5. add Assess session controller;
6. add learner Assess renderer + neutral receipt;
7. add admin list/detail support;
8. update persistence and Firestore rules together;
9. add architecture/security/domain tests;
10. run complete existing CI + new Assess tests;
11. deploy preview;
12. execute browser E2E acceptance scenario;
13. verify answer-key non-exposure from learner network/data payloads;
14. verify concurrent Mastery/Assess behavior on the same lesson;
15. merge only after all PR checks pass;
16. deploy Production from merged `main`;
17. verify Vercel Production Git SHA equals GitHub `main` SHA;
18. repeat smoke E2E on Production;
19. record production acceptance evidence.

## 19. Definition of Done

Assess is **Production Accepted** only when all of the following are true:

```text
[ ] ADR accepted
[ ] Mastery/Assess modeled as peer delivery modes
[ ] authoritative delivery-mode resolution implemented
[ ] immutable session delivery snapshot implemented
[ ] answer-key-safe Assess payload implemented
[ ] trusted Assess grading boundary implemented
[ ] one Assess scoring owner implemented
[ ] canonical summary derives from Attempt log
[ ] Assess learner flow has no feedback/retry/score leak
[ ] neutral learner receipt implemented
[ ] teacher list and detail implemented
[ ] same lesson works concurrently in Mastery and Assess
[ ] historical Mastery sessions remain compatible
[ ] Firestore/runtime schema contract aligned
[ ] SSOT/god-component architecture tests pass
[ ] security tests pass
[ ] all existing regression tests pass
[ ] preview browser E2E passes
[ ] merged main CI passes
[ ] Production SHA == GitHub main SHA
[ ] Production smoke E2E passes
[ ] production acceptance evidence recorded
```

Until every checkbox is satisfied, the feature may be in development or preview, but it must not be represented as production-ready Assess.

## 20. Final production invariant

The invariant for Chiến Binh Dịch is:

```text
one lesson corpus
+ one trusted delivery mode per session
+ one canonical attempt history
+ one scoring owner per mode
+ mode-specific presentation
= Mastery and Assess without split brain
```

Assess measures what the learner can do independently. Mastery helps the learner improve. They share the lesson and neutral primitives, but they do not share conflicting business rules or learner-feedback behavior.
