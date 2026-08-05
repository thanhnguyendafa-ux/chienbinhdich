# Chiến Binh Dịch

Webapp luyện Việt → Anh cho học sinh THCS theo mạch **Từ → Cụm từ → Câu**. V1.2.1 tập trung Global Success 7 · Unit 1 · Hobbies và khóa cơ chế Mastery/retry theo từng lần câu xuất hiện (exposure).

## Learning loop V1.2.1

- Mỗi Set có stable ID và link riêng, ví dụ `/s/g7-u1-s1`.
- Học sinh mở link → nhập tên → vào thẳng đúng Set.
- Chuỗi nội dung gốc luôn giữ **WORD → PHRASE → SENTENCE**.
- Mỗi prompt exposure chỉ attempt đầu tiên được quyền thay đổi Mastery.
- Attempt đầu đúng: `+1` Mastery unit.
- Attempt đầu sai: `-1` Mastery unit.
- Attempt #2 trở đi trong cùng exposure, dù còn sai hay đã sửa đúng: `0` Mastery.
- Một Mastery unit = `100 / số item của Set`.
- Sai lần đầu: chưa hiện đáp án; sai lần hai: hiện đáp án chuẩn, nhưng học sinh vẫn phải tự gõ lại đúng mới đi tiếp.
- Correction chỉ giúp học sinh sửa và đi tiếp; không hoàn tác điểm sai và không cộng điểm.
- Item sai được Retry Scheduler chèn lại sau 2 prompt khác; retry có thể đi xuyên ranh giới Word → Phrase → Sentence.
- Khi item quay lại, đó là exposure mới: attempt đầu lại được chấm `+1/-1`.
- Học hết chuỗi chính nhưng Mastery chưa đạt ngưỡng thì hệ thống tự tiếp tục vòng củng cố weak items.
- Pass threshold là `Mastery >= passThreshold`; Set hiện tại dùng `passThreshold: 80`, nên đúng 80% là PASS.
- Chỉ khi session `PASSED` mới xuất hiện nút **Nộp bài**.
- Học sinh có thể chọn **Bỏ cuộc** từ menu Thoát; session `ABANDONED` vẫn sinh báo cáo tổng thời gian và toàn bộ attempt evidence.

## Mastery progress UX

- Thanh progress chính biểu diễn **Mastery**, không biểu diễn số item đã đi qua.
- Thanh có marker lấy trực tiếp từ `set.passThreshold`, hiện là **Mục tiêu 80%**.
- `Chuỗi chính x/y` vẫn hiển thị riêng như thông tin tiến độ nội dung.
- Raw Mastery evidence có thể âm khi failed retrieval nhiều hơn successful retrieval; UI progress được clamp 0–100 để không có thanh âm.
- Pass logic vẫn dùng raw/exact Mastery, không dùng giá trị đã clamp để hiển thị.

## Attempt evidence SSOT

Mỗi lần submit là một immutable Attempt Event trong `session.attempts`, gồm prompt exposure, thời gian bắt đầu/gửi, thời lượng phản hồi, answer, input method, paste flag, reveal state và `masteryDeltaUnits`.

Mastery, retry/report metrics, corrected count, reveal count, paste/rapid indicators và Activity Timeline đều derive từ Attempt SSOT. Scheduler state chỉ là operational state để resume đúng prompt; không phải một bản lịch sử học tập thứ hai.

Paste/rapid chỉ là **dấu hiệu cần xem lại**, không tự động kết luận gian lận.

## Persistence

V1.2.1 dùng session schema V4 và key `cbd.activeSession.v4` / `cbd.report.v4.*` để không resume session đã được chấm theo policy cũ.

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
- Local storage nằm sau repository abstraction.
- Design tokens tập trung trong `:root`; component không tự khai báo màu hex riêng.
- Loading state rõ ràng cho module/data transitions.
- Automated tests khóa các invariants kiến trúc quan trọng, gồm exposure scoring và exact-80 pass boundary.

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
