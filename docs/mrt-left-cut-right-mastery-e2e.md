# MRT LEFT | CUT | RIGHT — E2E Contract

## Product placement
- Folder SSOT: `mrt-lessons` — **Bài học Thầy Thành MRT**.
- Set id: `mrt-left-cut-right-01`.
- Student route: `/s/mrt-left-cut-right-01`.
- Title: **Trái | Cắt | Phải — Chặt câu để hiểu nghĩa**.
- Pass threshold: **80%**.

## Source lock
This Set is derived from the teacher worksheet **READING TOOL: LEFT | CUT | RIGHT** and its library sentence bank.

Locked teaching model:
1. `LEFT = SUBJECT` — ask **WHO / WHAT?**
2. `CUT |` — find the first verb or auxiliary that starts the Predicate.
3. `RIGHT = PREDICATE` — the complete part that says something about the Subject.
4. Read/translate by blocks `LEFT → RIGHT`.

The Set must not silently replace the worksheet vocabulary with unrelated material.

## 20-item blueprint
- 8 MCQ
- 6 True / False
- 6 Typing
- 20 total

Skill distribution:
- LEFT: 9
- CUT: 6
- RIGHT: 5

All 6 Typing items target **LEFT / SUBJECT** only.

True / False distribution:
- 3 TRUE
- 3 FALSE

## Learning progression
The Set mixes question types in a spiral rather than placing all Typing at the end:

`recognize → judge → produce → recognize harder → produce again`

Typing is productive retrieval. The learner sees the full sentence and must type only the complete LEFT / SUBJECT boundary.

## Typing UI contract
Legacy Typing remains Việt → Anh by default.

This Set uses optional generic `typingUi` metadata so the same shared Typing renderer can show:
- prompt label: `Gõ phần TRÁI / SUBJECT`
- context label: `Câu`
- instruction: `Gõ phần TRÁI / SUBJECT.`
- input label: `Phần TRÁI / SUBJECT`
- placeholder: `Gõ phần TRÁI...`

No Set-specific renderer or evaluator is allowed.

## Teaching feedback contract
Resolved teaching feedback must remain self-contained:
1. Thông tin câu hỏi
2. Con chọn / Con gõ
3. Đáp án đúng
4. Vì
5. Lý thuyết
6. Cách chặt đúng
7. Ví dụ
8. Tiếp tục

`Cách chặt đúng` is represented as optional generic worked-example metadata, not hardcoded to this Set in the engine.

First wrong must preserve retrieval:
- show question context and learner response;
- do not reveal the correct answer;
- invite retry.

Second wrong/reveal:
- show the correct answer;
- show full explanation and correct cut;
- require correction;
- correction is Mastery-neutral.

## Mastery contract
20 items means one scorable exposure unit is 5 percentage points.

- 15 clean gains = 75%
- 16 clean gains = 80%
- reaching actual Mastery >= `set.passThreshold` opens the qualification checkpoint immediately.

Session Machine remains the sole qualification owner. Retry Scheduler must not decide submit eligibility.

## Data and architecture invariants
- Folder metadata remains in `lessonCatalog.js` only.
- Dataset owns questions only.
- Shared Question Registry handles MCQ, T/F and Typing.
- Shared Session V7, Attempt Log, Mastery, Retry Scheduler and Report remain unchanged.
- No `leftEngine`, `cutEngine`, `rightEngine` or custom Mastery flow.
- Dataset content graph is deeply immutable before and after repository caching.

## Validation acceptance
Content tests must lock:
- 20 total items;
- 8 MCQ / 6 T/F / 6 Typing;
- LEFT 9 / CUT 6 / RIGHT 5;
- all Typing target LEFT;
- T/F = 3 true / 3 false;
- semantic MCQ answer ids, not A/B/C identity;
- complete learner-facing teaching feedback;
- custom Typing context without changing legacy Typing fallback;
- exact 80% qualification after 16 clean gains;
- first wrong does not leak the LEFT answer;
- reveal/correction retains question context;
- catalog publishes the Set under `mrt-lessons`.

## Release contract
Feature branch commits run GitHub CI/review only. Vercel branch deploys are disabled.

Release flow:
`feature branch → CI/content/test/Sonar → squash merge main → one Vercel Production deployment → production smoke`.

Post-deploy smoke:
- `/`
- `/s/mrt-left-cut-right-01`
- `/s/mrt-g6-gan-aura-action-01`
- `/s/g7-u1-mixed-demo`
- `/s/g7-u1-s1`
- question-context / typing UI / teaching-feedback assets
- security headers
- runtime errors
