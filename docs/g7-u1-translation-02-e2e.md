# Global 7 Unit 1 — Bài tập dịch 2 — E2E Contract

## Product placement
- Folder id: `global7-unit1`
- Folder name: **Global 7 - Unit 1**
- Set id: `g7-u1-translation-02`
- Set title: **Bài tập dịch 2**
- Student route: `/s/g7-u1-translation-02`
- Course: `Global Success 7`
- Unit: `Unit 1 · Hobbies`
- Pass threshold: `80%`

## Learning goal
This Set is the second Vietnamese → English translation-discrimination drill. It uses 23 independent reading clauses adapted from the Unit 1 Hobbies reading passage.

Each question presents one Vietnamese target and four grammatically plausible English choices. Exactly one preserves every required meaning chunk. The other three are near-miss translations that deliberately alter one or two details.

## Locked source clauses
1. Bạn có sở thích nào không?
2. Những người chưa có sở thích nên bắt đầu một sở thích.
3. Có một sở thích rất có lợi.
4. Một sở thích cho bạn một việc thú vị để làm.
5. Bạn có thể tận hưởng một sở thích trong thời gian rảnh.
6. Một sở thích cho bạn một việc thú vị để làm trong thời gian có dịch bệnh.
7. Gia đình tôi đọc sách cùng nhau trong thời gian phong tỏa do Covid-19.
8. Gia đình tôi xem phim cùng nhau trong thời gian phong tỏa do Covid-19.
9. Việc đọc sách và xem phim cùng nhau khiến gia đình tôi cảm thấy tốt hơn.
10. Gia đình tôi phải ở nhà trong thời gian phong tỏa.
11. Một sở thích khiến bạn trở thành một người thú vị hơn.
12. Những người có nhiều kinh nghiệm và kỹ năng có thể chia sẻ kinh nghiệm và kỹ năng của mình với người khác.
13. Tôi rất thích đi du lịch.
14. Tôi thường chia sẻ những trải nghiệm du lịch của mình với các bạn cùng lớp.
15. Việc chia sẻ những trải nghiệm du lịch giúp tôi có thêm nhiều bạn bè.
16. Bây giờ chúng tôi có một nhóm du lịch trong lớp.
17. Một sở thích có thể giúp bạn phát triển những kỹ năng mới.
18. Việc dành nhiều thời gian cho sở thích có thể giúp các kỹ năng của bạn tiến bộ.
19. Chị/em gái của tôi rất thích may vá.
20. Chị/em gái của tôi đã may vá được hai năm.
21. Bây giờ chị/em gái của tôi có thể may những bộ quần áo búp bê đẹp.
22. Những hoạt động thú vị, nhiều bạn bè hơn và những kỹ năng mới là những lợi ích của việc có sở thích.
23. Bạn nên có sở thích vì sở thích mang lại nhiều lợi ích.

## Canonical English answers
1. `Do you have any hobbies?`
2. `People without a hobby should start a hobby.`
3. `Having a hobby is very beneficial.`
4. `A hobby gives you something fun to do.`
5. `You can enjoy a hobby during your leisure time.`
6. `A hobby gives you something fun to do during pandemics.`
7. `My family reads books together during the Covid-19 lockdown.`
8. `My family watches films together during the Covid-19 lockdown.`
9. `Reading books and watching films together makes my family feel better.`
10. `My family has to stay at home during the lockdown.`
11. `A hobby makes you a more interesting person.`
12. `People with a lot of experience and skills can share their experience and skills with others.`
13. `I love travelling.`
14. `I usually share my travel experiences with my classmates.`
15. `Sharing my travel experiences helps me have more friends.`
16. `Now we have a travel group in our class.`
17. `A hobby can help you develop new skills.`
18. `Spending a lot of time on your hobby can improve your skills.`
19. `My sister loves sewing.`
20. `My sister has been sewing for two years.`
21. `My sister can now sew beautiful doll clothes.`
22. `Fun activities, more friends, and new skills are benefits of having hobbies.`
23. `You should have hobbies because hobbies are beneficial.`

## Distractor rules
- Exactly four choices per item.
- One canonical target and three plausible near-misses.
- Distractors should remain natural English.
- Prefer one-chunk substitutions: subject, object, activity, quantity, time, frequency, preposition, place, skill, or benefit.
- Avoid two defensible correct answers.
- High-value traps include `during` vs `after`, `a lot of` vs `a little`, `family` vs `classmates`, `experience` vs `plans`, `skills` vs `health`, `sew` vs `buy`, and `with` vs `for`.

## Teaching feedback contract
Every item must provide learner-facing feedback using the shared `teachingFeedback` structure:
- `correctLabel`: exact canonical English answer;
- `reason`: chunk-by-chunk meaning plus the trap that changed the sentence;
- `theory`: shared instruction to translate by chunks rather than word shape;
- `example`: one or more useful phrase pairs to remember.

Existing session behavior remains unchanged:
- first wrong answer does not reveal the target;
- reveal/correction shows the canonical answer and full teaching feedback;
- correct retrieval shows feedback and learner-controlled continuation.

## Architecture invariants
- Reuse the shared MCQ renderer/evaluator and deterministic choice shuffle.
- Reuse Session V7, Attempt Log, Mastery, Retry Scheduler, qualification, and report.
- No Translation-2-specific scoring or renderer.
- Catalog owns metadata; content module owns the 23 items.
- Route identity is based on Set id.

## Mastery contract
There are 23 items. Each clean first-attempt success adds one mastery unit.
- 18 clean gains = `78.26%`, below threshold.
- 19 clean gains = `82.61%`, first qualifying point at or above 80%.
- qualification must occur immediately after the 19th clean gain.

## Automated acceptance
Tests must prove:
- Set appears in `global7-unit1` after `g7-u1-translation-01`;
- exactly 23 all-MCQ items;
- exactly four unique choices per item;
- semantic choice ids rather than A/B/C/D identity;
- canonical targets match this contract;
- all 23 items contain complete teaching feedback;
- high-value near-miss traps remain present;
- content is deeply immutable;
- repository load and content validation succeed;
- 18 clean gains remain active at 78.26%;
- 19 clean gains qualify at 82.61%;
- all existing Sets continue to validate.

## Delivery contract
`feature branch → spec/content/tests → GitHub CI → review → squash merge main → Git-backed Vercel Production → production smoke`

## Production smoke
Verify:
- `/` returns 200;
- folder **Global 7 - Unit 1** contains **Bài tập dịch 1** and **Bài tập dịch 2**;
- `/s/g7-u1-translation-02` returns 200;
- production catalog and dataset contain the new Set;
- no new runtime errors are introduced.
