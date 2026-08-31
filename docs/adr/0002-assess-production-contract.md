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

Assess is designed for cold-baseline and independent-check scenarios, including pre-unit baseline, no-preparation diagnostic assessment, post-instruction independent check, pre/post comparison around Mastery practice, and teacher grouping/intervention decisions.

The canonical learning loop is:

```text
ASSESS (baseline) -> MASTERY (learn/practice) -> ASSESS (independent check)
```

A Mastery result and an Assess result are intentionally not the same measurement.

## 4. Non-negotiable SSOT boundaries

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
| Student Assess presentation | Assess renderer/controller |
| Teacher Assess result presentation | Admin Assess result renderer |
| Production source provenance | GitHub `main` SHA matched by Vercel Production SHA |

Assess must not introduce an authoritative mutable score beside the Attempt log. The canonical result is `deriveAssessSummary(attempts, set)`.

## 5. Delivery mode ownership

`deliveryMode` must not be stored as a lesson-wide override in `lessonSettings`. The mode belongs to the access/assignment/session-delivery context. Student-controlled URL/query/localStorage/DOM values are never authority. Started sessions snapshot mode/version and never switch because an assignment later changes.

## 6. Mastery contract

Mastery remains the supported learning flow and preserves existing behavior unless another ADR changes it. Assess must not regress supported current or historical Mastery sessions.

## 7. Assess student contract

An Assess learner is blind to scoring and answer feedback during and after the attempt. Allowed information is prompt/input/navigation and neutral progress/receipt. Forbidden information includes correctness, expected answer, answer reveal, Mastery, pass/fail, correction/retry, theory hints, score, or result report.

After submission:

```text
ĐÃ NỘP BÀI
Câu trả lời đã được ghi nhận và gửi cho giáo viên.
Điểm và đáp án không hiển thị trong chế độ Assess.
```

## 8. Assess scoring contract

Assess scoring has one owner and is derived by the authorized teacher/admin path from canonical lesson evaluators plus the raw Attempt log.

Version 1:

- objectively gradable accuracy items contribute to correct/incorrect;
- unanswered assessable items count as incorrect for percentage calculation;
- completion/open/personal/pronunciation work is not silently converted to objective correctness;
- unscored items do not enter the denominator;
- no negative points or retry-generated score changes;
- percentage is `correct / assessableTotal * 100`, deterministic rounding owned by Assess scoring policy;
- zero-assessable-item delivery is rejected before issue.

## 9. Learner-safe delivery boundary

Production Assess must not rely on UI-only hiding.

The Assess assignment owns one immutable learner projection named `sanitizedLesson`, produced from the effective canonical lesson at issue time. It contains only prompt/input data and excludes recoverable answer-key fields.

Production flow:

1. authenticated Admin resolves the effective lesson and validates Assess eligibility;
2. pure Assess delivery builder creates an immutable `sanitizedLesson` and rejects answer-key fields or oversized snapshots;
3. Firestore Rules authorize only Admin assignment creation and make delivery/snapshot fields immutable;
4. student reads the assignment and uses only `sanitizedLesson` for Assess interaction;
5. student persists raw neutral attempts under the owned session; attempts contain response/timing/input metadata but no correctness, expected answer, Mastery delta, or score;
6. Firestore Rules bind the Assess session to its assignment snapshot and each attempt to the corresponding sanitized item id;
7. authorized Admin reconstructs the canonical historical lesson and derives correctness/score from the Attempt log using the single Assess summary owner.

There is no production Assess grading/issue server API and no privileged Vercel identity. No service-account key or WIF bootstrap is required by the normal app runtime.

**Threat-model note:** the repository and existing Mastery client corpus are public/client-delivered, so this ADR does not claim cryptographic secrecy against a determined person independently inspecting public source. The enforceable product contract is that the Assess assignment payload, raw attempts, learner UI and learner result flow do not expose correctness or answer-key material.

## 10. Module boundaries — no god components

Ownership:

```text
src/core/deliveryMode.js              mode/version
src/core/assessPayload.js             answer-key-free learner projection
src/core/assessDelivery.js            pure delivery snapshot law/safety/size
src/core/assessScoringPolicy.js       scoring law
src/core/assessSummary.js             teacher result derivation
src/core/assessResponse.js            neutral student response display
src/repositories/assessDeliveryRepository.js  Admin-authorized delivery persistence
src/repositories/assessAttemptRepository.js   raw attempt persistence
src/features/assess/*                 learner flow/rendering
```

Architecture tests reject Assess renderers importing Mastery/retry/theory, student code importing grading/result owners, Admin UI inventing score formulas, lesson settings owning delivery mode, or repositories storing derived correctness/score.

## 11. Admin/teacher contract

Teacher/admin results make mode explicit and derive from the canonical Assess summary. Teacher detail may show correct/incorrect/unanswered, percentage, duration, response and canonical expected answer. Baseline/retest labels remain derived analytics.

## 12. Persistence and migration

New Assess sessions snapshot mode/version, content revision, set/version, threshold/tolerance semantics and assignment id. Historical compatibility remains centralized. Firestore Rules, repository schema and runtime schema move together.

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

Tests prove peer modes, immutable snapshots, no retry/qualification semantics in Assess, deterministic summary from Attempt log, answer-key-free learner snapshot, raw neutral attempts, teacher-only result derivation, Mastery compatibility and no god-component regression.

## 14. End-to-end acceptance scenario

1. Admin creates Assess delivery from an assessable lesson.
2. Assignment has non-empty `sanitizedLesson` with no forbidden answer-key field.
3. Same lesson simultaneously opens in Mastery.
4. Learner starts Assess with `deliveryModeAtStart = assess`.
5. Learner answers Q1 incorrectly and sees no correctness/answer/score/retry/theory/Mastery semantics.
6. Learner finishes and sees neutral receipt; reload remains blind.
7. Attempt log contains one raw neutral attempt per assessable item, no correctness/expected answer.
8. Admin derives expected score/correct-total from canonical lesson + Attempt log.
9. Admin Q1 detail shows incorrect + expected answer.
10. Admin reload reproduces same result.
11. Concurrent Mastery remains unchanged.

## 15. Production gates

| Gate | PASS condition |
| --- | --- |
| SSOT | one Assess scoring implementation |
| Mode SSOT | trusted assignment mode + immutable session snapshot |
| No split brain | same lesson runs Mastery and Assess concurrently |
| Attempt SSOT | result reproducible from raw attempts |
| Blind student | no score/correctness/answer/hint/retry in Assess UI/result |
| Learner-safe payload | persisted `sanitizedLesson` has no forbidden answer-key fields |
| Raw persistence | attempts contain no correctness/expected answer/score |
| Teacher visibility | authorized Admin derives summary/detail |
| Historical compatibility | supported old sessions remain valid |
| No god component | architecture tests pass |
| No schema drift | runtime/repository/Rules align |
| Regression | all existing CI tests pass |
| PR browser E2E | branch code + real Firebase Admin→Assess→Admin passes without production deploy |
| Main Rules deploy | Firestore Rules workflow succeeds from merged `main` |
| Production provenance | Vercel Production Git SHA equals merged GitHub `main` SHA |
| Production browser E2E | same scenario passes on Production URL |

No gate may be waived as a follow-up.

## 16. Explicit technical-debt prohibitions

Not acceptable: student-controlled `?mode`, global `lessonSettings.deliveryMode`, duplicated content sets, copied score formulas, mutable derived score beside Attempt log, answers hidden only by CSS while present in Assess snapshot, giant cross-mode component, schema/rules mismatch, alternate Assess database, temporary WIF/service-account server workaround, manual Vercel deployment or Preview promotion.

## 17. Release workflow — GitHub `main` is the only production trigger

```text
feature branch
  -> PR
  -> canonical CI + PR Assess browser E2E PASS
  -> merge main
  -> GitHub main = production SSOT
       -> Vercel Git Integration auto-deploys exact main SHA
       -> Firestore Rules GitHub Action deploys rules when changed
  -> verify main CI + Rules workflow
  -> verify Vercel Production READY and Git SHA == main SHA
  -> Production Assess browser E2E
  -> production acceptance evidence
```

No `vercel deploy`, no manual Preview promotion, no alternate production branch, no per-release IAM/WIF bootstrap. Rollback is a Git revert on `main` and follows the same Git integration.

## 18. Definition of Done

```text
[ ] ADR accepted
[ ] Mastery/Assess peer modes implemented
[ ] trusted delivery-mode resolution implemented
[ ] immutable session delivery snapshot implemented
[ ] immutable answer-key-free sanitizedLesson implemented
[ ] raw neutral Attempt persistence implemented
[ ] one Assess scoring owner implemented
[ ] teacher summary derives from Attempt log
[ ] student has no feedback/retry/score leak
[ ] neutral receipt implemented
[ ] teacher list/detail implemented
[ ] concurrent Mastery/Assess works
[ ] historical Mastery compatible
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

Until every checkbox passes, Assess must not be represented as Production Accepted.

## 19. Final production invariant

```text
one lesson corpus
+ one learner-safe Assess projection per delivery
+ one trusted delivery mode per session
+ one canonical raw attempt history
+ one scoring owner per mode
+ mode-specific presentation
+ GitHub main as the only production source
= Mastery and Assess without split brain
```
