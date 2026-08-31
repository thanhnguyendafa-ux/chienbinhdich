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

Assess implementation must not regress any existing Mastery session, including supported historical session schemas.

## 7. Assess student contract

An Assess learner must be blind to scoring and answer feedback during and after the attempt.

During Assess the learner may receive lesson/prompt/input controls, neutral sequence progress, neutral acknowledgement, and navigation. The learner must not receive correct/incorrect state, expected answer, answer reveal, Mastery progress, pass/fail, retry/correction, theory hints, or a score/report.

After submission:

```text
ĐÃ NỘP BÀI
Câu trả lời đã được ghi nhận và gửi cho giáo viên.
Điểm và đáp án không hiển thị trong chế độ Assess.
```

## 8. Assess scoring contract

Assess scoring has one owner and is derived by the authorized teacher/admin path from canonical lesson evaluators plus the raw Attempt log.

Version 1 rules:

- objectively gradable accuracy items contribute to `correct` or `incorrect`;
- unanswered assessable items count as incorrect for percentage calculation at final submission;
- completion-only/open/personal-writing/pronunciation work is not silently converted into objective correctness;
- unscored items do not enter the Assess percentage denominator;
- no negative points;
- no retry-generated score changes because Assess has no correction/retry loop;
- percentage is `correct / assessableTotal * 100`, with deterministic rounding owned by the Assess scoring policy;
- an Assess delivery with zero assessable items is invalid and must be rejected before it is issued to students.

## 9. Learner-safe delivery boundary

Production Assess must not rely on UI-only hiding.

The Assess assignment owns one immutable learner projection named `sanitizedLesson`, produced from the effective canonical lesson at issue time. The projection contains only the prompt/input data needed to answer and excludes recoverable answer-key fields.

Production flow:

1. authenticated Admin resolves the effective lesson and validates Assess eligibility;
2. the pure Assess delivery builder creates an immutable `sanitizedLesson` snapshot and rejects answer-key fields or oversized snapshots;
3. Firestore Rules authorize only Admin creation of the assignment and make delivery/snapshot fields immutable;
4. student reads that assignment and uses only `sanitizedLesson` for the Assess interaction;
5. student persists raw neutral attempts directly under the owned session; attempts contain response/timing/input metadata but no correctness, expected answer, Mastery delta, or score;
6. Firestore Rules bind an Assess session to its assignment snapshot and bind each attempt to the corresponding sanitized item id;
7. authorized Admin reconstructs the canonical historical lesson and derives correctness/score from the Attempt log using the single Assess summary owner.

There is no production Assess grading/issue server API and no privileged Vercel identity. GitHub/Vercel therefore do not need a copied service-account key, WIF bootstrap, or a second storage/scoring path.

**Threat-model note:** the repository and the existing Mastery client corpus are public/client-delivered, so this ADR does not claim cryptographic secrecy against a determined person who independently inspects public source. The enforceable product contract is that the Assess delivery/assignment payload, raw attempt records, learner UI, and learner result flow do not expose correctness or answer-key material.

Forbidden shortcuts:

- shipping full answers inside `sanitizedLesson` and hiding them with CSS/JavaScript;
- grading in the student Assess app;
- persisting correctness/score alongside raw attempts;
- introducing a second database or secret server path only for Assess.

## 10. Module boundaries — no god components

Assess remains a delivery domain rather than mode branches inside Mastery components.

Ownership:

```text
src/core/deliveryMode.js
  delivery mode / contract

src/core/assessPayload.js
  answer-key-free learner projection

src/core/assessDelivery.js
  pure delivery snapshot law + size/safety validation

src/core/assessScoringPolicy.js
  Assess scoring law

src/core/assessSummary.js
  canonical teacher result derivation from raw attempts

src/core/assessResponse.js
  neutral student response display only

src/repositories/assessDeliveryRepository.js
  Admin-authorized effective-lesson reads + assignment persistence

src/repositories/assessAttemptRepository.js
  owned raw-attempt persistence only

src/features/assess/*
  learner flow/rendering
```

Architecture tests must reject: Assess renderers importing Mastery engines/retry/theory, student code importing `deriveAssessSummary`/`evaluateQuestion`, Admin UI inventing score formulas, lesson settings owning delivery mode, or repositories storing derived score/correctness.

## 11. Admin/teacher contract

Teacher/admin results must make mode explicit and derive from the same canonical Assess summary. Teacher detail may show correct/incorrect/unanswered, percentage, duration, student response, and canonical expected answer.

Baseline/retest labels are derived analytics and never replace raw session/attempt truth.

## 12. Persistence and migration

New Assess sessions snapshot `deliveryModeAtStart`, `deliveryContractVersionAtStart`, content revision, set/version, threshold/tolerance semantics and assignment id.

Historical Mastery/session compatibility remains centralized. Firestore rules, repository schema, and runtime schema version must move together. Runtime must never write a schema production Rules reject.

## 13. Required tests

At minimum:

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

Tests must prove peer modes, immutable session snapshot, zero retry/qualification semantics in Assess, deterministic summary from Attempt log, learner snapshot answer-key filtering, raw neutral attempts, teacher-only result derivation, historical Mastery compatibility, and no god-component dependency regression.

## 14. End-to-end acceptance scenario

Production acceptance requires one full real-flow proof:

1. Admin creates an Assess delivery from an objectively assessable lesson.
2. Persisted assignment contains a non-empty `sanitizedLesson` and no forbidden answer-key field.
3. The same source lesson remains usable concurrently in Mastery.
4. New learner opens Assess and starts a session stamped `deliveryModeAtStart = assess`.
5. Learner answers Q1 incorrectly and receives no incorrect marker, expected answer, score, retry, theory or Mastery semantics.
6. Learner completes remaining questions and sees only the neutral receipt.
7. Reload does not expose score or answers.
8. Firestore Attempt log contains one raw neutral attempt per assessable item and no correctness/expected-answer field.
9. Admin results derive the expected score/correct-total from the canonical lesson + persisted Attempt log.
10. Admin detail shows Q1 as incorrect and displays expected answer to the authorized teacher.
11. Reloading Admin yields the same derived result.
12. Concurrent Mastery remains unchanged.

## 15. Production gates

| Gate | PASS condition |
| --- | --- |
| SSOT | one Assess scoring implementation |
| Mode SSOT | trusted assignment mode + immutable session snapshot |
| No split brain | same lesson runs Mastery and Assess concurrently |
| Attempt SSOT | result reproducible from raw attempts |
| Blind student | no score/correctness/answer/hint/retry in Assess UI/result |
| Learner-safe payload | persisted `sanitizedLesson` has no forbidden answer-key fields |
| Raw persistence | Assess attempts contain no correctness/expected answer/score |
| Teacher visibility | authorized Admin derives summary and item detail |
| Historical compatibility | supported old sessions remain valid |
| No god component | architecture tests pass |
| No schema drift | runtime/repository/Rules align |
| Regression | all pre-existing CI tests pass |
| PR browser E2E | branch code + real Firebase Admin→Assess→Admin flow passes without production deploy |
| Main Rules deploy | `firestore.rules` workflow succeeds from merged `main` |
| Production provenance | Vercel Production Git SHA equals merged GitHub `main` SHA |
| Production browser E2E | same acceptance scenario passes on Production URL |

No gate may be waived as a follow-up.

## 16. Explicit technical-debt prohibitions

Not acceptable:

1. `?mode=assess` as student-controlled authority.
2. global `lessonSettings.deliveryMode`.
3. duplicated Mastery/Assess content sets.
4. copied score formulas.
5. mutable derived score beside Attempt log.
6. answers hidden only by CSS while included in Assess learner snapshot.
7. one giant Mastery/Assess renderer/controller.
8. persistence/scoring/rendering/routing in one component.
9. schema/rules mismatch.
10. temporary WIF/service-account/server workaround for Assess when the Firebase Rules path can own persistence safely.
11. manual Vercel deployment or Preview promotion as normal release procedure.

## 17. Release workflow — GitHub `main` is the only production trigger

Normal release is:

```text
feature branch
  -> PR
  -> canonical CI + PR Assess browser E2E PASS
  -> merge main
  -> GitHub main is production SSOT
       -> Vercel Git Integration auto-deploys that exact main SHA
       -> Firestore Rules GitHub Action deploys rules when changed
  -> verify main CI + Rules workflow
  -> verify Vercel Production READY and Git SHA == main SHA
  -> Production Assess browser E2E
  -> Production acceptance evidence
```

Rules:

- no `vercel deploy` in the release workflow;
- no manual Preview promotion;
- no alternate production branch;
- no per-release IAM/WIF bootstrap;
- Firestore Rules are deployed from GitHub Actions on `main` when `firestore.rules` changes;
- rollback is a Git revert on `main`, which Vercel then deploys through the same Git integration.

## 18. Definition of Done

```text
[ ] ADR accepted
[ ] Mastery/Assess peer modes implemented
[ ] trusted delivery-mode resolution implemented
[ ] immutable session delivery snapshot implemented
[ ] immutable answer-key-free sanitizedLesson delivery snapshot implemented
[ ] raw neutral Attempt persistence implemented
[ ] one Assess scoring owner implemented
[ ] canonical teacher summary derives from Attempt log
[ ] student has no feedback/retry/score leak
[ ] neutral receipt implemented
[ ] teacher list/detail implemented
[ ] concurrent Mastery/Assess works
[ ] historical Mastery sessions compatible
[ ] Firestore/runtime schema aligned
[ ] no privileged Vercel Assess server/WIF dependency
[ ] SSOT/god-component/security tests pass
[ ] all regression tests pass
[ ] PR real-Firebase browser E2E passes
[ ] merged main CI passes
[ ] Firestore Rules main workflow passes
[ ] Vercel Production SHA == GitHub main SHA
[ ] Production browser E2E passes
[ ] production acceptance evidence recorded
```

Until every checkbox is satisfied, Assess must not be represented as Production Accepted.

## 19. Final production invariant

```text
one lesson corpus
+ one trusted Assess learner projection per delivery
+ one trusted delivery mode per session
+ one canonical raw attempt history
+ one scoring owner per mode
+ mode-specific presentation
+ GitHub main as the only production source
= Mastery and Assess without split brain
```

Assess measures what the learner can do independently. Mastery helps the learner improve. They share canonical lesson content and neutral primitives, but they do not share conflicting business rules or learner-feedback behavior.
