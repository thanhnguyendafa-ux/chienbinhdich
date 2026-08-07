# Global 7 Unit 1 — Bài tập dịch 1 — E2E Contract

## Product placement
- Folder id: `global7-unit1`
- Folder name: **Global 7 - Unit 1**
- Set id: `g7-u1-translation-01`
- Set title: **Bài tập dịch 1**
- Student route: `/s/g7-u1-translation-01`
- Course: `Global Success 7`
- Unit: `Unit 1 · Hobbies`
- Pass threshold: `80%`

## Learning goal
This Set is a Vietnamese → English translation-discrimination drill. Each item gives one Vietnamese sentence and four grammatically plausible English choices.

The learner must select the one translation that preserves every required meaning chunk. Distractors should not be obviously broken English. They should be plausible but wrong because one meaningful detail changes.

## Locked source content
The 15 source sentences come from the Speaking exercise discussed with the teacher:
1. Bạn có thích sưu tầm gấu bông không?
2. Có, tôi làm việc đó mỗi ngày.
3. Có, tôi rất thích.
4. Bạn thích làm gì vào thời gian rảnh?
5. Tôi thường ăn trưa lúc 12 giờ.
6. Tôi thích làm nhà búp bê.
7. Bạn có thích làm mô hình không?
8. Không, tôi không thích. Nhưng anh/em trai tôi rất thích việc đó.
9. Không, tôi làm hoa giấy mỗi ngày.
10. Anh/em trai của bạn thích làm gì?
11. Anh/em ấy rất thích tập yoga.
12. Anh/em ấy đi học lúc 7 giờ sáng.
13. Chị/em gái của bạn có nấu ăn cùng bạn không?
14. Có, chị/em ấy thích hát.
15. Có, chị/em ấy và tôi nấu ăn cùng nhau vào buổi tối.

## Correct-answer lock
The canonical English answers are:
1. `Do you enjoy collecting teddy bears?`
2. `Yes, I do it every day.`
3. `Yes, very much.`
4. `What do you like doing in your free time?`
5. `I usually have lunch at 12.`
6. `I like building dollhouses.`
7. `Do you like making models?`
8. `No, I don’t. But my brother loves it.`
9. `No, I make paper flowers every day.`
10. `What does your brother like doing?`
11. `He enjoys doing yoga a lot.`
12. `He goes to school at 7 a.m.`
13. `Does your sister cook with you?`
14. `Yes, she loves singing.`
15. `Yes, she and I cook together in the evening.`

## Distractor contract
Each MCQ has exactly four choices:
- one canonical target translation;
- three natural distractors;
- each distractor changes a meaningful chunk such as subject, activity, object, time, frequency, degree, relative, or preposition;
- avoid distractors that are simply ungrammatical;
- avoid alternative translations that preserve the same meaning and would create two defensible answers.

High-value traps include:
- `with you` vs `for you`;
- `every day` vs `every evening` / `every week`;
- `brother` vs `sister`;
- `collecting` vs `making`;
- `lunch` vs `breakfast`;
- `a.m.` vs `p.m.`;
- `cook together` vs `cook for me`.

## Teaching feedback contract
All 15 items use the shared optional `teachingFeedback` structure.

After a question is resolved, feedback must explain the chunk that distinguishes the correct translation from the plausible traps.

The existing retrieval behavior remains unchanged:
- first wrong: show context and learner choice, but do not reveal the answer;
- reveal/correction path: show correct answer plus explanation;
- correct retrieval/correction: show full teaching feedback and learner-controlled Continue.

## Architecture invariants
- Use the existing shared MCQ renderer and evaluator.
- Use the existing deterministic answer-position shuffle.
- Use the existing Session V7, Attempt Log, Mastery engine, Retry Scheduler, qualification checkpoint and report.
- Do not introduce a Global-7-specific session engine or scoring path.
- Catalog owns folder/Set metadata; the content module owns question items.
- The student route identity is based on Set id and remains stable even if folder ordering changes later.

## Mastery contract
There are 15 items.
- one clean gain = 1/15 of Mastery;
- 12 clean gains = exactly 80%;
- reaching 80% opens the existing qualification checkpoint immediately before item 13 is advanced;
- `Nộp bài` and `Làm tiếp` remain shared behavior.

## Automated acceptance
Tests must prove:
- folder `global7-unit1` exists and appears in catalog order;
- Set `g7-u1-translation-01` belongs to that folder;
- exactly 15 items;
- all 15 are MCQ;
- exactly four choices per item;
- every item uses semantic choice ids rather than A/B/C/D identity;
- canonical correct English strings match the locked list;
- every item has complete teaching feedback;
- content validator returns no errors;
- repository loader resolves the Set;
- 12 clean gains produce exact 80% and immediate qualification;
- existing published Sets continue to validate.

## Delivery contract
`feature branch → content/spec/tests → GitHub CI → PR review → squash merge main → Git-backed Vercel Production → production smoke`

Feature branches must not deploy to Vercel. Production is accepted only when the deployment source is Git `main` and the production SHA matches the merged commit.

## Production smoke
Verify:
- `/`
- folder **Global 7 - Unit 1** appears;
- Set **Bài tập dịch 1** appears in that folder;
- `/s/g7-u1-translation-01` returns 200;
- a clean answer advances correctly;
- first wrong keeps the answer hidden;
- reveal/correction still works;
- qualification appears at 80%;
- no new runtime errors are introduced.
