# MRT Grammar Classification Set — E2E Goal

## Product Goal

Publish a new folder and a new student Set inside Chiến Binh Dịch:

- Folder: `Bài học Thầy Thành MRT`
- Set: `Bài tập Phân loại gán - aura - hành động`
- Course: `Global Success 6`
- Scope: `Units 1–3 · My New School · My House · My Friends`
- Questions: 20 total
  - 10 MCQ
  - 10 True/False
  - 7 Gán TO BE
  - 7 Aura TO BE
  - 6 Hành động VERB
  - T/F balance: 5 TRUE + 5 FALSE
- Pass threshold: 80%
- Mastery unit: 5% per scorable exposure on a 20-item Set

The Set teaches the Mister Thành classification model before full English production:

- `LÀ AI / LÀ CÁI GÌ?` → `GÁN TO BE` → `S + am/is/are + noun`
- `NHƯ THẾ NÀO?` → `AURA TO BE` → `S + am/is/are + adjective`
- `LÀM GÌ?` → `HÀNH ĐỘNG VERB` → `S + verb`

## Core Product Contract

The new Set must use the existing shared learning engine. It must not create a Set-specific Mastery, Retry, Session, routing, or report implementation.

The learner flow is:

1. Open Library Home.
2. Open folder `Bài học Thầy Thành MRT`.
3. Open Set `Bài tập Phân loại gán - aura - hành động`.
4. Enter student name.
5. Answer MCQ and True/False questions in one shared Mastery session.
6. First attempt of each exposure changes Mastery using the current shared rule.
7. Wrong items return through the existing Retry Scheduler.
8. As soon as actual Mastery reaches or exceeds 80%, Session Machine opens the existing qualification checkpoint immediately:
   - `Nộp bài`
   - `Làm tiếp`
9. `Nộp bài` produces the existing printable report.
10. `Làm tiếp` resumes the preserved scheduler state, then eventually moves into extended practice.

## Folder and Stable Identity

Folder identity:

- id: `mrt-lessons`
- name: `Bài học Thầy Thành MRT`

Set identity:

- id: `mrt-g6-gan-aura-action-01`
- stable student route: `/s/mrt-g6-gan-aura-action-01`

Folder membership is discovery metadata only. Moving the Set between folders later must not change the student route.

## Catalog Metadata

Recommended descriptor:

```js
{
  id: 'mrt-g6-gan-aura-action-01',
  folderId: 'mrt-lessons',
  order: 1,
  version: 1,
  course: 'Global Success 6',
  unit: 'Units 1–3 · My New School · My House · My Friends',
  title: 'Bài tập Phân loại gán - aura - hành động',
  subtitle: 'MCQ · True/False · Mister Thành',
  passThreshold: 80,
  teacher: 'Thầy Thành MRT',
  itemCount: 20,
  activityTypes: ['mcq', 'true_false']
}
```

Catalog owns Set metadata. The content module owns question items only.

## Teaching Feedback Requirement

This Set is not only a score quiz. After a question is resolved, the learner must receive explicit teaching feedback in this structure:

- `Con chọn:` the learner's submitted answer
- `Đáp án đúng là:` the correct answer/category
- `Vì:` a short explanation tied to the Vietnamese sentence
- `Lý thuyết:` the Mister Thành rule
- `Ví dụ:` the corresponding English sentence

Example:

```text
Con chọn:
Aura TO BE

Đáp án đúng là:
Gán TO BE

Vì:
“một học sinh” trả lời câu hỏi Nam LÀ AI / LÀ GÌ. Đây là một danh từ.

Lý thuyết:
LÀ AI / LÀ CÁI GÌ? → GÁN TO BE → S + am/is/are + noun.

Ví dụ:
Nam is a student.
```

## Recommended Senior Architecture for Teaching Feedback

Do not create a Mister-Thành-only renderer.

Add an optional generic item field:

```js
teachingFeedback: {
  correctLabel: 'Gán TO BE',
  reason: '...',
  theory: '...',
  example: '...'
}
```

Rules:

1. `teachingFeedback` is optional.
2. Existing Sets without it preserve current behavior.
3. Content Validator validates the object only when present.
4. MCQ and True/False remain normal shared question types.
5. Attempt Log remains the evidence SSOT.
6. Question evaluators remain the correctness SSOT.
7. Teaching feedback is presentation/content only; it must not own scoring or lifecycle.

## Pedagogical Feedback Timing

Do not reveal the correct answer on the first wrong attempt just to satisfy the teaching card.

### First wrong attempt

Preserve current retrieval behavior:

- show `Con chọn`
- show that the answer is not correct
- do not reveal the correct answer yet
- preserve current Mastery loss and retry/correction semantics

### Second wrong / answer reveal

When the shared engine reveals the answer, also show the complete teaching feedback card.

### Correct first retrieval or successful correction

Show the complete teaching feedback card.

### Reading time

For items with `teachingFeedback`, do not auto-advance after the current short success timeout. Render an explicit `Tiếp tục` button so the learner has time to read the explanation.

For existing Sets without `teachingFeedback`, preserve the current auto-advance behavior.

## Data Set — 20 Questions

All sentences use vocabulary and contexts from Global Success 6 Units 1–3. Sentences are intentionally structurally clean; avoid ambiguous `có / there is / there are` constructions in this classification stage.

### Q1 — MCQ — Unit 1 — Gán TO BE

Sentence: `Nam là một học sinh.`

Choices:
- Aura TO BE
- Gán TO BE
- Hành động VERB

Correct: `Gán TO BE`

Reason: `“một học sinh” trả lời câu hỏi Nam LÀ AI / LÀ GÌ. Đây là một danh từ.`

Theory: `LÀ AI / LÀ CÁI GÌ? → GÁN TO BE → S + am/is/are + noun.`

Example: `Nam is a student.`

### Q2 — True/False — Unit 1 — Aura TO BE

Sentence: `Trường mới của tôi lớn.`

Statement: `Đây là câu Aura TO BE.`

Answer: TRUE

Reason: `“lớn” trả lời câu hỏi trường NHƯ THẾ NÀO. Đây là tính từ mô tả đặc điểm.`

Theory: `NHƯ THẾ NÀO? → AURA TO BE → S + am/is/are + adjective.`

Example: `My new school is big.`

### Q3 — MCQ — Unit 1 — Hành động VERB

Sentence: `Lan học tiếng Anh ở trường.`

Correct: `Hành động VERB`

Reason: `“học tiếng Anh” trả lời câu hỏi Lan LÀM GÌ. “học” là hành động.`

Theory: `LÀM GÌ? → HÀNH ĐỘNG VERB → S + verb.`

Example: `Lan studies English at school.`

### Q4 — True/False — Unit 1 — Gán TO BE

Sentence: `Mai là bạn cùng lớp của tôi.`

Statement: `Đây là câu Hành động VERB.`

Answer: FALSE

Correct category: `Gán TO BE`

Reason: `“bạn cùng lớp của tôi” trả lời câu hỏi Mai LÀ AI. “classmate” là danh từ chỉ người.`

Theory: `LÀ AI / LÀ CÁI GÌ? → GÁN TO BE.`

Example: `Mai is my classmate.`

### Q5 — MCQ — Unit 1 — Aura TO BE

Sentence: `Phòng học của chúng tôi sáng.`

Correct: `Aura TO BE`

Reason: `“sáng” trả lời câu hỏi phòng học NHƯ THẾ NÀO. Đây là tính từ mô tả đặc điểm.`

Theory: `NHƯ THẾ NÀO? → AURA TO BE → TO BE + adjective.`

Example: `Our classroom is bright.`

### Q6 — True/False — Unit 1 — Hành động VERB

Sentence: `Nam làm bài tập về nhà sau giờ học.`

Statement: `Đây là câu Hành động VERB.`

Answer: TRUE

Reason: `“làm bài tập về nhà” trả lời câu hỏi Nam LÀM GÌ.`

Theory: `LÀM GÌ? → HÀNH ĐỘNG VERB.`

Example: `Nam does his homework after school.`

### Q7 — MCQ — Unit 1 — Hành động VERB

Sentence: `Học sinh đọc sách trong thư viện.`

Correct: `Hành động VERB`

Reason: `“đọc sách” trả lời câu hỏi học sinh LÀM GÌ. “đọc” là động từ hành động.`

Theory: `LÀM GÌ? → HÀNH ĐỘNG VERB → S + verb.`

Example: `Students read books in the library.`

### Q8 — True/False — Unit 2 — Gán TO BE

Sentence: `Nhà của Lan là một ngôi nhà phố.`

Statement: `Đây là câu Aura TO BE.`

Answer: FALSE

Correct category: `Gán TO BE`

Reason: `“một ngôi nhà phố” cho biết nhà của Lan LÀ LOẠI NHÀ GÌ. Đây là một nhóm danh từ.`

Theory: `LÀ CÁI GÌ / LOẠI GÌ? → GÁN TO BE.`

Example: `Lan's house is a town house.`

### Q9 — MCQ — Unit 2 — Aura TO BE

Sentence: `Căn phòng này lạ.`

Correct: `Aura TO BE`

Reason: `“lạ” trả lời câu hỏi căn phòng NHƯ THẾ NÀO. Đây là tính từ.`

Theory: `NHƯ THẾ NÀO? → AURA TO BE.`

Example: `This room is strange.`

### Q10 — True/False — Unit 2 — Hành động VERB

Sentence: `Gia đình tôi trang trí phòng khách.`

Statement: `Đây là câu Aura TO BE.`

Answer: FALSE

Correct category: `Hành động VERB`

Reason: `“trang trí phòng khách” trả lời câu hỏi gia đình tôi LÀM GÌ.`

Theory: `LÀM GÌ? → HÀNH ĐỘNG VERB.`

Example: `My family decorates the living room.`

### Q11 — MCQ — Unit 2 — Gán TO BE

Sentence: `Đây là phòng ngủ của tôi.`

Correct: `Gán TO BE`

Reason: `“phòng ngủ của tôi” trả lời câu hỏi đây LÀ CÁI GÌ. “bedroom” là danh từ.`

Theory: `LÀ CÁI GÌ? → GÁN TO BE.`

Example: `This is my bedroom.`

### Q12 — True/False — Unit 2 — Aura TO BE

Sentence: `Phòng của tôi sáng.`

Statement: `Đây là câu Aura TO BE.`

Answer: TRUE

Reason: `“sáng” trả lời câu hỏi phòng của tôi NHƯ THẾ NÀO. Đây là tính từ.`

Theory: `NHƯ THẾ NÀO? → AURA TO BE → TO BE + adjective.`

Example: `My room is bright.`

### Q13 — MCQ — Unit 2 — Hành động VERB

Sentence: `Chúng tôi chuyển đến một căn hộ mới.`

Correct: `Hành động VERB`

Reason: `“chuyển đến” trả lời câu hỏi chúng tôi LÀM GÌ. Đây là hành động.`

Theory: `LÀM GÌ? → HÀNH ĐỘNG VERB.`

Example: `We move to a new flat.`

### Q14 — True/False — Unit 2 — Gán TO BE

Sentence: `Đó là căn hộ của tôi.`

Statement: `Đây là câu Gán TO BE.`

Answer: TRUE

Reason: `“căn hộ của tôi” trả lời câu hỏi đó LÀ CÁI GÌ.`

Theory: `LÀ CÁI GÌ? → GÁN TO BE.`

Example: `That is my flat.`

### Q15 — MCQ — Unit 3 — Aura TO BE

Sentence: `Lan thân thiện.`

Correct: `Aura TO BE`

Reason: `“thân thiện” trả lời câu hỏi Lan NHƯ THẾ NÀO. Đây là tính từ mô tả tính cách.`

Theory: `NHƯ THẾ NÀO? → AURA TO BE → TO BE + adjective.`

Example: `Lan is friendly.`

### Q16 — True/False — Unit 3 — Gán TO BE

Sentence: `Nam là bạn thân của tôi.`

Statement: `Đây là câu Aura TO BE.`

Answer: FALSE

Correct category: `Gán TO BE`

Reason: `“bạn thân của tôi” trả lời câu hỏi Nam LÀ AI. “friend” là danh từ, khác với “friendly” là tính từ.`

Theory: `LÀ AI? → GÁN TO BE. friend = noun; friendly = adjective.`

Example: `Nam is my best friend.`

### Q17 — MCQ — Unit 3 — Aura TO BE

Sentence: `Phong năng động.`

Correct: `Aura TO BE`

Reason: `“năng động” trả lời câu hỏi Phong NHƯ THẾ NÀO. “active” là tính từ.`

Theory: `NHƯ THẾ NÀO? → AURA TO BE.`

Example: `Phong is active.`

### Q18 — True/False — Unit 3 — Hành động VERB

Sentence: `Nam chơi thể thao với bạn bè.`

Statement: `Đây là câu Hành động VERB.`

Answer: TRUE

Reason: `“chơi thể thao” trả lời câu hỏi Nam LÀM GÌ.`

Theory: `LÀM GÌ? → HÀNH ĐỘNG VERB. Không chen TO BE trước động từ chính.`

Example: `Nam plays sports with his friends.`

### Q19 — MCQ — Unit 3 — Gán TO BE

Sentence: `Mi là bạn thân của Lan.`

Correct: `Gán TO BE`

Reason: `“bạn thân của Lan” trả lời câu hỏi Mi LÀ AI. Đây là nhóm danh từ.`

Theory: `LÀ AI? → GÁN TO BE → S + TO BE + noun.`

Example: `Mi is Lan's best friend.`

### Q20 — True/False — Unit 3 — Aura TO BE

Sentence: `Nam thông minh.`

Statement: `Đây là câu Gán TO BE.`

Answer: FALSE

Correct category: `Aura TO BE`

Reason: `“thông minh” trả lời câu hỏi Nam NHƯ THẾ NÀO. “clever” là tính từ.`

Theory: `NHƯ THẾ NÀO? → AURA TO BE.`

Example: `Nam is clever.`

## Content Distribution Acceptance

Automated tests must prove:

- exactly 20 items;
- exactly 10 MCQ;
- exactly 10 True/False;
- exactly 7 Gán items;
- exactly 7 Aura items;
- exactly 6 Hành động items;
- T/F has exactly 5 true and 5 false answers;
- all 20 items have complete `teachingFeedback`;
- passThreshold is exactly 80;
- activityTypes are only `mcq` and `true_false`;
- content resolves through the shared repository and catalog.

## Feedback UI Acceptance

For an item with `teachingFeedback`:

### Correct retrieval / correction

Show:

```text
Con chọn:
<learner response>

Đáp án đúng là:
<correct response/category>

Vì:
<reason>

Lý thuyết:
<theory>

Ví dụ:
<example>

[TIẾP TỤC]
```

The learner must explicitly press `Tiếp tục`.

### First wrong

Show the learner's selected response and existing error/retrieval message, but do not expose the correct answer or full explanation yet.

### Answer reveal after the shared reveal rule

Show the correct response plus the complete teaching feedback while preserving the existing requirement that the learner still completes correction.

## Mastery Acceptance

With 20 items:

- each scorable gain/loss unit is 5%;
- exact 80% qualifies immediately;
- qualification does not wait for item 20;
- `Nộp bài` is available at qualification;
- `Làm tiếp` resumes remaining main/retry scheduler state;
- once qualified, submit rights remain during extended practice even if later Mastery drops;
- report shows `Chuỗi chính x/20`.

## Responsive Acceptance

Classroom target:

- 1280 × 529 CSS px
- Chrome, 100% zoom, Windows Scale 150%, bookmarks bar on

Mobile target:

- iPhone-class width around 390–414 CSS px

Teaching feedback must:

- not overflow horizontally;
- keep `Tiếp tục` reachable;
- allow long Vietnamese explanations to wrap;
- keep question/feedback readable without clipped Vietnamese diacritics.

## Blocker Policy

When a blocker appears:

1. Identify whether it belongs to content, catalog, question-type interaction, Session Machine, Retry Scheduler, feedback presentation, persistence, report, responsive CSS, or CI/deployment.
2. Do not bypass the owning layer with a Set-specific hack.
3. Prefer the smallest generic extension that preserves current Sets.
4. Add a regression test for the blocker before considering it resolved.
5. Re-run the full canonical CI contract.
6. Only proceed to merge after architecture, pedagogy, and regression checks pass.

## Delivery Contract

```text
feature branch
→ E2E spec committed
→ implementation
→ npm run ci
→ Pull Request
→ GitHub Quality Gates
→ review / static analysis
→ Vercel Preview
→ smoke catalog + direct Set route
→ squash merge main
→ Vercel Production from Git
→ post-deploy public route/source/runtime audit
```

No manual production deployment is accepted as a substitute for Git provenance.

## DONE Criteria

The goal is DONE only when:

- the new folder is visible from Library Home;
- the Set is visible inside that folder;
- the stable student deep link opens the Set;
- all 20 questions validate;
- MCQ and True/False use shared deterministic answer-position behavior;
- teaching feedback follows the required learner-facing structure;
- first wrong does not prematurely reveal the correct answer;
- teaching items wait for learner `Tiếp tục` instead of auto-advancing;
- Mastery reaches qualification at >=80% immediately;
- `Nộp bài / Làm tiếp` works through the shared Session Machine;
- report works and shows main-sequence completion;
- existing published Sets pass regression unchanged;
- CI, Preview, merge, Production and runtime audit all pass.
