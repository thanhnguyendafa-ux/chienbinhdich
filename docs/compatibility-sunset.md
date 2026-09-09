# Compatibility Sunset Policy

This document prevents historical compatibility paths from becoming permanent architecture debt.

## Current compatibility contracts

The application currently keeps these compatibility paths intentionally:

- Session schema V7 remains readable while V8 is the current schema.
- `cbd.activeSession.v7` remains a migration source for scoped V8 active-session storage.
- `cbd.report.v7.*` remains readable for historical reports.
- Legacy assignment links remain a read-only compatibility path.
- Legacy `/s/:setId` links redirect into protected Admin preview.

These paths must not gain new product behavior. New features target the current fixed-link/session contracts only unless a migration requirement explicitly says otherwise.

## Review dates

- Next compatibility review: **2026-10-15**.
- Earliest removal window for a compatibility path: **2026-11-15**.

A review date is not an automatic deletion date. Removal requires the exit criteria below.

## Exit criteria

A compatibility path may be removed only when all relevant criteria are satisfied:

1. No active production workflow still issues that legacy link/session form.
2. Production evidence shows no meaningful use of the legacy path for at least 30 consecutive days, or an explicit migration has moved the remaining users.
3. Historical reports that must remain accessible have a tested migration or retained reader.
4. Automated tests are updated in the same PR that removes the compatibility code.
5. The removal PR includes a rollback note and confirms that current fixed-link + Session V8 flows remain green in canonical CI.

## Ownership rules

- Compatibility readers may translate old data into the current domain model.
- Compatibility code must not become a second scoring, routing, or persistence-policy owner.
- No new field should be written only to a legacy namespace.
- Current business rules remain owned by the current domain modules; legacy readers adapt old inputs to those rules or preserve snapshotted historical semantics where required.

## Removal sequence

When a path qualifies for removal:

1. stop issuing it;
2. observe the 30-day no-use window or complete migration;
3. remove the writer first if one still exists;
4. keep the reader for one additional release if historical access is required;
5. remove the reader and legacy tests in a dedicated cleanup PR;
6. run canonical CI and post-deploy smoke tests.

This policy is deliberately conservative because compatibility cleanup must reduce technical debt without changing historical grading semantics.
