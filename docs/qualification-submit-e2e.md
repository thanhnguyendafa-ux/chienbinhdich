# Immediate Qualification Checkpoint — E2E Goal

## Problem

The product message says that the learner can submit once Mastery reaches the Set threshold (currently 80%). Production currently violates that contract: `Mastery >= passThreshold` can be true while the session is still `active`, because `retryScheduler.advanceLearningPrompt()` checks remaining main/retry work before it checks the mastery threshold. The UI only renders the submit checkpoint when `session.status === 'passed'`.

This affects every Set because Typing, MCQ, True/False and Sentence Order share the same Session/Mastery/Retry engine. Mobile did not cause the bug; mobile made it visible.

## Product Contract

`actual Mastery >= set.passThreshold` is the single qualification condition.

When an active learner first reaches the threshold:

1. The just-submitted attempt is persisted in the immutable Attempt Log.
2. The session enters the qualification checkpoint immediately.
3. The next learning prompt is not advanced yet.
4. The learner sees:
   - `Nộp bài`
   - `Làm tiếp`
5. `Nộp bài` creates the final submitted report.
6. `Làm tiếp` resumes the existing scheduler state from exactly where the checkpoint interrupted it.
   - An eligible retry may come first, because retry spacing remains scheduler-owned.
   - Otherwise the next main item is shown.
   - After main/retry work is exhausted, extended review continues.
7. Once qualified, the learner keeps the right to submit even if Mastery later drops below the threshold during extra practice.

## Architectural Ownership

### Session Machine owns

- Attempt evidence
- Mastery qualification decision
- `qualifiedAt`
- lifecycle transition `active -> passed -> extended/submitted`

### Retry Scheduler owns only

- which prompt comes next
- retry spacing
- main progression
- continuation review

The Retry Scheduler must not decide whether the learner is allowed to submit.

## Recommended Senior-Engineering Solution

### 1. Move qualification out of Retry Scheduler

Remove `hasReachedMastery()` and `status: 'passed'` logic from `retryScheduler.js`.

### 2. Add a Session-domain qualification reconciler

Add `qualifySessionIfEligible(session, set)` in `sessionMachine.js`.

It must:

- act only on `active` sessions;
- replay Attempt Log Mastery using the existing Mastery engine;
- return the unchanged session if the threshold has not been reached;
- otherwise return `status: 'passed'` and preserve scheduler fields (`currentItemId`, `mainCursor`, `retryQueue`, `promptIndex`);
- derive the first threshold-crossing timestamp from Attempt Log when `qualifiedAt` is missing.

This reconciler gives backward-safe behavior for an existing V7 active session that already has >=80% Mastery. No schema/data-shape migration is required.

### 3. Stop before advancing when threshold is reached

For a correct submission:

- append attempt;
- compute Mastery;
- if an active learner is now eligible, mark `passed` immediately;
- otherwise call `advanceLearningPrompt()`.

This guarantees that a 10-item Mixed Set stops at 80% on item 8 and a 16-item Typing Set stops at 81.25% on the 13th gain.

### 4. Resume the scheduler, not a random review

`continueQualifiedSession()` must:

- set `status = 'extended'` and keep qualification timestamp;
- call `advanceLearningPrompt()` from the preserved checkpoint state.

This avoids skipping unfinished main items or pending retries.

### 5. Reconcile persisted active sessions on entry to Drill

Before rendering Drill, call `qualifySessionIfEligible()` and persist the reconciled session if it changes. This fixes already-saved V7 mobile sessions that are >=80% but still `active`.

### 6. Report completion context

Add a report metric for `Chuỗi chính` as `completedMainItems/total`. A learner may legitimately submit at 80% before seeing every main item, so the teacher must be able to distinguish qualification from full main-sequence completion.

## Teaching Rationale

The learner-facing rule must be cognitively simple and trustworthy:

> Vượt mục tiêu Mastery = có quyền nộp.

If the UI says the target is 80% but silently requires hidden completion conditions, pupils experience the progress bar as misleading. Immediate checkpoint feedback strengthens goal clarity and perceived control. `Làm tiếp` preserves deliberate practice for learners who want more retrieval, while the report keeps enough evidence for the teacher to see whether the learner submitted early or continued.

## Invariants

Do not change:

- Attempt Log as Mastery SSOT
- first attempt per exposure is the only Mastery-scoring attempt
- correction is neutral
- retry gap = 2 prompts
- deterministic answer-position shuffle
- Mastery bounded 0..100
- threshold is data-driven from `set.passThreshold`
- submitted/abandoned reports
- stable `/s/:setId` URLs
- Session data shape (V7 remains valid)

## E2E Acceptance Scenarios

### Mixed Set — clean 10-item path

- Q1 correct -> 10%
- ...
- Q8 correct -> 80%
- session immediately becomes `passed`
- Q9 is not advanced yet
- checkpoint renders `Nộp bài` and `Làm tiếp`

### Mixed Set — continue

- at 80%, choose `Làm tiếp`
- session becomes `extended`
- scheduler resumes from preserved state
- pending eligible retry is honored; otherwise next main item is shown
- `Nộp bài` remains available in extended mode

### Typing Set — 16 items

- 12 gains -> 75%
- 13th gain -> 81.25%
- checkpoint renders immediately

### Retry-cross-threshold

- learner reaches threshold on a retry/review first attempt
- checkpoint renders immediately before another prompt is scheduled

### Persisted V7 compatibility

- saved `active` session already has >=80% from previous production semantics
- reload direct Set link
- Session Machine reconciliation changes it to `passed`
- checkpoint appears without requiring another answer

### Post-qualification loss

- learner qualifies
- chooses `Làm tiếp`
- later wrong retrieval lowers current Mastery below threshold
- `qualifiedAt` remains set
- extended top bar still offers `Nộp bài`
- report shows both Mastery at qualification and final Mastery

### Report

- add `Chuỗi chính x/N`
- submitted report can show qualification before full main completion

## Responsive Acceptance

### Classroom primary viewport

- 1280x529 CSS px
- Chrome maximized, not F11
- Zoom 100%
- Windows Scale 150%
- Bookmarks bar enabled
- qualification card keeps both actions visible without hidden CTA

### iPhone 11 portrait

- approximately 414x896 CSS px
- qualification actions stack to one column
- both buttons remain visible/touchable
- extended top-bar `Nộp bài` remains reachable

## Test Plan

Add/adjust automated tests for:

1. exact 80% immediately qualifies before remaining main prompts;
2. >80% Typing-style unit immediately qualifies;
3. retry/review crossing threshold immediately qualifies;
4. Retry Scheduler source no longer owns `hasReachedMastery` or `status: 'passed'`;
5. Session Machine owns qualification;
6. continuing from checkpoint resumes next scheduler-owned prompt rather than skipping to generic review;
7. legacy active >=80% reconciliation;
8. qualified learner can continue and later submit even if Mastery falls;
9. report exposes main sequence completion ratio;
10. mobile/classroom qualification CSS remains protected.

## Delivery Pipeline

1. Feature branch
2. Implement Session-domain qualification
3. Update tests
4. `npm run ci`
5. Pull Request
6. GitHub Actions
7. Vercel Preview
8. Verify Mixed + Typing source/deep links
9. Review all comments/checks
10. Squash merge
11. Git-backed Vercel Production
12. Verify production SHA == `main`
13. Verify `/`, Mixed Set and Typing Set return 200
14. Verify runtime errors = 0

## Blocker Policy

If a blocker appears:

1. identify whether it is product contract, state-machine, persistence, scheduler, UI, responsive, CI or deployment;
2. do not patch symptoms in renderer code when ownership belongs in Session/Scheduler;
3. prefer a backward-compatible reconciliation when data shape is unchanged;
4. preserve Attempt Log evidence and stable links;
5. add a regression test reproducing the blocker before accepting the fix;
6. audit the recommended solution end-to-end before merge.
