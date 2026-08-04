# Chiến Binh Dịch

Webapp luyện Việt → Anh cho học sinh THCS theo mạch **Từ → Cụm từ → Câu**. V1.2 tập trung Global Success 7 · Unit 1 · Hobbies và khóa cơ chế Mastery/retry để học sinh phải nhớ lại thật thay vì chỉ sửa đáp án tại chỗ.

## Learning loop V1.2

- Mỗi Set có stable ID và link riêng, ví dụ `/s/g7-u1-s1`.
- Học sinh mở link → nhập tên → vào thẳng đúng Set.
- Chuỗi nội dung gốc luôn giữ **WORD → PHRASE → SENTENCE**.
- Retrieval đúng: `+1` Mastery unit.
- Gõ sai: `-1` Mastery unit.
- Một Mastery unit = `100 / số item của Set`.
- Sau khi một prompt đã có lỗi, lần gõ đúng tại chỗ chỉ là **correction = 0 Mastery**.
- Sai lần đầu: chưa hiện đáp án; sai lần hai: hiện đáp án chuẩn, nhưng học sinh vẫn phải tự gõ lại đúng mới đi tiếp.
- Item sai được Retry Scheduler chèn lại sau 2 prompt khác; retry có thể đi xuyên ranh giới Word → Phrase → Sentence.
- Học hết chuỗi chính nhưng Mastery chưa đạt ngưỡng thì hệ thống tự tiếp tục vòng củng cố weak items.
- Chỉ khi Mastery đạt `passThreshold` và không còn retry bắt buộc, session mới chuyển `PASSED` và xuất hiện nút **Nộp bài**.
- Học sinh có thể chọn **Bỏ cuộc** từ menu Thoát; session `ABANDONED` vẫn sinh báo cáo tổng thời gian và toàn bộ attempt evidence.

## Attempt evidence SSOT

Mỗi lần submit là một immutable Attempt Event trong `session.attempts`, gồm prompt exposure, thời gian bắt đầu/gửi, thời lượng phản hồi, answer, input method, paste flag, reveal state và `masteryDeltaUnits`.

Mastery, retry/report metrics, corrected count, reveal count, paste/rapid indicators và Activity Timeline đều derive từ Attempt SSOT. Scheduler state chỉ là operational state để resume đúng prompt; không phải một bản lịch sử học tập thứ hai.

Paste/rapid chỉ là **dấu hiệu cần xem lại**, không tự động kết luận gian lận.

## Minimum-interaction UX

- Laptop: ưu tiên **Gõ → Enter → tự sang câu**.
- iPad/iPhone: prompt, input, feedback và CTA chính ở cùng vùng nhìn; tự focus input và hạn chế scroll.
- Không có nút Next cho từng câu; Retry Scheduler tự vận hành phía sau.
- `Bỏ cuộc` không nằm cạnh `Kiểm tra`; chỉ xuất hiện sau `Thoát`.
- `Nộp bài` chỉ xuất hiện khi session đã `PASSED`.

Primary classroom viewport:
- 1280 × 529 CSS px
- Chrome maximize, 100% zoom
- Windows Scale 150%
- Bookmarks bar bật

Mobile target:
- iPhone 11 class viewport ~414 × 896 CSS px
- iPad/tablet có compact rules riêng, kể cả khi bàn phím làm giảm chiều cao viewport.

## Architecture guardrails

- Không God Component: orchestration, domain, scheduler, repositories và feature UI tách riêng.
- Không split SSOT: Attempt log là nguồn sự thật cho Mastery và report evidence.
- Retry timing nằm trong `retryScheduler`, không nằm trong Drill UI.
- Feature screens lazy-load bằng dynamic `import()`.
- Lesson dataset lazy-load qua `lessonRepository`.
- Local storage nằm sau repository abstraction; V1.2 dùng session schema V3.
- Design tokens tập trung trong `:root`; component không tự khai báo màu hex riêng.
- Loading state rõ ràng cho module/data transitions.
- Automated tests khóa các invariants kiến trúc quan trọng.

## Canonical CI

```bash
npm run ci
```

Đây là quality-gate SSOT và chạy:
- syntax check
- content validation
- automated unit/integration/architecture tests

GitHub Actions gọi đúng canonical command này trên Pull Request, push `main`, và `workflow_dispatch`.

## Delivery contract

Feature branch → PR → GitHub CI → Vercel Preview → viewport/learning-flow audit → merge `main` → Vercel Production từ Git commit → post-deploy verification.

Không dùng manual file upload như đường release bình thường vì sẽ tạo split delivery path giữa GitHub source và production.
