# Firebase Persistence E2E — Chiến Binh Dịch

## Goal

Keep GitHub `main` as the canonical source for application code and lesson content, keep Vercel as Git-backed hosting, and use Firebase Authentication + Cloud Firestore as durable learner-data persistence without changing Session V7, Attempt SSOT, Mastery, Retry, qualification, reports, Set IDs, or stable student links.

## Release architecture

```text
GitHub main (code + lessons)
  -> Vercel Production
  -> browser runtime
       -> localStorage safety cache
       -> Firebase anonymous auth
       -> Cloud Firestore learner persistence
```

Lesson content does not move to Firestore. Existing `src/data/*` modules and `lessonCatalog.js` remain the lesson SSOT.

## Safe migration behavior

1. Existing V7 local keys remain readable: `cbd.activeSession.v7` and `cbd.report.v7.*`.
2. With Firebase enabled, the persistence facade authenticates anonymously in the background.
3. All valid local V7 active/report snapshots are queued for Firestore upload.
4. Session document IDs reuse `session.id`; attempt document IDs reuse immutable `attempt.id`, making repeat migration idempotent.
5. Local copies are not deleted after upload.
6. Every new active/report save writes local first and queues Firestore second.
7. Failed/offline Firestore writes retain the local copy and retry after the browser returns online.

## Firestore shape

```text
sessions/{sessionId}
  schemaVersion
  id
  studentName
  setId
  setVersion
  status
  timing + scheduler state
  ownerUid
  attemptCount
  persistenceVersion
  syncedAt

sessions/{sessionId}/attempts/{attemptId}
  immutable Attempt Event fields
  sessionId
  ownerUid
```

Mastery remains derived from Attempt Events; no independent mastery SSOT is introduced.

## Production cutover gate

The registered Firebase Web App config is present in `src/config/firebaseConfig.js`. The cutover commit sets `firebaseConfig.enabled = true` only after these external Firebase Console gates are satisfied:

1. **Authentication -> Sign-in method -> Anonymous** is enabled.
2. The repository `firestore.rules` is published to the target Firestore database.

Do not merge the cutover branch before both gates are confirmed. Do not commit service-account JSON, Admin SDK private keys, or any server secret.

## Rules contract

- unauthenticated access is denied;
- a student can create/read/update only a session owned by their Firebase UID;
- core session identity (`id`, schema, Set identity, start time, owner) cannot be reassigned by update;
- attempts can be created by the owner and only rewritten identically, preserving immutable Attempt evidence;
- client deletes are denied.

Teacher-wide/admin reads are deliberately not granted by these student rules. Add that later through an explicit teacher-auth/custom-claims or trusted backend design rather than weakening student access.

## CSP contract

Firebase modular CDN is pinned to `12.16.0`. Vercel CSP permits `www.gstatic.com` for the pinned SDK modules and Firebase Google API origins for Auth/Firestore connections while retaining `style-src 'self'` and no `unsafe-inline`.

## Acceptance

Before merging production cutover, verify:

- Anonymous Authentication is enabled;
- repository Firestore rules are published;
- existing lesson catalog and stable routes are unchanged;
- first successful Firebase launch uploads existing active/report snapshots;
- repeated migration does not create duplicate session/attempt IDs;
- correct/wrong/correction/retry semantics remain unchanged;
- reaching 80% and submission produces the same report as before;
- offline answers remain locally safe and sync after reconnect;
- Firestore denies unauthenticated reads/writes and cross-owner access;
- GitHub CI passes before merge;
- Vercel production comes only from `main` Git integration.
