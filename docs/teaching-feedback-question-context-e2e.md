# Teaching Feedback Question Context E2E

## Goal
Every teaching-feedback block must be understandable without relying on the learner remembering the question above it. The feedback must repeat the relevant question context before showing the learner response, correct answer, reason, theory, and example.

## SSOT contract
- Question wording remains owned by the question item (`prompt`, `statement`, or `vi`).
- `teachingFeedback` remains knowledge-only: `correctLabel`, `reason`, `theory`, `example`.
- Question context is derived at render time through `getQuestionContext(item)`.
- Do not copy question wording into `teachingFeedback`.

## Display contract
Resolved teaching feedback order:
1. Thông tin câu hỏi
2. Con chọn
3. Đáp án đúng là
4. Loại đúng, only when needed
5. Vì
6. Lý thuyết
7. Ví dụ
8. Tiếp tục, for learner-paced teaching items

MCQ context:
- Câu
- Yêu cầu

True/False context:
- Câu
- Nhận định cần kiểm tra

Typing fallback:
- Tiếng Việt
- Yêu cầu: Dịch sang tiếng Anh.

Sentence-order fallback:
- Câu cần tạo
- Yêu cầu: Sắp xếp các từ thành câu đúng.

## Retrieval contract
First wrong:
- show question context;
- show learner response;
- do not reveal the correct answer;
- keep correction/retry behavior unchanged.

Second wrong / reveal:
- show question context;
- show full teaching explanation;
- correction remains required and Mastery-neutral within the same exposure.

Correct retrieval or correction:
- show question context and full teaching explanation;
- learner explicitly presses `Tiếp tục`.

Legacy items without `teachingFeedback` keep the existing auto-advance behavior.

## Architecture invariants
- Session V7 unchanged.
- Attempt Log remains Mastery evidence SSOT.
- Session Machine remains qualification owner.
- Retry Scheduler remains prompt progression owner only.
- No Set-specific renderer.
- No duplicated question text in teaching metadata.

## Regression acceptance
- MCQ context is derived from the original item prompt.
- True/False preserves both the source sentence and the claim being judged.
- A fake/contradictory `teachingFeedback.question` cannot override context.
- First wrong includes context while the correct answer stays hidden.
- Reveal and resolved feedback include context.
- App passes the answered item into success feedback before the next prompt is rendered.
- Existing 80% qualification tests remain green.
- Existing Sets remain regression targets.
- Teaching feedback remains readable on short classroom screens and mobile layouts.

## Delivery
Feature branch -> GitHub CI/review -> squash merge `main` -> Vercel Production from `main` only -> production smoke test.
