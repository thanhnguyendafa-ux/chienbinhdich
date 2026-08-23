# ADR 0001 — Main Final Production SSOT boundaries

Status: Accepted for this release.

## Decision

Chiến Binh Dịch uses one owner per production concern:

- Current question: `session.currentItemId` resolved by `getCurrentItem()`.
- Question correctness/completion: question evaluators.
- Mastery delta: `src/core/masteryScoringPolicy.js`.
- Mastery percentage/transitions: `src/core/masteryEngine.js`, replayed from the Attempt log.
- Workbook participation and accuracy/completion mode: `src/core/assessmentPolicy.js`.
- Word bank presentation: the current question item through `sourceWordBankRenderer.js`; no URL/DOM reverse lookup.
- Drill metrics parent layout: `styles/global.css`.
- Mastery progress internals: `styles/mastery-progress.css` and `src/ui/masteryProgress.js`.
- Published lessons: `src/data/publishedLessonCatalog.js`.
- Production source: GitHub `main`; Vercel Production must identify the same Git SHA.

## Mastery contract

Current workbook assessment contract version is 2.

Accuracy items:

- first correct attempt in an exposure: `+1` Mastery unit;
- first wrong attempt in an exposure: `-1` Mastery unit;
- later/correction attempts in that same exposure: `0`.

Completion items:

- incomplete: `0`;
- first valid completion: `+1`;
- no invented wrong-answer penalty for open/pronunciation practice.

Mastery remains clamped to `0..100`, uses all published workbook items in the denominator, and keeps the 80% pass threshold.

Contract-v1 sessions that were already started remain on the historical earned-only workbook law through one centralized compatibility boundary. New sessions use v2. This is migration compatibility, not a second current scoring implementation.

## Removed split brain

The runtime `sourceWordBankEnhancer.js` path is removed. Word banks no longer infer the current item from pathname, workbook registries, prompt text, `MutationObserver`, or DOM queries.

Mastery component CSS no longer owns `.metrics-row` or `.drill-shell`; the parent drill layout has one owner.

`sessionMachine.js` no longer implements its own Mastery formula and delegates to the scoring policy.

## Guardrails

`tests/mainFinalSsotArchitecture.test.js` and domain tests fail CI if these ownership boundaries regress.

## Release provenance note

A documentation-only commit was added after Vercel Preview branch tracking was verified, solely to retrigger the Git integration for this PR. It changes no runtime behavior; the Preview gate must still prove that the deployment Git SHA exactly matches the PR head before merge.
