# Admin + Assignment Access E2E

## Product contract

Chiến Binh Dịch has two access surfaces:

1. **Admin** at `/admin`
   - requires Firebase Email/Password authentication;
   - requires an `admins/{uid}` marker document;
   - can inspect all published lessons from the GitHub lesson catalog;
   - can create readable assignment links;
   - can close/re-open assignments;
   - can read learner sessions and Attempt Events.

2. **Student** at `/a/:readableSlug-:code`
   - authenticates anonymously;
   - can fetch only the exact active assignment document addressed by the code;
   - sees only that lesson;
   - enters a name and completes Session V7;
   - session and attempts persist to Firestore with local browser fallback.

The public `/` route does not list lessons. Legacy `/s/:setId` routes redirect to the Admin preview gate.

## Assignment URL contract

Format:

```text
/a/[readable-slug]-[6-character-code]
```

Examples:

```text
/a/g7u1-dich2-mcq-P9M3X8
/a/g7u1-hobby-typing-H7K3M9
/a/mrt-left-cut-right-mix-R8B2N5
```

The readable slug exists for the teacher. The final six-character code is the Firestore assignment document id and the lookup key.

Lesson descriptors own `assignmentSlug`. Assignment documents own the random code. Lesson content remains in GitHub.

## Firestore model

```text
admins/{uid}

assignments/{code}
  id
  code
  slug
  setId
  setVersion
  title
  course
  unit
  activityType
  active
  createdBy
  createdAt
  updatedAt

sessions/{sessionId}
  Session V7 metadata
  assignmentId
  assignmentSlug
  ownerUid
  attemptCount
  syncedAt

sessions/{sessionId}/attempts/{attemptId}
  immutable Attempt Event
```

Attempt Events remain the learning evidence SSOT. Admin Mastery display is derived from attempts and current lesson item count.

## Firebase Console gates before production cutover

Do not set `firebaseConfig.enabled = true` until all gates below are complete.

### 1. Enable student Anonymous Authentication

Firebase Console:

```text
Authentication
→ Sign-in method
→ Anonymous
→ Enable
→ Save
```

### 2. Enable Admin Email/Password Authentication

```text
Authentication
→ Sign-in method
→ Email/Password
→ Enable
→ Save
```

### 3. Create the Admin user

```text
Authentication
→ Users
→ Add user
```

Use the teacher's private Admin email and a strong password. Never place that password in GitHub or frontend code.

Copy the created user's Firebase UID.

### 4. Create the Admin marker

Firestore Console:

```text
admins
└── {ADMIN_UID}
```

The document can contain descriptive fields such as:

```text
role: "admin"
displayName: "Teacher Admin"
```

Security depends on the document path/UID, not on a client-editable role field. The shipped rules deny client creation/update/delete of `admins/*`, so bootstrap this marker in the Firebase Console.

### 5. Publish Firestore Rules

Publish the repository `firestore.rules` to the `(default)` database.

Expected access:
- Admin marker UID can list/read assignments and sessions.
- Signed-in anonymous student can `get` an active assignment by exact code but cannot list assignments.
- Student can read/write only their own session/attempt records.
- Client deletes are denied.

### 6. Production cutover

After gates 1–5 are verified:

1. change `src/config/firebaseConfig.js` to `enabled: true`;
2. run canonical CI;
3. merge through PR to `main`;
4. Vercel deploys production from the `main` Git commit;
5. test with two browser profiles: one Admin, one Student.

## Production smoke test

Admin browser:

```text
/admin
→ login
→ inspect G7 U1 Bài tập dịch 2
→ Create assignment
→ copy /a/g7u1-dich2-mcq-XXXXXX
```

Student browser:

```text
open copied URL
→ only the assigned lesson is visible
→ enter student name
→ answer / retry / qualify / submit
```

Admin browser:

```text
Dashboard
→ Results
→ open student session
→ verify attempts and derived Mastery
```

Also verify:
- `/` never exposes the lesson catalog;
- an unauthenticated visitor cannot read Admin Firestore data;
- another anonymous UID cannot read a learner session;
- a closed assignment cannot be opened by a new student;
- legacy `/s/:setId` routes go through the Admin gate;
- lesson IDs, lesson versions, Mastery Engine, Retry Scheduler, Session V7 and report semantics are unchanged.
