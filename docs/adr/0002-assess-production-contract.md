# ADR 0002 — Assess Production Contract

Status: Proposed for implementation; production acceptance requires every gate in this ADR to pass.

## Decision

Assess and Mastery are peer delivery modes over one canonical lesson corpus. Assess is blind: no learner-facing correctness, expected answer, score, retry/correction, Mastery, pass/fail or correctness-driven theory support.

```text
deliveryMode: "mastery" | "assess"
deliveryContractVersion: 1
```

A started session snapshots mode/version and never changes mode later.

## SSOT

- published lesson/question truth: canonical lesson content
- item participation: `assessmentPolicy`
- Mastery score: Mastery policy/engine
- Assess score: Assess scoring policy + `deriveAssessSummary(attempts, lesson)`
- learner submissions: raw Attempt log
- delivery mode: trusted assignment + immutable session snapshot
- production source: GitHub `main`; Vercel Production must identify the same SHA

No mutable derived Assess score is a competing truth beside the Attempt log.

## Learner-safe Assess delivery

At issue time an authenticated Admin resolves the effective lesson and creates an immutable `sanitizedLesson` projection. It contains only prompt/input material and excludes recoverable answer-key fields.

Student flow uses only that assignment projection and writes neutral raw attempts directly to the owned Firestore session. Attempts contain response/timing/input metadata but no correctness, expected answer, Mastery delta or score. Firestore Rules bind the session to its assignment contract and each attempt to the corresponding sanitized item id.

Authorized Admin reconstructs the historical canonical lesson and derives correctness/score from the Attempt log through the single Assess summary owner.

There is no production Assess issue/lesson/grade server API and no privileged Vercel identity. No WIF or copied service-account key is required by the runtime.

Threat model: the repo and existing Mastery client corpus are public/client-delivered, so cryptographic secrecy against independent public-source inspection is not claimed. The enforceable contract is that the Assess assignment payload, learner UI, raw attempts and learner result flow do not expose answer-key/correctness material.

## Mode behavior

Mastery preserves current learning feedback/retry/progress semantics. Assess allows prompt/input/navigation, neutral progress and a neutral final receipt only:

```text
ĐÃ NỘP BÀI
Câu trả lời đã được ghi nhận và gửi cho giáo viên.
Điểm và đáp án không hiển thị trong chế độ Assess.
```

Same lesson must run Mastery and Assess concurrently without cross-mode interference. `lessonSettings.deliveryMode` is forbidden.

## Module boundaries

```text
src/core/deliveryMode.js              mode/version
src/core/assessPayload.js             learner-safe projection
src/core/assessDelivery.js            pure delivery snapshot law
src/core/assessScoringPolicy.js       Assess scoring law
src/core/assessSummary.js             canonical teacher result derivation
src/core/assessResponse.js            neutral response display
src/repositories/assessDeliveryRepository.js  Admin delivery persistence
src/repositories/assessAttemptRepository.js   raw attempt persistence
src/features/assess/*                 learner flow/UI
```

Student code must not import `deriveAssessSummary`, `evaluateQuestion` or expected-answer derivation. Admin UI must not invent another score formula. Assess renderer/controller must not import Mastery engine/retry/theory domains. No god component.

## Scoring v1

Objectively gradable accuracy items enter the denominator. Unanswered assessable items are incorrect at final derivation. Unscored/open/completion-only work is excluded. No negative points and no retry-generated changes. Zero-assessable delivery is rejected.

## Real acceptance

1. Admin issues Assess.
2. Assignment persists answer-key-free non-empty `sanitizedLesson`.
3. Same lesson runs concurrently in Mastery.
4. Learner starts Assess; session snapshots Assess mode.
5. Q1 intentionally wrong; learner sees no correctness/answer/score/retry/theory/Mastery UI.
6. Learner completes; receipt and reload remain blind.
7. One neutral raw attempt per assessable item is persisted; no correctness/expected answer fields.
8. Admin derives expected score/correct-total from canonical lesson + Attempt log.
9. Admin Q1 detail shows incorrect + expected answer.
10. Admin reload reproduces same result; Mastery remains unchanged.

## Production gates

- SSOT scoring/mode/attempt ownership
- answer-key-free `sanitizedLesson`
- neutral raw persistence
- learner blind UI/result
- Admin canonical result/detail
- concurrent Mastery/Assess
- historical Mastery compatibility
- Firestore/runtime schema alignment
- architecture/no-god-component tests
- all regression tests
- PR real-Firebase browser E2E
- merge `main`
- Firestore Rules Action success from `main`
- Vercel Git Integration auto-deploy only
- Vercel Production SHA == GitHub `main` SHA
- Production real browser E2E
- production evidence recorded

No gate may be waived as follow-up.

## Release workflow — `main` is the only production trigger

```text
feature branch
 -> PR
 -> canonical CI + PR real-Firebase E2E PASS
 -> merge main
 -> GitHub main = production SSOT
      -> Vercel Git Integration auto-deploys exact main SHA
      -> Firestore Rules Action deploys rules when changed
 -> verify main CI + Rules Action
 -> verify Vercel Production READY + SHA == main
 -> Production Assess E2E
 -> production acceptance evidence
```

No `vercel deploy`, manual Preview promotion, alternate production branch, per-release IAM/WIF bootstrap or alternate Assess database. Rollback is a Git revert on `main`.

## Definition of Done

```text
[ ] peer modes
[ ] immutable session mode snapshot
[ ] immutable answer-key-free sanitizedLesson
[ ] neutral raw Attempt persistence
[ ] one Assess scoring owner
[ ] teacher summary from Attempt log
[ ] no learner feedback/retry/score leak
[ ] neutral receipt
[ ] teacher list/detail
[ ] concurrent Mastery/Assess
[ ] historical compatibility
[ ] Firestore/runtime alignment
[ ] no privileged Vercel Assess server/WIF dependency
[ ] architecture/security/regression tests PASS
[ ] PR real-Firebase E2E PASS
[ ] merged main CI PASS
[ ] main Rules deploy PASS
[ ] Vercel Production SHA == main SHA
[ ] Production E2E PASS
[ ] production evidence recorded
```

Until every checkbox passes, Assess is not Production Accepted.
