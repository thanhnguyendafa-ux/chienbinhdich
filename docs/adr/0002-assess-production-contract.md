# ADR 0002 — Assess Production Contract

Status: Proposed for implementation; production acceptance requires every gate in this ADR to pass.

## 1. Decision summary

Chiến Binh Dịch has two peer delivery modes for the same lesson corpus:

- `mastery` — supported learning mode.
- `assess` — blind independent assessment mode: no learner-facing correctness, answers, retry/correction, Mastery, pass/fail, theory support, or score.

```text
deliveryMode: "mastery" | "assess"
deliveryContractVersion: 1
```

Started sessions snapshot `deliveryModeAtStart` and `deliveryContractVersionAtStart`. The same published lesson may run concurrently in both modes without duplicated lesson content.

## 2. Concern separation

`assessmentPolicy` owns what participates in scoring. `deliveryMode` owns whether the session is a learning experience or a blind assessment experience. They must never be merged.

## 3. Production use case

Assess supports pre-unit baseline, no-preparation diagnostic, post-instruction independent check, pre/post comparison around Mastery practice, and teacher grouping/intervention decisions.

```text
ASSESS (baseline) -> MASTERY (learn/practice) -> ASSESS (independent check)
```

## 4. SSOT boundaries

| Concern | Authoritative owner |
| --- | --- |
| Published lesson | catalog/content |
| Correctness | question evaluators |
| Scored/unscored participation | `assessmentPolicy` |
| Delivery mode | delivery domain + immutable session snapshot |
| Mastery scoring | Mastery policy/engine |
| Assess scoring | Assess scoring policy |
| Learner submissions | Attempt log |
| Assess result | `deriveAssessSummary(attempts, lesson)` |
| Learner presentation | Assess renderer/controller |
| Teacher result presentation | Assess Admin |
| Production source | GitHub `main` SHA matched by Vercel Production SHA |

No mutable derived score/correct-count is a competing truth beside the Attempt log.

## 5. Delivery mode ownership

`deliveryMode` is not a global lesson setting. It belongs to assignment/session delivery. Student-controlled URL/query/localStorage/DOM values are never authority. A running session never changes mode because delivery configuration later changes.

## 6. Mastery contract

Assess must not regress current or supported historical Mastery behavior.

## 7. Assess learner contract

Allowed: prompt/input/navigation, neutral progress, neutral submission receipt.

Forbidden: correct/incorrect, expected answer, reveal, Mastery units/percentage, pass/fail, retry/correction, correctness-driven theory hints, score, result report, or metadata that directly reveals correctness.

Final receipt:

```text
ĐÃ NỘP BÀI
Câu trả lời đã được ghi nhận và gửi cho giáo viên.
Điểm và đáp án không hiển thị trong chế độ Assess.
```

## 8. Assess scoring contract

The authorized teacher/admin path derives scoring from the canonical historical lesson plus the raw Attempt log. Accuracy items contribute correct/incorrect; unanswered assessable items count incorrect for percentage; unscored/open/completion-only work is not silently converted; no negative score; no retry-generated changes; zero-assessable delivery is rejected.

## 9. Learner-safe delivery boundary

The Assess assignment owns an immutable `sanitizedLesson` projection created from the effective canonical lesson at issue time.

1. Admin resolves effective lesson and validates Assess eligibility.
2. Pure Assess delivery builder creates `sanitizedLesson`, rejects forbidden answer-key fields and oversized snapshots.
3. Firestore Rules allow only Admin assignment creation and keep delivery/snapshot fields immutable.
4. Student reads the assignment and uses only `sanitizedLesson` for Assess interaction.
5. Student persists raw neutral attempts under the owned session: response/timing/input metadata only, no correctness/expected answer/Mastery delta/score.
6. Rules bind the Assess session to its assignment contract and each attempt to the matching sanitized item id.
7. Authorized Admin reconstructs the canonical historical lesson and derives result through the single Assess summary owner.

There is no production Assess grading/issue server API and no privileged Vercel identity. No service-account key or WIF bootstrap is required by the app runtime.

**Threat model:** this repository and the existing Mastery client corpus are public/client-delivered, so the system does not claim cryptographic secrecy against someone independently inspecting public source. The production contract is that the Assess assignment payload, learner interaction, raw Attempt log and learner result flow do not expose answer-key/correctness material.

## 10. No god components

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

Architecture tests reject student grading imports, cross-mode renderer dependencies, copied score formulas, lesson-settings mode ownership, derived correctness persisted by repositories, and giant cross-domain components.

## 11. Teacher contract

Authorized Admin sees explicit Assess mode, canonical percentage/correct-total, baseline/retest analytics, duration, raw student response and canonical expected answer/item correctness. Admin consumes `deriveAssessSummary`, not another formula.

## 12. Persistence/migration

Assess sessions snapshot mode/version, assignment, set/version, content revision, threshold/tolerance semantics. Historical compatibility remains centralized. Runtime schema and Firestore Rules move together.

## 13. Tests

Required domains include `deliveryMode`, Assess scoring/summary/session/UI/security/persistence/architecture/Admin results/Mastery regression. Tests prove peer modes, immutable snapshots, answer-key-free learner projection, raw neutral persistence, deterministic teacher derivation, no feedback/retry semantics, and Mastery compatibility.

## 14. Real E2E acceptance

1. Admin issues Assess.
2. Assignment persists non-empty answer-key-free `sanitizedLesson`.
3. Same lesson runs Mastery concurrently.
4. Learner starts Assess; session is stamped Assess.
5. Q1 is intentionally wrong; learner sees no correctness/answer/score/retry/theory/Mastery UI.
6. Learner finishes; receipt and reload remain blind.
7. Attempt log contains exactly one neutral raw attempt per assessable item and no correctness/expected answer.
8. Admin derives expected score/correct-total from canonical lesson + Attempt log.
9. Q1 Admin detail shows incorrect and expected answer.
10. Admin reload reproduces same result; concurrent Mastery remains unchanged.

## 15. Production gates

| Gate | PASS |
| --- | --- |
| SSOT | one Assess scoring owner |
| Mode SSOT | assignment mode + immutable session snapshot |
| No split brain | concurrent Mastery/Assess works |
| Attempt SSOT | result reproducible from raw attempts |
| Blind learner | no score/correctness/answer/hint/retry |
| Learner-safe payload | `sanitizedLesson` has no forbidden answer fields |
| Raw persistence | attempts contain no correctness/expected answer/score |
| Teacher visibility | Admin derives summary/detail |
| Historical compatibility | old supported sessions work |
| No god component | architecture gates pass |
| Schema alignment | runtime/repository/Rules align |
| Regression | full CI passes |
| PR browser E2E | branch + real Firebase flow passes without Production deploy |
| Main Rules deploy | Rules workflow succeeds from merged `main` |
| Provenance | Vercel Production SHA == GitHub `main` SHA |
| Production E2E | same real flow passes on Production URL |

No gate may be waived as follow-up.

## 16. Technical-debt prohibitions

No student-controlled mode authority, global lesson mode, duplicated lesson copies, copied score formulas, mutable derived score, answer hiding while answer remains in Assess snapshot, giant cross-mode component, schema drift, alternate Assess database, temporary WIF/service-account server workaround, manual Vercel deployment, or Preview promotion as normal release.

## 17. Release workflow — `main` is the only production trigger

```text
feature branch
 -> PR
 -> canonical CI + PR real-Firebase Assess E2E PASS
 -> merge main
 -> GitHub main = production SSOT
      -> Vercel Git Integration auto-deploys exact main SHA
      -> Firestore Rules Action deploys rules when changed
 -> verify main CI + Rules Action
 -> verify Vercel Production READY + SHA == main
 -> Production Assess E2E
 -> production acceptance evidence
```

No `vercel deploy`, manual Preview promotion, alternate production branch, or per-release IAM/WIF bootstrap. Rollback is a Git revert on `main` and follows the same Git integration.

## 18. Definition of Done

```text
[ ] ADR accepted
[ ] peer modes
[ ] trusted mode resolution
[ ] immutable session snapshot
[ ] immutable answer-key-free sanitizedLesson
[ ] raw neutral attempts
[ ] one Assess scoring owner
[ ] teacher summary from Attempt log
[ ] no learner feedback/retry/score leak
[ ] neutral receipt
[ ] teacher list/detail
[ ] concurrent Mastery/Assess
[ ] historical compatibility
[ ] Firestore/runtime alignment
[ ] no privileged Vercel Assess server/WIF dependency
[ ] architecture/security/regression tests
[ ] PR real-Firebase E2E
[ ] merged main CI
[ ] main Rules deploy
[ ] Vercel Production SHA == main SHA
[ ] Production E2E
[ ] production evidence
```

## 19. Final invariant

```text
one lesson corpus
+ one learner-safe Assess projection per delivery
+ one trusted mode per session
+ one canonical raw Attempt history
+ one scoring owner per mode
+ mode-specific presentation
+ GitHub main as the only production source
= Mastery and Assess without split brain
```
