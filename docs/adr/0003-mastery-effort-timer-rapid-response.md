# ADR 0003: Mastery Effort Timer and rapid-response integrity signals

- Status: Accepted
- Date: 2026-08-31

## Context

`deliveryMode` already has one canonical contract: `mastery | assess`. Learners who need more time should be able to qualify through sustained active study without inventing a third delivery mode or weakening Mastery scoring. Fast responses are useful integrity evidence, but speed by itself is not proof of misconduct and must never alter academic scoring.

## Decision

### Delivery mode

Effort Timer is a policy inside Mastery. It is not a third delivery mode.

```text
deliveryMode = mastery | assess
```

New Mastery sessions snapshot `deliveryModeAtStart` and the current delivery contract version.

### Mastery qualification

A Mastery session qualifies when either branch is satisfied:

```text
Mastery target reached
OR
Effort target reached
```

Effort PASS does not inflate the actual Mastery percentage. The session records `qualificationReason = mastery | effort`.

### Effort policy

Admin may enable Effort Timer and choose an integer target from 5 through 60 minutes. The policy is snapshotted at session start. Later Admin changes affect only new sessions.

Effort time means active study time:

```text
activeStudyMs = elapsed session time - tab-away time
```

Effort qualification additionally requires at least one submitted attempt. Merely leaving the lesson open cannot qualify a session.

### Rapid-response policy

Rapid-response thresholds are question-type aware. Short Typing answers are excluded where response time is not meaningful.

A single rapid answer is logged only. Learner warning is raised when the current answer is rapid and either:

- there are at least 2 consecutive rapid responses; or
- at least 3 of the most recent 5 responses are rapid.

Rapid-response events and warnings are integrity/process evidence only. They never change Mastery, correctness, PASS/FAIL, or Assess score.

### Learner contract

Before starting a Mastery session, the learner sees the current rules and explicitly acknowledges them. When Effort Timer is enabled, the screen states the OR qualification contract and explains that tab-away time is excluded.

Assess remains independent: no Effort PASS, no coaching, no Mastery semantics, and no answer reveal.

### Persistence and security

Session policy snapshots are immutable after session creation. Firestore Rules validate Effort Timer bounds and protect the snapshots from mutation.

Attempt Log remains the canonical learning evidence. Mastery, Effort qualification and rapid-response summaries are derived from canonical session/attempt/integrity evidence rather than stored as competing scoring SSOTs.

## Acceptance gates

A release is accepted only when all applicable gates pass:

1. canonical `npm run ci` passes on the exact PR head;
2. Mastery regression tests pass;
3. Assess isolation/security tests pass;
4. Effort boundary tests pass at 5/60 valid and 4/61 invalid;
5. 9:59 active study does not qualify a 10-minute target and 10:00 does;
6. tab-away time cannot satisfy Effort;
7. Mastery reaching target first records `qualificationReason = mastery`;
8. Effort reaching target first records `qualificationReason = effort` without changing actual Mastery;
9. rapid response logs/warns without changing scoring;
10. Firestore Rules validate policy bounds and immutable snapshots;
11. merge to `main` occurs only after exact-head CI passes;
12. Vercel Production is deployed by Git integration from `main`, not by manual promotion;
13. Production Git SHA must equal GitHub `main` SHA;
14. production smoke checks cover Admin, Mastery and Assess routes.

Firebase browser E2E remains advisory under the current release policy and must not be misreported as passed when external Firebase quota blocks it.

## Consequences

- Existing Mastery scoring remains the academic scoring owner.
- Weaker learners can demonstrate sustained effort without receiving fake Mastery credit.
- Admin policy changes cannot rewrite an in-progress learner contract.
- Rapid-response evidence is observable without becoming an automatic cheating verdict.
- Release remains GitHub-main-driven: merge to `main` is the release action and Vercel auto-deploys that commit.
